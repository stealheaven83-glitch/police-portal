<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

/**
 * -/+ 버튼으로 값을 증감시키는 숫자 스테퍼.
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

function decrease() {
  if (!canDecrease.value) return
  emit('update:modelValue', props.modelValue - props.step)
}

function increase() {
  if (!canIncrease.value) return
  emit('update:modelValue', props.modelValue + props.step)
}
</script>

<template>
  <div
    :class="cn('inline-flex h-10 items-center overflow-hidden rounded-sm border border-[var(--Border_input01)] bg-white', props.class)"
    role="group"
    :aria-label="label"
  >
    <button
      type="button"
      class="flex h-full w-9 shrink-0 items-center justify-center text-[var(--Text-body_1)] disabled:cursor-not-allowed disabled:text-[var(--Text-body_disable)]"
      :disabled="!canDecrease"
      :aria-label="label ? `${label} 감소` : '감소'"
      @click="decrease"
    >
      <Minus class="size-4" />
    </button>
    <span
      class="flex h-full min-w-9 items-center justify-center border-x border-[var(--Border_input01)] px-2 text-[1.5rem] tabular-nums"
      aria-live="polite"
    >
      {{ modelValue }}
    </span>
    <button
      type="button"
      class="flex h-full w-9 shrink-0 items-center justify-center text-[var(--Text-body_1)] disabled:cursor-not-allowed disabled:text-[var(--Text-body_disable)]"
      :disabled="!canIncrease"
      :aria-label="label ? `${label} 증가` : '증가'"
      @click="increase"
    >
      <Plus class="size-4" />
    </button>
  </div>
</template>
