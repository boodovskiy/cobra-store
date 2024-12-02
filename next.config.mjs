/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["utfs.io"]
    },
    experimental: {
        outputStandalone: true,
    },
};

export default nextConfig;
