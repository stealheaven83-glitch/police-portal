<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

/**
 * -/+ 버튼으로 값을 증감시키는 숫자 스테퍼. 가운데 값은 직접 입력도 가능하다.
 */
interface Props {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  label?: string
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: -Infinity,
  max: Infinity,
  step: 1,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const canDecrease = computed(() => !props.disabled && props.modelValue - props.step >= props.min)
const canIncrease = computed(() => !props.disabled && props.modelValue + props.step <= props.max)

function clamp(n: number) {
  return Math.min(props.max, Math.max(props.min, n))
}

function decrease() {
  if (!canDecrease.value) return
  emit('update:modelValue', props.modelValue - props.step)
}

function increase() {
  if (!canIncrease.value) return
  emit('update:modelValue', props.modelValue + props.step)
}

/** 직접 입력 — 숫자(음수 포함)만 남긴다. 아직 값이 안 된 ''·'-' 는 blur 에서 정리. */
function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const cleaned = el.value.replace(/[^\d-]/g, '')
  if (cleaned !== el.value) el.value = cleaned
  if (cleaned === '' || cleaned === '-') return
  const n = Number(cleaned)
  if (Number.isNaN(n)) return
  emit('update:modelValue', clamp(n))
}

function onBlur(e: Event) {
  const el = e.target as HTMLInputElement
  const n = Number(el.value)
  const next = el.value === '' || Number.isNaN(n) ? clamp(props.modelValue) : clamp(n)
  el.value = String(next)
  if (next !== props.modelValue) emit('update:modelValue', next)
}
</script>

<template>
  <div
    :class="cn('inline-flex w-full h-10 items-center overflow-hidden rounded-sm border border-[var(--Border_input01)] bg-white', props.class)"
    role="group"
    :aria-label="label"
  >
    <button
      type="button"
      class="flex h-full w-9 items-center justify-center text-[var(--Text-body_1)] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--Border_primary)] disabled:cursor-not-allowed disabled:text-[var(--Text-body_disable)]"
      :disabled="!canDecrease"
      :aria-label="label ? `${label} 감소` : '감소'"
      @click="decrease"
    >
      <Minus class="size-4" />
    </button>
    <input
      type="text"
      inputmode="numeric"
      class="h-full min-w-9 flex-1 border-0 bg-transparent px-2 text-center text-[1.5rem] tabular-nums text-[var(--Text-body_1)] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--Border_primary)] disabled:cursor-not-allowed disabled:text-[var(--Text-body_disable)]"
      :value="modelValue"
      :disabled="disabled"
      :aria-label="label"
      @input="onInput"
      @blur="onBlur"
    >
    <button
      type="button"
      class="flex h-full w-9 shrink-0 items-center justify-center text-[var(--Text-body_1)] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--Border_primary)] disabled:cursor-not-allowed disabled:text-[var(--Text-body_disable)]"
      :disabled="!canIncrease"
      :aria-label="label ? `${label} 증가` : '증가'"
      @click="increase"
    >
      <Plus class="size-4" />
    </button>
  </div>
</template>
