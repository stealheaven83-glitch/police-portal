import { ref } from 'vue'
import type { SelectOption } from './useWorkSchedule'

/**
 * 근무지정표작성(PC-LPO-0202) 화면에서 열리는 팝업들의 상태.
 * 화면ID가 각각 붙어 있는 화면군이라(PC-LPO-0205~0213) 팝업마다 컴포넌트를 두고,
 * 상태는 여기 한 곳에 모아 useWorkSchedule() 이 같이 provide 한다(CLAUDE.md §3 패턴A).
 */

/* ── PC-LPO-0207 근무관리 ─────────────────────────────────────────────── */
export interface WorkKindRow {
  id: number
  /** 근무명 (인라인 입력) */
  work: string
  /** 종별 (상황/도보/차량 …) */
  kind: string
  /** 순번 */
  order: number
  /** 사용여부 */
  used: boolean
}

export const workKindOptions: SelectOption[] = [
  { label: '상황', value: '상황' },
  { label: '도보', value: '도보' },
  { label: '차량', value: '차량' },
  { label: '거점', value: '거점' },
]

/* ── PC-LPO-0208 시간관리 ─────────────────────────────────────────────── */
export interface WorkTimeRow {
  id: number
  /** 교대 이름 (예: 1교대) */
  shiftName: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
}

export const hourOptions: SelectOption[] = Array.from({ length: 24 }, (_, h) => {
  const label = `${String(h).padStart(2, '0')}:00`
  return { label, value: label }
})

/* ── PC-LPO-0209 순찰구역 / PC-LPO-0210 순찰구역 상세 ─────────────────── */
export interface PatrolAreaRow {
  id: number
  no: number
  /** 순찰구역명 (인라인 입력) */
  name: string
  /** 상세 지점을 화살표로 이어붙인 요약 문구 */
  detail: string
  /** 순찰차 */
  car: string
}

export interface PatrolPointRow {
  id: number
  /** 순서 */
  order: number
  /** 구역명 */
  name: string
  address: string
  addressDetail: string
}

/* ── PC-LPO-0212 근무 사용자 선택 ─────────────────────────────────────── */
export interface DriverRow {
  id: number
  name: string
  driving: boolean
}

export interface WorkUserRow {
  id: number
  /** 조 */
  team: string
  rank: string
  name: string
}

/* ── PC-LPO-0205 자원 근무자 추가 ─────────────────────────────────────── */
export interface VolunteerCandidate {
  id: number
  dept: string
  rank: string
  name: string
  /** 해당 지구대/파출소 직원이면 파란색으로 강조된다 */
  own: boolean
}

export const volunteerTypeOptions: SelectOption[] = [
  { label: '자원근무', value: '자원근무' },
  { label: '지원근무', value: '지원근무' },
  { label: '초과근무', value: '초과근무' },
]

/* ── PC-LPO-0206 사고자 추가 ──────────────────────────────────────────── */
export const incidentReasonOptions: SelectOption[] = [
  { label: '병가', value: '병가' },
  { label: '연가', value: '연가' },
  { label: '조퇴', value: '조퇴' },
  { label: '육아시간', value: '육아시간' },
  { label: '교육', value: '교육' },
]

export function useWorkScheduleDialogs() {
  /* 근무관리(PC-LPO-0207) */
  const workManageOpen = ref(false)
  const workKindRows = ref<WorkKindRow[]>([
    { id: 1, work: '상황근무', kind: '상황', order: 1, used: true },
    { id: 2, work: '상황근무', kind: '상황', order: 2, used: true },
    { id: 3, work: '상황근무', kind: '도보', order: 4, used: false },
    { id: 4, work: '상황근무', kind: '상황', order: 5, used: false },
  ])

  function addWorkKindRow() {
    const nextId = workKindRows.value.length ? Math.max(...workKindRows.value.map((r) => r.id)) + 1 : 1
    const nextOrder = workKindRows.value.length ? Math.max(...workKindRows.value.map((r) => r.order)) + 1 : 1
    workKindRows.value = [...workKindRows.value, { id: nextId, work: '', kind: '상황', order: nextOrder, used: false }]
  }

  /* 시간관리(PC-LPO-0208) */
  const timeManageOpen = ref(false)
  const timeShiftNo = ref('1')
  const timeStart = ref('09:00')
  const timeInterval = ref(30)
  const timeCount = ref(1)
  const workTimeRows = ref<WorkTimeRow[]>([
    { id: 1, shiftName: '1교대', startDate: '2026-01-01', startTime: '09:00', endDate: '2026-01-01', endTime: '09:30' },
    { id: 2, shiftName: '1교대', startDate: '2026-01-01', startTime: '09:30', endDate: '2026-01-01', endTime: '10:00' },
    { id: 3, shiftName: '1교대', startDate: '2026-01-01', startTime: '10:00', endDate: '2026-01-01', endTime: '10:30' },
    { id: 4, shiftName: '1교대', startDate: '2026-01-01', startTime: '10:30', endDate: '2026-01-01', endTime: '11:00' },
    { id: 5, shiftName: '1교대', startDate: '2026-01-01', startTime: '11:00', endDate: '2026-01-01', endTime: '11:30' },
  ])

  /** 생성개수만큼 간격(분)을 더해가며 교대 시간을 만들어 붙인다 */
  function addWorkTimeRows() {
    let nextId = workTimeRows.value.length ? Math.max(...workTimeRows.value.map((r) => r.id)) + 1 : 1
    const last = workTimeRows.value[workTimeRows.value.length - 1]
    let cursor = last ? toMinutes(last.endTime) : toMinutes(timeStart.value)
    const added: WorkTimeRow[] = []
    for (let i = 0; i < timeCount.value; i += 1) {
      const start = cursor
      const end = cursor + timeInterval.value
      added.push({
        id: nextId++,
        shiftName: `${timeShiftNo.value}교대`,
        startDate: last?.startDate ?? '2026-01-01',
        startTime: toHhmm(start),
        endDate: last?.endDate ?? '2026-01-01',
        endTime: toHhmm(end),
      })
      cursor = end
    }
    workTimeRows.value = [...workTimeRows.value, ...added]
  }

  function removeWorkTimeRows(ids: Set<number>) {
    workTimeRows.value = workTimeRows.value.filter((r) => !ids.has(r.id))
  }

  /* 순찰구역(PC-LPO-0209) / 순찰구역 상세(PC-LPO-0210) */
  const patrolAreaOpen = ref(false)
  const patrolAreaRows = ref<PatrolAreaRow[]>([
    { id: 1, no: 1, name: '순찰구역명1', detail: '신원초등학교 → 센트레빌 → 삼송마을 → 개포주공', car: '순마1' },
    { id: 2, no: 2, name: '순찰구역명1', detail: '신원중학교 → 조호마을', car: '순마1' },
    { id: 3, no: 3, name: '순찰구역명1', detail: '신원중학교 → 조호마을', car: '순마1' },
  ])

  const patrolDetailOpen = ref(false)
  /** 상세 팝업이 보고 있는 순찰구역 이름 */
  const patrolDetailName = ref('')
  const patrolPointRows = ref<PatrolPointRow[]>([
    { id: 1, order: 1, name: '신원초등학교', address: '서울특별시 종로구 숭인동 2-1', addressDetail: '다대1동' },
    { id: 2, order: 2, name: '신원빌딩', address: '경기도 고양시 덕양구 신원로 5', addressDetail: '다대2동' },
    { id: 3, order: 3, name: '신원초등학교', address: '서울특별시 종로구 숭인동 2-1', addressDetail: '다대1동' },
    { id: 4, order: 4, name: '신원초등학교', address: '서울특별시 종로구 숭인동 2-1', addressDetail: '다대1동' },
    { id: 5, order: 5, name: '신원빌딩', address: '경기도 고양시 덕양구 신원로 5', addressDetail: '다대2동' },
  ])

  function openPatrolDetail(area: PatrolAreaRow) {
    patrolDetailName.value = area.name
    patrolDetailOpen.value = true
  }

  function addPatrolPointRow() {
    const nextId = patrolPointRows.value.length ? Math.max(...patrolPointRows.value.map((r) => r.id)) + 1 : 1
    const nextOrder = patrolPointRows.value.length ? Math.max(...patrolPointRows.value.map((r) => r.order)) + 1 : 1
    patrolPointRows.value = [
      ...patrolPointRows.value,
      { id: nextId, order: nextOrder, name: '', address: '', addressDetail: '' },
    ]
  }

  function removePatrolPointRows(ids: Set<number>) {
    patrolPointRows.value = patrolPointRows.value.filter((r) => !ids.has(r.id))
  }

  /* 甲지 일괄 출력(PC-LPO-0211) */
  const bulkPrintOpen = ref(false)
  const bulkPrintFrom = ref('2026-07-16')
  const bulkPrintTo = ref('2026-07-16')

  /* 근무 사용자 선택(PC-LPO-0212) */
  const workUserPickOpen = ref(false)
  const driverRows = ref<DriverRow[]>([
    { id: 1, name: '홍길동', driving: true },
    { id: 2, name: '고길동', driving: false },
    { id: 3, name: '홍길동', driving: false },
  ])
  const workUserRows = ref<WorkUserRow[]>([
    { id: 1, team: '1', rank: '경감', name: '조우호' },
    { id: 2, team: '2', rank: '경감', name: '홍길동' },
    { id: 3, team: '5', rank: '경정', name: '김길동' },
    { id: 4, team: '4', rank: '경위', name: '박길동' },
    { id: 5, team: '4', rank: '경감', name: '홍길동' },
    { id: 6, team: '2', rank: '경감', name: '홍길동' },
    { id: 7, team: '1', rank: '경정', name: '홍길동' },
    { id: 8, team: '1', rank: '경감', name: '홍길동' },
  ])
  const volunteerUserRows = ref<Omit<WorkUserRow, 'team'>[]>([
    { id: 1, rank: '경감', name: '조우호' },
    { id: 2, rank: '경감', name: '홍길동' },
    { id: 3, rank: '경정', name: '김길동' },
    { id: 4, rank: '경위', name: '박길동' },
    { id: 5, rank: '경감', name: '홍길동' },
    { id: 6, rank: '경감', name: '홍길동' },
    { id: 7, rank: '경정', name: '홍길동' },
    { id: 8, rank: '경감', name: '홍길동' },
  ])

  /* 중점사항 입력(PC-LPO-0213) */
  const keyNoteOpen = ref(false)
  const keyNoteText = ref('')

  /* 자원 근무자 추가(PC-LPO-0205) */
  const volunteerAddOpen = ref(false)
  const volunteerScope = ref<'police' | 'etc'>('police')
  const volunteerType = ref('자원근무')
  const volunteerStart = ref('')
  const volunteerEnd = ref('')
  const volunteerKeyword = ref('')
  const volunteerCandidates = ref<VolunteerCandidate[]>([
    { id: 1, dept: '서울청 서울중부서 을지지구대', rank: '경위', name: '홍길동', own: true },
    { id: 2, dept: '부산청 부산연제서 수사과 수사팀', rank: '경위', name: '홍길동', own: false },
    { id: 3, dept: '서울청 서울중부서 을지지구대', rank: '경사', name: '홍길동', own: false },
    { id: 4, dept: '부산청 부산연제서 수사과 수사팀', rank: '경사', name: '홍길동', own: false },
    { id: 5, dept: '부산청 부산연제서 수사과 수사팀', rank: '경사', name: '홍길동', own: false },
  ])

  /* 사고자 추가(PC-LPO-0206) */
  const incidentAddOpen = ref(false)
  const incidentName = ref('')
  const incidentReason = ref('')
  /** 전일 / 부분 — 부분일 때만 시작·종료 시간을 고른다 */
  const incidentRange = ref<'all' | 'part'>('all')
  const incidentStart = ref('')
  const incidentEnd = ref('')

  /* 근무 지정표 복사(Figma 프레임만 있고 화면ID 없음) */
  const scheduleCopyOpen = ref(false)
  const scheduleCopyDate = ref('2026-07-16')

  return {
    workManageOpen,
    workKindRows,
    addWorkKindRow,

    timeManageOpen,
    timeShiftNo,
    timeStart,
    timeInterval,
    timeCount,
    workTimeRows,
    addWorkTimeRows,
    removeWorkTimeRows,

    patrolAreaOpen,
    patrolAreaRows,
    patrolDetailOpen,
    patrolDetailName,
    patrolPointRows,
    openPatrolDetail,
    addPatrolPointRow,
    removePatrolPointRows,

    bulkPrintOpen,
    bulkPrintFrom,
    bulkPrintTo,

    workUserPickOpen,
    driverRows,
    workUserRows,
    volunteerUserRows,

    keyNoteOpen,
    keyNoteText,

    volunteerAddOpen,
    volunteerScope,
    volunteerType,
    volunteerStart,
    volunteerEnd,
    volunteerKeyword,
    volunteerCandidates,

    incidentAddOpen,
    incidentName,
    incidentReason,
    incidentRange,
    incidentStart,
    incidentEnd,

    scheduleCopyOpen,
    scheduleCopyDate,
  }
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function toHhmm(minutes: number) {
  const m = ((minutes % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}
