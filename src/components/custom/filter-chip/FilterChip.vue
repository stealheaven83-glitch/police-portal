<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { filterChipVariants } from '.'

/**
 * 필터 칩 하나. 보통은 FilterChipGroup 을 통해 items 배열로 여러 개를 한 번에 쓰지만,
 * 단독으로 칩 하나만 필요할 때도 쓸 수 있게 따로 내보낸다.
 */
interface Props {
  label: string
  /** 넘기지 않으면 개수 표시(괄호 숫자) 자체를 숨긴다 */
  count?: number
  active?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  count: undefined,
  active: false,
})
</script>

<template>
  <button type="button" :class="cn(filterChipVariants({ active }), props.class)">
    <span class="text-[1.5rem]" :class="active ? 'font-semibold text-[var(--Base-primary)]' : 'font-normal text-[#1E2124]'">
      {{ label }}
    </span>
    <span
      v-if="count !== undefined"
      class="text-[1.3rem]"
      :class="active ? 'font-semibold text-[var(--Base-primary)]' : 'font-normal text-[#464C53]'"
    >
      ({{ count }})
    </span>
  </button>
</template>
