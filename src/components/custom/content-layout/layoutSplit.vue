<template>
  <!-- class="default-theme"와 높이 지정(height)이 필수입니다 -->
  <splitpanes class="default-theme" style="height:900px" :class="cn(defaultClass, props.class)">
    <pane min-size="20">
      <div>왼쪽 영역</div>
    </pane>
    <pane>
      <div>오른쪽 영역</div>
    </pane>
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
}
const props = defineProps<Props>()
</script>

<style scoped>
@reference "@/assets/css/style.css";

:deep(.splitpanes__pane) {
  background-color: transparent !important;
}

:deep(.splitpanes__splitter) {
  border-left:0;
  border: 1px solid var(--Border_gray0);
}
</style>
