<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg min-h-[calc(100vh-200px)]">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">DatePicker 샘플</h1>
      </div>

      <div class="text-gray-500 pb-10">
        <span class="text-primary font-medium">InputField2</span> 를 트리거로,
        <span class="text-primary font-medium">VueDatePicker</span> 를 팝업 캘린더 엔진으로 쓰는 커스텀 DatePicker 컴포넌트 예시 페이지입니다.
      </div>

      <!-- Section 1: 기본 -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">기본</h2>
        <div class="text-gray-500">
          <code>v-model</code> 로 값을 바인딩합니다. 기본 출력 형식은 <code>yyyy-MM-dd</code> 문자열입니다.
        </div>

        <div class="w-[360px]">
          <DatePicker v-model="basicValue" label="날짜" placeholder="YYYY.MM.DD" />
        </div>
        <p class="text-sm text-gray-500">선택된 값: {{ basicValue || '(없음)' }}</p>
      </section>

      <!-- Section 2: 필수 + 도움말 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">필수 · 도움말</h2>
        <div class="text-gray-500">
          <code>required</code> 로 레이블에 * 표시를, <code>description</code> 으로 도움말을 붙일 수 있습니다.
        </div>

        <div class="w-[360px]">
          <DatePicker
            v-model="requiredValue"
            label="계약일"
            required
            description="계약을 체결한 날짜를 선택해 주세요."
          />
        </div>
      </section>

      <!-- Section 3: 라벨 위치 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">레이블 위치</h2>
        <div class="text-gray-500"><code>label-position</code> 으로 레이블을 좌측/상단에 배치합니다.</div>

        <div class="flex gap-10">
          <div class="w-[360px]">
            <DatePicker v-model="labelLeftValue" label="좌측 레이블" label-position="left" />
          </div>
          <div class="w-[360px]">
            <DatePicker v-model="labelTopValue" label="상단 레이블" label-position="top" />
          </div>
        </div>
      </section>

      <!-- Section 4: 사이즈 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">사이즈</h2>
        <div class="text-gray-500"><code>size</code> 로 lg(기본) · md · sm 크기를 선택합니다.</div>

        <div class="flex flex-col gap-3 w-[360px]">
          <DatePicker v-model="sizeLgValue" label="lg" size="lg" />
          <DatePicker v-model="sizeMdValue" label="md" size="md" />
          <DatePicker v-model="sizeSmValue" label="sm" size="sm" />
        </div>
      </section>

      <!-- Section 5: 값 지우기 버튼 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">값 지우기(X) 버튼</h2>
        <div class="text-gray-500"><code>clearable</code> 로 입력창 우측에 값 지우기 버튼을 표시합니다.</div>

        <div class="w-[360px]">
          <DatePicker v-model="clearableValue" label="퇴사일" clearable />
        </div>
      </section>

      <!-- Section 6: 선택 가능 범위 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">선택 가능 범위</h2>
        <div class="text-gray-500"><code>min-date</code> / <code>max-date</code> 로 선택 가능한 날짜 범위를 제한합니다.</div>

        <div class="w-[360px]">
          <DatePicker
            v-model="rangeValue"
            label="예약일"
            :min-date="minDate"
            :max-date="maxDate"
            description="오늘부터 30일 이내로만 선택할 수 있습니다."
          />
        </div>
      </section>

      <!-- Section 7: 출력 형식(valueType/format) -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">출력 형식</h2>
        <div class="text-gray-500">
          <code>format</code> 은 입력창에 표시되는 형식, <code>value-format</code> 은 <code>v-model</code> 로 내보내는 문자열 형식입니다.
          <code>value-type="date"</code> 를 주면 문자열 대신 <code>Date</code> 객체 그대로 내보냅니다.
        </div>

        <div class="flex gap-10">
          <div class="w-[360px]">
            <DatePicker
              v-model="dotFormatValue"
              label="점(.) 구분 표시"
              format="yyyy.MM.dd"
              value-format="yyyy.MM.dd"
            />
          </div>
          <div class="w-[360px]">
            <DatePicker v-model="dateTypeValue" label="Date 객체로 출력" value-type="date" />
          </div>
        </div>
        <p class="text-sm text-gray-500">
          점 구분 값: {{ dotFormatValue || '(없음)' }} / Date 타입 값: {{ dateTypeValue ? String(dateTypeValue) : '(없음)' }}
        </p>
      </section>

      <!-- Section 8: 상태 -->
      <section class="space-y-4 pt-10">
        <h2 class="text-2xl font-semibold">상태</h2>
        <div class="text-gray-500">비활성화(disabled)와 읽기 전용(readonly) 상태 예시입니다.</div>

        <div class="flex gap-6">
          <div class="w-[220px]">
            <DatePicker label="비활성화" disabled />
          </div>
          <div class="w-[220px]">
            <DatePicker label="읽기 전용" model-value="2026-01-01" readonly />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'

const basicValue = ref('')
const requiredValue = ref('')

const labelLeftValue = ref('')
const labelTopValue = ref('')

const sizeLgValue = ref('')
const sizeMdValue = ref('')
const sizeSmValue = ref('')

const clearableValue = ref('2026-03-02')

const today = new Date()
const minDate = today
const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)
const rangeValue = ref('')

const dotFormatValue = ref('')
const dateTypeValue = ref<Date | null>(null)
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

code {
  font-size: 0.85em;
  background: var(--muted);
  color: var(--foreground);
  padding: 0.05rem 0.3rem;
  border-radius: 0.25rem;
}
</style>
