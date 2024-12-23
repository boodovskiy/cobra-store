import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from 'resend'
import OrderReceivedEmail from "@/components/emails/OrderReceivedEmail";

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
    try {
        const body = await req.text()
        const signature = headers().get("stripe-signature")
        
        if(!signature) return new Response("Invalid signature", { status: 400 })
        
        const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)

        if(event.type === 'checkout.session.completed') {
            if(!event.data.object.customer_details?.email){
                throw new Error('Missing user email')
            }

            const session = event.data.object as Stripe.Checkout.Session

            const { userId, orderId } = session.metadata || {
                userId: null,
                orderId: null,
            }

            if(!userId || !orderId) {
                throw new Error('Invalid request metadata')
            }

            const billingAddress = session.customer_details!.address
            const shippingAddress = session.shipping_details!.address

            const updatedOrder = await db.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    isPaid: true,
                    shippingAddress: {
                        create: {
                            name: session.customer_details!.name!,
                            city: shippingAddress!.city!,
                            country: shippingAddress!.country!,
                            postalCode: shippingAddress!.postal_code!,
                            street: shippingAddress!.line1!,
                            state: shippingAddress!.state
                        }
                    },
                    billingAddress: {
                        create: {
                            name: session.customer_details!.name!,
                            city: billingAddress!.city!,
                            country: billingAddress!.country!,
                            postalCode: billingAddress!.postal_code!,
                            street: billingAddress!.line1!,
                            state: billingAddress!.state
                        }
                    },
                },
            })

            await resend.emails.send({
                from: "CobraStore <budovskiy@specialcase.net>",
                to: [event.data.object.customer_details.email],
                subject: "Thanks for your order!",
                react: OrderReceivedEmail({
                    orderId,
                    orderDate: updatedOrder.createdAt.toLocaleDateString(),
                    // @ts-expect-error: TypeScript cannot infer the correct type for shippingAddress here
                    shippingAddress: {
                        name: session.customer_details!.name!,
                        city: shippingAddress!.city!,
                        country: shippingAddress!.country!,
                        postalCode: shippingAddress!.postal_code!,
                        street: shippingAddress!.line1!,
                        state: shippingAddress!.state
                    },
                })
            })
        }

        return NextResponse.json({ result: event, ok: true })

    } catch (error) {
        if (error instanceof Error) {
            // Standard error object
            console.error("Webhook Error:", error.message, error.stack);
            return NextResponse.json(
                { message: error.message, ok: false },
                { status: 500 }
            );
        } else {
            // Handle non-standard errors (e.g., strings or other unexpected types)
            console.error("Unexpected Error:", error);
            return NextResponse.json(
                { message: "An unknown error occurred.", ok: false },
                { status: 500 }
            );
        }
    }
}