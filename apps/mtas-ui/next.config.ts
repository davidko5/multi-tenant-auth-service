import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // TODO(human): Add a rewrites() config that proxies /api/:path* to your backend
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
