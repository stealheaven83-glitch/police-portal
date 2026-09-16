# 프로젝트 작업 규칙 (지역경찰포털)

이 파일은 매 세션 자동으로 실린다. 여기에는 **무엇이 옳은가(규칙)** 와 **어디로 갈지(분기)** 만
있다. **어떤 순서로 하는가(절차)** 는 §0 의 절차 문서에 있다 — 규칙과 절차를 한 파일에 두면
파일이 길어져 안 읽히고, 두 파일에 같은 규칙을 두면 한쪽만 고쳐졌을 때 어느 게 최신인지 갈린다.

## 범위 — **퍼블리싱이 메인**
화면 마크업·스타일·컴포넌트 구성이 우리 일이다. **실제 기능(API 연동, 서버 검증, 저장/삭제 처리)은
개발팀이 이어받는다.**

- 데이터는 composable 에 **목업**으로 둔다. 화면이 제대로 보이면 된다.
- **그래도 퍼블 범위인 것** — 잘못되면 화면이 틀리게 보이는 것: LNB 활성 표시, 브레드크럼,
  화면ID·라우트, 컴포넌트 선택, 공통 CSS, 반응형, 접근성(`label for`, `aria-*`).

**어디까지 짜나 — 화면 안에서 끝나는 건 짜고, 밖으로 나가는 건 안 짠다.**

| 짠다 (퍼블) | 안 짠다 (개발팀) |
|---|---|
| 목업 배열 필터링·정렬 | API 호출, 실제 저장/삭제 |
| 팝업 열기/닫기, 탭 전환, 체크박스 선택 | 서버 검증, 권한 처리 |
| `toast`·`dialog` 로 피드백 띄우기(§4) | 로그인 세션, 파일 실제 업로드 |
| 필수값이 비었는지 화면단 체크 | 중복 확인 같은 서버 대조 |

Figma 에는 동작이 안 그려져 있다. **사용자가 지정하지 않은 동작은 핸들러가 비어 있어도 버그가
아니다** — 억지로 만들지 말고 인계 메모에 적는다(`docs/create.md` §5). 사용자가 "저장 컨펌창"처럼
지정하면 그건 화면 동작이니 만든다(§4).

## 0. 분기 — 요청이 무엇인지 먼저 정하고, 그 문서를 편다

| 요청 | 먼저 편다 | 펴기 전에 이것만은 지킨다 |
|---|---|---|
| **새 화면 만들기** — Figma URL 이 오거나 "이 화면 만들어줘" | **`docs/create.md`** | 화면ID는 `screen-id-map.md` 에서 찾는다(직접 정하지 않는다). `router/index.ts`·`plannedRoutes.ts`·`presets.ts` 는 건드리지 않는다 |
| **검토** — "검토해줘", "이상한 거 있나 봐줘" | **`docs/review.md`** | 고치지 않고 `docs/review-{화면ID}.md` 에 목록만 남긴다 |
| **기존 화면 수정** — "여백 줄여줘", "컬럼 추가해줘" | 이 파일만 | §1~§5 가 그대로 걸린다. 수정 중에 새 팝업 파일을 만들면 §3 도 걸린다 |
| **공통 컴포넌트 새로 만들기** | `component-guide.md` §13 | 없다는 걸 먼저 알리고 승인받은 뒤 만든다(§1) |

요청이 둘에 걸치면(예: "만들고 검토까지") **만들기를 끝낸 뒤 검토를 별도로 시작한다** — 한 세션이
둘 다 하면 자기 논리를 그대로 다시 따라가서 못 잡는다(`docs/rationale.md`).

### 문서 지도 — 절차 문서 / 참고 문서

| 문서 | 무엇 | 언제 편다 |
|---|---|---|
| `docs/create.md` | **화면 생성 절차** — 시작 → 유형 판정 → 골격 → 채우기 → 인계. 유형별 세부는 `docs/create/*.md` 로 분기 | 새 화면 만들 때 |
| `docs/review.md` | **화면 검토 절차** — 항목 8개를 어떤 순서로 보는가 | 검토 요청을 받았을 때 |
| `docs/rationale.md` | **규칙이 왜 그런가** — 레이어 원리, `route.ts` 폐기 이력, 겪은 사고 | 규칙이 납득이 안 될 때. 판단에는 필요 없다 |
| `screen-id-map.md` | 화면명·Figma 프레임 이름 → **화면ID 대응표(284행)** | 화면ID를 확정할 때. **통째로 읽지 말고 `grep -n "무기" screen-id-map.md`** |
| `component-guide.md` | 케이스별 **"이럴 땐 이 컴포넌트"** · Figma instance 이름 역인덱스(§10) · **공통 CSS 클래스 표(§12)** · 그리드 사용법(§3) · 새 컴포넌트 house style(§13) | 화면에 뭘 붙일지 정할 때, CSS 를 만들기 전 |
| `docs/module-css.md` | 컴포넌트가 들고 오는 **`*.module.css`** — 어느 컴포넌트가 무엇을 갖고 있나, 노출 변수, 못 덮는 이유 | **컴포넌트를 쓰기로 정한 뒤 CSS 를 만들기 전**(§2 ① 0단계) |
| `menu-tab-guide.md` | LNB/하단탭/KeepAlive 가 **어떻게 동작하는지** | 그 동작이 궁금하거나 어긋날 때 |
| `README.md` | 퍼블리셔 온보딩(서버 구동·CSS 구성·포털 화면) | 개발 서버·리소스 배치가 궁금할 때 |

**규칙 본문은 이 파일에만 있다.** 절차 문서(`create.md`·`review.md`·`create/*.md`)는 "어떤 순서로
확인하는가"를 말하고, 옳고 그름의 판단은 이 파일의 §를 가리킨다. **그 밖의 문서에서 "이렇게
만들어라"를 읽으면 낡은 것이다 — 따르지 말고 알린다.** 실제 사례:
- `README.md` §3-2 "새 페이지 추가 절차"는 포털 화면(`/lpo/notebook/write` 같은 URL 계층 페이지)용이라
  화면ID 화면에는 해당 없다. 거기 적힌 대로 `router/index.ts` 에 직접 등록하면 `plannedRoutes` 와
  중복 등록된다. (README 는 팀 공용 문서라 우리가 고치지 않는다.)
- `FlexGrid.module.css` 주석과 `flex-grid.vue`(8곳)는 인라인 style 을 안내/구현 중이다 — §1 위반,
  미수정. 새로 쓸 때 따라 하지 않는다.

## 1. 컴포넌트 재사용
- 찾는 순서: `src/components/custom/**` → `src/components/ui/**`. 둘 다 없으면 **새로 만들기 전에
  없다는 걸 눈에 띄게 알린다** — 혼자 판단해 만들지 않는다.
- **있는 걸 놔두고 직접 짜지 않는다** (2026-09-14 추가). "최대한 쓴다"가 아니라 **있으면 쓴다**가
  기본이고, 못 쓰는 이유가 있을 때만 아래로 내려간다. 어느 칸인지 먼저 정하고 움직인다.

  | 못 쓰겠는 이유 | 이렇게 한다 |
  |---|---|
  | **모양만 다르다** | 컴포넌트를 그대로 쓰고 `police-override.css` 로 덮는다. layer(screen) 이라 컴포넌트 테일윈드를 특정도 싸움 없이 이긴다(§2) — `!important` 도 특정도 계산도 필요 없다 |
  | **마크업 구조가 달라야 한다** (`<ul><li>` 로 감싸야 한다 등) | 그 컴포넌트가 쓰는 하위 라이브러리(`reka-ui`)를 화면 폴더 `views/{화면}/components/` 에서 직접 조합한다. role·aria·키보드를 처음부터 다시 짜지 않는다 |
  | **기능이 아예 없다** | 위 줄대로 — 없다는 걸 알리고 승인받은 뒤 `custom/` 에 만든다 |

  **맨 바닥부터 다시 짜는 건 마지막 수단이다** — 역할(role)·상태(aria)·키보드 이동을 손으로
  맞춰야 하고 그건 조용히 틀린다. 실제 사례: 아이콘만 있는 버튼을 `.lp-icon-btn` CSS 로 만들어
  18곳이 쓰고 있었는데 `Button` 에 아이콘 전용 `size` 가 이미 있었고, 그 CSS 에는 포커스 링이
  없어 키보드로 위치가 안 보였다(2026-09-11 `variant="icon"` 으로 정리 — `component-guide.md` §8-2).
- **3명이 동시 작업이라 컴포넌트·CSS 목록이 세션 사이에도 계속 는다.** 새 화면을 시작할 때
  `custom/**`·`ui/**` 디렉터리를 그 자리에서 다시 나열하고, `component-guide.md` §12 표를 다시 본다.
  "저번 목록에 없었으니 없다"고 기억으로 판단하지 않는다.
- 쓰기 전에 실제 props/경로를 파일에서 다시 확인한다(팀원이 계속 바꾼다 — 기억에 의존하지 않는다).
- **이름 끝에 `2`가 있으면 `2`가 정본이다** — `InputField2`(38개 화면) vs `InputField`(1),
  `GenericDialog2`(19) vs `GenericDialog`(1). `AlertDialog2`·`ConfirmDialog2` 도 마찬가지.
  구버전에 deprecated 표시가 없어서 파일만 봐선 구분되지 않는다.
- **뭘 고를지는 `component-guide.md` 를 본다.** 디렉터리 나열로는 `custom/empty` 가 "데이터 없음"인지,
  `Chip` 과 `FilterChip` 이 뭐가 다른지 알 수 없다. 이름이 비슷한 형제 구분표도 거기 있다(§9).
- 프레임의 `instance` 이름(`selectbox`, `infobox`, `chip__single` …)이 컴포넌트 선택의 답이다 —
  `component-guide.md` §10 역인덱스에서 그 이름으로 찾는다.

### 화면 분할·패널은 CSS 로 직접 짜지 않는다
`display:grid` 로 2분할을 짜거나 `.panel { border; border-radius; background }` 같은 걸 만들고
있으면 잘못 가고 있는 것이다. 공통 컴포넌트가 있다:
- 2분할·3분할 → `custom/content-layout/layoutSplit.vue` (드래그 리사이즈 포함)
- 분할 안의 패널(제목+내용) → `custom/content-layout/layoutPanel.vue`
같은 "2분할 목록+상세" 화면인데 한쪽은 `LayoutSplit`, 다른 쪽은 `styles.columns` 로 갈린 적이 있다.

### 남이 만든 파일과 코드가 겹쳐도 — **합치지 않는다**
"공통에 만들어라"는 **내가 새로 만들 때** 얘기다. **이미 동료 파일에 있는 것과 내 것이 중복되면
통합하지 말고 중복인 채로 둔다.**
- 예: `PM-PUB-0409` 컴포저블의 `regionOptions` 18개 지역 목록이 `views/pub/composable/drunkCenter.ts` 와
  겹쳤다 → 합치지 않고 각자 뒀다.
- **왜**: 3명이 동시 작업이라 남의 파일을 건드리면 pull 때 충돌이 난다. 중복 제거로 얻는 이득보다
  충돌 해소 비용이 크다.
- 남의 파일(다른 화면의 composable 등)을 꼭 고쳐야 하면 기존 줄을 **바꾸지 말고 추가만** 한다.
  라우터·`presets.ts` 는 이것과 별개로 **아예 건드리지 않는다** — 예외 두 가지는 `docs/create.md` §3.
- 통합이 정말 필요해 보이면 실행하지 말고 인계 메모에 한 줄로 알리기만 한다.

### 인라인 스타일 금지 — CSS 변수를 덮을 때도 클래스로
컴포넌트가 노출한 CSS 변수(`--flex-col-min-w` 등)를 호출부에서 바꿀 때도 인라인
(`style="--flex-col-min-w:0"`)으로 덮지 않는다. 변수를 재정의하는 클래스를 만들어 `class` 로 입힌다:
```css
/* police-override.css — 컴포넌트 변수를 덮으므로 override 쪽(§2) */
.lp-narrow-col { --flex-col-min-w: 0; }
```
```html
<FlexCol class="lp-narrow-col">
```
한 화면만 쓰더라도 처음부터 공통 이름으로 만든다(§2).

### 화면 템플릿에 테일윈드 유틸(`flex`, `mt-4`, `text-[1.5rem]`) 직접 사용 금지
왜: 디자인이 바뀔 때 클래스 하나만 고치면 전체 반영되게 하려는 것. 흩뿌리면 화면마다 손봐야 한다.
- 한 번만 쓰이더라도 `police-common.css` 에 이름 있는 공통 클래스로 만든다(§2).
- **적용 범위는 화면(`views/**` 의 `.vue` 와 그 화면 composable)뿐.** `src/components/**` 재사용
  컴포넌트가 내부에서 테일윈드를 쓰는 건 무관하다(고칠 곳이 한 파일이라 흩어질 문제가 없다).
- **테일윈드 문자열을 JS 변수·computed 에 담아 `:class` 로 바인딩하는 것도 위반**
  (예: `const cardClass='flex items-center gap-2 p-4 rounded'`). 진짜 CSS 클래스로 뽑는다.
- **허용되는 유일한 형태** — 기존 컴포넌트에 **prop 값**으로 넘기는 폭·여백 미세조정:
  `<InputField2 input-class="w-40" />`, `<Button class="ml-2">`. 일반 태그(`<div>` `<span>`)에
  붙이면 위반이다.
  - **`Button` 에 `class="w-25"` 는 쓰지 않는다.** `Button` 베이스에 `min-w-25`(100px)가 이미 있어
    보이는 폭이 안 달라지고, 오히려 폭을 100px 로 고정해 글자가 길면 넘친다. 기존 화면 14곳에 남아
    있으니 복붙할 때 딸려오지 않게 확인한다.
  - 폭을 컨텐츠에 맞추려면 `padding` prop: `<Button size="sm" padding="12">저장</Button>` (값을 주면
    `min-width` 가 0이 되고 좌우 여백이 그 값이 된다. 숫자는 px, `"0.8rem"` 도 된다). 표는
    `component-guide.md` §8-1.
- 기존 화면(2201/2204/2401 등)은 이 규칙 이전 것이라 테일윈드가 남아 있다 — 새 화면부터 적용,
  기존은 차차 정리.

## 2. CSS — 세 파일, 화면 전용 CSS 는 없다
**모든 스타일은 공통이다.** 한 화면만 쓰더라도 처음부터 공통 파일에 공통 이름으로 만든다.
"화면 전용 CSS" 도 "나중에 승격" 도 없다 — 그 단계가 실제로 작동하지 않았다(`docs/rationale.md`).

| 파일 | 참고 | 기입 | 무엇 |
|---|---|---|---|
| `police-style.css` | ✅ | ❌ | 퍼블리싱 원본(reset·헤더/푸터·포털 화면). **읽기 전용** |
| `police-common.css` | ✅ | ✅ | 우리 공통 스타일 — **새 스타일은 기본적으로 여기** |
| `police-override.css` | ✅ | ✅ | 컴포넌트·라이브러리·테일윈드를 **덮어야 하는 것만** |

세 파일 다 `public/portal/asset/css/common/` 에 있고 `police-entry.css` 가 전역 로드한다.
화면에서 import 하지 않는다(`public/` 이라 Vite CSS 파이프라인 밖이다).
그 밖의 컴포넌트 레벨 CSS: 라벨-값 표는 `src/components/custom/info-table/InfoTable.module.css`,
그리드는 `src/assets/css/tabulator-theme.css`(전역 적용, 다시 스타일링 불필요).
`krds.min.css` 는 파일만 있고 로드되지 않는다 — 참고 대상이 아니다.

### ① 있는지 찾는다 — 세 파일을 한 덩어리로, 세 단계로 (선언 → 이름 → 의도)
"police-style 먼저 보고 없으면 common" 같은 파일 순서가 아니다. **무엇으로 찾느냐**가 순서다.
세 단계를 다 거친다 — 하나라도 건너뛰면 이미 있는 걸 또 만들거나(1·2단계 누락), 남의 스타일을
잘못 가져다 쓴다(3단계 누락).

**0단계 — 쓰기로 한 컴포넌트가 `*.module.css` 를 부르면 거기부터 본다.** 스타일을 놓는 자리가
공통 세 파일만은 아니다. 지금 둘 있다 — `InfoTable.module.css`(43개, 화면 33곳이 직접 import) ·
`FlexGrid.module.css`. **`css-find.cjs` 는 이 파일들을 안 훑는다**(세 파일 고정). 그리고 module.css
는 `@layer` 밖이라 `police-override.css` 로도 **못 덮는다** — 값만 다르면 새 클래스를 만들지 말고
컴포넌트가 노출한 CSS 변수(`--info-label-w`·`--flex-col-min-w`)를 클래스로 재정의한다.
어느 컴포넌트가 무엇을 갖고 있는지는 **`docs/module-css.md`**.

1. **선언으로 찾는다 (문자)** — 스크립트가 세 파일을 전부 훑는다. 선언 순서가 달라도 잡고,
   완전 일치 / 부분 일치를 나눠 보여준다.
   ```bash
   node scripts/css-find.cjs "flex:1; min-height:0; overflow-y:auto"
   ```
   - **완전 일치** → 후보다. 그대로 확정하지 말고 3단계로 간다.
   - **부분 일치** → 그 클래스를 쓰고 **차이나는 선언만** 새 클래스로 덧붙인다:
     `<div class="detail-scroll lp-panel-pad">`. **기존 클래스는 고치지 않는다**(다른 화면이 쓴다).
2. **이름으로 찾는다 (역할)** — 선언이 안 걸려도 같은 역할의 클래스가 있을 수 있다(값만 조금 다른
   경우). `component-guide.md` §12 표를 역할로 훑는다. `police-style.css`(1500줄)를 직접 뒤지지
   않는다 — 표가 그 요약이다.
3. **의도로 판단한다 (맥락)** — §12 표의 **의도** 칸을 읽는다. **값이 같아도 의도가 다르면 쓰지 않고
   새로 만든다.** 지금 묶으면 나중에 한쪽만 값이 바뀔 때 다른 화면이 같이 깨진다.
   - 예: `flex:1; min-height:0; overflow-y:auto` 가 `.detail-scroll`(상세 패널 **안쪽** 스크롤)과
     `.lp-page-scroll`(**페이지 본문** 스크롤) 둘로 나뉘어 있는 게 이 이유다.

### ② 없을 때 어디에 만드나 — 기준은 "덮어야 하느냐" 하나
```
새 스타일이 필요하다
  └─ 컴포넌트·라이브러리·테일윈드가 이미 먹인 스타일을 덮어야 하나?
       ├─ 아니오 → police-common.css     ← 기본값. 대부분 여기다
       └─ 예     → police-override.css
```
- override 대상의 실제 모습: Tabulator·VueDatePicker 같은 **라이브러리 내부 클래스**를 겨냥한다
  (`.tabulator-cell` 등) / shadcn·custom 컴포넌트가 이미 먹인 스타일을 되돌린다 / 컴포넌트가 노출한
  **CSS 변수를 재정의**한다(`--flex-col-min-w: 0`).
- **애매하면 `police-common.css` 에 쓰고, 화면에서 안 먹으면 override 로 옮긴다.** 안 먹는 원인은
  레이어 하나뿐이라 옮기면 해결된다. 두 파일이 왜 합쳐지지 않는지는 `docs/rationale.md`.
- **색·크기·모서리 값**은 hex 하드코딩 말고 토큰(`var(--Text-body_1)`)으로. 토큰 목록은 §12.
- **특정 컴포넌트에 딸린 스타일**은 그 컴포넌트 폴더의 `*.module.css`.
- **`police-style.css` 에는 추가하지 않는다.** 화면 폴더에 `style/` 도 만들지 않는다(§3).
- `!important` 는 Tabulator 처럼 JS 가 인라인 style 을 써 넣는 경우 말고는 쓰지 않는다.

### 클래스명 — 네임스페이스 필수, 케밥케이스
```css
.sitemap-grid     { … }    /* 우리 것 — 기능 이름이 네임스페이스 */
.lp-page-scroll   { … }    /* 우리 것 — 기능이 없는 범용 역할이라 lp- */
.detail-scroll    { … }    /* police-style.css 원본 — 건드리지 않는 것 */
```
- **한 단어 범용어(`.card` `.title` `.wrap` `.note`)는 쓰지 않는다.** 원본이 클래스 **176개**를
  점유하고 있고 그중 **102개가 하이픈 없는 한 단어**다(`.card` `.btn` `.detail` `.form` `.footer`
  `.gnb` `.date` …). 우리 파일이 뒤에 로드돼 **우리가 이기므로** 겹치면 포털 화면(헤더/푸터/공지)이
  조용히 깨진다.
- **앞에 네임스페이스를 붙인다. `lp-` 여야 하는 건 아니다** (2026-09-14 완화):
  ```
  이 스타일이 한 화면·기능 안에서만 의미가 있나?
    ├─ 예   → 기능 이름을 쓴다      .sitemap-grid  .board-detail  .memo-card-title
    └─ 아니오(여러 화면이 쓰는 범용 역할) → lp- 를 쓴다   .lp-row-between  .lp-page-scroll
  ```
  `lp-` 가 필요한 자리는 **기능 이름을 붙일 수 없어 이름이 범용어가 되는 것**이다(`.row-between`
  `.page-scroll` 같은 것). 기능 이름이 이미 고유하면 `lp-` 는 덧붙는 접두사일 뿐이다.
- **기존 `.lp-*` 324개는 그대로 둔다.** 개명하지 않는다 — 사용처가 많아 얻는 것보다 충돌 비용이 크다(§1).
  접두사 없는 기능 네임스페이스(`.board-*` 47개)도 이미 쓰이고 있고, 이제 정식이다.
- **화면ID를 이름에 넣지 않는다.** 한 화면만 쓰더라도 역할로 짓는다(`.pc-lpo-0601-map` ❌ →
  `.lp-map-frame` ✅).
- **이름을 넓게 짓지 않는다** — `.lp-main` 은 아무나 갖다 쓰지만 `.lp-answer-main` 은 안 그런다.
- **어디서든 케밥케이스다 — 카멜케이스는 쓰지 않는다.** `police-common.css` 든 `*.module.css` 든
  예외 없다. `.detailLayout` `.photoBox` ❌ → `.detail-layout` `.photo-box` ✅.
  왜: CSS Modules 에서 `styles.detailLayout` 으로 꺼내려고 카멜로 쓴 습관이 남아 있는데, 그 스타일을
  공통으로 옮기면 템플릿은 `class="detail-layout"` 문자열이 되므로 카멜 이름은 아무것도 안 걸리는
  죽은 코드가 된다(PC-LPO-0801 에서 실제로 일어났다).

### 만들었으면 `component-guide.md` §12 표에 등재한다 — **의도 칸이 핵심이다**
`클래스 / 파일 / 의도 / 쓰는 곳` 한 줄을 추가한다. 클래스명만 나열된 줄은 다음 사람이 ③을 못 해서
오용한다. **쓸 때도 의도 칸을 읽고 쓴다.**

### 지금 상태 — 접두사 없는 공통 클래스가 원본에 남아 있다
`police-style.css` 안에 우리 공통이 +625줄 섞여 있다(`.list-actions` `.btn-wrap` `.search-area`
`.detail-scroll` 등, 사용 224건+). `police-common.css` 로 옮기는 건 **별도 배치로 남아 있다** —
그때까지 그 클래스들은 접두사 없이 그대로 쓴다(멀쩡히 동작한다). 화면 폴더의 `style/*.module.css`
(19개)도 그대로 둔다 — 새로 만들지는 않는다.

## 3. 파일 형태 — 블록 순서 · 코드 스타일
기준 파일은 `src/views/lpo/PC-LPO-0215/PC-LPO-0215.vue` 하나다. **화면 유형이 달라도** 코드 형태는
이걸 따른다(유형별 골격은 `docs/create.md` §2 에서 갈린다 — 형태와 골격은 다른 얘기다).

- **블록 순서** — `<template>` → `<script setup>`. **`<style>` 블록은 두지 않는다**(CSS 는 §2).
  화면 파일과 그 폴더의 `components/` 팝업까지 전부 같은 순서다.
- **화면 폴더에 `style/` 을 만들지 않는다.** `route.ts` 도 만들지 않는다(라우터는 `docs/create.md` §3).
- **기준 파일에서 가져오는 건 형태(블록 순서·코드 스타일·컴포넌트 선택·클래스 이름)뿐이다. 치수
  (`gap`·`margin`·`padding`·`size`)는 항상 내 시안에서 다시 잰다** — 절차는 `docs/create.md` §4 "치수".
  기준 화면의 값을 복사하면 그 화면이 잘못 옮긴 값까지 따라온다(PM-COM-1002 → 0402 에서 실제로 일어났다).
- **코드 스타일** — 줄 끝 세미콜론 없음 / 화살표 상수가 아닌 `function` 선언 / import 순서
  (vue → 외부 라이브러리 → 공통 컴포넌트 → 화면 composable → menu·tab) / 검색 옵션은 composable 에
  `export const xxxOptions` 로 두고 화면에서 import.
- **템플릿의 prop 이름은 케밥케이스다** — `input-class` `trigger-class` `label-class` `row-class`
  `select-mode`. Vue 는 `inputClass` 도 받지만 기준 파일과 대다수 화면이 케밥이라 섞이면 grep 이
  갈린다(같은 prop 을 두 이름으로 찾게 된다). **`v-model` 뒤나 `:` 바인딩 안의 JS 식은 그대로
  카멜케이스다** — 케밥은 속성 이름에만 해당한다.
- `defineOptions({ name: 'XxxYyy' })` 는 `useBottomTabSetup` 의 `componentName` 과 **글자 하나까지
  같아야** KeepAlive 가 걸린다. 어긋나면 조용히 깨져서 발견이 늦다.

> **아직 안 정해진 것 — `useDialog` import 를 어디 두나.** 지금 저장소가 셋으로 갈려 있다:
> import 맨 마지막 39건 / menu·tab 앞 37건 / 중간 25건. 다수가 없어서 **한쪽으로 고치지 않는다** —
> 새 화면에서는 아무 쪽이나 쓰되, 기존 파일의 위치를 옮기지는 말 것(101개 파일이 걸린다).
> 정리하려면 별도 배치로 한 번에 한다.

## 4. 저장/삭제 피드백 — 알림창(`dialog.alert`)이 기본, toast 는 쓰지 않는다
성공·경고 피드백은 **알림창(AlertDialog2)** 으로 낸다. `useDialog().alert()` 가 그 진입점이고 `vue-sonner`
`toast` 는 화면에서 import 하지 않는다(2026-09 에 51개 파일 146건을 일괄 전환했다 — 남아 있으면 옛 것).
```ts
import { useDialog } from '@/composable/dialog/dialog'
const dialog = useDialog()

async function onDeleteSelected() {
  if (!selectedCount.value) {
    await dialog.alert({ title: '삭제할 OO을 선택해 주세요.', btnCancel: '확인' })  // select-mode="checkbox" + @row-selection-changed 로 selectedCount 갱신
    return
  }
  gridRef.value?.deleteSelected()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}
async function onSave() {
  if (!form.groupName.trim() || !form.groupType) {
    await dialog.alert({ title: '필수 항목을 입력해 주세요.', btnCancel: '확인' })  // 필수값 누락도 alert 로 막고 return
    return
  }
  // 저장 로직(목업 배열 갱신)
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
}
```
- **문구는 `title` 에, 버튼은 `btnCancel: '확인'` 하나.** 부연이 필요할 때만 `description` 을 더한다.
  `alert` 는 Promise 라 감싸는 함수를 `async` 로 하고 `await` 한다 — 안 하면 뒤 코드(닫기·이동)가
  알림창이 뜨기도 전에 실행된다. 표현식 본문 콜백(`onClick: () => dialog.alert(...)`)은 await 없이 둬도 된다.
- **위 예시는 "짤 때 이 형태로"이지 "반드시 짜라"가 아니다.** 사용자가 지정하지 않은 동작은 비워 두고
  인계 메모에 적는다(서두).
- **`dialog.confirm()` 은 되돌릴 수 없거나 연쇄로 다른 데이터까지 지울 때만**(PC-COM-2201 부서삭제
  "하위 부서도 함께 삭제", PC-COM-2402 팝업공지 "되돌릴 수 없음"). 일반 선택행 삭제/저장에는 붙이지
  않는다 — 클릭 한 번 더 강제하는 마찰이다. **"권한/관리자 설정처럼 민감해서"는 예외 사유가 아니다**
  (PC-COM-2201 권한저장 `onSave` 가 confirm 을 쓰는데 이것도 위반, 미수정).

### 사용자가 이 규칙과 다르게 지정하면 — **지정을 따르되 코드와 보고에 표시한다**
"저장할 때 컨펌창"처럼 명시적으로 요구하면 그대로 만든다. 위 규칙은 지정이 없을 때의 기본값이다.
```ts
// 사용자 지정: 저장 컨펌창 — CLAUDE.md §4 기본(alert 만)과 다르지만 요청대로 따름
const ok = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
```
기존 화면 주석 중 "§4(또는 §7) 기본은 toast 지만 사용자 지정으로 알림창" 이라 적힌 것은 이 규칙 이전
문구다 — 지금은 알림창이 기본이므로 그 주석은 낡은 것이고, 코드는 규칙대로다.
표시가 없으면 다음 사람이 규칙 위반으로 오해해 되돌린다(실제로 그럴 뻔했다).

## 5. 자주 겪는 함정
- **`Select`/`SelectItem` 의 value 에 빈 문자열(`''`) 못 쓴다.** "전체" 같은 sentinel 은 `'all'` 처럼
  실제 문자열로.
- **`<script setup>` 은 런타임 값 export 불가**(타입만 가능). 상수를 내보내려면 별도 `<script>`
  블록이나 별도 `.ts` 로 뺀다 — 무리하면 그 컴포넌트를 쓰는 모든 화면이 컴파일 에러로 깨진다.
- **id/for·v-model 중복**: 필드를 복붙하면서 id/v-model 을 안 바꿔 서로 다른 라벨 둘이 같은 데이터를
  공유하는 실수가 반복된다 — 복붙하면 id/v-model 을 반드시 다시 확인한다.
- **id 만으로 행 찾기/삭제**: 여러 카테고리가 같은 id 범위(1,2,3…)를 쓰면
  `allRows.find(r => r.id === form.id)` 가 엉뚱한 카테고리 행을 건드린다.
  `r.id === form.id && r.category === 'xxx'` 처럼 스코프를 항상 같이 확인한다.
- **배열 상태는 항상 재할당, `splice` 제자리 수정 금지** — `TabulatorGrid` 의 `:data` watch 가 얕은
  비교라 변경을 못 감지한다.
  ```ts
  rows.value.splice(idx, 1, updated)                                // ❌
  rows.value = rows.value.map((r, i) => (i === idx ? updated : r))  // ✅
  ```
- **`@row-selection-changed` 는 데이터가 아니라 Tabulator `RowComponent` 배열을 넘긴다.** 필드가
  필요하면 `row.getData()` 로 꺼낸다. 그리드 사용법 전반은 `component-guide.md` §3.

## 6. 문서·산출물 위치
- **`docs/`** — 팀이 공유하는 산출물. 커밋한다. 절차 문서(`create.md`·`review.md`·`rationale.md`)와
  검토 결과(`review-{화면ID}.md`)도 여기다.
- **`draft/`** — 개인 작업공간(`.gitignore`, git 미추적). 임시 산출물·대용량 파일만 둔다.
  **화면 작업의 근거로 삼지 않는다** — 근거는 Figma 하나다(`docs/create.md` §1). 여기 있는 옛
  기획서를 Figma 와 대조하지 않는다.
- draft/ 에 만든 것 중 팀이 봐야 하는 게 생기면 **docs/ 로 옮기고 참조를 고친다** — draft/ 에 둔 채
  문서에서 참조하면 다른 사람이 pull 해도 파일이 없어 링크가 깨진다.
