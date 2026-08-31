# 프로젝트 작업 규칙 (지역경찰포털)

새 화면/페이지를 만들 때 이 문서를 먼저 읽는다. 규칙을 벗어나면 화면마다 구현이 갈라지고(코드
일관성이 깨지고), 이미 겪은 버그를 다시 만든다.

## 0. 같이 볼 문서
- `menu-tab-guide.md` — LNB/하단탭/KeepAlive 연동 가이드. 새 화면 만들 때 반드시 같이 본다.
- `screen-id-map.md` — **화면명·Figma 프레임 이름 → 화면ID 대응표(284개). 새 화면은 여기서
  시작한다.** 화면ID가 정해져야 폴더·라우트·`defineOptions` 이름이 정해진다(§2·§4·§5).
  **번호로 유추하면 틀린다** — Figma `06_장비관리`는 `PC-LPO-07xx`다.
  ⚠ 표가 284행이라 **통째로 읽지 말고 `grep -n "무기" screen-id-map.md` 로 찾는다.**
- `docs/figma-access.md` — Figma 파일키·페이지ID·접근 함정(페이지 목록 조회가 깨져 있다).
- `component-guide.md` — **케이스별 "이럴 땐 이 컴포넌트" 표.** §1 재사용 원칙의 실행 편이라
  화면에 뭘 붙일지 정할 때마다 본다. Figma instance 이름 → 코드 역인덱스, **공통 CSS 클래스**(§12),
  이름이 비슷한 형제 구분표도 여기 있다.

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

### 인라인 스타일 금지 — 전부 CSS Modules(`*.module.css`)
컴포넌트가 노출한 CSS 변수(`--flex-col-min-w` 등)를 호출부에서 바꿀 때도 인라인
(`style="--flex-col-min-w:0"`)으로 덮지 않는다. `layoutSplit.vue` 방식대로 화면 `module.css`에
변수를 재정의하는 클래스를 만들어 `:class`로 입힌다:
```css
/* style/PC-XXX-NNNN.module.css */
.narrowCol { --flex-col-min-w: 0; }
```
```html
<FlexCol :class="styles.narrowCol">
```
이 오버라이드 클래스도 재사용 원칙을 따른다 — 한 화면이면 화면 module.css, 두 화면 이상 반복이면
아래 CSS 우선순위에 맞는 공통 파일로.
(`FlexGrid.module.css` 주석·`DepartmentSearchDialog.vue`·`flex-grid.vue`는 반대로 인라인 style을
안내/구현 중 — 미수정, 새로 쓸 때 따라 하지 않는다.)

### 화면 템플릿에 테일윈드 유틸(`flex`, `mt-4`, `text-[1.5rem]`) 직접 사용 금지
왜: 디자인이 바뀔 때 클래스 하나만 고치면 전체 반영되게 하려는 것. 흩뿌리면 화면마다 손봐야 한다.
- 한 화면 전용이면 화면 `module.css`에 이름 있는 클래스로, 반복이면 아래 CSS 우선순위를 따른다.
- **적용 범위는 화면(페이지 `.vue`/그 화면 컴포저블)뿐.** `src/components/**` 재사용 컴포넌트가
  내부에서 테일윈드 쓰는 건 무관(고칠 곳이 한 파일이라 흩어질 문제가 없다, 예: `layoutHeader.vue`
  의 `defaultClass`/`titleClass`).
- 예외: 기존 컴포넌트(`Button`, `InputField2` 등)에 `class` prop으로 여백/폭만 미세조정.
- **테일윈드 문자열을 화면/컴포저블 JS 변수·computed에 담아 `:class`로 바인딩하는 것도 위반**
  (예: `const cardClass='flex items-center gap-2 p-4 rounded'`). 화면 module.css에 진짜 CSS
  클래스로 뽑는다.
- 기존 화면(2201/2204/2401 등)은 이 규칙 이전 것이라 테일윈드가 남아있다 — 새 화면부터 적용,
  기존은 차차 정리.

### CSS도 컴포넌트와 같은 원칙 — 그 화면 전용이 아니면 새로 만들지 않는다
새로 만들기 전에 **이 순서로** 이미 있는지 확인한다:
1. **디자인 토큰** — `public/portal/asset/css/common/police-style.css`(전역 로드됨, 페이지에서
   import 안 함). 색·모서리는 hex 하드코딩 말고 `var(--Text-body_1)`처럼 토큰을 쓴다.
2. **공통 유틸/레이아웃 클래스** — 같은 파일에 `.search-area` `.list-actions` `.btn-wrap` 같은
   것들이 있다. 같은 역할의 클래스를 새로 만들기 전에 먼저 뒤진다.
3. **컴포넌트 레벨 공통 CSS** — 라벨-값 표는
   `src/components/custom/info-table/InfoTable.module.css`, 그리드는
   `src/assets/css/tabulator-theme.css`(그리드에 전역 적용됨, 다시 스타일링 불필요).
4. 여기까지 없을 때만 화면 전용 `style/PC-XXX-NNNN.module.css`.

**토큰명·유틸 클래스 전체 목록은 `component-guide.md` §12에 표로 있다** — 1·2번을 확인할 때
`police-style.css`(1500줄)를 직접 뒤지지 말고 그 표를 먼저 본다.
(`krds.min.css`는 파일만 있고 로드 안 됨 — 참고 대상 아님.)

## 1-1. 새 화면 기준 파일 — "제일 비슷한 거 찾기"를 매번 새로 하지 않는다
매번 새로 판단하면 같은 유형도 화면마다 다른 베이스로 갈라진다(20개+ 화면이 갈라진 원인). 유형별
기준 파일을 고정한다. **표에 없는 이유로 다른 화면을 "더 비슷하다"며 베이스로 삼지 않는다.**

| 화면 유형 | 기준 파일 | 비고 |
|---|---|---|
| 단순 그리드 목록 + 검색 | `PC-LPO-0215` | |
| 체크박스 그리드 인라인편집 CRUD(선택삭제/추가/저장) | `PC-COM-2401` | §6-1 `cellType` 예시 겸함 |
| 2분할 목록+상세(체크박스 그리드 + 관련 그리드 + 팝업 2개) | `PC-COM-2204` | provide/inject 패턴A, `LayoutPanel` |
| 3분할(트리 + 목록그리드 + 목록그리드) | `PC-COM-2201` | `LayoutPanel` 3-pane |
| 탭 + 다중 팝업이 컴포넌트 하나를 공유(패턴A + `useAutoTrigger`) | `PC-LPO-0701` | `screenGroup` 라우팅 필요, §3 패턴A 원조 |
| 2분할 목록+상세, 단일선택 + 팝업 히스토리 | `PM-PUB-0103` | `row.getData()` 방어적 언랩 예시 |
| 목록 + 등록/상세 폼(`TableWrapper`+`InfoTable`) | `PC-LPO-0801` | |
| 목록/상세/등록이 별개 라우트(패턴B 싱글턴) | `PC-PUB-0301`(목록) + `PC-PUB-0302`/`0303`(상세/등록) | 도메인 싱글턴 스토어 공유 |

**절차**: ① 이미지로 유형 확인 → ② 해당하면 그 기준 파일만 읽고 그대로 참고(`views/` 전체를 다시
안 뒤짐) → ③ 어느 유형과도 애매하게 걸치면 혼자 고르지 말고 사용자에게 확인 → ④ 표에 없는 새
유형이면 화면 완성 후 이 표에 새 줄로 등록(다른 세션도 같은 파일을 가리키게).
기준 파일들은 §6~§8 기준으로 감사해 위반을 고친 상태다(예: PC-COM-2201의 `@row-selection-changed`
필드 오접근 버그·저장 시 불필요 confirm 수정). 기준 파일이 바뀌면 표도 갱신.

## 2. 화면 폴더 구조
화면ID(`PC-XXX-NNNN`)는 **`screen-id-map.md`에서 찾는다 — 직접 정하지 않는다.**
```
views/{domain}/PC-XXX-NNNN/
  PC-XXX-NNNN.vue
  composable/PC-XXX-NNNN.ts   (또는 composable/ 폴더로 분할)
  style/PC-XXX-NNNN.module.css
  components/                  (그 화면 전용 팝업 등)
```
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

## 4. 라우터 등록
- 화면ID는 `screen-id-map.md` 기준(IA 284개 전수). Figma 메뉴 번호로 유추하면 어긋난다.
- `src/router/index.ts`에 `path:'/views/{domain}/{화면ID}'`, `name:'{화면ID}'`,
  `meta:{ layout:'WorkLayout', title:'...' }`.
- 화면ID 많은 화면군은 배열+`.map()`으로 반복 등록(0701~0714 참고). 필요하면 `screenGroup` meta도
  같이(§3).
- (검토됨·미적용: 각 폴더가 자기 라우트를 `route.ts`로 export하고 `router/index.ts`가
  `import.meta.glob`으로 자동 수집 — 이 파일에 손이 자주 가 동시 작업 시 git 충돌이 잦아서.)

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

## 9. 기획서/디자인 확인

### 기획서는 스크린샷 말고 원본 파일로 받는다
`draft/기획서/`에 둔다(개인 작업공간, git 미추적 — §10). 스크린샷은 대화로 들어올 때 축소돼서
화면ID 같은 작은 글씨를 못 읽는다(실제로 1316px 표가 301px로 줄어 판독 불가였다).

**xlsx·pptx·docx는 전부 zip이라 압축을 풀어 XML을 직접 읽으면 된다.** 의존성 필요 없다.
- ❌ `python` — 이 환경에선 Windows 스토어 스텁이라 실행 안 됨
- ❌ `npx xlsx-cli` — 빈 출력만 나옴
- ✅ `cp f.xlsx t.zip && unzip -q t.zip -d x` 후 XML 파싱. 구현 예: `docs/parse-ia.js`

| 파일 | 어디를 읽나 |
|---|---|
| **xlsx** | `x/xl/worksheets/sheet1.xml` + `x/xl/sharedStrings.xml`. 문자열 셀은 `t="s"`이고 `<v>`가 sharedStrings 인덱스 |
| **pptx** | `x/ppt/slides/slideN.xml`의 `<a:t>`가 텍스트. `x/ppt/media/`에 **원본 해상도 이미지**가 그대로 들어있어 Read 로 볼 수 있다 |

⚠ xlsx 함정: 빈 셀은 `<c r="B4" s="5"/>` 자기완결형이다. 정규식을 `<c ...>([\s\S]*?)</c>` 로만
쓰면 다음 셀의 `</c>`까지 삼켜서 **값이 엉뚱한 행/열에 박힌다**(실제로 겪음).
`(?:\/>|>([\s\S]*?)<\/c>)` 로 분기해야 한다. 병합 셀은 `<mergeCell ref="A1:A5">`를 읽어
좌상단 값을 범위 전체에 복사한다(Depth 트리 컬럼 복원에 필요).

(PDF만 못 읽는다 — poppler 미설치. PDF는 이미지로 요청한다.)

### 기획서에서 어떤 화면인지 특정되지 않으면 **반드시 물어본다**
기획서를 읽어 화면명을 뽑았으면 `screen-id-map.md`에서 화면ID를 찾는다(`grep`). 다음 중
하나라도 해당하면 **추측해서 만들지 말고 멈추고 사용자에게 되묻는다:**
- 기획서의 화면명이 `screen-id-map.md`에 **없다**
- 비슷한 이름이 **여러 개** 걸려서 어느 것인지 확정되지 않는다
  (예: "인사관리"는 `PC-LPO-0801`과 `PC-STT-0103` 둘 다 있다)
- 기획서에 화면이 여러 개 들어 있는데 **어느 것을 만들지 지시가 없다**

되물을 때는 이렇게 한다 — 찾은 후보를 같이 보여주고 **화면ID 또는 정확한 화면명**을 달라고 한다:
> 기획서에서 "무기 목록"을 읽었는데 `screen-id-map.md`에서 확정이 안 됩니다.
> 후보: `PC-LPO-0706`(무기 탭 › 목록) / `PC-LPO-0707`(무기 탭 › 등록/상세/수정)
> 어느 화면ID로 만들까요?

**왜 멈춰야 하나:** 화면ID가 틀리면 폴더명·라우트 path/name·`screenGroup`·`defineOptions`·
module.css 파일명이 **전부 같이 틀어진다**(§2·§4·§5). 나중에 여섯 군데를 고쳐야 하고,
`defineOptions`가 어긋나면 KeepAlive가 조용히 깨져서 발견도 늦다. 만들기 전에 묻는 게 훨씬 싸다.
화면ID 체계는 기획서 소관이라 **새 ID를 임의로 만들어내면 안 된다**(`screen-id-map.md` 참고).

### Figma
- 파일키·페이지ID·접근 함정은 `docs/figma-access.md` 참고.
- Figma MCP가 rate limit에 자주 걸린다 — 그땐 사용자가 주는 스크린샷/이미지로 작업.
- 라벨/옵션값이 애매하면(저해상도, OCR 불확실 등) 조용히 추측만 하지 말고 합리적으로 구현한 뒤
  **어떤 가정을 했는지 결과 보고에 명시**해 사용자가 바로잡게 한다.

## 10. 문서·산출물 위치
- **`docs/`** — 팀이 공유하는 산출물. 커밋한다.
- **`draft/`** — 개인 작업공간. `.gitignore`에 있어 git이 추적하지 않는다. 기획서 원본,
  임시 산출물, 대용량 파일을 둔다.
- draft/에 만든 것 중 팀이 봐야 하는 게 생기면 **docs/로 옮기고 참조를 고친다** — draft/에 둔 채
  문서에서 참조하면 다른 사람이 pull해도 파일이 없어 링크가 깨진다.
