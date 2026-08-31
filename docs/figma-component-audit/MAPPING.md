# Figma ↔ 코드 컴포넌트 매핑표

> ## 📌 이 파일은 통째로 읽지 말고 `grep` 으로 찾는다
> ```bash
> grep -n "selectbox" docs/figma-component-audit/MAPPING.md
> ```
> **평소에는 이 파일을 열 필요도 없다.** 자주 쓰는 컴포넌트의 Figma 이름 → 코드 대응은
> `component-guide.md` §10 역인덱스에 이미 있다. 거기 없는 이름일 때만 여기서 찾는다.

대상: Figma `❤️ Component (컴포넌트)` 페이지(`4869:207929`)의 304개 중
**아이콘 130개·모바일전용 24개·희소(1~2회) 41개를 제외한 109개**.
코드 재고: `src/components/custom` 64 vue + `src/components/ui` 138 vue.

판정 기준
- **A 있음** — 기존 컴포넌트로 그대로 커버. 새로 만들지 않는다.
- **B 보강** — 기존 컴포넌트는 있으나 Figma variant 일부가 코드에 없음.
- **⚠ 같은 컴포넌트의 `2` 버전이 있으면 `2`가 정본이다** (`InputField2` 38화면 vs `InputField` 1,
  `GenericDialog2` 19 vs `GenericDialog` 1). 이 규칙은 CLAUDE.md에 없어서 최초 매핑 때
  `GenericDialog`로 잘못 적었다가 08-31에 고쳤다.
- **C 신규** — 저장소 전체 검색으로 부재 확인됨. 이번 생성 대상.
- **D 대상외** — 사이트 전역 레이아웃(1회성)이거나 Tabulator/그리드가 담당.

---

## A. 있음 — 매핑만 (36)

| Figma | 사용 | 코드 |
|---|---|---|
| `button` | 1124 | `custom/button/Button.vue` |
| `radio_button` | 818 | `custom/radio-group/RadioGroup.vue` |
| `badge` | 446 | `custom/badge/Badge.vue` |
| `checkbox` | 352 | `custom/checkbox/Checkbox.vue` |
| `Input Label` | 303 | `ui/label` + `custom/info-table/InfoField.vue` |
| `Text Field` | 230 | `custom/input/InputField2.vue` |
| `text_input` | 208 | `custom/input/Input.vue` |
| `selectbox` | 197 | `custom/select/SelectField.vue` |
| `footer_tab` | 154 | `custom/bottom-tab/BottomTab.vue` |
| `Page Title` | 150 | `custom/title/PageTitle.vue` |
| `.section_header` | 124 | `custom/title/PageHeader.vue` |
| `check list` | 86 | `custom/checklist-item/ChecklistItem.vue` |
| `Grid Title` | 84 | `custom/grid-title/GridTitle.vue` |
| `file_upload__atomic__pc` | 82 | `custom/file-upload/FileUpload.vue` |
| `pagination bar` / `pagination__pc` | 80/23 | `custom/pagination/Pagination.vue` |
| `text_area` | 80 | `custom/textarea/TextareaField.vue` |
| `Popup Title` | 79 | `custom/dialog/GenericDialog2.vue` |
| `button_text` / `button_link` | 75/56 | `custom/button/Button.vue` (variant) |
| `accordion` / `Accordion` | 54/26 | `custom/accordion/` |
| `tab` | 51 | `custom/tabs/` |
| `date_input` | 33 | `custom/datepicker/DatePicker.vue` |
| `toggle_switch` | 26 | `custom/switch/Switch.vue` |
| `search__pc` | 26 | (헤더 통합검색 → `layout/portal/PortalHeader.vue`. D로 재분류, B절 참고) |
| `부서영역` | 59 | `custom/select/DepartmentCascadeSelect.vue` |
| `breadcrumb` | 17 | `custom/breadcrumb/Breadcrumb.vue` |
| `alert` | 16 | `custom/alert/Alert.vue` |
| `FilterChip` | 9 | `custom/filter-chip/FilterChip.vue` |
| `divider` | 9 | `ui/separator` |
| `modal` | 9 | `custom/dialog/GenericDialog2.vue` |
| `calendar` | 6 | `custom/calendar/calendar.vue` |
| `badge__number` | 4 | `custom/badge/BadgeNumber.vue` |
| `checkbox__item` / `checkbox__list` | 4/4 | `custom/checkbox/Checkbox.vue` |
| `radio_button__list` / `__item` | 8/2 | `custom/radio-group/RadioGroupItem.vue` |
| `input_message__atomic` | 27 | `custom/input/InputField2.vue` 내부 hint/alert |
| `필수입력` | 7 | `custom/info-table/InfoField.vue` 필수 표시 |
| `Grid Handler` | 72 | `custom/tabulator/TabulatorGrid.vue` |

## B. 보강 — 2026-08-31 실제 대조 완료

**최초 감사(08-28)의 "B 3건"은 검증한 수가 아니라 의심 목록이었다.** A로 분류한 36개는
"같은 역할의 컴포넌트가 존재한다"까지만 확인했지 props를 대조하지 않았다. 08-31에 대조했고,
아래가 확정된 결과다.

### 갭 아님 — 이미 커버됨 (5)
| Figma | 판정 근거 |
|---|---|
| `button` Type4/Size5/State4 | `variant`에 primary/secondary/tertiary/tertiary2/text, `size`에 lg/md/sm/xs/xxs. 이름만 다름(`line PM`→`tertiary`). **최초 B에서 빠짐** |
| `file_upload__atomic__pc` State5 | `FileUpload.vue`에 uploading/uploaded/error/download 전부 있음 |
| `search__pc` Size3/State5 | 헤더 통합검색이며 `layout/portal/PortalHeader.vue`에 이미 구현. **`SearchWrapper`로 매핑한 게 오류** — SearchWrapper는 Figma `부서영역`+form set 쪽이다 |
| `tooltip__plan` Arrow3/Direction4 | `AppTooltip`의 `side`(4) = Direction, `align`(3) = Arrow |
| `tooltip__rich` 제목+본문+버튼 | **AppTooltip에 넣으면 안 된다** — 주석에 "텍스트 전용, 닫기 버튼 등 인터랙티브 요소 사용 금지"가 팀 규칙으로 명시돼 있다. 08-28에 만든 `custom/contextual-help/ContextualHelp.vue`가 이 역할이므로 그쪽으로 매핑 |

### 보강 완료 (2)
| Figma | 코드 | 한 것 |
|---|---|---|
| `tab` Type(primary\|secondary) | `custom/tabs/` | `tone` 축 추가. **기본값 `inherit`는 아무것도 덮어쓰지 않아 기존 화면 렌더가 그대로다**(fill=남색/line=파랑이 원래 동작). `type`은 `<button>` 네이티브 속성과 충돌해 이름을 `tone`으로 했다. Size 3종은 이미 있었음. 하드코딩 hex 6종도 값이 동일한 토큰으로 교체 |
| `toggle_switch` Size=xlarge | `custom/switch/` | `xl` 추가(트랙 64×32, 썸 24, 아이콘 14, 라벨 19px). default/lg 무변경 |

### C로 재분류 (1)
| Figma | 결과 |
|---|---|
| `select_text` Size4/State4 (52회) | `ui/native-select`로 매핑한 게 오류다. 실제로는 **테두리 없는 텍스트형 셀렉트**(라벨+화살표, hover 연회색/pressed 연파랑). 저장소에 없어서 신규 생성 → `custom/select/TextSelect.vue` + `textSelectVariants.ts` |

## C. 신규 생성 대상 (13) — 전부 생성 완료. 확인: /component/new-components

저장소 전체 `find -iname` 검색으로 부재 확인 완료.

| Figma | 사용 | 만들 이름 | 비고 |
|---|---|---|---|
| `card` | 9 | `custom/card/Card.vue` | `Type(2) Image(2)` + 태그/체크박스/버튼/배지 슬롯 |
| `tag` / `tag__list` | 16/9 | `custom/tag/Tag.vue`, `TagList.vue` | `Type(2) Size(3) State(3)` + 삭제 버튼 |
| `infobox` | 8 | `custom/infobox/InfoBox.vue` | `Type(2) Size(2)` |
| `No Data` | 6 | `custom/empty/NoData.vue` | 그리드·목록 빈 상태 |
| `spinner` | 9 | `custom/spinner/Spinner.vue` | `Size(3)` |
| `progress_bar` | 8 | `custom/progress/ProgressBar.vue` | `Size(2) State(3)` + alert |
| `top_button` | 9 | `custom/top-button/TopButton.vue` | `Type(2)` |
| `contextual_help` + `_trigger` | 9/23 | `custom/contextual-help/` | 무기 화면 우상단 "도움말" 버튼이 이것 |
| `critical_alerts` | 5 | `custom/alert/CriticalAlert.vue` | `Type(3)` |
| `disclosure` | 3 | `custom/disclosure/Disclosure.vue` | `State(2)` |
| `list` / `list_group` | 50/22 | `custom/list/` | `Level(3) Type(2)` |
| `chip__single` / `chip__multi` | 17/9 | `custom/chip/` | FilterChip과 **다른 것** |
| `Adress input` | 26 | `custom/address/AddressInput.vue` | ⚠ CLAUDE.md §1이 "없는 컴포넌트" 예시로 지목한 주소검색 |

## D. 대상외 (54)

- **사이트 전역 레이아웃(1회성)** — `header_templet__pc`(173), `LNB Menu`(1443),
  `main_menu*`(9종), `header*`(4종), `footer__pc`, `masthead__pc`, `identifier__pc`,
  `side_navigation`, `utility_dropdown*`(3종), `1 depth Ti`, `CI`, `top`/`bottom` 계열.
  → `custom/sidemenu`, `custom/content-layout`, `Layout.vue`가 이미 담당.
- **그리드가 담당** — `table`(9915), `table_2`(2445). 셀 한 칸 단위 컴포넌트라
  코드로 1:1 이식하면 안 된다. `custom/tabulator/TabulatorGrid.vue` + `tabulator-theme.css`.
- **화면 전용/자산** — `Memo Li`, `bed`, `caption_car`, `photo`, `MapPin`, `Star`,
  `dummy-image`, `scroll-bar`, `bullet`, `+ -`, `날짜`, `text + input`,
  `radio_button + input`, `btn search`, `stitle badge`, `S_title`, `Popup Grid Title`,
  `open_panel`, `user_feedback__pc`, `carousel__*`(4종), `coach_mark`, `radio_button__sorting`.
- **아이콘 130개** — `custom/icon/Icon.vue`가 이미 있음. Figma 아이콘명 → Icon name 매핑은
  별도 작업(이번 범위 밖).

---

## 가정 (사용자 확인 필요, 진행은 막지 않음)

1. **`❤️ Component` 페이지를 정본으로 본다.** 같은 이름이 다른 페이지에도 있는 경우
   (`card` 5벌, `table` 2벌, `button` 2벌 등 21종) Component 페이지 것을 기준으로 삼았다.
2. **사용 3회 미만은 제외.** 41개가 여기 해당하며 대부분 KRDS 원본 잔재(`skip_link`,
   `home_indicator__atomic` 등)로 이 포털에서 안 쓰인다.
3. **모바일 전용(`__mo`) 24개 제외.** MO 화면 작업이 시작되면 별도 배치로 처리.
4. ~~B(보강) 3건은 손대지 않았다.~~ → 08-31에 대조·보강 완료. B절 참고.
5. `chip__single/multi`와 기존 `FilterChip`은 **다른 컴포넌트**로 판단했다
   (Figma에 둘 다 별개로 존재, props도 다름).
