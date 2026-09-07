# 유형: 목록 / 상세 / 등록이 별개 라우트

`docs/create.md` §2 에서 이 유형으로 판정됐을 때 편다. 기준 파일은 **`PC-PUB-0301`**(목록) +
**`PC-PUB-0302`/`0303`**(상세/등록) — 방범협력단체. 상태는 `src/views/pub/composable/publicSafety.ts`.

**이 유형이란**: 화면ID마다 **진짜 별개 페이지**(폴더도 파일도 따로)인데 같은 도메인 데이터(목록 배열,
선택된 항목)를 이어서 써야 하는 경우. 팝업이 아니라 페이지 이동으로 상세/등록에 간다.
`docs/create/tab-popup.md`(컴포넌트 하나에 화면ID 여러 개)와 반대다.

> 규칙 본문은 `CLAUDE.md`. 여기는 이 유형에서 **무엇을 어떤 순서로 하는가**만 적는다.

## 1. 폴더 — 화면ID마다 폴더, 상태는 도메인 레벨
```
views/pub/
  composable/publicSafety.ts     ← 도메인 스토어(싱글턴). 화면 폴더 밖
  PC-PUB-0301/PC-PUB-0301.vue    ← 목록
  PC-PUB-0302/PC-PUB-0302.vue    ← 상세
  PC-PUB-0303/PC-PUB-0303.vue    ← 등록
```
- 각 화면은 규약대로 폴더·파일을 만들면 `plannedRoutes` 가 자동 등록한다(`docs/create.md` §3). 라우터를
  건드릴 일이 없다.
- 상태 파일은 `views/{domain}/composable/` 에 둔다 — 세 화면 어느 폴더에도 속하지 않기 때문이다.

## 2. 상태 — 모듈 스코프 싱글턴 (패턴 B)
```ts
function createXxxStore() { /* ref, computed, 저장/삭제 함수 … */ }
let singleton: ReturnType<typeof createXxxStore> | null = null
export function useXxxStore() {
  if (!singleton) singleton = createXxxStore()
  return singleton
}
```
- **왜 싱글턴인가**: `Layout.vue` 가 `<component :key="route.meta.screenGroup ?? route.fullPath">` 로
  렌더링해 **라우트가 바뀔 때마다 컴포넌트가 통째로 리마운트**된다(하단 멀티탭 UX 용 의도된 설계).
  `setup()` 안에서 `ref` 를 만들면 목록 → 상세로 갈 때 리셋된다. 모듈 스코프에 두면 살아남는다.
- 세 화면 다 `useXxxStore()` 만 부른다. `provide/inject` 는 쓰지 않는다(부모-자식이 아니다).
- 같은 도메인의 다른 스토어(`drunkCenter.ts`·`mentalEmergency.ts`)에 같은 옵션 목록이 있어도 **합치지
  않는다**(`CLAUDE.md` §1).

## 3. 화면 사이 이동
- 목록에서 행을 고르면 스토어의 `selectedId`(이름은 기준 파일대로)에 넣고 `router.push('/views/pub/PC-PUB-0302')`.
- 상세/등록 화면은 마운트 시 스토어에서 읽는다. **URL 로 바로 진입했는데 선택이 없으면** 목록으로
  돌려보내거나 빈 상태를 보여준다 — 어느 쪽인지 Figma 에 없으면 추론하고 인계 메모 5번에 적는다.
- 저장/삭제 후 목록 갱신은 **배열 재할당**(`CLAUDE.md` §5), 피드백은 toast(`CLAUDE.md` §4).

## 4. LNB
세 화면이 같은 LNB 항목을 켠다. 값은 `docs/create.md` §3 대로 `presets.ts` 를 grep 한다 — 프리셋을
**인라인으로 펼쳐** 준다(문자열 키로 부르고 이어서 `setActiveChild` 를 부르면 비동기 로딩이 덮는다.
방범협력단체에서 실제로 겪었다: 하위메뉴가 안 펼쳐지고 활성표시가 엉켰다).
