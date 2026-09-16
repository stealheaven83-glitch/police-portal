import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 출동수당 취합(월별) 한 행 — "사람 1명당 범죄명별 4행"이 세로 병합(rowspan)된 표지만,
 * TabulatorGrid(Tabulator 6.x)는 데이터 셀 rowspan/colspan을 지원하지 않는다.
 * 시안(12769:79145)대로 번호/부서/팀/직급성명/생년월일/총출동건수는 **첫 행에만** 넣고
 * 나머지 행은 비워 둔다(빈 칸이 병합처럼 보인다).
 */
export interface DispatchSummaryRow {
  no?: number
  dept?: string
  team?: string
  rankName?: string
  birthDate?: string
  totalCount?: number
  category: string
  count: number
  days: number[]
}

/** 출동수당 승인자 한 사람 — 직책 · 이름 · (경찰서 과장은) 승인 상태 */
export interface Approver {
  label: string
  name: string
  status?: string
}

export const yearOptions = [
  { label: '2026년', value: '2026' },
  { label: '2025년', value: '2025' },
]

export const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}월`, value: String(i + 1) }))

export const applicantOptions = [
  { label: '전체', value: 'all' },
  { label: '경위 홍길동', value: 'hong' },
]

export const applyTypeOptions = [
  { label: '전체', value: 'all' },
  { label: '자동체크', value: 'auto' },
  { label: '임의등록', value: 'manual' },
]

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function createPersonRows(no: number, days: number): DispatchSummaryRow[] {
  const person = {
    no,
    dept: '서울청 범죄예방대응과 한강경찰서',
    team: '1팀',
    rankName: '경위 홍길동',
    birthDate: '1980-01-01',
    totalCount: 4,
  }
  const categories: Array<{ category: string; count: number }> = [
    { category: '위험방지', count: 1 },
    { category: '자살', count: 1 },
    { category: '구조요청', count: 2 },
    { category: '지급건수', count: 4 },
  ]
  return categories.map((c, i) => ({
    ...(i === 0 ? person : {}),
    category: c.category,
    count: c.count,
    days: Array(days).fill(1),
  }))
}

function createMockRows(days: number): DispatchSummaryRow[] {
  return [...createPersonRows(1, days), ...createPersonRows(2, days)]
}

export function useDispatchSummaryMonthly() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'central-report', level3: 'front-line' })
  const advancedSearchOpen = ref(false)

  const workYear = ref(2026)
  const workMonth = ref(9)
  const applicant = ref('all')
  const applyType = ref('all')

  const days = computed(() => daysInMonth(workYear.value, workMonth.value))
  const rows = computed<DispatchSummaryRow[]>(() => createMockRows(days.value))

  /** 타직원 출동수당 신청 요청 건수 — 목록 위 '요청갯수 : N' */
  const requestCount = ref(0)

  /** 출동수당 승인자 줄 — 지구대/파출소 팀장·계장은 승인 버튼, 경찰서 과장은 상태만 */
  const approvers = ref<{ teamLeader: Approver; chief: Approver }>({
    teamLeader: { label: '지구대/파출소 (팀장/계장)', name: '경정 홍길동' },
    chief: { label: '경찰서(과장)', name: '경정 홍길동', status: '미승인' },
  })

  return {
    department,
    advancedSearchOpen,
    workYear,
    workMonth,
    applicant,
    applyType,
    days,
    rows,
    requestCount,
    approvers,
  }
}
