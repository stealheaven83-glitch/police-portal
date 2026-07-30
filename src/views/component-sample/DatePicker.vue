<template>
  <div class="p-6">
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
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">년월일 선택</h2>
        <div class="text-gray-500">년, 월, 일까지 선택하는 기본 Date Picker 입니다.</div>
        <div class="flex flex-col gap-2">
          <div class="w-[280px]">
            <VueDatePicker
              v-model="fullDate"
              :enable-time-picker="false"
              :teleport="true"
              :locale="ko"
              format="yyyy년 MM월 dd일"
              :week-start="0"
              auto-apply
              placeholder="날짜를 선택하세요"
              select-text="선택"
              cancel-text="취소"
              now-button-label="오늘"
            />
          </div>
          <p v-if="fullDate" class="text-sm text-muted-foreground">
            선택된 날짜: {{ formatDate(fullDate) }}
          </p>
        </div>
      </section>

      <!-- Section 2: 년월 선택 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">년월 선택</h2>
        <div class="text-gray-500">년도와 월만 선택하는 Month Picker 입니다.</div>
        <div class="flex flex-col gap-2">
          <div class="w-[280px]">
            <VueDatePicker
              v-model="monthYear"
              month-picker
              :teleport="true"
              :locale="ko"
              format="yyyy년 MM월"
              auto-apply
              placeholder="년/월을 선택하세요"
              select-text="선택"
              cancel-text="취소"
            />
          </div>
          <p v-if="monthYear" class="text-sm text-muted-foreground">
            선택된 년월: {{ monthYear.year }}년 {{ monthYear.month + 1 }}월
          </p>
        </div>
      </section>

      <!-- Section 3: 년 선택 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">년 선택</h2>
        <div class="text-gray-500">년도만 선택하는 Year Picker 입니다.</div>
        <div class="flex flex-col gap-2">
          <div class="w-[280px]">
            <VueDatePicker
              v-model="yearValue"
              year-picker
              :teleport="true"
              :locale="ko"
              auto-apply
              placeholder="년도를 선택하세요"
              select-text="선택"
              cancel-text="취소"
            />
          </div>
          <p v-if="yearValue" class="text-sm text-muted-foreground">
            선택된 년도: {{ yearValue }}년
          </p>
        </div>
      </section>

      <!-- Section 4: 기간 선택 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">기간 선택</h2>
        <div class="text-gray-500">시작일과 종료일을 한 화면에서 한 번에 선택하는 Range Picker 입니다.</div>
        <div class="flex flex-col gap-2">
          <div class="w-[320px]">
            <VueDatePicker
              v-model="dateRange"
              :range="{ partialRange: false }"
              multi-calendars
              :enable-time-picker="false"
              :teleport="true"
              :locale="ko"
              format="yyyy년 MM월 dd일"
              :week-start="0"
              auto-apply
              placeholder="기간을 선택하세요"
              select-text="선택"
              cancel-text="취소"
              now-button-label="오늘"
            />
          </div>
          <p v-if="dateRange && dateRange.length === 2" class="text-sm text-muted-foreground">
            선택된 기간: {{ formatDate(dateRange[0]) }} ~ {{ formatDate(dateRange[1]) }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { ko } from 'date-fns/locale'
import '@vuepic/vue-datepicker/dist/main.css'

/**
 * 년월일 선택 - Date 객체를 v-model로 사용
 */
const fullDate = ref<Date | null>(null)

/**
 * 년월 선택 - { month: 0~11, year } 형태를 v-model로 사용
 */
const monthYear = ref<{ month: number; year: number } | null>(null)

/**
 * 년 선택 - 년도(number)를 v-model로 사용
 */
const yearValue = ref<number | null>(null)

/**
 * 기간 선택 - [시작일, 종료일] 형태의 Date 배열을 v-model로 사용
 */
const dateRange = ref<[Date, Date] | null>(null)

/**
 * 선택된 날짜를 대한민국 표기(2026년 7월 14일)로 변환
 */
const df = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Seoul',
})
const formatDate = (date: Date) => df.format(date)
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
