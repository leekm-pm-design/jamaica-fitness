# Jamaica Fitness - Vercel 배포 가이드

이 문서는 Jamaica Fitness 계약 시스템을 Vercel에 배포하는 방법을 설명합니다.

## 🚀 배포 준비사항

### 1. Vercel 계정 생성
1. [vercel.com](https://vercel.com)에서 계정 생성
2. GitHub/GitLab 계정으로 연동 권장

### 2. 데이터베이스 준비
다음 중 하나의 PostgreSQL 데이터베이스 서비스를 선택:

#### Option A: Vercel Postgres (권장)
```bash
# Vercel 대시보드에서 Postgres 데이터베이스 생성
# 자동으로 DATABASE_URL 환경변수가 설정됩니다
```

#### Option B: Supabase
```bash
# 1. supabase.com에서 프로젝트 생성
# 2. Settings > Database에서 Connection URL 복사
# 예: postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

#### Option C: Railway/PlanetScale/Neon
- 각 서비스에서 PostgreSQL 데이터베이스 생성
- CONNECTION_URL 획득

## 📝 배포 단계

### 1단계: GitHub 리포지토리 생성
```bash
# GitHub에서 새 리포지토리 생성 후
git remote add origin https://github.com/your-username/jamaica-fitness.git
git branch -M main
git push -u origin main
```

### 2단계: Vercel에서 프로젝트 가져오기
1. Vercel 대시보드에서 "New Project" 클릭
2. GitHub 리포지토리 선택
3. 프레임워크: **Next.js** 자동 감지
4. Root Directory: **변경 없음**
5. Build Command: **변경 없음** (npm run build)
6. Output Directory: **변경 없음** (.next)
7. Install Command: **변경 없음** (npm install)

### 3단계: 환경변수 설정
Vercel 프로젝트 Settings > Environment Variables에서 다음 변수들을 추가:

```env
# PostgreSQL 데이터베이스 URL
DATABASE_URL=postgresql://username:password@host:port/database

# 관리자 비밀번호 (보안을 위해 복잡하게 설정)
ADMIN_PASSWORD=your_secure_admin_password_here

# 쿠키 암호화 시크릿 (32자 이상 랜덤 문자열)
COOKIE_SECRET=your_random_32_character_secret_key_here
```

**환경변수 생성 예시:**
```bash
# 안전한 비밀번호 생성
ADMIN_PASSWORD=JamaicaFit2026!Admin

# 32자 랜덤 시크릿 생성
COOKIE_SECRET=a8f7e6d5c4b3a2910f8e7d6c5b4a3291
```

### 4단계: 데이터베이스 마이그레이션
배포 완료 후 Vercel 대시보드 Functions 탭에서:

```bash
# Vercel CLI를 통한 마이그레이션 (선택사항)
npx vercel env pull .env.production
npx prisma migrate deploy
npx prisma generate
```

또는 Prisma Studio를 통해 수동으로 테이블 생성 가능

### 5단계: 더미 데이터 생성 (선택사항)
배포된 사이트에서:
```bash
# POST 요청으로 더미 데이터 생성
curl -X POST https://your-app.vercel.app/api/seed
```

## 🔧 로컬 개발 환경 설정

### 환경변수 설정
`.env.local` 파일 생성:
```env
DATABASE_URL="postgresql://localhost:5432/jamaica_contract"
ADMIN_PASSWORD="admin1234"
COOKIE_SECRET="local_development_secret_key"
```

### 개발 서버 실행
```bash
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

## 📱 배포 후 테스트

### 1. 메인 서명 페이지
- URL: `https://your-app.vercel.app`
- 테스트: 고객 정보 입력 → 서명 → 계약 완료

### 2. 관리자 페이지
- URL: `https://your-app.vercel.app/admin`
- 로그인: 설정한 `ADMIN_PASSWORD` 사용
- 테스트: 고객 목록 확인, 계약서 보기/인쇄

### 3. 더미 데이터 생성
```bash
curl -X POST https://your-app.vercel.app/api/seed
```

## 🛡 보안 고려사항

1. **관리자 비밀번호**: 복잡하고 안전한 비밀번호 사용
2. **쿠키 시크릿**: 32자 이상의 랜덤 문자열 사용
3. **데이터베이스**: 신뢰할 수 있는 PostgreSQL 서비스 사용
4. **HTTPS**: Vercel에서 자동으로 SSL 인증서 제공

## 🔗 유용한 링크

- [Vercel 대시보드](https://vercel.com/dashboard)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase](https://supabase.com)
- [Prisma 문서](https://www.prisma.io/docs)

## ⚠️ 문제 해결

### 빌드 오류 시
1. `package.json`의 Node.js 버전 확인
2. 환경변수가 올바르게 설정되었는지 확인
3. Prisma 스키마 문법 오류 확인

### 데이터베이스 연결 오류 시
1. `DATABASE_URL` 형식 확인
2. 데이터베이스 서비스가 활성화되어 있는지 확인
3. 방화벽/네트워크 설정 확인

배포 과정에서 문제가 발생하면 Vercel 대시보드의 Functions 탭에서 로그를 확인할 수 있습니다.