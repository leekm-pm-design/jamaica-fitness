# ⚡ 빠른 GitHub 업로드 방법

## 🔑 Personal Access Token 방법 (권장)

### 1단계: 토큰 생성
1. https://github.com/settings/tokens 접속
2. "Generate new token" → "Generate new token (classic)"
3. Note: `Jamaica Fitness`
4. 권한: ✅ `repo` 체크
5. "Generate token" → **토큰 복사**

### 2단계: 토큰으로 업로드
```bash
# 토큰을 YOUR_TOKEN 자리에 붙여넣기
git remote set-url origin https://YOUR_TOKEN@github.com/leekm-pm-design/jamaica-fitness.git
git push -u origin main
```

## 🖱 웹 UI 업로드 방법 (대안)

1. **모든 파일 선택**:
   - jamaica-contract 폴더의 모든 파일/폴더 선택
   - `.git` 폴더만 제외

2. **GitHub 웹에서 업로드**:
   - https://github.com/leekm-pm-design/jamaica-fitness 접속
   - "uploading an existing file" 클릭
   - 파일들을 드래그 앤 드롭
   - "Commit changes"

## 📂 업로드할 파일들

현재 jamaica-contract 폴더 내용:
```
✅ src/ (모든 소스 코드)
✅ prisma/ (데이터베이스 스키마)
✅ package.json
✅ next.config.js
✅ tailwind.config.ts
✅ tsconfig.json
✅ README.md
✅ 모든 설정 파일들
```

---

**Personal Access Token을 생성하시고 알려주시면 바로 업로드하겠습니다!**

또는 웹 UI를 통해 직접 업로드하셔도 됩니다. 🚀