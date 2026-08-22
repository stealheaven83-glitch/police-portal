<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, ref, useId } from 'vue'
import { format as formatDate, isValid, parse as parseDate } from 'date-fns'
import { cn } from '@/lib/utils'
import InputField2 from '@/components/custom/input/InputField2.vue'
import Button from '@/components/custom/button/Button.vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { ko } from 'date-fns/locale'

// 라이브러리 기본 CSS 를 먼저 불러온 뒤 커스텀 CSS 를 얹어야 같은 우선순위 규칙을 덮어쓸 수 있다
import '@vuepic/vue-datepicker/dist/main.css'
import './DatePicker.css'

/**
 * InputField2 를 트리거(#dp-input)로, VueDatePicker 를 팝업 캘린더 엔진으로 쓰는 DatePicker.
 * - 닫혀있을 때는 InputField2 와 완전히 동일한 모양/동작 (label/description/message/borderStyle 등 그대로 전달)
 * - 달력 아이콘 클릭 시에만 팝업이 열림 (openMenu)
 * - class 는 래퍼(필드 컨테이너), inputClass 는 입력 요소에 적용됩니다.
 */
defineOptions({ inheritAttrs: false })

interface Props {
  /** 입력 값 (v-model) */
  modelValue?: string | number | Date | null
  /** 레이블 텍스트 */
  label?: string
  /** 레이블 위치 */
  labelPosition?: 'top' | 'left'
  /** 필수 여부 (레이블에 * 표시) */
  required?: boolean

  /** 도움말 [선택] */
  description?: string
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

  //메세지 관련(input 아래)
  message?: string
  messageType?: 'complete' | 'error'

  //테두리 스타일 관련
  borderStyle?: | 'error'

  //datepicker쪽
  format?: string
  placeholder?: string
  teleport?: boolean
  weekStart?: number
  /** 입력창 우측에 값 지우기(X) 버튼을 표시할지 여부 */
  clearable?: boolean
  /** 선택 가능한 최소/최대 날짜 */
  minDate?: Date | string
  maxDate?: Date | string
  /**
   * update:modelValue 로 내보낼 값의 형태.
   * - 'string' (기본) : valueFormat 문자열
   * - 'date'          : Date 객체 그대로
   */
  valueType?: 'string' | 'date'
  /** valueType 이 'string' 일 때 v-model 로 내보내는 문자열 형식 (달력 표시 형식인 format 과는 별개) */
  valueFormat?: string
}

const props = withDefaults(defineProps<Props>(), {
  labelPosition: 'left',
  required: false,
  disabled: false,
  readonly: false,
  size: 'lg',
  messageType: 'complete',
  clearable: false,
  valueType: 'string',
  valueFormat: 'yyyy-MM-dd'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | Date | null): void
}>()

/** modelValue(string | number | Date) -> Date. 파싱 실패 시 null */
function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') return null
  if (value instanceof Date) return isValid(value) ? value : null
  const date = typeof value === 'number' ? new Date(value) : parseDate(String(value), props.valueFormat, new Date())
  return isValid(date) ? date : null
}

const pickerValue = computed<Date | null>({
  get() {
    return toDate(props.modelValue)
  },
  set(value) {
    if (!value) {
      emit('update:modelValue', props.valueType === 'date' ? null : '')
      return
    }
    emit('update:modelValue', props.valueType === 'date' ? value : formatDate(value, props.valueFormat))
  }
})

/** "오늘" 버튼에서 updateInternalModelValue 호출용 (선택 확정 없이 임시 하이라이트만 이동) */
const vueDatePickerRef = ref<InstanceType<typeof VueDatePicker> | null>(null)

/** 지정된 id 가 없으면 자동 생성 */
const uid = useId()
const fieldId = computed(() => props.id ?? `field-${uid}`)

const iconCalendar = '/portal/asset/images/icon/ico_calendar.svg'
</script>

<template>
  <VueDatePicker
    ref="vueDatePickerRef"
    v-model="pickerValue"
    :teleport="true"
    :formats="{ input: format || 'yyyy-MM-dd' }"
    :placeholder="placeholder || 'YYYY.MM.DD'"
    :week-start="weekStart || 0"
    :locale="ko"
    :year-first="true"
    :time-config="{ enableTimePicker: false }"
    :input-attrs="{ clearable: false }"
    :disabled="disabled"
    :readonly="readonly"
    :min-date="minDate"
    :max-date="maxDate"
  >
    <template #dp-input="{ value, isMenuOpen }">
      <InputField2
        :id="fieldId"
        :model-value="value"
        readonly
        :label="label"
        :label-position="labelPosition"
        :required="required"
        :description="description"
        :class="props.class"
        :input-class="cn(inputClass, isMenuOpen ? 'border-[var(--Base-primary)] border-2' : undefined)"
        :label-class="labelClass"
        :size="size"
        :placeholder="placeholder || 'YYYY.MM.DD'"
        :icon="iconCalendar"
        :disabled="disabled"
        :border-style="borderStyle"
        :message="message"
        :message-type="messageType"
        :clearable="clearable"
        @update:model-value="pickerValue = null"
      />
    </template>

    <!-- 라이브러리 기본 action-row 대신 직접 구성 (오늘 왼쪽 / 취소·선택 오른쪽) -->
    <template #action-row="{ selectDate, closePicker }">
      <div class="flex items-center justify-between w-full">
        <button
          type="button"
          class="text-[1.5rem] text-[var(--Text-body_0)]"
          @click="vueDatePickerRef?.updateInternalModelValue(new Date())"
        >
          오늘
        </button>
        <div class="flex gap-2">
          <Button variant="tertiary2" size="sm" class="w-20" @click="closePicker">취소</Button>
          <Button variant="primary" size="sm" class="w-20" @click="selectDate">선택</Button>
        </div>
      </div>
    </template>
  </VueDatePicker>
</template>
