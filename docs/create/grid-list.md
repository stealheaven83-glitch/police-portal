# 유형: 단순 그리드 목록 + 검색

`docs/create.md` §2 에서 이 유형으로 판정됐을 때 편다. 기준 파일은 **`src/views/lpo/PC-LPO-0215/PC-LPO-0215.vue`**
와 `composable/PC-LPO-0215.ts` 둘이다. **이 두 파일만 읽는다** — `views/` 전체를 뒤지지 않는다.

> 규칙 본문은 `CLAUDE.md`. 여기는 이 유형에서 기준 파일의 **무엇을 형태까지 그대로 가져오는가**만 적는다.

## 그대로 따라할 것 — 구조를 눈으로 훑고 비슷하게 쓰는 게 아니라, 형태까지 가져온다

1. **파일 구성** — `PC-XXX-NNNN.vue` + `composable/PC-XXX-NNNN.ts` 둘뿐이다. `style/`·`route.ts` 없음
   (`CLAUDE.md` §3).
2. **템플릿 순서** — `PageHeader`(#left `PageTitle` / #right `Breadcrumb`) → `SearchWrapper`
   (#department / #form / #btns) → `.list-actions` → `TabulatorGrid`. 사이에 의미 없는 `<div>` 를
   끼우지 않는다.
3. **LNB** — 프리셋을 인라인 전개(`docs/create.md` §3). 0215 실측값: `openIndex: 1, activeChild: '근무일지(甲)'`.
   내 화면 값은 `presets.ts` 를 grep 해 따로 구한다 — 0215 값을 복사하지 않는다.
4. **브레드크럼** — 실제 라우트가 있는 항목에만 `path`(`docs/create.md` §3).
5. **`defineOptions` + `useBottomTabSetup`** — 이름 일치(`CLAUDE.md` §3).
6. **CSS** — 레이아웃은 공통 클래스(`.search-area` `.group-gap2` `.list-actions` `.dept-name`).
   테일윈드는 컴포넌트 prop 값으로 폭/여백 미세조정만(`inputClass="w-40"` 등, `CLAUDE.md` §1).
7. **그리드** — `ref="gridRef"` + `class="flex-1"` + `height="100%"` + `min-height`. 페이지네이션이 필요하면
   `show-pagination` + `:items-per-page`(그리드 화면 30개 중 21개가 쓴다).
8. **검색 옵션** — `export const xxxOptions` 로 composable 에 두고 화면에서 import. sentinel 은 `'all'`
   (`CLAUDE.md` §5).
9. **코드 스타일** — 세미콜론·`function`·import 순서(`CLAUDE.md` §3).

## 기준 파일을 복사하기 전에 위 9개를 그 파일에서 실제로 확인한다
0215 는 2026-08-31~09-01 에 정비했다(LNB 추가, 죽은 브레드크럼 링크 제거, 불필요한 래퍼 제거,
페이지네이션 예시 추가). **그래도 완전무결하다고 가정하지 않는다** — 어긋난 게 보이면 사용자에게
알린다. 기준 파일이 바뀌면 이 문서도 갱신한다.

## 그리드 컬럼이 많을 때
`layout="fitColumns"`(기본)는 폭을 컨테이너에 맞춰 나눈다. 컬럼이 많아 가로 스크롤이 필요하면(예: 12개
장비 컬럼) `layout="fitDataFill"` + 각 컬럼에 고정 `width`. 그 밖의 그리드 사용법은 `component-guide.md` §3.

---

## 변형: 체크박스 그리드 인라인편집 CRUD (선택삭제 / 추가 / 저장)
기준 파일은 **`PC-COM-2401`**. 골격은 위 9개와 같고, 여기에 다음이 얹힌다.

- **체크박스 다중선택 + 추가/선택삭제**는 `select-mode="checkbox"` + `gridRef.addRow(data, top)` /
  `gridRef.deleteSelected()` 로 이미 있다 — 직접 구현하지 않는다. 사용법은 `component-guide.md` §3.
- **셀 인라인 편집**은 컬럼 정의에 `cellType` 만 지정한다(`input` / `checkbox` / `select` + `selectOptions` /
  `button`). 셀마다 커스텀 input/select 를 마운트하지 않는다. 2401 의 "목록수/페이지수" 가 `select` 예시다.
- **페이지네이션 그리드에 맨 아래 추가**(`addRow(data, false)`)는 보고 있는 페이지에 안 나타난다 — 추가 후
  `gridRef.value?.setPage('last')` 로 따라간다(2401). 맨 위 추가(`addRow(data, true)`)는 항상 1페이지라
  불필요하다.
- 선택 건수는 `@row-selection-changed` 로 갱신한다 — 인자는 `RowComponent` 배열이다(`CLAUDE.md` §5).
- 삭제/저장 피드백은 `CLAUDE.md` §4 의 toast 패턴 그대로.
