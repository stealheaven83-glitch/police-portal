<template>
  <div :class="cn(defaultClass, props.class)">
    <div class="flex flex-col justify-center">
      <slot name="form" />
    </div>
    <div class="flex items-end">
      <slot name="btns" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  /** 래퍼 전체에 적용할 클래스 (기본 스타일을 덮어쓰고 싶을 때) */
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const defaultClass = 'w-full flex justify-between items-stretch bg-[var(--Background-gray01)] py-5 px-6 rounded-[12px]'
</script>



<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
