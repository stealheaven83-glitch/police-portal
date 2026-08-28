<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import FilterChip from './FilterChip.vue'

export interface FilterChipItem {
  /** v-model 값 및 클릭 이벤트 식별자 */
  key: string
  label: string
  /** 넘기지 않으면 그 칩엔 개수 표시를 하지 않는다 */
  count?: number
}

interface Props {
  items: FilterChipItem[]
  /** 현재 선택된 칩의 key (v-model) */
  modelValue: string
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>

<template>
  <div :class="cn('flex flex-wrap items-center gap-3', props.class)">
    <FilterChip
      v-for="item in items"
      :key="item.key"
      :label="item.label"
      :count="item.count"
      :active="modelValue === item.key"
      @click="emit('update:modelValue', item.key)"
    />
  </div>
</template>
