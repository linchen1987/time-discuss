import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '*',
      },
      {
        protocol: 'https',
        hostname: '*',
      },
      // {
      //   protocol: 'https',
      //   hostname: '*.public.blob.vercel-storage.com',
      // },
      // {
      //   protocol: 'https',
      //   hostname: 'blob.vercel-storage.com',
      // },
    ],
  },
};

export default nextConfig;
