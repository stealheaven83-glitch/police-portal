# 유형: 2분할·3분할 목록 + 상세

`docs/create.md` §2 에서 이 유형으로 판정됐을 때 편다. **골격은 하나고, 상세 쪽이 무엇이냐로 기준 파일이
갈린다.** 골격을 먼저 확정하고, 세부만 해당 기준 파일에서 가져온다.

> 규칙 본문은 `CLAUDE.md`. 여기는 이 유형에서 **무엇을 어떤 순서로 가져오는가**만 적는다.

## 1. 골격 — 셋 다 같다
```html
<LayoutSplit :count="2" :widths="[…]">
  <template #layout-1> <LayoutPanel title="목록"> … </LayoutPanel> </template>
  <template #layout-2> <LayoutPanel title="상세"> … </LayoutPanel> </template>
</LayoutSplit>
```
- `custom/content-layout/layoutSplit.vue`(드래그 리사이즈 포함) + `custom/content-layout/layoutPanel.vue`.
- **분할을 `display:grid` 로 직접 짜지 않는다**(`CLAUDE.md` §1). 같은 2분할 화면인데 한쪽은 `LayoutSplit`,
  다른 쪽은 `styles.columns` 로 갈린 적이 있다.
- `PageHeader`·브레드크럼·LNB·`defineOptions` 는 `docs/create/grid-list.md` 1~5번과 같다 — 그 부분은
  0215 를 본다.

## 2. 상세가 무엇이냐 → 기준 파일 하나만 읽는다

| 상세 쪽 | 기준 파일 | 이 파일에서 가져오는 것 |
|---|---|---|
| **폼**(라벨-값 입력, `InfoTable` + `InfoField`) + 아래 관련 그리드 | **`PC-LPO-0801`** | 단일선택 그리드 → 폼 채우기, **조건부 활성/디세이블**이 많은 폼의 처리 방식 |
| **그리드** — 체크박스 다중선택 + 관련 그리드 + 팝업 2개 | **`PC-COM-2204`** | 팝업이 화면 상태를 공유하는 방식(아래 3), `cellType:'button'` 으로 행마다 다른 버튼("부서 조회") |
| **단일선택 + 팝업 히스토리** | **`PM-PUB-0103`** | `@row-selection-changed` 인자를 `row.getData()` 로 방어적으로 언랩하는 예 |

## 3. 팝업과 화면 사이의 상태 — 둘 중 하나
| 팝업이 | 방식 | 예 |
|---|---|---|
| 화면 상태를 볼 필요 없이 **고른 값만 돌려준다** | `v-model` + `emit` — 상태를 provide 하지 않는다 | `PC-LPO-0801` `DeptSearchDialog` |
| 화면의 목록·선택 행을 **직접 읽고 바꾼다** | **provide / inject (패턴 A)** — 아래 | `PC-COM-2204` `DepartmentSearchDialog` |

패턴 A: 페이지가 composable 을 **한 번만** 호출하고 `provide()`, 팝업은 `inject()` 로 같은 객체를 받는다.
각자 `useXxxList()` 를 다시 호출하면 상태가 갈라진다.
```ts
// 페이지
const store = useXxxStore()
provide(XxxKey, store)
// 팝업(components/*.vue)
const store = inject(XxxKey)!
```
- 팝업·composable 은 그 화면 폴더 밑(`components/`·`composable/`)에 둔다(`docs/create.md` §3).
- **팝업에 화면ID가 따로 붙어 있으면**(2204 의 부서조회 팝업이 `PC-COM-2205` 인 것처럼) 그 화면은
  **화면군**이라 라우터 등록이 달라진다 — `docs/create/tab-popup.md` 를 같이 편다. 2204 가 그 경우다.

## 4. 그리드에서 자주 걸리는 것
- `@row-selection-changed` 는 `RowComponent` 배열 — `row.getData()`(`CLAUDE.md` §5).
- 상세 저장 후 목록 갱신은 **배열 재할당**(`CLAUDE.md` §5) — `splice` 하면 그리드가 안 바뀐다.
- 상세 폼의 필수값 체크·저장 피드백은 `CLAUDE.md` §4.

---

## 변형: 3분할 (트리 + 목록그리드 + 목록그리드)
기준 파일은 **`PC-COM-2201`**. `LayoutSplit :count="3"` + `LayoutPanel` 3-pane 이고, 왼쪽은
`custom/tree/TreeView.vue`. 그 외는 위와 같다.
- 2201 의 부서삭제 `dialog.confirm()`("하위 부서도 함께 삭제")은 되돌릴 수 없는 연쇄 삭제라 규칙에 맞는
  예다. 같은 파일의 권한저장 `onSave` confirm 은 위반이니 따라 하지 않는다(`CLAUDE.md` §4).
