# 컴포넌트 고르기 가이드 — "이럴 땐 이거"

CLAUDE.md §1(재사용 원칙)의 실행 편. §1은 "찾아봐라"까지 말하고, 이 문서는 **"찾으면 뭐가
나오는지"**를 말한다. 새 화면을 시작할 때 `docs/create.md` §2 의 유형 문서와 함께 본다.

경로는 전부 `src/components/` 기준. `custom/`이 1순위, `ui/`(shadcn-vue 프리미티브)가 2순위.
**공통 CSS는 §12**를 본다 — 새 스타일을 만들기 전에 거기부터 뒤진다(화면 전용 CSS 는 없다).

---

## 0. 먼저 알아야 할 3가지

### ① 이름 끝에 `2`가 있으면 `2`가 정본이다
같은 이름의 구버전이 남아 있다. **반드시 `2`를 쓴다.**

| 쓰지 말 것 | 쓸 것 | 실제 사용 |
|---|---|---|
| `input/InputField.vue` | **`input/InputField2.vue`** | 1 vs **38**개 화면 |
| `dialog/GenericDialog.vue` | **`dialog/GenericDialog2.vue`** | 1 vs **19**개 화면 |
| `dialog/AlertDialog.vue` | **`dialog/AlertDialog2.vue`** | 둘 다 미사용 |
| `dialog/ConfirmDialog.vue` | **`dialog/ConfirmDialog2.vue`** | 둘 다 미사용 |

구버전 파일에 deprecated 표시가 없어서 파일만 봐선 구분되지 않는다. 이 표가 유일한 근거다.

### ② Figma 이름으로 역인덱스를 찾는다
디자인 프레임의 `instance` 이름이 곧 컴포넌트 이름이다(`selectbox`, `infobox`, `chip__single`).
**추측하지 말고 §9 역인덱스에서 찾는다.** 전체 대조표는
`docs/figma-component-audit/MAPPING.md`(Figma 109개 전수).

### ③ 없으면 만들기 전에 알린다
§9에도 없고 `custom/**`·`ui/**`에도 없으면 **혼자 만들지 말고 없다는 걸 눈에 띄게 알린다**
(CLAUDE.md §1). 3명이 동시 작업이라 목록이 계속 늘어난다 — 디렉터리를 그 자리에서 다시 나열해
확인한 뒤 판단한다.

---

## 1. 화면 뼈대

| 이럴 때 | 이걸 쓴다 | 비고 |
|---|---|---|
| 화면 제목(h1) | `custom/title/PageTitle.vue` | 30개 화면. `as`로 h1/h2/h3 |
| 제목줄 좌우 배치(제목 + 우측 버튼) | `custom/title/PageHeader.vue` | 30개 화면. `bordered` 기본 true |
| 영역(섹션) 제목 | `custom/content-layout/layoutHeader.vue` | h1 아래 단계 |
| 2분할 레이아웃(목록+상세) | `custom/content-layout/layoutSplit.vue` | 9개 화면 |
| 분할 안의 패널(제목+내용) | `custom/content-layout/layoutPanel.vue` | `title` 필수, 접근성 이름 겸함 |
| 자유 배치(2단 분할·툴바 등) | `custom/flex-grid/FlexRow.vue` + `FlexCol.vue` | **라벨-값 폼에는 쓰지 않는다 → §4** |
| 상단 이동 버튼 | `custom/top-button/TopButton.vue` | |
| 빵부스러기 | `custom/breadcrumb/Breadcrumb.vue` | `path` 없는 항목은 현재 LNB 에서 같은 이름을 찾아 자동 링크(그 항목 또는 하위 첫 화면). 못 찾으면 글자만 — 화면은 `path` 를 안 줘도 된다(2026-09-15) |

LNB·하단탭·헤더/푸터는 화면에서 만들지 않는다 — `Layout.vue`와 `custom/sidemenu`,
`custom/bottom-tab`이 담당한다. `menu-tab-guide.md` 참고.

---

## 2. 검색 영역

| 이럴 때 | 이걸 쓴다 |
|---|---|
| 그리드 위 검색 영역 전체 | `custom/search/SearchWrapper.vue` (18개 화면) |
| ㄴ 부서 선택 | `custom/select/DepartmentCascadeSelect.vue` (20개 화면, 3단 종속) |
| ㄴ "상세조회" 접기/펴기 | `SearchWrapper`의 `collapsible` prop — 직접 만들지 않는다 |
| ㄴ 조회/초기화 버튼 | `SearchWrapper`의 `#btns` 슬롯 |
| 목록을 값으로 걸러내는 토글(개수 표시) | `custom/filter-chip/FilterChipGroup.vue` |
| 화면 가운데 놓는 **대형 검색바**(통합검색·사건대응) | `custom/search/SearchBar.vue` (3개 화면) |
| ㄴ 왼쪽 상태 뱃지("검색 원활") | `SearchBar`의 `status`/`statusTone` prop |
| 검색 전 **최근검색어 + 추천검색어** 두 칸 | `custom/search/SearchKeywordPanel.vue` (2개 화면) |

`SearchWrapper`(그리드 위 조회조건)와 `SearchBar`(검색어 한 줄짜리 대형 입력창)를 헷갈리지
않는다 — §9 형제 구분 참고. 헤더 우측의 작은 통합검색은 `PortalHeader.vue` 담당이다.

---

## 3. 목록 · 그리드

| 이럴 때 | 이걸 쓴다 |
|---|---|
| **목록 그리드 (기본)** | `custom/tabulator/TabulatorGrid.vue` (27개 화면) |
| 그리드 위 제목 + 버튼 줄 | `custom/grid-title/GridTitle.vue` |
| 셀 인라인 편집 | `TabulatorGrid` 컬럼에 `cellType` (아래 §3-1) — 직접 input 마운트 금지 |
| 체크박스 다중선택 + 추가/선택삭제 | `select-mode="checkbox"` + `addRow`/`deleteSelected` (아래 §3-1) |
| 페이지네이션 | `TabulatorGrid`의 `show-pagination` — 별도 `Pagination` 불필요 |
| 그리드 밖 독립 페이지네이션 | `custom/pagination/Pagination.vue` (드묾) |
| ㄴ 페이지 버튼만 가운데(총 건수·건수 셀렉트 없이) | `Pagination`의 `simple` prop (Figma `pagination__pc`) |
| 정적인 표(그리드 기능 불필요) — **본문에 단독으로** | `custom/table/TableWrapper.vue` |
| 정적인 표 — **InfoField 값 칸 안에** | `custom/table/FieldTable.vue` + InfoField 에 `class="lp-field-flush"` |
| 트리 | `custom/tree/TreeView.vue` |
| **결과가 비었을 때** | `custom/empty/NoData.vue` |

그리드 스타일은 `src/assets/css/tabulator-theme.css`가 전역 적용된다 — 다시 스타일링하지 않는다.

### 3-1. `TabulatorGrid` 사용법 — 이미 있는 것을 직접 구현하지 않는다
- **체크박스 다중선택 + 추가/선택삭제**: `select-mode="checkbox"` + `ref.addRow(data, top)` / `ref.deleteSelected()`. 예: `PC-COM-2301.vue`.
- **`@row-selection-changed` 는 데이터가 아니라 Tabulator `RowComponent` 배열**을 넘긴다. 필드가 필요하면 `row.getData()` 로 꺼낸다(이미 데이터인 경우까지 방어적으로 — `PM-PUB-0103` 참고).
- **셀 인라인 편집은 컬럼 정의에 `cellType` 만 지정한다.** 셀마다 커스텀 input/select 를 마운트하지 않는다.
  - `cellType:'input'` — 텍스트 인라인 편집. **숫자만** 받으려면 `cellNumeric: true`(숫자 아닌 글자 즉시 제거 + 모바일 숫자 키패드). 소수점·음수·범위검사는 `editor:'number'` + `validator`(더블클릭 편집)
  - `cellType:'checkbox'` — 체크박스 셀(전체/읽기/편집 같은 권한 매트릭스)
  - `cellType:'select'` — `selectOptions` 배열과 함께 쓰는 드롭다운(`PC-COM-2401` 목록수/페이지수)
  - `cellType:'button'` — `buttonLabel`/`buttonVariant`/`buttonVisible`/`onButtonClick` 으로 행마다 다른 라벨·표시여부의 버튼(`PC-COM-2204` "부서 조회")
- **페이지네이션 그리드에 맨 아래 추가**(`addRow(data, false)`)는 보고 있는 페이지에 안 나타난다 — 추가 후 `gridRef.value?.setPage('last')` 로 따라간다(`PC-COM-2401`). 맨 위 추가(`addRow(data, true)`)는 항상 1페이지라 불필요하다.
- **컬럼이 많아 가로 스크롤이 필요하면** `layout="fitDataFill"` + 각 컬럼에 고정 `width`. 기본 `fitColumns` 는 폭을 컨테이너에 맞춰 나눈다.
- **한 칸에 여러 줄이 들어가 행 높이가 늘어나야 하면** 그리드에 `class="lp-grid-multiline"` + 늘어나는 컬럼에 `variableHeight: true`(`PM-LPO-0223` 활동내역). 그리드 테마(`src/assets/css/tabulator-theme.css`)가 셀 높이를 4.8rem 으로 고정하고 있어서 이 클래스 없이는 `variableHeight` 만으로 안 늘어난다. 클래스가 그 테마 파일에 있는 것은 `police-override.css`(layer screen)로는 테마(레이어 없음)를 `!important` 없이 못 덮기 때문이다.
- KeepAlive 재활성화 시 그리드가 안 그려지던 버그는 컴포넌트가 `onActivated` → `redraw(true)` 로 처리한다 — 화면에서 신경 쓸 필요 없다.
- 목록을 갱신할 때는 **배열 재할당**(`CLAUDE.md` §5) — `splice` 는 `:data` watch 가 못 잡는다.

---

## 4. 등록 · 상세 폼

| 이럴 때 | 이걸 쓴다 |
|---|---|
| **라벨-값 정보 표 전체** | `custom/info-table/InfoTable.vue` (17개 화면) |
| ㄴ 표 안의 한 칸 | `custom/info-table/InfoField.vue` — 필수(*) 표시도 여기서 |
| 텍스트 입력 | **`custom/input/InputField2.vue`** (38개 화면) |
| 여러 줄 입력 | `custom/textarea/TextareaField.vue` |
| 셀렉트 | `custom/select/SelectField.vue` (37개 화면) |
| 날짜 하나 | `custom/datepicker/DatePicker.vue` (27개 화면) |
| 기간(시작~종료) | `custom/datepicker/DateRangePicker.vue` |
| 숫자 증감(-/+) | `custom/input/Stepper.vue` |
| 주소 입력 | `custom/address/AddressInput.vue` — `@search`로 팝업 연결 |
| 사용자 찾기 팝업(부서 트리 + 사용자 목록에서 한 명 고르기) | `custom/user-find/UserFindDialog.vue` — `v-model:open` + `@select`(계급·성명·소속). 공통 팝업 PC-COM-0701 |
| 리치 텍스트 본문 | `custom/editor/Editor.vue` (TOAST UI) |
| 파일 첨부 | `custom/file-upload/FileUpload.vue` |

스타일은 `custom/info-table/InfoTable.module.css`가 공통이다 — 화면에서 다시 만들지 않는다.

> **라벨-값 폼은 반드시 `InfoTable`+`InfoField`로 만든다. `FlexRow`/`FlexCol`로 만들지 않는다.**
> 한때 `FlexCol`에 `type="title"/"value"`가 있어서 같은 표를 두 가지 방법으로 만들 수 있었고,
> 실제로 `PC-LPO-0701`의 상세 팝업 6개 중 하나만 다른 방식으로 만들어져 있었다. 그래서 그 기능을
> 제거했다 — `FlexRow`/`FlexCol`은 라벨-값이 아닌 **자유 배치 전용**이다(§1).
>
> 한 행에 라벨-값 쌍을 몇 개 둘지는 `InfoTable`의 `columns`(1~4)로 정한다. 화면이 좁아지면
> `@media (max-width: 62.5rem)`에서 자동으로 1열이 되므로 별도 처리가 필요 없다.
> 필수 표시는 `#label` 슬롯에 점을 넣는다:
> ```html
> <InfoField for="equip-model">
>   <template #label>차종명<span :class="styles.requiredDot" /></template>
>   <InputField2 id="equip-model" v-model="detail.model" size="sm" class="!space-y-0 flex-1" />
> </InfoField>
> ```
> (`styles`는 `@/components/custom/info-table/InfoTable.module.css`)
>
> **클래스는 세 자리로 나눠 준다** — 어디에 붙는지가 다르다:
>
> | prop | 붙는 곳 |
> |---|---|
> | `class` | 칸 전체(라벨+값을 감싸는 바깥) |
> | `label-class` | **제목(라벨)** — `for` 유무로 `<label>`/`<span>` 이 갈리는데 양쪽 다 붙는다 |
> | `value-class` | **값(정보) 영역** |
>
> ⚠ `InfoTable.module.css` 는 `@layer` 밖이라 **레이어 있는 스타일을 전부 이긴다.**
> 그 파일이 이미 정한 속성(라벨 폭·테두리·grid 등)은 `police-common`/`override` 의 클래스로
> 못 덮는다(특정도를 올려도 안 된다). 셋 중 하나로 한다:
> **① `--info-label-w` 같은 CSS 변수** ② `!important` ③ 컴포넌트 수정.
> module 이 **안 정한** 속성(`background` `min-height` 등)은 그냥 클래스로 먹는다.

---

## 5. 선택 컨트롤

| 이럴 때 | 이걸 쓴다 |
|---|---|
| 체크박스 | `custom/checkbox/Checkbox.vue` (indeterminate 지원) |
| 라디오 | `custom/radio-group/RadioGroup.vue` + `RadioGroupItem.vue` |
| on/off 스위치 | `custom/switch/Switch.vue` — `size` default/lg/**xl** |
| 다중선택 드롭다운(체크 목록 + 확인) | `custom/select/MultiCheckSelect.vue` |
| 테두리 없는 텍스트형 셀렉트(툴바·정렬) | `custom/select/TextSelect.vue` |
| 폼 안에서 값 고르기(버튼 모양) | `custom/chip/ChipGroup.vue` |
| 체크 목록 항목 | `custom/checklist-item/ChecklistItem.vue` |
| 탭 | `custom/tabs/` — `variant` fill/line/**chip**/**category**, `tone` primary/secondary. chip 은 Figma `chip__single` 을 가로로 늘어놓은 탭(활성 탭에 체크), category 는 Figma `category tab`(pill, 항상 내용 폭) — `<TabsList variant="…">` 만 주면 된다 |

---

## 6. 팝업 · 다이얼로그

| 이럴 때 | 이걸 쓴다 |
|---|---|
| **레이어 팝업 (기본)** | **`custom/dialog/GenericDialog2.vue`** (19개 화면) |
| 폼이 들어간 팝업 | `custom/dialog/FormDialog.vue` |
| 되돌릴 수 없는 작업 확인 | `custom/dialog/ConfirmDialog2.vue` — **CLAUDE.md §4 조건 확인** |
| 성공/경고 알림, 버튼 하나짜리 확인 | `custom/dialog/AlertDialog2.vue` — `useDialog().alert()` 로 띄운다. **성공·경고 피드백의 기본**(CLAUDE.md §4) |
| 아직 로직이 없는 팝업 자리 | `custom/dialog/EmptyStubDialog.vue` (6개 화면) |
| 모바일 하단 시트 | `custom/bottom-sheet/BottomSheet.vue` |

> **일반 저장/삭제에는 `confirm`을 붙이지 않는다.** 알림창(`dialog.alert`)이 기본이다 — CLAUDE.md §4.

### 6-1. 알림창·확인창의 `device` 와 태그 제목 (2026-09-15 추가)
`useDialog().alert()` · `.confirm()` 의 옵션 두 개. **둘 다 선택이고, 안 주면 지금까지와 똑같다.**

| 옵션 | 값 | 무엇 |
|---|---|---|
| `device` | `'responsive'`(기본) / `'pc'` / `'mobile'` | 팝업 폭·제목 크기·본문 글자·버튼 폭을 어느 화면 기준으로 그리나. `'responsive'` 는 **1000px 경계로 자동**(`useResponsive.ts` 의 `BP_MOBILE`·`style.css` 의 `mo:`/`pc:` 와 같은 값) |
| `title` | 문자열 (**태그 가능**) | `v-html` 이라 태그가 그대로 그려진다. 시안 상단 아이콘은 여기에 `<img>` 로 넣는다 — `.lp-dialog-title img` 가 글자 위 가운데로 놓아 준다 |

```ts
await dialog.confirm({
  title: '<img src="/portal/asset/images/icon/ico_exclamation_32.svg" alt="" width="32" height="32">대기시간이 초과되었습니다.',
  description: '대기자가 많아 …',
  btnOk: '음성인식 시작',
  btnCancel: '취소',
  device: 'mobile',   // 이 팝업을 여는 버튼이 모바일 폭에서만 보인다
})
```
- **`title` 에 사용자 입력을 넣지 않는다.** 화면이 들고 있는 상수 문구 자리다(퍼블 목업).
- 기기별 치수는 `police-override.css` 의 `.lp-dialog-*` 가 **CSS 변수로만** 들고 있다(§12).
  미디어쿼리라 JS 폭 감시가 없고 첫 프레임 깜빡임도 없다. 값을 늘릴 땐 토큰만 추가한다.
- 타입·기본값은 `custom/dialog/dialogDevice.ts`. `GenericDialog2` 는 대상이 아니다.

---

## 7. 피드백 · 안내

| 이럴 때 | 이걸 쓴다 |
|---|---|
| 저장/삭제 성공, 필수값 누락 경고 | **알림창 `useDialog().alert()`** (CLAUDE.md §4) — toast 는 쓰지 않는다 |
| 결과/경고 박스(성공·실패·주의) | `custom/alert/Alert.vue` |
| 이해를 돕는 설명 박스 | `custom/infobox/InfoBox.vue` |
| 검색영역 아래 개인정보 오남용 경고 한 줄(오른쪽에 저장 버튼 등) | `custom/notice/PrivacyNoticeBar.vue` — 기본 슬롯에 버튼을 넣으면 양끝 정렬 |
| 페이지 상단 긴급 공지 띠 | `custom/alert/CriticalAlert.vue` |
| 처리 중 로딩 | `custom/spinner/Spinner.vue` |
| 진행률 막대 | `custom/progress/ProgressBar.vue` |
| 데이터 없음 | `custom/empty/NoData.vue` |
| 짧은 설명 말풍선(텍스트만) | `custom/table/tooltip/AppTooltip.vue` |
| 제목+본문+바로가기가 있는 도움말 | `custom/contextual-help/ContextualHelp.vue` |
| 안내 문구 여러 줄(불릿) | `custom/list/ListGroup.vue` + `List.vue` |

---

## 8. 보조 표시

| 이럴 때 | 이걸 쓴다 |
|---|---|
| 상태 표시(읽기 전용) | `custom/badge/Badge.vue` |
| 알림 점 / 숫자 | `custom/badge/BadgeDot.vue` / `BadgeNumber.vue` |
| 키워드(누르거나 지울 수 있음) | `custom/tag/Tag.vue` + `TagList.vue` |
| 제목·설명·태그를 묶은 카드 | `custom/card/Card.vue` |
| 카드를 세로로 쌓는 목록 | `custom/card-list/CardList.vue` — 목록(간격·0건)만 맡고 한 장은 슬롯. `<Card as="li">` 를 넣거나 직접 짠 `<li>` 를 넣는다 |
| 접었다 펴는 여러 항목 | `custom/accordion/` |
| 접었다 펴는 한 덩어리("더보기") | `custom/disclosure/Disclosure.vue` |
| 아이콘 | **Figma 것을 `icons.ts` 에 등록해 `<Icon name="…" />`** — 없을 때만 `lucide-vue-next` (`docs/create.md` §4) |

---

## 8-1. 버튼 폭 — `w-25` 는 쓰지 않는다, 컨텐츠 폭이면 `padding`

`custom/button/Button.vue` 는 베이스에 `min-w-25`(**최소 100px**)가 걸려 있다. 짧은 라벨("저장",
"삭제")이 제각각 폭으로 보이지 않게 하는 기본값이다.

| 원하는 것 | 이렇게 한다 |
|---|---|
| **기본 폭(최소 100px)** | 아무것도 안 준다. `class="w-25"` 는 **의미 없는 중복**이라 붙이지 않는다 |
| **컨텐츠에 맞는 폭**(100px 미만) | `padding` prop 을 준다 → `min-width` 가 0이 되고 좌우 여백이 그 값이 된다 |
| 그보다 넓게 고정 | `class="w-[…]"` 로 명시 |

```html
<Button variant="primary" size="sm">저장</Button>              <!-- 최소 100px -->
<Button variant="primary" size="sm" padding="12">저장</Button>  <!-- 글자 + 좌우 12px -->
<Button variant="primary" size="sm" padding="0.8rem">저장</Button>
```

- `padding` 값: 숫자/숫자문자열은 px 로 해석(`"12"`, `:padding="12"`), 그 외는 CSS 값 그대로(`"0.8rem"`).
- **`padding` 과 `w-*` 를 같이 주면 폭이 고정돼 `padding` 이 먹지 않는다.** 아이콘 버튼처럼 좁은 버튼이
  안 좁아지면 `class` 에 `w-25` 가 남아 있는지부터 본다.
- 세로 여백/높이는 `size`(`lg`~`xxs`)가 잡는다 — `padding` 은 좌우만 건드린다.
- `variant="icon"` 이 `min-w-25` 를 스스로 푼다(§8-2). `size-*` 만으로는 안 풀리니
  (twMerge 에서 `min-w` 는 별개 그룹) 새 아이콘 폭을 만들 땐 `min-w-0` 을 꼭 같이 적는다.
- 기존 화면 14곳에 `w-25` 가 남아 있다(정리 예정). **복붙할 때 같이 딸려오지 않게 확인한다.**

---

## 8-2. 아이콘만 있는 버튼 — `variant="icon"`, 크기는 `<Icon :size>` 가 정한다

텍스트 없이 아이콘 하나만 있는 버튼은 **CSS 로 만들지 않는다.** `custom/Button` 에 전용 조합이 있다.

```html
<Button variant="icon" aria-label="공유" @click="openShare">
  <Icon name="share" :size="24" />
</Button>
```

**크기의 주인은 `<Icon :size>` 하나다.** `Button` 의 `size` 는 **클릭 영역을 아이콘보다 키울 때만**
쓴다 — 둘이 같으면 적지 않는다(생략하면 버튼이 아이콘 크기에 저절로 맞는다).

- `variant="icon"` — 배경·테두리·hover 가 전부 없다. 자리만 차지한다.
- `size="20|24|32"` — **버튼 박스(클릭 영역)만** 잡는다. 내부 아이콘 크기는 건드리지 않는다.
- **`aria-label` 은 필수다.** 아이콘만 있어 접근 가능한 이름이 없다. 상태가 바뀌면 같이 바꾼다:
  `:aria-label="important ? '중요 해제' : '중요 표시'"`
- `type="button"` 은 `Button` 이 알아서 붙인다. 포커스 링(`focus-visible:ring-3`)도 베이스에 있다.

| 원하는 것 | 이렇게 한다 |
|---|---|
| **버튼=아이콘 같은 크기**(대부분) | `size` 를 **적지 않는다**. `<Icon :size="20">` 만 |
| **클릭 영역만 크게**(아이콘은 작게) | `size="24"` + `<Icon :size="20">` |
| 아이콘 색을 본문색으로 고정 | `class="lp-icon-dark"` 를 같이 준다 |
| 20/24/32 가 아닌 클릭 영역 | `size` 에 값을 추가한다. 화면에서 CSS 로 만들지 않는다 |

```html
<!-- 클릭 영역 24, 보이는 아이콘은 20 (PM-LPO-0108) -->
<Button variant="icon" size="24" aria-label="닫기" @click="close">
  <Icon name="closePop" :size="20" />
</Button>
```

- **`size` 만 주고 `:size` 를 빼면 안 된다.** 버튼 박스만 그 크기가 되고 아이콘은 `Icon` 의
  기본값 24px 로 그려져서, `size="20"` 이면 아이콘이 버튼 밖으로 넘친다.
- **lucide 아이콘은 `:size` 가 안 먹는다.** width/height 를 *속성*으로 써서 베이스의
  `[&_svg:not([class*='size-'])]:size-4` 에 져 16px 이 된다. `<component :is="Minus" class="size-5" />`
  처럼 클래스로 준다(`size-` 가 붙으면 그 규칙이 비켜 간다). `<Icon>` 은 인라인 style 이라 무관하다.
- 텍스트가 함께 있는 버튼은 여기가 아니라 §8-1 이다.
- 2026-09-11 이전에는 `.lp-icon-btn` CSS 클래스로 만들었다. 그 클래스는 제거됐다 —
  옛 화면을 복붙할 때 딸려오지 않게 확인한다. `size="icon-xs|icon-sm|icon|icon-lg"` 도 이것과
  다른 옛 스케일이다(PC-LPO-0216 이 쓴다) — 새 화면에서는 위 형태를 쓴다.

---

---

## 8-3. 시안 높이 → `size` 대응표 — 추측하지 않는다

루트 폰트가 10px 이라 `h-10` = 40px 이다. 시안에서 잰 높이로 아래 표에서 고른다. 표에 없는 높이면
가까운 값을 고르지 말고 알린다(컴포넌트에 그 크기가 없다는 뜻이다).

| 컴포넌트 | 20 | 24 | 32 | 40 | 48 | 56 |
|---|---|---|---|---|---|---|
| `Button` | — | `xxs` | `xs` | `sm` | `md` | `lg` |
| `Badge` | `sm` | `md` | `lg` | — | — | — |
| `Chip` | — | — | — | `small` | `medium` | `large` |
| `Tag` | — | `small` | `medium` | `large` | — | — |
| `Switch`(트랙) | `default`(32×20) | `lg`(40×24) | `xl`(64×32) | — | — | — |
| `SelectField` | — | — | `xs`(36) | `sm` | `md` | `lg`(기본) |
| `InputField2` · `DatePicker` | — | — | — | `sm` | `md` | `lg`(기본) |

- **`Tabs` 트리거는 눈금이 둘로 갈린다** — `size` 축과 `variant` 축이 따로다:

  | 축 | 값 | 높이 |
  |---|---|---|
  | `size` | `sm` / `default` / `lg` | 36 / 44 / 50 |
  | `variant` | `category` / `chip` | **40 / 48** (`size` 를 무시하고 고정) |

  시안이 40 이면 `variant="category"`(pill, 15px), 48 이면 `variant="chip"`(17px, 체크 아이콘)이다.
  `size` 로는 그 높이가 안 나온다.
- `Button` 은 `min-width 100px` 이 기본이라 시안 폭 100 이면 클래스가 필요 없고, 더 좁으면
  `padding` prop(§8-1).
- 시안 폰트 크기도 같이 본다 — 높이가 맞아도 글자가 다르면(15 vs 17) 다른 size 다.
- **`xs`(36) 는 `SelectField` 에만 있다.** `InputField2`·`DatePicker` 는 `lg | md | sm` 셋뿐, 기본 `lg`.
- `TextareaField` 는 `size` 가 없다 — 높이는 `:height` prop(숫자면 px).
- 전체 절차와 "컴포넌트 값 ≠ 시안" 일 때의 보고 형식은 `docs/create/dimensions.md` ③.

---

## 9. 헷갈리는 형제들 — 이걸로 구분한다

**Badge / Tag / Chip / FilterChip** — 넷 다 pill 모양이라 제일 많이 틀린다.

| | 무엇 | 조작 |
|---|---|---|
| `Badge` | 상태 표시 | 읽기 전용 |
| `Tag` | 콘텐츠에 붙은 키워드 | 누르거나 x로 삭제 |
| `Chip` | **폼 안에서 값 고르기** | 라디오/체크박스 대체 |
| `FilterChip` | **목록 위에서 걸러내기** | 토글, 보통 개수 표시 |

**Alert / InfoBox / CriticalAlert**

| | 무엇 |
|---|---|
| `Alert` | 결과·경고(성공/실패/주의) |
| `InfoBox` | 이해를 돕는 설명 |
| `CriticalAlert` | 좌측 색 배지("긴급"/"안전"/"안내") + "자세히보기"가 붙은 공지 띠 |

**AppTooltip / ContextualHelp**

| | 무엇 |
|---|---|
| `AppTooltip` | **텍스트 전용.** 닫기 버튼 등 인터랙티브 요소 금지(컴포넌트 주석에 명시된 팀 규칙) |
| `ContextualHelp` | 제목 + 본문 + "바로가기" + 닫기. 클릭으로 열고 닫는다 |

**Accordion / Disclosure** — Accordion은 테두리 있는 여러 항목 묶음, Disclosure는 테두리 없이
한 덩어리만 여닫는 "더보기".

**SelectField / TextSelect / MultiCheckSelect / ui-native-select**

| | 무엇 |
|---|---|
| `SelectField` | 폼용. 테두리 + 라벨 + 에러 메시지 |
| `TextSelect` | 테두리 없음. 툴바·정렬처럼 폼 밖에서 |
| `MultiCheckSelect` | 다중선택(체크 목록 + 확인 버튼) |
| `ui/native-select` | 프리미티브. 위 셋으로 안 될 때만 |

**TabulatorGrid / TableWrapper / FieldTable / InfoTable**

| | 무엇 | 놓이는 자리 |
|---|---|---|
| `TabulatorGrid` | 목록 그리드(정렬·페이지네이션·선택·인라인편집) | 본문 |
| `TableWrapper` | 기능 없는 정적 표. 상단 진한 선 + 흰 헤더 + 행 hover 강조 + 가운데 정렬 | 본문에 **단독** |
| `FieldTable` | 기능 없는 정적 표. 회색 헤더(라벨칸과 같은 톤) + 상단선 없음 + hover 없음 + 왼쪽 정렬 | **InfoField 값 칸 안** |
| `InfoTable` | 표가 아니라 **라벨-값 정보 표**(등록/상세 폼) | 본문 |

> 컬럼 헤더 행이 있는 표는 `InfoField` 로 못 만든다 — InfoField 는 행마다 **왼쪽 라벨**이 붙는
> 구조라 컬럼 헤더 개념이 없다. 바깥은 `InfoField`, 안쪽은 `FieldTable` 로 이중 구성한다
> (PC-LPO-0601 관내현황 › 순찰차별 관할구역).

**SearchWrapper / SearchBar / search__pc** — 셋 다 "검색"이라 제일 헷갈린다.

| | 무엇 | 어디 |
|---|---|---|
| `SearchWrapper` | 그리드 위 **조회조건 영역**(부서·기간·구분…) | `custom/search/SearchWrapper.vue` |
| `SearchBar` | 화면 가운데 놓는 **검색어 한 줄짜리 대형 입력창** | `custom/search/SearchBar.vue` |
| `search__pc` | **헤더 우측의 작은 통합검색** | `layout/portal/PortalHeader.vue` (이미 있다) |

---

## 10. Figma 이름 → 코드 역인덱스

디자인에서 본 `instance` 이름으로 찾는다. (전체 109개는
`docs/figma-component-audit/MAPPING.md`)

| Figma | 코드 |
|---|---|
| `table`, `table_2` | `custom/tabulator/TabulatorGrid.vue` (셀 단위 컴포넌트 아님) |
| `button`, `button_text`, `button_link` | `custom/button/Button.vue` (variant로 구분) |
| `text_input`, `Text Field` | `custom/input/InputField2.vue` |
| `selectbox` | `custom/select/SelectField.vue` |
| `select_text` | `custom/select/TextSelect.vue` |
| `date_selectbox` | `custom/select/TextSelect.vue` `size="xlarge"` 둘(연·월) + `class="lp-date-select"`, 묶음은 `.lp-date-select-row` — 전용 컴포넌트 없음(LPO-0216) |
| `text_area` | `custom/textarea/TextareaField.vue` |
| `date_input` | `custom/datepicker/DatePicker.vue` |
| `checkbox`, `checkbox__item/list` | `custom/checkbox/Checkbox.vue` |
| `radio_button`, `radio_button__list/item` | `custom/radio-group/` |
| `toggle_switch` | `custom/switch/Switch.vue` |
| `badge` / `badge__number` / `badge__dot` | `custom/badge/` |
| `tag`, `tag__list` | `custom/tag/` |
| `chip__single`, `chip__multi` | `custom/chip/` |
| `FilterChip` | `custom/filter-chip/` |
| `tab` | `custom/tabs/` |
| `chip`(chip__single 이 한 줄로 늘어선 프레임, 아래 내용이 바뀜) | `custom/tabs/` `variant="chip"`. 폼 값 고르기면 `custom/chip/` |
| `category tab`(pill 탭줄, 아래 내용이 바뀜) | `custom/tabs/` `variant="category"`. 개수 달고 목록을 거르는 거면 `custom/filter-chip/` |
| `accordion`, `Accordion` | `custom/accordion/` |
| `disclosure` | `custom/disclosure/Disclosure.vue` |
| `alert` | `custom/alert/Alert.vue` |
| `critical_alerts` | `custom/alert/CriticalAlert.vue` |
| `infobox` | `custom/infobox/InfoBox.vue` |
| `list`, `list_group` | `custom/list/` |
| `No Data` | `custom/empty/NoData.vue` |
| `spinner` | `custom/spinner/Spinner.vue` |
| `progress_bar` | `custom/progress/ProgressBar.vue` |
| `card` | `custom/card/Card.vue` |
| `Popup Title`, `modal` | `custom/dialog/GenericDialog2.vue` |
| `contextual_help`, `_trigger` | `custom/contextual-help/` |
| `tooltip__plan` | `custom/table/tooltip/AppTooltip.vue` |
| `tooltip__rich` | `custom/contextual-help/ContextualHelp.vue` |
| `top_button` | `custom/top-button/TopButton.vue` |
| `Adress input` | `custom/address/AddressInput.vue` |
| `공통 > 사용자 찾기`(12875:101668) | `custom/user-find/UserFindDialog.vue` |
| `file_upload__atomic__pc` | `custom/file-upload/FileUpload.vue` |
| `pagination bar`, `pagination__pc` | `custom/pagination/Pagination.vue` |
| `Page Title` | `custom/title/PageTitle.vue` |
| `.section_header` | `custom/title/PageHeader.vue` |
| `Grid Title` | `custom/grid-title/GridTitle.vue` |
| `Grid Handler` | `custom/tabulator/TabulatorGrid.vue` |
| `check list` | `custom/checklist-item/ChecklistItem.vue` |
| `breadcrumb` | `custom/breadcrumb/Breadcrumb.vue` |
| `footer_tab` | `custom/bottom-tab/BottomTab.vue` |
| `부서영역` | `custom/select/DepartmentCascadeSelect.vue` |
| `Input Label`, `필수입력` | `custom/info-table/InfoField.vue` |
| `divider` | `ui/separator` |
| `calendar` | `custom/calendar/calendar.vue` (FullCalendar 기반 — 주간/월간 토글·범례 포함) |
| 월 그리드 조회 달력(근무일정조회 등) | `custom/calendar/MonthScheduleCalendar.vue` — 연도·월 셀렉트 + 날짜칸에 배지/시간, `day-detail` 슬롯으로 칸 클릭 팝오버 |
| 숫자 증감 입력(− 값 ＋) | `custom/input/NumberStepper.vue` |
| `LNB Menu`, `header_templet__pc`, `masthead`, `footer__pc`, `main_menu*` | 화면에서 쓰지 않는다 — `Layout.vue`/`custom/sidemenu` 담당 |
| `search__pc` | 헤더 통합검색 → `layout/portal/PortalHeader.vue` |
| `Form`(통합검색 대형 입력창, 13315:97548) | `custom/search/SearchBar.vue` |
| `최근검색어`+`인기검색어`(11722:93550/93570) | `custom/search/SearchKeywordPanel.vue` |

---

## 11. 눈으로 확인

새로 만든 13종은 앱에서 **`/component/new-components`**에 전부 모아뒀다.
그 외 컴포넌트 샘플은 `src/views/component-sample/` 아래 각각 있다.

---

## 12. 공통 CSS — 새 스타일을 만들기 전에 여기부터

**화면 전용 CSS 는 없다.** 한 화면만 쓰더라도 처음부터 공통 파일에 공통 이름으로 만든다
(CLAUDE.md §2). 파일은 셋이고, 셋 다 `public/portal/asset/css/common/` 에서 전역 로드된다.

| 파일 | 참고 | 기입 | 무엇 | 이름 |
|---|---|---|---|---|
| `police-style.css` | ✅ | ❌ | 퍼블리싱 원본(reset·헤더/푸터·포털). **읽기 전용** | 접두사 없음 |
| `police-common.css` | ✅ | ✅ | 우리 공통 — **새 스타일은 기본적으로 여기** | `.lp-*` |
| `police-override.css` | ✅ | ✅ | 컴포넌트·라이브러리·테일윈드를 **덮어야 하는 것만** | `.lp-*` |

**찾을 때 세 파일은 한 덩어리다** — "어느 파일부터"가 아니다.
**만들 때만** 갈리고, 기준은 "덮어야 하느냐" 하나다(자세한 건 CLAUDE.md §2).

### 먼저 이걸 돌린다 — 이름이 아니라 **선언**으로 찾는다

```bash
node scripts/css-find.cjs "flex:1; min-height:0; overflow-y:auto"
```
세 파일을 전부 훑어 **완전 일치 / 부분 일치**를 나눠 보여준다(선언 순서가 달라도 잡는다).
- **완전 일치** → 그 클래스를 쓴다. 단 아래 표의 **의도** 칸을 보고 판단한다 —
  값만 우연히 같고 의도가 다르면 쓰지 않고 새로 만든다.
- **부분 일치** → 그 클래스를 쓰고 **차이나는 선언만** 새 클래스로 덧붙인다.
  기존 클래스는 고치지 않는다(다른 화면이 쓰고 있다).

아래 표들은 **사람이 훑어볼 때** 쓴다. 스크립트는 정확히 찾을 때, 표는 뭐가 있는지 볼 때.

---

### 12-1. `police-style.css` (원본) — 자주 쓰는 레이아웃

⚠ 이 파일에는 우리가 과거에 추가한 공통 클래스가 +625줄 섞여 있다. `police-common.css` 로
옮기는 작업이 **별도 배치로 남아 있다.** 그때까지 이 클래스들은 접두사 없이 그대로 쓴다.

| 이럴 때 | 클래스 | 실제 |
|---|---|---|
| 검색 영역 배경+간격 | `.search-area` | flex-wrap, gap 1.6/3.6rem, 회색 배경 (18개 화면) |
| 검색 폼 없이 부서 선택만 있는 줄 | `.dept-area` | flex-wrap, gap 1.2rem, 아래 여백 2rem (PC-PUB-0301) |
| 그리드 위 우측 버튼줄 | `.list-actions` | flex, 우측 정렬, gap 0.8rem, 아래 여백 2rem (17개) |
| 상세 화면 구역 제목 줄(연파랑 바+우측 버튼) | `.section-bar` / `.section-bar-actions` | radius 0.8rem, --Surface-primary 배경, 제목 1.7rem bold (PC-PUB-0302) |
| 좌우 양끝 배치 버튼줄 | `.btn-wrap` | flex, space-between, 100% |
| 버튼 몇 개 묶기 | `.btn-wrap-group` | flex, gap 0.5rem |
| 폼 아래 가운데 버튼줄(저장 등) | `.form-actions` | flex, 가운데 정렬, gap 0.8rem, 위 여백 2rem |
| 폼·패널 위 안내 문구(※ …) | `.form-note` | 1.4rem, `--Text-body_2`, 아래 여백 1.2rem |
| 가로 묶음(간격만) | `.group-gap1/2/3` | flex + align-center + gap 1/2/3단계 |
| 스크롤되는 본문 영역 | `.layout-wrap` | padding 2rem 2.4rem, overflow-y auto |
| 그리드 위 여백 | `.grid-wrap` | margin-top 2rem |

#### 인사 상세형 레이아웃 (사진 + 폼 + 하위 표)

증명사진 칸 옆에 라벨-값 폼이 붙고 아래에 관련 표가 오는 상세 화면용.
PC-LPO-0801 에서 올렸고 **PC-STT-0103 도 같은 것을 쓴다.**

| 이럴 때 | 클래스 | 실제 |
|---|---|---|
| 사진 칸 + 폼 가로 배치 | `.detail-layout` | flex, align-start, gap 2rem (2.4rem 이 필요하면 `.lp-detail-layout-wide` 를 같이) |
| 그 안 폼 영역 | `.detail-fields` | flex 1, min-width 0 |
| 상세 패널보다 길어질 때 이 영역만 스크롤 | `.detail-scroll` | flex 1, min-height 0, overflow-y auto (`ScrollWrapper` 를 쓰면 불필요) |
| 사진 칸 세로 묶음 | `.photo-box` | flex-column, gap 1.2rem, 폭 12rem 고정 |
| 증명사진 액자 | `.photo-frame` | 12×16.4rem, border+radius, 안쪽 `img` 는 `object-fit: cover` (회색 배경이 필요하면 `.lp-photo-frame-fill` 을 같이) |
| 사진 미등록 기본 이미지 | `.photo-frame .photo-empty` | 자르지 않고 원본 크기로 가운데 |
| 라벨 폭이 다른 `InfoTable` 두 개를 한 표처럼 잇기 | `.form-rest` | `border-top: 0` — 아래 표의 윗선을 지워 선 두 겹을 막는다 |
| 조회값만 보여주는 칸(입력 아님) | `.readonly-text` | 1.5rem, `--Text-body_0` (줄바꿈 막으려면 `.lp-nowrap` 을 같이) |
| 안내 문구 중 강조 부분 | `.notice-strong` | `--Base--point`, 700 |
| 상세 폼 아래 하위 표 구역 | `.transfer-section` | 위쪽 6px 회색 구분선 + 여백, flex-column |
| 그 구역 제목줄(제목 + 우측 버튼) | `.transfer-head` / `.transfer-title` | space-between / 1.7rem 700 |

⚠ `.detail-fields .dp--main:only-child { width:100% }` 도 같이 있다 — 값 칸에 `DatePicker` **하나만**
있을 때 칸 끝까지 늘려주는 규칙이다. 값 칸에 체크박스·셀렉트 같은 형제가 있으면 안 걸리니,
그럴 땐 `DatePicker` 에 `class="w-37"` 처럼 폭을 직접 준다.

#### 유틸

| 용도 | 클래스 |
|---|---|
| 정렬 | `.al` `.ac` `.ar` (좌/중앙/우, `!important`) |
| 표시/숨김 | `.show` `.hide` (`!important`) |
| 스크린리더 전용 | `.blind` / `.sr-only` |
| 밑줄·줄바꿈 | `.underline` `.break-all` |
| 부서명 강조 | `.dept-name` |
| 팝업 제목 | `.pop-title` `.pop-title-sub` `.pop-title-lv2` |

---

### 12-2. `police-common.css` (`.lp-*`) — 우리 공통

**의도 칸을 읽고 쓴다.** 값이 맞아 보여도 의도가 다르면 새로 만든다 — 지금 묶어두면 나중에
한쪽만 값이 바뀔 때 다른 화면이 같이 깨진다.

#### 텍스트

| 클래스 | 의도 | 쓰는 곳 |
|---|---|---|
| `.lp-heading-lg` | 구역·카드 제목(1.9rem 700) | 0601, 0802, IRC-0101 |
| `.lp-heading-md` | 한 단계 작은 제목(1.7rem 700) | IRC-0101 |
| `.lp-body-text` | 읽는 본문 문단(1.7rem) | IRC-0101 |
| `.lp-label-text` | 입력 옆 보조 라벨·안내(1.5rem `--Text-body_1`) | 0701 |
| `.lp-note-text` | 작성시각 같은 부수 정보(1.5rem `--Text-body_2`) | LPO-0102, 0104, 0207 |
| `.lp-mark-note` | `＊` 마커 + 안내 문구 한 줄(문구가 접혀도 마커 뒤에서 정렬). 마커 없는 `※` 안내는 `.form-note` | `AddressSearchDialog` |
| `.lp-nowrap` | 줄바꿈 금지 — `.readonly-text` 등과 **함께** 쓴다 | 0601 |
| `.lp-hit` | 검색 결과 건수처럼 제목 안 `<b>` 만 파랗게 | 0802 |
| `.lp-panel-head-em` | 패널 제목줄에 같이 보여주는 값(`--Base--point` 600) | 2204 |

#### 배치

| 클래스 | 의도 | 쓰는 곳 |
|---|---|---|
| `.lp-flex-fill` | 남는 가로폭을 채우되 내용이 넘치지 않게(flex 1 / min-width 0) | 2204, IRC-0101 |
| `.lp-row-end` | `flex-wrap` 으로 흐르는 줄(`.search-area` 등)에서 **이 항목으로 줄을 끝낸다** — 줄을 통째로 차지해 뒤 항목들을 다음 줄로 함께 내린다 | COM-0301 조회영역(성명) |
| `.lp-row-between` | 한 줄에 좌우로 벌려 놓기 | 2204, 0601, 0802 |
| `.lp-date-actions` | `police-common.css` — 날짜 선택이 있는 `.list-actions`에 추가하여 세로 가운데 정렬하고 폭이 부족하면 줄바꿈 | LPO-0202 |
| `.calendar-area` `-date` `-date-value` `-divider` `-group` `-options` | 근무일 선택 줄. **`.list-actions` 안 왼쪽**에 놓고(`margin-right:auto`) 오른쪽은 그대로 버튼. 구역 사이는 `-divider` 세로선(그룹 간격 36px). `-date-value` 는 날짜+달력아이콘(19px/600), `-options` 는 라디오 묶음(16px — `.lp-icon-row` 2rem 과 값이 다르다). **사용자 지정 이름이라 `lp-` 접두사가 없다** | LPO-0202 |
| `.lp-unit-row` | 한 값을 여러 칸으로 쪼갠 줄 — 작은 입력 + 단위 글자('시' '분' '세' '~') | PUB-0405 |
| `.lp-summary-row` | 값 텍스트 + 우측 버튼 (표 셀 안, 자기도 늘어남) | 0601 |
| `.lp-field-row` | 라벨+입력 여러 쌍이 한 줄에 늘어서고 좁아지면 줄바꿈 | 0601 |
| `.lp-radio-row` | `police-common.css` — 검색 폼 안의 라디오 묶음(항목 사이 24). `.lp-field-row`(12/20)·`.lp-unit-row`(4/8) 와 간격이 달라 따로 둔다 | STT-0402 |
| `.lp-visit-graph` `-bar` `-value` | `police-common.css` — 그리드 셀 안 가로 막대그래프(막대 8px + 값 한 줄, 사이 12). 막대 폭은 데이터라 포매터가 인라인 style 로 넣는다 | STT-0402 |
| `.lp-page-scroll` | **페이지 본문** 이 넘칠 때 이 영역만 세로 스크롤 (상세 패널 안쪽은 `.detail-scroll`) | 0801, 0802, IRC-0101 |
| `.lp-page-toolbar` | 화면 위쪽 부서선택 + 우측 버튼 줄 | 0601 |
| `.lp-section` / `.lp-section-title` | 구역 사이 간격 / 구역 제목 여백(`.lp-heading-lg` 와 함께) | 0601 |
| `.lp-section-head` | 제목줄 아래 실선(`.lp-row-between` 과 함께) | 0802 |
| `.lp-table-gap` | 표 위 여백 | 0601 |
| `.lp-note-gap` | 표 바로 위 안내 문구의 **아래** 여백(2rem). 위는 앞 요소에 붙는다 — `.lp-table-gap` 과 반대라 같이 쓰지 않는다 | LPO-0223 |
| `.lp-info-row-tall` | **`InfoField` 에 건다** — 값이 짧아도 칸이 높아야 하는 줄(여러 줄 입력 자리, 12rem). 행 병합 `rowSpan` 과 달리 옆 칸 배치를 안 건드린다 | LPO-0223 팝업 |
| `.lp-info-blank-cell` | `InfoTable` 에서 옆 칸이 두 행을 차지(row-span)해 비는 칸. 표 테두리만 이어 주는 자리라 1열로 접히면 감춘다 | PUB-0302/0303 |
| `.lp-info-label-narrow` | **`InfoTable` 루트에 건다** — 2~3글자 라벨뿐인 검색 폼에서 라벨 열을 7rem 으로 좁히고 안쪽 여백도 1rem 으로 줄인다. `:size` 와 같이 주면 인라인이 이겨 안 먹는다 | `AddressSearchDialog` |
| `.lp-meta-nowrap` | 조회 화면 위쪽 '최종 수정일' 한 줄 | 0601 |
| `.lp-placeholder-box` | 채울 것이 아직 정해지지 않은 자리(시안의 회색 상자) | PUB-0113 |
| `.lp-map-slot` | 그 회색 상자를 지도 자리 크기(41.8rem)로 키우고 모서리를 각지게 — `.lp-placeholder-box` 와 **함께** 쓴다 | `AddressSearchDialog` |
| `.lp-form-box` / `.lp-form-box-center` | 라벨 칸 없이 컨트롤만 들어가는 테두리 상자(라디오·체크박스 줄) / 그 안을 가운데로. 라벨-값 표면 `InfoTable` | PUB-0702, PUB-0208 |
| `.lp-choice-row` | 선택지(라디오·체크박스)가 **32** 간격으로 늘어서는 줄. 한 항목 안에서 고르는 좁은 묶음은 `.lp-radio-inline`(16) | PUB-0702 |
| `.lp-heading-sm` | 구역 안 하위 항목 제목('1. 촬영 경위' — 15px/700/#1E2124). 구역 제목은 `.lp-heading-md` | PUB-0702 |
| `.lp-subsection` | 그 하위 항목 묶음 — 구역 제목보다 12 들여 쓰고 묶음끼리 20 띄운다 | PUB-0702 |
| `.lp-note-dark` | `.form-note` 와 크기는 같고 색만 본문색(#1E2124)인 안내 문구('＊ …합니다') | PUB-0702 |
| `.lp-approval-cell` / `-person` / `-status` / `-pick` / `-decide` | 결재선 표 한 칸 — [사람 40][상태·조작 32]이 세로로 쌓인다 / 이름·셀렉트 줄 / 상태·버튼 줄(사이 12) / 결재자 셀렉트(좌우 8 더 들여씀) / 반려·결재 두 버튼이 칸을 반씩 채움 | PUB-0702 |
| `.lp-approval-table` | 그 결재선 **표 자체**의 모양 — 목록 표(위 진한 실선)와 달리 테두리 상자 + 회색 머리줄. `TableWrapper` 에 건다 (override) | PUB-0702 |
| `.lp-choice-input` | [라디오·체크박스][입력칸]이 한 줄로 붙는 묶음(사이 8). 라벨을 입력칸 높이(40)에 맞춰 가운데로 되돌린다 (정렬 규칙은 override) | PUB-0702 |
| `.lp-paren-group` / `.lp-paren` | 괄호로 묶인 선택지 줄('실내 ( … ) 실외') — 괄호 양옆 6. 괄호를 라벨 글자에 넣으면 비활성일 때 같이 흐려지므로 따로 그리고 색을 고정한다 | PUB-0702 |
| `.lp-form-box-wide` | `.lp-form-box` 와 **함께** — 좌우 여백이 넓은 상자(16 20) | PUB-0702 |
| `.lp-row-bottom` | `.lp-row-between` 과 **함께** — 그 줄의 항목 높이가 다를 때 아래로 맞춘다(제목 글자와 버튼의 밑선) | PUB-0702 |
| `.lp-text-dark` | 컴포넌트가 회색으로 그리는 라벨·문구를 본문색(#1E2124)으로 되돌린다. `label-class` 로 넘긴다 | PUB-0702 |
| `.lp-char-count` | 입력 글자수('0/4000') — 지금 글자수만 파랑. `TextareaField` 의 `show-count` 는 한 덩어리라 색을 못 나눠 화면에서 직접 그릴 때 쓴다 | PUB-0702 |
| `.lp-guide-list` | 안내 상자(`Alert`) 안의 **번호** 목록(작성 요령 1·2·3). 점 목록은 `.lp-dot-list` | PUB-0701 |
| `.lp-unit-text` | 입력 옆 단위 글자('(발)' '회' '명'). 배치는 `.lp-unit-row` 가 맡고 이건 글자 모양만 | PUB-0701 |
| `.lp-dot-item` | 상자 안 한 항목을 여는 작은 라벨(앞에 가운뎃점). 라벨-값 표면 `InfoField` | PUB-0701 |
| `.lp-cell-lines` | 표 한 칸에 여러 줄이 들어가는 묶음(강조 줄 + 설명 줄, 제목 + 점 목록). 셀 기본이 가운데 정렬이라 이 묶음만 왼쪽으로 되돌린다 | PUB-0701 작성 요건 팝업 |
| `.lp-link-danger` | 아이콘 + 붉은 글자로 주의를 끄는 링크(Figma button_link 경고 톤). 파란 경로 링크는 `.lp-path-link` | PUB-0701 |
| `.lp-survey-list` / `.lp-survey-item` / `.lp-survey-choice` | 테두리 없는 설문 문항 나열(좌 문항 · 우 선택지). 라벨-값 표는 `InfoTable` | PUB-0201 |
| `.lp-score-box` | 설문 합계 점수 줄(가운데 정렬 회색 띠) | PUB-0201 |
| `.lp-status-done` | 결재선 등에서 '완료' 상태만 색으로 구분 | PUB-0702 |
| `.lp-search-flush` | **`SearchWrapper` 에 건다** — `#form`·`#btns` 줄의 상하 여백(py-5)을 없앤다. 조회조건 한 줄만 있고 `no-background` 라 띄울 면이 없는 화면용. 좌우 여백과 아래 간격은 그대로 (override) | PUB-0401, PUB-0404 |

#### 아이콘 버튼

| 클래스 | 의도 | 쓰는 곳 |
|---|---|---|
| ~~`.lp-icon-btn` `-20` `-24` `-32`~~ | **2026-09-11 제거** — `<Button variant="icon">` + `<Icon :size>` 로 대체(§8-2) | — |
| `.lp-icon-dark` | 아이콘 색을 상속이 아니라 본문색으로 고정. `Button` 의 `class` 로 준다 | 0601 |
| `.lp-icon-row` | 아이콘 여러 개가 가로로 놓이는 줄 | LPO-0102, 0104, 0122 |

#### 2분할 상자 · 팝업

| 클래스 | 의도 | 쓰는 곳 |
|---|---|---|
| `.lp-pane-box` / `.lp-pane` / `.lp-pane-fixed` / `.lp-pane-title` | 테두리 안에서 좌우로 나뉘는 목록 상자(폼 화면 2분할은 `LayoutSplit`) | 2204 |
| `.lp-pane-title-text` / `.lp-pane-title-count` | `.lp-pane-title` h3 에 `.lp-row-between` 을 더해 **제목 왼쪽 + 건수 오른쪽**으로 펼 때 양쪽을 감싼다(숫자는 `.lp-em-primary`). reset 이 span 에 다시 주는 line-height 1.5 를 제목바 줄 높이로 되돌려 옆 칸 제목바와 높이가 같아진다 | `UserFindDialog` |
| `.lp-pane-box-fill` | **높이를 고정한 팝업**(`GenericDialog2 :height`)의 `.pop-body` 안에서 `.lp-pane-box` 가 남는 높이를 다 가져간다(스크롤은 칸 안에서만). 상자 높이를 못 박는 `.lp-pane-box-tall` 과는 별개 | `UserFindDialog` |
| `.lp-pane-fill` | 칸 제목 아래를 **그리드가 다 채우는** 칸 본문(세로 flex, 여백 12/24/24). 안쪽 그리드는 `height="100%" class="flex-1"`. 그리드 높이를 고정하는 `.lp-pane-wrap`(12/12/20) 과는 별개 | `UserFindDialog` |
| `.lp-selected-bar` | 선택한 항목을 칩으로 늘어놓는 회색 바 | 2204 |
| `.lp-dialog-head` / `.lp-dialog-head-title` / `.lp-dialog-head-label` | 팝업 본문 위쪽 제목줄(`.lp-row-between` 과 함께). `-label`+`-title` 은 "권한명: 범죄예방대응국" 처럼 **크기·굵기는 같고 색만 다른** 라벨·값 짝(1.9rem/600). 줄 배치는 `.group-gap3`. 페이지 액션바의 `.list-actions-title`/`.list-actions-part`(2rem/700)와는 별개다 | 2204 |
| `.lp-grid-title` `-label` `-count` `-num` | 그리드 위에 얹는 회색 제목 바(왼쪽 표 이름 + 오른쪽 건수, 숫자만 포인트색). 면이 채워진 한 줄이라 `LayoutPanel` 의 `.lp-pane-title` 과는 별개 | 2207 전체 사용자 팝업 |
| `.lp-pop-body-pager` | 페이지네이션으로 끝나는 팝업 본문(`.pop-body` 와 함께). `.pop-body` 의 overflow:hidden 이 Pagination 의 -8px 음수 아래여백을 잘라먹는 것을 막는다 | 2207 전체 사용자 팝업 |
| `.lp-dialog-body` / `.lp-dialog-subtitle` / `.lp-dialog-footer` | 팝업 본문 세로 묶음(16) / 부제 / 우측 버튼줄 | 0601, LPO-0303 |
| `.lp-search-form-gap` | 팝업 안 검색 폼의 행·열 간격 | 0601 |
| `.lp-search-form` | **`SearchWrapper` 가 #form 슬롯 감싸개에 직접 붙인다(화면에서 걸 필요 없음)** — 상세조회 조회영역 안 라벨의 글자색 `--Text-body_1`(#464C53) · 최소 폭 40px (override) | SearchWrapper 쓰는 전 화면 |

#### 통합검색 · 시나리오 검색 (본문을 가운데 정렬하는 화면)

| 클래스 | 의도 | 쓰는 곳 |
|---|---|---|
| `.lp-search-hero` | 큰 검색바 — 위 여백 크게(검색 전) | 0801, 0802 |
| `.lp-search-clear` (+ `.lp-has-clear`) | 대형 검색바 안 "검색어 지우기" 버튼. 돋보기 왼쪽에 뜨고, 뜰 때만 입력 오른쪽 여백을 넓힌다(`.lp-has-clear` 는 `.search-bar` 에) | `SearchBar` |
| `.lp-search-center` | 검색한 뒤라 위 여백 없이 붙는 검색바 | IRC-0101 |
| `.lp-content-panel` / `.lp-content-panel-pad` | 본문 폭 120rem 가운데 / 좌우 여백 | 0801, 0802, IRC-0101 |
| `.lp-keyword-split` | **override** — `SearchKeywordPanel` 두 칸을 시안 비율(795:356)로 나누고 사이에 세로 구분선. 컴포넌트 기본은 반반(`grid-cols-2`)에 구분선 없음. `lg` 이상에서만 걸어 모바일 1칸 접힘을 살린다 | IRC-0101 |
| `.lp-result-section` / `.lp-result-item` / `.lp-result-summary` | 카테고리 구역 / 결과 한 건 / 2줄 말줄임 요약 | 0802 |
| `.lp-result-pagination` | 결과 아래 페이지네이션 여백 | 0802 |
| `.lp-link-list` / `.lp-path-link` | 메뉴 경로 링크만 나열 / 그 링크(Figma button_link) | 0802 |
| `.lp-ai-answer` + `-head` `-icon` `-body` | AI 생성 답변 상자 | IRC-0101 |
| `.lp-answer-block` / `.lp-bullet-list` / `.lp-answer-note` | 답변 안 소구역 / 불릿 / **칸 맨 아래에 붙는** 주의문(`margin-top:auto` — 세로 flex 부모 안에서만 의도대로 선다) | IRC-0101 |
| `.lp-block-title` | **소구역 제목의 아래 여백(8)** — 구역 제목의 `.lp-section-title`(12)보다 한 단계 좁을 때. **제목 크기는 이게 정하지 않는다** — 같이 쓰는 클래스가 정한다(`.lp-heading-lg` / `.lp-heading-sm` / `.lp-note-text2`). IRC-0101 전용이 아니다 | IRC-0101, LPO-0202 팝업, LPO-0601 팝업, LPO-0301 |
| `.lp-answer-main` | AI 답변의 **좌측 본문 칸**. 주의문을 바닥에 붙이려고 세로 flex 다 — 남는 폭만 채우면 되는 자리엔 `.lp-flex-fill` 을 쓴다 | IRC-0101 |
| `.lp-ref-column` | 우측 참고자료 칸. **왼쪽 세로 구분선을 이 칸이 그린다**(본문 칸 높이만큼 꽉 차야 해서). 폭 29.2rem + 여백 2.4rem + 선 0.1rem = 31.7rem | IRC-0101 |
| `.lp-ref-list` / `.lp-ref-desc` / `.lp-ref-link` | 참고자료 아코디언 목록(간격 1.2rem) / 펼쳤을 때 설명(1.5rem) / 그 아래 문서 링크(1.3rem 밑줄) | IRC-0101 |
| `.lp-ref-item` / `.lp-ref-trigger` / `.lp-ref-body` | **override** — `custom/accordion` 의 카드·트리거·본문 기본 모양(높이·글자·아래선·여백)을 참고자료 시안에 맞게 되돌린다. 아코디언을 카드 안에 얹을 때만 쓴다 | IRC-0101 |
| `.lp-dialog-pc` / `-mobile` / `-responsive` | **override** — 알림창·확인창(`AlertDialog2`/`ConfirmDialog2`)의 기기별 치수를 **CSS 변수로만** 들고 있다(폭·제목·본문글자·버튼폭). 화면이 직접 붙이지 않는다 — `useDialog` 의 `device` 옵션이 붙인다(§6-1) | `useDialog` |
| `.lp-dialog-title` / `-desc-box` / `-desc` / `-footer` | **override** — 위 변수를 실제로 읽는 자리. `.lp-dialog-title img` 는 제목에 넣은 아이콘을 글자 위 가운데로 놓는다. **컴포넌트가 붙이므로 화면에서 쓸 일이 없다** | `AlertDialog2`, `ConfirmDialog2` |

#### 메모 목록 카드 · 등록 폼

| 클래스 | 의도 | 쓰는 곳 |
|---|---|---|
| `.lp-toolbar-left` / `.lp-toolbar-right` | 목록 위 컨트롤 바 좌/우 그룹(Figma 실측 24 / 32px — `group-gap` 은 4·8·12뿐) | LPO-0101 |
| `.lp-card-grid` | 카드 최소 46rem, 남는 폭 균등 분배(≈3열) | LPO-0101 |
| `.lp-memo-card` + `-selected` `-check` `-body` `-titlerow` `-title` `-titlebtn` `-actions` `-preview` `-meta` | 메모 카드 한 장 (Figma 'Memo Li') | LPO-0101 |
| `.lp-narrow-form` / `.lp-field` / `.lp-form-actions-center` | 가운데 정렬 등록 폼(본문 1000px) / 라벨+입력 세로쌍 / 하단 가운데 버튼줄 | LPO-0102, 0104 |
| `.lp-summary-box` + `-filled` `-loading` `-redo` | AI 요약 영역(빈 상태 점선 / 채워지면 실선) | LPO-0104 |
| `.lp-dropzone` / `.lp-dropzone-txt` | 첨부파일 드롭존 | LPO-0104 |
| `.lp-file-list` `-count` `-item` `-name` `-remove` | 첨부파일 목록(구분선 방식) | LPO-0104 |
| `.lp-upload-result` / `.lp-rule-title` / `.lp-error-list` | 드롭존 아래 결과 구역(위 16px) / 위아래 가로선으로 구역을 여는 소제목 / 실패 사유 불릿 목록(1.5rem — **본문용 `.lp-bullet-list` 는 1.7rem 이라 다른 것**) | PUB-0111 업로드 팝업 |
| `.lp-file-hint` | 첨부 버튼 옆 용량 안내(좁아지면 줄바꿈) | 2402 |
| `.lp-summary-box-read` | 읽기 전용 요약 블록(테두리 없이 채워진 면). **입력용은 `-filled`** | LPO-0102 |
| `.lp-file-boxes` / `.lp-file-box` / `.lp-file-link` | 첨부파일을 테두리 박스로 나열 / 박스 한 줄 / 그 안의 다운로드·삭제 링크 | LPO-0102, 0104, 0217 |
| `.lp-hidden-input` | 버튼/드롭존이 대신 여는 숨은 file input | LPO-0104, 0217 |
| `.lp-cal` `-toolbar` `-grid` `-head` `-cell` `-cell-out` `-cell-open` `-daterow` `-date` `-sun` `-sat` `-holiday` `-events` `-event` `-event-time` `-popover` `-popover-head` `-popover-list` `-popover-row` `-popover-names` | 월간 일정 달력(`MonthScheduleCalendar`) 전용. FullCalendar 기반 `calendar.vue` 와 별개 | LPO-0108 |
| `.lp-setting-bar` | 화면 위쪽 설정 한 줄(회색 면) | LPO-0122 |
| `.lp-mainset-preview` `-col` `-slot` `-slot-reverse` `-badge` `-card` `-card-title` `-card-img` `-empty` `-empty-tall` `-guide` `-menus` `-group-title` `-menu-item` | 메인화면 카드 배치 설정 | LPO-0122 |
| `.lp-imgpick-grid` `-tile` `-tile-on` `-tile-off` `-thumb` `-pick` | 이미지 선택 팝업의 타일 그리드 | LPO-0122 |
| `.lp-stepper` `-btn` `-value` | 숫자 증감 입력(`NumberStepper`) 전용 | LPO-0214 |
| `.lp-duty-table` `-col-date` `-col-side` `-group` `-entry` `-remove` `-scroll` | 근무현황 표(일자 × 주간·야간·심야 × 사고자·자원근무자 — 한 칸에 여러 줄이 들어가 Tabulator 를 못 쓴다). `-group` 은 2단 머리글의 그룹 칸(아래 선을 연하게), `-entry` 는 칸 안 한 줄로 **`.lp-duty-line` 위에 얹어** 낱말 사이 6·줄 사이 4 로 바꾼다(`.lp-duty-line` 자체는 LPO-0217 도 써서 값을 안 건드린다). `-scroll` 은 표를 감싸는 래퍼 — 남은 높이를 채워 **머리글(thead)은 붙여 두고 본문만 스크롤**(`.lp-page-scroll` 은 페이지 본문, `.lp-table-sticky` 는 TableWrapper 전용이라 따로 있다) | LPO-0216 |
| `.lp-duty-line` | 칸 안 한 줄(flex·wrap·gap 4). 0216 은 `.lp-duty-entry` 를 같이 얹는다 | LPO-0216, 0217 |
| `.lp-date-select-row` | 목록 위 연·월 텍스트 셀렉트(`TextSelect` 둘) 묶음 — 연 ↔ 월 16px(`group-gap` 에 16 이 없다). 셀렉트 모양은 override 의 `.lp-date-select` | LPO-0216 |
| `.lp-count-row` | 목록 위 왼쪽의 "요청갯수 : N" 문구 + 버튼 묶음(사이 16, 글자 15/body_1). 숫자는 안쪽 `<b class="lp-hit lp-em-strong">` — 회색 면이 있는 `.lp-grid-title-count` 와 다르다 | LPO-0505 |
| `.approver-bar` `-title` `-list` `-item` `-name` `-done` `-status` `-divider` | 출동수당 승인자 줄 — 표 위 테두리 상자(1px gray02, 모서리 4, 여백 12/20, 아래 20). 오른쪽 묶음 사이 32 에 `.lp-divider-v`(+`-divider` 로 18), 묶음 안 12. `-name` 은 굵은 파랑, 이름 뒤 상태는 `-done`("2026-08-27 승인", 본문색) / `-status`("미승인", `--Alert-danger-text`) / 승인 `Button size="xs"` 중 하나. **케이스 4개는 `/component/search-area` 맨 아래** | LPO-0505 |
| `.lp-roster-toolbar` `.lp-roster-title` | 근무자 목록 표(좁은 패널) 위의 제목 + 우측 버튼 줄. 표 자체는 `TabulatorGrid` 로 바뀌었다 | LPO-0202 |
| `.lp-notes-row` `-label` `-body` | 표 아래 붙는 라벨+입력 한 상자(중요지시사항) | LPO-0202 |
| `.lp-em-primary` / `.lp-em-danger` / `.lp-em-point` / `.lp-em-warning` | 문장 안 한 낱말만 색으로 강조(굵기는 `<b>` 나 `.lp-em-strong`·`.lp-em-medium` 이). `-warning` 은 글자용 주황 `--Alert-warning-text`(#8A5C00 — 배지용 `--warning` 보다 어둡다): 근무현황 사고 사유 | LPO-0208, 0216, 0217 |
| `.lp-em-medium` | 낱말 하나만 500 으로(시안 Medium). 600 은 `.lp-em-strong` — 근무현황 사고자 줄의 전일·부분 | LPO-0216 |
| `.lp-field-inline` | 라벨 아래 입력+버튼이 한 줄로 붙는 칸(부서명 + 부서 검색) | COM-1003, 1004 |
| `.lp-field-table` `-center` `-empty` | `FieldTable` 전용 — InfoField 칸 안에 들어가는 정적 표 | LPO-0601 |
| `.lp-cert-scroll` `.lp-cert-table` `-question` `-note` `-note-strong` `-total` `-choice` `-pass` `-fail` | 인증기준표(rowspan 이 많고 칸 안에 라디오가 들어가 Tabulator·InfoTable 을 못 쓴다). 좁은 패널 안이라 표만 가로 스크롤 | PUB-0113 |
| `.lp-notice-form` `-actions` | 게시판 글 등록/수정 폼(본문 폭을 꽉 쓴다). **가운데 1000px 폼은 `.lp-narrow-form`** | COM-1003, 1004 |
| `.lp-notice-detail` `-badges` `-dept` `-title` `-meta` `-thumb` `-body` `-detail-actions` | 게시판 글 상세 | COM-1002 |
| `.lp-comment-area` `-write` `-list` `-item` `-head` `-writer` `-date` `-more` `-body` `-actions` `-reply-btn` `-replies` | 댓글·대댓글 영역(CommentThread) | COM-1002 |
| `.lp-comment-menu` `-menu-item` | 댓글 "..." 팝오버(수정/삭제/답변) 폭 7.4rem — 폭·여백·모서리·그림자는 PopoverContent 테일윈드를 덮어야 해서 `police-override.css` 쪽 | COM-1002, 0402 |
| `.lp-comment-mention` `-mention-field` `-mention-input` | 답글 본문 앞 "@이름"(파란 굵은 글자) / 멘션 칩(Badge)이 앞에 든 답글 입력 상자 / 그 안의 테두리 없는 textarea(override 쪽) | COM-1002, 0402 |
| `.lp-writer-line` `-name` `-date` | 등록/수정 폼 머리의 "작성자 ｜ 일시" 한 줄(이름 bold, 세로선, 일시 회색). 댓글 머리 `.lp-comment-head` 와 모양이 같지만 의도가 달라 따로 | COM-1003, 1004, 0403 |
| `.lp-switch-box` | 라벨 아래 스위치를 입력칸 높이(4.8rem)에 세로 가운데 놓는 상자 — 같은 줄의 md 입력과 라벨·밑선을 맞출 때 | COM-1003, 1004 |
| `.lp-tab-swiper` `-next` | 카테고리 탭줄이 폭을 넘칠 때(`TabsList scrollable`) 오른쪽 끝에 흰 그라데이션+화살표(Figma `swiper__atomic`)를 얹는 감싸개. 탭줄→검색상자 20 도 여기서 | COM-0601 |
| `.lp-search-rows` | 검색상자 안 조건 줄을 시안대로 여러 줄로 고정(`.search-area` 를 줄마다, 줄 사이 16). 한 줄에 다 넣고 wrap 에 맡기면 창 폭에 따라 시안과 다르게 접힌다 | COM-0501 |
| `.lp-voice-search` `-img` `-body` `-text` `-status` | 음성인식 팝업(`GenericDialog2 type="full"`) 본문 — 마이크 150×156 + 인식된 말(32 bold, `--Base-primary`) + 상태 안내(17 가운데)를 세로 가운데에 놓는다. `max-width 31.2rem` 가운데정렬이라 팝업 본문 여백 16과 합쳐 시안의 24가 된다 | IRC-0102, 0103 |
| `.lp-board-form-actions` | 게시판 등록/수정 폼 하단 버튼줄 — 폼 마지막 블록과 40, 버튼 사이 12(Figma). 메모 폼의 `.lp-form-actions-center`(16/4)와 값이 달라 따로 | COM-1003, 1004, 0403 |
| `.lp-photo-grid` `-item` `-label` `-box` `-img` `-empty` `-empty-icon` `-empty-label` `-meta` `-actions` | 진단 상세의 취약/개선 상황사진 4칸(112사건 표 아래에 붙는 칸). **`police-style.css` 의 `.photo-box`/`.photo-empty` 는 인사관리 증명사진용 12rem 칸이라 서로 다른 것 — 이름이 비슷해도 섞어 쓰지 않는다** | PUB-0101 |
| `.lp-photo-grid-5` (+ `.lp-photo-rows`) | `.lp-photo-grid` 와 함께 — 5칸, **영역 여백 0·아래선 없음**, 칸이 폭을 나눠 가짐, 일시(파일명) 한 줄 말줄임. 두 줄이면 `.lp-photo-rows` 로 감싼다(줄 사이 20px + 위 선·16px — 제목 아래선 대신) | PUB-0108 사진자료 팝업 |
| `.lp-photo-grid-spread` | `.lp-photo-grid` 와 함께 — 조회 전용(버튼 없음) 4칸, **영역 여백 0·아래선 없음**, 160px 칸 양 끝 정렬, 위 표와 16px | PUB-0109 간이진단통보자료 팝업 |
| `.lp-stat-field` `.lp-stat-grade` `.lp-stat-value` | 라벨-값 표의 한 칸에 [등급][수치] 두 조각이 들어가는 통계 표. 값 영역 여백을 걷어내고 두 조각 사이에 세로선을 넣는다 | PUB-0101 참고사항 |
| `.lp-log-cell` `.lp-log-activity` `.lp-log-tag`(`-danger`/`-primary`/`-success`) `.lp-log-written-at` | 표 한 칸에 [앞머리 표시][본문 여러 줄] + 오른쪽 아래 작성일시가 함께 들어가는 활동내역 칸. 행 높이가 늘어나야 하므로 그리드에 `.lp-grid-multiline` 을 같이 건다 | LPO-0223 |
| `.lp-workday-row` | 근무일 줄에서 [근무일 선택][요일][주·야]를 **36** 간격으로 끊는 묶음(안쪽 12 묶음은 공통 `.group-gap3`). 사이를 **세로선으로** 끊는 화면은 `.calendar-area`(12 + `-divider`) 쪽이다 | LPO-0301 |
| `.lp-mark-note-sm` | `.lp-mark-note` 와 **함께** — 같은 `＊` 안내 문구인데 글자만 한 단계 작은 것(13px) | LPO-0301 |
| `.lp-approval-label` | 결재 표 **첫 칸의 라벨 줄**('직급 / 성명', '보고일 / 승인일시'). 높이를 맞추려고 `.lp-approval-person`/`-status` 를 그대로 쓰고 글자만 라벨(13px/400)로 되돌린다 | LPO-0301 |
| `.lp-equip-grid` `.lp-equip-card` `-card-head` `-card-body` `.lp-equip-name` `.lp-equip-count` | 장비 현황 카드 묶음(최소 28rem, 넓으면 5열) / 테두리 상자 + 회색 머리줄 카드 / 장비명 + 수량 한 줄. 제목·설명·태그가 있는 `Card` 와 달리 [분류][이름][수] 세 조각뿐이다 | LPO-0301 |

> 위 등록 폼·요약·드롭존 스타일은 원래 PM-LPO-0104(메모 등록)를 위해 미리 만들어 둔 것이었고,
> 그 화면이 생기면서 실제로 쓰이기 시작했다.

#### 원본과 함께 쓰는 델타

| 클래스 | 의도 | 쓰는 곳 |
|---|---|---|
| `.lp-detail-layout-wide` | `.detail-layout` 의 gap 2rem → 2.4rem | PC-STT-0103 |
| `.lp-photo-frame-fill` | `.photo-frame` 에 회색 배경을 얹는다 | PC-STT-0103 |

#### 게시판(`.board-*`) — 접두사 예외

⚠ **사용자 지정으로 `lp-` 를 붙이지 않은 유일한 묶음이다**(CLAUDE.md §2 기본과 다름).
게시판 화면(PM-COM-1101~2104) 전용이며, 공지사항(PM-COM-1001~1004)이 쓰는 `.lp-notice-*` 와
모양이 같지만 그쪽은 먼저 만들어진 화면이라 합치지 않고 그대로 뒀다(CLAUDE.md §1).

| 클래스 | 의도 | 쓰는 곳 |
|---|---|---|
| `.board-detail` | 게시판 글 상세 본문 세로 스택(gap 2rem) | `views/com/components/BoardDetail.vue` |
| `.board-badges` | 상세 맨 위 배지줄(공지·카테고리·공개·부서) | 〃 |
| `.board-dept` | 배지줄에 텍스트로 붙는 부서/지방청/주차 | 〃 |
| `.board-title` | 상세 제목 2.4rem bold | 〃 |
| `.board-meta` | 작성자·등록일·조회수 줄 + 아래 구분선 | 〃 |
| `.board-thumb` | 본문 대표 이미지 자리(회색 박스) | 〃 |
| `.board-body` | 본문 문단 스택 | 〃 |
| `.board-detail-actions` | 상세 맨 아래 목록/삭제/수정 줄 + 위 구분선 | 〃 |
| `.board-form` | 등록·수정 폼 세로 스택. **본문 폭을 꽉 쓴다**(가운데 정렬인 `.lp-narrow-form` 과 다름) | `views/com/components/BoardForm.vue` |
| `.board-form-actions` | 폼 아래 우측 취소/저장 줄 | 〃 |
| `.board-form-row` | 한 줄에 두 칸이 나란히(지방청+주차) | 〃 |
| `.board-form-grow` | `.board-form-row` 안에서 남는 폭을 가져가는 칸 | 〃 |
| `.board-category-tabs` | 목록 위 카테고리 칩줄의 **아래 여백만**(배치는 `FilterChipGroup` 이 한다) | PM-COM-1101 |
| `.board-list-toolbar` | 목록 위 우측 도구줄('내가 쓴 글' 토글) | PM-COM-1101 · 2101 |
| `.board-mine-toggle` | 그 토글의 스위치+글자 묶음 | 〃 |
| `.board-pin-badge` | 목록 '번호' 칸의 고정공지 배지. Tabulator 포매터가 HTML 문자열을 만들어 `Badge` 를 못 써서 클래스로 같은 모양을 낸다 | 고정공지 있는 목록 7개 |
| `.board-search-row` | 검색영역이 두 줄일 때 첫 줄 아래 여백(템플릿에 `mb-4` 를 안 쓰려고) | 목록 10개 |

---

### 12-3. `police-override.css` (`.lp-*`) — 덮어야 하는 것

`layer(screen)` 이라 테일윈드·shadcn·원본을 전부 덮는다. **여기 있는 이유가 곧 의도다** —
일반 스타일을 여기 넣지 않는다(그러면 왜 여기 있는지 다음 사람이 판단할 수 없다).

| 클래스 | 무엇을 덮나 | 쓰는 곳 |
|---|---|---|
| `.lp-grid-active-row` | Tabulator 행 배경 — "지금 오른쪽 상세에 떠 있는 행". 체크박스 다중선택(`.tabulator-selected`)과 별개 개념 | 2204, 0801, STT-0103 |
| `.lp-grid-link-cell` | 값이 링크처럼 보여야 하는 셀(밑줄) | 2204 |
| `.lp-grid-group-line` | **그리드에 건다** — 2단 그룹 머리(`.tabulator-col-group`)의 왼쪽 경계선. `tabulator-theme.css` 가 머리줄의 세로선을 모두 지워서 그룹이 시작되는 자리에서 본문 선이 끊긴다. **그 한 줄만** 잇는다 — 머리줄의 다른 칸 경계는 선이 없는 것이 기본이다. 본문 선과 1px 어긋나지 않게 `border-left` 가 아니라 바깥쪽 `box-shadow` 로 긋는다. 테마가 `@layer` 밖이라 `!important` 필요 | PUB-0404 |
| `.lp-grid-no-highlight` | Tabulator 그리드 루트에 — **단순 체크 표**라 행 hover·체크 행(`.tabulator-selected`) 강조를 모두 끈다(상태는 체크박스만). 고른 뒤 상세·삭제 같은 결과가 있는 표에는 쓰지 않는다. `tabulator-theme.css` 가 레이어 밖이라 `!important` | COM-2201(권한목록) |
| `.lp-grid-done-row` | Tabulator 행 배경 — "확인이 끝난 행"(미확인 없음) 회색. Figma `color/surface/gray-subtle`(#e6e8ea) = `--Border_gray03`. 미확인이 남은 행은 배경 없음이 기본이라 클래스를 안 붙인다. 선택/상세 강조(`.lp-grid-active-row`)와 별개. **레이어 밖인 `tabulator-theme.css` 의 행 배경을 덮어야 해서 `!important` 필요** | LPO-0304, PM-LPO-0106(읽은 알림) |
| `.lp-perm-menu-grid` | Tabulator 가 JS 로 넣는 그룹헤더 높이(빈 서브헤더 줄 접기, `!important` 필요) | 2204 |
| `.lp-grid-depth-cell` | 2depth 메뉴 칸 회색 배경 | 2204 |
| `.lp-grid-search-cell` | button 셀 라벨 뒤에 돋보기 아이콘을 가상요소로 얹기 | 2204 |
| `.lp-grid-search-end` | 위 아이콘을 라벨 뒤가 아니라 **칸 오른쪽 끝**에 세우기(`.lp-grid-search-cell` 과 같이 준다) | LPO-0202 |
| `.lp-table-left` | `TableWrapper` 의 가운데 정렬을 좌측으로 되돌림 | 0601 |
| `.diagnosis-mail-summary` (+ `> strong`, `p`) | 진단통보 '총평' 상자(왼쪽 라벨 · 세로선 · 본문, 파란 배경). 선 #d7d9dc 는 대응 토큰 없음 — 시안 대조 전 | PUB-0103 진단통보 |
| `.diagnosis-mail-guide` | 진단통보 결과표 위 13px 안내 문구, 위아래 16px | PUB-0103 진단통보 |
| `.diagnosis-mail-note` | 진단통보 비고 `InfoTable` 칸 최소 높이 80px | PUB-0103 진단통보 |
| `.lp-cell-note` | `TableWrapper` **한 칸만** 좌측 정렬 + 줄바꿈 유지 + 위 정렬(여러 줄 글이 들어가는 '내용' 칸). 컬럼 정의의 `cellClass` 로 건다 — 표 전체를 돌리는 `.lp-table-left` 와 다르다 | LPO-0301 |
| `.lp-table-sticky` (+ `.lp-table-sticky-head2`) | `TableWrapper` 헤더와 합계 줄(`.row-total`)을 고정하고 본문만 스크롤. 높이는 `--lp-table-h`, 합계 줄 위치는 `--lp-thead-h`(2단 헤더면 `-head2` 를 같이) | PUB-0306, PUB-0307(2단 헤더) |
| `.row-total` (`tbody .row-total > td`) | `TableWrapper` 합계 줄 — 굵은 글씨 + 아래로 [선-간격-선] 두 줄로 데이터 영역과 끊는다. **`lp` 접두사가 없는 건 `tabulator-theme.css` 부터 쓰던 기존 표시자라서** — 같은 뜻의 이름을 새로 만들지 않는다 | PUB-0306, PUB-0307 |
| `.lp-th-group-start` | `TableWrapper` 2단 헤더에서 **컬럼 그룹이 시작되는 칸**의 왼쪽 세로선. `headClass` 에는 아래 선만 있어 그룹 칸 왼쪽이 빈다. 색은 본문 칸 구분선과 같은 `--Border_gray03` 이라 헤더~본문 세로선이 이어진다 | PUB-0307 |
| `.lp-segmented-tabs` | 탭 컴포넌트의 간격·모서리를 세그먼트 형태로 | 0802 |
| `.lp-dialog-body .form-note` | 팝업 안에서 공통 `.form-note` 의 아래 여백 해제 | 0601 |
| `.lp-dropzone-sub` | `.lp-dropzone-txt p` 의 크기·색 되돌리기 | LPO-0104 |
| `.lp-cell-point` | Tabulator 셀 안의 미완료 값(`미확인`)만 강조색 글씨. Figma `color/text/point` = `--Base--point` — 오류색 `--danger` 가 아니다(셀 색은 테마 CSS 가 먼저 먹는다) | LPO-0304 |
| `.lp-field-flush` | InfoField 값 칸의 안쪽 여백 제거(표를 칸에 딱 붙일 때). `.control` 이 CSS Module 해시 이름이라 마지막 자식으로 짚는다 | LPO-0601 |
| `.lp-info-nested` | `InfoField` 값 칸에 `InfoTable` 을 한 번 더 넣을 때 `.control` 여백·중복 테두리 제거(라벨 병합처럼 보이게) | PUB-0111 |
| `.lp-grid-btn-compact` | 좁은 열(시안 88px)에 들어가는 표 안 버튼. `Button` 베이스의 `min-w-25`(100px)를 풀고 좌우 여백만 준다(컬럼 정의는 `buttonClass` 만 받아서 `padding` prop 을 못 쓴다) | LPO-0223 |
| `.lp-date-fill` | **`InfoField` 에 건다** — 값 칸을 꽉 채우는 `DatePicker`. `DatePicker` 는 `class` 를 VueDatePicker 루트가 아니라 안쪽 `InputField2` 에 넘겨서(`inheritAttrs:false`) 화면에서 `flex-1` 을 줘도 안 먹는다. 늘어나야 하는 건 값 칸의 직계 자식인 `.dp__main` 이다 . `DateRangePicker` 에 걸면 두 입력이 폭을 반씩 나눠 갖는다(`input-class="w-full"` 같이) | PUB-0302/0303, COM-1003, 1004 |
| `.lp-chip-fill` | `ChipGroup` 에 걸어 칩들이 폼 폭을 16px 간격으로 나눠 갖게 한다(컴포넌트 기본은 내용 폭·gap 8). 폼의 카테고리 선택 | COM-0403, 0404 |
| `.lp-dept-fill` | `DepartmentCascadeSelect` 에 걸어 셀렉트 셋이 폼 폭을 16px 간격으로 나눠 갖게 한다(컴포넌트 기본은 각 160px·gap 8) | COM-1003, 1004 |
| `.lp-cell-datetime` | Tabulator 셀의 `white-space: nowrap`(라이브러리 기본)을 풀어 일시를 날짜/시간 두 줄로 끊는다. 행 높이 4.8rem 고정에 맞춰 `line-height: 1.3` | LPO-0501 |
| `.lp-date-select` | **`TextSelect size="xlarge"` 에 건다** — 목록 위 연·월 텍스트 셀렉트(Figma `date_selectbox`, 19px/600·좌우 여백 0·화살표 20). xlarge 기본(700·px-2)과 굵기·여백만 달라 그 둘만 덮고, TextSelect 가 자기 화살표까지 숨기는 문제(`.lp-cal-toolbar` 와 같은 사정)로 마지막 svg 를 되살린다 | LPO-0216 |

---

### 색·크기는 반드시 토큰으로

hex를 직접 쓰지 않는다. `var(--Text-body_1)`, `var(--Base-primary)`, `var(--Border_gray02)`,
`var(--Surface-primary)`, `var(--Radius-medium3)`, `var(--Alert-danger-surface)` 등이 있다.
대응 토큰이 정말 없을 때만 hex(선례: `Badge.vue`의 `#fff6e5`).

### 그래도 없을 때 — 어디에 만드나

| 만들려는 것 | 어디에 |
|---|---|
| 색·크기·모서리 값 | **토큰(`--Xxx`)으로.** 화면에 hex 박지 않는다 |
| 일반 스타일 | **`police-common.css`** — 한 번만 쓰이더라도 여기. 이름은 `.lp-{역할}` |
| 컴포넌트·라이브러리·테일윈드를 덮어야 하는 것 | **`police-override.css`** |
| 특정 컴포넌트에 딸린 스타일 | 그 컴포넌트 폴더의 `*.module.css` |
| 라벨-값 표 관련 | `custom/info-table/InfoTable.module.css` (이미 공통, 필수점 `.requiredDot`, 안내문구 `.hint`/`.hintSuccess`) |
| 그리드 관련 | `src/assets/css/tabulator-theme.css` (전역 적용, 다시 스타일링 불필요) |
| **`police-style.css` 에는 추가하지 않는다** | 퍼블리싱 원본이라 읽기 전용 |

만들었으면 **위 12-2 / 12-3 표에 한 줄 추가**한다 — `클래스 / 의도 / 쓰는 곳`.
**의도를 빼먹지 않는다.** 그게 다음 사람이 오용하지 않게 막는 유일한 장치다.

> 화면 템플릿에 테일윈드 유틸(`flex`, `mt-4`)을 직접 쓰지 않는다 — CLAUDE.md §1.
> 재사용 컴포넌트(`src/components/**`) 내부는 무관하다.
> (`krds.min.css`는 파일만 있고 로드 안 됨 — 참고 대상 아님.)

---

## 13. 컴포넌트를 새로 만들 때 — house style

§0 ③대로 **없다는 걸 먼저 알리고 승인받은 뒤**에 만든다. 만들기로 했으면 아래를 지킨다.
기준 파일은 `custom/alert/`, `custom/badge/` 두 폴더다.

### 폴더 구성
```
custom/<name>/
  index.ts     ← cva 로 variant 정의 + export. 한글 설명 주석 필수
  <Name>.vue   ← cn() 으로 클래스 병합
```

`index.ts` 주석에는 **Figma 원본 이름·variant·nodeId**, 그리고 **이름이 비슷한 기존 컴포넌트와
뭐가 다른지**를 적는다(§9의 형제 구분이 여기서 나온다).

### 루트 폰트가 10px이다 — 제일 많이 틀리는 곳
Figma 값을 그대로 px로 쓰면 10배로 뜬다.

| Figma | 코드 |
|---|---|
| 13px | `text-[1.3rem]` |
| 15px | `text-[1.5rem]` |
| 17px | `text-[1.7rem]` |
| 19px | `text-[1.9rem]` |

### 색은 토큰 우선
`public/portal/asset/css/common/police-style.css` 의 토큰을 쓴다(§12). 대응 토큰이 정말 없을
때만 hex — 선례는 `Badge.vue` 의 `#fff6e5`.

### 아이콘 — Figma 것을 가져온다
**PPT 이미지를 보고 `lucide-vue-next` 에서 비슷한 걸 고르지 않는다.** Figma 에 아이콘이
130개 등록돼 있고 그게 확정본이다(`docs/create.md` §4).

```
Figma 프레임에서 아이콘 확인 → get_design_context 응답의 asset URL 로 SVG 내려받기
  → src/assets/images/icons/ 에 저장
  → src/components/custom/icon/icons.ts 에 등록
  → <Icon name="..." :size="20" /> 로 사용
```

**SVG 원본의 `viewBox` 를 지우지 않는다.** `viewBox` 가 없으면 `:size` 가 박스만 키우고
그림은 원본 크기 그대로라 아이콘이 안 커진다. Figma 에서 받은 SVG 에는 들어 있으니 그대로 저장하면
된다. 빌드 때 SVGO(`preset-default`)가 `width`/`height` 가 있는 SVG 에서 이걸 지우는데,
2026-09-11 에 `vite.config.ts` 에서 `removeViewBox: false` 로 껐다 — 그 설정을 되돌리지 않는다.

지금 `icons.ts` 에 6개뿐이라 기존 화면들이 lucide 로 때우고 있다(23곳).
**새로 만드는 화면부터는 Figma 아이콘을 등록해서 쓴다** — 등록하면 다음 화면이 재사용한다.
이것도 공통화다(§1). Figma 에 없는 아이콘만 `lucide-vue-next` 를 쓰고, 그 사실을 인계 메모에
남긴다(`docs/create.md` §5).

### 재사용 컴포넌트 안에서는 테일윈드를 써도 된다
CLAUDE.md §1이 금지하는 건 **화면(`views/**`) 템플릿**이다. `src/components/**` 내부는 고칠 곳이
한 파일이라 흩어질 문제가 없다.

### 검증
```bash
npx vue-tsc --noEmit -p tsconfig.app.json
npx vite build --mode development
```
⚠ `npm run build` 는 `vue-tsc -b` 가 **기존 오류에서 멈춘다.** 번들 확인은 `npx vite build` 로
한다. 기존 오류는 전부 `src/views/**` 의 TS6133(미사용 변수)이고 내 코드 오류와 헷갈리면 안 된다 —
작업 전 개수를 먼저 세어 두고 그 수가 늘지 않았는지로 판단한다.
