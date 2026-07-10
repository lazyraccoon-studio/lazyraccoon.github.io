# 배포 매뉴얼 — GitHub Pages

게으른 너구리 스튜디오 사이트를 처음부터 인터넷에 공개하는 방법입니다.
**빌드 도구 설치 없이** GitHub만 있으면 됩니다. (약 5~10분)

---

## 0. 준비물
- GitHub 계정 하나
- 이 폴더(압축을 푼 파일 전체)

> ⚠️ 이 폴더 안의 **`.nojekyll` 파일**(점으로 시작)은 숨김 파일입니다.
> 반드시 함께 업로드되어야 사이트가 정상 동작합니다. 파일 탐색기에서 "숨김 파일 표시"를 켜서 확인하세요.

---

## 1. 저장소(repository) 만들기
1. GitHub 로그인 → 오른쪽 위 **`+` → New repository**.
2. Repository name 입력.
   - **`<계정명>.github.io`** 로 정확히 지으면 → 루트 주소(`https://<계정>.github.io/`)로 바로 배포됩니다.
   - 그 외 아무 이름이면 → 서브패스(`https://<계정>.github.io/<저장소명>/`)로 배포됩니다. (이 사이트는 상대경로만 써서 어느 쪽이든 정상 동작합니다.)
3. **Public** 선택. (Private도 되지만 Pages는 Public이 간단)
4. 나머지는 비워두고 **Create repository**.

---

## 2. 파일 올리기

### 방법 A — 웹에서 드래그 (가장 쉬움)
1. 방금 만든 저장소 페이지에서 **Add file → Upload files**.
2. 이 폴더 **안의 모든 파일/폴더를 통째로** 드래그해서 올립니다.
   (`index.html`, `assets/`, `posts/`, `projects/`, `.nojekyll` 등)
3. 아래 **Commit changes** 클릭.

> 웹 업로드가 숨김 파일(`.nojekyll`)을 빠뜨릴 수 있습니다. 업로드 후 저장소 루트에
> `.nojekyll` 이 보이는지 꼭 확인하세요. 없으면 방법 B를 쓰세요.

### 방법 B — git 명령 (권장)
```bash
cd <이 폴더>
git init
git add .
git commit -m "first commit: lazy raccoon studio"
git branch -M main
git remote add origin https://github.com/<계정>/<저장소>.git
git push -u origin main
```

---

## 3. GitHub Pages 켜기
1. 저장소 → **Settings → Pages**.
2. **Build and deployment → Source** 를 **Deploy from a branch** 로 선택.
3. **Branch** 를 `main` / `/ (root)` 로 선택 후 **Save**.

빌드 과정이 없는 순수 정적 사이트라 GitHub Actions는 필요 없습니다.

---

## 4. 배포 확인
1. push 후 1~2분 기다립니다 (Actions 탭 없이 자동 처리됩니다).
2. **Settings → Pages** 상단에 공개 주소가 뜹니다:
   ```
   https://<계정>.github.io/            (저장소명이 <계정>.github.io 인 경우)
   https://<계정>.github.io/<저장소명>/  (그 외)
   ```
3. 주소를 열면 사이트가 보입니다. 🦝

---

## 5. 이후 수정 → 자동 재배포
`main` 브랜치에 파일을 수정해서 push(또는 웹에서 Commit)하면
**자동으로 다시 배포**됩니다. 워크플로우가 알아서 실행돼요.

무엇을 어디서 고치는지는 **README.md** 를 참고하세요. 요약:
- 문구(한/영): `assets/js/i18n.js`
- 서비스·가치·스택: `assets/js/data.js`
- 색상: `assets/css/styles.css` 상단 변수
- 블로그 글: `posts/` 에 `.ko.md` + `.en.md` 두 개 추가 (아래 5-1 참고)
- 프로젝트: `projects/` 에 `.ko.md` + `.en.md` 두 개 추가 (아래 5-1 참고)
- 로고·마스코트·커버 이미지: `assets/img/`

---

## 5-1. 새 글 / 프로젝트 추가하기

`posts.json`, `projects.json`을 손으로 고칠 필요 없습니다. 각 `.md` 파일 맨 위에
**frontmatter**(`---` 로 감싼 메타데이터)를 쓰고, 스크립트 한 줄로 목록을 자동 생성합니다.

**새 블로그 글:**
1. `posts/<slug>.ko.md`, `posts/<slug>.en.md` 두 파일을 만듭니다.
2. 맨 위에 frontmatter를 씁니다 (한글 파일에만 `date`/`tag`/`read` 필요):
   ```
   ---
   slug: my-new-post
   date: 2026.08
   tag: guide
   read: 5
   title: 글 제목
   excerpt: 목록에 보일 한 줄 요약.
   ---

   본문은 여기부터 마크다운으로 씁니다.
   ```
   `.en.md` 쪽은 `slug`/`title`/`excerpt`만 (영문으로) 쓰면 됩니다.
3. 터미널에서 실행:
   ```bash
   node scripts/build-manifest.mjs
   ```
   `posts/posts.json`이 최신 글 목록으로 재생성됩니다. 최신 날짜가 자동으로 맨 위에 옵니다.
4. 커밋 & push 하면 배포됩니다.

**새 프로젝트도 동일한 방식**으로 `projects/<slug>.ko.md` / `.en.md`에 frontmatter
(`slug`, `tag`, `year`, `order`, `name`, `type`, `status`, `blurb`)를 쓰고 같은 스크립트를 실행합니다.
`order`가 작을수록 홈 화면 목록에서 먼저 나옵니다.

블로그 목록은 8개 단위로 자동 페이징됩니다(`#/blog/page/2` 등). 페이지 크기를
바꾸려면 `assets/js/app.js`의 `BLOG_PAGE_SIZE` 값을 수정하세요.

---

## 6. 커스텀 도메인 (선택)
`lazyraccoon.studio` 같은 자체 도메인을 쓰려면:
1. 저장소 루트에 **`CNAME`** 파일을 만들고 안에 도메인만 한 줄:
   ```
   lazyraccoon.studio
   ```
2. 도메인 등록업체 DNS에 GitHub Pages IP(A 레코드) 또는 CNAME(`<계정>.github.io`) 설정.
3. Settings → Pages → Custom domain 에 도메인 입력 후 **Enforce HTTPS** 체크.

---

## 7. 로컬에서 먼저 보기 (선택)
글 목록은 `fetch()` 로 `.md`/`.json` 을 읽기 때문에 파일을 그냥 더블클릭하면
안 되고, 간단한 로컬 서버가 필요합니다:
```bash
cd <이 폴더>
python3 -m http.server 8080
# 브라우저에서 http://localhost:8080
```

---

## 문제 해결
- **화면이 하얗고 글이 안 나와요** → `.nojekyll` 이 빠졌거나, 로컬에서 `file://` 로 열었을 때입니다. 서버로 여세요.
- **사이트가 안 바뀌어요** → Settings → Pages의 Source가 **Deploy from a branch**, Branch가 `main` / `/ (root)` 인지 확인. push 후 1~2분 정도 걸릴 수 있습니다.
- **이미지가 안 보여요** → 경로 대소문자를 확인하세요. GitHub는 대소문자를 구분합니다.
- **404** → 주소 끝에 `/` 가 있는지 확인하세요.
