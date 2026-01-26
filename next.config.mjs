/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'trae-api-cn.mchost.guru'],
  },
};

export default nextConfig;