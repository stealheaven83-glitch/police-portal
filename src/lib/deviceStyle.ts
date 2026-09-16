import { ref } from 'vue'
import { twMerge } from 'tailwind-merge'
import { BP_MOBILE } from '@/composable/responsive/useResponsive'

/**
 * 공통 컴포넌트의 기기별 스타일을 **값 묶음 2벌 + 정책 1개**로 나눠 쓴다.
 *
 * `police-override.css` 의 `.lp-dialog-*` 가 CSS 변수로 하는 일과 개념이 같다 —
 * 값 묶음은 PC·모바일 2벌뿐이고, `device` 는 그 2벌을 **어떻게 쓸지**만 고른다.
 *
 * ```ts
 * const rootClass = computed(() =>
 *   deviceStyle({ pc: 'py-[2.2rem] px-0', mobile: 'py-[1.5rem] mb-5' }, props.device),
 * )
 *
 * // 'pc'          → 'py-[2.2rem] px-0'               모바일 값을 버린다
 * // 'mobile'      → 'px-0 py-[1.5rem] mb-5'          폭과 무관하게 모바일 값이 이긴다
 * // 'responsive'  → 폭이 1000 미만이면 위의 'mobile', 아니면 'pc'
 * ```
 *
 * ## ⚠ `mo:` 접두사를 쓰지 않는 이유 — 그 방식은 동작하지 않는다
 *
 * `mobile` 값에 `mo:` 를 **런타임에 붙이는** 구현을 먼저 했다가 되돌렸다(2026-09-16).
 * Tailwind 는 **소스 파일을 글자로 훑어서** 거기 있는 클래스만 CSS 로 만든다.
 * 접두사를 이어 붙이면 그 조합(예: 모바일 변형이 붙은 `px-0`)이 소스 어디에도 없으므로
 * **그 CSS 규칙이 아예 생성되지 않는다.** 클래스는 DOM 에 붙는데 뒤에 스타일이 없어
 * 아무 일도 일어나지 않고, 조용히 틀린다(실제로 세 컴포넌트가 그렇게 깨졌다).
 *
 * 그래서 이 함수는 **클래스 이름을 만들지 않는다.** `pc`·`mobile` 둘 다 소스에 적힌
 * 그대로라 Tailwind 가 둘 다 생성하고, 어느 쪽을 쓸지만 고른다.
 *
 * ## 폭 판단은 JS 가 한다 — 대신 깜빡임은 없다
 *
 * 접두사를 안 쓰므로 CSS 미디어쿼리가 아니라 `matchMedia` 로 판단한다.
 * `useBreakpoint`(vueuse)는 `ref(false)` 로 시작해 첫 프레임이 항상 PC 모양이라 깜빡이는데,
 * 여기서는 **모듈이 로드될 때 동기로 실제 값을 읽으므로**(앱이 그려지기 전이다) 첫 렌더부터 맞다.
 *
 * ## ⚠ 쓰는 자리
 *
 * **`src/components/**` 재사용 컴포넌트 안에서만 쓴다.** 화면(`views/**`)에서 테일윈드
 * 문자열을 JS 에 담아 `:class` 로 바인딩하는 건 CLAUDE.md §1 위반이다 — 화면은 공통 CSS
 * 클래스(`police-common.css`)를 쓴다.
 *
 * `pc`·`mobile` 둘 다 **variant 없이** 적는다(`mo:`·`pc:` 를 붙이지 않는다).
 * 같은 유틸리티면 `mobile` 쪽이 이긴다(twMerge).
 */

/**
 * 기기 정책. `custom/dialog/dialogDevice.ts` 의 `DialogDevice` 와 값이 같다 —
 * 두 곳을 합치는 건 별도 배치로 한다(CLAUDE.md §1: 중복은 중복인 채로 둔다).
 */
export type DeviceMode = 'pc' | 'mobile' | 'responsive'

export interface DeviceStyleInput {
  /** PC 값 */
  pc?: string
  /** 모바일 값. 같은 유틸리티는 PC 값을 덮는다 */
  mobile?: string
}

/**
 * 경계는 `style.css` 의 `@custom-variant mo`(= `not all and (min-width:1000px)`)와 같은 구간이다.
 * `max-width: 999.98px` 로 적어야 1000 딱 그 지점이 PC 쪽에 들어간다.
 */
const MOBILE_MEDIA = `(max-width: ${BP_MOBILE - 0.02}px)`

/**
 * 모듈 스코프 싱글턴. **import 시점에 동기로 실제 값을 읽는다** — 앱이 그려지기 전이라
 * 첫 렌더부터 올바른 값이다(`useBreakpoint` 의 첫 프레임 false 문제가 없다).
 * 리스너도 여기서 한 번만 단다. 컴포넌트가 몇 개든 감시자는 하나다.
 */
const isMobileWidth = ref(false)

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const query = window.matchMedia(MOBILE_MEDIA)
  isMobileWidth.value = query.matches
  query.addEventListener('change', (event) => {
    isMobileWidth.value = event.matches
  })
}

/** 지금 모바일 폭인가. 컴포넌트가 마크업·prop 을 갈라야 할 때 같이 쓴다 */
export function useIsMobileWidth() {
  return isMobileWidth
}

/**
 * `device` 정책에 따라 PC 값 / 모바일 값 중 하나를 고른다.
 * `computed()` 안에서 부르면 폭이 바뀔 때 알아서 다시 계산된다.
 */
export function deviceStyle(styles: DeviceStyleInput, device: DeviceMode = 'responsive'): string {
  const pc = styles.pc ?? ''
  const mobile = styles.mobile ?? ''

  if (device === 'pc') {
    return twMerge(pc)
  }

  // 'responsive' 는 폭을 보고, 'mobile' 은 폭과 무관하게 모바일 값을 쓴다
  const useMobile = device === 'mobile' || isMobileWidth.value
  if (!useMobile) {
    return twMerge(pc)
  }

  // 뒤에 붙여야 같은 유틸리티에서 모바일 값이 이긴다(twMerge)
  return twMerge(`${pc} ${mobile}`)
}
