<template>
  <!-- class="default-theme"와 높이 지정(height)이 필수입니다 -->
  <splitpanes
    class="default-theme mt-[20px] rounded-t-2xl overflow-hidden border border-b-0 border-[var(--Border_gray0)]"
    style="height:900px"
    :class="cn(defaultClass, !props.resizable && 'splitpanes--fixed', props.class)"
    :maximize-panes="props.resizable"
  >
    <slot>
      <template v-for="i in props.count" :key="i">
        <pane
          v-if="$slots[`layout-${i}`]"
          :size="props.widths?.[i - 1]"
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

// minWidths를 안 넘긴 기존 사용처는 첫 번째 pane 20% 제한을 그대로 유지합니다.
const minSizeOf = (i: number) => props.minWidths?.[i - 1] ?? (props.minWidths ? undefined : (i === 1 ? 20 : undefined))
</script>

<style scoped>
@reference "@/assets/css/style.css";

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
