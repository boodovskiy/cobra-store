import {handleAuth} from "@kinde-oss/kinde-auth-nextjs/server";

const authOptions = {
    cookieSameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    cookieSecure: process.env.NODE_ENV === "production",
};

export const GET = handleAuth(authOptions);