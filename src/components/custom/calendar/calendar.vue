<template>
  <div class="calendar-container">
    <div class="calendar-toolbar">
      <div class="nav-group" role="group" aria-label="연도 이동">
        <button type="button" class="nav-btn" aria-label="이전 연도" @click="goYear(-1)">
          <ChevronLeft :size="16" />
        </button>
        <span class="nav-label">{{ currentYear }}</span>
        <button type="button" class="nav-btn" aria-label="다음 연도" @click="goYear(1)">
          <ChevronRight :size="16" />
        </button>
      </div>

      <div class="nav-group" role="group" aria-label="월 이동">
        <button type="button" class="nav-btn" aria-label="이전 달" @click="goMonth(-1)">
          <ChevronLeft :size="16" />
        </button>
        <span class="nav-label">{{ currentMonth }}월</span>
        <button type="button" class="nav-btn" aria-label="다음 달" @click="goMonth(1)">
          <ChevronRight :size="16" /> 
        </button>
      </div>

      <span v-if="currentView === 'timeGridWeek'" class="nav-label nav-label--week">{{ currentWeekOfMonth }}주</span>

      <div class="view-toggle" role="group" aria-label="보기 방식">
        <button
          type="button"
          class="view-btn"
          :class="{ 'view-btn--active': currentView === 'dayGridMonth' }"
          :aria-pressed="currentView === 'dayGridMonth'"
          @click="changeView('dayGridMonth')"
        >
          월간
        </button>
        <button
          type="button"
          class="view-btn"
          :class="{ 'view-btn--active': currentView === 'timeGridWeek' }"
          :aria-pressed="currentView === 'timeGridWeek'"
          @click="changeView('timeGridWeek')"
        >
          주간
        </button>
      </div>

      <Popover v-model:open="legendOpen">
        <PopoverTrigger as-child>
          <button type="button" class="info-btn" aria-label="범례 보기">
            <Info :size="18" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" class="legend-content">
          <div class="legend-head">
            <span class="legend-title">예약처리상황</span>
            <button type="button" class="legend-close" aria-label="닫기" @click="legendOpen = false">
              <X :size="16" />
            </button>
          </div>
          <ul class="legend-list">
            <li v-for="cat in categoryList" :key="cat.id" class="legend-item">
              <span class="legend-dot" :style="{ backgroundColor: cat.dot }" aria-hidden="true" />
              {{ cat.label }}
            </li>
          </ul>
        </PopoverContent>
      </Popover>
    </div>

    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ChevronLeft, ChevronRight, Info, X } from 'lucide-vue-next'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import koLocale from '@fullcalendar/core/locales/ko'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

/** 예약처리상황 범례 — 일정 배경/글자색과 범례 점 색상을 한 곳에서 관리 */
const categories = {
  request: { id: 'request', label: '조사예약 신청', dot: '#F5A623', bg: '#FFF3DB', text: '#1E2124' },
  approved: { id: 'approved', label: '승인처리', dot: '#34A853', bg: '#E6F7E7', text: '#1E2124' },
  rejected: { id: 'rejected', label: '예약거부', dot: '#E4536B', bg: '#FDEFEC', text: '#1E2124' },
  assigned: { id: 'assigned', label: '센터조사관 본인에게 배당받은 사건', dot: '#34A2FC', bg: '#F0F7FF', text: '#1E2124' },
}
const categoryList = Object.values(categories)

const legendOpen = ref(false)
const calendarRef = ref(null)

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth() + 1)
const currentView = ref('dayGridMonth')
const currentWeekOfMonth = ref(1)

function pad(n) {
  return String(n).padStart(2, '0')
}

/** 목데이터: 이번 달을 기준으로 카테고리별 일정을 흩뿌려 생성 */
function buildMockEvents(year, month) {
  const day = (d) => `${year}-${pad(month)}-${pad(d)}`
  const entries = [
    { day: 1, start: '11:30', end: '12:30', title: '피해자 조사', category: 'request' },
    { day: 9, start: '17:00', end: '18:00', title: '조사', category: 'assigned' },
    { day: 16, start: '12:00', end: '13:00', title: '피해자 조사', category: 'request' },
    { day: 16, start: '14:00', end: '16:00', title: '피해자 조사', category: 'assigned' },
    { day: 16, start: '16:30', end: '17:30', title: '아동학대', category: 'approved' },
    { day: 18, start: '12:00', end: '13:00', title: '아동학대', category: 'request' },
    { day: 18, start: '12:00', end: '13:00', title: '조사', category: 'approved' },
    { day: 22, start: '12:00', end: '13:00', title: '강간', category: 'rejected' },
    { day: 22, start: '12:00', end: '13:00', title: '살인', category: 'rejected' },
    { day: 22, start: '12:00', end: '13:00', title: '성폭행', category: 'rejected' },
    { day: 24, start: '12:00', end: '13:00', title: '조사', category: 'request' },
    { day: 24, start: '13:00', end: '14:00', title: '아동학대', category: 'approved' },
    { day: 29, start: '12:00', end: '13:00', title: '피해자 조사', category: 'request' },
    { day: 30, start: '12:00', end: '13:00', title: '아동학대', category: 'approved' },
    { day: 31, start: '12:00', end: '13:00', title: '살인', category: 'assigned' },
    { day: 31, start: '12:00', end: '13:00', title: '절도', category: 'assigned' },
    { day: 31, start: '12:00', end: '13:00', title: '사기', category: 'assigned' },
    { day: 31, start: '12:00', end: '13:00', title: '아동학대', category: 'approved' },
  ]

  return entries
    .filter((e) => e.day <= new Date(year, month, 0).getDate())
    .map((e) => {
      const cat = categories[e.category]
      return {
        title: e.title,
        start: `${day(e.day)}T${e.start}:00`,
        end: `${day(e.day)}T${e.end}:00`,
        backgroundColor: cat.bg,
        textColor: cat.text,
        dot: cat.dot,
      }
    })
}

const calendarOptions = reactive({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: koLocale,
  headerToolbar: false,
  height: 'auto',
  editable: true,
  selectable: true,
  eventDisplay: 'block',
  eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
  events: buildMockEvents(currentYear.value, currentMonth.value),
  eventContent: (arg) => {
    const time = arg.timeText ? `${arg.timeText} ` : ''
    return { html: `<span class="fc-event-pill">${time}${arg.event.title}</span>` }
  },
  eventDidMount: (info) => {
    const dotColor = info.event.extendedProps.dot
    if (!dotColor) return
    const harness = info.el.closest('.fc-daygrid-event-harness')
    harness?.style.setProperty('--fc-event-dot-color', dotColor)
  },
  datesSet: (arg) => {
    const mid = new Date((arg.start.getTime() + arg.end.getTime()) / 2)
    currentYear.value = mid.getFullYear()
    currentMonth.value = mid.getMonth() + 1
    currentView.value = arg.view.type

    if (arg.view.type === 'timeGridWeek') {
      const firstOfMonth = new Date(currentYear.value, currentMonth.value - 1, 1)
      const diffDays = Math.round((arg.start.getTime() - firstOfMonth.getTime()) / 86400000)
      currentWeekOfMonth.value = Math.max(1, Math.floor(diffDays / 7) + 1)
    }
  },
})

const api = computed(() => calendarRef.value?.getApi())

function refreshEvents() {
  calendarOptions.events = buildMockEvents(currentYear.value, currentMonth.value)
}

function goYear(delta) {
  api.value?.gotoDate(new Date(currentYear.value + delta, currentMonth.value - 1, 1))
  refreshEvents()
}

function goMonth(delta) {
  api.value?.gotoDate(new Date(currentYear.value, currentMonth.value - 1 + delta, 1))
  refreshEvents()
}

function changeView(view) {
  api.value?.changeView(view)
}
</script>

<style scoped>
.calendar-container {
  padding: 20px;
  background: #ffffff;
}

.calendar-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.6rem;
  margin-bottom: 1.6rem;
}

.nav-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 9999px;
  color: var(--Text-body_1, #33363d);
}

.nav-btn:hover {
  background: var(--Background-gray01, #f5f6f8);
}

.nav-label {
  min-width: 4.4rem;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--Text-body_0, #1e2124);
}

.view-toggle {
  display: flex;
  gap: 0.4rem;
  padding: 0.3rem;
  border-radius: 0.8rem;
  background: var(--Background-gray01, #f5f6f8);
}

.view-btn {
  padding: 0.6rem 1.4rem;
  border-radius: 0.6rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--Text-body_1, #33363d);
}

.view-btn--active {
  background: var(--Text-body_0, #1e2124);
  color: #fff;
}

.info-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 9999px;
  color: var(--Text-body_2, #58616a);
}

.info-btn:hover {
  background: var(--Background-gray01, #f5f6f8);
}

.legend-content {
  width: 30rem;
}

.legend-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.legend-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--Text-body_0, #1e2124);
}

.legend-close {
  display: inline-flex;
  color: var(--Text-body_2, #58616a);
}

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.4rem;
  color: var(--Text-body_1, #33363d);
}

.legend-dot {
  flex-shrink: 0;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
}

/* FullCalendar 내부 요소 커스터마이징 (라이브러리 자체 스타일을 :deep 으로 재정의) */
:deep(.fc) {
  font-family: inherit;
}

:deep(.fc-theme-standard td),
:deep(.fc-theme-standard th) {
  border-color: var(--Border_gray03, #e6e8ea);
}

:deep(.fc-col-header-cell) {
  padding: 0.8rem 0;
  background: #fff;
}
:deep(.fc .fc-daygrid-day-top){
  justify-content: center;
}

:deep(.fc-col-header-cell-cushion) {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--Text-body_2, #58616a);
}
:deep(.fc-direction-ltr .fc-daygrid-event.fc-event-start){
  padding-left:1.8rem;
}
:deep(.fc-daygrid-event-harness::before){
  position: absolute;
  left:0.8rem;
  top:50%;
  transform: translateY(-50%);
  border-radius:50%;
  width:0.5rem;
  height: 0.5rem;
  background: var(--fc-event-dot-color, #999);
  z-index: 11111;

}
:deep(.fc-daygrid-day-number) {
  padding: 0.6rem 0.8rem;
  font-size: 1.3rem;
  color: var(--Text-body_1, #33363d);
}

:deep(.fc-event) {
  border: none;
}

:deep(.fc-daygrid-event) {
  position: relative;
  margin: 1px 4px;
  padding: 0.2rem 0.8rem;
  border-radius: 0.4rem;
  color:var(--Text-body_0);
}

:deep(.fc-event-pill) {
  font-size: 1.2rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.fc-timegrid-event .fc-event-pill) {
  white-space: normal;
}
</style>
