# 화면 생성 절차

새 화면을 만들 때 이 문서를 위에서부터 순서대로 따라간다. **모든 화면이 §1 → §5 를 전부 지난다.**
§2 에서 화면 유형이 정해지면 그 유형 문서(`docs/create/*.md`)를 하나 더 펴고, 나머지 유형 문서는
펴지 않는다.

> **규칙 본문은 여기 없다.** 무엇이 옳은지는 `CLAUDE.md` 에만 적혀 있고, 이 문서는 **"무엇을 어떤
> 순서로 하는가"** 만 말한다. 두 곳에 같은 규칙을 적으면 한쪽만 고쳐졌을 때 어느 게 최신인지
> 갈린다(CLAUDE.md §0). 이 문서와 CLAUDE.md 가 어긋나면 **CLAUDE.md 가 이긴다** — 그리고 어긋난다는
> 사실을 사용자에게 알린다.

각 단계에는 **"이 단계에서 펴는 파일"** 이 적혀 있다. 펴지 않고 기억으로 하면 그 단계는 안 한 것이다.

---

## 1. 시작 — Figma URL 하나로 시작한다
**펴는 파일**: `screen-id-map.md`(grep 만), 기준 화면 폴더(있으면)

사용자가 주는 건 보통 Figma node URL 하나다.

1. **URL 에서 fileKey·nodeId 를 뽑는다.**
   ```
   https://www.figma.com/design/8mQz91txveSEKO0ky7Ck6V/지역경찰포털-리뉴얼?node-id=10678-68409
                                └──────── fileKey ────────┘          └─ nodeId ─┘
   ```
   node-id 는 **대시 그대로** 도구에 넣는다(대시·콜론 둘 다 받는다).
2. **화면을 눈으로 본다.** XML/코드만 읽으면 배치·여백·비율 같은 전체 인상을 놓친다.
   ```
   ① get_design_context(fileKey, nodeId)   ← 응답에 스크린샷이 기본 포함된다
   ② get_screenshot(fileKey, nodeId, maxDimension: 1600)
      → 응답의 image_url 을 curl 로 스크래치패드에 내려받고 Read 로 연다
        curl -sL -o screen.png "<image_url>"
      → 세부가 안 보이면 maxDimension 을 올리거나, 그 부분 프레임만 다시 찍는다
   ```
   - 몇 분할인지, 검색영역이 있는지, 그리드인지 폼인지 — §2 유형 판정이 이 한 장에서 나온다.
   - 팝업·탭처럼 **숨겨진 상태**는 그 프레임을 따로 찍어야 보인다(목록 화면 캡처엔 안 나온다).
   - **rate limit 이 잦으니 사용자가 준 nodeId 의 프레임만 연다.** 화면 전체를 훑지 않는다. 막히면
     사용자에게 스크린샷이나 다른 노드 URL 을 요청한다.
3. **화면ID를 확정한다.** 프레임 이름(`PC_지역경찰_06_장비관리_03_무기` 형식)을 `screen-id-map.md` 에
   grep 한다: `grep -n "무기" screen-id-map.md`. **번호로 유추하면 틀린다** — Figma `06_장비관리` 는
   `PC-LPO-07xx` 다. 사용자가 화면ID를 직접 주면 그게 정답이다.

   **다음 중 하나라도 해당하면 만들지 말고 멈추고 묻는다:**
   - 프레임 이름에 대응하는 화면명이 `screen-id-map.md` 에 **없다**
   - 비슷한 이름이 **여러 개** 걸려서 어느 것인지 확정되지 않는다
     (예: "인사관리"는 `PC-LPO-0801` 과 `PC-STT-0103` 둘 다 있다)
   - 한 node 아래 화면이 여러 개인데 **어느 것을 만들지 지시가 없다**

   물을 때는 찾은 후보를 같이 보여주고 **화면ID**를 달라고 한다:
   > 주신 프레임이 "무기 목록"인데 `screen-id-map.md` 에서 확정이 안 됩니다.
   > 후보: `PC-LPO-0706`(무기 탭 › 목록) / `PC-LPO-0707`(무기 탭 › 등록/상세/수정)
   > 어느 화면ID로 만들까요?

   **왜 멈추나**: 화면ID가 틀리면 폴더명·라우트·`screenGroup`·`defineOptions` 가 전부 같이 틀어진다.
   화면ID 체계는 IA 소관이라 **새 ID 를 임의로 만들지 않는다**(`screen-id-map.md` 가 정본).
4. **`views/{domain}/{화면ID}/` 가 이미 있으면 한 번 알리고 어떻게 할지 묻는다.** 새로 만들지·기존
   것을 고칠지·백업할지는 **사용자가 정한다.** 혼자 판단해서 덮어쓰거나 지우지 않는다:
   > `src/views/lpo/PC-LPO-0601/` 이 이미 있습니다(라우터에도 등록됨). 어떻게 할까요?

---

## 2. 유형 판정 → 유형 문서로 분기
**펴는 파일**: 아래 표에서 고른 **유형 문서 하나** + 그 문서가 가리키는 **기준 `.vue` 하나**

§1 스크린샷으로 유형을 정한다. 매번 "제일 비슷한 화면"을 새로 찾으면 같은 유형도 화면마다 다른
베이스로 갈라진다(20개+ 화면이 갈라진 원인). **표에 없는 이유로 다른 화면을 "더 비슷하다"며 베이스로
삼지 않는다.**

| 화면 유형 | 유형 문서 | 기준 파일 |
|---|---|---|
| **단순 그리드 목록 + 검색** — 제일 흔하다 | **`docs/create/grid-list.md`** | `PC-LPO-0215` |
| 체크박스 그리드 인라인편집 CRUD(선택삭제/추가/저장) | `docs/create/grid-list.md` §"인라인편집 CRUD" | `PC-COM-2401` |
| **2분할 목록+상세** — 상세가 폼 / 그리드 / 단일선택+히스토리 | **`docs/create/split-detail.md`** | `PC-LPO-0801` / `PC-COM-2204` / `PM-PUB-0103` |
| 3분할(트리 + 목록그리드 + 목록그리드) | `docs/create/split-detail.md` §"3분할" | `PC-COM-2201` |
| **탭 + 다중 팝업이 컴포넌트 하나를 공유**(화면군) | **`docs/create/tab-popup.md`** | `PC-LPO-0701` |
| **목록/상세/등록이 별개 라우트** | **`docs/create/multi-route.md`** | `PC-PUB-0301`(목록) + `PC-PUB-0302`/`0303`(상세/등록) |
| 대형 검색바 + 검색결과(그리드 아님) | 유형 문서 없음 — 기준 파일을 그대로 따른다 | `PM-COM-0801`(검색창) + `PM-COM-0802`(결과). `custom/search/SearchBar.vue` · `SearchKeywordPanel.vue`, 결과는 구역별 목록 + `Pagination simple` |
| **한 장짜리 긴 작성 문서** — 조회조건이 아니라 날짜 한 개를 고르고, 결재선 + 입력 구역 + 정적 표가 세로로 이어진다 | 유형 문서 없음 — 기준 파일을 그대로 따른다 | `PC-LPO-0301`. 위는 `.dept-area` + `.list-actions .lp-date-actions`(`.lp-workday-row`), 본문은 `ScrollWrapper` 안에 `<section class="lp-section">` 나열. 결재선은 `TableWrapper .lp-approval-table`(PM-PUB-0702 와 공유), 입력 구역은 `InfoTable`+`.lp-unit-row`, 정적 표는 `TableWrapper` |

- **어느 유형과도 애매하게 걸치면 혼자 고르지 말고 사용자에게 확인한다.**
- **표에 없는 새 유형이면** 화면 완성 후 이 표에 새 줄로 등록한다(다른 세션도 같은 파일을 가리키게).
  유형 문서는 적을 내용이 있을 때만 만든다 — 기준 파일 한 줄이면 위 "대형 검색바" 줄처럼 표 안에만 둔다.
- 유형 문서는 **그 유형에서 무엇을 어떤 순서로 가져오는가**만 적는다. 코드 형태(블록 순서·코드 스타일)는
  유형과 무관하게 `CLAUDE.md` §3 이다.

---

## 3. 골격 — 폴더, 라우터, LNB, 브레드크럼
**펴는 파일**: `src/composable/menu/sidemenu/presets.ts`(grep 만), `src/router/plannedRoutes.ts`(읽기만)

### 폴더 구조 — 폴더명·파일명이 화면ID와 글자 하나까지 같아야 한다
```
views/{domain}/PC-XXX-NNNN/
  PC-XXX-NNNN.vue
  composable/PC-XXX-NNNN.ts   (또는 composable/ 폴더로 분할)
  components/                 (그 화면 전용 팝업 등)
```
- `domain` 은 화면ID 가운데 세 글자 소문자 — `PC-LPO-0601` → `lpo`.
- 라우터가 이 경로 규약으로 화면을 찾는다. 어긋나면 라우트는 살아 있는데 NotReady("아직 작업하지 않은
  화면입니다")가 뜬다.
- `style/` 과 `route.ts` 는 만들지 않는다(`CLAUDE.md` §3).
- 여러 화면ID가 한 페이지를 공유하면(탭/팝업이 실은 컴포넌트 하나) composable·components 를 그 페이지
  폴더 밑에 → `docs/create/tab-popup.md`. 진짜 별개 페이지들이 도메인만 공유하면 도메인 레벨
  `views/{domain}/composable/` → `docs/create/multi-route.md`. **폴더 위치를 정하는 순간 상태공유 방식도
  같이 정해진다.**

### 라우터 — 아무것도 안 한다
`router/plannedRoutes.ts` 가 **화면ID 279개를 미리 등록해 뒀다.** 규약대로 `views/{domain}/{화면ID}/{화면ID}.vue`
를 만들면 그 순간 진짜 화면이 뜬다. 아직 안 만든 화면은 `views/error/NotReady.vue` 가 대신 뜬다 —
**라우트가 죽지 않으므로** 링크·브레드크럼·LNB 를 미리 걸어도 안전하다.
```ts
// router/plannedRoutes.ts — 읽기만 하고 고치지 않는다
export const plannedScreens = [
  ['PC-LPO-0601', '관내현황 상세내역'],   // ← [화면ID, 화면 제목]
  …
]
const pageModules = import.meta.glob('../views/*/*/*.vue')   // 실재하는 파일만 잡힌다
```

**딱 두 가지 예외만 손댄다:**

| 상황 | 무엇을 한다 |
|---|---|
| `plannedScreens` 에 그 화면ID가 **없다** | 정렬 위치에 **한 줄만** 추가한다: `['PC-XXX-NNNN', '화면명']`. 화면명은 `screen-id-map.md` 의 것을 그대로 |
| 규약을 **벗어난다** — 화면군(`screenGroup` 필요) / `layout` 이 `WorkLayout` 이 아님 / `path` 가 `/views/{domain}/{화면ID}` 가 아님 | `router/index.ts` 배열에 직접 적는다. 절차는 `docs/create/tab-popup.md` |

`index.ts` 에 직접 적으면 `buildPlannedRoutes` 가 그 화면ID를 자동으로 건너뛴다(`taken` 필터) — 중복
등록 걱정은 없다. 왜 이 구조가 됐는지는 `docs/rationale.md`.

| 화면을 | `plannedRoutes.ts` | `router/index.ts` | `presets.ts`(LNB) |
|---|---|---|---|
| **추가**(규약대로) | 목록에 없을 때만 한 줄 | ⛔ | ⛔ |
| **추가**(화면군 등 예외) | ⛔ | ✅ 직접 적는다 | ⛔ |
| **수정** | ⛔ | ⛔ | ⛔ |
| **삭제** | 그대로 둬도 된다(NotReady 로 바뀔 뿐) | ✅ 직접 적었으면 지운다 | ✅ 해당 `path` 지운다 |

⚠ **삭제는 폴더째 지워도 빌드가 안 깨진다** — glob 이 실재 파일만 잡는다. 다만 **`index.ts` 에 직접
적힌 화면**이면 그 항목을 **같은 커밋에서 함께** 지워야 한다(리터럴 경로라 `Could not resolve ...` 로
빌드가 깨진다). 화면군의 일부였다면 나머지 화면ID 들이 같은 컴포넌트를 가리키고 있는지 먼저 확인한다.

### LNB — `presets.ts` 는 안 건드리고, 화면이 값을 준다
`presets.ts`(LNB 메뉴 트리)는 **배치 등록**이다. 화면 폴더는 자기가 메뉴 트리 어디에 붙는지 알 수 없어서
자동화가 안 된다(IA 의 depth 는 "화면 계층"이고 LNB 는 "메뉴 구조"라 서로 다르다 — `docs/rationale.md`).
등록은 사용자가 "프리셋에 없는 페이지들 LNB 등록해줘"라고 명시할 때 한 사람이 몰아서 한다.
그 전까지는 화면이 직접 값을 준다. 인계 메모에 **"LNB 프리셋 미등록"** 이라고 적는다(§5).

- **`useSideMenuSetup` 은 프리셋을 인라인으로 펼쳐 동기 경로로 부른다:**
  ```ts
  import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
  useSideMenuSetup({ ...publicSafetyMenu, activeChild: '단체정보리스트', openIndex: 2 })
  ```
  문자열 키(`useSideMenuSetup('publicSafety')`)는 프리셋 기본 `activeChild` 가 그 화면과 정확히 일치할
  때만 쓴다. 문자열 키는 비동기 로딩이라 이어서 `sideMenuStore.setActiveChild(...)` 를 부르면 늦게
  끝난 로딩이 그 값을 덮는다.
- **값은 `presets.ts` 를 열어 대조한다 — 추측하지 않는다.**
  - `openIndex` = 그 화면이 속한 **최상위 `items` 배열의 0-based 인덱스**. 세어서 구한다.
  - `activeChild` = 그 그룹 `children` 중 해당 항목의 `name` 과 **정확히 같은 문자열**.
  - **① `path` 로 찾는다** — `grep -n "PC-LPO-0801" presets.ts`. 항목에 `path` 가 적혀 있으면 그게 정답이다.
  - **② path 가 없으면 메뉴 라벨(`name`)로 찾는다 — 신규 화면은 이쪽이 정상이다.** Figma LNB 에 보이는
    라벨을 그대로 grep 한다: `grep -n "근무일지(甲)" presets.ts` → 그 항목이 속한 최상위 `items` 인덱스가
    `openIndex`, 라벨이 `activeChild`. (`PC-LPO-0215` 가 이 경우 — `openIndex: 1, activeChild: '근무일지(甲)'`)
  - **③ 라벨조차 없으면** 프리셋에 그 메뉴가 아직 없는 것이다. **지어내지 말고** Figma LNB 라벨을
    `activeChild` 에 그대로 넣고, 인계 메모에 **"프리셋 미등록 — 배치 등록 시 확인 필요"** 라고 적는다.
    배치 등록 전까지 LNB 활성표시가 안 뜨는 건 정상이다.
  - **`children` 이 없는 최상위 항목**(`관내현황`·`개인장비`·`인사관리`)은 **그 항목 자신의 인덱스**를
    `openIndex`, **자기 이름**을 `activeChild` 로 준다. 실측값: `PC-LPO-0601` → `openIndex: 4, '관내현황'` /
    `PC-LPO-0701` → `5, '개인장비'` / `PC-LPO-0801` → `6, '인사관리'`. `openIndex: -1` 로 두면 닫힌 채
    렌더된다.
- 배치 등록으로 `presets.ts` 에 그 화면의 `path` 가 채워지면 `useSideMenuSetup` 의 `syncActiveByRoute()`
  가 경로로 활성 항목을 다시 맞춘다. 그때 화면의 인라인 값은 덮어써지지만 해가 없으니 **그대로 둔다.**
- `defineOptions({ name })` + `useBottomTabSetup({ componentName })` 이름 일치는 `CLAUDE.md` §3.

### 브레드크럼 `path` — 라우터에 실재하는 것만 준다
`Breadcrumb` 의 `navItems` 에서 **`path` 는 실제 라우트가 있을 때만** 쓴다. 없으면 라벨만 둔다.
```ts
const navItems = [
  { label: '홈', path: '/' },   // 라우터에 있음 → path OK
  { label: '지역경찰' },         // '/lpo' 같은 도메인 경로는 라우트가 아니다 → 라벨만
  { label: '인사관리' },
]
```
`/lpo` `/pub` `/com` `/stt` `/flp` 는 **전부 라우터에 없다.** 넣으면 클릭해도 아무 데도 안 가는 죽은
링크가 된다. 기존 화면 11곳에 이 패턴이 남아 있으니 **이웃 화면을 복사할 때 같이 딸려오지 않게 확인한다.**

---

## 4. 채우기 — 컴포넌트, CSS, 팝업, 아이콘, 동작
**펴는 파일**: `component-guide.md`(§10 역인덱스 → 해당 §), `custom/**`·`ui/**` 디렉터리 나열,
`scripts/css-find.cjs` 실행 결과

### 컴포넌트 — Figma instance 이름이 답이다
1. `custom/**`·`ui/**` 를 **그 자리에서 다시 나열한다**(`CLAUDE.md` §1 — 세션 사이에 는다).
2. 프레임의 `instance` 이름(`selectbox`, `infobox`, `chip__single` …)을 `component-guide.md` §10 역인덱스에서
   찾는다. 없으면 §1~§9 의 케이스 표로 간다.
3. 쓰기로 한 컴포넌트는 **파일을 열어 props 를 확인한다.** 이름 끝 `2` 가 정본이다(`CLAUDE.md` §1).
4. 공통에 없으면 **만들기 전에 알린다.** 만들기로 하면 `component-guide.md` §13 대로 `custom/<name>/` 에
   만들고 `component-guide.md` 에 등재한다 — 화면 전용으로 두지 않는다. Figma 에 `COMPONENT` 로 등록된
   것은 공통 후보라는 신호다(`docs/figma-component-audit/` 에 413개 전수 분석).

### CSS — 찾고, 없으면 공통에 만든다
`CLAUDE.md` §2 의 ①(세 단계로 찾기) → ②(어디에 만드나) 순서 그대로. 만들었으면 `component-guide.md`
§12 에 등재한다. **스타일은 눈대중으로 그리지 않는다** — Figma 값을 그대로 가져온다.

### 팝업
- 팝업은 `GenericDialog2`. 화면 폴더 `components/` 에 두고, 블록 순서는 화면 파일과 같다(`CLAUDE.md` §3).
- 팝업이 화면의 상태(선택 행 등)를 봐야 하면 페이지에서 composable 을 **한 번만** 호출해 `provide()`,
  팝업은 `inject()` — 각자 다시 호출하면 상태가 갈라진다. 코드는 `docs/create/split-detail.md`.
- 팝업 상태별 모양(열림·빈 상태·에러)은 그 프레임을 §1 에서 따로 찍어 본다.

### 아이콘 — Figma 것을 그대로 가져온다
비슷해 보이는 걸 `lucide-vue-next` 에서 골라 쓰지 않는다. Figma 에 아이콘이 **130개 등록돼 있다**
(`icon/…` 이름). 그게 디자인 확정본이다.
```
Figma 프레임에서 아이콘 확인 → get_design_context 응답의 asset URL 로 SVG 내려받기
  → src/assets/images/icons/ 에 저장
  → src/components/custom/icon/icons.ts 에 등록
  → <Icon name="..." /> 로 사용
```
등록하면 다음 화면이 재사용한다. Figma 에 없는 아이콘만 lucide 를 쓰고, 그 사실을 인계 메모에 남긴다.

### 동작 — 사용자 지정이 있으면 그대로, 없으면 추론하고 메모에 적는다

| | 어디서 오나 |
|---|---|
| **화면이 어떻게 생겼는지** — 레이아웃, 간격, 색, 폰트, 아이콘, 상태별 모양 | **Figma (유일한 기준)** |
| **어떻게 동작하는지** — 조회 버튼, 팝업 호출, 필수항목, 컨펌창, 유효성 | 사용자가 지정하면 그대로(`CLAUDE.md` §4 의 표시 규칙). 없으면 **추론 + 인계 메모에 명시** |

추론할 때의 기본값: 피드백은 알림창 `dialog.alert`(`CLAUDE.md` §4), 팝업은 `GenericDialog2`, 탭은 화면 안에서 전환,
검색 sentinel 은 `'all'`(`CLAUDE.md` §5). **추론한 것은 반드시 인계 메모 5번에 목록으로 적는다** — 사용자가
그걸 보고 바로잡는 구조다. 조용히 넘어가면 틀린 채로 굳는다.
라벨/옵션값이 애매하면(저해상도, 잘린 텍스트) 합리적으로 구현한 뒤 **어떤 가정을 했는지** 인계 메모
3번에 적는다.

---

## 5. 마무리 — 대조, 인계 메모
**펴는 파일**: §1 에서 받은 스크린샷, 내가 만든 화면(`/views/{domain}/{화면ID}` 로 연다)

1. **Figma 이미지와 나란히 놓고** 빠진 영역이 없나 본다. 팝업·탭 프레임도 각각.
2. **파일이 성립하는지만 본다** — import 누락, 태그 안 닫힘처럼 명백한 것. 전체 `vite build`·`vue-tsc`
   는 굳이 돌리지 않아도 된다(45초씩 걸린다).
3. **값의 타당성·Figma 대조·규칙 준수 감사는 하지 않는다.** 그건 별도 검토 세션(`docs/review.md`)이
   한다. 만든 세션이 스스로 검토하면 자기 논리를 그대로 다시 따라가서 못 잡는다(`docs/rationale.md`).

### 인계 메모 — 결과 보고에 이 여섯 항목을 적는다
검토 세션은 이 메모를 보고 무엇을 확인할지 정한다. **3번이 두 세션을 잇는 다리다.**

1. **만든 것** — 화면ID, 파일 목록, **참고한 유형 문서와 기준 파일**(§2), **본 Figma 프레임 nodeId**
2. **Figma·사용자 지정과 다르게 한 것** — 이유와 함께. 없으면 "없음"이라고 적는다
3. **확실하지 않은 것** — 값이나 판단이 애매했던 지점을 그대로 적는다. 숨기지 않는다.
   - 예: "LNB `openIndex` 를 6으로 봤는데 `presets.ts` items 인덱스 확인 필요"
   - 예: "Figma 텍스트가 잘려 보여 라벨을 '전출부서'로 읽었음"
4. **새로 만든 공통 CSS·컴포넌트** — 목록과 `component-guide.md` 등재 여부
5. **Figma 에 없어서 임의로 채운 것** — 동작(팝업 연결·필수항목·유효성), 목업 데이터 형태, 컬럼 폭,
   placeholder 문구, lucide 로 대체한 아이콘
6. **라우터·LNB 등록 상태** — 규약대로 만들었으면 **"`plannedRoutes` 자동 등록 — 바로 열림,
   `/views/{domain}/{화면ID}`"** 라고 주소까지 적는다. `presets.ts` 는 안 건드렸으니 **"LNB 프리셋 미등록 —
   배치 등록 필요"** 라고 적는다. 화면군에 화면ID가 늘었으면 그것도(예: "PC-LPO-0802 팝업 추가됨").
   동료 파일과 중복이 있어 통합이 필요해 보이면 여기에 한 줄(`CLAUDE.md` §1 — 실행하지 않는다).

---

## 부록 — 지금 화면이 왜 안 뜨나
1. **NotReady("아직 작업하지 않은 화면입니다")가 뜬다** → 파일 경로가 규약과 다르다.
   `views/{domain}/{화면ID}/{화면ID}.vue` 인지, 폴더명·파일명이 화면ID와 **정확히** 같은지 확인한다.
2. **404 가 뜬다** → `plannedScreens` 에 그 화면ID가 없다. 한 줄 추가한다(§3).
3. **엉뚱한 화면이 뜬다** → `index.ts` 에 같은 `name` 이 직접 적혀 있다. 그쪽이 이긴다.
4. **LNB 가 닫힌 채 뜬다 / 활성표시가 없다** → `openIndex` 가 `-1` 이거나 라벨이 프리셋과 다르다(§3).
   프리셋에 그 메뉴가 아직 없는 거면 정상이다.

**미등록 화면 찾기** — 폴더는 있는데 어디에도 화면ID가 없는 것:
```bash
comm -23 \
  <(find src/views -maxdepth 2 -type d \( -name 'P[CM]-*' -o -name 'MO-*' \) | sed 's|.*/||' | sort -u) \
  <(cat \
      <(grep -oE "name: '(PC|PM|MO)-[A-Z]{3}-[0-9]{4}'" src/router/index.ts | sed "s/name: '//;s/'//") \
      <(grep -oE "'(PC|PM|MO)-[A-Z]{3}-[0-9]{4}'" src/router/plannedRoutes.ts | tr -d "'") \
    | sort -u)
```
반대로 라우터에만 있고 폴더가 없는 것은 **아직 안 만든 화면**(NotReady)이거나 **화면군**의 구성원이라
정상이다 — 지우지 않는다.
