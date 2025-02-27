/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  experimental: {
      appDir: true,
  },
  images: {
      domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
  },
  async rewrites() {
      return [
          {
              source: '/api/cloudinary/:path*',
              destination: 'https://api.cloudinary.com/v1_1/dplncudbq/:path*', // URL base de Cloudinary
          },
      ];
  },
};

