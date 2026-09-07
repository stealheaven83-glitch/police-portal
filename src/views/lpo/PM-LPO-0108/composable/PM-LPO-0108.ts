import { computed, ref } from 'vue'
import type { ScheduleDay, ScheduleEvent } from '@/components/custom/calendar/MonthScheduleCalendar.vue'

/** 근무 한 건 — 달력 배지 + 상세 팝오버가 같은 데이터를 쓴다 */
export interface DutyItem {
  /** 'YYYY-MM-DD' */
  date: string
  /** 근무구분 배지 (주간/야간/심야/당직/사고/휴가) */
  kind: DutyKind
  /** 시작 시각 또는 '09:30~15:00' 같은 구간 */
  time: string
  /** 근무명 (예: 상황 근무) — 상세 팝오버에만 나온다 */
  name?: string
  /** 자원근무 표시 */
  volunteer?: boolean
  /** 함께 근무하는 사람 */
  members?: string[]
  /** 사고 사유 (예: 병가) */
  reason?: string
}

export type DutyKind = '주간' | '야간' | '심야' | '당직' | '사고' | '휴가'

/** 근무구분 → 배지 색 */
const KIND_COLOR: Record<DutyKind, NonNullable<ScheduleEvent['color']>> = {
  주간: 'primary',
  야간: 'secondary',
  심야: 'tertiary',
  당직: 'success',
  사고: 'danger',
  휴가: 'grayLighter',
}

/** 공휴일 — 실제로는 서버가 내려준다 */
const HOLIDAYS: Record<string, string> = {
  '2026-09-24': '추석',
  '2026-09-25': '추석',
  '2026-09-26': '추석',
}

function createMockDuties(): DutyItem[] {
  return [
    { date: '2026-09-01', kind: '주간', time: '09:00', name: '상황 근무', members: ['홍길동', '이세돌', '김색별', '강한나', '장철수'] },
    { date: '2026-09-01', kind: '주간', time: '13:00', name: '주간전종', volunteer: true, members: ['홍길동'] },
    { date: '2026-09-01', kind: '사고', time: '09:30~15:00', reason: '병가' },
    { date: '2026-09-03', kind: '심야', time: '02:00', name: '심야 순찰' },
    { date: '2026-09-05', kind: '휴가', time: '', name: '연가' },
    { date: '2026-09-06', kind: '야간', time: '18:00', name: '야간 순찰' },
    { date: '2026-09-08', kind: '당직', time: '18:00', name: '당직' },
    { date: '2026-09-10', kind: '주간', time: '09:00', name: '상황 근무' },
    { date: '2026-09-12', kind: '주간', time: '09:00', name: '상황 근무' },
    { date: '2026-09-13', kind: '주간', time: '09:00', name: '상황 근무' },
    { date: '2026-09-15', kind: '사고', time: '', reason: '병가' },
    { date: '2026-09-17', kind: '주간', time: '09:00', name: '상황 근무' },
    { date: '2026-09-19', kind: '주간', time: '09:00', name: '상황 근무' },
    { date: '2026-09-20', kind: '야간', time: '18:00', name: '야간 순찰' },
    { date: '2026-09-22', kind: '주간', time: '09:00', name: '상황 근무' },
    { date: '2026-09-24', kind: '주간', time: '09:00', name: '상황 근무' },
    { date: '2026-09-25', kind: '주간', time: '09:00', name: '상황 근무' },
    { date: '2026-09-26', kind: '휴가', time: '', name: '연가' },
    { date: '2026-09-27', kind: '주간', time: '09:00', name: '상황 근무' },
    { date: '2026-09-29', kind: '당직', time: '18:00', name: '당직' },
  ]
}

export function useDutySchedule() {
  const year = ref(2026)
  const month = ref(9)
  const duties = ref<DutyItem[]>(createMockDuties())

  /** 달력에 넘길 형태 — 날짜별로 배지 목록과 공휴일 이름을 묶는다 */
  const days = computed<ScheduleDay[]>(() => {
    const byDate = new Map<string, ScheduleDay>()
    for (const [date, holiday] of Object.entries(HOLIDAYS)) {
      byDate.set(date, { date, holiday, events: [] })
    }
    for (const duty of duties.value) {
      const day = byDate.get(duty.date) ?? { date: duty.date, events: [] }
      day.events = [...(day.events ?? []), { label: duty.kind, color: KIND_COLOR[duty.kind], time: duty.time }]
      byDate.set(duty.date, day)
    }
    return [...byDate.values()]
  })

  function dutiesOn(date: string) {
    return duties.value.filter((d) => d.date === date)
  }

  /** '2026-09-01' → '2026년 9월 1일' */
  function formatDay(date: string) {
    const [y, m, d] = date.split('-')
    return `${y}년 ${Number(m)}월 ${Number(d)}일`
  }

  return { year, month, duties, days, dutiesOn, formatDay, KIND_COLOR }
}
