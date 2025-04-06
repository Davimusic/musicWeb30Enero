/** @type {import('next').NextConfig} */
require('dotenv').config(); // Cargar variables de entorno desde .env

module.exports = {
    webpack: (config) => {
        config.resolve.fallback = {
          fs: false,
          path: false,
          crypto: false,
          stream: false
        };
        return config;
      },
  reactStrictMode: true,
  experimental: {
      appDir: true,
      esmExternals: 'loose'
  },
  images: {
      domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
  },
  async rewrites() {
      return [
          {
              source: '/api/cloudinary/:path*',
              destination: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/:path*`, // URL base dinámica con variable de entorno
          },
      ];
  },
};


