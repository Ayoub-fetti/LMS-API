import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Remove any invalid experimental features
  },
};

export default nextConfig;