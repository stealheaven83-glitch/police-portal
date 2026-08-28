import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 출동수당 취합(월별) 한 행 — 실제로는 "사람 1명당 범죄명별 4행"이 세로 병합(rowspan)된 표지만,
 * TabulatorGrid(Tabulator 6.x)는 데이터 셀 rowspan/colspan을 지원하지 않는다.
 * 그래서 번호/부서/팀/직급성명/생년월일/총출동건수를 각 행에 그대로 반복 표시한다(병합 포기).
 */
export interface DispatchSummaryRow {
  no: number
  dept: string
  team: string
  rankName: string
  birthDate: string
  totalCount: number
  category: string
  count: number
  days: number[]
}

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
  const base = {
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
  return categories.map((c) => ({
    no,
    ...base,
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
  const workMonth = ref(8)
  const applicant = ref('all')
  const applyType = ref('all')

  const days = computed(() => daysInMonth(workYear.value, workMonth.value))
  const rows = computed<DispatchSummaryRow[]>(() => createMockRows(days.value))

  return {
    department,
    advancedSearchOpen,
    workYear,
    workMonth,
    applicant,
    applyType,
    days,
    rows,
  }
}
