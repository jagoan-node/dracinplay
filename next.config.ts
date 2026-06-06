import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'convert.d-cdn.me' },
      { protocol: 'https', hostname: 'assets.d-cdn.me' },
      { protocol: 'https', hostname: 'hwztchapter.dramaboxdb.com' },
      { protocol: 'https', hostname: 'image-drakor.b-cdn.net' },
      { protocol: 'https', hostname: 'img1.drakor.cc' },
      { protocol: 'https', hostname: 'sk16.drakor.cc' },
      { protocol: 'https', hostname: '*.drakor.cc' },
      { protocol: 'https', hostname: 'api.sonzaix.indevs.in' },
      { protocol: 'https', hostname: '*.sonzaix.indevs.in' },
      { protocol: 'https', hostname: '*.dramaboxdb.com' },
      { protocol: 'https', hostname: '*.b-cdn.net' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'images.weserv.nl' },
      { protocol: 'https', hostname: 'p16-novel-sg.ibyteimg.com' },
      { protocol: 'https', hostname: 'p19-novel-sg.ibyteimg.com' },
      { protocol: 'https', hostname: '*.ibyteimg.com' },
      { protocol: 'https', hostname: 'static-v1.mydramawave.com' },
      { protocol: 'https', hostname: '*.mydramawave.com' },
    ],
  },
};

export default nextConfig;
