<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, provide } from 'vue'
import styles from './FlexGrid.module.css'
import { FLEX_ROW_WIDTH_KEY } from './flexGridContext'

/**
 * flex 컨테이너 한 줄. 자식 FlexCol 들은 전부 flex-basis 0%(flex:1 1 0%)라서 개수를
 * 몇 개로 쓰든(3등분/7등분 등) 계산 없이 항상 자동 균등분할된다.
 * FlexCol 안에 FlexRow 를 다시 중첩하면(FlexCol > FlexRow > FlexCol...) 바깥 행의 분할과
 * 무관하게 그 안에서 독립적으로 다시 등분된다 — 각 FlexRow 는 자신만의 flex 컨텍스트라서
 * "라벨+값 같은 묶음을 통째로 다음 줄로 떨어뜨리기"가 별도 처리 없이 그대로 된다.
 *
 * 자신의 실제 렌더 폭을 ResizeObserver 로 관찰해 하위 FlexCol 에 provide 한다 — FlexCol 의
 * size prop 이 breakpoint 객체({ default, '761<' 등})일 때 이 폭을 기준으로 값을 고른다.
 * 행마다 한 번만 관찰하고 그 결과를 자식들이 공유하므로, FlexCol 개수만큼 옵저버가 늘어나지 않는다.
 */
const rootEl = ref<HTMLElement | null>(null)
const width = ref(0)

provide(FLEX_ROW_WIDTH_KEY, width)

let observer: ResizeObserver | undefined

onMounted(() => {
  if (!rootEl.value) return
  observer = new ResizeObserver((entries) => {
    width.value = entries[0]?.contentRect.width ?? 0
  })
  observer.observe(rootEl.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div ref="rootEl" :class="styles.row">
    <slot />
  </div>
</template>
