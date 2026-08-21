<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, useId } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'
import Textarea from '@/components/custom/textarea/Textarea.vue'
import { Label } from '@/components/ui/label'

import completeIcon from '@/assets/icon/icon_complete_message.svg?url'
import errorIcon from '@/assets/icon/icon_error_message.svg?url'

/**
 * 레이블 · 텍스트영역 · 도움말 · 에러 메시지를 하나로 묶은 필드 컴포넌트.
 * InputField2.vue 와 동일한 구성을 textarea 에 맞게 적용한 버전입니다.
 * - 기본 사용: label / placeholder / description / error 등을 props 로 전달
 * - Textarea 에 없는 native 속성(rows 등)은 그대로 전달됩니다.
 * - class 는 래퍼(필드 컨테이너), textareaClass 는 textarea 요소에 적용됩니다.
 */
defineOptions({ inheritAttrs: false })

interface Props {
  /** 입력 값 (v-model) */
  modelValue?: string | number
  /** 레이블 텍스트 */
  label?: string
  /** 필수 여부 (레이블에 * 표시) */
  required?: boolean
  /** 플레이스홀더 */
  placeholder?: string
  /** 도움말 [선택] */
  description?: string
  /** 에러 메시지 (값이 있으면 에러 상태로 표시) */
  error?: string
  /** 최대 입력 글자수 */
  maxlength?: number | string
  /** 글자수 카운터 표시 여부 */
  showCount?: boolean
  /** 비활성화 */
  disabled?: boolean
  /** 읽기 전용 */
  readonly?: boolean
  /** 필드 id (미지정 시 자동 생성) */
  id?: string
  /** 래퍼(필드 컨테이너)에 적용할 클래스 */
  class?: HTMLAttributes['class']
  /** textarea 요소에 적용할 클래스 */
  textareaClass?: HTMLAttributes['class']
  /** 텍스트영역 높이 (숫자 입력 시 px 자동 적용) */
  height?: string | number
  /** 레이블 옆에 표시할 날짜 텍스트 */
  date?: string

  //메세지 관련(textarea 아래)
  message?: string
  messageType?: 'complete' | 'error'

  //테두리 스타일 관련
  borderStyle?: 'complete' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  showCount: false,
  disabled: false,
  readonly: false,
  messageType: 'complete',
  height: '100%',
  
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

/** 현재 입력 글자수 */
const currentLength = computed(() => String(modelValue.value ?? '').length)

const messageStyleCss = () => {
  let css = 'text-[1.3rem] font-normal';
  if(props.messageType === 'complete'){
    css += ' text-[#00880B]'
  }else if(props.messageType === 'error'){
    css += ' text-[#BD2C0F]'
  }

  return css;
}

const borderStyleCss = computed(() => {
  if (props.borderStyle === 'complete') return 'border-[#00880B]'
  if (props.borderStyle === 'error') return 'border-[#BD2C0F] border-2'
  return undefined
})

/** height 값을 CSS 단위에 맞게 변환 */
const computedHeight = computed(() => {
  if (typeof props.height === 'number') {
    return `${props.height}px` // 숫자만 입력되면 px 자동 추가
  }
  return props.height // '100%', '200px' 등은 그대로 반환
})
</script>

<template>
  <div :class="cn('space-y-1.5', props.class)">
    <!-- 레이블 + 텍스트영역 -->
    <div class="space-y-1.5">
      <Label
        v-if="label || $slots.label"
        :for="fieldId"
        class="font-normal text-[1.5rem] mb-2"
      >
        <slot name="label">{{ label }}</slot>
        <span v-if="required" class="text-destructive">*</span>
        <span v-if="date" class="relative text-[var(--Text-body_2)] text-[1.3rem] leading-[1.5] pl-[24px] after:content-[''] after:block after:absolute after:left-[10px] after:top-[1.5px] after:w-px after:h-[1.6rem] after:bg-[var(--Border_gray0)]">{{ date }}</span>
      </Label>

      <!-- 도움말 [선택] -->
      <p v-if="description" class="mb-2 text-[var(--Text-body_1)] text-[1.3rem] font-normal">
        {{ description }}
      </p>

      <!-- 텍스트영역 (기본 Textarea 또는 #textarea 슬롯으로 대체) -->
      <slot name="textarea" :id="fieldId" :invalid="!!error">
        <div class="relative">
          <Textarea
            :id="fieldId"
            v-model="modelValue"
            :style="{ height: computedHeight }"
            :class="cn(borderStyleCss, textareaClass)"
            :placeholder="placeholder"
            :maxlength="maxlength"
            :disabled="disabled"
            :readonly="readonly"
            :aria-invalid="!!error || undefined"
            :aria-describedby="describedBy"
            v-bind="$attrs"
          />
          <div v-if="message" class="flex mt-2 gap-1 items-center" :class="messageStyleCss()">
            <img :src="messageType === 'complete' ? completeIcon : errorIcon" alt="" class="" />
            <p>{{message}}</p>
          </div>
        </div>
      </slot>
    </div>

    <!-- 하단 영역: 에러 메시지 + 글자수 카운터 -->
    <div
      v-if="error || showCount"
      class="flex items-start gap-2"
      :class="error ? 'justify-between' : 'justify-end'"
    >
      <p v-if="error" :id="`${fieldId}-error`" class="text-sm text-destructive">
        {{ error }}
      </p>
      <span v-if="showCount" class="shrink-0 text-xs text-muted-foreground">
        {{ currentLength }}<template v-if="maxlength"> / {{ maxlength }}</template>
      </span>
    </div>
  </div>
</template>
