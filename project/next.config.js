/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.pexels.com', 'placehold.co', 'localhost'],
  },
  i18n: {
    locales: ['tr', 'en', 'zh'],
    defaultLocale: 'tr',
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:5000/uploads/:path*',
      },
    ];
  },
}

module.exports = nextConfig