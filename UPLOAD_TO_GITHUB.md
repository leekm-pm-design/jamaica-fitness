# 📤 GitHub 업로드 및 Vercel 배포 가이드

## 현재 상황
- ✅ GitHub 리포지토리 생성됨: `https://github.com/leekm-pm-design/jamaica-fitness`
- ✅ 모든 코드 완성됨 (17개 파일)
- ⚠️ 권한 문제로 자동 업로드 불가

## 🚀 GitHub에 코드 업로드하는 방법

### 방법 1: GitHub Web UI 사용 (가장 쉬움)

1. **파일들을 압축**:
   ```bash
   # 현재 jamaica-contract 폴더의 모든 파일을 선택
   # .git 폴더는 제외하고 압축
   ```

2. **GitHub 웹에서 업로드**:
   - https://github.com/leekm-pm-design/jamaica-fitness 접속
   - "uploading an existing file" 클릭
   - 모든 파일을 드래그 앤 드롭
   - Commit message: "Add Jamaica Fitness contract system"
   - "Commit changes" 클릭

### 방법 2: Git 명령어 사용

GitHub에서 Personal Access Token을 생성 후:

```bash
# Personal Access Token으로 인증
git remote set-url origin https://YOUR_TOKEN@github.com/leekm-pm-design/jamaica-fitness.git
git push -u origin main
```

## 📂 업로드할 파일 목록

현재 완성된 17개 핵심 파일:

```
📁 프로젝트 루트/
├── package.json ✅
├── next.config.js ✅
├── tailwind.config.ts ✅
├── tsconfig.json ✅
├── .gitignore ✅
├── README.md ✅
├── DEPLOYMENT.md ✅
├── 📁 src/
│   ├── 📁 app/
│   │   ├── page.tsx (메인 서명 페이지) ✅
│   │   ├── layout.tsx ✅
│   │   ├── globals.css ✅
│   │   ├── admin/page.tsx (관리자) ✅
│   │   ├── contract/[id]/page.tsx ✅
│   │   └── 📁 api/ (6개 API 엔드포인트) ✅
│   ├── 📁 components/ (6개 컴포넌트) ✅
│   └── 📁 lib/ (2개 유틸리티) ✅
├── 📁 prisma/
│   └── schema.prisma (DB 스키마) ✅
└── .env.example ✅
```

## ⚡ 업로드 완료 후 - Vercel 배포

1. **Vercel 접속**: https://vercel.com
2. **GitHub 연결**: "Continue with GitHub"
3. **프로젝트 가져오기**: "Import Project"
4. **리포지토리 선택**: `jamaica-fitness`
5. **자동 배포**: Deploy 버튼 클릭 (Next.js 자동 감지)

## 🔧 환경변수 설정 (필수!)

Vercel 대시보드 → Settings → Environment Variables에 추가:

```env
DATABASE_URL = postgresql://postgres:password@db.xyz.supabase.co:5432/postgres
ADMIN_PASSWORD = jamaica2024!
COOKIE_SECRET = jamaica_fitness_secret_2024_random_key_here
```

## 🗄 데이터베이스 설정

### Supabase (무료, 권장):
1. https://supabase.com 가입
2. "New project" 생성
3. Settings → Database → Connection string 복사
4. Vercel 환경변수에 `DATABASE_URL`로 설정

### Vercel Postgres (대안):
1. Vercel 대시보드 → Storage → Create Database
2. PostgreSQL 선택
3. 자동으로 `DATABASE_URL` 생성됨

## 🎯 배포 완료 시 예상 링크

배포가 완료되면:
- **메인 URL**: `https://jamaica-fitness-xyz.vercel.app`
- **관리자**: `https://jamaica-fitness-xyz.vercel.app/admin`
- **더미 데이터 생성**:
  ```bash
  curl -X POST https://jamaica-fitness-xyz.vercel.app/api/seed
  ```

---

## 📋 체크리스트

- [ ] GitHub에 모든 파일 업로드 완료
- [ ] Vercel에서 자동 배포 성공
- [ ] 환경변수 3개 설정 완료
- [ ] 데이터베이스 연결 완료
- [ ] 외부 접속 링크 테스트 완료

**모든 코드가 준비되어 있으니 GitHub 업로드만 완료하면 바로 배포됩니다!** 🚀