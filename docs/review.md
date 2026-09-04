# 화면 검토 규칙 (공통)

새로 만든 화면을 검토할 때 이 문서의 항목을 순서대로 확인한다.
**모든 화면에 똑같이 적용된다** — 화면별 검토 *결과*는 `docs/review-{화면ID}.md` 로 따로 남긴다.

> **규칙 본문은 여기 없다.** 무엇이 옳은지는 `CLAUDE.md` 에만 적혀 있고, 이 문서는
> **"그중 무엇을 어떤 순서로 확인하는가"** 만 말한다. 두 곳에 같은 규칙을 적으면 한쪽만 고쳐졌을 때
> 어느 게 최신인지 갈린다(CLAUDE.md §0 과 같은 이유). 판단이 애매하면 옆의 §참조를 펼친다.

---

## 범위 — 퍼블만 본다

**본다**
- 마크업·스타일·컴포넌트 선택
- 화면 안에서 끝나는 동작: **탭 전환**, **팝업 열림/닫힘**

**안 본다**
- 저장이 목록에 반영되는지, 유효성 검사, 실제 삭제 — 개발팀 몫이다
- LNB 활성표시(`openIndex`·`activeChild`) — `presets.ts` 에 `path` 를 채우면
  `useSideMenuSetup` 의 `syncActiveByRoute()` 가 자동으로 처리한다.
  화면마다 사람이 대조할 일이 아니라 **프리셋 배치 작업으로 없앤다**(CLAUDE.md §4·§5).

동작이 비어 있다고 무조건 감점하지 않는다. Figma 에 안 그려진 동작은 비워둬도 되고,
그 사실이 인계 메모에 적혀 있으면 통과다(CLAUDE.md 서두).

---

## 검토 항목 8개

`{화면ID}` `{도메인}` 은 실제 값으로 바꿔 쓴다(`src/views/lpo/PC-LPO-0801/` 식).

### 1. 컴포넌트를 최대한 썼는가 → 규칙 CLAUDE.md §1 · `component-guide.md`
직접 짠 마크업이 공통 컴포넌트로 대체되는지 본다. **자주 걸리는 셋**: raw `<table>`,
직접 짠 `display:grid`/`flex` **화면 분할**, 손으로 만든 **패널 상자 + 제목 바**.
(표→`TabulatorGrid`, 라벨-값 폼→`InfoTable`+`InfoField`, 분할→`LayoutSplit`+`LayoutPanel`,
팝업→`GenericDialog2`. 케이스별 대조는 `component-guide.md`.)

```bash
grep -rnE '<(table|thead|tbody)\b' src/views/{도메인}/{화면ID}/
grep -rnE 'display: *(grid|flex)' public/portal/asset/css/common/styles.css   # 해당 화면 블록만
```

### 2. 공통 CSS 를 썼는가 → 규칙 CLAUDE.md §1 ①② · 목록 `component-guide.md` §12
- hex 하드코딩 없이 토큰(`var(--Text-body_1)`)을 쓰는가
- `.search-area` `.list-actions` `.btn-wrap` `.group-gap2` 같은 **같은 역할의 공통 클래스**를
  두고 새로 만들지 않았는가
- **`police-style.css` 에 새로 올렸거나 고쳤다면 `component-guide.md` §12 표에 등재했는가**
  ← 빠뜨리기 제일 쉽고, 빠뜨리면 다음 사람이 공통을 못 찾아 또 만든다

> `styles.css` 에 비슷한 게 있는지는 **찾지 않는다.** 거기는 승격 대기 저장소라 중복이 정상이다.

### 3. 화면 전용 CSS 위치 → 규칙 CLAUDE.md §1-2
- 화면 폴더에 **`style/*.module.css` 를 새로 만들지 않았는가**
- 화면 전용 CSS 가 `public/portal/asset/css/common/styles.css` 에 있는가
- **인라인 `style=` 이 없는가**(컴포넌트 CSS 변수를 덮을 때도 클래스로 한다)

```bash
ls src/views/{도메인}/{화면ID}/style 2>/dev/null && echo '❌ style/ 폴더 있음'
grep -rn 'style="' src/views/{도메인}/{화면ID}/
```

### 4. 클래스 명명·블록 위치 → 규칙 CLAUDE.md §1-2
- `.{화면ID 소문자}-{역할}` 프리픽스인가 (`.pc-lpo-0601-map`)
- **카멜케이스가 없는가** — `.detailLayout` `.photoBox` 는 파일 종류와 무관하게 금지
- 자기 화면ID 블록 안에 있고, 그 블록이 **화면ID 오름차순 자리**에 끼워졌는가
- 남의 블록을 건드리지 않았는가

```bash
grep -n '^/\* ──' public/portal/asset/css/common/styles.css        # 블록 순서
grep -nE '^\s*\.[a-z0-9-]*[a-z][A-Z]' public/portal/asset/css/common/styles.css   # 카멜
```

### 5. 화면 템플릿에 테일윈드가 없는가 → 규칙 CLAUDE.md §1
일반 태그(`<div>` `<span>`)에 붙은 것과, JS 변수·computed 에 담아 `:class` 로 바인딩한 것이 위반.
**컴포넌트에 넘기는 `class`/`input-class` prop 은 허용**(`<InputField2 input-class="w-40" />`).

### 6. 블록 순서 → 규칙 CLAUDE.md §1-1 2번
`<template>` 먼저, `<script setup>` 나중. **`<style>` 블록은 두지 않는다.**
화면 파일과 그 폴더의 `components/` 팝업까지 전부 같은 순서다.

```bash
head -1 src/views/{도메인}/{화면ID}/{화면ID}.vue        # <template> 이어야 한다
```

### 7. 코드 스타일이 `PC-LPO-0215` 와 같은가 → 규칙 CLAUDE.md §1-1
기준 파일은 `src/views/lpo/PC-LPO-0215/PC-LPO-0215.vue` 하나다. 화면 유형이 달라도 이걸 따른다.
줄 끝 세미콜론 없음 / 화살표 상수 아닌 `function` 선언 / import 순서(vue → 외부 → 공통 컴포넌트 →
화면 composable → menu·tab) / 검색 옵션은 composable 에 `export const xxxOptions`.

> 여기 걸린 건 **동작에 영향이 없다**(import 순서는 에러를 내지 않는다). 우선순위 낮게 잡는다.

### 8. 탭 전환·팝업 열림/닫힘이 동작하는가
**이 항목만 검토 전용이다** — 실제로 눌러본다.

**보는 건 탭과 팝업뿐이다.** 이 둘은 화면 구조·라우팅과 얽혀 있어서 안 열리면 화면 자체가
성립하지 않는다. 그 밖의 버튼(조회·저장·검색 아이콘 등)이 비어 있는 것은 이 항목이 아니다 —
동작은 개발팀이 잇는 것이고, 퍼블은 열리고 닫히는 것까지다.

- 탭을 다 눌러 그리드 컬럼·데이터가 바뀌는가
- 팝업을 열고 닫는 버튼이 전부 동작하는가 (닫기·X·ESC), 팝업 안에서 여는 하위 팝업도
- 팝업을 **다시 열었을 때** 이전 선택·입력이 남지 않는가

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

**재검토(2차 이상)일 때**는 앞머리에 "1차 이후 처리된 것" 표를 두고, 해결된 항목은 지우지 말고
✅ 로 표시해 남긴다. 무엇이 고쳐졌고 무엇이 남았는지 한눈에 보이게 하려는 것이다.
