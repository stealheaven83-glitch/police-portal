/**
 * 공통 컴포넌트의 기기별 스타일을 **값 묶음 2벌 + 정책 1개**로 나눠 쓴다.
 *
 * `police-override.css` 의 `.lp-dialog-*` 가 CSS 변수로 하는 일과 개념이 같다 —
 * 값 묶음은 PC·모바일 2벌뿐이고, `device` 는 그 2벌을 **어떻게 쓸지**만 고른다.
 * 다른 점은 값이 CSS 변수가 아니라 테일윈드 클래스 문자열이라는 것뿐이다.
 *
 * ```ts
 * cn(deviceStyle({ pc: 'py-[2.2rem]', mobile: 'py-[1.5rem] mb-5' }, props.device), props.class)
 *
 * // 'responsive' → 'py-[2.2rem] mo:py-[1.5rem] mo:mb-5'   폭 1000px 경계로 갈린다
 * // 'pc'         → 'py-[2.2rem]'                          모바일 값을 아예 버린다
 * // 'mobile'     → 'py-[1.5rem] mb-5'                     폭과 무관하게 모바일 값이 이긴다
 * ```
 *
 * 반환 전에 **twMerge 를 한 번 거친다.** 'mobile' 일 때 PC 값과 모바일 값이 같은 유틸리티면
 * (`px-6` vs `px-0`) 뒤엣것만 남겨야 하는데, 이걸 호출부의 `cn` 에 맡기면 `cn` 없이
 * `:class="…"` 로 바로 쓰는 자리에서 조용히 틀린다 — 둘 다 DOM 에 남아 **클래스 순서가 아니라
 * CSS 파일 순서**가 이기기 때문이다. 그래서 함수가 스스로 정리한다.
 * `cn(deviceStyle(...), props.class)` 처럼 겹쳐 써도 twMerge 는 멱등이라 문제 없다.
 *
 * ⚠ **`src/components/**` 재사용 컴포넌트 안에서만 쓴다.** 화면(`views/**`)에서 테일윈드
 *   문자열을 JS 에 담아 `:class` 로 바인딩하는 건 CLAUDE.md §1 위반이다. 화면은 공통 CSS
 *   클래스(`police-common.css`)를 쓴다.
 *
 * ⚠ `mobile` 에 적는 값은 **접두사 없이** 적는다(`'py-[1.5rem]'`). `mo:` 는 이 함수가
 *   'responsive' 일 때만 붙인다. 실수로 `'mo:py-[1.5rem]'` 라고 적어도 같은 결과가 나오도록
 *   한 번 벗겨 내고 다시 붙인다(어느 쪽으로 적든 안전하다).
 *
 * ⚠ `pc` 는 **기본값(base)** 자리라 variant 를 달지 않는다. `pc:pl-4` 처럼 적으면
 *   device:'mobile' 에서 모바일 값이 그걸 못 덮는다 — 그럴 값은 `mobile` 쪽에 짝을 만든다.
 */

import { twMerge } from 'tailwind-merge'

/**
 * 기기 정책. `custom/dialog/dialogDevice.ts` 의 `DialogDevice` 와 값이 같다 —
 * 두 곳을 합치는 건 별도 배치로 한다(CLAUDE.md §1: 중복은 중복인 채로 둔다).
 */
export type DeviceMode = 'pc' | 'mobile' | 'responsive'

export interface DeviceStyleInput {
  /** PC 값. 기본값 자리이므로 variant 없이 적는다 */
  pc?: string
  /** 모바일 값. `mo:` 없이 적는다 */
  mobile?: string
}

/** 경계는 1000px 하나다 — style.css 의 `@custom-variant mo` · useResponsive.ts 의 BP_MOBILE */
const MOBILE_VARIANT = 'mo:'

/** 공백으로 끊고 빈 조각을 버린다. 줄바꿈으로 여러 줄에 걸쳐 적어도 된다 */
function toTokens(value?: string): string[] {
  return value ? value.split(/\s+/).filter(Boolean) : []
}

export function deviceStyle(styles: DeviceStyleInput, device: DeviceMode = 'responsive'): string {
  const pc = toTokens(styles.pc)
  // 적는 사람이 mo: 를 붙였든 안 붙였든 같은 결과가 되도록 한 번 벗긴다
  const mobile = toTokens(styles.mobile).map((token) =>
    token.startsWith(MOBILE_VARIANT) ? token.slice(MOBILE_VARIANT.length) : token,
  )

  if (device === 'pc') {
    return twMerge(pc.join(' '))
  }

  if (device === 'mobile') {
    // 접두사 없이 뒤에 붙인다 — 같은 유틸리티면 twMerge 가 뒤엣것(모바일 값)만 남긴다
    return twMerge([...pc, ...mobile].join(' '))
  }

  // 접두사가 붙으면 twMerge 가 PC 값과 다른 그룹으로 보므로 둘 다 남는다 — 미디어쿼리가 고른다
  return twMerge([...pc, ...mobile.map((token) => `${MOBILE_VARIANT}${token}`)].join(' '))
}
