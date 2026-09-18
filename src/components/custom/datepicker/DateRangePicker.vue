<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
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
  /** PC(폭 1600 이상) 크기. 기본 `sm` */
  size?: 'lg' | 'md' | 'sm'
  /** 모바일(폭 1600 미만) 크기. 두 DatePicker 에 그대로 넘긴다 */
  moSize?: 'lg' | 'md' | 'sm'
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
  // size 기본값('sm')은 withDefaults 가 아니라 아래 pcSize 가 준다 — 여기서 채워 버리면
  // "size 를 안 줬다"와 "sm 을 줬다"가 구분되지 않아 mo-size 만 준 경우(모바일 전용)가
  // 반응형으로 잘못 걸린다
  inputClass: 'w-40',
})

/**
 * DatePicker 로 넘길 PC 크기.
 * - `size` 를 줬으면 그대로
 * - 안 줬는데 `mo-size` 만 있으면 **undefined 로 넘긴다** — 그래야 DatePicker 쪽에서
 *   "mo-size 만 준 경우 = 모든 폭에서 그 크기" 로 걸린다
 * - 둘 다 없으면 기존 기본값 'sm'
 */
const pcSize = computed(() => props.size ?? (props.moSize ? undefined : 'sm'))

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
  <div :class="cn('date-range', props.class)">
    <span v-if="label" class="date-range-label">{{ label }}</span>

    <DatePicker
      :model-value="from"
      :size="pcSize"
      :mo-size="moSize"
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
      :size="pcSize"
      :mo-size="moSize"
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
.date-range {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  /* 시작일 ~ 종료일 사이 8px. 공통 .group-gap2(--spacing 0.4rem × 2)와 같은 값이다 */
  gap: 0.8rem;
}

/*
 * 보이는 라벨은 InputField2·SelectField 의 왼쪽 라벨과 같은 값이어야 한다 —
 * 검색영역 한 줄에 [기간구분 ▾][기간 ○~○][성명 ___] 이 나란히 서기 때문이다.
 * 그쪽은 text-[1.5rem] text-[var(--Text-body_1)] + mr-3(1.2rem).
 * 여기서는 컨테이너 gap 이 0.8rem 이라 0.4rem 만 더해 1.2rem 을 맞춘다.
 */
.date-range-label {
  flex-shrink: 0;
  font-size: 1.5rem;
  color: var(--Text-body_1);
  margin-right: 0.4rem;
}
</style>
