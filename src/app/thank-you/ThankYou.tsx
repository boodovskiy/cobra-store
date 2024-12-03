"use client"

import { useQuery } from "@tanstack/react-query"
import { getPaymentStatus } from "./actions"
import { useSearchParams } from "next/navigation"

const ThankYou = () => {
    const searchParams = useSearchParams()
    const orderId = searchParams.get("orderId") || ''

    const { data } = useQuery({
        queryKey: ["get-payment-status"],
        queryFn: async () => await getPaymentStatus({ orderId }),
        retry: true,
        retryDelay: 500,
    })

  return (
    <div>ThankYou</div>
  )
}

export default ThankYou