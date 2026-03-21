# 🚀 Jamaica Contract System - 자동 배포 가이드

MCP(Model Context Protocol)를 사용한 Jamaica 계약 시스템의 완전 자동화된 Vercel 배포 가이드입니다.

## ⚡ 빠른 배포 (원클릭)

```bash
npm run deploy
```

## 🛠️ 배포 방법

### 방법 1: 자동 스크립트 (권장)

```bash
# 1단계: jamaica-contract 디렉토리로 이동
cd jamaica-contract

# 2단계: Vercel 로그인 (최초 1회만)
npx vercel login

# 3단계: 자동 배포 실행
npm run deploy
```

### 방법 2: 수동 배포

```bash
# Vercel CLI만 사용하는 경우
npm run deploy:vercel

# 또는 직접 실행
npx vercel --prod
```

## 🔧 자동화된 기능

우리의 자동 배포 스크립트(`deploy.sh`)는 다음을 자동으로 처리합니다:

1. **✅ 빌드 테스트** - 배포 전 Next.js 빌드 검증
2. **📦 Git 관리** - 변경사항 자동 커밋 및 푸시
3. **🔐 Vercel 인증** - 로그인 상태 자동 확인
4. **⚙️ 환경변수 설정** - 모든 필수 시크릿 자동 설정
5. **🚀 프로덕션 배포** - Vercel 프로덕션 환경 배포
6. **✨ 성공 메시지** - 배포 완료 및 접속 정보 안내

## 🔑 환경변수 (자동 설정됨)

다음 환경변수들이 자동으로 Vercel Secrets에 설정됩니다:

- `DATABASE_URL` - Supabase PostgreSQL 연결 (Pooler)
- `DIRECT_URL` - Supabase PostgreSQL 직접 연결
- `ADMIN_PASSWORD` - 관리자 페이지 비밀번호 (admin1234)
- `COOKIE_SECRET` - 세션 쿠키 암호화 키

## 🎯 MCP 구성

이 배포에는 다음 MCP 기능이 포함됩니다:

- **완전한 CRUD 작업** - 고객/계약 생성, 조회, 업데이트
- **JSON 응답 파싱** - MCP boundary 포맷 자동 처리
- **기존 고객 검색** - 전화번호 기반 중복 확인
- **에러 핸들링** - 강력한 오류 처리 및 복구

## 🌐 배포 후 테스트

배포 완료 후 다음 URL들을 테스트하세요:

```bash
# API 연결 테스트
curl https://your-app.vercel.app/api/contracts

# 응답 예시:
{
  "success": true,
  "message": "MCP API is working",
  "customerCount": 10,
  "tables": [
    {"name": "public.customers", "rls_enabled": true, "rows": 15},
    {"name": "public.contracts", "rls_enabled": true, "rows": 1}
  ],
  "connectionType": "MCP"
}
```

### 주요 테스트 페이지

- **🏠 메인 페이지**: 계약 생성 폼
- **👤 관리자 페이지**: `/admin` (비밀번호: admin1234)
- **🔌 API 엔드포인트**: `/api/contracts`

## 🔍 트러블슈팅

### 로그인 필요시
```bash
npx vercel login
```

### 빌드 오류 발생시
```bash
# 로컬에서 빌드 테스트
npm run build

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

### 환경변수 문제시
```bash
# 시크릿 확인
npx vercel secrets ls

# 시크릿 제거 후 재설정
npx vercel secrets rm database-url
npm run deploy
```

## 📁 파일 구조

```
jamaica-contract/
├── deploy.sh              # 자동 배포 스크립트
├── vercel.json            # Vercel 설정 파일
├── package.json           # npm 스크립트 포함
├── src/
│   ├── lib/
│   │   └── mcp.ts         # MCP 클라이언트
│   └── app/
│       └── api/
│           └── contracts/ # MCP 기반 API
└── AUTO_DEPLOY.md         # 이 파일
```

## 🎉 성공 시나리오

배포가 성공하면 다음과 같은 출력을 확인할 수 있습니다:

```bash
✅ 배포 성공!

🎉 Jamaica Contract System이 성공적으로 배포되었습니다!
📱 메인 페이지에서 계약 생성을 테스트해보세요.
🔑 관리자 페이지 비밀번호: admin1234

🔗 배포 URL: https://jamaica-fitness-xxx.vercel.app
```

---

## 🤝 지원

- **MCP 기반 데이터베이스 CRUD**: 완전 구현
- **자동 환경변수 설정**: Vercel Secrets 활용
- **원클릭 배포**: 모든 과정 자동화
- **에러 핸들링**: 강력한 실패 복구