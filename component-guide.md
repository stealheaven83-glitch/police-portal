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
| 빵부스러기 | `custom/breadcrumb/Breadcrumb.vue` | |

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
  - `cellType:'input'` — 텍스트 인라인 편집
  - `cellType:'checkbox'` — 체크박스 셀(전체/읽기/편집 같은 권한 매트릭스)
  - `cellType:'select'` — `selectOptions` 배열과 함께 쓰는 드롭다운(`PC-COM-2401` 목록수/페이지수)
  - `cellType:'button'` — `buttonLabel`/`buttonVariant`/`buttonVisible`/`onButtonClick` 으로 행마다 다른 라벨·표시여부의 버튼(`PC-COM-2204` "부서 조회")
- **페이지네이션 그리드에 맨 아래 추가**(`addRow(data, false)`)는 보고 있는 페이지에 안 나타난다 — 추가 후 `gridRef.value?.setPage('last')` 로 따라간다(`PC-COM-2401`). 맨 위 추가(`addRow(data, true)`)는 항상 1페이지라 불필요하다.
- **컬럼이 많아 가로 스크롤이 필요하면** `layout="fitDataFill"` + 각 컬럼에 고정 `width`. 기본 `fitColumns` 는 폭을 컨테이너에 맞춰 나눈다.
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
| 탭 | `custom/tabs/` — `variant` fill/line, `tone` primary/secondary |

---

## 6. 팝업 · 다이얼로그

| 이럴 때 | 이걸 쓴다 |
|---|---|
| **레이어 팝업 (기본)** | **`custom/dialog/GenericDialog2.vue`** (19개 화면) |
| 폼이 들어간 팝업 | `custom/dialog/FormDialog.vue` |
| 되돌릴 수 없는 작업 확인 | `custom/dialog/ConfirmDialog2.vue` — **CLAUDE.md §4 조건 확인** |
| 버튼 하나짜리 강제 확인 | `custom/dialog/AlertDialog2.vue` — 남용 금지, 보통은 toast |
| 아직 로직이 없는 팝업 자리 | `custom/dialog/EmptyStubDialog.vue` (6개 화면) |
| 모바일 하단 시트 | `custom/bottom-sheet/BottomSheet.vue` |

> **일반 저장/삭제에는 `confirm`을 붙이지 않는다.** toast가 기본이다 — CLAUDE.md §4.

---

## 7. 피드백 · 안내

| 이럴 때 | 이걸 쓴다 |
|---|---|
| 저장/삭제 성공, 필수값 누락 경고 | **toast** (CLAUDE.md §4) — 컴포넌트 아님 |
| 결과/경고 박스(성공·실패·주의) | `custom/alert/Alert.vue` |
| 이해를 돕는 설명 박스 | `custom/infobox/InfoBox.vue` |
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
- 기존 화면 14곳에 `w-25` 가 남아 있다(정리 예정). **복붙할 때 같이 딸려오지 않게 확인한다.**

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
| `.lp-nowrap` | 줄바꿈 금지 — `.readonly-text` 등과 **함께** 쓴다 | 0601 |
| `.lp-hit` | 검색 결과 건수처럼 제목 안 `<b>` 만 파랗게 | 0802 |
| `.lp-panel-head-em` | 패널 제목줄에 같이 보여주는 값(`--Base--point` 600) | 2204 |

#### 배치

| 클래스 | 의도 | 쓰는 곳 |
|---|---|---|
| `.lp-flex-fill` | 남는 가로폭을 채우되 내용이 넘치지 않게(flex 1 / min-width 0) | 2204, IRC-0101 |
| `.lp-row-between` | 한 줄에 좌우로 벌려 놓기 | 2204, 0601, 0802 |
| `.lp-unit-row` | 한 값을 여러 칸으로 쪼갠 줄 — 작은 입력 + 단위 글자('시' '분' '세' '~') | PUB-0405 |
| `.lp-summary-row` | 값 텍스트 + 우측 버튼 (표 셀 안, 자기도 늘어남) | 0601 |
| `.lp-field-row` | 라벨+입력 여러 쌍이 한 줄에 늘어서고 좁아지면 줄바꿈 | 0601 |
| `.lp-page-scroll` | **페이지 본문** 이 넘칠 때 이 영역만 세로 스크롤 (상세 패널 안쪽은 `.detail-scroll`) | 0801, 0802, IRC-0101 |
| `.lp-page-toolbar` | 화면 위쪽 부서선택 + 우측 버튼 줄 | 0601 |
| `.lp-section` / `.lp-section-title` | 구역 사이 간격 / 구역 제목 여백(`.lp-heading-lg` 와 함께) | 0601 |
| `.lp-section-head` | 제목줄 아래 실선(`.lp-row-between` 과 함께) | 0802 |
| `.lp-table-gap` | 표 위 여백 | 0601 |
| `.lp-info-blank-cell` | `InfoTable` 에서 옆 칸이 두 행을 차지(row-span)해 비는 칸. 표 테두리만 이어 주는 자리라 1열로 접히면 감춘다 | PUB-0302/0303 |
| `.lp-meta-nowrap` | 조회 화면 위쪽 '최종 수정일' 한 줄 | 0601 |
| `.lp-placeholder-box` | 채울 것이 아직 정해지지 않은 자리(시안의 회색 상자) | PUB-0113 |
| `.lp-form-box` / `.lp-form-box-center` | 라벨 칸 없이 컨트롤만 들어가는 테두리 상자(라디오·체크박스 줄) / 그 안을 가운데로. 라벨-값 표면 `InfoTable` | PUB-0702, PUB-0208 |
| `.lp-link-danger` | 아이콘 + 붉은 글자로 주의를 끄는 링크(Figma button_link 경고 톤). 파란 경로 링크는 `.lp-path-link` | PUB-0701 |
| `.lp-survey-list` / `.lp-survey-item` / `.lp-survey-choice` | 테두리 없는 설문 문항 나열(좌 문항 · 우 선택지). 라벨-값 표는 `InfoTable` | PUB-0201 |
| `.lp-score-box` | 설문 합계 점수 줄(가운데 정렬 회색 띠) | PUB-0201 |
| `.lp-status-done` | 결재선 등에서 '완료' 상태만 색으로 구분 | PUB-0702 |

#### 아이콘 버튼

| 클래스 | 의도 | 쓰는 곳 |
|---|---|---|
| `.lp-icon-btn` | 테두리·배경 없는 아이콘 전용 버튼(크기는 아래 것과 조합) | 0601, LPO-0101 |
| `.lp-icon-btn-24` / `.lp-icon-btn-32` | 그 버튼 크기 | LPO-0101 / 0601 |
| `.lp-icon-btn-dark` | 상속색이 아니라 본문색으로 고정 | 0601 |
| `.lp-icon-row` | 아이콘 여러 개가 가로로 놓이는 줄 | LPO-0102, 0104, 0122 |

#### 2분할 상자 · 팝업

| 클래스 | 의도 | 쓰는 곳 |
|---|---|---|
| `.lp-pane-box` / `.lp-pane` / `.lp-pane-fixed` / `.lp-pane-title` | 테두리 안에서 좌우로 나뉘는 목록 상자(폼 화면 2분할은 `LayoutSplit`) | 2204 |
| `.lp-selected-bar` | 선택한 항목을 칩으로 늘어놓는 회색 바 | 2204 |
| `.lp-dialog-head` / `.lp-dialog-head-title` / `.lp-dialog-head-label` | 팝업 본문 위쪽 제목줄(`.lp-row-between` 과 함께). `-label`+`-title` 은 "권한명: 범죄예방대응국" 처럼 **크기·굵기는 같고 색만 다른** 라벨·값 짝(1.9rem/600). 줄 배치는 `.group-gap3`. 페이지 액션바의 `.list-actions-title`/`.list-actions-part`(2rem/700)와는 별개다 | 2204 |
| `.lp-grid-title` `-label` `-count` `-num` | 그리드 위에 얹는 회색 제목 바(왼쪽 표 이름 + 오른쪽 건수, 숫자만 포인트색). 면이 채워진 한 줄이라 `LayoutPanel` 의 `.lp-pane-title` 과는 별개 | 2207 전체 사용자 팝업 |
| `.lp-pop-body-pager` | 페이지네이션으로 끝나는 팝업 본문(`.pop-body` 와 함께). `.pop-body` 의 overflow:hidden 이 Pagination 의 -8px 음수 아래여백을 잘라먹는 것을 막는다 | 2207 전체 사용자 팝업 |
| `.lp-dialog-body` / `.lp-dialog-subtitle` / `.lp-dialog-footer` | 팝업 본문 세로 묶음 / 부제 / 우측 버튼줄 | 0601 |
| `.lp-search-form-gap` | 팝업 안 검색 폼의 행·열 간격 | 0601 |

#### 통합검색 · 시나리오 검색 (본문을 가운데 정렬하는 화면)

| 클래스 | 의도 | 쓰는 곳 |
|---|---|---|
| `.lp-search-hero` | 큰 검색바 — 위 여백 크게(검색 전) | 0801, 0802 |
| `.lp-search-center` | 검색한 뒤라 위 여백 없이 붙는 검색바 | IRC-0101 |
| `.lp-content-panel` / `.lp-content-panel-pad` | 본문 폭 120rem 가운데 / 좌우 여백 | 0801, 0802, IRC-0101 |
| `.lp-keyword-split` | **override** — `SearchKeywordPanel` 두 칸을 시안 비율(795:356)로 나누고 사이에 세로 구분선. 컴포넌트 기본은 반반(`grid-cols-2`)에 구분선 없음. `lg` 이상에서만 걸어 모바일 1칸 접힘을 살린다 | IRC-0101 |
| `.lp-result-section` / `.lp-result-item` / `.lp-result-summary` | 카테고리 구역 / 결과 한 건 / 2줄 말줄임 요약 | 0802 |
| `.lp-result-pagination` | 결과 아래 페이지네이션 여백 | 0802 |
| `.lp-link-list` / `.lp-path-link` | 메뉴 경로 링크만 나열 / 그 링크(Figma button_link) | 0802 |
| `.lp-ai-answer` + `-head` `-icon` `-body` | AI 생성 답변 상자 | IRC-0101 |
| `.lp-answer-block` / `.lp-block-title` / `.lp-bullet-list` / `.lp-answer-note` | 답변 안 소구역 / 그 제목 여백 / 불릿 / **칸 맨 아래에 붙는** 주의문(`margin-top:auto` — 세로 flex 부모 안에서만 의도대로 선다) | IRC-0101 |
| `.lp-answer-main` | AI 답변의 **좌측 본문 칸**. 주의문을 바닥에 붙이려고 세로 flex 다 — 남는 폭만 채우면 되는 자리엔 `.lp-flex-fill` 을 쓴다 | IRC-0101 |
| `.lp-ref-column` | 우측 참고자료 칸. **왼쪽 세로 구분선을 이 칸이 그린다**(본문 칸 높이만큼 꽉 차야 해서). 폭 29.2rem + 여백 2.4rem + 선 0.1rem = 31.7rem | IRC-0101 |
| `.lp-ref-list` / `.lp-ref-desc` / `.lp-ref-link` | 참고자료 아코디언 목록(간격 1.2rem) / 펼쳤을 때 설명(1.5rem) / 그 아래 문서 링크(1.3rem 밑줄) | IRC-0101 |
| `.lp-ref-item` / `.lp-ref-trigger` / `.lp-ref-body` | **override** — `custom/accordion` 의 카드·트리거·본문 기본 모양(높이·글자·아래선·여백)을 참고자료 시안에 맞게 되돌린다. 아코디언을 카드 안에 얹을 때만 쓴다 | IRC-0101 |

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
| `.lp-file-hint` | 첨부 버튼 옆 용량 안내(좁아지면 줄바꿈) | 2402 |
| `.lp-summary-box-read` | 읽기 전용 요약 블록(테두리 없이 채워진 면). **입력용은 `-filled`** | LPO-0102 |
| `.lp-file-boxes` / `.lp-file-box` / `.lp-file-link` | 첨부파일을 테두리 박스로 나열 / 박스 한 줄 / 그 안의 다운로드·삭제 링크. **구분선 방식은 `.lp-file-item`** | LPO-0102, 0104, 0217 |
| `.lp-hidden-input` | 버튼/드롭존이 대신 여는 숨은 file input | LPO-0104, 0217 |
| `.lp-cal` `-toolbar` `-grid` `-head` `-cell` `-cell-out` `-cell-open` `-daterow` `-date` `-sun` `-sat` `-holiday` `-events` `-event` `-event-time` `-popover` `-popover-head` `-popover-list` `-popover-row` `-popover-names` | 월간 일정 달력(`MonthScheduleCalendar`) 전용. FullCalendar 기반 `calendar.vue` 와 별개 | LPO-0108 |
| `.lp-setting-bar` | 화면 위쪽 설정 한 줄(회색 면) | LPO-0122 |
| `.lp-mainset-preview` `-col` `-slot` `-slot-reverse` `-badge` `-card` `-card-title` `-card-img` `-empty` `-empty-tall` `-guide` `-menus` `-group-title` `-menu-item` | 메인화면 카드 배치 설정 | LPO-0122 |
| `.lp-imgpick-grid` `-tile` `-tile-on` `-tile-off` `-thumb` `-pick` | 이미지 선택 팝업의 타일 그리드 | LPO-0122 |
| `.lp-stepper` `-btn` `-value` | 숫자 증감 입력(`NumberStepper`) 전용 | LPO-0214 |
| `.lp-duty-table` `-col-date` `-col-side` `-line` `-remove` | 근무현황 표(한 칸에 여러 줄이 들어가 Tabulator 를 못 쓴다) | LPO-0216 |
| `.lp-roster-toolbar` `.lp-roster-title` `.lp-roster-table` `-col-check` `-col-order` `.lp-roster-empty` | 근무자 목록 표(좁은 패널 안, 칸에 체크박스·입력이 들어가 세로 가운데 정렬). 조회 전용인 `.lp-duty-table` 과 의도가 다르다 | LPO-0202 |
| `.lp-schedule-scroll` `.lp-schedule-table` `.lp-schedule-cell` `-btn` `.lp-schedule-name` | 근무지정표(甲지) 배정 표 — 시간대 12칸이 가로로 늘어서 가로 스크롤, 칸 안쪽이 배정 팝업을 여는 버튼 | LPO-0202 |
| `.lp-notes-row` `-label` `-body` | 표 아래 붙는 라벨+입력 한 상자(중요지시사항) | LPO-0202 |
| `.lp-em-primary` / `.lp-em-danger` | 문장 안 한 낱말만 색으로 강조(굵기는 `<b>` 가) | LPO-0208, 0216, 0217 |
| `.lp-field-inline` | 라벨 아래 입력+버튼이 한 줄로 붙는 칸(부서명 + 부서 검색) | COM-1003, 1004 |
| `.lp-field-table` `-center` `-empty` | `FieldTable` 전용 — InfoField 칸 안에 들어가는 정적 표 | LPO-0601 |
| `.lp-notice-form` `-actions` | 게시판 글 등록/수정 폼(본문 폭을 꽉 쓴다). **가운데 1000px 폼은 `.lp-narrow-form`** | COM-1003, 1004 |
| `.lp-notice-detail` `-badges` `-dept` `-title` `-meta` `-thumb` `-body` `-detail-actions` | 게시판 글 상세 | COM-1002 |
| `.lp-comment-area` `-write` `-list` `-item` `-head` `-writer` `-date` `-more` `-body` `-actions` `-reply-btn` `-replies` | 댓글·대댓글 영역(CommentThread) | COM-1002 |
| `.lp-photo-grid` `-item` `-label` `-box` `-img` `-empty` `-empty-icon` `-empty-label` `-meta` `-actions` | 진단 상세의 취약/개선 상황사진 4칸(112사건 표 아래에 붙는 칸). **`police-style.css` 의 `.photo-box`/`.photo-empty` 는 인사관리 증명사진용 12rem 칸이라 서로 다른 것 — 이름이 비슷해도 섞어 쓰지 않는다** | PUB-0101 |
| `.lp-stat-field` `.lp-stat-grade` `.lp-stat-value` | 라벨-값 표의 한 칸에 [등급][수치] 두 조각이 들어가는 통계 표. 값 영역 여백을 걷어내고 두 조각 사이에 세로선을 넣는다 | PUB-0101 참고사항 |

> 위 등록 폼·요약·드롭존 스타일은 원래 PM-LPO-0104(메모 등록)를 위해 미리 만들어 둔 것이었고,
> 그 화면이 생기면서 실제로 쓰이기 시작했다.

#### 원본과 함께 쓰는 델타

| 클래스 | 의도 | 쓰는 곳 |
|---|---|---|
| `.lp-detail-layout-wide` | `.detail-layout` 의 gap 2rem → 2.4rem | PC-STT-0103 |
| `.lp-photo-frame-fill` | `.photo-frame` 에 회색 배경을 얹는다 | PC-STT-0103 |

---

### 12-3. `police-override.css` (`.lp-*`) — 덮어야 하는 것

`layer(screen)` 이라 테일윈드·shadcn·원본을 전부 덮는다. **여기 있는 이유가 곧 의도다** —
일반 스타일을 여기 넣지 않는다(그러면 왜 여기 있는지 다음 사람이 판단할 수 없다).

| 클래스 | 무엇을 덮나 | 쓰는 곳 |
|---|---|---|
| `.lp-grid-active-row` | Tabulator 행 배경 — "지금 오른쪽 상세에 떠 있는 행". 체크박스 다중선택(`.tabulator-selected`)과 별개 개념 | 2204, 0801, STT-0103 |
| `.lp-grid-link-cell` | 값이 링크처럼 보여야 하는 셀(밑줄) | 2204 |
| `.lp-perm-menu-grid` | Tabulator 가 JS 로 넣는 그룹헤더 높이(빈 서브헤더 줄 접기, `!important` 필요) | 2204 |
| `.lp-grid-depth-cell` | 2depth 메뉴 칸 회색 배경 | 2204 |
| `.lp-grid-search-cell` | button 셀 라벨 뒤에 돋보기 아이콘을 가상요소로 얹기 | 2204 |
| `.lp-table-left` | `TableWrapper` 의 가운데 정렬을 좌측으로 되돌림 | 0601 |
| `.lp-segmented-tabs` | 탭 컴포넌트의 간격·모서리를 세그먼트 형태로 | 0802 |
| `.lp-dialog-body .form-note` | 팝업 안에서 공통 `.form-note` 의 아래 여백 해제 | 0601 |
| `.lp-dropzone-sub` | `.lp-dropzone-txt p` 의 크기·색 되돌리기 | LPO-0104 |
| `.lp-cell-danger` | Tabulator 셀 안의 미완료 값만 빨간 글씨(셀 색은 테마 CSS 가 먼저 먹는다) | LPO-0304 |
| `.lp-field-flush` | InfoField 값 칸의 안쪽 여백 제거(표를 칸에 딱 붙일 때). `.control` 이 CSS Module 해시 이름이라 마지막 자식으로 짚는다 | LPO-0601 |
| `.lp-info-nested` | `InfoField` 값 칸에 `InfoTable` 을 한 번 더 넣을 때 `.control` 여백·중복 테두리 제거(라벨 병합처럼 보이게) | PUB-0111 |

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
