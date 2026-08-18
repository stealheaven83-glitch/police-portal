<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { Button as CustomBtn } from '.'
import { cn } from '@/lib/utils'

export interface ButtonCaseItem {
  /** v-for 키 및 클릭 이벤트 식별자 */
  key: string
  label?: string
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  disabled?: boolean
  icon?: Component
  class?: HTMLAttributes['class']
  /** 버튼 클릭 시 실행할 핸들러. 페이지마다 다른 동작을 그대로 넘기면 됩니다 */
  onClick?: (item: ButtonCaseItem) => void
}

interface Props {
  /** 페이지마다 다르게 구성하는 버튼 케이스 목록 */
  items: ButtonCaseItem[]
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const emit = defineEmits<{ click: [key: string, item: ButtonCaseItem] }>()

function handleClick(item: ButtonCaseItem) {
  if (item.disabled) return
  item.onClick?.(item)
  emit('click', item.key, item)
}
</script>

<template>
  <div :class="cn('flex flex-wrap items-center gap-2', props.class)">
    <CustomBtn
      v-for="item in items"
      :key="item.key"
      :variant="item.variant"
      :size="item.size"
      :disabled="item.disabled"
      :class="item.class"
      @click="handleClick(item)"
    >
      <component :is="item.icon" v-if="item.icon" />
      <slot :name="item.key" :item="item">{{ item.label }}</slot>
    </CustomBtn>
  </div>
</template>
