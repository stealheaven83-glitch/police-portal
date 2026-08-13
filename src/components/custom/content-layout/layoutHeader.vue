<template>
  <div :class="cn(defaultClass, props.class)">
    <strong class="text-[var(--Text-body_0)] text-[1.9rem] font-semibold leading-normal">
      <slot name="title">{{ title }}</slot>
    </strong>
    <div>
      <slot name="center"/>
    </div>
    <div class="flex items-center gap-2">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  /** 좌측 타이틀 텍스트 (title 슬롯을 쓰면 무시됩니다) */
  title?: string
  /** 래퍼 전체에 적용할 클래스 (기본 스타일을 덮어쓰고 싶을 때) */
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const defaultClass = 'bg-[var(--Background-gray01)] flex items-center justify-between py-[1rem] px-[1.5rem] border-b border-solid h-[60px] border-[var(--Border_gray02)]'
</script>
