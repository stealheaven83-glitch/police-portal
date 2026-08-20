<script setup lang="ts">
import { ref } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { ko } from 'date-fns/locale'
import '@vuepic/vue-datepicker/dist/main.css'
import './DatePicker.css'
// const date = ref();

/*년월일 선택 - Date 객체를 v-model로 사용*/
const fullDate = ref<Date | null>(null)

// /* 년월 선택 - { month: 0~11, year } 형태를 v-model로 사용 */
// const monthYear = ref<{ month: number; year: number } | null>(null)

// /* 년 선택 - 년도(number)를 v-model로 사용 */
// const yearValue = ref<number | null>(null)

// /* 기간 선택 - [시작일, 종료일] 형태의 Date 배열을 v-model로 사용 */
// const dateRange = ref<[Date, Date] | null>(null)

/* 선택된 날짜를 대한민국 표기(2026년 7월 14일)로 변환 */
const df = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Seoul',
})
const formatDate = (date: Date) => df.format(date)
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)

interface Props {
  type?: 'single' | 'range'
  modelValue?: string | [string, string] // single일 땐 string, range일 땐 [시작일, 종료일]
  placeholder?: string
  startPlaceholder?: string
  endPlaceholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'single',
  modelValue: '',
  placeholder: 'YYYY.MM.DD',
  startPlaceholder: '시작일 선택',
  endPlaceholder: '종료일 선택',
})

// Emits 정의 (v-model 연결용)
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | [string, string]): void
}>()

</script>

<template>
  <div class="container p-6 bg-white rounded-lg min-h-[calc(100vh-200px)]">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Date Picker 샘플</h1>
    </div>

    <div class="text-gray-500 pb-10">
      <a href="https://github.com/Vuepic/vue-datepicker" target="_blank" class="text-primary underline underline-offset-4">
        @vuepic/vue-datepicker
      </a>
      를 이용한 Date Picker 예시 페이지입니다. 대한민국(ko) 로케일과 Asia/Seoul 타임존이 적용되어 있습니다.
    </div>

    <!-- Section 1: 년월일 선택 -->
    <section>
      <div class="w-[160px] box date-calendar">
        <div class="style"><!-- module.css형태로 할경우 :class="style.class" 스타일 지정 -->
        <VueDatePicker
          v-model="fullDate"
          :enable-time-picker="false"
          :teleport="true"
          format="yyyy년 MM월 dd일"
          now-button-label="오늘"
          :week-start="0"
          auto: true,
          placeholder="YYYY.MM.DD"
          select-text="선택"
          cancel-text="취소"
          year-suffix="년"
          :locale="ko"
          :clearable="false"
          :time-config="{ enableTimePicker: false }">
          <template #input-icon>
            <img src="../../../../public/portal/asset/images/icon/ico_calendar.svg" alt="달력" />
          </template>
        </VueDatePicker>
        </div>
      </div>
      <p v-if="fullDate" class="text-sm text-muted-foreground">
        선택된 날짜: {{ formatDate(fullDate) }}
      </p>
    </section>

    <section>
      <!-- 시작일과 종료일을 가로로 배치 (flex row) -->
      <div class="flex items-center gap-2">
          <!-- 1. 시작일 Picker -->
          <div class="w-[160px]">
            <VueDatePicker
              v-model="startDate"
              :max-date="endDate || undefined"
              :enable-time-picker="false"
              :teleport="true"
              :locale="ko"
              format="yyyy년 MM월 dd일"
              select-text="선택"
              cancel-text="취소"
              placeholder="시작일 선택"
              prevent-min-max-navigation
              :clearable="false"
              year-first 
              :time-config="{ enableTimePicker: false }"
              >
              <template #input-icon>
                <img src="../../../../public/portal/asset/images/icon/ico_calendar.svg" alt="달력" />
              </template>
            </VueDatePicker>
          </div>

          <span class="text-gray-500">~</span>

          <!-- 2. 종료일 Picker -->
          <div class="w-[160px]">
            <VueDatePicker
              v-model="endDate"
              :min-date="startDate || undefined"
              :enable-time-picker="false"
              :teleport="true"
              :locale="ko"
              format="yyyy년 MM월 dd일"
              select-text="선택"
              cancel-text="취소"
              placeholder="종료일 선택"
              prevent-min-max-navigation
              year-first
              :time-config="{ enableTimePicker: false }">
              <template #input-icon>
                <img src="../../../../public/portal/asset/images/icon/ico_calendar.svg" alt="달력" />
              </template>
            </VueDatePicker>
          </div>
      </div>
    </section>
  </div>
</template>


<style scoped>
section {
  margin-top:20px;
}
</style>
