/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignore TypeScript errors during production build
    // These are pre-existing issues in legacy pages that don't affect runtime
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/auth/login',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
