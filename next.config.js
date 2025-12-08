/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: false, // Important: We want manual control
  disable: process.env.NODE_ENV === 'development',
  buildId: 'v1.0.1', // Incrementar para forçar atualização em todos os usuários
});

module.exports = withPWA(nextConfig);
