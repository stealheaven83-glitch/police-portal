<template>
  <div class="lp-cal">
    <div class="lp-cal-toolbar">
      <TextSelect
        :options="yearOptions"
        :model-value="String(year)"
        aria-label="연도 선택"
        size="xlarge"
        @update:model-value="(v: string) => emit('update:year', Number(v))"
      />
      <TextSelect
        :options="monthOptions"
        :model-value="String(month)"
        aria-label="월 선택"
        size="xlarge"
        @update:model-value="(v: string) => emit('update:month', Number(v))"
      />
    </div>

    <div class="lp-cal-grid">
      <div v-for="(w, i) in WEEKDAYS" :key="w" class="lp-cal-head" :class="dowClass(i)">{{ w }}</div>

      <Popover
        v-for="cell in cells"
        :key="cell.date"
        :open="openDate === cell.date"
        @update:open="(o: boolean) => (openDate = o ? cell.date : null)"
      >
        <PopoverTrigger as-child>
          <div
            class="lp-cal-cell"
            :class="{ 'lp-cal-cell-out': !cell.inMonth, 'lp-cal-cell-open': openDate === cell.date }"
            role="button"
            tabindex="0"
            @click="onSelect(cell.date)"
            @keydown.enter="onSelect(cell.date)"
          >
            <!-- 시안(Block 13312:71179): 날짜는 24×24 로 왼쪽에 고정하고,
                 공휴일·근무 배지는 그 오른쪽 칸에 세로로 쌓인다 -->
            <span class="lp-cal-date" :class="{ 'lp-cal-date-holiday': cell.holiday }">{{ cell.day }}</span>
            <div class="lp-cal-cell-body">
              <span v-if="cell.holiday" class="lp-cal-holiday">{{ cell.holiday }}</span>
              <ul v-if="cell.events.length" class="lp-cal-events">
                <li v-for="(ev, i) in cell.events" :key="i" class="lp-cal-event">
                  <Badge v-if="ev.label" :color="ev.color ?? 'primary'" variant="solid" size="md" shape="sm">
                    {{ ev.label }}
                  </Badge>
                  <span v-if="ev.time" class="lp-cal-event-time">{{ ev.time }}</span>
                </li>
              </ul>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent v-if="$slots['day-detail']" align="start" class="lp-cal-popover">
          <slot name="day-detail" :date="cell.date" :close="closeDetail" />
        </PopoverContent>
      </Popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TextSelect, { type TextSelectOption } from '@/components/custom/select/TextSelect.vue'
import { Badge } from '@/components/custom/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

/**
 * 월간 일정 달력 — 한 칸에 날짜 + 배지(근무구분) + 시간이 들어가는 조회용 그리드.
 * `calendar.vue`(FullCalendar 기반, 주간/월간 토글·범례 포함)와 달리 조회 전용이라
 * 툴바가 연도·월 셀렉트 두 개뿐이다. 근무일정조회(PM-LPO-0108) 같은 화면에서 쓴다.
 */
export interface ScheduleEvent {
  /** 배지 문구 (예: 주간/야간/당직/사고/휴가) */
  label?: string
  /** 배지 색 — Badge 의 color 값 */
  color?: 'primary' | 'secondary' | 'tertiary' | 'point' | 'danger' | 'warning' | 'success' | 'info' | 'grayLighter'
  /** 배지 옆 시간 문구 (예: 09:00) */
  time?: string
}

export interface ScheduleDay {
  /** 'YYYY-MM-DD' */
  date: string
  /** 공휴일·기념일 이름 (예: 추석) */
  holiday?: string
  events?: ScheduleEvent[]
}

interface Props {
  year: number
  /** 1~12 */
  month: number
  days?: ScheduleDay[]
  /** 연도 셀렉트에 넣을 범위 */
  yearFrom?: number
  yearTo?: number
}

const props = withDefaults(defineProps<Props>(), {
  days: () => [],
  yearFrom: 2020,
  yearTo: 2030,
})

const emit = defineEmits<{
  (e: 'update:year', value: number): void
  (e: 'update:month', value: number): void
  (e: 'select', date: string): void
}>()

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** 상세 팝오버가 열려 있는 날짜(없으면 null) — day-detail 슬롯이 있을 때만 뜬다 */
const openDate = ref<string | null>(null)

function closeDetail() {
  openDate.value = null
}

function onSelect(date: string) {
  emit('select', date)
}

const yearOptions = computed<TextSelectOption[]>(() =>
  Array.from({ length: props.yearTo - props.yearFrom + 1 }, (_, i) => {
    const y = props.yearFrom + i
    return { label: `${y}년`, value: String(y) }
  }),
)

const monthOptions = computed<TextSelectOption[]>(() =>
  Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}월`, value: String(i + 1) })),
)

function dowClass(dow: number) {
  if (dow === 0) return 'lp-cal-sun'
  if (dow === 6) return 'lp-cal-sat'
  return undefined
}

function toKey(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** 1일이 속한 주의 일요일부터, 그 달을 덮는 데 필요한 주 수만큼만 채운다(5주 또는 6주) */
const cells = computed(() => {
  const first = new Date(props.year, props.month - 1, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())

  const daysInMonth = new Date(props.year, props.month, 0).getDate()
  const cellCount = Math.ceil((first.getDay() + daysInMonth) / 7) * 7

  const byDate = new Map(props.days.map((d) => [d.date, d]))

  return Array.from({ length: cellCount }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = toKey(d)
    const found = byDate.get(key)
    return {
      date: key,
      day: d.getDate(),
      dow: d.getDay(),
      inMonth: d.getMonth() === props.month - 1,
      holiday: found?.holiday,
      events: found?.events ?? [],
    }
  })
})
</script>
