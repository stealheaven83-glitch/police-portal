# 화면 검토 규칙 (공통)

새로 만든 화면을 검토할 때 이 문서의 항목을 순서대로 확인한다.
**모든 화면에 똑같이 적용되는 공통 규칙이다** — 화면별 검토 *결과*는 `docs/review-{화면ID}.md` 로 따로 남긴다.

---

## 범위 — 퍼블만 본다

**본다**
- 마크업·스타일·컴포넌트 선택
- 화면 안에서 끝나는 동작: **탭 전환**, **팝업 열림/닫힘**

**안 본다**
- 저장이 목록에 반영되는지, 유효성 검사, 실제 삭제 — 개발팀 몫이다
- LNB 활성표시(`openIndex`·`activeChild`) — `presets.ts` 에 `path` 를 채우면
  `useSideMenuSetup` 의 `syncActiveByRoute()` 가 자동으로 처리한다.
  화면마다 사람이 대조할 일이 아니라 **프리셋 배치 작업으로 없앤다**(§4·§5).

동작이 비어 있다고 무조건 감점하지 않는다. Figma 에 안 그려진 동작은 비워둬도 되고,
그 사실이 인계 메모에 적혀 있으면 통과다(CLAUDE.md 서두).

---

## 검토 항목

### 1. 컴포넌트를 최대한 썼는가
직접 만든 마크업이 공통 컴포넌트로 대체 가능한지 본다.
특히 **raw `<table>`**, 직접 짠 **`display:grid` 분할**, 손으로 만든 **패널 박스**가 자주 나온다.

- 표 → `TableWrapper` / `TabulatorGrid`
- 라벨-값 폼 → `InfoTable` + `InfoField`
- 화면 분할 → `LayoutSplit` + `LayoutPanel`
- 팝업 → `GenericDialog2`

`component-guide.md` 의 케이스 표로 대조한다.

```bash
# 화면 폴더에 raw 태그가 직접 쓰였는지
grep -rnE '<(table|thead|tbody)\b' src/views/{도메인}/{화면ID}/
```

### 2. 스타일이 `police-style.css` 공통에 있는 걸 썼는가
색·여백·모서리를 화면에서 새로 정의하지 않았는지 본다.
hex 하드코딩이 있으면 토큰(`var(--Text-body_1)`)으로 바꿔야 한다.
`.search-area` `.list-actions` `.btn-wrap` `.group-gap2` 같은 공통 클래스가 있는데
같은 역할을 새로 만들지 않았는지도 같이 본다. 목록은 `component-guide.md` §12.

### 3. 공통에 없으면 `styles.css` 에 추가했는가
- 화면 폴더에 **`style/*.module.css` 를 새로 만들지 않았는가**
- 화면 전용 CSS 가 `public/portal/asset/css/common/styles.css` 에 있는가
- **인라인 `style=` 이 없는가** (컴포넌트 CSS 변수를 덮을 때도 클래스로 한다)

```bash
ls src/views/{도메인}/{화면ID}/style 2>/dev/null && echo '❌ style/ 폴더 있음'
grep -rn 'style="' src/views/{도메인}/{화면ID}/
```

### 4. 명명·위치 규칙대로 넣었는가
`styles.css` 에 추가했다면:

- 클래스명이 **`.{화면ID 소문자}-{역할}`** 인가 — `.pc-lpo-0601-map` (역할부는 kebab-case)
- 프리픽스 없는 이름(`.wrapper`, `.vehicle-112-popup-input-title`)이 없는가
- **자기 화면ID 블록** 안에 있는가, 그 블록이 **화면ID 오름차순** 자리에 끼워졌는가
- 남의 블록을 건드리지 않았는가

```bash
grep -n '^/\* ──' public/portal/asset/css/common/styles.css   # 블록 순서 확인
```

### 5. 화면 템플릿에 테일윈드가 있는가 (없어야 한다)
**일반 HTML 태그(`<div>` `<span>` `<p>`)에 붙은 테일윈드는 위반.**
이름 있는 클래스로 `styles.css` 에 뽑는다.

**예외 — 컴포넌트에 넘기는 `class` 는 허용한다.**
```html
<div class="flex gap-2 mt-4">        <!-- ❌ 일반 태그 -->
<InputField2 inputClass="w-40" />    <!-- ✅ 컴포넌트 -->
<Tabs class="my-5">                  <!-- ✅ 컴포넌트 -->
```

테일윈드 문자열을 JS 변수·computed 에 담아 `:class` 로 바인딩하는 것도 위반이다.

### 6. 블록 순서 — `<template>` 먼저, `<script setup>` 나중
`.vue` 파일의 최상위 블록은 **이 순서로 고정한다.**

```
1  <template>
2  <script setup lang="ts">
3  <style>          ← 쓰지 않는다
```

**`<style>` 블록은 화면에 두지 않는다.** 화면 전용 CSS 는 `styles.css` 로 간다(항목 3·4).
순서만 지키고 3번은 아예 없는 게 정상이다.

화면 파일과 그 폴더의 `components/` 팝업까지 같은 순서로 맞춘다 — 한 폴더 안에서 갈리면
파일을 열 때마다 어디를 봐야 할지 다시 찾게 된다.

```bash
# 첫 블록이 template 인지 확인
grep -n '^<script setup|^<template' 화면.vue | head -1
```

> **현황**: 2026-09-03 에 화면·화면전용 컴포넌트 **62개를 일괄 정리**해 전부 이 순서다.
> 기준 파일 `PC-LPO-0215` 도 포함된다. 샘플·포털 페이지(`component-sample/` 등)는 검토 대상이
> 아니라 그대로 뒀다. **만들 때 보는 규칙은 `CLAUDE.md` §1-1 에도 있다.**

### 7. `PC-LPO-0215` 와 코드 스타일이 같은가
기준 파일은 **`src/views/lpo/PC-LPO-0215/PC-LPO-0215.vue` 하나**다.
화면 유형이 달라도 코드 스타일은 이 하나를 따른다.

| | 기준 |
|---|---|
| 줄 끝 세미콜론 | 안 쓴다 |
| 함수 | `function onSave() {}` (화살표 상수 아님) |
| import 순서 | vue → 외부 라이브러리 → 공통 컴포넌트 → 화면 composable → menu/tab |
| 검색 옵션 | composable 에 `export const xxxOptions` 로 두고 화면에서 import |

> 블록 순서는 항목 6 이 따로 정한다 — 이 표에는 없다.

### 8. 탭 전환·팝업 열림/닫힘이 동작하는가
실제로 눌러본다.

- 탭을 다 눌러 그리드 컬럼·데이터가 바뀌는가
- 팝업을 열고 닫는 버튼이 전부 동작하는가 (닫기·X·ESC)
- 팝업 안에서 여는 하위 팝업도 열리는가
- 버튼이 **아무 일도 안 하는 게 아니라 의도적으로 비어 있는가** — 인계 메모 확인

---

## 결과 남기기

발견한 것은 `docs/review-{화면ID}.md` 에 번호를 붙여 적는다(예: `docs/review-PC-LPO-0701.md`).
**고치지 않고 목록만 남긴다** — 고치는 건 별도 작업이다.

구획은 이 순서로 나눈다. 위에서부터 급한 것이다.

1. **동작 오류** — 눌러보면 기대와 다르게 동작하는 것
2. **일관성·데이터** — 화면마다 말이 갈리거나 목업 값이 성립하지 않는 것
3. **죽은 코드** — 선언만 있고 아무도 안 쓰는 것
4. **규칙 위반** — 위 1~7번에 걸린 것
5. **확인 필요** — 퍼블 범위상 비어 있는 게 정상일 수 있는 것
6. **확인했고 문제 없는 것** — 의심스럽지만 의도된 설계. 다음 사람이 다시 안 파도록 적는다

6번을 빠뜨리지 않는다. 이게 없으면 다음 검토자가 같은 곳을 또 판다.
