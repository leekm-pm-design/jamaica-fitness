# Jamaica Fitness - 고객 계약 전자서명 시스템

> **버전**: v1.0 MVP
> **개발 기간**: 2026년 3월
> **기술 스택**: Next.js 14, TypeScript, Prisma, Supabase, Tailwind CSS

## 📋 프로젝트 개요

Jamaica Fitness 헬스장의 고객 계약 전자서명 시스템입니다. 태블릿에서 고객이 직접 계약서에 서명하고, 관리자가 계약 내역을 관리할 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

### 1. 태블릿 서명 화면 (`/`)
- 고객 정보 입력 (이름, 전화번호, 회원권 종류)
- 이용약관 동의 체크박스
- HTML5 Canvas 기반 전자서명 패드
- 실시간 폼 검증 및 제출

### 2. 관리자 페이지 (`/admin`)
- 비밀번호 기반 간단 인증
- 고객 목록 조회 및 검색
- 계약서 보기/인쇄 기능

### 3. 계약서 웹 뷰 (`/contract/[id]`)
- 인쇄 최적화된 계약서 레이아웃
- 고객 정보, 약관, 서명 표시
- `@media print` CSS 적용

## 🛠 기술 스택

| 분야 | 기술 | 설명 |
|------|------|------|
| Frontend | Next.js 14 (App Router) | React 기반 풀스택 프레임워크 |
| Backend | Next.js API Routes | 서버리스 API 엔드포인트 |
| Database | PostgreSQL (Supabase) | 관계형 데이터베이스 |
| ORM | Prisma | 타입 안전한 데이터베이스 클라이언트 |
| UI | Tailwind CSS | 유틸리티 기반 CSS 프레임워크 |
| 서명 | signature_pad | HTML5 Canvas 서명 라이브러리 |
| 배포 | Vercel | 서버리스 배포 플랫폼 |

## 📁 프로젝트 구조

```
jamaica-contract/
├── prisma/
│   └── schema.prisma          # DB 스키마 정의
├── src/
│   ├── app/
│   │   ├── page.tsx           # 메인 서명 화면
│   │   ├── admin/
│   │   │   └── page.tsx       # 관리자 대시보드
│   │   ├── contract/[id]/
│   │   │   └── page.tsx       # 계약서 뷰
│   │   └── api/
│   │       ├── contracts/     # 계약 관련 API
│   │       ├── customers/     # 고객 관련 API
│   │       └── auth/          # 인증 API
│   ├── components/
│   │   ├── SignaturePad.tsx   # 서명 패드 컴포넌트
│   │   ├── ContractForm.tsx   # 계약 폼 컴포넌트
│   │   ├── CustomerTable.tsx  # 고객 목록 테이블
│   │   ├── ContractView.tsx   # 계약서 뷰 컴포넌트
│   │   └── AdminLoginModal.tsx # 관리자 로그인 모달
│   └── lib/
│       ├── prisma.ts          # Prisma 클라이언트
│       └── auth.ts            # 인증 유틸리티
├── .env.local                 # 환경 변수
└── README.md
```

## 🗄 데이터베이스 스키마

### Customer (고객)
- `id`: 고유 식별자
- `name`: 고객명
- `phone`: 전화번호 (정규화)
- `membershipType`: 회원권 종류 (1개월/3개월/6개월/12개월)
- `createdAt`: 등록일시

### Contract (계약)
- `id`: 고유 식별자
- `customerId`: 고객 외래키
- `signatureData`: 서명 데이터 (Base64 PNG)
- `agreedTerms`: 약관 동의 여부
- `contractDate`: 계약일시

## 🔧 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일에 다음 변수들을 설정:

```env
# Supabase Database URL
DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"

# 관리자 비밀번호
ADMIN_PASSWORD="your_admin_password"

# 쿠키 암호화 키
COOKIE_SECRET="your_random_secret_key"
```

### 3. 데이터베이스 마이그레이션
```bash
npx prisma migrate dev --name init
```

### 4. Prisma 클라이언트 생성
```bash
npx prisma generate
```

### 5. 개발 서버 시작
```bash
npm run dev
```

애플리케이션이 `http://localhost:3000`에서 실행됩니다.

## 📱 사용법

### 고객 계약 프로세스
1. 태블릿에서 `http://localhost:3000` 접속
2. 고객 정보 입력 (이름, 전화번호, 회원권)
3. 이용약관 동의 체크
4. 서명 패드에 서명 입력
5. "서명 완료" 버튼 클릭
6. 계약 완료 메시지 확인

### 관리자 관리
1. `http://localhost:3000/admin` 접속
2. 관리자 비밀번호 입력 (환경변수에 설정된 값)
3. 고객 목록 조회 및 검색
4. "보기" 버튼으로 계약서 웹 뷰 확인
5. "인쇄" 버튼으로 계약서 인쇄

## 🔒 보안 기능

- **HTTPS**: Vercel 배포 시 자동 SSL 인증서
- **입력 검증**: 클라이언트/서버 양측에서 데이터 검증
- **SQL Injection 방지**: Prisma ORM 사용
- **관리자 인증**: 환경변수 기반 비밀번호 + httpOnly 쿠키
- **XSS 방지**: Next.js 기본 보안 기능

## 🚀 배포

### Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경변수 설정 (Vercel 대시보드에서)
# - DATABASE_URL
# - ADMIN_PASSWORD
# - COOKIE_SECRET
```

## 📞 관리자 정보

- **기본 비밀번호**: `.env.local`의 `ADMIN_PASSWORD` 확인
- **고객 문의**: Jamaica Fitness 헬스장으로 연락

## 🔧 개발자 정보

이 시스템은 Jamaica Fitness의 디지털 전환을 위해 개발되었습니다.
문의사항이나 기능 개선 요청은 개발팀으로 연락 부탁드립니다.

---

**Jamaica Fitness** - 건강한 라이프스타일의 시작! 🏋️‍♀️