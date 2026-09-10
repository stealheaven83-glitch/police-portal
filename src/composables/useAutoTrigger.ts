import { type Ref, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/** [바뀔 ref, 그 ref가 가져야 할 값] — 탭이든 팝업이든 그냥 ref+값 쌍이라 구분하지 않는다 */
export type RefValuePair<T = unknown> = readonly [Ref<T>, T]

/** 화면ID(라우트 name) → 그 화면이 의미하는 ref 값 목록 */
export type ScreenTriggerMap = Record<string, readonly RefValuePair[]>

/**
 * 화면ID(PC-LPO-XXXX 등 기획서 화면ID) ↔ 페이지 내부 상태(탭/팝업 등) 양방향 동기화.
 *
 * ## 왜 필요한가
 * 기획서/Figma 는 화면을 화면ID 단위로 쪼개 놓지만(예: 0701=목록, 0702=상세팝업,
 * 0703=그 안에서 여는 하위팝업), 실제 구현은 보통 tab/dialog 상태를 가진 페이지
 * 컴포넌트 하나다. 화면ID별 URL이 필요하면서도 페이지 컴포넌트는 쪼개고 싶지 않을 때
 * "이 화면ID = 이 상태" 매핑만 선언해서 라우트↔상태를 자동으로 동기화하는 게 이 함수다.
 * 실전 예시는 src/views/lpo/PC-LPO-0701/PC-LPO-0701.vue 참고.
 *
 * ## 1) 먼저 라우트를 화면ID 개수만큼 등록한다 (router/index.ts)
 * 컴포넌트는 전부 같은 파일을 가리켜야 한다 — 같은 경로를 import 하면 모듈 시스템이
 * 같은 컴포넌트 객체로 캐시해주기 때문에, 서로 다른 라우트 사이를 이동해도(router.replace)
 * Vue 가 "같은 컴포넌트"로 인식해 리마운트하지 않고 상태를 그대로 유지한다. 이게 없으면
 * 탭/팝업 상태가 라우트 이동마다 초기화돼버려서 이 함수의 전제가 깨진다.
 *
 *   {
 *     path: '/views/lpo/PC-LPO-0702',
 *     name: 'PC-LPO-0702',
 *     component: () => import('../views/lpo/PC-LPO-0701/PC-LPO-0701.vue'), // 0701과 동일 파일
 *     meta: { layout: 'WorkLayout', title: '장비관리' },
 *   },
 *
 * ## 2) 페이지에서 "화면ID = ref 값" 매핑을 선언한다
 * key 는 라우트 name(=화면ID), value 는 [ref, 그 값] 쌍의 배열이다. 탭을 고르는 ref든
 * 팝업 열림 여부 ref든 이 함수 입장에선 구분이 없다 — 그냥 "이 ref가 이 값이어야
 * 이 화면ID"라는 조건 목록일 뿐이다.
 *
 *   useAutoTrigger({
 *     'PC-LPO-0701': [[activeCategory, 'mobile']],
 *     'PC-LPO-0702': [[activeCategory, 'mobile'], [detailDialogOpen, true]],
 *     'PC-LPO-0703': [[activeCategory, 'mobile'], [detailDialogOpen, true], [vehicle112DialogOpen, true]],
 *   })
 *
 * 조건은 몇 개든 이어붙일 수 있어서, 팝업 안에서 또 팝업을 여는 중첩 구조(0703)도
 * "부모 화면ID의 조건 + 조건 하나 더"로 그대로 표현된다.
 *
 * ## 동작 방식
 * - 순방향(URL→상태): route.name 이 바뀌면 그 화면ID에 나열된 ref들을 전부 그 값으로 set 한다.
 *   (주소창 직접 입력, 새로고침, 브라우저 뒤로/앞으로가기가 여기 해당)
 * - 역방향(상태→URL): 나열된 ref들 중 하나라도 바뀌면, "지금 값과 전부 일치하는" 화면ID들 중
 *   조건을 가장 많이 만족하는(=가장 구체적인, 중첩 팝업까지 열려있는) 화면ID를 찾아 그 라우트로
 *   바꾼다. 0703 처럼 0702 의 조건을 포함하면서 조건이 하나 더 있는 화면ID가 항상 우선한다.
 *   (router.replace 를 쓰므로 브라우저 히스토리는 쌓이지 않는다 — 탭/팝업 전환마다 뒤로가기
 *   기록이 남길 원하면 이 함수를 쓰지 말고 직접 router.push 로 처리할 것)
 * - 역방향으로 라우트를 바꾼 직후 순방향이 같은 값을 다시 set 해버리는 낭비/오탐을 막기 위해,
 *   역방향이 바꾼 다음 번 순방향 실행은 1회 건너뛴다.
 *
 * ## 알려진 한계
 * 순방향과 역방향이 같은 조건([ref,값] 쌍)을 공유하는 구조라서 "상태가 이거면 URL엔
 * 반영하되(역방향), URL만 보고 그 상태로 직접 진입하지는 않기(순방향)" 같은 비대칭
 * 동작은 표현할 수 없다. 예: 특정 행(데이터)을 선택해야만 열리는 팝업은 URL만으로
 * 어떤 행인지 알 수 없으므로 이 함수의 매핑에서 아예 빼고 별도로 처리해야 한다
 * (PC-LPO-0701.vue 의 유지보수이력 팝업이 이 경우 — 주석 참고).
 */
export function useAutoTrigger(map: ScreenTriggerMap) {
  const route = useRoute()
  const router = useRouter()
  let skipNextForward = false
  let applyingForward = false

  /** pairs 가 전부 지금 값과 일치하면 조건 개수를, 하나라도 안 맞으면 null 을 반환한다 */
  function matchLength(pairs: readonly RefValuePair[]): number | null {
    for (const [ref, value] of pairs) {
      if (ref.value !== value) return null
    }
    return pairs.length
  }

  /** 전부 일치하는 화면ID들 중 조건을 가장 많이 만족하는(가장 구체적인) 것을 고른다 */
  function findMostSpecific(): string | null {
    let bestId: string | null = null
    let bestLength = -1
    for (const [id, pairs] of Object.entries(map)) {
      const length = matchLength(pairs)
      if (length !== null && length > bestLength) {
        bestId = id
        bestLength = length
      }
    }
    return bestId
  }

  watch(
    () => route.name,
    async (name) => {
      if (skipNextForward) {
        skipNextForward = false
        return
      }
      const pairs = map[String(name ?? '')]
      if (!pairs) return
      // 여러 조건(예: 부모 팝업 + 자식 팝업)을 같은 tick 에 한꺼번에 set 하면 다이얼로그
      // 라이브러리의 aria-hidden/포커스트랩 처리가 둘 다 열리는 걸 못 따라가 두 팝업 다
      // aria-hidden 상태로 남는 경우가 있다(사용자가 실제로 클릭해서 하나씩 여는 경우엔
      // 렌더 tick이 자연히 끼어서 문제가 없다) — 그래서 한 tick 씩 끊어서 적용한다.
      // applyingForward 는 그 중간 상태(예: 부모만 열리고 자식은 아직인 상태)를 역방향
      // watch 가 "이게 최종 상태"로 오해해 URL 을 덜 구체적인 화면ID로 되돌리지 않도록 막는다.
      applyingForward = true
      for (const [ref, value] of pairs) {
        ref.value = value
        await nextTick()
      }
      applyingForward = false
    },
    { immediate: true },
  )

  watch(
    () => Object.values(map).flatMap((pairs) => pairs.map(([ref]) => ref.value)),
    () => {
      if (applyingForward) return
      const activeId = findMostSpecific()
      if (!activeId || activeId === route.name) return
      skipNextForward = true
      router.replace({ name: activeId })
    },
    /*
     * flush: 'post' — 상태가 바뀐 뒤 "화면이 실제로 갱신되고 나서" 주소를 바꾼다.
     * 기본값('pre')이면 팝업을 닫는 렌더보다 router.replace 가 먼저 돌고, 라우트 전환으로
     * KeepAlive 가 화면을 비활성화하는 사이에 그 렌더가 반영되지 못해 팝업이 열린 채로
     * 남는다(닫기를 두 번 눌러야 닫히는 증상 — PM-LPO-0217 처리자 관리 팝업에서 확인).
     */
    { flush: 'post' },
  )
}
