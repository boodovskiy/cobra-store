/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["utfs.io"]
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'referrer-policy', value: 'no-referrer'},
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "*", // Allow all origins
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET, POST, OPTIONS", // Specify allowed methods
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-Requested-With, Content-Type, Authorization", // Specify allowed headers
                    },
                ]
            }
        ]
    },
};

export default nextConfig;
