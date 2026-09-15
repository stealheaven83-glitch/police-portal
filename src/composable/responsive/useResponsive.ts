import { useMediaQuery } from '@vueuse/core'
import type { Ref } from 'vue'

/**
 * JS 쪽 반응형 경계값 — 화면에서 숫자를 직접 적지 말고 이걸 쓴다.
 *
 * ⚠ **CSS 전체와 같은 값이 아니다**(2026-09-14 확인). 저장소에 경계값이 21종 섞여 있고,
 * 공통 CSS 도 62.5rem·48rem·36rem·1024px 등을 쓴다. 그래서 이 상수는 **JS 분기용 기준**이지
 * "CSS 와 동기화된 값" 이 아니다.
 *
 * 새로 CSS 를 쓸 때 이 값에 맞추려면 `@media (max-width: 1000px)` 으로 적는다.
 * 컴포넌트가 이미 가진 경계는 아래 표와 같고, 화면에서 못 바꾼다(CLAUDE.md §1):
 *
 *   InfoTable    48rem(480) · 62.5rem(625) · 40rem(400)   ← 칸 접힘
 *   layoutSplit  82rem(820)                                ← 분할 해제
 *   layoutPanel  48rem(480)
 *   SideMenu     82rem(820)
 *
 * 반응형 화면을 만들 때는 **페이지 경계(1000)와 컴포넌트 경계가 다르다**는 걸 전제로 잡는다 —
 * 그 사이 구간에서 JS 분기와 CSS 분기가 엇갈린다.
 */
export const BP_MOBILE = 1000

/**
 * 폭 감시 — 조건이 맞으면 true 가 담기는 boolean Ref 를 돌려준다.
 *   useBreakpoint('<=')        → 1000px 이하일 때 true (max-width, 기본값 BP_MOBILE)
 *   useBreakpoint('>=', 1024)  → 1024px 이상일 때 true (min-width)
 *
 * 폭이 바뀌면 값이 알아서 갱신된다(resize 리스너를 따로 달 필요 없다).
 * 초과·미만은 따로 두지 않는다 — 수치를 1 낮추거나 높여서 쓴다.
 *
 * ⚠ **첫 렌더에서는 항상 false 다.** `useMediaQuery` 가 `ref(false)` 로 시작하고
 * `onMounted` 이후에야 실제 값이 들어온다. 즉 모바일에서 열어도 첫 프레임은 PC 모양으로
 * 그려졌다가 바뀐다. **보이고/안 보이고만 다른 것은 JS 대신 CSS 로 처리한다**
 * (`.lp-mobile-only` / 미디어쿼리) — 그래야 깜빡임이 없다.
 * JS 가 꼭 필요한 건 마크업·role·컴포넌트 prop 이 달라지는 경우뿐이다.
 */
export function useBreakpoint(op: '<=' | '>=', px: number = BP_MOBILE): Ref<boolean> {
  const dir = op === '<=' ? 'max' : 'min'
  return useMediaQuery(`(${dir}-width: ${px}px)`)
}
