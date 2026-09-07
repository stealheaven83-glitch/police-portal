import { ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/** 근무 칸 한 줄 — 09:00 상황근무 [1팀] 홍길동, 이세돌 */
export interface DutyEntry {
  time: string
  /** 근무명 (강조 표시된다) */
  work: string
  team: string
  names: string
}

/** 휴/비 칸 한 줄 — [3팀] 이기홍 */
export interface RestEntry {
  team: string
  name: string
}

/** 자원근무자 칸 한 줄 */
export interface VolunteerEntry {
  id: number
  time: string
  type: string
  name: string
}

/** 사고자 칸 한 줄 */
export interface IncidentEntry {
  id: number
  name: string
  reason: string
  time: string
}

export interface DutyDay {
  /** 표시용 일자 (예: '1 (수)') */
  label: string
  day: DutyEntry[]
  night: DutyEntry[]
  off: RestEntry[]
  standby: RestEntry[]
  volunteers: VolunteerEntry[]
  incidents: IncidentEntry[]
}

/** 근무주기별 묶음 (4조 2교대 / 5조 3교대 …) */
export interface DutyCycleGroup {
  title: string
  days: DutyDay[]
}

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

function sampleDay(dayNo: number, dow: number, idSeed: number): DutyDay {
  return {
    label: `${dayNo} (${WEEKDAY[dow]})`,
    day: [
      { time: '09:00', work: '상황근무', team: '[1팀]', names: '홍길동, 이세돌' },
      { time: '10:00', work: '중부 순21호', team: '[1팀]', names: '홍길동, 이세돌' },
      { time: '12:00', work: '상황근무', team: '[1팀]', names: '홍길동, 이세돌' },
      { time: '13:00', work: '상황근무', team: '[1팀]', names: '홍길동, 이세돌' },
      { time: '14:00', work: '중부 순21호', team: '[1팀]', names: '홍길동, 이세돌' },
      { time: '16:00', work: '상황근무', team: '[1팀]', names: '홍길동, 이세돌' },
    ],
    night: [
      { time: '09:00', work: '중부 순21호', team: '[1팀]', names: '홍길동, 이세돌' },
      { time: '09:00', work: '중부 순21호', team: '[1팀]', names: '홍길동, 이세돌' },
      { time: '09:00', work: '중부 순21호', team: '[1팀]', names: '홍길동, 이세돌' },
      { time: '09:00', work: '중부 순21호', team: '[1팀]', names: '홍길동, 이세돌' },
      { time: '09:00', work: '중부 순21호', team: '[1팀]', names: '홍길동, 이세돌' },
      { time: '09:00', work: '중부 순21호', team: '[1팀]', names: '홍길동, 이세돌' },
    ],
    off: [
      { team: '[3팀]', name: '이기홍' },
      { team: '[3팀]', name: '박진홍' },
      { team: '[3팀]', name: '박이서' },
      { team: '[3팀]', name: '박진철' },
    ],
    standby: [
      { team: '[3팀]', name: '홍세희' },
      { team: '[4팀]', name: '박지성' },
    ],
    volunteers: [
      { id: idSeed + 1, time: '09:00~18:00', type: '자원근무', name: '홍길동' },
      { id: idSeed + 2, time: '20:00~08:30', type: '자원근무', name: '홍길동' },
      { id: idSeed + 3, time: '09:00~18:00', type: '자원근무', name: '홍길동' },
    ],
    incidents: [
      { id: idSeed + 4, name: '남윤진', reason: '[육아시간]', time: '(06:30~08:30)' },
      { id: idSeed + 5, name: '박장의', reason: '[연가]', time: '' },
      { id: idSeed + 6, name: '서환일', reason: '[연가]', time: '' },
      { id: idSeed + 7, name: '박성환', reason: '[조퇴]', time: '(06:30~08:30)' },
      { id: idSeed + 8, name: '권서빈', reason: '[특별휴가]', time: '(06:30~08:30)' },
    ],
  }
}

function createMockGroups(): DutyCycleGroup[] {
  return [
    {
      title: '근무 (4조 2교대)',
      days: [sampleDay(1, 3, 100), sampleDay(2, 4, 200), sampleDay(3, 5, 300), sampleDay(4, 6, 400)],
    },
    {
      title: '근무 (5조 3교대)',
      days: [sampleDay(5, 0, 500), sampleDay(6, 1, 600)],
    },
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
  const month = ref('2026.08.')
  const groups = ref<DutyCycleGroup[]>(createMockGroups())

  /** 사고신청(PC-LPO-0225) / 자원근무신청(PC-LPO-0226) — 폼이 같아 한 팝업을 돌려 쓴다 */
  const applyOpen = ref(false)
  const applyKind = ref<'incident' | 'volunteer'>('incident')
  const applyForm = ref<ApplyForm>({ name: '', reason: '', range: 'all', startTime: '', endTime: '' })

  function openApply(kind: 'incident' | 'volunteer') {
    applyKind.value = kind
    applyForm.value = { name: '', reason: '', range: 'all', startTime: '', endTime: '' }
    applyOpen.value = true
  }

  /** 월 이동 — 표시용 목업이라 문자열만 바꾼다 */
  function shiftMonth(delta: number) {
    const [y, m] = month.value.replace(/\.$/, '').split('.').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    month.value = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.`
  }

  function removeVolunteer(day: DutyDay, id: number) {
    day.volunteers = day.volunteers.filter((v) => v.id !== id)
  }

  function removeIncident(day: DutyDay, id: number) {
    day.incidents = day.incidents.filter((v) => v.id !== id)
  }

  return {
    department,
    month,
    groups,
    applyOpen,
    applyKind,
    applyForm,
    openApply,
    shiftMonth,
    removeVolunteer,
    removeIncident,
  }
}
