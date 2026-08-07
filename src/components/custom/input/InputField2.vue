<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, ref, useId } from 'vue'
import { useElementSize, useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'
import iconClear from '@/assets/icon/_delete.svg'
import Input from '@/components/custom/input/Input.vue'
import { Label } from '@/components/ui/label'

import completeIcon from '@/assets/icon/icon_complete_message.svg'
import errorIcon from '@/assets/icon/icon_error_message.svg'

/**
 * 레이블 · 입력 필드 · 도움말 · 에러 메시지를 하나로 묶은 입력 필드 컴포넌트.
 * - 기본 사용: label / placeholder / description / error 등을 props 로 전달
 * - 복합 입력(전화번호, 이메일 등): #input 슬롯으로 입력 영역을 직접 구성
 * - Input 에 없는 native 속성(type, inputmode 등)은 그대로 전달됩니다.
 * - class 는 래퍼(필드 컨테이너), inputClass 는 입력 요소에 적용됩니다.
 */
defineOptions({ inheritAttrs: false })

interface Props {
  /** 입력 값 (v-model) */
  modelValue?: string | number
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
  /** 최대 입력 글자수 */
  maxlength?: number | string
  /** 글자수 카운터 표시 여부 */
  showCount?: boolean
  /** 입력값 지우기(X) 버튼 표시 여부 */
  clearable?: boolean
  /** 비활성화 */
  disabled?: boolean
  /** 읽기 전용 */
  readonly?: boolean
  /** 필드 id (미지정 시 자동 생성) */
  id?: string
  /** 래퍼(필드 컨테이너)에 적용할 클래스 */
  class?: HTMLAttributes['class']
  /** 입력 요소에 적용할 클래스 */
  inputClass?: HTMLAttributes['class']

  size?: 'lg' | 'md' | 'sm'


  //아이콘 관련
  icon?: string
  iconClass?: string

  //메세지 관련(input 아래)
  message?: string
  messageType?: 'complete' | 'error'

  //테두리 스타일 관련
  borderStyle?: 'complete' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
  labelPosition: 'top',
  required: false,
  showCount: false,
  clearable: false,
  disabled: false,
  readonly: false,
  size: 'lg',
  messageType: 'complete'
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

/** 입력값 지우기 */
function clear() {
  modelValue.value = ''
}

/** 아이콘 영역(X버튼 + 아이콘) 실측 폭만큼 입력창 오른쪽 여백 확보 */
const iconAreaRef = ref<HTMLElement | null>(null)
const { width: iconAreaWidth } = useElementSize(iconAreaRef)

const inputPaddingRight = computed(() => {
  if (!iconAreaWidth.value) return undefined
  const rightOffset = props.size === 'lg' ? 16 : 12 // right-4 / right-3
  return iconAreaWidth.value + rightOffset + 8 // 텍스트와의 여유 간격
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
</script>

<template>
  <div :class="cn('space-y-1.5', props.class)">
    <!-- 레이블 + 입력 필드 -->
    <div :class="labelPosition === 'left' ? 'flex items-center' : 'space-y-1.5'">
      <Label
        v-if="label || $slots.label"
        :for="fieldId"
        class="font-normal text-[1.5rem]"
        :class="labelPosition === 'left' ? 'shrink-0 mr-3' : 'mb-2'"
      >
        <slot name="label">{{ label }}</slot>
        <span v-if="required" class="text-destructive">*</span>
      </Label>

      <!-- 도움말 [선택] -->
      <p v-if="description && labelPosition !== 'left'" class="mb-2 text-[var(--Text-body_1)] text-[1.3rem] font-normal">
        {{ description }}
      </p>

      <!-- 입력 필드 (기본 Input 또는 #input 슬롯으로 대체) -->
      <slot name="input" :id="fieldId" :invalid="!!error">
        <div class="relative" :class="labelPosition === 'left' ? 'flex-1' : undefined">
          <Input
            :id="fieldId"
            v-model="modelValue"
            :class="cn(borderStyleCss, inputClass)"
            :style="inputPaddingRight ? { paddingRight: `${inputPaddingRight}px` } : undefined"
            :placeholder="placeholder"
            :maxlength="maxlength"
            :disabled="disabled"
            :readonly="readonly"
            :aria-invalid="!!error || undefined"
            :aria-describedby="describedBy"
            v-bind="$attrs"
          />
          <div
            ref="iconAreaRef"
            class="flex items-center absolute top-1/2 -translate-y-1/2 gap-2"
            :class="size === 'lg' ? 'right-4' : 'right-3'"
          >
            <button
              v-if="clearable && modelValue"
              type="button"
              class="flex flex-shrink"
              :class="size === 'lg' ? 'size-6' : 'size-5'"
              aria-label="입력값 지우기"
              @click="clear"
            >
              <img :src="iconClear" alt="" class="size-full" />
            </button>
            <img v-if="icon" :src="icon" alt="" :class="iconClass" />
          </div>
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