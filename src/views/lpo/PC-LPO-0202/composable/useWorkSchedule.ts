import { ref } from 'vue'

export interface SelectOption {
  label: string
  value: string
}

export interface RegularWorker {
  id: number
  group: string
  rank: string
  name: string
  assignCount: number
}

export interface VolunteerWorker {
  id: number
  rank: string
  name: string
  volunteerType: string
  startTime: string
  endTime: string
}

export interface IncidentWorker {
  id: number
  rank: string
  name: string
  reason: string
  startTime: string
  endTime: string
}

export interface ScheduleRow {
  id: number
  label: string
  /** fixed: 하루 전체 동일 인원 고정 배정 / variable: 시간대별로 배정 내용이 달라짐 */
  type: 'fixed' | 'variable'
  fixedAssignees: string[]
  cells: string[][]
}

export const timeSlots = [
  '08:30~09:00', '09:00~10:00', '10:00~11:00', '11:00~12:00',
  '12:00~13:00', '13:00~14:00', '14:00~15:00', '15:00~16:00',
  '16:00~17:00', '17:00~18:00', '18:00~19:00', '19:00~20:00',
]

export const teamOptions: SelectOption[] = [
  { label: '1팀', value: 'team1' },
  { label: '2팀', value: 'team2' },
  { label: '3팀', value: 'team3' },
]

function emptyCells(): string[][] {
  return timeSlots.map((): string[] => [])
}

function fixedCells(names: string[]): string[][] {
  return timeSlots.map(() => [...names])
}

export function useWorkSchedule() {
  const workDate = ref('2026.08.11.')
  const shift = ref<'day' | 'night'>('day')

  const regularWorkers = ref<RegularWorker[]>([
    { id: 1, group: '1', rank: '경위', name: '홍길동', assignCount: 1 },
    { id: 2, group: '2', rank: '경위', name: '홍길동', assignCount: 0 },
    { id: 3, group: '3', rank: '경감', name: '홍길동', assignCount: 0 },
    { id: 4, group: '4', rank: '경정', name: '홍길동', assignCount: 0 },
    { id: 5, group: '5', rank: '경사', name: '홍길동', assignCount: 0 },
  ])
  const regularTeam = ref('team1')

  const volunteerWorkers = ref<VolunteerWorker[]>([
    { id: 1, rank: '경위', name: '홍길동', volunteerType: '자원근무', startTime: '18:00', endTime: '20:00' },
    { id: 2, rank: '경위', name: '홍길동', volunteerType: '자원근무', startTime: '18:00', endTime: '20:00' },
    { id: 3, rank: '경감', name: '홍길동', volunteerType: '자원근무', startTime: '18:00', endTime: '20:00' },
  ])

  const incidentWorkers = ref<IncidentWorker[]>([
    { id: 1, rank: '경정', name: '홍길동', reason: '육아시간', startTime: '18:00', endTime: '20:00' },
    { id: 2, rank: '경위', name: '홍길동', reason: '병가', startTime: '18:00', endTime: '20:00' },
    { id: 3, rank: '경감', name: '홍길동', reason: '조퇴', startTime: '18:00', endTime: '20:00' },
  ])

  const scheduleRows = ref<ScheduleRow[]>([
    { id: 1, label: '팀장', type: 'fixed', fixedAssignees: ['고수'], cells: fixedCells(['고수']) },
    { id: 2, label: '상황근무', type: 'fixed', fixedAssignees: ['박찬호', '김진호'], cells: fixedCells(['박찬호', '김진호']) },
    { id: 3, label: '용산 순21호', type: 'fixed', fixedAssignees: ['홍길동', '도우너'], cells: fixedCells(['홍길동', '도우너']) },
    {
      id: 4,
      label: '순21호 중점',
      type: 'variable',
      fixedAssignees: [],
      cells: [[], [], ['중앙아시아 거리 거점 및 도보순찰'], [], ['밀리오레 상가 주변 도보순찰'], [], ['광희동 도보순찰'], [], [], ['동역사 주변 거전 순찰'], [], []],
    },
    { id: 5, label: '용산 순22호', type: 'fixed', fixedAssignees: ['홍길동', '도우너'], cells: fixedCells(['홍길동', '도우너']) },
    {
      id: 6,
      label: '순25호 중점',
      type: 'variable',
      fixedAssignees: [],
      cells: [[], [], ['중앙아시아 거리 거점 및 도보순찰'], [], ['밀리오레 상가 주변 도보순찰'], [], ['광희동 도보순찰'], [], [], ['동역사 주변 거전 순찰'], [], []],
    },
    { id: 7, label: '치안센터', type: 'variable', fixedAssignees: [], cells: emptyCells() },
  ])

  const importantNotes = ref('')
  const targetDate = ref('2026-07-16')

  function addRegularWorker() {
    const nextId = regularWorkers.value.length ? Math.max(...regularWorkers.value.map((w) => w.id)) + 1 : 1
    regularWorkers.value = [...regularWorkers.value, { id: nextId, group: '', rank: '', name: '', assignCount: 0 }]
  }

  function addVolunteerWorker() {
    const nextId = volunteerWorkers.value.length ? Math.max(...volunteerWorkers.value.map((w) => w.id)) + 1 : 1
    volunteerWorkers.value = [
      ...volunteerWorkers.value,
      { id: nextId, rank: '', name: '', volunteerType: '', startTime: '', endTime: '' },
    ]
  }

  function removeVolunteerWorkers(ids: Set<number>) {
    volunteerWorkers.value = volunteerWorkers.value.filter((w) => !ids.has(w.id))
  }

  function addIncidentWorker() {
    const nextId = incidentWorkers.value.length ? Math.max(...incidentWorkers.value.map((w) => w.id)) + 1 : 1
    incidentWorkers.value = [...incidentWorkers.value, { id: nextId, rank: '', name: '', reason: '', startTime: '', endTime: '' }]
  }

  function removeIncidentWorkers(ids: Set<number>) {
    incidentWorkers.value = incidentWorkers.value.filter((w) => !ids.has(w.id))
  }

  function shiftWorkDate(days: number) {
    // 표시용 목업이라 실제 날짜 연산 대신 자리표시만 갱신
    void days
  }

  return {
    workDate,
    shift,
    regularWorkers,
    regularTeam,
    volunteerWorkers,
    incidentWorkers,
    scheduleRows,
    importantNotes,
    targetDate,
    addRegularWorker,
    addVolunteerWorker,
    removeVolunteerWorkers,
    addIncidentWorker,
    removeIncidentWorkers,
    shiftWorkDate,
  }
}
