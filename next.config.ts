import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Silence Next.js workspace root warning when multiple lockfiles exist
  outputFileTracingRoot: undefined,
  
  images:{
    remotePatterns:[
      {
        protocol:"https",
        hostname:"images.pexels.com",
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
      },
      {
        protocol: 'https',
        hostname: 'api.tyhh.online',
        port: '',
        pathname: '/uploads/**',
      },
    ]
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    return config;
  },
};

export default nextConfig;
