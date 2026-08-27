import type { InjectionKey, Ref } from 'vue'

/**
 * FlexRow 가 자신의 실제 렌더 폭(ResizeObserver)을 provide 하고, FlexCol 은 이를 inject 해서
 * size prop 의 breakpoint(예: '761<')를 판정한다. 전역 viewport 가 아니라 이 FlexRow 자신의
 * 폭 기준이라, FlexGrid 가 좁은 다이얼로그 안에 들어가도 그 컨테이너 폭 기준으로 반응한다.
 */
export const FLEX_ROW_WIDTH_KEY: InjectionKey<Ref<number>> = Symbol('flexRowWidth')
