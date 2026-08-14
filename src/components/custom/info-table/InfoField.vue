<script setup lang="ts">
import { computed, useId } from 'vue'
import { cn } from '@/lib/utils'
import styles from './InfoTable.module.css'

/**
 * InfoTable 안에서 쓰는 라벨+값 한 칸.
 * - `for` 를 주면 단일 입력 요소와 연결되는 진짜 <label for> 로 렌더링한다.
 * - `for` 가 없으면(체크박스+드롭다운 조합처럼 값 영역에 컨트롤이 여러 개인 경우)
 *   라벨은 <span id>, 값 영역은 role="group" aria-labelledby 로 묶어 접근성을 유지한다.
 */
interface Props {
  label?: string
  for?: string
  full?: boolean
  layout?: 'row' | 'column'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'row',
})

const uid = useId()
const labelId = computed(() => `info-field-label-${uid}`)
</script>

<template>
  <div :class="cn(styles.field, props.full && styles.fieldFull, props.class)">
    <label v-if="props.for" :class="styles.label" :for="props.for">
      <slot name="label">{{ label }}</slot>
    </label>
    <span v-else :class="styles.label" :id="labelId">
      <slot name="label">{{ label }}</slot>
    </span>

    <div
      :class="layout === 'column' ? styles.controlColumn : styles.control"
      v-bind="!props.for ? { role: 'group', 'aria-labelledby': labelId } : {}"
    >
      <slot />
    </div>
  </div>
</template>
