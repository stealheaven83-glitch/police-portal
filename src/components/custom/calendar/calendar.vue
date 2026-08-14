<template>
  <div class="calendar-container">
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import koLocale from '@fullcalendar/core/locales/ko'


const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: 'ko', // 한국어 설정
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek'
  },
  editable: true,
  selectable: true,
  events: [
    { title: '피해자 조사', start: '2026-07-01T11:30:00', end: '2026-07-01T12:30:00' },
    { title: '아동학대', start: '2026-07-18T12:00:00', backgroundColor: '#fff3cd', textColor: '#856404' }
  ]
})
</script>

<style scoped>
.calendar-container {
  padding: 20px;
  background: #ffffff;
}
</style>