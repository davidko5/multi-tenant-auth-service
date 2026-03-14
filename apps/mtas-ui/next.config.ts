import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // If UI and API are on different domains, uncomment rewrites proxy and use baseURL: "/api" in lib/api.ts
  // rewrites: async () => {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010'}/:path*`,
  //     },
  //   ];
  // },
};

export default nextConfig;
