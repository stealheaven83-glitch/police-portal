<template>
  <div class="lp-stepper">
    <button
      type="button"
      class="lp-stepper-btn"
      :disabled="disabled || modelValue <= min"
      :aria-label="`${ariaLabel} 줄이기`"
      @click="step(-stepBy)"
    >
      －
    </button>
    <span class="lp-stepper-value">{{ modelValue }}</span>
    <button
      type="button"
      class="lp-stepper-btn"
      :disabled="disabled || modelValue >= max"
      :aria-label="`${ariaLabel} 늘리기`"
      @click="step(stepBy)"
    >
      ＋
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * 숫자 증감 입력(− 값 ＋). Figma 의 근무일지 화면들에 반복해서 나오는 형태다.
 * 값은 v-model 로 주고받고, 범위를 벗어나면 버튼이 비활성된다.
 */
interface Props {
  modelValue: number
  min?: number
  max?: number
  /** 한 번 눌렀을 때 움직이는 폭 */
  stepBy?: number
  disabled?: boolean
  /** 접근성 이름 (예: '교대 수') */
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 99,
  stepBy: 1,
  disabled: false,
  ariaLabel: '값',
})

const emit = defineEmits<{ (e: 'update:modelValue', value: number): void }>()

function step(delta: number) {
  const next = Math.min(props.max, Math.max(props.min, props.modelValue + delta))
  emit('update:modelValue', next)
}
</script>
