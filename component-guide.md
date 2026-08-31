# 컴포넌트 고르기 가이드 — "이럴 땐 이거"

CLAUDE.md §1(재사용 원칙)의 실행 편. §1은 "찾아봐라"까지 말하고, 이 문서는 **"찾으면 뭐가
나오는지"**를 말한다. 새 화면을 시작할 때 §1-1 기준 파일과 함께 본다.

경로는 전부 `src/components/` 기준. `custom/`이 1순위, `ui/`(shadcn-vue 프리미티브)가 2순위.
**공통 CSS는 §12**를 본다 — 화면 전용 module.css를 만들기 전에 거기부터 뒤진다.

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

---

## 3. 목록 · 그리드

| 이럴 때 | 이걸 쓴다 |
|---|---|
| **목록 그리드 (기본)** | `custom/tabulator/TabulatorGrid.vue` (27개 화면) |
| 그리드 위 제목 + 버튼 줄 | `custom/grid-title/GridTitle.vue` |
| 셀 인라인 편집 | `TabulatorGrid` 컬럼에 `cellType` (CLAUDE.md §6-1) — 직접 input 마운트 금지 |
| 체크박스 다중선택 + 추가/선택삭제 | `select-mode="checkbox"` + `addRow`/`deleteSelected` (CLAUDE.md §6) |
| 페이지네이션 | `TabulatorGrid`의 `show-pagination` — 별도 `Pagination` 불필요 |
| 그리드 밖 독립 페이지네이션 | `custom/pagination/Pagination.vue` (드묾) |
| 정적인 표(그리드 기능 불필요) | `custom/table/TableWrapper.vue` |
| 트리 | `custom/tree/TreeView.vue` |
| **결과가 비었을 때** | `custom/empty/NoData.vue` |

그리드 스타일은 `src/assets/css/tabulator-theme.css`가 전역 적용된다 — 다시 스타일링하지 않는다.

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
| 되돌릴 수 없는 작업 확인 | `custom/dialog/ConfirmDialog2.vue` — **CLAUDE.md §7 조건 확인** |
| 버튼 하나짜리 강제 확인 | `custom/dialog/AlertDialog2.vue` — 남용 금지, 보통은 toast |
| 아직 로직이 없는 팝업 자리 | `custom/dialog/EmptyStubDialog.vue` (6개 화면) |
| 모바일 하단 시트 | `custom/bottom-sheet/BottomSheet.vue` |

> **일반 저장/삭제에는 `confirm`을 붙이지 않는다.** toast가 기본이다 — CLAUDE.md §7.

---

## 7. 피드백 · 안내

| 이럴 때 | 이걸 쓴다 |
|---|---|
| 저장/삭제 성공, 필수값 누락 경고 | **toast** (CLAUDE.md §7) — 컴포넌트 아님 |
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
| 아이콘 | `custom/icon/Icon.vue` (등록된 것) 또는 `lucide-vue-next` |

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

**TabulatorGrid / TableWrapper / InfoTable**

| | 무엇 |
|---|---|
| `TabulatorGrid` | 목록 그리드(정렬·페이지네이션·선택·인라인편집) |
| `TableWrapper` | 기능 없는 정적 표 |
| `InfoTable` | 표가 아니라 **라벨-값 정보 표**(등록/상세 폼) |

**SearchWrapper / search__pc** — `SearchWrapper`는 화면의 검색 영역 레이아웃이다.
Figma `search__pc`는 **헤더 통합검색**이고 `layout/portal/PortalHeader.vue`에 이미 있다.

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
| `calendar` | `custom/calendar/calendar.vue` |
| `LNB Menu`, `header_templet__pc`, `masthead`, `footer__pc`, `main_menu*` | 화면에서 쓰지 않는다 — `Layout.vue`/`custom/sidemenu` 담당 |
| `search__pc` | 헤더 통합검색 → `layout/portal/PortalHeader.vue` |

---

## 11. 눈으로 확인

새로 만든 13종은 앱에서 **`/component/new-components`**에 전부 모아뒀다.
그 외 컴포넌트 샘플은 `src/views/component-sample/` 아래 각각 있다.

---

## 12. 공통 CSS — 화면 module.css를 만들기 전에 여기부터

`public/portal/asset/css/common/police-style.css`가 **전역 로드**된다(페이지에서 import 안 함).
CLAUDE.md §1의 CSS 우선순위 ①②를 실행으로 옮긴 것 — 같은 역할 클래스를 새로 만들기 전에 찾는다.

### 자주 쓰는 레이아웃 클래스

| 이럴 때 | 클래스 | 실제 |
|---|---|---|
| 검색 영역 배경+간격 | `.search-area` | flex-wrap, gap 1.6/3.6rem, 회색 배경 (18개 화면) |
| 그리드 위 우측 버튼줄 | `.list-actions` | flex, 우측 정렬, gap 0.8rem, 아래 여백 2rem (17개) |
| 좌우 양끝 배치 버튼줄 | `.btn-wrap` | flex, space-between, 100% |
| 버튼 몇 개 묶기 | `.btn-wrap-group` | flex, gap 0.5rem |
| 가로 묶음(간격만) | `.group-gap1/2/3` | flex + align-center + gap 1/2/3단계 |
| 스크롤되는 본문 영역 | `.layout-wrap` | padding 2rem 2.4rem, overflow-y auto |
| 그리드 위 여백 | `.grid-wrap` | margin-top 2rem |

### 유틸

| 용도 | 클래스 |
|---|---|
| 정렬 | `.al` `.ac` `.ar` (좌/중앙/우, `!important`) |
| 표시/숨김 | `.show` `.hide` (`!important`) |
| 스크린리더 전용 | `.blind` / `.sr-only` |
| 밑줄·줄바꿈 | `.underline` `.break-all` |
| 부서명 강조 | `.dept-name` |
| 팝업 제목 | `.pop-title` `.pop-title-sub` `.pop-title-lv2` |

### 색·크기는 반드시 토큰으로

hex를 직접 쓰지 않는다. `var(--Text-body_1)`, `var(--Base-primary)`, `var(--Border_gray02)`,
`var(--Surface-primary)`, `var(--Radius-medium3)`, `var(--Alert-danger-surface)` 등이 있다.
대응 토큰이 정말 없을 때만 hex(선례: `Badge.vue`의 `#fff6e5`).

### 그래도 없을 때

1. 라벨-값 표 → `custom/info-table/InfoTable.module.css` (이미 공통)
2. 그리드 → `src/assets/css/tabulator-theme.css` (전역 적용, 다시 스타일링 불필요)
3. 여기까지 없을 때만 화면 전용 `style/PC-XXX-NNNN.module.css`

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

### 아이콘
`lucide-vue-next` 를 쓴다. `custom/icon/Icon.vue` 는 자체 svg 6개뿐이라 대부분 안 맞는다.

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
