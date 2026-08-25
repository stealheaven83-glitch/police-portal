<template>
  <!-- class="default-theme" 는 splitpanes 기본 테마라 빼면 스플릿 바 형태가 깨집니다 -->
  <splitpanes
    class="default-theme splitLayout"
    :class="cn(defaultClass, !props.resizable && 'splitpanes--fixed', props.class)"
    :horizontal="isStacked"
    :maximize-panes="props.resizable && !isStacked"
  >
    <slot>
      <template v-for="i in props.count" :key="i">
        <pane
          v-if="$slots[`layout-${i}`]"
          :size="paneSize(i)"
          :min-size="minSizeOf(i)"
          :max-size="props.maxWidths?.[i - 1]"
        >
          <slot :name="`layout-${i}`" />
        </pane>
      </template>
    </slot>
  </splitpanes>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { cn } from '@/lib/utils'
import { Splitpanes, Pane } from 'splitpanes'
// CSS 파일을 반드시 불러와야 스플릿 바 형태가 깨지지 않고 제대로 보입니다!
import 'splitpanes/dist/splitpanes.css'
const defaultClass = 'w-full p-0'
interface Props {
  /** 래퍼 전체에 적용할 클래스 (기본 스타일을 덮어쓰고 싶을 때) */
  class?: HTMLAttributes['class']
  /** pane 개수. 각 pane은 layout-1, layout-2 ... layout-{count} 슬롯으로 채웁니다 */
  count?: number
  /** 각 pane의 처음 로드시 기본 width(%). 인덱스는 pane 순서(0 = layout-1)와 대응하며, 값이 없으면 기존과 동일하게 자동 분배됩니다 */
  widths?: number[]
  /** 각 pane의 최소 width(%). 값을 주지 않으면 첫 번째 pane만 20%가 적용됩니다 */
  minWidths?: (number | undefined)[]
  /** 각 pane의 최대 width(%). minWidths와 같은 값을 주면 해당 pane만 사이즈가 고정됩니다 */
  maxWidths?: (number | undefined)[]
  /** false면 스플리터 드래그/더블클릭 최대화가 막혀 모든 pane 사이즈가 고정됩니다 */
  resizable?: boolean
}
const props = withDefaults(defineProps<Props>(), { count: 1, resizable: true })

/*
 * 좁은 화면에서는 pane 을 좌우로 두면 각 pane 이 글자 몇 자 폭밖에 안 남는다.
 * 사이드메뉴가 사라지는 지점과 같은 폭에서 위아래로 쌓아 각 pane 이 전체 폭을 쓰게 한다.
 * (미디어쿼리의 rem 은 html font-size 가 아니라 초기값 16px 기준이라 CSS 쪽과 값을 맞춘다)
 */
const isStacked = useMediaQuery('(max-width: 82rem)')

/** 쌓인 상태에서는 가로 비율이 의미가 없어 pane 을 균등 높이로 나눈다 */
const paneSize = (i: number) => (isStacked.value ? undefined : props.widths?.[i - 1])

// minWidths를 안 넘긴 기존 사용처는 첫 번째 pane 20% 제한을 그대로 유지합니다.
const minSizeOf = (i: number) =>
  isStacked.value
    ? undefined
    : props.minWidths?.[i - 1] ?? (props.minWidths ? undefined : (i === 1 ? 20 : undefined))
</script>

<style scoped>
@reference "@/assets/css/style.css";

/*
 * 높이는 인라인 style 대신 여기서 잡는다. 화면마다 다른 높이가 필요하면 호출부가
 * module.css 클래스로 --split-height 를 덮어쓴다.
 *   .tallSplit { --split-height: 110rem; }
 *   <LayoutSplite :class="styles.tallSplit" />
 */
.splitLayout {
  height: var(--split-height, 90rem);
  margin-top: 2rem;
  border: 1px solid var(--Border_gray0);
  border-bottom: 0;
  border-radius: 1rem 1rem 0 0;
  overflow: hidden;
}

/* 위아래로 쌓이면 pane 하나가 가로 전체를 쓰는 대신 세로 공간이 더 필요하다 */
@media (max-width: 82rem) {
  .splitLayout {
    height: var(--split-height-stacked, 120rem);
  }
}

:deep(.splitpanes__pane) {
  background-color: transparent !important;
}

:deep(.splitpanes__splitter) {
  border-left:1px solid var(--Border_gray0)!important;
  border: 1px solid var(--Border_gray0);
}

/* 사이즈 조절 비활성화: 구분선은 그대로 두고 드래그만 막습니다 */
.splitpanes--fixed :deep(.splitpanes__splitter) {
  pointer-events: none;
  cursor: default;
}
</style>
