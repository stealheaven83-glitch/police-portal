# PC-LPO-0701 장비관리 (화면군 0701~0714) — 검토 결과

- 1차: 2026-09-07
- 대상: `src/views/lpo/PC-LPO-0701/` 폴더 전체 (2,248줄)
  - 화면 `PC-LPO-0701.vue` 363줄
  - 팝업 8개 `components/` — Equipment(0702) · Vehicle112(0703) · Comm(0705) · Weapon(0707) · Ammo(0709) ·
    Cuffs(0711) · Etc(0713) · MaintenanceHistory(0714)
  - composable 11개 — 배럴 `PC-LPO-0701.ts` + 카테고리별 `mobile/comm/weapon/ammo/cuffs/etc/vehicle112/maintenance.ts`
    + `types.ts` + `dialogGridRedraw.ts`
- 기준: `docs/review.md` 항목 1~8
- 시안 대조: **하지 않았다** (Figma URL 이 요청에 없었다). 아래 "일관성" 항목 중 라벨 표기는 Figma 로 확정해야 한다.
- 8번(탭·팝업 눌러보기)은 **브라우저에서 실제로 누르지는 못했고** 배선(v-model:open · 열기/닫기 핸들러 ·
  재오픈 초기화)을 코드로 따라갔다. `vue-tsc` 는 이 폴더 에러 0건.
- 마지막 변경: `222619a`(09-04 wjm, style 방식 전면 수정) / `dfb93eb`(09-03 jhkim, help 버튼)
- **고치지 않고 목록만 남긴다.**

---

## 1. 동작 오류

### 1-1. 기존 행을 수정·저장해도 목록이 안 바뀐다 — comm/weapon/ammo/cuffs/etc 5개 전부
`comm.ts:96-103`, `weapon.ts:126-135`, `ammo.ts:96-104`, `cuffs.ts:131-142`, `etc.ts:88-94`.
`toXxxListRow()` 의 "수정" 분기가 `existing.typeLabel = …` 처럼 **행 객체를 제자리에서 고친다.**
- 목록은 `rowsByCategory = computed(() => allRows.value.filter(…))`(`PC-LPO-0701.ts:40`) 인데, 필터가 읽는 건
  `category` 뿐이라 다른 필드를 바꿔도 computed 가 다시 돌지 않는다 → 같은 배열 참조가 그대로 내려간다.
- `TabulatorGrid` 의 `:data` watch 는 참조 비교다(`TabulatorGrid.vue:1176 nextData !== prevData`) → 갱신 없음.
- **신규** 분기는 `allRows.value = [ …, ...allRows.value ]` 로 재할당해서 정상이다. 수정 분기만 걸린다.
- CLAUDE.md §5 "배열 상태는 항상 재할당" 그 케이스다. `allRows.value = allRows.value.map(r => r === existing ? { ...r, … } : r)`.

### 1-2. 기동장비(0702)는 저장해도 목록에 아무 것도 반영되지 않고 팝업도 안 닫힌다
`mobile.ts:107-109` `saveDetail()` 이 `detail.isSaved = true` 만 한다. 나머지 5개 카테고리는 `toXxxListRow()` 로
목록에 쓰고 팝업을 닫는데 기동장비만 없다. 신규로 만든 행이 목록에 안 생긴다.
(퍼블 범위 — 목업 배열 갱신은 §서두 표의 "짠다" 쪽이고, 다른 5개가 이미 하고 있다.)

### 1-3. 112차량조회(0703)에서 "차량지정"을 눌러도 부모 팝업에 안 나타난다
`vehicle112.ts:40` `assignVehicle112()` 가 `detail.tempVehicle` 에 쓰는데, 그 값을 보여줄
`EquipmentDetailDialog.vue:97` 의 임시차량 `<InputField2 … readonly />` 에 **`v-model` 이 없다.**
`v-model="detail.tempVehicle"` 하나 빠진 것.

### 1-4. 유지보수이력(0714) 팝업의 "삭제" 버튼이 닫기로 동작한다
`MaintenanceHistoryDialog.vue:22` — `@click="maintenanceDialogOpen = false"` 로 닫기 버튼과 같은 핸들러가
붙어 있다. 삭제 동작이 미정이면 핸들러를 비워야지, 닫기를 붙여 두면 사용자가 삭제된 줄 안다.
(행 선택 삭제라면 `select-mode="checkbox"` + `deleteSelected()` 가 §4 표준 형태.)

### 1-5. 112차량조회 팝업을 다시 열면 검색어는 남고 결과만 초기화된다
`vehicle112.ts:26-30` `openVehicle112Dialog()` 가 `vehicle112Rows` 와 선택은 리셋하는데 `vehicle112Keyword` 는
안 지운다 → 이전 검색어가 입력칸에 남은 채 전체 목록이 보인다. review.md 8 "다시 열었을 때 이전 입력이
남지 않는가"에 걸린다.

---

## 2. 일관성 · 데이터

### 2-1. 상세 팝업을 열면 목록에 있던 값이 빈 칸으로 나온다
`openXxxDetail(row)` 가 select/라디오 값을 목록 행에서 안 가져온다:
- 기동장비 `mobile.ts:86-104`: `location` `carType` `year` `info112` 전부 `''` (목록엔 배치장소 "지구대/파출소")
- 통신 `comm.ts:82-91`: `commType` `location` `serialNumber` 가 `''` (목록 typeLabel "원격조정기")
- 무기 `weapon.ts:107-119`: `gunType` `introducedDate` `location` 이 `''`
- 수갑 `cuffs.ts:114-127`: `cuffsType` 이 `''`, `status` 는 항상 `'normal'`
- 탄약 `ammo.ts:80-89`: `unit` 이 `''` (목록엔 "정")

원인은 목록 행이 **라벨**(`'지구대/파출소'`)을, 폼이 **value**(`'substation'`)를 들고 있어서 역변환이 없기
때문이다. 목업이라 값이 서로 안 맞는 건 넘어가더라도, "목록엔 있는데 상세엔 없다"는 화면상 틀려 보인다.
최소한 `locationOptions.find(o => o.label === row.location)?.value` 식으로 되돌리거나, 목업 행에 value 를 같이 둔다.

### 2-2. 탄약 컬럼 제목과 팝업 라벨이 다르다 — "결수량/청수량" vs "정 수량/현 수량"
- 목록 `PC-LPO-0701.vue:286-287` — `결수량` `청수량`
- 팝업 `AmmoDetailDialog.vue:24,31` — `정 수량` `현 수량`
- `types.ts:41-45` 주석 — `결수량` `청수량`
"정수량(定數量)/현수량(現數量)"이 맞아 보이고 "결/청"은 OCR 오타 같지만 **Figma 로 확정**한다. 확정되면 셋을 통일.

### 2-3. 검색 영역이 탭과 무관하게 "통신장비 관리명"이다
`PC-LPO-0701.vue:29`. 기동장비·무기·탄약 탭에서도 라벨이 "통신장비 관리명"이다. 공통 라벨("장비관리명")로 두거나
`activeCategory` 에 따라 바꾼다. 같은 곳 `selectItem`(`:115-120`)의 `select1/2/3` 도 자리표시자 그대로다.

### 2-4. 팝업마다 제목·버튼 문구가 갈린다
| 팝업 | 제목 | 닫기 버튼 | `InfoTable popup` | X 버튼 |
|---|---|---|---|---|
| Equipment | 기동장비 상세 | 닫기 | ❌ 없음 | ✅ |
| Comm | 통신장비 상세 | **취소** | ✅ | ✅ |
| Weapon | 무기 상세 | 닫기 | ❌ 없음 | ✅ |
| Ammo | **탄약** | 닫기 | ✅ | ✅ |
| Cuffs | 수갑 상세 | 닫기 | ✅ | ✅ |
| Etc | 기타 상세 | 닫기 | ✅ | ✅ |
| Vehicle112 | 112차량 조회 | 닫기 | — | **❌ `show-close-button=false`** |
같은 화면군의 형제 팝업이라 하나로 맞춘다. Figma 에 다르게 그려져 있으면 그게 답이다.

### 2-5. 저장/삭제 피드백이 팝업 하나에만 있다 (§4)
`EquipmentDetailDialog.vue:136-139` 만 `toast.success('저장되었습니다.')` 를 띄우고, 나머지 5개 상세 팝업의
저장·6개 팝업의 삭제는 toast 가 없다. 필수값 체크(`toast.warning`)도 어디에도 없다. §4 예시가 "반드시"는 아니지만
**한 화면군 안에서 하나만 다르면** 다음 사람이 어느 쪽이 의도인지 모른다 — 전부 넣거나 전부 빼고 인계 메모에 적는다.

### 2-6. 목업 날짜 `'2015-11-00'` — 존재하지 않는 날
`mobile.ts:75`, `comm.ts:54,69`, `weapon.ts:65,84`, `ammo.ts:47,65`, `cuffs.ts:59,80`, `etc.ts:35,52`.
날짜 컬럼에 `00일` 이 그대로 보인다. `'2015-11-01'` 등으로.

### 2-7. 무기 총번이 `SelectField` 다
`WeaponDetailDialog.vue:24-33` 총번(제조번호)을 `gunSerialOptions` 셀렉트로 고른다. 통신장비 제조번호는
`InputField2` 다(`CommDetailDialog.vue:37`). 총번은 장비마다 고유한 값이라 입력이 자연스러운데, Figma 가 셀렉트로
그려져 있으면 그대로 둔다 — 확인만.

---

## 3. 죽은 코드

- **`showAdvancedSearch`** — `PC-LPO-0701.ts:37,53`. store 에서 만들어 내보내는데 아무도 안 쓴다. 화면은 로컬
  `advancedSearchOpen`(`PC-LPO-0701.vue:122`)을 따로 쓴다.
- **`weaponDetail.isSaved`** — `weapon.ts:17,49,118`. 세 곳에서 쓰기만 하고 읽는 곳이 없다(기동장비의 `isSaved`
  는 차량번호 잠금에 쓰이므로 살아 있다).
- **`detail.tempVehicle`** — 1-3 과 같은 건. v-model 을 붙이면 살아난다.
- **`maintenanceCount`** — `types.ts:15` + 각 목업/`maintenance.ts:50` 에서 갱신하는데 화면에 표시하는 곳이 없다
  (유지보수이력 컬럼은 "보기" 버튼이다). 표시할 계획이 없으면 필드째 뺀다.

---

## 4. 규칙 위반

### 4-1. 화면 전용 스타일이 `InfoTable.module.css` 에 들어가 있다 (§2)
`src/components/custom/info-table/InfoTable.module.css:220` 에 **"장비관리 페이지 전용 레이아웃"** 주석과 함께
`.searchRow` `.searchInput`(112차량조회 검색줄) `.tempVehicleRow`(임시차량 줄) 가 있다. 컴포넌트 폴더의 `*.module.css`
는 "그 컴포넌트에 딸린 스타일"만 두는 곳이고(§2 ②), 화면 스타일은 `police-common.css` 에 `.lp-*` 로 간다.
- 같은 파일에 `.tempVehicleRow` `.searchInput` `.popTable` `.toolbar` `.deptGroup` `.toggleButton` 과 반응형 블록이
  **두 번씩** 선언돼 있다(붙여넣기 흔적). `.list-actions` 도 있는데 module 이라 해시가 붙어 원본 `.list-actions` 와
  무관한 죽은 선언이다.
- 전부 **카멜케이스**다 — §2 "어디서든 케밥케이스, `*.module.css` 예외 없음".
- 이 파일은 컴포넌트 공용이라 남의 파일이다(§1). 여기서 고치지 말고 **0701 이 쓰는 셋**(`searchRow` `searchInput`
  `tempVehicleRow`)만 `police-common.css` 로 새로 만들고(`.lp-popup-search-row` 등) 0701 쪽 참조를 바꾼 뒤,
  module 쪽 정리는 인계 메모로 남긴다.

### 4-2. 의도가 다른 클래스를 값이 같다고 갖다 썼다 (§2 ③)
`AmmoDetailDialog.vue:25,32` — 탄약 수량 스테퍼 줄에 `styles.tempVehicleRow`(**임시차량** 줄)를 쓴다. 선언
(`flex; align-items:center; gap`)이 맞아서 가져온 것인데, 나중에 임시차량 줄 간격을 바꾸면 탄약 팝업이 같이 깨진다.
4-1 을 처리하면서 역할 이름(`.lp-stepper-unit-row` 같은)으로 분리.

### 4-3. 라디오 묶음 — 있는 클래스를 두고 테일윈드를 썼다 (§1 · §2 ②)
`EquipmentDetailDialog.vue:9`, `CommDetailDialog.vue:42`, `CuffsDetailDialog.vue:34` — `<RadioGroup class="flex gap-6">`.
컴포넌트 prop 이라 형태는 허용이지만, 같은 module 에 **정확히 이 용도**의 `.info-table-radio`(`display:flex; gap:0.8rem
2.4rem; align-items:center`)가 있다. `:class="styles['info-table-radio']"` 로.

### 4-4. 버튼 폭 클래스 (§1 · guide §8-1)
`EquipmentDetailDialog.vue:98` `<Button class="min-w-21">차량조회</Button>`. `w-25` 와 같은 계열이다 — 베이스가
`min-w-25`(100px) 라 `min-w-21` 은 더 작아서 **아무 효과가 없다.** 지운다(폭을 줄이려면 `padding` prop).

### 4-5. 코드 스타일 (§3, 우선순위 낮음)
- `PC-LPO-0701.vue:122` 줄 끝 세미콜론 — 폴더에서 유일한 1건.
- `PC-LPO-0701.vue:27,29` `triggerClass=` `inputClass=` 카멜 prop — 팝업 8개는 전부 `trigger-class=` 케밥이다.
- `PC-LPO-0701.vue:13-15` `<SearchWrapper>` 앞 빈 줄 2개 + 들여쓰기 한 단 더 들어감.
- `PC-LPO-0701.vue:73` `useAutoTrigger` import 가 컴포넌트 import 보다 앞에 있다(0215 순서: vue → 외부 → 컴포넌트 →
  composable → menu·tab). `HelpButton` 이 맨 뒤인 건 0215 도 같아서 통과.
- `dialogGridRedraw.ts:24` `const redraw = () => {…}` 화살표 상수 — 클로저라 실질 영향 없음.
- `WeaponDetailDialog.vue:48` 배치장소 `SelectField` 만 `class="w-60"` — 형제 필드는 전부 `!space-y-0 flex-1`.
  `!space-y-0` 이 빠져 세로 여백이 다르게 나온다.
- `MaintenanceHistoryDialog.vue:59,61` `width: 130,field:` 쉼표 뒤 공백 없음.

---

## 5. 확인 필요

- **조회 버튼·상태구분 셀렉트에 핸들러/v-model 이 없다** (`PC-LPO-0701.vue:24-33`). 목업 필터링은 퍼블 범위
  (§서두 표). 안 만들기로 했으면 인계 메모에 있어야 하는데 이 폴더에 인계 메모가 없다.
- **LNB 항목명 "개인장비" vs 화면 제목·브레드크럼 "장비관리"** (`presets.ts:50` / `PC-LPO-0701.vue:4,112`).
  IA(`screen-id-map.md:188`)는 "장비관리"다. LNB 이름이 IA 와 다른 게 의도인지.
- **`EtcDetailDialog.vue:19` 빈 `<InfoField />`** — 2열을 맞추려는 자리채움인데, 빈 라벨 `<span>` + `role="group"`
  이 하나 렌더된다. 스크린리더가 빈 그룹을 읽는다. `InfoTable` 에 자리채움 방법이 따로 없으면 그대로 두되 알고 있을 것.
- **유지보수이력 팝업 "인쇄"·상세 팝업 "인쇄"** 가 `window.print()` 다 — 화면 전체가 찍힌다. 퍼블 범위 밖이면 그대로.
- **`InfoTable.module.css` 정리** — 4-1 의 중복 선언·카멜케이스는 컴포넌트 소유자 몫. 인계 메모 한 줄.

---

## 6. 확인했고 문제 없는 것

- **`PC-LPO-0714` 가 `screenTriggers` 에 없다** — 의도된 것. 특정 행을 골라야 열리는 팝업이라 URL 만으로 못 연다.
  `PC-LPO-0701.vue:147-150` 주석 + `useAutoTrigger.ts` "알려진 한계"에 적혀 있다. `/views/lpo/PC-LPO-0714` 로 직접
  들어가면 순방향은 매핑이 없어 아무것도 안 하고 목록(기동장비 탭)이 뜬다 — 깨지지 않는다.
- **`useEquipmentList()` 모듈 싱글턴** — `PC-LPO-0701.ts:72-88` 주석대로, `useAutoTrigger` 의 `router.replace` 마다
  리마운트돼도 입력값이 살아남게 하려는 것. `router/index.ts:80-86` `screenGroup` 까지 한 세트다.
- **라우터 `index.ts` 직접 등록** — 화면군은 `docs/create/tab-popup.md` §1 의 규약 예외. 0702~0714 는 `.map()` 으로
  같은 파일을 가리키고 `plannedRoutes` 는 `taken` 으로 걸러 중복 등록 안 된다.
- **`defineOptions({ name: 'PcLpo0701' })` = `componentName: 'PcLpo0701'`** 일치. KeepAlive 정상.
- **탭 전환** — `gridColumns` computed(`:317-324`) + `rowsByCategory` 가 `activeCategory` 하나로 갈린다. 6개 탭 전부
  컬럼 정의가 있고 목업이 카테고리마다 있다. `TabulatorGrid` 가 `columns` 변경 시 `setColumns` + `redraw` 한다.
- **팝업 열기/닫기 배선** — 8개 팝업 모두 `v-model:open` + 닫기 버튼 + X(1개 제외, 2-4) + ESC(shadcn 기본).
  0703 은 0702 안에서 `openVehicle112Dialog()` 로 연다. 신규는 `createEmptyXxx()`, 상세는 `Object.assign` 으로
  **매번 덮어써서** 이전 입력이 남지 않는다(1-5 의 검색어 하나 예외).
- **`buttonClass: 'h-9 w-12.5'`** (`PC-LPO-0701.vue:172`) — 테일윈드 문자열이 JS 에 있지만 `TabulatorGrid` 가 `Button`
  컴포넌트에 넘기는 **prop** 이다. §1 "컴포넌트 prop 값으로 넘기는 미세조정" 허용 형태.
- **`class="flex-1"` `class="my-5"`** — `TabulatorGrid` `Tabs` 컴포넌트에 붙인 prop. 허용 형태.
- **`field: 'id'` 컬럼 두 개**(번호·유지보수이력) — Tabulator 는 같은 field 를 여러 컬럼에 허용한다. 버튼 컬럼은
  `onButtonClick(row)` 로 행 전체를 받으므로 field 는 자리표시자다.
- **`.grid-wrap` `.btn-wrap` `.btn-wrap-group` `.list-actions` `.search-area` `.dept-name` `.group-gap2/3`** — 전부
  `police-style.css` 원본이고 §12-1 에 등재돼 있다(`.group-gap2/3` 은 표에 없지만 접두사 없는 원본 클래스라 §2
  "그대로 쓴다" 대상). **`.lp-label-text`** 는 `police-common.css:43` + §12-2 등재 + 쓰는 곳 0701 로 완결.
- **`police-style.css` 변경 없음 / `style/` 폴더 없음 / 인라인 `style=` 0건 / raw `<table>` 0건 / 블록 순서
  9개 파일 전부 `<template>` 먼저** — review.md 1·3·6 통과.
- **`useDialogGridRedraw`** — 팝업 scale 애니메이션 중 `fitColumns` 가 5% 좁게 재는 문제 대응. 주석이 원인·대응을
  다 적고 있어 다시 팔 필요 없다.
- **`addWeaponHandler` 재할당** (`weapon.ts:123`) — §5 함정을 알고 피했다. 1-1 은 같은 파일의 다른 함수가 놓친 것.
