import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
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
      }
    ]
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    return config;
  },
};

export default nextConfig;
