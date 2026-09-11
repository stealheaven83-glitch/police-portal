# CSS 정리 — 죽은 선언 / 빠진 선언 (2026-09-11)

대상: `police-common.css`(346 클래스) · `police-override.css`(69 클래스).
`police-style.css` 는 §2 상 읽기 전용이라 제외했다.

**삭제 기준 — "안 쓰인다"만으로는 안 지운다.**
3명이 동시 작업이라, 안 쓰이는 이유가 *버려진 것*일 수도 있고 *아직 안 붙인 것*일 수도 있다.
git 이력으로 둘을 갈라서, **내(wjm) 것이면서 마크업이 커밋으로 제거됐거나 오래 미사용인 것만**
지웠다. 남의 최근 커밋은 안 지우고 목록으로만 남긴다.

판정 방법 — 스크립트 2개(`scratchpad/css-audit.cjs`, `missing.cjs`) + `git log -S`.
- **①** 두 파일의 셀렉터에서 클래스를 뽑고 `src/**` 전체 파일의 **토큰 집합**과 대조. "class 속성"이
  아니라 토큰 전체와 맞춘 이유는 `:class` 동적 바인딩·문자열 조합을 놓치지 않기 위해서다.
- **②** `src/views/**` 템플릿의 **정적** `class="…"` 토큰을, 프로젝트 CSS 전부 + `src/**/*.vue` 의
  `<style>` 블록 + 라이브러리 CSS(tabulator·vuepic·vue-sonner·swiper) 선언과 대조하고
  테일윈드 유틸을 패턴으로 제외.
- **③** 후보마다 `git log -S "<클래스>" -- "*.vue"` / `-- "*.css"` 로 **마크업에 있었던 적이 있는지,
  누가 언제 넣고 뺐는지**를 확인. 이 단계가 삭제 여부를 갈랐다.

---

## ① 선언됐으나 안 쓰임 — 20건 중 **삭제 8 / 보류 8 / 보존 4**

### 삭제함 (8) — 전부 내(wjm) 것이고 이력이 확정된 것

| 클래스 | 파일:줄 | 이력 |
|---|---|---|
| `.lp-file-item` | common:1179 | `222619a` 09-04 wjm 생성. **마크업(.vue)에 한 번도 안 들어감** — 1주일째 미사용. 형제 `.lp-file-name`·`.lp-file-count`·`.lp-file-list` 는 5개 화면에서 쓰여서 남김 |
| `.lp-file-remove` `+:hover` | common:1195,1207 | 〃 |
| `.lp-roster-table`(+`th,td`/`thead th`) `-col-check` `-col-order` `.lp-roster-empty` | common:2525~2553 | `b5d1ae0` 09-08 13:06 **wjm 이 CSS+마크업 같이 생성** → `f7bbe0d` 09-09 17:54 **h_j111** 이 `PC-LPO-0202.vue` 를 -221/+68 로 갈아엎으며 `<table class="lp-roster-table">` 3개를 걷어냄. CSS 만 남았다 |
| `.lp-schedule-scroll` `-table`(+4변형) `-cell` `-cell-btn`(+`:hover`) `-name` | common:2555~2612 | 〃 (같은 커밋 쌍) |
| `.lp-table-left td` | override:107~113 | `222619a` 09-04 wjm 생성 → `55c70ff` 09-07 **wjm 본인이** 마크업에서 제거. 섹션에 이 규칙 하나뿐이라 주석 포함 삭제 |

`.lp-roster-toolbar`·`.lp-roster-title` 은 [PC-LPO-0202.vue:81,102,124](src/views/lpo/PC-LPO-0202/PC-LPO-0202.vue#L81)
에서 **계속 쓰여서 남겼다** — 표는 갈아엎혔지만 표 위 제목줄은 그대로다.

### 보류함 (8) — 남의 최근 커밋. 안 지웠다

| 클래스 | 추가 | 왜 보류인가 |
|---|---|---|
| `.calendar-area-date-value` | `1a550e1` 09-10 12:56 h_j111 `1-1. 근무일지(甲) - 근무지정표작성 수정` | `fd3a2cf` 09-09 22:05 **jhkim** 이 `.vue` 에 넣었던 걸 다음날 h_j111 이 걷어낸 것. 같은 화면을 세 사람이 순서대로 건드리는 중이라 또 들어올 수 있다 |
| `.calendar-area-group` | 〃 | **마크업에 한 번도 안 들어감** — h_j111 이 CSS 에만 선언했다. 커밋명이 `수정`, 직전 커밋은 `작업중`. **쓸 자리를 아직 안 붙인 것으로 보인다** |
| `.board-category-tabs` `.board-list-toolbar` `.board-mine-toggle` | `0b838c3` 09-10 14:25 jhkim `게시판 ai  작업 완료` | `fb5017b` 09-10 16:59 **같은 사람이 2시간 34분 뒤** `페이지 작업중` 커밋에서 마크업을 뺐다. 진행 중인 작업의 중간 상태다 |
| `.lp-search-box` `+ > button` | `0c8238a` 09-08 19:34 `근무일정조회` | **마크업 이력 0건.** 작성자가 `DESKTOP-TIBSU08\FUZ <1>` 로 이메일이 `1` 이라 **내 다른 머신인지 남인지 단정할 수 없다**. 주석에 사용 예시까지 적혀 있어 쓰려던 의도가 분명하다 |

§12 표의 `.board-*` 3행은 '쓰는 곳'이 `PM-COM-1101 · 2101` 로 적혀 있지만 **그 화면들이 실제로는
안 쓴다** — 표가 마크업보다 앞서 있는 상태다. 보류했으므로 표도 그대로 뒀다.

### 보존함 (4) — 스크립트가 틀린 것

| 클래스 | 왜 남겼나 |
|---|---|
| `.lp-log-tag-danger` `-primary` `-success` (common:2698~2705) | PM-LPO-0223 에서 **템플릿 리터럴로 조립**한다 — `` `lp-log-tag-${row.tag.tone}` ``([PM-LPO-0223.vue:123](src/views/lpo/PM-LPO-0223/PM-LPO-0223.vue#L123)). composable 의 `tone` 값이 `danger`/`primary`/`success` 3개로 정확히 대응 |
| `.tabulator-col-group-cols` (override:48) | **Tabulator 가 런타임에 붙이는 라이브러리 클래스**다. `src/**` 에 없는 게 정상 |

---

## ② class 에 있으나 CSS 선언이 없음 — 12건 중 **정리 1 / 보고만 11**

### 정리함 — `class="meta-value"` 제거 (3곳)

[PatrolAreaDetailDialog.vue:5](src/views/lpo/PC-LPO-0202/components/PatrolAreaDetailDialog.vue#L5),
[TimeManageDialog.vue:4-5](src/views/lpo/PC-LPO-0202/components/TimeManageDialog.vue#L4)

`.meta-value` 는 어디에도 선언이 없고, 그 `<em>` 은 이미 `.meta-wrapper em`(override:607)이
색을 먹이고 있다. 내(wjm 09-10) 파일이고, 클래스만 떼고 `<em>` 은 뒀다 —
**보이는 모습은 변하지 않는다.**

### 보고만 (11)

| 클래스 | 위치 | 비고 |
|---|---|---|
| `main` `card-wrap` `notice-slide` | [Main.vue:8,140,216](src/views/Main.vue#L8) | 09-03 jhkim. 포털 화면(README 영역). `card-wrap`·`notice-slide` 는 `swiper-slide` 와 같이 붙어 있어 **JS 훅일 수 있다** |
| `page-head-text` `page-head-actions` | [NotebookMain.vue:34,40](src/views/lpo/notebook/NotebookMain.vue#L34) | 포털 화면. 파일에 `<style>` 블록이 있는데 이 둘만 빠져 있다 |
| `fade-in` `partial` `no` `group` `cursor-help` | `src/views/component-sample/**` | 컴포넌트 샘플 페이지. 화면이 아니라 대상 밖 |
| `inuse` | [PM-PUB-0409.vue:66](src/views/pub/PM-PUB-0409/PM-PUB-0409.vue#L66) | **오탐** — `bed === 'inuse'` 는 클래스가 아니라 데이터 값(`BedState` 타입) |

---

## ③ 덤으로 나온 것 — **깨진 `@import` 3건**

[police-entry.css](public/portal/police-entry.css) 가 존재하지 않는 파일 3개를 import 한다:

```css
@import url("./asset/css/common/pub01.css") layer(police);   /* 파일 없음 */
@import url("./asset/css/common/pub02.css") layer(police);   /* 파일 없음 */
@import url("./asset/css/common/pub03.css") layer(police);   /* 파일 없음 */
```

`public/portal/asset/css/common/` 에 `pub0*.css` 가 하나도 없다 — 매 로드마다 404 3번.
**건드리지 않았다.** 지운 파일인지 아직 안 올라온 파일인지 우리가 알 수 없고, 잘못 지우면
나중에 그 파일이 들어와도 로드가 안 된다. 담당자 확인 필요.

---

## §12 표 동기화

삭제한 것만 반영했다.

- 행 삭제: `.lp-schedule-*`(L569) · `.lp-table-left`(L633)
- 행 수정: `.lp-roster-*`(L568) → 살아남은 `-toolbar`/`-title` 만 남기고 설명을 `TabulatorGrid` 로
  바뀐 현재에 맞춤 / `.lp-file-boxes`(L560) → 설명 끝의 "구분선 방식은 `.lp-file-item`" 문구 제거
- `police-common.css:1481` 주석의 `.lp-file-item` 언급도 같은 이유로 제거

---

## 확인이 끝나면 지울 것 — 보류 8건

아래가 확인되면 그때 지우면 된다. 되살릴 일이 없다는 게 확인되기 전까지는 남겨 둔다.

- **h_j111** — 근무지정표작성(PC-LPO-0202)에서 `calendar-area` 날짜 표시를 `-date-value`/`-group`
  구조로 갈 건지, 아니면 지금 마크업으로 확정인지
- **jhkim** — 게시판(PM-COM-11xx) 카테고리 칩줄·'내가 쓴 글' 토글을 다시 붙일 건지
- **`.lp-search-box`** — `0c8238a` 가 내 다른 머신 커밋인지. 내 것이면 마크업 이력 0건이라 바로
  삭제 대상이고, 남의 것이면 위와 같이 확인 후
