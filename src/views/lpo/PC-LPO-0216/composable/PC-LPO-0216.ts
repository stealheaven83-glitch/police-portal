import { ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/** 사고자 칸 한 줄 — 부분 홍길동 육아 (06:30~08:30) */
export interface IncidentEntry {
  id: number
  /** 전일 / 부분 — 색이 다르다(전일 적색, 부분 청색) */
  range: '전일' | '부분'
  name: string
  reason: string
  time: string
}

/** 자원근무자 칸 한 줄 — 09:00~18:00 홍길동 */
export interface VolunteerEntry {
  id: number
  time: string
  name: string
}

/** 주간·야간·심야 한 구간의 사고자·자원근무자 */
export interface DutyShift {
  incidents: IncidentEntry[]
  volunteers: VolunteerEntry[]
}

export type ShiftKey = 'day' | 'night' | 'late'

export interface DutyDay {
  /** 표시용 일자 (예: '1 (수)') */
  label: string
  /** 요일 0(일)~6(토) — 토·일 글자색 구분용 */
  dow: number
  day: DutyShift
  night: DutyShift
  late: DutyShift
}

/** 표 머리글 순서 — 주간 → 야간 → 심야 */
export const shiftColumns: ReadonlyArray<{ key: ShiftKey; label: string }> = [
  { key: 'day', label: '주간' },
  { key: 'night', label: '야간' },
  { key: 'late', label: '심야' },
]

export const yearOptions = [
  { label: '2026년', value: '2026' },
  { label: '2025년', value: '2025' },
]

export const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}월`, value: String(i + 1) }))

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

/** 자원근무자 세 줄 — 시안이 모든 칸에 같은 세 줄을 두고 있다 */
function sampleVolunteers(idSeed: number): VolunteerEntry[] {
  return [
    { id: idSeed + 1, time: '09:00~18:00', name: '홍길동' },
    { id: idSeed + 2, time: '20:00~08:30', name: '홍길동' },
    { id: idSeed + 3, time: '09:00~18:00', name: '홍길동' },
  ]
}

function sampleIncidents(idSeed: number, rows: Array<[IncidentEntry['range'], string]>): IncidentEntry[] {
  return rows.map(([range, reason], i) => ({
    id: idSeed + 10 + i,
    range,
    name: '홍길동',
    reason,
    time: '(06:30~08:30)',
  }))
}

function sampleShift(idSeed: number, incidents: Array<[IncidentEntry['range'], string]>): DutyShift {
  return { incidents: sampleIncidents(idSeed, incidents), volunteers: sampleVolunteers(idSeed) }
}

function sampleDay(
  dayNo: number,
  dow: number,
  idSeed: number,
  day: Array<[IncidentEntry['range'], string]>,
  night: Array<[IncidentEntry['range'], string]>,
  late: Array<[IncidentEntry['range'], string]>,
): DutyDay {
  return {
    label: `${dayNo} (${WEEKDAY[dow]})`,
    dow,
    day: sampleShift(idSeed, day),
    night: sampleShift(idSeed + 100, night),
    late: sampleShift(idSeed + 200, late),
  }
}

/** 시안 12231:126683 의 6일치 그대로 — 야간·심야 사고자가 빈 날도 있다 */
function createMockDays(): DutyDay[] {
  const three: Array<[IncidentEntry['range'], string]> = [['부분', '육아'], ['부분', '조퇴'], ['부분', '특별휴가']]
  const leaveEarly: Array<[IncidentEntry['range'], string]> = [['부분', '조퇴'], ['부분', '조퇴']]
  const annual: Array<[IncidentEntry['range'], string]> = [['전일', '연가'], ['전일', '연가']]
  const mixed: Array<[IncidentEntry['range'], string]> = [['전일', '연가'], ['부분', '육아']]
  return [
    sampleDay(1, 3, 1000, three, three, three),
    sampleDay(2, 4, 2000, leaveEarly, annual, annual),
    sampleDay(3, 5, 3000, mixed, mixed, mixed),
    sampleDay(4, 6, 4000, three, [], []),
    sampleDay(5, 0, 5000, leaveEarly, leaveEarly, leaveEarly),
    sampleDay(6, 1, 6000, three, [], three),
  ]
}

/** 신청 팝업(사고신청 PC-LPO-0225 / 자원근무신청 PC-LPO-0226)이 공유하는 폼 */
export interface ApplyForm {
  name: string
  reason: string
  range: 'all' | 'part'
  startTime: string
  endTime: string
}

export const applyReasonOptions = [
  { label: '병가', value: '병가' },
  { label: '연가', value: '연가' },
  { label: '조퇴', value: '조퇴' },
  { label: '육아시간', value: '육아시간' },
  { label: '특별휴가', value: '특별휴가' },
]

export const applyNameOptions = [
  { label: '[경위] 홍길동', value: '홍길동' },
  { label: '[경사] 이세돌', value: '이세돌' },
  { label: '[경감] 남윤진', value: '남윤진' },
]

export const hourOptions = Array.from({ length: 24 }, (_, h) => {
  const label = `${String(h).padStart(2, '0')}:00`
  return { label, value: label }
})

export function useDutyStatus() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const year = ref('2026')
  const month = ref('9')
  const days = ref<DutyDay[]>(createMockDays())

  /** 사고신청(PC-LPO-0225) / 자원근무신청(PC-LPO-0226) — 폼이 같아 한 팝업을 돌려 쓴다 */
  const applyOpen = ref(false)
  const applyKind = ref<'incident' | 'volunteer'>('incident')
  const applyForm = ref<ApplyForm>({ name: '', reason: '', range: 'all', startTime: '', endTime: '' })

  function openApply(kind: 'incident' | 'volunteer') {
    applyKind.value = kind
    applyForm.value = { name: '', reason: '', range: 'all', startTime: '', endTime: '' }
    applyOpen.value = true
  }

  function removeVolunteer(day: DutyDay, shift: ShiftKey, id: number) {
    day[shift].volunteers = day[shift].volunteers.filter((v) => v.id !== id)
  }

  function removeIncident(day: DutyDay, shift: ShiftKey, id: number) {
    day[shift].incidents = day[shift].incidents.filter((v) => v.id !== id)
  }

  return {
    department,
    year,
    month,
    days,
    applyOpen,
    applyKind,
    applyForm,
    openApply,
    removeVolunteer,
    removeIncident,
  }
}
