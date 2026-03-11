import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // output: 'export',
    logging: {
        fetches: {
            fullUrl: true,
        },
    }
    // distDir: 'dist',
}
 
module.exports = nextConfig;

export default nextConfig;
