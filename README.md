# Personal Website — Hyeon Jun Lim

개인 프로필/학술 홈페이지. **`data/profile.json` 한 파일만 수정하면 사이트 전체가 갱신**됩니다.

```
data/profile.json     ← 모든 내용(경력·논문·특허·뉴스…)이 여기 있습니다. 여기만 고치세요.
build.js              ← profile.json 을 읽어 HTML 을 생성하는 스크립트 (의존성 없음)
index.html            ← 자동 생성됨. 직접 수정하지 마세요.
publications.html     ← 자동 생성됨. 직접 수정하지 마세요.
assets/css/style.css  ← 디자인
assets/js/main.js     ← 다크모드 토글 등
assets/img/profile.jpg← 프로필 사진 (이 이름으로 넣으면 자동 반영)
assets/files/cv.pdf   ← CV PDF
```

## 내용 수정하기

1. `data/profile.json` 수정
2. 아래 명령 실행 → 브라우저로 `index.html` 열어 확인

```bash
node build.js
open index.html
```

3. 커밋 & 푸시하면 GitHub Actions 가 자동으로 다시 빌드해서 배포합니다.

```bash
git add -A && git commit -m "update profile" && git push
```

> GitHub 웹에서 `data/profile.json` 만 고쳐도 됩니다. 푸시 즉시 Actions 가 빌드·배포합니다.

## 자주 하는 수정

| 하고 싶은 것 | 고칠 곳 |
|---|---|
| 프로필 사진 | `assets/img/profile.jpg` 로 파일 저장 (없으면 이니셜이 표시됨) |
| 최근 소식 추가 | `news` 배열 맨 위에 `{ "date": "...", "text": "..." }` 추가 |
| 새 논문 | `publications` → 해당 `group` 의 `items` 에 추가 |
| 새 특허 | `patents` 배열에 추가 |
| 프로젝트 | `projects` 배열 (전부 노출됨) |
| Scholar/LinkedIn 링크 | `profile.links` 의 `REPLACE_ME` 를 실제 URL 로 교체 |
| CV 갱신 | `assets/files/cv.pdf` 덮어쓰기 |

`bio`, `news[].text`, `projects[].highlights` 는 `<strong>`, `<em>`, `<a>` 같은 간단한 HTML 태그를 쓸 수 있습니다.
그 외 필드는 자동으로 이스케이프되므로 태그를 넣어도 글자 그대로 표시됩니다.

## 첫 배포 (GitHub Pages)

1. GitHub 에서 `<username>.github.io` 이름으로 **public** 저장소 생성
2. 로컬에서:

```bash
git init -b main
git add -A
git commit -m "initial site"
git remote add origin https://github.com/<username>/<username>.github.io.git
git push -u origin main
```

3. 저장소 **Settings → Pages → Build and deployment → Source: GitHub Actions** 로 설정
4. 1~2분 뒤 `https://<username>.github.io` 에서 확인

## 커스텀 도메인 (선택)

무료로 쓸 수 있는 옵션:
- **`<username>.github.io`** — 추가 비용 0원, 설정 불필요 (기본)
- **js.org** — 오픈소스/개발자용 무료 서브도메인 (`이름.js.org`), PR 로 신청
- **Cloudflare Registrar** — `.com` 등 원가 판매(연 $10 내외). 가장 깔끔한 유료 옵션

도메인을 붙일 때는 저장소 루트에 `CNAME` 파일을 만들고 도메인만 한 줄 적은 뒤,
DNS 에서 `A` 레코드를 GitHub Pages IP(185.199.108~111.153) 로, 또는 `CNAME` 을
`<username>.github.io` 로 지정합니다.
