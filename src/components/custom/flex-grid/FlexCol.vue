<script setup lang="ts">
import { computed, inject, ref, type StyleValue } from 'vue'
import styles from './FlexGrid.module.css'
import { FLEX_ROW_WIDTH_KEY } from './flexGridContext'

/**
 * FlexRow 안의 flex item 한 칸. size 를 안 주면 기본 flex:1 1 0% 라서 부모 FlexRow 안의
 * 형제 수만큼 자동 균등분할된다.
 *
 * size 를 주면 12를 기준 단위로 한 명시적 폭을 쓴다(예: 4 = 4/12 = 33.3%, bootstrap의
 * col-4 와 같은 비율). 숫자 대신 다른 값도 된다:
 * - 'content': 내용 크기만큼만(flex: 0 0 auto) — 라벨처럼 텍스트 길이대로 딱 맞는 폭
 * - 'full': 남는 폭을 전부 차지(flex: 1 1 0%, size 를 안 준 기본값과 동일하지만 breakpoint
 *   객체 안에서 "여기서부터는 기본 동작으로 돌아간다"를 명시하고 싶을 때 쓴다)
 * - '80px', '10rem' 같은 CSS 길이 문자열: 그 값 그대로 고정폭(flex: 0 0 <값>). 12 단위
 *   비율이 아니라 진짜 픽셀/rem 고정폭이 필요할 때(아이콘 버튼 칸 등) 쓴다.
 *
 * breakpoint별로 값을 바꾸고 싶으면 객체로 준다: { default: 'content', '761>=': 'full' }
 * → 부모 FlexRow 의 실제 렌더 폭이 761px 이하가 되면 라벨이 값 위로 올라가는 식의 전환이
 * 가능하다. 미디어쿼리 기준값(761)은 CSS 로 표현할 수 없는 값이라(브라우저가 breakpoint
 * 자체를 CSS 변수로 받는 걸 지원하지 않음) FlexRow 가 ResizeObserver 로 관찰한 자신의 폭을
 * provide 해주고, 여기서 inject 해서 computed 로 매 렌더 판정한다.
 *
 * breakpoint key 는 "숫자를 왼쪽에 둔 부등식을 그대로" 읽는다(N 연산자 폭 이라고 쓰인 걸
 * 폭 기준 부등식으로 뒤집어서 판정한다는 뜻):
 * - 'N<'  → "N < 폭"  → 폭 > N (N 초과)
 * - 'N>'  → "N > 폭"  → 폭 < N (N 미만)
 * - 'N<=' → "N <= 폭" → 폭 >= N (N 이상)
 * - 'N>=' → "N >= 폭" → 폭 <= N (N 이하)
 * 여러 breakpoint 조건이 동시에 만족되면 객체에 나중에 적은 키가 이긴다(CSS 캐스케이드처럼,
 * "가장 좁은/넓은 걸 우선"같은 별도 규칙이 아니라 그냥 작성 순서).
 *
 * size 를 뭐로든 명시적으로 주면(숫자/'content'/'full' 전부) FlexCol 기본 min-width(20rem)를
 * 같이 꺼준다 — size 자체를 안 준 "완전 기본값" 만 그 20rem fluid-wrap 을 유지한다. 'full'도
 * 예외가 아니다: 라벨+값처럼 좁게 중첩된 row 안에서 'full'에 기본 min-width 가 남아있으면
 * 그 칸조차 옆에 못 붙고 자기도 따로 줄바꿈돼버려서 오히려 빈 틈이 생긴다(실측으로 확인됨).
 *
 * 주의: 숫자든 'content'든 CSS 길이 문자열('80px' 등)이든, flex-grow 가 0인 size 는 전부
 * "정확히 이 크기"만 뜻한다 — 옆 칸이 내용 때문에(예: 안에 있는 input 의 min-width, 혹은
 * 'content' 자신의 텍스트 길이) 강제로 다음 줄로 밀려나도, 그 칸 스스로는 빈 자리를 메우려고
 * 늘어나지 않는다(진짜 bootstrap 의 col-4 도 동일, 의도된 동작). 그래서 grow:0 인
 * size(숫자/'content'/CSS 길이)를 섞어 쓰는 row 에는 반드시 'full' 칸을 하나 이상 같이 둬야
 * 한다 — 예: 고정 3 + 4 + 'full', 또는 라벨을 'content' + 값을 'full'. 'full' 은
 * flex-grow:1 이라 강제개행으로 어느 줄에 남겨지든 그 줄의 남는 공간을 알아서 흡수해 빈 틈을
 * 없앤다. 프레임워크가 알아서 'full'을 끼워주진 않으니, grow:0 size 만 나열하고 'full' 을
 * 안 두면(예: 고정 4 + 4 + 4) 이 보장이 깨진다.
 */
type SizeKeyword = 'content' | 'full'
// (string & {}) 는 'content'/'full' 리터럴 자동완성은 살리면서 임의의 CSS 길이 문자열도
// 받기 위한 트릭이다 — 그냥 string 으로 하면 에디터가 'content'/'full' 힌트를 안 보여준다.
type SizeValue = number | SizeKeyword | (string & {})

interface Props {
  size?: SizeValue | Record<string, SizeValue>
}

const props = defineProps<Props>()

const rowWidth = inject(FLEX_ROW_WIDTH_KEY, ref(0))

const UNIT = 12

const BREAKPOINT_KEY = /^(\d+(?:\.\d+)?)(<=|>=|<|>)$/

// key 를 "N 연산자 폭"(숫자가 왼쪽) 그대로 읽고 폭 기준 부등식으로 뒤집는다.
function matchesBreakpoint(width: number, threshold: number, op: string): boolean {
  switch (op) {
    case '<': return width > threshold
    case '>': return width < threshold
    case '<=': return width >= threshold
    case '>=': return width <= threshold
    default: return false
  }
}

function resolveObjectSize(sizeMap: Record<string, SizeValue>, width: number): SizeValue | undefined {
  let defaultValue: SizeValue | undefined
  let matched: SizeValue | undefined

  for (const [key, value] of Object.entries(sizeMap)) {
    if (key === 'default') {
      defaultValue = value
      continue
    }
    const match = BREAKPOINT_KEY.exec(key.trim())
    if (!match) continue
    const threshold = Number(match[1])
    const op = match[2]
    // 여러 breakpoint 조건이 동시에 만족되면 객체에 나중에 적은 키가 이긴다(CSS 캐스케이드처럼).
    if (matchesBreakpoint(width, threshold, op)) {
      matched = value
    }
  }

  return matched ?? defaultValue
}

const colStyle = computed<StyleValue | undefined>(() => {
  if (props.size === undefined) return undefined
  const resolved = typeof props.size === 'object' ? resolveObjectSize(props.size, rowWidth.value) : props.size
  if (resolved === undefined) return undefined

  const flex =
    resolved === 'content' ? '0 0 auto' :
    resolved === 'full' ? '1 1 0%' :
    typeof resolved === 'number' ? `0 0 ${(resolved / UNIT) * 100}%` :
    `0 0 ${resolved}`

  return { flex, minWidth: '0' }
})
</script>

<template>
  <div :class="styles.col" :style="colStyle">
    <slot />
  </div>
</template>
