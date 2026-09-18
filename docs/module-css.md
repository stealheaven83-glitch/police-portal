# 컴포넌트가 들고 오는 `*.module.css`

CSS 를 찾을 때 보는 곳은 공통 세 파일(`police-style` · `police-common` · `police-override`)만이
아니다. **쓰기로 한 컴포넌트가 자기 `*.module.css` 를 같이 데려오는 경우가 있고, 그 파일도
참고 대상이다.**

> 규칙 본문은 `CLAUDE.md` §2 다. 이 문서는 **어느 컴포넌트가 무엇을 들고 오는지**를 적은
> 참고 문서다. 둘이 어긋나면 `CLAUDE.md` 가 이긴다.

---

## 1. 왜 따로 봐야 하나 — 두 가지가 조용히 틀어진다

**① 이미 있는 걸 또 만든다.** `scripts/css-find.cjs` 는 공통 세 파일만 훑는다(`DIR` 이
`public/portal/asset/css/common` 하나로 고정돼 있다). module.css 는 **스크립트에 안 잡힌다** —
"없다"고 나와도 컴포넌트 쪽에 있을 수 있다.

**② 만들어도 안 먹는다.** module.css 는 `@layer` **밖**이라 레이어 있는 스타일을 전부 이긴다.
`police-common.css` 는 물론 `police-override.css`(layer(screen))로도 **못 덮는다. 특정도를 올려도
안 된다.** 그래서 "분명히 클래스를 만들었는데 화면이 그대로"인 상황이 나온다.

덮어야 할 때 방법은 셋뿐이다(`component-guide.md` §6 의 ⚠ 와 같은 내용):

| | 방법 | 언제 |
|---|---|---|
| ① | 컴포넌트가 **노출한 CSS 변수**를 클래스로 재정의 | 변수가 있으면 **이게 정답이다** |
| ② | `!important` | 변수가 없고 급할 때 |
| ③ | 컴포넌트 수정 | 여러 화면이 같이 바뀌어야 할 때 |

①은 `police-override.css` 에 변수를 덮는 클래스를 만들어 `class` 로 입힌다 — 인라인 style 로
덮지 않는다(`CLAUDE.md` §1).
```css
/* police-override.css */
.lp-info-wide-label { --info-label-w: 18rem; }
```

---

## 2. 지금 module.css 를 가진 공통 컴포넌트

`src/components/**` 전체에서 두 개뿐이다. **새 세션에서 이 표를 믿지 말고 다시 센다** —
3명이 동시 작업이라 는다(`CLAUDE.md` §1):
```bash
find src/components -name "*.module.css"
```

| 파일 | 쓰는 컴포넌트 | 클래스 | 노출 변수 |
|---|---|---|---|
| `custom/info-table/InfoTable.module.css` | `InfoTable` · `InfoField` | 37개 | `--info-label-w`(기본 `14rem`) |
| `custom/flex-grid/FlexGrid.module.css` | `FlexRow` · `FlexCol` | 2개(`.row` `.col`) | `--flex-col-min-w`(기본 `20rem`) |

### `InfoTable.module.css` — 라벨-값 표
클래스 **37개**(이름 기준)가 역할별로 이렇게 나뉜다. 선언 줄은 46개인데 같은 선택자가 두 번
나오는 자리가 있어서다(아래 ⚠ 참고). **이름만 보고 짐작하지 말고 파일을 열어 확인한다**:
```bash
grep -nE "^\.[a-zA-Z-]" src/components/custom/info-table/InfoTable.module.css
```
⚠ 이 grep 은 줄 맨 앞만 보므로 **미디어쿼리 안의 클래스가 안 잡힌다**(`.grid-mo-*` `.field-mo-col`).
반응형까지 보려면 `grep -nE "^\s*\.[a-zA-Z-]"` 로 훑는다.

| 묶음 | 클래스 |
|---|---|
| 표 틀 | `.grid` `.cols1` `.cols2` `.cols3` `.cols4` |
| 모바일(<1600) | `.grid-mo-cols1` ~ `.grid-mo-cols4` `.field-mo-col` — 컴포넌트가 prop 으로 붙인다(`mo-columns` / `mo`). 화면에서 직접 쓰지 않는다 |
| 칸 | `.field` `.fieldFull` `.fieldRowSpan2` |
| 칸 안 | `.label` `.control` `.controlColumn` |
| 필수·안내 | `.requiredDot` `.legend` `.hint` `.hintSuccess` |
| 표 위아래 버튼줄 | `.toolbar` `.deptGroup` `.toggleButton` `.list-actions` `.info-table-actions` |
| 팝업 안 표 | `.popTable` `.tempVehicleRow` `.searchRow` `.searchInput` |
| 값 표현 | `.info-table-txt` `.info-table-radio` `.info-table-divided` `.flex-wrap` `.disclaimerStrong` `.info-table-value-row` `.info-table-hyphen` `.info-table-unit` |

**⚠ 이 파일은 컴포넌트 전용이 아니다.** 화면 40곳이 직접 import 해서 쓴다:
```ts
import styles from '@/components/custom/info-table/InfoTable.module.css'
```
`styles.requiredDot` 만 61곳이다. 그래서 **여기 있는 클래스를 고치면 40개 화면이 같이 바뀐다** —
값을 바꾸지 말고 `CLAUDE.md` §2 ① 의 "부분 일치" 처럼 **차이나는 선언만** 새 클래스로 덧붙인다.

### `FlexGrid.module.css` — 범용 행/열
`.row` `.col` 둘뿐이다. 칸 폭은 `--flex-col-min-w` 로 바꾼다.

> ⚠ 이 파일의 주석과 `flex-grid.vue`(8곳)는 **인라인 style 로 변수를 덮으라고 안내/구현 중이다.**
> `CLAUDE.md` §1 위반이고 미수정 상태다 — **새로 쓸 때 따라 하지 않는다.** 클래스로 덮는다.

---

## 3. 그래서 CSS 를 찾는 순서는 이렇게 된다

`CLAUDE.md` §2 ① 의 세 단계(선언 → 이름 → 의도) **앞에 한 단계가 붙는다.**

```
스타일이 필요하다
  │
  ├─ 0단계. 이 자리에 쓰기로 한 컴포넌트가 module.css 를 부르나?
  │     ├─ 예 → 그 파일을 먼저 연다
  │     │        ├─ 거기 있다        → 그대로 쓴다 (styles.xxx)
  │     │        ├─ 값만 다르다      → 노출 변수가 있나? → 있으면 변수를 덮는 클래스(override)
  │     │        └─ 없다             → 1단계로
  │     └─ 아니오 → 1단계로
  │
  └─ 1~3단계. 공통 세 파일에서 선언 → 이름 → 의도 (CLAUDE.md §2 ①)
```

**0단계를 건너뛰면** `css-find.cjs` 가 "없음"이라 해서 새로 만들었는데, 그게 module.css 를
못 이겨서 안 먹는다. 실제로 겪는 순서가 이것이다.

---

## 4. 새로 만들 때

- **화면 폴더에 `style/*.module.css` 를 새로 만들지 않는다**(`CLAUDE.md` §3). 스타일은 공통
  세 파일이다. 기존 9개(`views/**/style/`)는 그대로 둔다.
- **공통 컴포넌트를 새로 만들면서** 그 컴포넌트에 딸린 스타일이 필요하면 그 폴더의
  `*.module.css` 가 맞다(`CLAUDE.md` §2). 만들 땐 **`@layer` 밖이라 아무도 못 덮는다**는 걸
  전제로, 화면이 바꿔야 할 값은 **CSS 변수로 노출한다**(`--info-label-w` 처럼).
- **클래스명은 케밥케이스다. `*.module.css` 도 예외가 아니다**(`CLAUDE.md` §2).

### 지금 상태 — 카멜케이스가 섞여 있다
`InfoTable.module.css` 는 카멜(`.fieldFull` `.controlColumn` `.requiredDot` `.hintSuccess`
`.popTable` …)과 케밥(`.info-table-txt` `.list-actions` …)이 섞여 있다. **개명하지 않는다** —
40개 화면이 `styles.requiredDot` 로 꺼내 쓰고 있어 얻는 것보다 충돌 비용이 크다(`CLAUDE.md` §1).
**새로 추가하는 줄만 케밥으로 쓴다.**

같은 선택자가 두 번 나오는 자리도 있다(`.toolbar` `.deptGroup` `.toggleButton` `.popTable`
`.tempVehicleRow` `.searchInput` 등이 파일 안에서 두 번 선언된다). 고치지 말고 **읽을 때 뒤쪽
선언이 이긴다**는 것만 알고 본다 — 앞쪽만 보고 값을 판단하면 틀린다.
