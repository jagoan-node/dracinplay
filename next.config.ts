import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.sonzaix.indevs.in',
      },
      {
        protocol: 'https',
        hostname: '*.sonzaix.indevs.in',
      },
      {
        protocol: 'https',
        hostname: 'img1.sonzaix.indevs.in',
      },
      {
        protocol: 'https',
        hostname: 'img2.sonzaix.indevs.in',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'images.weserv.nl',
      },
    ],
  },
};

export default nextConfig;
