# 프로젝트 작업 규칙 (지역경찰포털)

새 화면/페이지를 만들 때 이 문서를 먼저 읽는다. 여기 있는 규칙을 벗어나면 화면마다 구현 방식이
달라지고(코드 일관성이 깨지고), 이미 겪었던 버그를 다시 만들게 된다.

## 0. 이 파일과 같이 볼 문서
- `menu-tab-guide.md` — 사이드메뉴(LNB)/하단탭/KeepAlive 연동 상세 가이드. 새 화면 만들 때 반드시 같이 본다.

## 1. 컴포넌트 재사용 원칙
- `src/components/custom/**` 를 먼저 찾고, 없으면 `src/components/ui/**`.
- 둘 다 없으면(예: 주소검색 팝업처럼 이 프로젝트에 아직 없는 패턴) **새로 만들기 전에 없다는 걸
  눈에 띄게 알린다** — 조용히 혼자 판단해서 만들지 않는다.
- 인라인 스타일 금지. 전부 CSS Modules(`*.module.css`). **컴포넌트가 노출한 CSS 커스텀
  프로퍼티(`--flex-col-min-w` 같은) 값을 호출부에서 바꿀 때도 예외 없이 적용된다** —
  `style="--flex-col-min-w: 0"` 처럼 인라인으로 덮어쓰지 않는다. `layoutSplit.vue` 방식대로,
  그 화면 `module.css` 에 변수를 재정의하는 클래스를 만들고 `:class` 로 입힌다:
  ```css
  /* style/PC-XXX-NNNN.module.css */
  .narrowCol { --flex-col-min-w: 0; }
  ```
  ```html
  <FlexCol :class="styles.narrowCol">
  ```
  (`FlexGrid.module.css` 주석과 `DepartmentSearchDialog.vue`/`flex-grid.vue` 샘플은 지금
  반대로 인라인 style 을 쓰라고 안내/구현돼 있다 — 아직 못 고침, 새로 쓸 때 따라 하지 않는다.)
  이 오버라이드 클래스도 일반 CSS 와 같은 재사용 원칙을 따른다 — 그 화면에서만 쓰면 화면
  `module.css` 에, 두 화면 이상에서 같은 오버라이드가 반복되면 화면마다 복붙하지 말고
  아래 CSS 우선순위(공통 유틸 클래스 등)에 맞는 공통 파일로 올린다.
- **페이지 템플릿에서 테일윈드 유틸리티 클래스(`flex`, `mt-4`, `text-[1.5rem]` 등)를 직접 쓰지
  않는다.** 그 화면에서만 쓰는 스타일이면 페이지 `style/PC-XXX-NNNN.module.css` 에 이름 있는
  클래스로 만들어 쓰고, 여러 화면에서 반복되면 바로 아래 CSS 우선순위(디자인 토큰 → 공통
  유틸/레이아웃 클래스 → 컴포넌트 레벨 공통 CSS)를 먼저 따라간다. 이유: 나중에 디자인이 바뀔 때
  클래스 하나만 고치면 전체에 반영되게 하려는 거다 — 테일윈드를 흩뿌려두면 화면마다 들어가서
  뺄 거 빼고 추가할 거 추가해야 한다.
  - **이 규칙은 화면(페이지 `.vue`/그 화면의 `composable`)에만 적용된다.** `src/components/**`
    안에 있는 재사용 컴포넌트 자체가 내부적으로 테일윈드를 쓰는 건 상관없다 — 디자인이 바뀌면
    그 컴포넌트 파일 한 곳만 고치면 되기 때문에, 여러 화면에 흩어지는 문제 자체가 없다
    (예: `layoutHeader.vue` 의 `defaultClass`/`titleClass`).
  - 예외는 화면 쪽에서 이미 있는 컴포넌트(`Button`, `InputField2` 등)에 `class` prop 으로
    여백/폭 정도만 미세조정해서 얹는 경우뿐이다.
  - **테일윈드 문자열을 화면/컴포저블의 JS 변수·computed 에 담아 `:class` 로 바인딩하는 것도
    같은 위반이다** (예: `const cardClass = 'flex items-center gap-2 p-4 rounded'`를 페이지
    코드에 두는 경우). 템플릿에 안 썼을 뿐 스타일이 화면 코드에 흩어져 있는 건 똑같다 — 그 화면
    module.css 에 진짜 CSS 클래스로 뽑아야 한 곳만 고치면 된다.
  - **지금 있는 화면(2201/2204/2401 등)은 대부분 이 규칙 이전에 만들어져서 테일윈드가 그대로
    남아있다** — 새 화면부터 이 규칙을 따르고, 기존 화면은 차차 정리한다.
- 팀원이 컴포넌트 라이브러리를 계속 바꾸므로, 쓰기 전에 실제 props/경로를 다시 확인한다
  (기억에 의존하지 않는다).
- **3명이 각자 세션으로 동시에 작업 중이라 컴포넌트/CSS 목록이 세션 사이에도 계속 늘어난다.**
  지난 대화에서 이미 훑어본 적 있는 목록이라도 그건 그 시점 스냅샷일 뿐이다 — 새 화면 작업을
  시작하는 시점에 `src/components/custom/**`, `src/components/ui/**` 디렉터리를 그 자리에서
  다시 나열하고, `public/portal/asset/css/common/police-style.css` 도 처음부터 다시 읽는다.
  "저번에 본 목록에 없었으니 없다"고 기억으로 판단하지 않는다 — 그 사이 다른 팀원이 추가했을 수
  있다.
- **CSS 도 컴포넌트와 같은 원칙 — 그 화면에서만 쓰는 스타일이 아니면 새로 만들지 않는다.**
  아래 순서로 이미 있는지부터 확인:
  1. **디자인 토큰**: `public/portal/asset/css/common/police-style.css` (`index.html` →
     `/portal/police-entry.css` 로 이미 전역 로드됨, 페이지에서 따로 import 하지 않는다)에
     `--Text-body_0/1/2`, `--Base-primary`, `--Surface-primary`, `--Border_gray01/02/03`,
     `--Button-*` 등 색상/보더 변수가 다 정의돼 있다. hex 값 하드코딩하지 말고
     `var(--Text-body_1)` 처럼 가져다 쓴다.
  2. **공통 유틸/레이아웃 클래스**: 같은 파일에 `.btn-wrap`, `.btn-wrap-group`, `.search-area`,
     `.list-actions`, `.layout-wrap`, `.grid-wrap`, `.al`/`.ac`/`.ar`(정렬), `.hide`/`.show`,
     `.blind`(sr-only) 등이 이미 있다 — 페이지 module.css 에 같은 역할의 클래스를 새로
     만들기 전에 먼저 이 파일을 뒤진다.
  3. **컴포넌트 레벨 공통 CSS**: 라벨-값 표(등록/상세 화면 패턴)는
     `src/components/custom/info-table/InfoTable.module.css`, TabulatorGrid 는
     `src/assets/css/tabulator-theme.css`(이미 그리드에 전역 적용, 페이지에서 다시
     스타일링할 필요 없음)를 먼저 본다.
  4. 여기까지 없을 때만 그 화면 전용 스타일을 페이지 `style/PC-XXX-NNNN.module.css` 에 둔다.
  (`krds.min.css`는 `common/` 폴더에 파일만 있고 실제로는 어디서도 로드되지 않는다 — 참고 대상 아님.)

## 2. 화면 폴더 구조
화면ID(PC-XXX-NNNN) 단위로 폴더를 만든다:
```
views/{domain}/PC-XXX-NNNN/
  PC-XXX-NNNN.vue
  composable/PC-XXX-NNNN.ts   (또는 여러 파일로 쪼갠 composable/ 폴더)
  style/PC-XXX-NNNN.module.css
  components/                  (그 화면 전용 팝업 등, 재사용 안 하면 여기)
```
여러 화면ID가 한 페이지 폴더를 공유할 때(예: PC-LPO-0701 장비관리 — 탭/팝업이 실은 컴포넌트
하나)는 composable/components 를 그 페이지 폴더 밑에 두고, 진짜 별개 페이지들이 도메인만
공유할 때는 `views/{domain}/composable/`, `views/{domain}/components/` 처럼 도메인 레벨
공용 폴더를 쓴다(방범협력단체 목록/상세/등록 사례: `views/pub/composable/publicSafety.ts`).

**이 둘은 3번 항목의 상태공유 패턴과 그대로 짝을 이룬다**: "한 페이지 폴더 공유"는 3번의
패턴A(provide/inject), "도메인만 공유하는 진짜 별개 페이지들"은 패턴B(모듈 스코프 싱글턴)로
이어진다 — 폴더를 어디 둘지 정하는 순간 상태공유 방식도 같이 정해진다.

## 3. 상태 공유 — 두 가지 패턴, 헷갈리면 안 됨

### 패턴 A: 한 페이지가 여러 화면ID(탭/팝업)를 갖는 경우 (예: PC-LPO-0701 장비관리)
- `useXxxList()` 컴포저블을 페이지에서 **한 번만** 호출하고 `provide()`.
- 하위 팝업 컴포넌트들은 `inject()`로 같은 인스턴스를 공유(각자 다시 호출하면 상태가 갈라짐).
- 화면ID별 URL 동기화가 필요하면 `src/composables/useAutoTrigger.ts` 사용 —
  `{ '화면ID': [[ref, 값], [ref, 값], ...] }` 형태로 "이 화면ID면 이 ref들이 이 값" 을 선언.
  탭이든 팝업이든 구분 없이 같은 `[ref, 값]` 문법. 자세한 설계 이유는 그 파일 상단 주석 참고.
  - **비대칭(순방향≠역방향)이 필요한 화면은 이 맵에 넣지 않는다** — 예: 특정 행을 선택해야만
    여는 팝업은 URL만으로 직접 열 수 없다.

### 패턴 B: 여러 개의 진짜 별개 라우트가 같은 도메인 데이터를 공유하는 경우 (예: 방범협력단체 목록/상세/등록)
- 도메인 상태를 **모듈 스코프 싱글턴**으로 만든다:
  ```ts
  function createXxxStore() { /* ref, computed, 저장/삭제 함수 ... */ }
  let singleton: ReturnType<typeof createXxxStore> | null = null
  export function useXxxStore() {
    if (!singleton) singleton = createXxxStore()
    return singleton
  }
  ```
- **왜 필요한가**: `Layout.vue` 가 `<component :key="route.meta.screenGroup ?? route.fullPath">` 로
  렌더링해서, 화면ID(라우트)가 바뀔 때마다 컴포넌트가 통째로 리마운트된다(하단 멀티탭 UX를 위한
  의도된 설계). setup() 안에서 상태를 만들면 페이지 이동마다 리셋된다 — 싱글턴으로 막는다.
- 한 컴포넌트가 여러 화면ID 라우트를 갖고(패턴 A처럼) 그 사이 이동에서는 리마운트를 원치 않으면,
  라우트 meta 에 공통 `screenGroup: 'PC-XXX-0701'` 을 주고 `Layout.vue` 의 key 가 그걸 우선
  쓰게 되어 있다(이미 적용됨) — 새 화면군을 만들 때도 이 meta 를 잊지 않는다.

### 배열 상태를 바꿀 때는 항상 재할당, `splice` 로 제자리 수정 금지
```ts
// ❌ TabulatorGrid 의 :data watch(얕은 비교)가 변경을 못 감지한다
rows.value.splice(idx, 1, updated)
// ✅
rows.value = rows.value.map((r, i) => (i === idx ? updated : r))
```

## 4. 라우터 등록
- `src/router/index.ts` 에 `path: '/views/{domain}/{화면ID}'`, `name: '{화면ID}'`,
  `meta: { layout: 'WorkLayout', title: '...' }`.
- 화면ID가 많은 화면군은 배열 + `.map()` 으로 반복 등록(0701~0714 사례 참고). 필요하면
  `screenGroup` meta 도 같이 준다(3번 항목 참고).
- 페이지가 늘어날 때마다 이 파일에 계속 손이 가서 여러 명이 동시에 작업하면 git 충돌이 잦다 —
  아직 마이그레이션 전이지만, 각 페이지 폴더가 자기 라우트를 `route.ts` 로 export 하고
  `router/index.ts` 는 `import.meta.glob` 으로 자동 수집하는 방식으로 옮기는 게 검토된 적 있음.

## 5. 사이드메뉴(LNB) / 하단탭 — 반드시 `menu-tab-guide.md` 같이 볼 것
- `defineOptions({ name: 'XxxYyy' })` 필수 — `useBottomTabSetup` 의 `componentName` 과
  정확히 일치해야 KeepAlive 가 걸린다.
- **`useSideMenuSetup(presetKey: string)` 은 비동기다.** 같은 tick 에 이어서
  `sideMenuStore.setActiveChild(...)` 를 부르면, 프리셋 로딩이 늦게 끝나면서 방금 지정한 값을
  덮어써버리는 경합이 생긴다(실제로 겪은 버그). 화면마다 다른 activeChild/openIndex 가 필요하면
  **프리셋 객체를 인라인으로 펼쳐서** 동기 경로를 타게 한다:
  ```ts
  import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
  useSideMenuSetup({ ...publicSafetyMenu, activeChild: '단체정보리스트', openIndex: 2 })
  ```
  (프리셋 문자열 키는 그 프리셋의 기본 activeChild 와 화면이 정확히 일치할 때만 그대로 써도 된다.)

## 6. TabulatorGrid 쓸 때 주의사항
- `select-mode="checkbox"` + `ref.addRow(data, top)` / `ref.deleteSelected()` — 체크박스
  다중선택 + 추가/선택삭제 패턴은 이미 있다(`PC-COM-2301.vue` 참고), 직접 구현하지 않는다.
- `@row-selection-changed` 는 **데이터가 아니라 Tabulator RowComponent 배열**을 넘긴다.
  실제 필드가 필요하면 `row.getData()` 로 꺼낸다(또는 이미 데이터인 경우까지 방어적으로 처리).
- `layout="fitColumns"`(기본값)는 컬럼 폭을 컨테이너에 맞춰 나눠 갖는다. 컬럼이 많아
  가로 스크롤이 필요하면(예: 12개 장비 항목 컬럼) `layout="fitDataFill"` + 각 컬럼에 고정
  `width` 를 준다.
- KeepAlive 로 캐시된 화면이 다시 활성화될 때 그리드가 안 그려지던 버그는 컴포넌트 자체에
  `onActivated` → `redraw(true)` 로 고쳐져 있다(수정 완료, 새로 신경 쓸 필요 없음).

### 6-1. 셀 인라인 편집 — `cellType` 이미 다 있다
라벨-값 등록폼 대신 그리드 셀에서 바로 값을 고치는 화면(PC-COM-2301/2401/2204, PM-COM-0101 등)은
컬럼 정의에 `cellType` 만 지정하면 된다. 셀마다 커스텀 input/select 를 직접 마운트하지 않는다:
- `cellType: 'input'` — 텍스트 인라인 편집
- `cellType: 'checkbox'` — 체크박스 셀 (전체/읽기/편집 같은 권한 매트릭스에 흔함)
- `cellType: 'select'` — `selectOptions` 배열과 같이 쓰는 드롭다운 셀 (PC-COM-2401 의 목록수/페이지수)
- `cellType: 'button'` — `buttonLabel`/`buttonVariant`/`buttonVisible`/`onButtonClick` 으로
  행마다 다른 라벨·표시여부의 버튼 셀 (PC-COM-2204 의 "부서 조회" 버튼)

### 6-2. 페이지네이션 켜진 그리드에 행 추가(`addRow`)
`show-pagination` 인 그리드에서 새 행을 맨 아래에 붙이면(`addRow(data, false)`) 사용자가 보고
있는 페이지엔 안 나타난다 — 추가 후 `gridRef.value?.setPage('last')` 로 마지막 페이지까지
따라가야 방금 넣은 행이 보인다(PC-COM-2401 참고). 반대로 맨 위에 붙이는 경우
(`addRow(data, true)`, PC-COM-2301)는 항상 1페이지에 보이므로 필요 없다.

## 7. 저장/삭제 시 사용자 피드백 — toast 가 기본, dialog 는 예외적으로만
15개 이상 화면(PC-COM-2301, 2401, PM-COM-1001, PC-LPO-0501/0801, PC-PUB-0302/0303 등)이
이미 같은 패턴을 쓰고 있다 — 이 프로젝트의 사실상 표준이다:
```ts
function onDeleteSelected() {
  if (!selectedCount.value) {
    toast.warning('삭제할 OO을 선택해 주세요.')  // 그리드 select-mode="checkbox" + @row-selection-changed 로 selectedCount 갱신
    return
  }
  gridRef.value?.deleteSelected()
  toast.success('삭제되었습니다.')
}

function onSave() {
  if (!form.groupName.trim() || !form.groupType) {
    // 필수값 누락도 toast.warning 으로 막고 return, alert 로 막지 않는다
    toast.warning('필수 항목을 입력해 주세요.')
    return
  }
  // 저장 로직
  toast.success('저장되었습니다.')
}
```
- **기본은 이거다.** "저장하시겠습니까?" 같은 `dialog.confirm()` 확인창을 습관적으로 앞에 붙이지
  않는다 — 클릭 한 번 더 강제하는 마찰이고, 이 저장소 화면 대부분이 그렇게 안 한다.
- **`dialog.confirm()`은 되돌릴 수 없거나 연쇄적으로 다른 데이터까지 지우는 경우에만** 쓴다
  (PC-COM-2201 의 부서 삭제 — "하위 부서도 함께 삭제됩니다", PC-COM-2402 의 팝업공지 삭제 —
  "삭제한 공지팝업은 되돌릴 수 없습니다"). 그냥 그리드 선택 행 삭제/일반 저장은 해당 안 된다.
  **"권한/관리자 설정처럼 민감한 데이터라서"는 예외 사유가 아니다** — PC-COM-2201 의 사용자
  권한 저장(`onSave`)이 지금 confirm 을 쓰고 있는데, 이것도 이 규칙 기준으로는 위반이라
  toast 로 고쳐야 할 대상이다(아직 안 고침).
- **`dialog.alert()`**는 사용자가 그냥 지나치면 안 되는, 버튼 하나짜리 강제 확인용(예: 필수 입력
  누락을 모달로 막는 PC-COM-2402 의 `PopupNoticeDialog`). 단순 성공/경고 피드백에는 과하다 —
  toast 를 쓴다.
- 화면마다 이 세 가지(toast.warning / toast.success / dialog.confirm / dialog.alert)를 섞어
  쓰는 기준이 달랐던 적이 있다(PC-COM-2204 초안이 저장/삭제마다 confirm 을 붙였다가 위 규칙으로
  되돌린 사례) — 새로 만들 때 헷갈리면 이 절을 기준으로 삼는다.

## 8. 그 외 자주 겪는 함정
- **Select/SelectItem 의 value 는 빈 문자열(`''`) 을 쓸 수 없다.** "전체" 같은 sentinel 은
  `'all'` 처럼 실제 문자열로 쓴다.
- **`<script setup>` 은 런타임 값을 export 할 수 없다** (타입만 가능). 공용 컴포넌트에서 상수를
  내보내고 싶으면 별도 `<script>` 블록을 추가하거나, 아예 별도 `.ts` 파일로 뺀다 — 무리해서
  `<script setup>` 에 `export const` 를 쓰면 그 컴포넌트를 쓰는 모든 화면이 컴파일 에러로 깨진다.
- **id/for 중복, v-model 중복 바인딩**: 필드를 복붙해서 만들 때 id 나 v-model 을 안 바꾸고
  남겨두는 실수가 반복해서 나왔다(같은 화면 안에서 서로 다른 라벨 두 개가 같은 데이터를
  공유하게 됨). 새 필드를 복붙으로 만들면 id/v-model 을 반드시 다시 확인한다.
- **행 저장 시 카테고리/그룹 스코프 없이 id 만으로 찾기/삭제하기**: 여러 카테고리가 같은 id
  범위(1, 2, 3...)를 쓰면 `allRows.find(r => r.id === form.id)` 가 엉뚱한 카테고리 행을
  건드릴 수 있다. `r.id === form.id && r.category === 'xxx'` 처럼 항상 같이 확인한다.

## 9. 기획서/디자인 확인
- Figma MCP 가 rate limit 에 걸리는 경우가 잦다 — 이때는 사용자가 주는 스크린샷/PDF(페이지별
  이미지로 변환된 것)로 작업한다. PDF 자체는 poppler 미설치로 이 환경에서 못 읽으므로 이미지로
  요청한다.
- 화면 라벨/옵션값이 애매하면(기획서 저해상도, OCR 불확실 등) 조용히 추측만 하지 말고 합리적으로
  구현한 뒤 **어떤 가정을 했는지 결과 보고에 명시**해서 사용자가 바로잡을 수 있게 한다.
