<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, ref, useId } from 'vue'
import { useElementSize, useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'
import iconClear from '@/assets/icon/_delete.svg?url'
import Input from '@/components/custom/input/Input.vue'
import { Label } from '@/components/ui/label'

import completeIcon from '@/assets/icon/icon_complete_message.svg?url'
import errorIcon from '@/assets/icon/icon_error_message.svg?url'

/**
 * 레이블 · 입력 필드 · 도움말 · 알림 메시지를 하나로 묶은 입력 필드 컴포넌트.
 * - 기본 사용: label / placeholder / description / message+messageType 등을 props 로 전달
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
  /** 최대 입력 글자수 */
  maxlength?: number | string
  /** 글자수 카운터 표시 여부 */
  showCount?: boolean
  /**
   * 입력값 지우기(X) 버튼을 **둘지** 여부(기본 true).
   * 둔다고 늘 보이는 건 아니다 — 값이 있고 **포커스가 이 필드 안에 있을 때만** 보인다.
   * 아예 안 쓸 필드는 `:clearable="false"`.
   */
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

  labelClass?: HTMLAttributes['class']

  size?: 'lg' | 'md' | 'sm'


  //아이콘 관련
  icon?: string
  iconClass?: string
  /** true 면 아이콘을 클릭 가능한 버튼으로 만든다 (검색 실행 등). 클릭 시 icon-click 을 emit */
  search?: boolean
  /** search 일 때 아이콘 버튼의 접근성 이름 */
  iconLabel?: string

  //메세지 관련(input 아래)
  message?: string
  messageType?: 'complete' | 'error'

  //테두리 스타일 관련
  borderStyle?: 'complete' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
  labelPosition: 'left',
  required: false,
  showCount: false,
  clearable: true,
  disabled: false,
  readonly: false,
  size: 'lg',
  messageType: 'complete',
  search: false,
  iconLabel: '검색',
})

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
  /** search 일 때 아이콘 버튼 클릭 */
  (e: 'icon-click'): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, { passive: true })

/** 지정된 id 가 없으면 자동 생성 */
const uid = useId()
const fieldId = computed(() => props.id ?? `field-${uid}`)

/** aria-describedby: 도움말/알림 메시지 요소와 연결 */
const describedBy = computed(() => {
  const ids: string[] = []
  if (props.description) ids.push(`${fieldId.value}-desc`)
  if (props.message) ids.push(`${fieldId.value}-message`)
  return ids.length ? ids.join(' ') : undefined
})

/** borderStyle이 error일 때 실제 유효성 상태로 취급 */
const isInvalid = computed(() => props.borderStyle === 'error')

/** 입력값 지우기 */
function clear() {
  modelValue.value = ''
}

/**
 * 지우기(X) 버튼은 **포커스가 이 필드 안에 있을 때만** 보인다(2026-09-18).
 * focus/blur 가 아니라 focusin/focusout 을 쓴다 — 버블링되므로 자식인 <Input> 의 포커스를
 * 래퍼에서 한 번에 받는다.
 */
const fieldWrapRef = ref<HTMLElement | null>(null)
const isFocused = ref(false)

function onFocusIn() {
  isFocused.value = true
}

/**
 * 입력창에서 지우기 버튼으로 Tab 이동하는 사이에 꺼지면 버튼이 눈앞에서 사라진다.
 * 옮겨 갈 곳(relatedTarget)이 아직 이 필드 안이면 포커스가 나간 게 아니다.
 */
function onFocusOut(e: FocusEvent) {
  const next = e.relatedTarget as Node | null
  if (next && fieldWrapRef.value?.contains(next)) return
  isFocused.value = false
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

const messageStyleCss = computed(() => {
  let css = 'text-[1.3rem] font-normal';
  if(props.messageType === 'complete'){
    css += ' text-[#00880B]'
  }else if(props.messageType === 'error'){
    css += ' text-[#BD2C0F]'
  }

  return css;
})

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
        :class="cn('font-normal text-[1.5rem] text-[var(--Text-body_1)]', labelPosition === 'left' ? 'shrink-0 mr-3' : 'mb-2', labelClass)"
      >
        <slot name="label">{{ label }}</slot>
        <span v-if="required" class="text-destructive">*</span>
      </Label>

      <!-- 도움말 [선택] -->
      <p v-if="description && labelPosition !== 'left'" :id="`${fieldId}-desc`" class="mb-2 text-[var(--Text-body_1)] text-[1.3rem] font-normal">
        {{ description }}
      </p>

      <!-- 입력 필드 (기본 Input 또는 #input 슬롯으로 대체) -->
      <slot name="input" :id="fieldId" :invalid="isInvalid" :class="labelPosition === 'left' ? 'flex-1' : undefined">
        <!-- <div> -->
        <div :class="labelPosition === 'left' ? 'flex-1' : undefined">
          <div ref="fieldWrapRef" class="relative" @focusin="onFocusIn" @focusout="onFocusOut">
            <Input
              :id="fieldId"
              v-model="modelValue"
              :class="cn(borderStyleCss, inputClass)"
              :style="inputPaddingRight ? { paddingRight: `${inputPaddingRight}px` } : undefined"
              :placeholder="placeholder"
              :maxlength="maxlength"
              :disabled="disabled"
              :readonly="readonly"
              :aria-invalid="isInvalid || undefined"
              :aria-describedby="describedBy"
              v-bind="$attrs"
              :size="size"
            />
            <div
              ref="iconAreaRef"
              class="flex items-center absolute top-1/2 -translate-y-1/2 gap-2"
              :class="size === 'lg' ? 'right-4' : 'right-3'"
            >
              <!--
                포커스가 나가면 visibility 로만 감춘다(v-if 로 빼지 않는다) — DOM 에서 빠지면
                아래 useElementSize 가 잰 아이콘 영역 폭이 달라져 입력 글자가 좌우로 움찔한다.
                visibility:hidden 이라 감춰진 동안은 tab 순서·접근성 트리에서도 빠진다.
                @mousedown.prevent 가 없으면 누르는 순간 입력창이 blur → 버튼이 감춰져 click 이
                아예 발생하지 않는다.
              -->
              <button
                v-if="clearable && modelValue"
                type="button"
                class="flex flex-shrink"
                :class="[size === 'lg' ? 'size-6' : 'size-5', { invisible: !isFocused }]"
                aria-label="입력값 지우기"
                @mousedown.prevent
                @click="clear"
              >
                <img :src="iconClear" alt="" class="size-full" />
              </button>
              <!--
                search 면 클릭 가능한 버튼, 아니면 장식용 이미지.
                버튼 안 이미지는 alt 를 비우고 버튼에 aria-label 을 둬야 이름이 두 번 읽히지 않는다.
              -->
              <button
                v-if="icon && search"
                type="button"
                class="flex flex-shrink"
                :aria-label="iconLabel"
                :disabled="disabled"
                @click="emits('icon-click')"
              >
                <img :src="icon" alt="" :class="iconClass" />
              </button>
              <img v-else-if="icon" :src="icon" alt="" :class="iconClass" />
            </div>
          </div>
          <div v-if="message" :id="`${fieldId}-message`" class="flex mt-2 gap-1 items-center" :class="messageStyleCss">
            <img :src="messageType === 'complete' ? completeIcon : errorIcon" alt="" class="" />
            <p>{{message}}</p>
          </div>
        </div>
      </slot>
    </div>

    <!-- 하단 영역: 글자수 카운터 -->
    <div v-if="showCount" class="flex items-start gap-2 justify-end">
      <span class="shrink-0 text-xs text-muted-foreground">
        {{ currentLength }}<template v-if="maxlength"> / {{ maxlength }}</template>
      </span>
    </div>
  </div>
</template>