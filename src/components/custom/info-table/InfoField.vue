<script setup lang="ts">
import { computed, useId, useSlots, Comment, Text } from 'vue'
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

const slots = useSlots()

/**
 * 값 영역에 컨트롤 없이 글자만 들어왔는지 판별한다.
 * 글자만 있으면 페이지마다 span 에 클래스를 붙이지 않아도 공통 텍스트 스타일이 자동으로 붙는다.
 * (슬롯 내용은 반응형 소스가 아니라 computed 로 캐싱하면 갱신되지 않으므로 렌더마다 계산한다)
 */
function isTextOnly() {
  const nodes = slots.default?.() ?? []
  const meaningful = nodes.filter(
    (node) => node.type !== Comment && !(node.type === Text && !String(node.children ?? '').trim()),
  )
  return meaningful.length > 0 && meaningful.every((node) => node.type === Text)
}
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
      <span v-if="isTextOnly()" :class="styles['info-table-txt']"><slot /></span>
      <slot v-else />
    </div>
  </div>
</template>
