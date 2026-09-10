import { useMediaQuery } from '@vueuse/core'
import type { Ref } from 'vue'

/**
 * 반응형 경계값 — 화면마다 숫자를 직접 적지 말고 이걸 쓴다.
 * public/portal/asset/css/common/*.css 의 미디어쿼리와 같은 값이다.
 * 여기를 바꾸면 CSS 쪽도 같이 바꿔야 한다.
 */
export const BP_MOBILE = 1000

/**
 * 폭 감시 — 조건이 맞으면 true 가 담기는 boolean Ref 를 돌려준다.
 *   useBreakpoint('<=', BP_MOBILE)  → 767px 이하일 때 true (max-width)
 *   useBreakpoint('>=', BP_TABLET)  → 1023px 이상일 때 true (min-width)
 *
 * 폭이 바뀌면 값이 알아서 갱신된다(resize 리스너를 따로 달 필요 없다).
 * 초과·미만은 따로 두지 않는다 — 수치를 1 낮추거나 높여서 쓴다.
 */
export function useBreakpoint(op: '<=' | '>=', px: number = BP_MOBILE): Ref<boolean> {
  const dir = op === '<=' ? 'max' : 'min'
  return useMediaQuery(`(${dir}-width: ${px}px)`)
}
