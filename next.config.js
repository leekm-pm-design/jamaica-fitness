/** @type {import('next').NextConfig} */
const nextConfig = {
  // API 라우트 빌드 시점 최적화 비활성화
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // 정적 생성 시 API 라우트 데이터 수집 비활성화
  outputFileTracing: false,
}

module.exports = nextConfig