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
                    { key: 'referrer-policy', value: 'no-referrer'}
                ]
            }
        ]
    },
};

export default nextConfig;
