# PC-LPO-0801 인사관리 — 검토 결과

> ⚠ **CSS 관련 판단은 낡았다 (2026-09-04 저녁 CSS 체제 개편).**
> 이 문서는 `styles.css`(화면 전용 CSS) + "나중에 승격" 체제에서 쓴 것이다. 그 체제는 없어졌다 —
> `styles.css` 는 삭제됐고, CSS 는 `police-style`(원본·읽기전용) / `police-common`(기본) /
> `police-override`(덮을 때) 세 파일에 `.lp-*` 이름으로 들어간다. **승격도 없다.**
> 특히 아래 "`styles.css` 와의 중복은 지적이 아니다"(4-2)는 **지금은 반대다 — 중복은 지적한다.**
> 현행 규칙은 CLAUDE.md §1-2, 검토 항목은 `docs/review.md` 2~4 를 본다.
> (이 문서는 그때의 기록이라 그대로 둔다. CSS 외 항목은 여전히 유효하다.)

- 1차: 2026-09-03 / **2차: 2026-09-04 (이 문서는 2차 기준으로 갱신됨)**
- 대상: `src/views/lpo/PC-LPO-0801/` 폴더 전체
  (`PC-LPO-0801.vue` 507줄 / `composable/PC-LPO-0801.ts` 266줄 / `components/DeptSearchDialog.vue` 132줄)
- 기준: `docs/review.md` 항목 1~8 (2026-09-04 추가된 **케밥케이스 항목** 포함)
- 시안 대조: Figma `8mQz91txveSEKO0ky7Ck6V` / `10766:72722` (목록+상세, 검색 접힌 상태)
- 2차 사이에 들어온 변경: `141647b 인사관리 페이지 작업`(jhkim, 09-04)
- **고치지 않고 목록만 남긴다.**

---

## 0. 1차 이후 처리된 것

| 1차 항목 | 상태 |
|---|---|
| 3-1·3-2 `style/PC-LPO-0801.module.css` 106줄이 죽어 있던 것 | ✅ **해결.** 파일 삭제, `.activeRow` → `styles.css` 의 `.pc-lpo-0801-active-row`, `PC-LPO-0801.vue:52` 도 문자열 클래스로 |
| 카멜케이스 클래스(`.detailLayout` `.photoBox` `.photoFrame`) | ✅ **해결.** 폴더 전체에 카멜 클래스 0건 — 신규 규칙 통과 |
| 2-1 "직급" 라벨에 재직/휴직/전출 옵션 | ⚠ **절반.** 라벨을 `직급1~3` 으로 바꿨는데 **value 는 그대로**다 → 2-1 참고 |
| (개선) 근무구분 라디오가 한 줄에 몰리던 것 | `class="flex-wrap"` 추가 — 시안의 3줄 흐름에 맞음 |
| (개선) 형제가 있는 DatePicker 폭 | `class="w-37"` + `input-class="w-full"` + 공통 `.dp--main` 을 `:only-child` 로 좁힘 → 5-7 참고 |

1차의 나머지 항목은 그대로 남아 있다. 아래는 **2차 시점의 현황 전체**다.

---

## 1. 동작 오류

### 1-1. 주소검색 돋보기에서 `search` prop 을 뺀다 (남음)
`PC-LPO-0801.vue:243-255`. `InputField2` 는 `search` 가 true 면 아이콘을
**클릭 가능한 `<button aria-label>`** 으로 렌더하고 `icon-click` 을 emit 한다
(`InputField2.vue:60-61, 203-210`). 화면에 핸들러가 없다.

**주소검색 기능은 넣지 않기로 했다(09-04 확인).** 그러면 `search` 도 빼야 한다 — 붙어 있으면
탭 키로 포커스가 잡히고 스크린리더가 "검색 버튼"이라 읽는데 눌러도 아무 일이 없다.
빼면 `<img>` 장식으로만 그려지고 시안과도 같아진다.

### 1-2. 성명이 하드코딩이라 목록 행을 바꿔도 안 바뀐다 (남음)
`PC-LPO-0801.vue:78-80` 이 `<span>홍길동</span>` 리터럴이다.
`selectRow()` 가 `detail.name` 을 채우는데(`composable:240`) 템플릿이 그 값을 안 쓴다.

덧붙여 `<span>` 으로 감싼 탓에 `InfoField` 의 `isTextOnly()`(`InfoField.vue:38-43`)가 false 가 되어
값 칸 공통 텍스트 스타일(`info-table-txt`)도 안 붙는다. `{{ detail.name }}` 처럼 **텍스트 노드로** 두면
클래스 없이 공통 스타일이 걸린다.

### 1-3. 초기 상태가 시안과 어긋난다 (남음)
`activeRowKey` 초기값 5(`composable:229`)라 목록 5번 행은 강조되는데 `detail` 은
`createEmptyDetail()` 이라 상세는 **전부 빈 폼**이다. 시안은 5번 선택 + 상세가 채워진 상태다.

### 1-4. 조회 버튼에 핸들러가 없다 (남음)
`PC-LPO-0801.vue:32`. 목업 배열 필터링은 퍼블 범위다(CLAUDE.md 서두 표).
의도적으로 비운 것이면 인계 메모에 적혀 있어야 한다.

---

## 2. 일관성·데이터

### 2-1. 직급 옵션의 **라벨만** 바뀌고 value 는 상태값 그대로다 (2차에서 변형)
```ts
// composable:76-82 — 주석도 아직 "상태구분"이다
export const statusOptions: SelectOption[] = [
  { label: '전체',  value: 'all' },
  { label: '직급1', value: 'active' },       // ← 재직
  { label: '직급2', value: 'leave' },        // ← 휴직
  { label: '직급3', value: 'transferred' },  // ← 전출
]
```
화면에는 직급으로 보이는데 실제로 넘어가는 값은 `active`/`leave`/`transferred` 다.
개발팀이 이 value 로 API 를 붙이면 직급 조회에 재직 코드가 실린다.
value 도 `rank1`… 로 바꾸고 위 주석("상세조회 - 상태구분")도 같이 고쳐야 한다.

시안이 접힌 상태라 진짜 라벨을 못 봤다 — `직급1/2/3` 이 임시값이면 5-6과 함께 확정한다.

### 2-2. `searchEquipmentName` — 장비 화면 복붙 잔재 (남음)
`composable:224`. 실제로는 "이름" 검색 필드다(`PC-LPO-0801.vue:28`). `searchName` 이 맞다.

### 2-3. `position` 이 두 뜻으로 쓰인다 (남음)
`PersonnelListRow.position` = 직책(`관리`), `PersonnelDetailForm.position` = 근무구분(관서장/팀장…).
상세 쪽을 `dutyType` 등으로 나눈다.

### 2-4. 목업 날짜 `2015-11-00` 이 존재하지 않는 날짜다 (남음)
`composable:125`. 지금은 문자열 컬럼이라 표시만 되지만 날짜 셀·정렬로 바뀌면 깨진다.

### 2-5. 정기사고자 체크박스에 이름이 없다 (남음)
`PC-LPO-0801.vue:207` `<Checkbox v-model="detail.isPeriodicAccident" />` — `label` 이 없다.
옆 셀렉트/데이트피커처럼 `label` + `label-class="sr-only"` 를 준다.

### 2-6. 기타근무 라디오가 4개 그룹으로 쪼개져 있다 (남음)
`PC-LPO-0801.vue:158-202` 이 같은 `detail.etcWork` 를 공유하는 `RadioGroup` 을 4개 만든다.
reka-ui `RadioGroupRoot` 래퍼라 그룹마다 role/roving tabindex 가 따로 생긴다 →
보조기술에 "1개 중 1개" 라디오그룹 4개로 읽히고 화살표 이동이 그룹 안에서 막힌다.

### 2-7. disabled 로 꺼진 값이 남는다 (남음)
동명여부를 '있음'→'없음' 으로 되돌려도 `duplicateType` 이 남는다. 소속팀·기타근무·정기사고자도 같다.
화면에 안 보이는 값이 저장 payload 에 실린다 — 개발팀 몫으로 넘길지 화면단에서 비울지 정한다.

### 2-8. 줄 끝 공백 (2차 신규, 사소)
`PC-LPO-0801.vue:121` `<InfoField label="근무구분"> ` 끝에 공백이 붙었다.

---

## 3. 죽은 코드

### 3-1. ✅ 1차 지적(`style/*.module.css`)은 해결됨
현재 폴더에 죽은 CSS 는 없다. `import styles` 도 제거됐다.

### 3-2. `deptSearchTarget` 이 팝업이 닫혀도 안 비워진다 (남음)
`PC-LPO-0801.vue:433` 부근. 다음에 열 때 덮어쓰므로 실제 오작동은 없다. 정리 대상.

---

## 4. 규칙 위반

### 4-1. 공통에 올린/고친 CSS 가 `component-guide.md` §12 에 미등재 (남음, 오히려 늘었다)
`police-style.css:1613-1710` 의 13개(`.detail-layout` `.detail-fields` `.photo-box` `.photo-frame`
`.photo-frame .photo-empty` `.form-rest` `.notice-strong` `.readonly-text` `.transfer-section`
`.transfer-head` `.transfer-title` `.detail-scroll` …)가 §12 표에 한 줄도 없다.

2차에서 `.detail-fields .dp--main` 을 `:only-child` 로 **수정까지** 했는데 여전히 표에 없다.
§12 표가 `police-style.css`(1500줄)를 대신 보는 창구라, 표에 없으면 공통에 올려놓고도 다음 사람이
못 찾는다.

> ⛔ **아래 문단은 폐기됐다(2026-09-04 저녁). 지금은 중복을 지적한다 — 문서 맨 위 배너 참조.**
> 여기서 예고한 "STT 승격 시 값 맞추기"는 실제로 그렇게 처리됐다: `PC-STT-0103` 이 공통
> `.photo-frame` 을 쓰고, 차이나는 배경색만 `.lp-photo-frame-fill` 델타로 붙였다.
>
> ~~**`styles.css` 와의 중복은 지적이 아니다(09-04 확인).**~~ `styles.css` 는 승격 대기 저장소라
> 뒤질 필요가 없고 중복이 남아 있어도 정상이다. 이 화면은 `police-style.css` 를 보고 없어서 만든
> 것이니 §1의 ② 대로 한 것이다. (`PC-STT-0103` 의 `.pc-stt-0103-photo-frame` 이 `styles.css` 에
> 먼저 있었지만 — `dfb93eb` → `0d6fd6d` — 아직 승격 안 된 것일 뿐이다.)
> 다만 **나중에 STT 를 승격할 때 값을 맞춰야 한다** — 공통 `.photo-frame` 에는 `background-color` 가
> 없고 `.pc-stt-0103-photo-frame` 에는 있다.

### 4-2. `router/index.ts` 에 직접 등록돼 있다 (남음)
`src/router/index.ts:78-85`. `path`/`name`/`layout` 이 전부 규약대로라 `plannedRoutes` 가
만들어 주는 항목이다(§4 표: 규약대로 추가 → `index.ts` ⛔). 도입 전 잔재.
`taken` 필터 덕에 중복 등록은 안 되므로 **동작에는 영향이 없다.**

### 4-3. `styles.css` 0801 블록에 남의 화면 클래스가 섞여 있다 (남음)
`.pc-lpo-0701-vehicle112-label`(351행)이 PC-LPO-0801 블록 끝, PC-STT-0103 블록 직전에 있다.
0701 블록이 없어서 눈에 보이는 블록 끝에 붙인 것으로 보인다. 규칙대로면 284행 자리에
`/* ── PC-LPO-0701 … ── */` 블록을 새로 만들어 넣어야 한다.
§1-2 "자기 블록만 만진다" 라 여기서 옮기지 않고 작성자에게 알린다.

### 4-4. import 순서 (§7) (남음)
기준은 `vue → 외부 라이브러리 → 공통 컴포넌트 → 화면 composable → menu/tab`.
- `useDialog`(공통 composable)가 컴포넌트 import 앞(305행)
- `ScrollWrapper`(공통 컴포넌트)가 menu/tab import 뒤(329행)
- 화면 composable 이 그보다 더 뒤(330행)

### 4-5. ✅ 케밥케이스 (2026-09-04 신설 항목) — 통과
화면·팝업 어디에도 카멜 클래스가 없다.

---

## 5. 확인 필요

### 5-1. 전입 전출 현황이 상세와 한 스크롤 영역에 묶여 있다 (가장 크다, 남음)
시안은 '인사 상세' 패널 오른쪽에 **자체 스크롤바**가 있고 '전입 전출 현황' 은 그 아래
**별도 박스**로 보인다 — 상세 폼만 스크롤되고 전입 전출 표는 제자리에 남는 구조다.

코드(`PC-LPO-0801.vue:274-294`)는 `ScrollWrapper` 하나로 둘을 **같이** 스크롤하고 사이를
`.transfer-section` 의 `border-top: 6px` 로만 나눈다. 상세를 내리면 전입 전출 표가 같이 밀린다.

시안 해상도로는 별도 패널인지 굵은 divider 인지 단정하지 못했다. **원본 프레임 확대 확인 필요**이고,
별도 패널이 맞으면 `LayoutPanel title="전입 전출 현황"` 을 하나 더 두는 게 맞다
(그러면 `.transfer-section`/`-head`/`-title` 세 클래스도 필요 없어진다).

### 5-2. 전입 전출 표의 부서조회 트리거를 임의로 추가했다 (남음)
시안 셀은 `부서조회` placeholder 만 있는 입력창이고 돋보기가 없다. 코드는 `cellIcon` 으로 돋보기를
붙여 팝업을 연다. 주석에 근거가 적혀 있다 — **의도대로인지 확인만** 하면 된다.

### 5-3. 팝업 안 2분할을 `display:flex` 로 직접 짰다 (남음, 항목 1 해당)
`DeptSearchDialog.vue:23-49` + `styles.css` 의 `.pc-lpo-0801-dept-panes`/`-pane`/`-pane-title`.
패널 상자(border·radius)와 제목 바(회색 배경·border-bottom), `aria-labelledby`/`h3`/`id` 까지 손으로
만들었다 — `LayoutSplit` + `LayoutPanel` 이 하는 일이다(§1이 명시적으로 금지하는 형태).

`LayoutSplit` 은 드래그 리사이즈가 딸려 있고 높이를 부모에서 받는 구조라 다이얼로그 안에서
그대로 되는지는 확인이 필요하다. **예외로 판단되면 §1에 "팝업 안은 제외" 한 줄을 넣어야** 다음 사람이
같은 고민을 반복하지 않는다.

### 5-4. 팝업이 다시 열려도 상태가 초기화되지 않는다 (남음)
`keyword`, `selectedNode`, `activeRow` 가 `setup` 에서 한 번만 만들어진다. 특히 `activeRow` 는
`infoRows.value[1]`(교수부)로 미리 선택돼 있어, 전부서용으로 고른 뒤 전출부서용으로 다시 열면
이전 선택이 남는다.

### 5-5. 팝업 조회 버튼이 빈 함수다 (남음)
`DeptSearchDialog.vue:120-122` `onSearch()` 가 TODO 주석뿐이다.

### 5-6. 상세조회를 펼친 상태의 시안을 못 봤다 (남음)
`10766:72722` 는 접힌 상태다. 2-1(직급 옵션 라벨·value)은 이 프레임을 봐야 확정된다.

### 5-7. 공통 `.detail-fields .dp--main` 을 `:only-child` 로 좁혔다 (2차 신규)
`police-style.css:1632`. 형제가 있는 DatePicker(정기사고자·기타근무)가 칸을 다 먹지 않게 하려는
변경으로 보인다. **지금은 안전하다** — `.detail-fields` 를 쓰는 화면이 0801 하나뿐이다
(`PC-STT-0103` 은 `.pc-stt-0103-detail-fields` 로 자기 것을 쓴다).

다만 공통 클래스에 이 화면 사정을 박은 것이라, 다음 화면이 `.detail-fields` 를 쓰면서 값 칸에
DatePicker + 다른 컨트롤을 같이 두면 폭이 안 늘어나 헤맬 수 있다. 의도한 규칙인지 확인하고,
맞다면 §12 표에 그 조건까지 적는다(4-1).

---

## 6. 확인했고 문제 없는 것 (다시 파지 않도록)

- **`advancedSearchOpen = ref(false)`** — 접힌 채 시작. 프로젝트 15개 화면 중 14개가 false 다. 정상.
- **전입 전출 그리드의 `height=""`** — `PC-LPO-0701`, `PC-STT-0103` 도 같은 패턴. 행 수만큼 자라게 하려고
  기본값 `220px` 를 비우는 것이다. 오타 아님.
- **`selectByCheckboxOnly = { selectableRows: 'highlight' }`** — 행 클릭으로 선택이 토글되는 것을 막는
  의도된 설정. 근거 주석 있음.
- **`rowKey` 와 `no` 가 같은 값인데 따로 있는 것** — `TabulatorGrid` 가 `:data` 를 복제해 넘기기 때문.
- **저장/삭제를 `dialog.confirm` + `dialog.alert` 로 한 것** — §7 기본값(toast)과 다르지만 **사용자 지정**이고
  코드 주석에 명시돼 있다. 되돌리지 말 것.
- **LNB `openIndex: 6` / `activeChild: '인사관리'`** — CLAUDE.md §5 실측값과 일치.
  (`review.md` 상 LNB 는 검토 대상이 아니다.)
- **`transfers` 재할당 / `row.getData()` 방어 언랩** — §3·§6 대로. `addRow` 로 추가한 행도
  `TabulatorGrid` 가 `update:data` 로 되돌려주므로 배열과 어긋나지 않는다.
- **`defineOptions({ name: 'PcLpo0801' })` ↔ `useBottomTabSetup.componentName`** — 일치. KeepAlive 정상.
- **블록 순서 `template` → `script`, `<style>` 없음, 인라인 `style=` 없음, raw `<table>` 없음** — 화면·팝업 모두 통과.
- **`styles.css` 의 0801 블록 위치** — PC-LPO-0601 과 PC-STT-0103 사이. 오름차순 자리 맞다
  (블록 안에 섞인 0701 클래스만 4-3).
- **브레드크럼** — `/lpo` 에 `path` 를 안 줬다. §4 대로.
- **`RadioGroup` 에 `:class` 와 `class` 가 같이 붙은 것**(122행) — Vue 가 병합한다. 정상.
- **`flex-wrap` `w-37` `w-25` 등 테일윈드** — 전부 컴포넌트의 `class`/`input-class` prop 으로만 들어간다.
  §1의 허용 예외.
- **그리드 `min-height` 미지정** — §1-1 8번에 있지만 `PC-LPO-0215`·`PC-COM-2204`·`PC-STT-0103`
  어디에도 없다. 이 화면만의 누락이 아니라 규칙 쪽이 현황과 다르다.
