# 🔐 GitHub Actions 자동 배포 설정 가이드

Jamaica Contract System의 GitHub Actions를 통한 자동 배포를 설정하기 위해 필요한 시크릿과 토큰들을 안내합니다.

## 📋 필요한 GitHub Secrets

다음 시크릿들을 GitHub 리포지토리 설정에서 추가해야 합니다:

### 1️⃣ Vercel 관련 시크릿

```bash
# Vercel CLI를 통해 확인 가능
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here
```

### 2️⃣ 데이터베이스 관련 시크릿

```bash
# 현재 사용 중인 Supabase 설정
DATABASE_URL=postgresql://postgres:HeShe52940%21%21@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:HeShe52940%21%21@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres
ADMIN_PASSWORD=admin1234
COOKIE_SECRET=jamaica_fitness_secret_key_2026
```

## 🛠️ 토큰 발급 방법

### Vercel Token 발급
1. [Vercel Dashboard](https://vercel.com/account/tokens) 접속
2. "Create Token" 클릭
3. Token 이름: `Jamaica Contract GitHub Actions`
4. Scope: Full Account
5. 생성된 토큰 복사 → `VERCEL_TOKEN`으로 저장

### Vercel 프로젝트 정보 확인
```bash
# 로컬에서 실행
cd jamaica-contract
npx vercel link
npx vercel project ls
```

### GitHub Secrets 설정
1. GitHub 리포지토리 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 위의 모든 시크릿들을 각각 추가

## 🚀 자동 배포 워크플로우

### 트리거 조건
- ✅ `main` 또는 `master` 브랜치에 Push → **프로덕션 배포**
- ✅ Pull Request 생성 → **미리보기 배포**

### 배포 과정
1. 📦 코드 체크아웃
2. 🔧 Node.js 환경 설정
3. 📥 의존성 설치
4. 🔨 프로젝트 빌드
5. 🧪 테스트 실행 (있는 경우)
6. 🚀 Vercel 배포

## 📁 추가된 파일들

```
jamaica-contract/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions 워크플로우
├── GITHUB_DEPLOYMENT_SETUP.md   # 이 파일
├── deploy.sh                    # 로컬 배포 스크립트 (기존)
└── AUTO_DEPLOY.md               # Vercel CLI 배포 가이드 (기존)
```

## 🔄 배포 방법 비교

### 방법 1: GitHub Actions (권장)
```bash
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main
# → 자동으로 프로덕션 배포 시작
```

### 방법 2: 로컬 스크립트
```bash
npm run deploy
# → deploy.sh 실행으로 Vercel CLI 배포
```

### 방법 3: 수동 배포
```bash
npx vercel --prod
```

## 🎯 완료 체크리스트

- [ ] GitHub 리포지토리 생성
- [ ] 모든 시크릿 GitHub에 추가
- [ ] Vercel 프로젝트와 GitHub 연결
- [ ] 첫 번째 Push로 배포 테스트
- [ ] API 엔드포인트 동작 확인
- [ ] MCP 기반 CRUD 기능 테스트

## 🆘 문제 해결

### 배포 실패 시
1. GitHub Actions 로그 확인
2. 시크릿 값들이 올바른지 검증
3. Vercel 프로젝트 설정 확인

### 환경변수 문제 시
```bash
# Vercel에서 환경변수 확인
npx vercel env ls

# GitHub Actions에서 시크릿 확인
# GitHub 리포지토리 → Settings → Secrets and variables → Actions
```