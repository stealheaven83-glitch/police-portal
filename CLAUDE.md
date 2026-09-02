# 프로젝트 작업 규칙 (지역경찰포털)

새 화면/페이지를 만들 때 이 문서를 먼저 읽는다. 규칙을 벗어나면 화면마다 구현이 갈라지고(코드
일관성이 깨지고), 이미 겪은 버그를 다시 만든다.

## 이 프로젝트의 범위 — **퍼블리싱이 메인**
화면 마크업·스타일·컴포넌트 구성이 우리 일이다. 개발을 아예 안 건드리는 건 아니지만
**실제 기능(API 연동, 유효성 검사, 저장/삭제 처리)은 개발팀이 이어받는다.**

- 데이터는 composable 에 **목업**으로 둔다. 화면이 제대로 보이면 된다.
- **그래도 퍼블 범위인 것** — 잘못되면 화면이 틀리게 보이는 것들:
  LNB 활성 표시(§5), 브레드크럼, 화면ID·라우트(§2·§4), 컴포넌트 선택,
  공통 CSS(§1), 반응형, 접근성(`label for`, `aria-*`).

**어디까지 짜나 — 화면 안에서 끝나는 건 짜고, 밖으로 나가는 건 안 짠다.**

| 짠다 (퍼블) | 안 짠다 (개발팀) |
|---|---|
| 목업 배열 필터링·정렬 | API 호출, 실제 저장/삭제 |
| 팝업 열기/닫기, 탭 전환, 체크박스 선택 | 서버 검증, 권한 처리 |
| `toast`·`dialog` 로 피드백 띄우기(§7) | 로그인 세션, 파일 실제 업로드 |
| 필수값이 비었는지 화면단 체크 | 중복 확인 같은 서버 대조 |

§7 의 `onSave()` 예시는 **"짤 때 이 형태로 짜라"**는 것이지 "반드시 짜라"가 아니다.
Figma 에는 동작이 안 그려져 있다 — 사용자가 따로 지정하지 않은 동작은 핸들러가 비어 있어도
**버그가 아니다.** 억지로 만들지 말고 인계 메모(§11)에 적는다. 반대로 사용자가 "저장 컨펌창"
처럼 지정하면 그건 화면 동작이니 만든다(§7).

## 0. 같이 볼 문서
- `menu-tab-guide.md` — LNB/하단탭/KeepAlive 연동 가이드. 새 화면 만들 때 반드시 같이 본다.
- `screen-id-map.md` — **화면명·Figma 프레임 이름 → 화면ID 대응표(284개). 새 화면은 여기서
  시작한다.** 화면ID가 정해져야 폴더·라우트·`defineOptions` 이름이 정해진다(§2·§4·§5).
  **번호로 유추하면 틀린다** — Figma `06_장비관리`는 `PC-LPO-07xx`다.
  ⚠ 표가 284행이라 **통째로 읽지 말고 `grep -n "무기" screen-id-map.md` 로 찾는다.**
- `component-guide.md` — **케이스별 "이럴 땐 이 컴포넌트" 표.** §1 재사용 원칙의 실행 편이라
  화면에 뭘 붙일지 정할 때마다 본다. Figma instance 이름 → 코드 역인덱스, **공통 CSS 클래스**(§12),
  이름이 비슷한 형제 구분표도 여기 있다.

## 0-1. 시작 절차 — **Figma URL 하나로 시작한다**
사용자가 주는 건 보통 Figma node URL 하나다. 이 순서로 간다.

1. **URL 에서 fileKey·nodeId 를 뽑는다.**
   ```
   https://www.figma.com/design/8mQz91txveSEKO0ky7Ck6V/지역경찰포털-리뉴얼?node-id=10678-68409
                                └──────── fileKey ────────┘          └─ nodeId ─┘
   ```
   node-id 는 **대시 그대로** 도구에 넣으면 된다(대시·콜론 둘 다 받는다).
2. **화면을 눈으로 본다** — `get_screenshot`. §1-1 유형 판정이 이 한 장에서 나온다(§9).
   팝업·탭처럼 숨은 상태는 그 프레임을 따로 찍어야 보인다.
3. **화면ID를 확정한다** — 프레임 이름(`PC_지역경찰_06_장비관리_03_무기` 형식)을
   `screen-id-map.md` 에 grep. **확정 안 되면 멈추고 물어본다(§9).** 여기서 틀리면 폴더·라우트·
   `defineOptions`·CSS 프리픽스가 전부 같이 틀어진다.
   - **`views/{domain}/{화면ID}/` 가 이미 있으면 한 번 알리고 어떻게 할지 물어본다.**
     새로 만들지·기존 것을 고칠지·백업할지는 **사용자가 정한다.** 혼자 판단해서 덮어쓰거나
     지우지 않는다. 알리기만 하고 지시를 기다린다:
     > `src/views/lpo/PC-LPO-0601/` 이 이미 있습니다(라우터에도 등록됨). 어떻게 할까요?
4. **기준 파일을 고른다** — §1-1 표에서 유형 → **그 파일만** 읽는다(`views/` 전체를 뒤지지 않는다).
5. **컴포넌트를 고른다** — `component-guide.md`. 프레임의 `instance` 이름이 답이다(§10 역인덱스).
   `custom/**`·`ui/**` 는 그 자리에서 다시 나열한다 — 기억으로 판단하지 않는다(§1).
6. **만든다** — `views/{domain}/{화면ID}/` 안에서만. 라우트는 그 폴더의 `route.ts` 로(§4).
   **`presets.ts`(LNB)는 안 건드린다(§4).** 화면 전용 CSS 는 `styles.css` 에 화면ID 프리픽스로(§1-2).
7. **Figma 이미지와 나란히 놓고** 빠진 영역이 없나 본다(§9).
8. **인계 메모를 남긴다**(§11) — 특히 **추론한 동작**과 **"LNB 프리셋 미등록"**.

⚠ 만든 화면은 `route.ts` 덕에 **브라우저로 바로 열린다**(§4). 단 **LNB 에는 안 뜬다** — 프리셋은
배치 등록이라, 주소창에 `/views/{domain}/{화면ID}` 를 직접 쳐서 본다.

## 1. 컴포넌트 재사용
- 찾는 순서: `src/components/custom/**` → `src/components/ui/**`. 둘 다 없으면
  **새로 만들기 전에 없다는 걸 눈에 띄게 알린다** — 혼자 판단해 만들지 않는다.
- **3명이 동시 작업이라 컴포넌트/CSS 목록이 세션 사이에도 계속 는다.** 새 화면 시작 시점에
  `custom/**`·`ui/**` 디렉터리를 그 자리에서 다시 나열하고 `police-style.css`도 처음부터 다시
  읽는다. "저번 목록에 없었으니 없다"고 기억으로 판단하지 않는다(그 사이 추가됐을 수 있다).
- 쓰기 전에 실제 props/경로를 다시 확인한다(팀원이 라이브러리를 계속 바꾼다, 기억에 의존 금지).
- **이름 끝에 `2`가 있으면 `2`가 정본이다** — `InputField2`(38개 화면) vs `InputField`(1),
  `GenericDialog2`(19) vs `GenericDialog`(1). 구버전에 deprecated 표시가 없어서 파일만 봐선
  구분되지 않는다. `AlertDialog2`·`ConfirmDialog2`도 마찬가지.
- **뭘 고를지는 `component-guide.md`를 본다.** 디렉터리 나열로는 폴더명만 나와서
  `custom/empty`가 "데이터 없음"인지, `Chip`과 `FilterChip`이 뭐가 다른지 알 수 없다.
  이름이 비슷한 형제(Badge/Tag/Chip/FilterChip, Alert/InfoBox/CriticalAlert 등) 구분 기준도 거기 있다.

### ⚠ 남이 만든 파일과 코드가 겹쳐도 — **합치지 않는다**
위의 '공통에 만들어라'는 **내가 새로 만들 때** 얘기다. **이미 동료 파일에 있는 것과 내 것이
중복되는 상황은 반대다** — 통합하지 말고 중복인 채로 둔다.

- 예: `PM-PUB-0409` 컴포저블의 `regionOptions` 18개 지역 목록이
  `views/pub/composable/drunkCenter.ts` 와 겹쳤다 → **합치지 않고 각자 뒀다.**
- **왜**: 3명이 동시 작업이라 남의 파일을 건드리면 pull 때 충돌이 난다. 중복 제거로 얻는 이득보다
  충돌 해소 비용이 크다.
- 공유 파일(`router/index.ts`, `presets.ts` 등)을 꼭 고쳐야 하면 기존 줄을 **바꾸지 말고
  추가만** 한다 — 이름·순서·구조는 그대로 두고 필요한 속성만 붙인다(§4 는 아예 건드리지 말라고 한다).
- 통합이 정말 필요해 보이면 **실행하지 말고 인계 메모(§11)에 한 줄로 알리기만** 한다.

### 인라인 스타일 금지 — 화면 CSS 는 `styles.css`(§1-2)
컴포넌트가 노출한 CSS 변수(`--flex-col-min-w` 등)를 호출부에서 바꿀 때도 인라인
(`style="--flex-col-min-w:0"`)으로 덮지 않는다. `styles.css`에 변수를 재정의하는 클래스를
만들어 `class`로 입힌다(이름 규칙은 §1-2):
```css
/* styles.css — PC-LPO-0215 블록 */
.pc-lpo-0215-narrow-col { --flex-col-min-w: 0; }
```
```html
<FlexCol class="pc-lpo-0215-narrow-col">
```
이 오버라이드 클래스도 재사용 원칙을 따른다 — 한 화면이면 `styles.css`의 그 화면 블록, 두 화면
이상 반복이면 아래 CSS 우선순위에 맞는 공통 파일로.
(`FlexGrid.module.css` 주석과 `flex-grid.vue`(8곳)는 반대로 인라인 style을
안내/구현 중 — 미수정, 새로 쓸 때 따라 하지 않는다.)

### 화면 템플릿에 테일윈드 유틸(`flex`, `mt-4`, `text-[1.5rem]`) 직접 사용 금지
왜: 디자인이 바뀔 때 클래스 하나만 고치면 전체 반영되게 하려는 것. 흩뿌리면 화면마다 손봐야 한다.
- 한 화면 전용이면 `styles.css`에 이름 있는 클래스로(§1-2), 반복이면 아래 CSS 우선순위를 따른다.
- **적용 범위는 화면(페이지 `.vue`/그 화면 컴포저블)뿐.** `src/components/**` 재사용 컴포넌트가
  내부에서 테일윈드 쓰는 건 무관(고칠 곳이 한 파일이라 흩어질 문제가 없다, 예: `layoutHeader.vue`
  의 `defaultClass`/`titleClass`).
- 예외: 기존 컴포넌트(`Button`, `InputField2` 등)에 `class` prop으로 여백/폭만 미세조정.
- **테일윈드 문자열을 화면/컴포저블 JS 변수·computed에 담아 `:class`로 바인딩하는 것도 위반**
  (예: `const cardClass='flex items-center gap-2 p-4 rounded'`). `styles.css`에 진짜 CSS
  클래스로 뽑는다(§1-2).
- 기존 화면(2201/2204/2401 등)은 이 규칙 이전 것이라 테일윈드가 남아있다 — 새 화면부터 적용,
  기존은 차차 정리.

### CSS는 "최대한 공통을 활용한다" — 이 말은 두 가지다
**① 공통에 있으면 그걸 쓴다. ② 없으면 화면 전용으로 만들지 말고 공통에 새로 만든다.**
②를 빠뜨리는 실수가 잦다 — "공통에 없네" 하고 화면 전용으로 만들어 버리면, 다음 화면이
같은 걸 또 만들고 결국 화면마다 값이 갈라진다. **없으면 공통에 추가하는 것이 기본값이다.**

**① 있는지 찾는 순서:**
1. **디자인 토큰** — `public/portal/asset/css/common/police-style.css`(전역 로드됨, 페이지에서
   import 안 함). 색·모서리는 hex 하드코딩 말고 `var(--Text-body_1)`처럼 토큰을 쓴다.
2. **공통 유틸/레이아웃 클래스** — 같은 파일에 `.search-area` `.list-actions` `.btn-wrap` 같은
   것들이 있다. 같은 역할의 클래스를 새로 만들기 전에 먼저 뒤진다.
3. **컴포넌트 레벨 공통 CSS** — 라벨-값 표는
   `src/components/custom/info-table/InfoTable.module.css`, 그리드는
   `src/assets/css/tabulator-theme.css`(그리드에 전역 적용됨, 다시 스타일링 불필요).

**② 없을 때 어디에 만드나:**
- **색·크기·모서리 값** → `police-style.css`에 **토큰(`--Xxx`)으로 추가.** 화면 CSS에
  hex를 박지 않는다.
- **역할이 있는 레이아웃·유틸 클래스**(버튼줄, 검색영역, 정렬 등) → `police-style.css`에
  **공통 클래스로 추가.** 이름은 기존 것들과 같은 결로(`.btn-wrap`, `.list-actions` 참고).
- **특정 컴포넌트에 딸린 스타일** → 그 컴포넌트 폴더의 `*.module.css`.
- **그 화면에서만 쓰는 스타일** → `public/portal/asset/css/common/styles.css`(아래 §1-2).
  화면 폴더에 `style/*.module.css` 를 **새로 만들지 않는다.**
- 공통에 추가했으면 **`component-guide.md` §12 표에 한 줄 추가**한다(그래야 다음 사람이 찾는다).

**⚠ 화면 분할·패널은 화면 CSS 로 직접 만들지 않는다.** `display:grid` 로 2분할을 짜거나
`.panel { border; border-radius; background }` 같은 걸 화면 CSS 에 만들고 있으면 잘못 가고 있는
것이다. 이미 공통 컴포넌트가 있다:
- 2분할·3분할 → `custom/content-layout/layoutSplit.vue` (11개 화면 사용, 드래그 리사이즈 포함)
- 분할 안의 패널(제목+내용) → `custom/content-layout/layoutPanel.vue`
실제로 같은 "2분할 목록+상세" 화면인데 한쪽은 `LayoutSplit`, 다른 쪽은 `styles.columns` +
`styles.panel` 로 갈린 적이 있다. 화면 구조를 CSS 로 짜기 전에 `component-guide.md` §1 을 본다.

**토큰명·유틸 클래스 전체 목록은 `component-guide.md` §12에 표로 있다** — ①을 확인할 때
`police-style.css`(1500줄)를 직접 뒤지지 말고 그 표를 먼저 본다.
(`krds.min.css`는 파일만 있고 로드 안 됨 — 참고 대상 아님.)

## 1-1. 새 화면 기준 파일 — "제일 비슷한 거 찾기"를 매번 새로 하지 않는다
매번 새로 판단하면 같은 유형도 화면마다 다른 베이스로 갈라진다(20개+ 화면이 갈라진 원인). 유형별
기준 파일을 고정한다. **표에 없는 이유로 다른 화면을 "더 비슷하다"며 베이스로 삼지 않는다.**

| 화면 유형 | 기준 파일 | 비고 |
|---|---|---|
| **단순 그리드 목록 + 검색** | **`PC-LPO-0215`** | **제일 흔한 유형. 아래 "그대로 따라할 것" 참고** |
| 체크박스 그리드 인라인편집 CRUD(선택삭제/추가/저장) | `PC-COM-2401` | §6-1 `cellType` 예시 겸함 |
| 2분할 목록+상세(체크박스 그리드 + 관련 그리드 + 팝업 2개) | `PC-COM-2204` | provide/inject 패턴A, `LayoutPanel` |
| 3분할(트리 + 목록그리드 + 목록그리드) | `PC-COM-2201` | `LayoutPanel` 3-pane |
| 탭 + 다중 팝업이 컴포넌트 하나를 공유(패턴A + `useAutoTrigger`) | `PC-LPO-0701` | `screenGroup` 라우팅 필요, §3 패턴A 원조 |
| 2분할 목록+상세, 단일선택 + 팝업 히스토리 | `PM-PUB-0103` | `row.getData()` 방어적 언랩 예시 |
| 2분할 목록+상세 **폼**(단일선택 그리드 + `InfoTable` 폼 + 아래 관련 그리드) | `PC-LPO-0801` | 조건부 활성/디세이블이 많은 폼. 패턴A, `LayoutPanel` |
| 목록/상세/등록이 별개 라우트(패턴B 싱글턴) | `PC-PUB-0301`(목록) + `PC-PUB-0302`/`0303`(상세/등록) | 도메인 싱글턴 스토어 공유 |

**절차**: ① 이미지로 유형 확인 → ② 해당하면 그 기준 파일만 읽고 그대로 참고(`views/` 전체를 다시
안 뒤짐) → ③ 어느 유형과도 애매하게 걸치면 혼자 고르지 말고 사용자에게 확인 → ④ 표에 없는 새
유형이면 화면 완성 후 이 표에 새 줄로 등록(다른 세션도 같은 파일을 가리키게).

**⚠ "2분할 목록+상세"는 표에 세 줄이라 어느 걸 고를지 헷갈린다.** 세부가 달라도 **골격은 셋 다
같다** — 먼저 이것부터 확정하고 세부만 해당 줄에서 가져온다:
```html
<LayoutSplit :count="2" :widths="[…]">
  <template #layout-1> <LayoutPanel title="목록"> … </LayoutPanel> </template>
  <template #layout-2> <LayoutPanel title="상세"> … </LayoutPanel> </template>
</LayoutSplit>
```
- 상세가 **폼**(라벨-값 입력)이면 → `PC-LPO-0801`
- 상세가 **그리드**이고 체크박스 다중선택·팝업이 있으면 → `PC-COM-2204`
- 상세가 **단일선택 + 팝업 히스토리**면 → `PM-PUB-0103`

어느 줄이든 **분할을 `display:grid` 로 직접 짜지 않는다**(§1). 실제로 같은 2분할 화면인데
한쪽은 `LayoutSplit`, 다른 쪽은 `styles.columns` 로 갈린 적이 있다.

### 기준 파일에서 "그대로 따라할 것" — `PC-LPO-0215` 기준
구조를 눈으로 훑고 비슷하게 쓰는 게 아니라, 아래 항목은 **형태까지 그대로** 가져온다.

1. **파일 구성** — `PC-XXX-NNNN.vue` + `composable/PC-XXX-NNNN.ts` + `route.ts`(§4). `style/` 폴더는
   **만들지 않는다**(0215가 그렇다 — 공통 클래스로 해결). 화면 전용 CSS 가 필요하면 `styles.css`(§1-2).
2. **템플릿 순서** — `PageHeader`(#left `PageTitle` / #right `Breadcrumb`) → `SearchWrapper`
   (#department / #form / #btns) → `.list-actions` → `TabulatorGrid`. 사이에 의미 없는 `<div>`를
   끼우지 않는다.
3. **LNB** — 프리셋을 인라인 전개(§5). 문자열 키는 프리셋 기본값이 그 화면과 정확히 일치할 때만.
4. **브레드크럼** — 실제 라우트가 있는 항목에만 `path`를 준다. 없는 경로를 넣으면 죽은 링크가 된다.
5. **`defineOptions` + `useBottomTabSetup`** — 이름이 정확히 일치해야 KeepAlive가 걸린다(§5).
6. **CSS** — 레이아웃은 공통 클래스(`.search-area` `.group-gap2` `.list-actions` `.dept-name`).
   테일윈드는 컴포넌트 `class` prop 으로 폭/여백 미세조정만(`inputClass="w-40"` 등, §1의 예외).
7. **그리드** — `ref="gridRef"` + `class="flex-1"` + `height="100%"` + `min-height`.
   페이지네이션이 필요하면 `show-pagination` + `:items-per-page`(그리드 화면 30개 중 21개가 쓴다).
8. **검색 옵션** — `export const xxxOptions` 로 composable 에 두고 화면에서 import.
   sentinel 은 `''` 가 아니라 `'all'`(§8).

### 기준 파일의 신뢰도
2026-08-31~09-01 에 정비했다 — `PC-LPO-0215`(LNB 추가, 죽은 브레드크럼 링크 제거, 불필요한
래퍼 제거, 페이지네이션 예시 추가), `PC-LPO-0801`(테일윈드 7줄 → 0). 같은 기간에 LNB 활성
표시 오류를 16개 화면에서, 죽은 브레드크럼 링크를 11개 화면 19곳에서 일괄 수정했다. **그래도 기준 파일이 완전무결하다고 가정하지 않는다** — 복사하기 전에 위 8개 항목을
그 파일에서 실제로 확인하고, 어긋난 게 보이면 사용자에게 알린다. 기준 파일이 바뀌면 이 표도 갱신.

## 1-2. 화면 전용 CSS — `styles.css` 한 파일에 모은다
그 화면에서만 쓰는 스타일은 **`public/portal/asset/css/common/styles.css` 한 파일**에 모은다.
화면 폴더에 `style/*.module.css` 를 새로 만들지 않는다. 흩어져 있으면 "이거 저 화면에도 있네"를
영영 못 보고, 승격(아래) 대상을 찾을 수가 없다.

**로드**: `police-entry.css` 가 **`layer()` 없이** import 한다 → 전역 로드된다.
화면에서 import 하지 않는다(`public/` 이라 Vite CSS 파이프라인 밖이라 import 자체가 안 된다).

**우선순위: 공통보다 이게 이긴다.** 레이어 없는 CSS 는 `@layer` 안의 모든 것을 이기므로,
`styles.css` 는 `police-style.css`(layer police)·shadcn(components)·테일윈드(utilities)를
**항상 덮는다.** 화면에서 공통을 덮어쓸 때 `!important` 를 쓸 필요가 없다.

**클래스명은 화면ID 프리픽스로 유니크하게.** 전역이라 이름이 겹치면 남의 화면이 깨진다.
형식은 `.{화면ID 소문자}-{역할}`:
```css
.pc-lpo-0215-wrapper     { … }
.pc-lpo-0215-narrow-col  { --flex-col-min-w: 0; }
```
- 역할부는 kebab-case. `.wrapper` `.narrowCol` 처럼 **프리픽스 없는 이름은 금지.**
- 그 화면 전용 팝업·컴포넌트(`components/` 밑)도 **부모 화면ID 프리픽스**를 쓴다.
- 화면군(한 컴포넌트가 여러 화면ID, §3 패턴A)은 **대표 화면ID 하나로** 통일
  (예: 0701~0714 → `.pc-lpo-0701-*`).

**파일은 화면ID 오름차순 블록으로 나눈다.** 3명이 한 파일을 건드리기 때문이다:
```css
/* ── PC-LPO-0215 사고자/자원근무자 현황 ─────────────────────────── */
.pc-lpo-0215-wrapper { … }

/* ── PC-LPO-0801 인사관리 ───────────────────────────────── */
```
- **자기 블록만 만진다.** 남의 블록은 읽기만 한다(§1 "합치지 않는다"와 같은 이유).
- 새 블록은 정렬 위치에 끼워 넣는다 — 그래야 다른 화면 작업과 diff 가 안 겹친다.

**여기에 뭘 넣나** — §1 의 "공통 우선"은 그대로다. `styles.css` 는 **공통에 둘 수 없는 것만**
받는다: 그 화면 고유의 배치, 특정 컬럼 폭, 컴포넌트 CSS 변수 오버라이드 등. 여기서도 색·모서리는
hex 를 박지 말고 `var(--Text-body_1)` 토큰을 쓴다. 화면 분할은 `LayoutSplit` 을 쓴다(§1).

**공통 승격은 배치로.** 여러 화면 블록에 똑같은 스타일이 쌓이면 `police-style.css` 공통
클래스로 올린다. 다만 **작업하다 각자 하지 않는다** — 공유 파일과 여러 화면 블록을 동시에
건드려서 충돌이 확정이다(§4 라우터 등록과 같은 이유). 사용자가 명시 요청할 때 한 사람이
몰아서 한다:
> "styles.css 중복된 거 공통으로 승격해줘"

승격한 클래스는 `component-guide.md` §12 표에 등재한다(§1).

**기존 `style/*.module.css`(19개)는 그대로 둔다.** 새 화면부터 적용한다 — 일괄 이관하면 위
우선순위 차이 때문에 19개 화면을 전부 눈으로 재확인해야 한다. 기존 화면은 차차 정리.

## 2. 화면 폴더 구조
화면ID(`PC-XXX-NNNN`)는 **`screen-id-map.md`에서 찾는다 — 직접 정하지 않는다.**
```
views/{domain}/PC-XXX-NNNN/
  PC-XXX-NNNN.vue
  route.ts                       (이 화면의 라우트. 자동 수집된다 — §4)
  composable/PC-XXX-NNNN.ts   (또는 composable/ 폴더로 분할)
  components/                    (그 화면 전용 팝업 등)
```
⚠ 화면 폴더에 `style/` 은 **만들지 않는다.** 그 화면 전용 CSS 는 공용 `styles.css` 한 파일에
화면ID 프리픽스 클래스로 모은다(§1-2). 기존 화면에 남아 있는 `style/*.module.css` 는 그대로 둔다.
- 여러 화면ID가 한 페이지를 공유(예: PC-LPO-0701 — 탭/팝업이 실은 컴포넌트 하나)하면
  composable/components를 그 페이지 폴더 밑에 → §3 **패턴A**(provide/inject).
- 진짜 별개 페이지들이 도메인만 공유하면 도메인 레벨 `views/{domain}/composable/`·`components/`
  (예: `views/pub/composable/publicSafety.ts`) → §3 **패턴B**(싱글턴).
폴더 위치를 정하는 순간 상태공유 방식도 같이 정해진다.

## 3. 상태 공유 — 두 패턴, 헷갈리면 안 됨

### 패턴 A: 한 페이지가 여러 화면ID(탭/팝업)를 가짐 (예: PC-LPO-0701)
- `useXxxList()`를 페이지에서 **한 번만** 호출하고 `provide()`. 하위 팝업은 `inject()`로 공유
  (각자 다시 호출하면 상태가 갈라짐).
- 화면ID별 URL 동기화가 필요하면 `src/composables/useAutoTrigger.ts`: `{ '화면ID': [[ref,값],...] }`
  로 "이 화면ID면 이 ref들이 이 값" 선언(탭/팝업 구분 없이 같은 문법). 설계 이유는 파일 상단 주석.
  - **비대칭(순방향≠역방향)이 필요한 화면은 이 맵에 넣지 않는다**(예: 특정 행을 선택해야만 여는
    팝업은 URL만으로 못 연다).

### 패턴 B: 별개 라우트들이 같은 도메인 데이터 공유 (예: 방범협력단체 목록/상세/등록)
도메인 상태를 **모듈 스코프 싱글턴**으로:
```ts
function createXxxStore() { /* ref, computed, 저장/삭제 함수 ... */ }
let singleton: ReturnType<typeof createXxxStore> | null = null
export function useXxxStore() {
  if (!singleton) singleton = createXxxStore()
  return singleton
}
```
왜: `Layout.vue`가 `<component :key="route.meta.screenGroup ?? route.fullPath">`로 렌더링해
라우트가 바뀔 때마다 컴포넌트가 통째로 리마운트된다(하단 멀티탭 UX용 의도된 설계). setup()에서
상태를 만들면 페이지 이동마다 리셋된다 — 싱글턴으로 막는다.
- 한 컴포넌트가 여러 화면ID 라우트를 갖고 그 사이 리마운트를 원치 않으면 라우트 meta에 공통
  `screenGroup: 'PC-XXX-0701'`을 준다(key가 그걸 우선 사용, 이미 적용됨).

### 배열 상태는 항상 재할당, `splice` 제자리 수정 금지
```ts
// ❌ TabulatorGrid의 :data watch(얕은 비교)가 변경을 못 감지
rows.value.splice(idx, 1, updated)
// ✅
rows.value = rows.value.map((r, i) => (i === idx ? updated : r))
```

## 4. 라우터 등록 — **화면 폴더 안의 `route.ts` 로 한다**
- 화면ID는 `screen-id-map.md` 기준(IA 284개 전수). Figma 메뉴 번호로 유추하면 어긋난다.
- **`src/router/index.ts` 는 건드리지 않는다.** 화면 폴더에 `route.ts` 를 만들면 끝이다 —
  `router/index.ts` 가 `import.meta.glob('../views/**/route.ts', { eager: true })` 로 자동 수집한다.

```ts
// views/lpo/PC-LPO-0601/route.ts
import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw = {
  path: '/views/lpo/PC-LPO-0601',
  name: 'PC-LPO-0601',
  component: () => import('./PC-LPO-0601.vue'),   // ← 옆 파일이라 상대경로
  meta: { layout: 'WorkLayout', title: '관내현황' },
}

export default route
```

- **화면군**(한 컴포넌트가 여러 화면ID, §3 패턴A)은 **배열을 default export** 한다 —
  수집부가 `flatMap` 이라 그대로 펼쳐진다. 지금 `index.ts` 의 `.map()` 형태를 그대로 옮기면 된다.
  `screenGroup` meta 도 여기서 준다(§3).
- `eager: true` 지만 `component` 는 `() => import()` 라 **.vue 는 계속 lazy** 다(코드 스플리팅 유지).

### 왜 이렇게 바뀌었나
882줄짜리 `router/index.ts` 는 **화면을 추가할 때마다 셋이 동시에 손대서 git 충돌이 상시로 났다**
(최근 12커밋이 전부 이 파일을 건드렸다). 그렇다고 "등록은 배치로" 로 미뤘더니 이번엔 만든 화면을
**브라우저로 못 봐서** 나중에 등록을 또 해야 했다 — 일을 두 번 했다.

`route.ts` 자동 수집이 둘 다 없앤다. 각자 자기 폴더만 건드리니 충돌이 없고, 만들자마자 열린다.

⚠ **미리 등록해두는 사고가 원리적으로 안 생긴다.** 예전에 `index.ts` 에 라우트를 미리 채워두면,
`component: () => import('...')` 경로가 문자열 리터럴이라 Rollup 이 빌드 시점에 정적 분석해서
파일이 없으면 `Could not resolve ...` 로 **빌드 전체가 실패했다**(실측 확인. `vue-tsc` 는 통과해서
넣은 사람은 모르고 배포하려는 사람이 막힌다). glob 은 **실재하는 파일만** 잡고, `route.ts` 가
있으면 그 옆의 `.vue` 도 반드시 있으므로 이 함정이 사라진다.

### 그래도 손대지 않는 것 / 손대야 하는 것

| 화면을 | `route.ts` | `presets.ts`(LNB) | `router/index.ts` |
|---|---|---|---|
| **추가** | ✅ 만든다 | ⛔ 안 건드린다 | ⛔ 안 건드린다 |
| **수정** | ✅ 필요하면 고친다 | ⛔ 안 건드린다 | ⛔ 안 건드린다 |
| **삭제** | 폴더째 지우면 같이 사라짐 | ✅ 해당 `path` 지운다 | 아래 ⚠ 참고 |

- **`presets.ts`(LNB)는 여전히 배치 등록이다.** 화면 폴더는 자기가 메뉴 트리 어디에 붙는지 알 수
  없어서 자동화가 안 된다(아래 ⚠). 인계 메모(§11)에 **"LNB 프리셋 미등록"** 이라고 적는다.
  등록은 사용자가 명시적으로 요청할 때 한 사람이 몰아서 한다:
  > "프리셋에 없는 페이지들 LNB 등록해줘"

⚠ **삭제 시 주의.** `route.ts` 는 폴더 안에 있으니 폴더를 지우면 같이 사라져 빌드가 안 깨진다.
다만 **`index.ts` 에 남아 있는 구식 등록**(아래 참고)이면 그 항목을 **같은 커밋에서 함께** 지워야
한다 — 안 지우면 `Could not resolve ...` 로 빌드 전체가 실패한다. 그 화면이 화면군의 일부였다면
나머지 화면ID 들이 같은 컴포넌트를 가리키고 있는지 먼저 확인한다(§3 패턴A).

### 기존 등록분은 그대로 둔다 — 두 방식은 공존한다
`router/index.ts` 배열에 직접 적힌 기존 라우트 95개는 **손대지 않는다.** 새 화면부터 `route.ts` 를
쓰고, 기존은 차차 이관한다(`styles.css` 와 같은 전략, §1-2).

**"라우터 걷어와" — 배치 이관**은 사용자가 요청할 때만 한다. `route.ts` 들을 `index.ts` 배열로
옮기고 `route.ts` 를 지우는 작업인데, 이때 **`component` 경로를 다시 쓴다**:
`import('./PC-LPO-0601.vue')` → `import('../views/lpo/PC-LPO-0601/PC-LPO-0601.vue')`.
걷어온 뒤에도 **수집 코드(`collectedRoutes`)는 그대로 둔다** — 파일이 없으면 빈 배열이라
아무 일도 안 하고, 다음 화면 작업에 또 필요하다.

**미등록 화면 찾는 법** — 폴더는 있는데 `route.ts` 도 없고 `index.ts` 에도 `name` 이 없는 것:
```bash
comm -23 \
  <(find src/views -maxdepth 2 -type d \( -name 'P[CM]-*' -o -name 'MO-*' \) | sed 's|.*/||' | sort -u) \
  <(cat \
      <(grep -oE "name: '(PC|PM|MO)-[A-Z]{3}-[0-9]{4}'" src/router/index.ts | sed "s/name: '//;s/'//") \
      <(find src/views -name route.ts | grep -oE '(PC|PM|MO)-[A-Z]{3}-[0-9]{4}') \
    | sort -u)
```
반대로 라우터에만 있고 폴더가 없는 것은 **화면군**(한 컴포넌트가 여러 화면ID를 갖는 경우,
§3 패턴A)이라 정상이다 — 지우지 않는다.

⚠ **LNB 프리셋도 IA 로 미리 다 채울 수 없다.** IA 의 depth 는 "화면 계층"이고 LNB 는
"메뉴 구조"라 서로 다르다. IA 로 자동 생성하면 이렇게 틀린다:
```
IA:  장비관리 > 기동장비 탭 / 통신장비 탭 / 무기 탭 …
LNB: 개인장비                       ← 탭은 화면 안에 있지 메뉴 항목이 아니다
IA:  관내현황 > 상세내역
LNB: 관내현황                       ← '상세내역'은 메뉴가 아니다
```
**LNB 구조는 Figma 를 봐야 아는 디자인 결정**이지 IA 에서 유도되지 않는다.
라우터와 달리 프리셋을 자동 수집할 수 없는 이유가 이것이다 — 화면 폴더는 자기가 메뉴 트리의
어느 자리에 붙는지 모른다. 그래서 프리셋만은 **배치 때 사람이 판단해서** 넣는다.

### 브레드크럼 `path` — 라우터에 실재하는 것만 준다 (화면 유형 무관, 전부 해당)
`Breadcrumb`의 `navItems`에서 **`path`는 실제 라우트가 있을 때만** 쓴다. 없으면 라벨만 둔다.
```ts
const navItems = [
  { label: '홈', path: '/' },   // 라우터에 있음 → path OK
  { label: '지역경찰' },         // '/lpo' 같은 도메인 경로는 라우트가 아니다 → 라벨만
  { label: '인사관리' },
]
```
`/lpo` `/pub` `/com` `/stt` `/flp` 는 **전부 라우터에 없다.** 도메인은 URL 구획일 뿐 랜딩 화면이
아니다. 넣으면 클릭해도 아무 데도 안 가는 죽은 링크가 된다. 기존 화면 11곳에 이 패턴이 남아
있으니 **이웃 화면을 복사할 때 같이 딸려오지 않게 확인한다.**

## 5. LNB/하단탭 — `menu-tab-guide.md` 같이 볼 것
- `defineOptions({ name:'XxxYyy' })` 필수 — `useBottomTabSetup`의 `componentName`과 정확히 일치해야
  KeepAlive가 걸린다.
- **`useSideMenuSetup(presetKey)`은 비동기다.** 같은 tick에 이어서 `sideMenuStore.setActiveChild(...)`
  를 부르면, 늦게 끝난 프리셋 로딩이 방금 값을 덮는 경합이 난다(방범협력단체에서 겪음 — LNB
  하위메뉴가 안 펼쳐지고 활성표시가 엉킴). 화면마다 다른 activeChild/openIndex가 필요하면
  **프리셋을 인라인으로 펼쳐** 동기 경로로:
  ```ts
  import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
  useSideMenuSetup({ ...publicSafetyMenu, activeChild:'단체정보리스트', openIndex:2 })
  ```
  (프리셋 문자열 키는 기본 activeChild와 화면이 정확히 일치할 때만 그대로 쓴다.)
- **`openIndex`·`activeChild` 값은 `presets.ts`를 열어 대조한다 — 추측하지 않는다.**
  - `openIndex` = 그 화면이 속한 **최상위 `items` 배열의 0-based 인덱스**. 세어서 구한다.
  - `activeChild` = 그 그룹 `children` 중 해당 항목의 `name`과 **정확히 같은 문자열**.
  - **① `path` 로 찾는다.** 메뉴 항목에 `path: '/views/lpo/PC-LPO-0801'`처럼 화면 경로가 적혀
    있으면 그게 정답이다. `grep -n "PC-LPO-0801" presets.ts`.
  - **② path 가 없으면 메뉴 라벨(`name`)로 찾는다 — 신규 화면은 이쪽이 정상이다.**
    `presets.ts` 에 path 가 박힌 화면은 21개뿐인데 화면 폴더는 36개다. 나머지 메뉴 항목은
    `{ name: '근무일지(甲)' }` 처럼 **이름만** 있다. Figma LNB 에 보이는 라벨을 그대로 grep 한다:
    `grep -n "근무일지(甲)" presets.ts` → 그 항목이 속한 최상위 `items` 인덱스가 `openIndex`,
    라벨이 `activeChild`. (`PC-LPO-0215` 가 이 경우다 — `openIndex:1, activeChild:'근무일지(甲)'`)
  - **③ 라벨조차 없으면** 프리셋에 그 메뉴가 아직 없는 것이다. **지어내지 말고** Figma LNB 라벨을
    `activeChild` 에 그대로 넣은 뒤, 인계 메모에 **"프리셋 미등록 — 배치 등록 시 확인 필요"** 라고
    적는다(§4·§11). 배치 등록 전까지 LNB 활성표시가 안 뜨는 건 정상이다.
  - **`children` 이 없는 최상위 항목**(`관내현황`·`개인장비`·`인사관리`)은 **그 항목 자신의
    인덱스**를 `openIndex`, **자기 이름**을 `activeChild` 로 준다. 실측값:
    `PC-LPO-0601`→`openIndex:4, '관내현황'` / `PC-LPO-0701`→`5, '개인장비'` /
    `PC-LPO-0801`→`6, '인사관리'`. `openIndex:-1` 로 두면 닫힌 채 렌더된다 — 실제로 겪은 오류다.

## 6. TabulatorGrid 주의
- 체크박스 다중선택+추가/선택삭제(`select-mode="checkbox"` + `ref.addRow(data,top)` /
  `ref.deleteSelected()`)는 이미 있다(`PC-COM-2301.vue`) — 직접 구현하지 않는다.
- `@row-selection-changed`는 **데이터가 아니라 Tabulator RowComponent 배열**을 넘긴다. 필드가
  필요하면 `row.getData()`로 꺼낸다(이미 데이터인 경우까지 방어적으로).
- `layout="fitColumns"`(기본)는 폭을 컨테이너에 맞춰 나눈다. 컬럼이 많아 가로 스크롤이 필요하면
  (예: 12개 장비 컬럼) `layout="fitDataFill"` + 각 컬럼에 고정 `width`.
- KeepAlive 재활성화 시 그리드가 안 그려지던 버그는 컴포넌트에서 `onActivated`→`redraw(true)`로
  수정됨(새로 신경 쓸 필요 없음).

### 6-1. 셀 인라인 편집 — `cellType` 이미 다 있다
그리드 셀에서 바로 값 고치는 화면(PC-COM-2301/2401/2204, PM-COM-0101 등)은 컬럼 정의에
`cellType`만 지정. 셀마다 커스텀 input/select를 직접 마운트하지 않는다:
- `cellType:'input'` — 텍스트 인라인 편집
- `cellType:'checkbox'` — 체크박스 셀(전체/읽기/편집 같은 권한 매트릭스에 흔함)
- `cellType:'select'` — `selectOptions` 배열과 함께 쓰는 드롭다운(PC-COM-2401 목록수/페이지수)
- `cellType:'button'` — `buttonLabel`/`buttonVariant`/`buttonVisible`/`onButtonClick`으로 행마다
  다른 라벨·표시여부의 버튼(PC-COM-2204 "부서 조회")

### 6-2. 페이지네이션 그리드에 행 추가(`addRow`)
`show-pagination` 그리드에서 맨 아래 추가(`addRow(data,false)`)는 보고 있는 페이지에 안 나타난다 —
추가 후 `gridRef.value?.setPage('last')`로 마지막 페이지까지 따라간다(PC-COM-2401). 맨 위 추가
(`addRow(data,true)`, PC-COM-2301)는 항상 1페이지라 불필요.

## 7. 저장/삭제 피드백 — toast가 기본, dialog는 예외
15개+ 화면(PC-COM-2301/2401, PM-COM-1001, PC-LPO-0501/0801, PC-PUB-0302/0303 등)이 쓰는 사실상
표준:
```ts
function onDeleteSelected() {
  if (!selectedCount.value) {
    toast.warning('삭제할 OO을 선택해 주세요.')  // select-mode="checkbox" + @row-selection-changed로 selectedCount 갱신
    return
  }
  gridRef.value?.deleteSelected()
  toast.success('삭제되었습니다.')
}
function onSave() {
  if (!form.groupName.trim() || !form.groupType) {
    toast.warning('필수 항목을 입력해 주세요.')  // 필수값 누락도 toast로 막고 return, alert 아님
    return
  }
  // 저장 로직
  toast.success('저장되었습니다.')
}
```
- **기본은 위 패턴.** "저장하시겠습니까?" 같은 `dialog.confirm()`을 습관적으로 앞에 붙이지 않는다
  (클릭 한 번 더 강제하는 마찰, 이 저장소 대부분이 안 붙인다).
- **`dialog.confirm()`은 되돌릴 수 없거나 연쇄로 다른 데이터까지 지울 때만**(PC-COM-2201 부서삭제
  "하위 부서도 함께 삭제", PC-COM-2402 팝업공지 "되돌릴 수 없음"). 일반 선택행 삭제/저장은 해당
  없음. **"권한/관리자 설정처럼 민감해서"는 예외 사유 아님**(PC-COM-2201 권한저장 `onSave`가 지금
  confirm 쓰는데 이것도 규칙상 위반, 미수정).
- **`dialog.alert()`**는 그냥 지나치면 안 되는 버튼 하나짜리 강제 확인(예: 필수입력 누락을 모달로
  막는 PC-COM-2402 `PopupNoticeDialog`). 단순 성공/경고엔 과함 — toast를 쓴다.

### ⚠ 사용자가 이 규칙과 다르게 지정하면 — **지정을 따르되 반드시 표시한다**
사용자가 "저장할 때 컨펌창", "확인 알림창" 처럼 **명시적으로 요구하면 그대로 만든다.**
위 규칙은 "지정이 없을 때의 기본값"이다.

다만 **코드에 근거를 남기고 결과 보고에도 명시한다:**
```ts
// 사용자 지정: 저장 컨펌창 — §7 기본(toast)과 다르지만 요청대로 따름
const ok = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
```
표시가 없으면 다음 사람이 **규칙 위반으로 오해해 되돌린다**(실제로 그럴 뻔했다).
반대로 아무 언급이 없으면 위 기본값(toast)을 쓴다 — 임의로 컨펌창을 붙이지 않는다.

## 8. 자주 겪는 함정
- **Select/SelectItem의 value에 빈 문자열(`''`) 못 씀.** "전체" 같은 sentinel은 `'all'`처럼 실제
  문자열로.
- **`<script setup>`은 런타임 값 export 불가**(타입만 가능). 상수를 내보내려면 별도 `<script>`
  블록이나 별도 `.ts`로 뺀다 — 무리하면 그 컴포넌트 쓰는 모든 화면이 컴파일 에러로 깨진다.
- **id/for·v-model 중복**: 필드 복붙 시 id/v-model을 안 바꿔 서로 다른 라벨 둘이 같은 데이터를
  공유하는 실수가 반복 — 복붙하면 id/v-model을 반드시 다시 확인.
- **id만으로 행 찾기/삭제**: 여러 카테고리가 같은 id 범위(1,2,3...)를 쓰면
  `allRows.find(r => r.id === form.id)`가 엉뚱한 카테고리 행을 건드린다.
  `r.id === form.id && r.category === 'xxx'`처럼 스코프를 항상 같이 확인.

## 9. 디자인 확인 — **Figma 가 유일한 기준**
화면의 근거는 Figma 하나다. PPT 기획서·스크린샷을 Figma 와 나란히 놓으면 어느 쪽이 최신인지
판단이 갈려서 오히려 혼동을 준다. **사용자가 주는 Figma node URL 로 작업한다.**

### 화면ID가 특정되지 않으면 **반드시 물어본다**
사용자가 화면ID를 직접 주면 그게 정답이다. Figma node URL만 받았으면 프레임 이름
(`PC_지역경찰_06_장비관리_03_무기` 형식)으로 `screen-id-map.md`에서 화면ID를 찾는다(`grep`).
다음 중 하나라도 해당하면 **추측해서 만들지 말고 멈추고 사용자에게 되묻는다:**
- 프레임 이름에 대응하는 화면명이 `screen-id-map.md`에 **없다**
- 비슷한 이름이 **여러 개** 걸려서 어느 것인지 확정되지 않는다
  (예: "인사관리"는 `PC-LPO-0801`과 `PC-STT-0103` 둘 다 있다)
- 한 node 아래 화면이 여러 개인데 **어느 것을 만들지 지시가 없다**

되물을 때는 이렇게 한다 — 찾은 후보를 같이 보여주고 **화면ID**를 달라고 한다:
> 주신 프레임이 "무기 목록"인데 `screen-id-map.md`에서 확정이 안 됩니다.
> 후보: `PC-LPO-0706`(무기 탭 › 목록) / `PC-LPO-0707`(무기 탭 › 등록/상세/수정)
> 어느 화면ID로 만들까요?

**왜 멈춰야 하나:** 화면ID가 틀리면 폴더명·라우트 path/name·`screenGroup`·`defineOptions`·
`styles.css` 클래스 프리픽스가 **전부 같이 틀어진다**(§2·§4·§5). 나중에 여섯 군데를 고쳐야 하고,
`defineOptions`가 어긋나면 KeepAlive가 조용히 깨져서 발견도 늦다. 만들기 전에 묻는 게 훨씬 싸다.
화면ID 체계는 IA 소관이라 **새 ID를 임의로 만들어내면 안 된다**(`screen-id-map.md` 가 정본).

### 생김새는 **Figma**, 동작은 **사용자 지정 아니면 추론**

| | 어디서 오나 |
|---|---|
| **화면이 어떻게 생겼는지** — 레이아웃, 간격, 색, 폰트, 아이콘, 상태별 모양 | **Figma (유일한 기준)** |
| **어떻게 동작하는지** — 조회 버튼, 팝업 호출, 필수항목, 컨펌창, 유효성 | 사용자가 지정하면 그대로. 없으면 **추론 + 인계 메모에 명시** |

**스타일은 눈대중으로 그리지 않는다** — Figma 값을 그대로 가져온다.

동작을 추론할 때는 이 프로젝트 기본값을 따른다: 피드백은 toast(§7), 팝업은 `GenericDialog2`,
탭은 화면 안에서 전환. **추론한 것은 반드시 인계 메모(§11 3·5번)에 목록으로 적는다** —
사용자가 그걸 보고 바로잡는 구조다. 조용히 넘어가면 틀린 채로 굳는다.

### 데이터만 보지 말고 **화면을 눈으로 봐라**
Figma MCP 는 구조·값만 주는 게 아니라 **렌더된 이미지**를 준다. 사용자가 스크린샷을 붙여줄 때와
똑같이 볼 수 있으니, 화면을 만들거나 고칠 때 **반드시 이미지를 한 번 본다.**
XML/코드만 읽으면 배치·여백·비율 같은 "전체 인상"을 놓친다.

```
① get_design_context(fileKey, nodeId)   ← 응답에 스크린샷이 기본 포함된다
② get_screenshot(fileKey, nodeId, maxDimension: 1600)
   → 응답의 image_url 을 curl 로 스크래치패드에 내려받고 Read 로 연다
     curl -sL -o screen.png "<image_url>"
   → 세부가 안 보이면 maxDimension 을 올리거나, 그 부분 프레임만 다시 찍는다
```
- **만들기 전**: 전체 화면을 한 장 본다 — 몇 분할인지, 검색영역이 있는지, 그리드인지 폼인지.
  §1-1 유형 판정이 이 한 장에서 나온다.
- **만든 뒤**: 내가 만든 것과 Figma 이미지를 나란히 놓고 빠진 영역이 없는지 본다.
- 팝업·탭처럼 **숨겨진 상태**는 그 프레임을 따로 찍어야 보인다(목록 화면 캡처엔 안 나온다).

### 아이콘 — **Figma 것을 그대로 가져온다**
비슷해 보이는 걸 `lucide-vue-next` 에서 골라 쓰지 않는다. Figma 에 아이콘이
**130개 등록돼 있다**(`icon/…` 이름). 그게 디자인 확정본이다.

```
Figma 프레임에서 아이콘 확인 → get_design_context 응답의 asset URL 로 SVG 내려받기
  → src/assets/images/icons/ 에 저장
  → src/components/custom/icon/icons.ts 에 등록
  → <Icon name="..." /> 로 사용
```
지금 `icons.ts` 에 6개뿐이라 화면들이 lucide 로 때우고 있는데(23곳), **새로 그리는 화면부터는
Figma 아이콘을 등록해서 쓴다.** 등록하면 다음 화면이 재사용한다 — 이것도 공통화다(§1).
Figma 에 없는 아이콘만 lucide 를 쓰고, 그 사실을 인계 메모에 남긴다(§11).

### 공통에 없는 새 컨텐츠가 나오면
```
Figma 에서 형태 확인 → component-guide.md 에서 공통에 있나 확인
  → 없으면 만든다 → 공통화한다        ← 이 단계를 빠뜨리지 않는다
```
- **공통화 위치**: 컴포넌트면 `custom/<name>/` + `component-guide.md` 등재(§1),
  스타일이면 `police-style.css` 토큰/클래스(§1 CSS ②), 아이콘이면 `icons.ts`.
  **화면 전용으로 두지 않는다.**
- **Figma 에 `COMPONENT` 로 등록돼 있으면 공통 후보라는 신호**다
  (`docs/figma-component-audit/` 에 413개 전수 분석이 있다).
- 프레임의 `instance` 이름은 **컴포넌트 선택의 답**이다 — `component-guide.md` §10 역인덱스에
  그 이름으로 찾는다(`selectbox`, `infobox`, `chip__single` …).

**rate limit이 잦으니 화면 전체를 훑지 않는다.** 사용자가 준 nodeId 의 프레임만 연다.
막히면 사용자에게 스크린샷이나 다른 노드 URL 을 요청한다.

라벨/옵션값이 애매하면(저해상도, OCR 불확실 등) 조용히 추측만 하지 말고 합리적으로 구현한 뒤
**어떤 가정을 했는지 결과 보고에 명시**해 사용자가 바로잡게 한다(§11 인계 메모 3번).

## 10. 문서·산출물 위치
- **`docs/`** — 팀이 공유하는 산출물. 커밋한다.
- **`draft/`** — 개인 작업공간(`.gitignore`, git 미추적). 임시 산출물·대용량 파일만 둔다.
  **화면 작업의 근거로 삼지 않는다** — 근거는 Figma 하나다(§9). 여기 있는 옛 기획서 파일을
  Figma 와 대조하지 않는다.
- draft/에 만든 것 중 팀이 봐야 하는 게 생기면 **docs/로 옮기고 참조를 고친다** — draft/에 둔 채
  문서에서 참조하면 다른 사람이 pull해도 파일이 없어 링크가 깨진다.

## 11. 만드는 세션 / 검증 세션 — 역할이 다르다
**이 문서를 보고 화면을 만드는 세션은 "만들기"에만 집중한다.** 값의 타당성·Figma 대조·규칙
준수 감사는 **별도 검증 세션**이 한다. 한 세션이 둘 다 하면 자기 논리를 그대로 다시 따라가서
못 잡는다 — 실제로 겪었다: `openIndex: -1` 을 "인사관리는 1뎁스라 펼칠 게 없다"는 주석까지
달아 확신하며 틀렸다(정답은 6). 만든 세션이 스스로 검토했어도 같은 논리를 반복했을 것이다.

- **만드는 쪽이 보는 것** — 파일이 성립하는가. import 누락, 태그 안 닫힘처럼 명백한 것만.
  전체 `vite build`·`vue-tsc` 를 굳이 돌리지 않아도 된다(45초씩 걸린다).
- **검증 쪽이 보는 것** — 값이 맞는가, 컴포넌트 선택이 옳은가, Figma 와 일치하는가.

### 만들고 나서 남기는 인계 메모 (결과 보고에 적는다)
검증 세션은 이 메모를 보고 무엇을 확인할지 정한다. 특히 3번이 두 세션을 잇는 다리다.

1. **만든 것** — 화면ID, 파일 목록, 참고한 §1-1 기준 파일, **본 Figma 프레임 nodeId**
2. **Figma·사용자 지정과 다르게 한 것** — 이유와 함께(§7·§9). 없으면 "없음"이라고 적는다
3. **확실하지 않은 것** — 값이나 판단이 애매했던 지점을 그대로 적는다. 숨기지 않는다.
   - 예: "LNB `openIndex` 를 6으로 봤는데 `presets.ts` items 인덱스 확인 필요"
   - 예: "Figma 텍스트가 잘려 보여 라벨을 '전출부서'로 읽었음"
4. **새로 만든 공통 CSS·컴포넌트** — 있으면 목록(§1). `component-guide.md` 등재 여부도
5. **Figma 에 없어서 임의로 채운 것** — 동작(팝업 연결·필수항목·유효성), 목업 데이터 형태,
   컬럼 폭, placeholder 문구 등
6. **라우터·LNB 등록 상태** — 라우트는 `route.ts` 로 만들었을 테니 **"`route.ts` 등록 — 바로 열림,
   `/views/{domain}/{화면ID}`"** 이라고 주소까지 적는다(검증 세션이 그걸로 연다).
   `presets.ts` 는 안 건드렸을 테니(§4) **"LNB 프리셋 미등록 — 배치 등록 필요"** 라고 적는다.
   화면군에 화면ID가 늘었으면 그것도 적는다(예: "PC-LPO-0802 팝업 추가됨").
