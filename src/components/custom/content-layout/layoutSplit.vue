<template>
  <!-- class="default-theme"와 높이 지정(height)이 필수입니다 -->
  <splitpanes class="default-theme mt-[20px] rounded-t-2xl overflow-hidden border border-b-0 border-[var(--Border_gray0)]" style="height:900px" :class="cn(defaultClass, props.class)">
    <slot>
      <template v-for="i in props.count" :key="i">
        <pane v-if="$slots[`layout-${i}`]" :size="props.widths?.[i - 1]" :min-size="i === 1 ? 20 : undefined">
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
}
const props = withDefaults(defineProps<Props>(), { count: 1 })
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
</style>
