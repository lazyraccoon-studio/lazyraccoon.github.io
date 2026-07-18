# Lazy Raccoon Studio — 웹사이트

게으른 너구리 스튜디오(Lazy Raccoon Studio) 공식 사이트.
**빌드 도구 없는 순수 정적 사이트**입니다. GitHub Pages에 그대로 올리면 동작합니다.

## 베이스 (기술 스택)

| 항목 | 사용 |
|---|---|
| 마크업/스타일 | 순수 HTML + CSS (프레임워크 없음) |
| 로직 | Vanilla JavaScript (해시 라우팅 SPA, 빌드 없음) |
| 블로그 | Markdown(`.md`) 파일을 [marked.js](https://marked.js.org/)로 클라이언트 렌더 |
| 다국어 | KO/EN 사전 객체 (`assets/js/i18n.js`) + `localStorage` |
| 테마 | 다크/라이트 CSS 변수 토글 + `localStorage` |
| 폰트 | JetBrains Mono · Nanum Gothic Coding · Pretendard (전부 상업용 무료 / OFL) |

의존성은 CDN 2개(폰트, marked.js)뿐이고 나머지는 전부 이 저장소 안에 있습니다.

## 폴더 구조

```
site/
├─ index.html              ← 진입점 (셸: 폰트/CSS/스크립트 로드)
├─ .nojekyll               ← GitHub Pages가 Jekyll 처리 없이 파일 그대로 서빙
├─ assets/
│  ├─ css/styles.css        ← 모든 스타일 + 테마 색상 변수 (상단에서 색 수정)
│  ├─ js/i18n.js            ← UI 문구 (한/영) ← 텍스트 수정은 여기
│  ├─ js/data.js            ← 프로젝트/서비스/가치/스택 데이터 ← 여기
│  └─ img/                  ← 로고·마스코트·파비콘
├─ posts/
│  ├─ posts.json            ← 블로그 글 목록(메타데이터)
│  └─ <slug>.ko.md / <slug>.en.md   ← 글 본문 (언어별)
└─ projects/
   ├─ projects.json         ← 프로젝트 목록(메타데이터)
   └─ <slug>.ko.md / <slug>.en.md   ← 프로젝트 상세 (언어별)
```

## 자주 하는 수정

**문구(카피) 바꾸기** → `assets/js/i18n.js` 의 `ko`/`en` 값 수정.

**프로젝트·서비스 내용 바꾸기** → 서비스/가치/프로세스는 `assets/js/data.js` (`SERVICES`, `VALUES`, `STEPS`). 프로젝트 목록·본문은 `projects/`.

**프로젝트 내용 바꾸기** → `projects/` 폴더. 카드 메타데이터는 `projects/projects.json`, 상세 내용은 `projects/<slug>.ko.md` / `.en.md`. 목록은 `#/work`, 상세는 `#/work/<slug>`.

**색상 바꾸기** → `assets/css/styles.css` 상단 `:root`(다크) / `[data-theme="light"]`(라이트) 변수.

**연락처/사업자번호** → `assets/js/i18n.js` 하단 `window.CONTACT`.

### 블로그 글 추가하기
1. `posts/` 에 `내-글.ko.md`, `내-글.en.md` 두 파일 작성.
2. `posts/posts.json` 의 `posts` 배열 맨 앞에 항목 추가:
   ```json
   {
     "slug": "내-글",
     "date": "2026.08",
     "tag": "guide",
     "read": "5",
     "title": { "ko": "제목", "en": "Title" },
     "excerpt": { "ko": "요약", "en": "Summary" }
   }
   ```
글은 일반 마크다운(제목 `##`, 코드블록 ``` ``` ```, 목록, 링크 등)을 그대로 씁니다.

### 프로젝트 추가하기
1. `projects/` 에 `내-프로젝트.ko.md`, `내-프로젝트.en.md` 두 파일 작성.
2. `projects/projects.json` 의 `projects` 배열에 항목 추가:
   ```json
   {
     "slug": "내-프로젝트",
     "tag": "game",
     "year": "2026",
     "name": "My Project",
     "type": { "ko": "게임", "en": "Game" },
     "status": { "ko": "개발 중", "en": "In dev" },
     "blurb": { "ko": "한 줄 설명", "en": "One-line summary" }
   }
   ```
> 현재 3개는 테스트용 예시입니다. 커버 이미지는 `assets/img/` 에 넣고 `app.js` 의 프로젝트 커버 부분을 바꾸면 됩니다.

## 로컬에서 미리보기

`fetch()` 로 `.md`/`.json` 을 읽기 때문에 파일을 더블클릭(`file://`)하면 안 되고, 간단한 로컬 서버가 필요합니다:

```bash
cd site
python3 -m http.server 8080
# 브라우저에서 http://localhost:8080
```

## GitHub Pages 배포

빌드 과정이 없는 순수 정적 사이트라 GitHub Actions 없이 **Deploy from a branch**로 충분합니다.

1. 이 폴더 내용을 GitHub 저장소에 push (`.nojekyll` 포함).
2. **Settings → Pages → Source: Deploy from a branch** 선택 → Branch: `main`, 폴더: `/ (root)`.
3. push 할 때마다 자동 배포되어 `https://<계정>.github.io/` 에 공개됩니다.

> 처음부터 끝까지 따라 하는 상세 가이드는 **MANUAL.md** 를 참고하세요.
> 커스텀 도메인을 쓸 경우 저장소 루트에 `CNAME` 파일(도메인 한 줄)을 두세요.

## 라우팅 메모

해시 기반 라우팅이라 서버 설정 없이 동작합니다:
`#/` 홈 · `#/studio` · `#/services` · `#/work` · `#/work/<slug>` · `#/blog` · `#/blog/<slug>` · `#/contact`
