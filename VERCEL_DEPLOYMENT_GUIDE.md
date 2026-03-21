# Jamaica 계약 시스템 - Vercel 배포 가이드

## 🚀 배포 단계

### 1단계: Vercel 계정 생성 및 GitHub 연결

1. **Vercel 웹사이트 접속**: https://vercel.com
2. **GitHub로 로그인**: "Continue with GitHub" 클릭
3. **권한 승인**: Vercel이 GitHub 저장소에 접근할 수 있도록 허용

### 2단계: 프로젝트 가져오기

1. **Dashboard에서**: "Add New" → "Project" 클릭
2. **GitHub 저장소 선택**: `leekm-pm-design/jamaica-fitness` 선택
3. **Import** 클릭

### 3단계: 프로젝트 설정

**Root Directory 설정:**
- Root Directory: `jamaica-contract` (하위 폴더 선택)

**Framework Preset:**
- 자동으로 Next.js로 감지됨

### 4단계: 환경변수 설정

**Environment Variables 섹션에 다음 변수들 추가:**

```env
DATABASE_URL=postgresql://postgres:HeShe52940%21%21@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres:HeShe52940%21%21@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres

ADMIN_PASSWORD=admin1234

COOKIE_SECRET=jamaica_fitness_secret_key_2026
```

**⚠️ 중요:**
- 각 변수를 Production, Preview, Development 환경 모두에 적용하세요
- 변수명과 값이 정확한지 확인하세요

### 5단계: 배포 실행

1. **Deploy** 버튼 클릭
2. 빌드 과정 모니터링 (약 2-3분 소요)
3. 배포 완료 대기

## 🔗 배포 후 확인사항

### 배포된 URL 확인
- Vercel이 제공하는 URL (예: `https://jamaica-fitness-xxx.vercel.app`)

### 페이지 접근 테스트
- **메인 페이지**: `https://your-app.vercel.app/`
- **관리자 페이지**: `https://your-app.vercel.app/admin`
- **API 테스트**: `https://your-app.vercel.app/api/contracts`

### 기능 테스트
1. **사용자 페이지**:
   - 고객 정보 입력 가능 여부
   - 회원권 선택 가능 여부
   - 디지털 서명 입력 가능 여부
   - 계약 생성 및 저장 확인

2. **관리자 페이지**:
   - 비밀번호 `admin1234`로 로그인 가능 여부
   - 고객 목록 조회 가능 여부
   - 고객 검색 기능 작동 여부
   - 계약서 조회 기능 작동 여부

## 🛠️ 문제 해결

### 빌드 오류 발생시
1. **Function 탭**에서 오류 로그 확인
2. TypeScript 오류인 경우: 타입 오류 수정 후 재배포
3. 환경변수 오류인 경우: 설정 확인 및 재배포

### 데이터베이스 연결 오류
1. **Environment Variables**에서 DATABASE_URL 확인
2. Supabase 프로젝트 상태 확인
3. 연결 문자열의 특수문자 인코딩 확인 (`!` → `%21`)

### API 오류
1. **Function 탭**에서 서버사이드 로그 확인
2. Network 탭에서 요청/응답 확인
3. 환경변수 설정 재확인

## 🔄 재배포

### 자동 배포
- GitHub `main` 브랜치에 코드 푸시시 자동 재배포

### 수동 배포
1. Vercel Dashboard → 프로젝트 선택
2. **Deployments** 탭
3. **Redeploy** 버튼 클릭

## 🌐 커스텀 도메인 설정 (선택사항)

1. **Settings** 탭 → **Domains**
2. 보유한 도메인 추가
3. DNS 설정에 Vercel 제공 CNAME 레코드 추가
4. SSL 인증서 자동 설정

## 📊 성능 모니터링

### Vercel Analytics
- **Analytics** 탭에서 페이지 뷰, 성능 지표 확인

### Function 로그
- **Functions** 탭에서 API 호출 로그 및 오류 확인

## 🔐 보안 설정

### 환경변수 보안
- Production 환경변수는 암호화되어 저장
- 로컬 개발시에만 .env.local 사용

### API 보안
- 관리자 페이지는 비밀번호 인증 필요
- HTTP-Only 쿠키로 세션 관리

## 📱 모바일 최적화

- 반응형 디자인으로 모바일 완전 지원
- PWA 기능으로 모바일 앱처럼 사용 가능

## 💡 배포 완료 체크리스트

- [ ] Vercel 프로젝트 생성
- [ ] GitHub 저장소 연결
- [ ] 환경변수 설정 (DATABASE_URL, DIRECT_URL, ADMIN_PASSWORD, COOKIE_SECRET)
- [ ] 빌드 성공 확인
- [ ] 메인 페이지 접속 확인
- [ ] 관리자 페이지 로그인 확인
- [ ] 계약 생성 기능 테스트
- [ ] API 응답 확인
- [ ] 모바일 접속 확인

---

## 📞 지원

문제 발생시:
1. Vercel 대시보드의 Function 로그 확인
2. GitHub 이슈 트래커 활용
3. Vercel 공식 문서 참조: https://vercel.com/docs

**배포 성공시 예상 URL**: `https://jamaica-fitness-[랜덤문자].vercel.app`