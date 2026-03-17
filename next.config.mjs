/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'knpuquzmgwbcltaxilfp.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'ir-na.amazon-adsystem.com',
      },
      {
        protocol: 'https',
        hostname: 'img.ltwebstatic.com', // Shein
      },
      {
         protocol: 'https',
         hostname: 'sheinsz.ltwebstatic.com',
      }
    ],
  },
};

export default nextConfig;
