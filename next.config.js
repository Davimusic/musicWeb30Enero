/** @type {import('next').NextConfig} */
require('dotenv').config();

module.exports = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    esmExternals: 'loose',
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      crypto: false,
      stream: false,
    };
    return config;
  },
  images: {
    domains: [
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'f005.backblazeb2.com' // Dominio de Backblaze B2
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/cloudinary/:path*',
        destination: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/:path*`,
      },
      // Nueva regla para Backblaze B2
      {
        source: '/api/blackBlaze/:path*',
        destination: `https://f005.backblazeb2.com/file/${process.env.BACKBLAZE_BUCKET_NAME}/:path*`
      }
    ];
  },
  // Opcional: Headers de seguridad para recursos de Backblaze
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|wav|mp3|aiff)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          }
        ],
      },
    ];
  }
};