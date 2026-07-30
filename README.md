# 지역경찰포털 (police-scaffold)

Vue 3 + Vite 기반 지역경찰포털 화면 개발 프로젝트입니다.

이 문서는 **디자인 퍼블리셔**가 이 프로젝트에서 직접 화면을 만들고 확인할 수 있도록,
① 로컬 웹서버 구동 방법 ② 레이아웃 / CSS / 리소스 구성 방안 ③ 라우터(페이지) 추가 방법
세 가지를 중심으로 정리했습니다.

> 퍼블리싱 원본(정적 HTML)은 [reference-publisher/police-portal/](reference-publisher/police-portal/) 에 그대로 보관되어 있습니다.
> 원본 CSS/이미지/폰트는 **한 글자도 수정하지 않고** 복사해서 사용하는 것이 이 프로젝트의 원칙입니다.

---

## 1. 웹서버 구동 및 화면 테스트

### 1-1. 사전 준비

| 항목 | 버전 | 비고 |
| --- | --- | --- |
| Node.js | 22.x 이상 | [nodejs.org](https://nodejs.org/) LTS 설치 |
| pnpm | 10 이상 | 이 프로젝트의 표준 패키지 매니저 |

pnpm이 없다면 아래 중 하나로 설치합니다.

```bash
# Node 16.13+ 에 내장된 corepack 사용 (권장)
corepack enable
corepack prepare pnpm@10.28.2 --activate

# 또는 npm 으로 전역 설치
npm install -g pnpm
```

설치 확인:

```bash
node -v     # v22.x.x
pnpm -v     # 10.x.x
```

### 1-2. 의존성 설치

프로젝트 루트(`package.json`이 있는 폴더)에서 실행합니다.

```bash
pnpm install
```

> ⚠️ **`npm install` 을 쓰지 마세요.** `pnpm-lock.yaml`과 충돌해 버전이 어긋나고,
> `package-lock.json`이 생성되어 다른 팀원 환경까지 깨질 수 있습니다.
> 이미 실행했다면 `package-lock.json`과 `node_modules`를 지우고 `pnpm install`을 다시 실행하세요.

### 1-3. 개발 서버 실행

```bash
pnpm local
```

실행 후 터미널에 출력되는 주소를 브라우저에서 엽니다.

```
  ➜  Local:   http://localhost:8081/
  ➜  Network: http://192.168.x.x:8081/
```

| 명령 | 설명 | 사용하는 환경파일 |
| --- | --- | --- |
| `pnpm local` | **퍼블리싱 작업용 기본 명령.** 로컬 백엔드(localhost:18080) 기준 | `.env.localhost` |
| `pnpm dev` | 개발 서버 백엔드 연동 | `.env.development` |
| `pnpm build` | 배포용 정적 파일 생성 (`dist/`) | - |
| `pnpm preview` | 빌드 결과물을 로컬에서 미리보기 | - |

- 호스트/포트는 `.env.localhost`의 `VITE_APP_HOST`, `VITE_APP_PORT`에서 변경합니다.
- 파일을 저장하면 **브라우저가 자동 새로고침(HMR)** 됩니다. 서버를 다시 띄울 필요가 없습니다.
- 서버 종료는 터미널에서 `Ctrl + C`.

### 1-4. 확인용 주요 화면

| 경로 | 화면 | 소스 |
| --- | --- | --- |
| `/` | 포털 메인 | [src/views/Main.vue](src/views/Main.vue) |
| `/lpo/notebook` | 개인수첩 (서브페이지 예시) | [src/views/lpo/notebook/NotebookMain.vue](src/views/lpo/notebook/NotebookMain.vue) |
| `/component/*` | 공통 컴포넌트 샘플 모음 | [src/views/component-sample/](src/views/component-sample/) |

### 1-5. npm / yarn 대응표 (참고)

pnpm 사용이 원칙이지만, 명령 대응 관계는 아래와 같습니다.

| pnpm | npm | 설명 |
| --- | --- | --- |
| `pnpm install` | `npm install` | 의존성 설치 |
| `pnpm local` | `npm run local` | 로컬 개발 서버 |
| `pnpm dev` | `npm run dev` | 개발 서버 |
| `pnpm build` | `npm run build` | 빌드 |
| `pnpm add <패키지>` | `npm install <패키지>` | 패키지 추가 |

> pnpm은 `run`을 생략할 수 있습니다. (`pnpm run local` = `pnpm local`)

---

## 2. 레이아웃 · CSS · 리소스 구성 방안

### 2-1. 전체 그림

```
index.html                        ← CSS 레이어 순서 선언 + 퍼블리싱 CSS/JS 로드
└── src/App.vue
    └── src/components/layout/Layout.vue          ← 라우트 meta.layout 보고 레이아웃 선택
        └── PortalLayout.vue                      ← .wrap / 헤더 / <main> / 푸터 골격
            ├── PortalHeader.vue                  ← 원본 header + GNB
            ├── <slot name="main">  ← 여기에 화면이 들어감
            │     · Main.vue           (.container.main)
            │     · NotebookMain.vue   (.container.notebook)
            └── PortalFooter.vue
```

**퍼블리셔가 화면을 만들 때 담당하는 범위는 `<main>` 안쪽**입니다.
헤더·GNB·푸터는 `PortalLayout`이 자동으로 붙여주므로 화면 파일에 다시 작성하지 않습니다.

관련 파일:

- [src/components/layout/Layout.vue](src/components/layout/Layout.vue) — 레이아웃 분기
- [src/components/layout/layouts/PortalLayout.vue](src/components/layout/layouts/PortalLayout.vue) — 포털 골격
- [src/components/layout/portal/PortalHeader.vue](src/components/layout/portal/PortalHeader.vue) — 헤더/GNB
- [src/components/layout/portal/portalMenu.ts](src/components/layout/portal/portalMenu.ts) — GNB 메뉴 **데이터**
- [src/components/layout/portal/PortalFooter.vue](src/components/layout/portal/PortalFooter.vue) — 푸터

> GNB 메뉴를 추가/수정할 때는 `PortalHeader.vue`의 마크업이 아니라 **`portalMenu.ts` 데이터를 수정**합니다.
> 마크업은 이 데이터를 `v-for`로 반복 출력하는 구조입니다.

### 2-2. CSS 구성 — `@layer` 우선순위

이 프로젝트에는 **퍼블리싱 원본 CSS(police-style.css)** 와 **Tailwind/shadcn** 이 함께 존재합니다.
서로 덮어쓰는 문제를 막기 위해 CSS 레이어 순서를 [index.html](index.html) 최상단에서 고정해 두었습니다.

```html
<style>
  @layer properties, theme, base, police, components, utilities;
</style>
```

| 순서 | 레이어 | 내용 | 우선순위 |
| --- | --- | --- | --- |
| 1 | `properties` / `theme` / `base` | Tailwind preflight, 테마 변수 | 낮음 |
| 2 | **`police`** | **퍼블리싱 원본 CSS (police-style.css, swiper)** | 중간 |
| 3 | `components` / `utilities` | shadcn 컴포넌트, Tailwind 유틸리티 클래스 | 높음 |

즉,

- `police` > `base` → **원본 reset이 Tailwind preflight를 이깁니다.** (포털 화면이 원본 그대로 나옴)
- `utilities` > `police` → **Tailwind 유틸리티가 원본 reset을 이깁니다.** (shadcn 컴포넌트 정상 동작)
- **SFC의 `<style scoped>` 는 어떤 레이어에도 속하지 않으므로 항상 police보다 우선합니다.**
  → 서브페이지에서 원본 reset(`a`, `button`, `ul` 등)을 별도 처리 없이 덮어쓸 수 있습니다.

원본 CSS를 불러오는 진입점은 [public/portal/police-entry.css](public/portal/police-entry.css) 입니다.

```css
@import url("./asset/css/common/police-style.css") layer(police);
@import url("./asset/css/common/swiper-bundle.min.css") layer(police);
```

> 이 파일이 `public/` 에 있는 이유: Vite CSS 파이프라인을 타지 않기 때문에
> 원본 CSS 안의 상대경로(`../../images`, `../../fonts`)가 그대로 동작하고,
> 원본에 존재하는 오타 경로로 인한 **빌드 실패도 발생하지 않습니다.**
> **원본 CSS는 수정하지 않고, 보정이 필요하면 해당 화면의 `<style scoped>` 에서 처리합니다.**

### 2-3. 리소스(이미지 · 폰트 · JS) 배치 규칙

퍼블리싱 자산은 원본 폴더 구조를 유지한 채 `public/portal/` 아래에 둡니다.

```
public/portal/
├── police-entry.css              ← 원본 CSS 진입점 (레이어 래핑)
└── asset/
    ├── css/common/               ← police-style.css, krds.min.css, swiper-bundle.min.css
    ├── images/
    │   ├── icon/                 ← ico_*.svg, img_main_card*.svg
    │   └── img/                  ← 사진/이미지
    ├── fonts/                    ← PretendardGOV-*.woff2
    └── js/common/                ← swiper-bundle.min.js
```

**참조 규칙: 항상 `/portal/` 로 시작하는 절대경로를 사용합니다.**

```html
<!-- ✅ 올바른 예 -->
<img src="/portal/asset/images/icon/img_main_card01.svg" alt="" />
```

```css
/* ✅ CSS(scoped) 에서도 동일 */
background: url("/portal/asset/images/icon/ico_arrow_next_black_16.svg") no-repeat center / 1.2rem auto;
```

```html
<!-- ❌ 원본 HTML 의 상대경로는 Vue 컴포넌트에서 동작하지 않습니다 -->
<img src="../asset/images/icon/img_main_card01.svg" alt="" />
```

> 원본 HTML을 Vue로 옮길 때 해야 하는 경로 치환은 이것 하나입니다.
> `../asset/images/...` → `/portal/asset/images/...`
>
> [vite.config.ts](vite.config.ts) 에 `transformAssetUrls.includeAbsolute: false` 를 설정해 두어,
> `/portal/...` 절대경로는 Vite가 건드리지 않고 그대로 내보냅니다. (dev/build 동작 일치)

**전역 JS(Swiper)** 는 [index.html](index.html) 에서 `defer`로 로드합니다.

```html
<script src="/portal/asset/js/common/swiper-bundle.min.js" defer></script>
```

컴포넌트에서는 `window.Swiper` 로 접근합니다. (타입 선언: [src/types/swiper.d.ts](src/types/swiper.d.ts))

### 2-4. 화면 유형 ① 메인 — `Main.vue`

[src/views/Main.vue](src/views/Main.vue)

- 퍼블리싱 원본 `html/index.html` 의 `<main>` 내부를 **컴포넌트 분리 없이 한 파일로** 옮긴 형태입니다.
- **클래스명 / DOM 구조 / `aria-*` 속성을 원본과 1:1로 유지**합니다. → `police-style.css` 무수정으로 그대로 적용됩니다.
- 최상위는 `.container.main > .inner` 로 시작합니다.
- `<style>` 블록이 **없습니다.** 스타일은 전부 `police-style.css` 가 담당합니다.

원본 정적 HTML → Vue 로 옮기면서 바뀐 부분은 다음 셋뿐입니다.

| 원본 | Vue |
| --- | --- |
| 반복되는 `<li>`, `<div class="card">` 마크업 | `v-for` + `<script setup>` 의 데이터 배열 |
| `common.js` 의 탭 DOM 조작 | `activeTab` ref + `:class="{ active: ... }"`, `:hidden` |
| `new Swiper(...)` 스크립트 | `onMounted()` 에서 초기화 / `onBeforeUnmount()` 에서 `destroy()` |

```ts
// 예: 데이터만 바꾸면 마크업은 그대로 반복 출력됩니다
const notifications = [
  { date: '06.15', text: '신청하신 출동수당이 승인 완료 되었습니다.' },
  { date: '06.15', text: '신청하신 출동수당이 승인 완료되었습니다.' },
]
```

> **Swiper 를 쓰는 화면을 새로 만들 때는 반드시 `onBeforeUnmount` 에서 `destroy(true, true)` 를 호출**하세요.
> SPA는 페이지를 이동해도 스크립트가 살아 있어, 정리하지 않으면 인스턴스가 누적됩니다.

### 2-5. 화면 유형 ② 서브페이지 — `NotebookMain.vue`

[src/views/lpo/notebook/NotebookMain.vue](src/views/lpo/notebook/NotebookMain.vue)

`police-style.css` 는 **메인 화면 전용**이라 서브페이지 컴포넌트(브레드크럼 / 페이지 타이틀 / 테이블 / 버튼)가
정의되어 있지 않습니다. 그래서 서브페이지는 다음 방식으로 구성합니다.

1. **최상위는 `.container.{페이지훅클래스} > .inner`** 로 시작합니다. (예: `.container.notebook`)
2. **`:root` 디자인 토큰만 가져다 쓰고**, 페이지 스타일은 해당 파일의 `<style scoped>` 에 작성합니다.
3. 필요하면 Tailwind 유틸리티나 shadcn 컴포넌트를 그대로 섞어 써도 됩니다. (`utilities` > `police`)

사용 가능한 디자인 토큰 (`police-style.css` `:root` 정의):

| 구분 | 변수 | 값 |
| --- | --- | --- |
| 텍스트 | `--Text-body_0` / `_1` / `_2` / `_disable` | `#1e2124` / `#464c53` / `#6d7882` / `#8a949e` |
| 주요 색 | `--Base-primary` / `--Base-secondary` / `--Base--point` | `#0054a6` / `#023f88` / `#b02a30` |
| 배경 | `--Surface-primary` / `--Surface-secondary` / `--Surface-point` | `#f0f7ff` / `#eef2f7` / `#fdf3f3` |
| 배경(회색) | `--Background-gray01` / `--Background-main-card` | `#f4f5f6` / `#f0f1f4` |
| 테두리 | `--Border_gray0` ~ `--Border_gray03` | `#cdd1d5` ~ `#e6e8ea` |
| 상태 | `--danger` / `--warning` / `--success` / `--info` | `#de3412` / `#ffb114` / `#00aa0e` / `#096ab3` |
| 공통 | `--white` / `--black` | `#fff` / `#000` |
| 레이아웃 | `--contents-wrap-size` | `1200px` |

작성 시 주의사항:

- **`rem` 기준은 `1rem = 10px`** 입니다. (`police` reset 의 `html { font-size: 62.5% }`)
  → `1.6rem` = 16px, `3.6rem` = 36px
  단, **Tailwind 클래스는 [src/assets/css/style.css](src/assets/css/style.css) 에서 스케일을 보정**해 두었으므로
  `text-base` 는 정상적으로 16px로 나옵니다. 두 방식을 섞어 써도 크기가 어긋나지 않습니다.
- **`<table>` 은 `table-layout: fixed`** 가 reset에 적용되어 있습니다. 폭은 `<colgroup>` 으로 지정하세요.
- **서브페이지에는 `<nav id="breadCrumb">` 를 반드시 둡니다.**
  레이아웃의 '본문 바로가기' 스킵 링크가 `#breadCrumb` 를 가리킵니다.
- 원본 reset 의 `*:focus` 는 존재하지 않는 변수(`--Base-seconday-dark`, 오타)를 참조해 **아웃라인이 무효화**됩니다.
  원본은 수정하지 말고, 아래처럼 해당 페이지에서만 보완하세요.

```css
.notebook a:focus-visible,
.notebook button:focus-visible {
  outline: 0.2rem solid var(--Base-primary);
  outline-offset: 0.2rem;
}
```

### 2-6. 어떤 방식을 선택할까

| 상황 | 방식 |
| --- | --- |
| 퍼블리싱 원본 HTML이 이미 있는 화면 | **Main.vue 방식** — 클래스/구조 1:1 유지, `<style>` 없음, 이미지 경로만 치환 |
| 원본에 없는 신규 서브페이지 | **NotebookMain.vue 방식** — 디자인 토큰 + `<style scoped>` |
| 관리자 화면 등 포털 디자인이 아닌 화면 | `meta.layout: 'MainLayout'` + Tailwind/shadcn (`/component/*` 샘플 참고) |

---

## 3. 라우터 — 페이지 추가 및 링크 방법

라우트 정의 파일: [src/router/index.ts](src/router/index.ts)

### 3-1. 라우트 하나의 구조

```ts
{
    path: '/lpo/notebook',                                            // ① URL
    name: 'lpo-notebook',                                             // ② 라우트 이름 (고유)
    component: () => import('../views/lpo/notebook/NotebookMain.vue'), // ③ 화면 파일
    meta: {
        layout: 'PortalLayout',                                       // ④ 사용할 레이아웃
        title: '개인수첩'                                              // ⑤ 화면 제목
    }
}
```

| 항목 | 설명 |
| --- | --- |
| ① `path` | 브라우저 주소. `/` 로 시작. 카테고리별로 `/lpo/...` 처럼 계층을 맞춥니다 |
| ② `name` | 코드에서 참조할 고유 이름. **중복되면 안 됩니다.** kebab-case 권장 |
| ③ `component` | **반드시 `() => import(...)` 형태**로 작성 (지연 로딩 → 초기 로딩 속도 유지) |
| ④ `meta.layout` | `PortalLayout` / `MainLayout` / `DefaultLayout` 중 하나. **생략 시 `DefaultLayout`** |
| ⑤ `meta.title` | 화면 제목 |

`meta.layout` 선택 기준:

| 값 | 붙는 것 | 용도 |
| --- | --- | --- |
| `PortalLayout` | 포털 헤더 + GNB + 푸터 | **지역경찰포털 화면 (기본값처럼 사용)** |
| `MainLayout` | 사이드 메뉴형 관리자 레이아웃 | 컴포넌트 샘플, 관리자 화면 |
| `DefaultLayout` | 없음 (빈 골격) | 로그인 등 단독 화면 |

### 3-2. 새 페이지 추가 절차

**① 화면 파일 생성** — `src/views/` 아래, URL 계층과 맞춰서 만듭니다.

```
src/views/lpo/notebook/NotebookWrite.vue      →  /lpo/notebook/write
```

```html
<template>
  <div class="container notebook-write">
    <div class="inner">
      <nav id="breadCrumb" class="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><RouterLink to="/">홈</RouterLink></li>
          <li><RouterLink to="/lpo/notebook">개인수첩</RouterLink></li>
          <li aria-current="page">인수인계 작성</li>
        </ol>
      </nav>

      <!-- 화면 내용 -->
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
/* 1rem = 10px */
</style>
```

**② 라우트 등록** — [src/router/index.ts](src/router/index.ts) 의 `routes` 배열에 추가합니다.

```ts
        {
            path: '/lpo/notebook/write',
            name: 'lpo-notebook-write',
            component: () => import('../views/lpo/notebook/NotebookWrite.vue'),
            meta: {
                layout: 'PortalLayout',
                title: '인수인계 작성'
            }
        },
```

> ⚠️ **`/:pathMatch(.*)*` (notFound) 항목보다 위에 추가**해야 합니다.
> 맨 아래 404 라우트는 모든 경로를 잡아내므로, 그 아래에 넣으면 화면이 뜨지 않습니다.

**③ 확인** — 개발 서버가 떠 있다면 자동 반영됩니다. 브라우저에서 `http://localhost:8081/lpo/notebook/write` 접속.

### 3-3. 화면 간 링크 거는 방법

**`<a href>` 대신 `<RouterLink to>` 를 사용합니다.** 페이지 전체를 새로 불러오지 않아 훨씬 빠릅니다.

```html
<!-- ✅ 내부 화면 이동 -->
<RouterLink to="/lpo/notebook">개인수첩</RouterLink>

<!-- ✅ 클래스는 그대로 붙일 수 있습니다 (Main.vue 실제 예시) -->
<RouterLink to="/lpo/notebook" class="service-bnr note">
  <strong class="title">개인 수첩</strong>
</RouterLink>

<!-- ✅ 라우트 이름으로 이동 (경로가 바뀌어도 안전) -->
<RouterLink :to="{ name: 'lpo-notebook' }">개인수첩</RouterLink>

<!-- ✅ 파라미터 / 쿼리 전달 → /lpo/notebook?page=2 -->
<RouterLink :to="{ name: 'lpo-notebook', query: { page: 2 } }">2페이지</RouterLink>

<!-- ✅ 외부 사이트는 일반 a 태그 -->
<a href="https://www.police.go.kr" target="_blank" rel="noopener">경찰청</a>
```

`RouterLink` 는 전역 등록되어 있어 **`import` 없이 바로 사용**할 수 있습니다.
현재 화면과 일치하는 링크에는 `router-link-active` / `router-link-exact-active` 클래스가 자동으로 붙으므로,
활성 메뉴 스타일은 이 클래스로 처리하면 됩니다.

**버튼 클릭 등 스크립트로 이동**할 때는 `useRouter()` 를 씁니다.

```html
<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const onCreate = () => {
  router.push('/lpo/notebook/write')          // 이동
  // router.push({ name: 'lpo-notebook-write' })
  // router.back()                            // 뒤로가기
}
</script>

<template>
  <button type="button" class="btn btn-primary" @click="onCreate">인수인계 작성</button>
</template>
```

> **아직 화면이 없는 링크**는 원본 마크업을 유지하면서 이동만 막아두세요.
> `<a href="#" @click.prevent>` — `.prevent` 가 없으면 페이지 최상단으로 스크롤됩니다.

### 3-4. GNB 메뉴에 연결하기

**① 메뉴 항목(텍스트/계층)은 데이터로 관리합니다.**
[src/components/layout/portal/portalMenu.ts](src/components/layout/portal/portalMenu.ts) 를 수정하면
[PortalHeader.vue](src/components/layout/portal/PortalHeader.vue) 의 마크업이 `v-for` 로 그대로 반복 출력합니다.

```ts
const commonDepth2: PortalMenuDepth2[] = [
  {
    title: '개인수첩',
    path: '/lpo/notebook',          // ← 이동 경로
    groupTitle: '인수인계',
    children: [
      { title: '인수인계 작성', path: '/lpo/notebook/write' },
      { title: '인수인계 현황' },
      { title: '차량점검' },
    ],
  },
]
```

**② 단, 현재 헤더 마크업은 `path` 를 아직 사용하지 않습니다.**
GNB 링크는 전부 `<a href="" @click.prevent>` (이동 없음) 상태이므로,
실제로 이동시키려면 [PortalHeader.vue](src/components/layout/portal/PortalHeader.vue) 에서
해당 `<a>` 를 아래처럼 바꿔야 합니다. **클래스명은 그대로 유지**하세요.

```html
<!-- 변경 전 (depth2 기준) -->
<a href="" class="detpth2-text" @click.prevent>{{ depth2.title }}</a>

<!-- 변경 후: path 가 있으면 이동, 없으면 기존 동작 유지 -->
<RouterLink v-if="depth2.path" :to="depth2.path" class="detpth2-text">
  {{ depth2.title }}
</RouterLink>
<a v-else href="" class="detpth2-text" @click.prevent>{{ depth2.title }}</a>
```

depth1 / depth3 도 동일한 패턴으로 처리합니다.

---

## 부록

### A. 폴더 구조 (퍼블리셔 기준)

```
police-scaffold/
├── index.html                     ★ CSS 레이어 순서, 원본 CSS/JS 로드
├── public/portal/                 ★ 퍼블리싱 자산 (원본 무수정)
│   ├── police-entry.css               원본 CSS 진입점
│   └── asset/{css,images,fonts,js}/
├── reference-publisher/           ☞ 퍼블리싱 원본 HTML (참고용, 빌드 제외)
├── src/
│   ├── router/index.ts            ★ 라우트 정의
│   ├── views/                     ★ 화면 파일
│   │   ├── Main.vue                   포털 메인
│   │   ├── lpo/notebook/              지역경찰 > 개인수첩
│   │   └── component-sample/          공통 컴포넌트 샘플
│   ├── components/
│   │   ├── layout/                ★ 레이아웃 / 헤더 / 푸터 / GNB 데이터
│   │   ├── ui/                        shadcn-vue 컴포넌트
│   │   └── custom/                    공통 커스텀 컴포넌트 (테이블 등)
│   ├── assets/css/style.css       ★ Tailwind 진입점 + rem 스케일 보정
│   └── types/swiper.d.ts              전역 Swiper 타입 선언
└── vite.config.ts                     dev 서버 / 프록시 / 에셋 처리 설정
```

`★` = 퍼블리셔가 주로 다루는 파일

### B. 자주 겪는 문제

| 증상 | 원인 / 해결 |
| --- | --- |
| 이미지가 안 나옴 | 경로가 상대경로. `/portal/asset/images/...` 절대경로로 수정 |
| 스타일이 안 먹음 | 클래스명이 원본과 다름. 또는 `<style scoped>` 없이 다른 파일에 작성 |
| Tailwind 글자 크기가 이상함 | `src/assets/css/style.css` 의 `@theme` 스케일 보정 확인 |
| 테이블 컬럼 폭이 무시됨 | `table-layout: fixed` 때문. `<colgroup>` 으로 지정 |
| 콘솔에 `swiper-bundle.min.js 가 로드되지 않았습니다` | `public/portal/asset/js/common/swiper-bundle.min.js` 존재 여부 확인 |
| 새 페이지가 404로 나옴 | 라우트를 `notFound` 항목 **아래**에 추가했는지 확인 |
| 포커스 아웃라인이 안 보임 | 원본 reset 오타 이슈. 해당 페이지 `<style scoped>` 에서 `:focus-visible` 보완 |
| `pnpm install` 후 동작이 이상함 | `node_modules`, `package-lock.json` 삭제 후 `pnpm install` 재실행 |

### C. 참고 자료

- [Vue 3 공식 문서](https://vuejs.org/) / [Vue Router](https://router.vuejs.org/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Swiper 공식 문서](https://swiperjs.com/)
- [TailwindCSS](https://tailwindcss.com/) / [shadcn-vue](https://www.shadcn-vue.com/)
- [MDN — CSS @layer](https://developer.mozilla.org/ko/docs/Web/CSS/@layer)
