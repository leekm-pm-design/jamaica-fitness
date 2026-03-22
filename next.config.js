/** @type {import('next').NextConfig} */
const nextConfig = {
  // API 라우트 빌드 시점 최적화 비활성화
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
}

module.exports = nextConfig