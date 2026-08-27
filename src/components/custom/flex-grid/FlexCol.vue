<script setup lang="ts">
import { computed, inject, ref, type StyleValue } from 'vue'
import styles from './FlexGrid.module.css'
import { FLEX_ROW_WIDTH_KEY } from './flexGridContext'

/**
 * FlexRow 안의 flex item 한 칸. size 를 안 주면 기본 flex:1 1 0% 라서 부모 FlexRow 안의
 * 형제 수만큼 자동 균등분할된다.
 *
 * size 를 주면 12를 기준 단위로 한 명시적 폭을 쓴다(예: 4 = 4/12 = 33.3%, bootstrap의
 * col-4 와 같은 비율). 숫자 대신 키워드도 된다:
 * - 'content': 내용 크기만큼만(flex: 0 0 auto) — 라벨처럼 텍스트 길이대로 딱 맞는 폭
 * - 'full': 남는 폭을 전부 차지(flex: 1 1 0%, size 를 안 준 기본값과 동일하지만 breakpoint
 *   객체 안에서 "여기서부터는 기본 동작으로 돌아간다"를 명시하고 싶을 때 쓴다)
 *
 * breakpoint별로 값을 바꾸고 싶으면 객체로 준다: { default: 'content', '761<': 'full' }
 * → 부모 FlexRow 의 실제 렌더 폭이 761px 이하가 되면 라벨이 값 위로 올라가는 식의 전환이
 * 가능하다. 미디어쿼리 기준값(761)은 CSS 로 표현할 수 없는 값이라(브라우저가 breakpoint
 * 자체를 CSS 변수로 받는 걸 지원하지 않음) FlexRow 가 ResizeObserver 로 관찰한 자신의 폭을
 * provide 해주고, 여기서 inject 해서 computed 로 매 렌더 판정한다.
 *
 * size 를 뭐로든 명시적으로 주면(숫자/'content'/'full' 전부) FlexCol 기본 min-width(20rem)를
 * 같이 꺼준다 — size 자체를 안 준 "완전 기본값" 만 그 20rem fluid-wrap 을 유지한다. 'full'도
 * 예외가 아니다: 라벨+값처럼 좁게 중첩된 row 안에서 'full'에 기본 min-width 가 남아있으면
 * 그 칸조차 옆에 못 붙고 자기도 따로 줄바꿈돼버려서 오히려 빈 틈이 생긴다(실측으로 확인됨).
 *
 * 주의: 숫자든 'content'든 flex-grow 가 0인 size 는 전부 "정확히 이 크기"만 뜻한다 — 옆 칸이
 * 내용 때문에(예: 안에 있는 input 의 min-width, 혹은 'content' 자신의 텍스트 길이) 강제로
 * 다음 줄로 밀려나도, 그 칸 스스로는 빈 자리를 메우려고 늘어나지 않는다(진짜 bootstrap 의
 * col-4 도 동일, 의도된 동작). 그래서 grow:0 인 size(숫자 또는 'content')를 섞어 쓰는 row 에는
 * 반드시 'full' 칸을 하나 이상 같이 둬야 한다 — 예: 고정 3 + 4 + 'full', 또는 라벨을
 * 'content' + 값을 'full'. 'full' 은 flex-grow:1 이라 강제개행으로 어느 줄에 남겨지든 그
 * 줄의 남는 공간을 알아서 흡수해 빈 틈을 없앤다. 프레임워크가 알아서 'full'을 끼워주진
 * 않으니, grow:0 size 만 나열하고 'full' 을 안 두면(예: 고정 4 + 4 + 4) 이 보장이 깨진다.
 */
type SizeKeyword = 'content' | 'full'
type SizeValue = number | SizeKeyword

interface Props {
  size?: SizeValue | Record<string, SizeValue>
}

const props = defineProps<Props>()

const rowWidth = inject(FLEX_ROW_WIDTH_KEY, ref(0))

const UNIT = 12

function resolveObjectSize(sizeMap: Record<string, SizeValue>, width: number): SizeValue | undefined {
  let defaultValue: SizeValue | undefined
  let bestThreshold = Infinity
  let bestValue: SizeValue | undefined

  for (const [key, value] of Object.entries(sizeMap)) {
    if (key === 'default') {
      defaultValue = value
      continue
    }
    const match = /^(\d+(?:\.\d+)?)<$/.exec(key.trim())
    if (!match) continue
    const threshold = Number(match[1])
    // width 가 여러 breakpoint 조건을 동시에 만족하면(예: 900<, 761< 둘 다 해당) 가장
    // 좁은(가장 구체적인) threshold 를 우선한다.
    if (width <= threshold && threshold < bestThreshold) {
      bestThreshold = threshold
      bestValue = value
    }
  }

  return bestValue ?? defaultValue
}

const colStyle = computed<StyleValue | undefined>(() => {
  if (props.size === undefined) return undefined
  const resolved = typeof props.size === 'object' ? resolveObjectSize(props.size, rowWidth.value) : props.size
  if (resolved === undefined) return undefined

  const flex =
    resolved === 'content' ? '0 0 auto' :
    resolved === 'full' ? '1 1 0%' :
    `0 0 ${(resolved / UNIT) * 100}%`

  return { flex, minWidth: '0' }
})
</script>

<template>
  <div :class="styles.col" :style="colStyle">
    <slot />
  </div>
</template>
