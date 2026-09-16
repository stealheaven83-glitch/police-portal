<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, useId } from 'vue'
import { useVModel } from '@vueuse/core'
import { ChevronDown } from 'lucide-vue-next'
import { SelectIcon, SelectTrigger as SelectTriggerPrimitive } from 'reka-ui'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

import completeIcon from '@/assets/icon/icon_complete_message.svg?url'
import errorIcon from '@/assets/icon/icon_error_message.svg?url'

/**
 * 레이블 · 셀렉트 박스 · 도움말 · 에러 메시지를 하나로 묶은 셀렉트 필드 컴포넌트.
 * - 기본 사용: label / placeholder / options 등을 props 로 전달
 * - 옵션 구성을 직접 하고 싶다면 #options 슬롯으로 SelectItem 을 구성
 * - class 는 래퍼(필드 컨테이너), triggerClass 는 트리거(선택 영역)에 적용됩니다.
 * - InputField2 와 동일한 형태(레이블 위치 / 사이즈 / 테두리·메시지 상태)를 갖도록 구성했습니다.
 */
defineOptions({ inheritAttrs: false })

interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  /** 선택 값 (v-model) */
  modelValue?: string | number
  /** 옵션 목록 */
  options?: SelectOption[]
  /** 레이블 텍스트 */
  label?: string
  /** 레이블 위치 */
  labelPosition?: 'top' | 'left'
  /** 필수 여부 (레이블에 * 표시) */
  required?: boolean
  /** 플레이스홀더 */
  placeholder?: string
  /** 도움말 [선택] */
  description?: string
  /** 에러 메시지 (값이 있으면 에러 상태로 표시) */
  error?: string
  /** 비활성화 */
  disabled?: boolean
  /** 필드 id (미지정 시 자동 생성) */
  id?: string
  /** 래퍼(필드 컨테이너)에 적용할 클래스 */
  class?: HTMLAttributes['class']
  /** 트리거(선택 영역)에 적용할 클래스 */
  triggerClass?: HTMLAttributes['class']
  /** 레이블에 적용할 클래스 (sr-only 로 감출 때 등). InputField2·DatePicker 와 동일 */
  labelClass?: HTMLAttributes['class']

  size?: 'lg' | 'md' | 'sm' | 'xs'

  //메세지 관련(select 아래)
  message?: string
  messageType?: 'complete' | 'error'

  //테두리 스타일 관련
  borderStyle?: 'complete' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  labelPosition: 'left',
  required: false,
  disabled: false,
  size: 'lg',
  messageType: 'complete',
})

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, { passive: true })

/** 지정된 id 가 없으면 자동 생성 */
const uid = useId()
const fieldId = computed(() => props.id ?? `field-${uid}`)

/** aria-describedby: 도움말/에러 요소와 연결 */
const describedBy = computed(() => {
  const ids: string[] = []
  if (props.description) ids.push(`${fieldId.value}-desc`)
  if (props.error) ids.push(`${fieldId.value}-error`)
  return ids.length ? ids.join(' ') : undefined
})

const messageStyleCss = () => {
  let css = 'text-[1.3rem] font-normal'
  if (props.messageType === 'complete') {
    css += ' text-[var(--success)]'
  } else if (props.messageType === 'error') {
    css += ' text-[var(--danger)]'
  }
  return css
}

const borderStyleCss = computed(() => {
  if (props.borderStyle === 'complete') return 'border-[var(--success)]'
  if (props.borderStyle === 'error') return 'border-[var(--danger)] border-2'
  return undefined
})

/** 사이즈별 트리거 스타일 (Input 과 동일한 기준) */
const sizeClass = computed(() => {
  if (props.size === 'md') return 'h-12 text-[1.5rem] pl-4 pr-3 rounded-sm'
  if (props.size === 'sm') return 'h-10 text-[1.5rem] pl-4 pr-3 rounded-sm'
  if (props.size === 'xs') return 'h-9 text-[1.3rem] px-3 rounded-sm'
  return 'h-14 text-[1.9rem] pl-4 pr-3 rounded-md'
})

const iconSizeClass = computed(() => {
  if (props.size === 'lg') return 'size-6'
  if (props.size === 'xs') return 'size-4'
  return 'size-5'
})
</script>

<template>
  <div :class="cn('space-y-1.5', props.class)">
    <!-- 레이블 + 셀렉트 -->
    <div :class="labelPosition === 'left' ? 'flex items-center' : 'space-y-1.5'">
      <Label
        v-if="label || $slots.label"
        :for="fieldId"
        :class="cn('font-normal text-[1.5rem]', labelPosition === 'left' ? 'shrink-0 mr-3' : 'mb-2', props.labelClass)"
      >
        <slot name="label">{{ label }}</slot>
        <span v-if="required" class="text-destructive">*</span>
      </Label>

      <!-- 도움말 [선택] -->
      <p v-if="description && labelPosition !== 'left'" class="mb-2 text-[var(--Text-body_1)] text-[1.3rem] font-normal">
        {{ description }}
      </p>

      <!-- 셀렉트 -->
      <div class="relative" :class="labelPosition === 'left' ? 'flex-1' : undefined">
        <Select
          :model-value="modelValue"
          :disabled="disabled"
          @update:model-value="(v: any) => (modelValue = v)"
        >
          <SelectTriggerPrimitive
            :id="fieldId"
            data-slot="select-trigger"
            :class="cn(
              'group flex w-full items-center justify-between gap-2 border bg-white font-normal outline-none',
              'border-[var(--Border_input01)]',
              'data-[placeholder]:text-[var(--Text-body_disable)]',
              'focus-visible:border-[var(--Border_primary)] focus-visible:border-2',
              'data-[state=open]:border-[var(--Border_primary)] data-[state=open]:border-2',
              'disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[var(--disabled-input-border)] disabled:bg-[var(--disabled-input-bg)] disabled:text-[var(--disabled-input-text-color)]',
              sizeClass,
              borderStyleCss,
              triggerClass,
            )"
            :aria-invalid="!!error || undefined"
            :aria-describedby="describedBy"
            v-bind="$attrs"
          >
            <SelectValue :placeholder="placeholder" />
            <SelectIcon as-child>
              <ChevronDown :class="cn('text-[var(--icon-gray)] group-disabled:text-[var(--icon-disabled)] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180', iconSizeClass)" />
            </SelectIcon>
          </SelectTriggerPrimitive>

          <SelectContent :body-lock="false">
            <slot name="options">
              <SelectItem
                v-for="opt in options"
                :key="opt.value"
                :value="opt.value"
                :disabled="opt.disabled"
              >
                {{ opt.label }}
              </SelectItem>
            </slot>
          </SelectContent>
        </Select>

        <div v-if="message" class="flex mt-2 gap-1 items-center" :class="messageStyleCss()">
          <img :src="messageType === 'complete' ? completeIcon : errorIcon" alt="" />
          <p>{{ message }}</p>
        </div>
      </div>
    </div>

    <!-- 하단 영역: 에러 메시지 -->
    <div v-if="error" class="flex items-start gap-2 justify-between">
      <p :id="`${fieldId}-error`" class="text-sm text-destructive">
        {{ error }}
      </p>
    </div>
  </div>
</template>
