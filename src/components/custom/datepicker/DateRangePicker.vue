<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import DatePicker from './DatePicker.vue'

/**
 * 기간(시작일 ~ 종료일) 선택.
 * 화면마다 DatePicker 두 개와 '~' 를 직접 배치하던 걸 하나로 묶은 것.
 * 라벨을 감추더라도 각 입력에는 이름이 남아야 스크린리더가 어느 쪽인지 알 수 있어
 * fromLabel/toLabel 을 항상 붙이고 화면에서만 감춘다.
 */
interface Props {
  /** 시작일 (v-model:from) */
  from?: string
  /** 종료일 (v-model:to) */
  to?: string
  /** 왼쪽에 보이는 라벨. 비우면 라벨 없이 입력만 나온다 */
  label?: string
  /** 각 입력의 접근성 이름 (화면에는 보이지 않는다) */
  fromLabel?: string
  toLabel?: string
  size?: 'lg' | 'md' | 'sm'
  /** 각 DatePicker 입력에 적용할 클래스 */
  inputClass?: HTMLAttributes['class']
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  from: '',
  to: '',
  fromLabel: '시작일',
  toLabel: '종료일',
  size: 'sm',
  inputClass: 'w-40',
})

const emit = defineEmits<{
  (e: 'update:from', value: string): void
  (e: 'update:to', value: string): void
}>()

/* 템플릿에는 타입 표기를 두지 않는다(템플릿 파서가 TS 문법을 읽지 못한다) */
function onFromChange(value: unknown) {
  emit('update:from', String(value ?? ''))
}

function onToChange(value: unknown) {
  emit('update:to', String(value ?? ''))
}
</script>

<template>
  <div :class="cn('dateRange', props.class)">
    <span v-if="label" class="dateRangeLabel">{{ label }}</span>

    <DatePicker
      :model-value="from"
      :size="size"
      :input-class="inputClass"
      :disabled="disabled"
      :label="fromLabel"
      label-class="sr-only"
      class="space-y-0"
      @update:model-value="onFromChange"
    />

    <span aria-hidden="true">~</span>

    <DatePicker
      :model-value="to"
      :size="size"
      :input-class="inputClass"
      :disabled="disabled"
      :label="toLabel"
      label-class="sr-only"
      class="space-y-0"
      @update:model-value="onToChange"
    />
  </div>
</template>

<style scoped>
.dateRange {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
}

.dateRangeLabel {
  flex-shrink: 0;
  font-size: 1.5rem;
  color: var(--Text-body_0);
}
</style>
