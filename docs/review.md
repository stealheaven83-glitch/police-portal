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
grep -rnE 'display: *(grid|flex)' public/portal/asset/css/common/police-common.css
```

### 2. 공통 CSS 를 **찾아보고** 썼는가 → 규칙 CLAUDE.md §1 ①② · 목록 `component-guide.md` §12

**화면 전용 CSS 는 없다.** 한 화면만 쓰더라도 공통 파일에 공통 이름으로 만든다. "나중에 승격"도
없으니 **중복은 더 이상 정상이 아니다 — 발견하면 지적한다.**

찾는 절차가 세 단계(**선언 → 이름 → 의도**)라, 검토도 세 단계를 다 밟았는지 본다.

- **① 선언으로 찾았는가** — 새로 만든 클래스의 선언을 그대로 넣어 돌려본다.
  완전 일치가 나오면 **왜 새로 만들었는지**가 인계 메모에 있어야 한다(의도가 달라서라면 통과).
  ```bash
  node scripts/css-find.cjs "flex:1; min-height:0; overflow-y:auto"
  ```
- **② 이름으로 찾았는가** — `.search-area` `.list-actions` `.btn-wrap` `.group-gap2` 처럼
  **같은 역할의 공통 클래스**를 두고 새로 만들지 않았는가.
- **③ 의도가 맞는가** — 값이 같다고 아무거나 가져다 쓰지 않았는가.
  `.detail-scroll`(상세 패널 **안쪽**)과 `.lp-page-scroll`(**페이지 본문**)처럼 선언이 같아도
  의도가 다른 쌍이 있다. **의도가 다른데 재사용한 것도 지적 대상이다** — 한쪽이 값을 바꾸면
  다른 화면이 같이 깨진다.
- **부분 일치인데 통째로 새로 만들지 않았는가** — 기존 클래스 + 차이나는 선언만 덧붙이는 게 맞다
  (`class="detail-scroll lp-panel-pad"`). 기존 클래스를 **고쳐서** 맞춘 것은 더 큰 지적이다.
- hex 하드코딩 없이 토큰(`var(--Text-body_1)`)을 쓰는가
- **§12 표에 등재했는가 — 의도 칸까지 채웠는가**
  ← 빠뜨리기 제일 쉽다. 클래스명만 있는 줄은 다음 사람이 ③을 못 해서 오용한다.

### 3. CSS 를 어느 파일에 넣었는가 → 규칙 CLAUDE.md §1-2

| 파일 | 기입 | 무엇이 들어가야 하나 |
|---|---|---|
| `police-style.css` | ❌ | 퍼블리싱 원본. **여기에 추가했으면 지적** |
| `police-common.css` | ✅ | 기본값. 대부분 여기 |
| `police-override.css` | ✅ | 컴포넌트·라이브러리·테일윈드를 **덮는 것만** |

- **`police-style.css` 에 새 규칙을 넣지 않았는가** (읽기 전용)
- **override 에 일반 스타일이 들어가지 않았는가** — 덮을 이유가 없는데 여기 있으면,
  다음 사람이 "왜 여기 있지"를 판단할 수 없게 된다. 반대로 **덮어야 하는 걸 common 에 넣어**
  안 먹고 있는 것도 본다(레이어에 밀린다).
- 화면 폴더에 **`style/*.module.css` 를 새로 만들지 않았는가**
- **인라인 `style=` 이 없는가**(컴포넌트 CSS 변수를 덮을 때도 클래스로 한다)

```bash
git diff --stat public/portal/asset/css/common/police-style.css   # 변경 있으면 지적
ls src/views/{도메인}/{화면ID}/style 2>/dev/null && echo '❌ style/ 폴더 있음'
grep -rn 'style="' src/views/{도메인}/{화면ID}/
```

### 4. 클래스 명명 → 규칙 CLAUDE.md §1-2

- **`.lp-{역할}` 인가.** `lp` 접두사가 없으면 지적 — 원본이 `card` `title` `value` `wrap` 같은
  범용어 159개를 점유하고 있고, 우리 파일이 뒤에 로드돼 **우리가 이기므로** 겹치면 포털 화면이
  조용히 깨진다.
- **화면ID가 이름에 들어가지 않았는가** (`.pc-lpo-0601-map` ❌ → `.lp-map-frame` ✅)
- **이름이 너무 넓지 않은가** — `.lp-main` `.lp-box` 처럼 아무 데나 붙일 수 있는 이름은,
  다음 사람이 의도를 확인하지 않고 갖다 쓰게 만든다.
- **카멜케이스가 없는가** — `.detailLayout` `.photoBox` 는 파일 종류와 무관하게 금지

```bash
grep -n '^\.' public/portal/asset/css/common/police-common.css | grep -v '\.lp-'   # 접두사 없는 것
grep -n '^\.' public/portal/asset/css/common/police-override.css | grep -v '\.lp-'
grep -nE '^\s*\.[a-z0-9-]*[a-z][A-Z]' public/portal/asset/css/common/police-*.css  # 카멜
grep -nE '\.(pc|pm|mo)-[a-z]{3}-[0-9]{4}-' public/portal/asset/css/common/police-*.css  # 화면ID
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
