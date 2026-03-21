# 🚀 Jamaica Fitness - 빠른 Vercel 배포 가이드

## 📝 5분 배포 단계

### 1단계: GitHub 리포지토리 생성 (2분)
1. [github.com/new](https://github.com/new)에서 새 리포지토리 생성
2. 리포지토리 이름: `jamaica-fitness` (또는 원하는 이름)
3. Public으로 설정
4. README 체크 해제 (이미 있음)

### 2단계: 코드 업로드 (1분)
터미널에서 아래 명령어 실행 (YOUR_USERNAME을 본인 GitHub 아이디로 변경):

```bash
git remote add origin https://github.com/YOUR_USERNAME/jamaica-fitness.git
git branch -M main
git push -u origin main
```

### 3단계: Vercel 배포 (2분)
1. [vercel.com](https://vercel.com)에서 GitHub으로 로그인
2. "New Project" 클릭
3. 방금 생성한 GitHub 리포지토리 선택
4. "Deploy" 클릭 (자동으로 Next.js 감지됨)

### 4단계: 환경변수 설정 (1분)
Vercel 대시보드에서 Settings > Environment Variables 추가:

```env
DATABASE_URL=postgresql://username:password@host:port/database
ADMIN_PASSWORD=your_secure_password
COOKIE_SECRET=your_random_secret_key
```

### 5단계: 데이터베이스 설정
- **Vercel Postgres** (가장 쉬움): Vercel 대시보드에서 Storage > Create Database
- **Supabase**: [supabase.com](https://supabase.com)에서 무료 PostgreSQL 생성

## 🎯 배포 완료!

배포 완료 후:
- **메인 URL**: `https://your-app.vercel.app`
- **관리자**: `https://your-app.vercel.app/admin`
- **더미 데이터**: `curl -X POST https://your-app.vercel.app/api/seed`

---

**현재 프로젝트는 완전히 배포 준비가 완료된 상태입니다!**
GitHub에 업로드만 하면 바로 Vercel 배포 가능합니다. 🚀