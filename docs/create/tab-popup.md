# 유형: 탭 + 다중 팝업이 컴포넌트 하나를 공유 (화면군)

`docs/create.md` §2 에서 이 유형으로 판정됐을 때 편다. 기준 파일은 **`src/views/lpo/PC-LPO-0701/PC-LPO-0701.vue`**
(장비관리 — 탭 5개 + 상세/하위 팝업이 화면ID `PC-LPO-0701`~`0714` 를 가진다).

**화면군이란**: 기획서/Figma 는 화면을 화면ID 단위로 쪼개 놓지만(0701=목록, 0702=상세팝업, 0703=그 안에서
여는 하위팝업), 실제 구현은 탭/팝업 상태를 가진 **페이지 컴포넌트 하나**다. 화면ID마다 URL 은 필요한데
컴포넌트는 쪼개고 싶지 않을 때 이 유형이다. `screen-id-map.md` 에서 한 프레임 묶음이 여러 화면ID로 나오면
이쪽이다.

> 규칙 본문은 `CLAUDE.md`. 여기는 이 유형에서 **무엇을 어떤 순서로 하는가**만 적는다.
> 이 유형은 `docs/create.md` §3 "라우터 — 아무것도 안 한다"의 **예외**다. 아래 1번을 반드시 한다.

## 1. 라우터 — `router/index.ts` 에 직접 적는다 (규약 예외)
`plannedRoutes` 는 화면ID 하나 = 파일 하나를 전제한다. 화면군은 여러 화면ID가 **같은 파일**을 가리켜야
하므로 `router/index.ts` 배열에 직접 적는다. 대표 화면ID(0701)와 나머지 전부:
```ts
{
  path: '/views/lpo/PC-LPO-0702',
  name: 'PC-LPO-0702',
  component: () => import('../views/lpo/PC-LPO-0701/PC-LPO-0701.vue'),   // 대표 화면과 같은 파일
  meta: { layout: 'WorkLayout', title: '장비관리', screenGroup: 'PC-LPO-0701' },
},
```
- **`meta.screenGroup` 을 전부 대표 화면ID로 준다.** `Layout.vue` 가
  `<component :key="route.meta.screenGroup ?? route.fullPath">` 로 렌더링하므로, 이게 없으면 탭/팝업을
  옮길 때마다 컴포넌트가 리마운트돼 상태가 초기화된다.
- `index.ts` 에 적힌 `name` 은 `buildPlannedRoutes` 가 `taken` 으로 걸러 중복 등록하지 않는다.
- **⚠ 파일을 먼저 만들고 라우트를 적는다.** `index.ts` 의 `import('../views/…')` 는 리터럴 경로라 파일이
  없으면 Rollup 이 `Could not resolve ...` 로 **빌드 전체를 실패**시킨다. `vue-tsc` 는 통과해서 넣은 사람은
  모르고 배포하는 사람이 막힌다.
- 기존 줄은 바꾸지 않고 **추가만** 한다(`CLAUDE.md` §1 — 3명이 동시에 만지는 파일이다).
- 현재 화면군: `PC-LPO-0701`~`0714`, `PC-COM-2204`(+2205/2207), `PM-COM-0101`/`0102`, `PC-PUB-0208`~`0210`,
  `PM-PUB-0401` 등. `grep -n "screenGroup" src/router/index.ts` 로 최신 목록을 본다.

## 2. 폴더 — 전부 대표 화면 폴더 밑에
```
views/lpo/PC-LPO-0701/
  PC-LPO-0701.vue
  composable/…
  components/   ← 0702·0703… 팝업 전부 여기
```
다른 화면ID 폴더(`PC-LPO-0702/`)를 **만들지 않는다.** 만들면 `plannedRoutes` 의 glob 에 잡혀 별개 화면으로
뜬다.

## 3. 상태 공유 — provide / inject (패턴 A)
페이지가 `useXxxList()` 를 **한 번만** 호출하고 `provide()`, 하위 팝업은 `inject()`. 코드는
`docs/create/split-detail.md` §3 과 같다.

## 4. 화면ID ↔ 탭/팝업 상태 동기화 — `useAutoTrigger`
`src/composables/useAutoTrigger.ts`. `{ '화면ID': [[ref, 값], …] }` 로 **"이 화면ID면 이 ref 들이 이 값"** 을
선언한다. 탭이든 팝업이든 같은 문법이다.
```ts
useAutoTrigger({
  'PC-LPO-0701': [[activeCategory, 'mobile']],
  'PC-LPO-0702': [[activeCategory, 'mobile'], [detailDialogOpen, true]],
  'PC-LPO-0703': [[activeCategory, 'mobile'], [detailDialogOpen, true], [vehicle112DialogOpen, true]],
})
```
- 순방향(URL → 상태)과 역방향(상태 → URL)이 자동이다. 역방향은 `router.replace` 라 브라우저 히스토리가
  쌓이지 않는다. 설계 이유·동작 방식은 파일 상단 주석.
- **비대칭(순방향≠역방향)이 필요한 화면은 이 맵에 넣지 않는다** — 특정 행을 선택해야만 여는 팝업은 URL 만으로
  못 연다. 그런 화면ID는 라우트만 등록하고(1번) 맵에서 빼며, 인계 메모에 적는다. `router/index.ts` 의
  `PC-COM-2205` 주석이 그 예다.

## 5. LNB
탭이 여러 화면ID여도 LNB 항목은 하나다(`개인장비`). 값은 `docs/create.md` §3 대로 `presets.ts` 를 grep
해 구한다 — 0701 실측값 `openIndex: 5, activeChild: '개인장비'`.

## 6. 인계 메모에 꼭 적는 것
- `index.ts` 에 직접 적은 화면ID 목록(예: "PC-LPO-0701~0714 등록, screenGroup 'PC-LPO-0701'")
- `useAutoTrigger` 맵에서 뺀 화면ID와 이유(비대칭)
- 화면군에 화면ID가 늘었으면 그것도(예: "PC-LPO-0802 팝업 추가됨")
