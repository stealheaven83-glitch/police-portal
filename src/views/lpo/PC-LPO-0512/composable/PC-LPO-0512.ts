import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/** 출동수당통보 한 줄 — 근무일자별 출동건수가 일수만큼 붙는다 */
export interface NoticeRow {
  no: number
  dept: string
  team: string
  rankName: string
  birthDate: string
  totalCount: number
  /** 1일차부터 그 달 마지막 날까지의 건수 */
  days: number[]
}

export const yearOptions = [
  { label: '2026년', value: '2026' },
  { label: '2025년', value: '2025' },
]

export const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}월`,
  value: String(i + 1),
}))

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function createMockRows(days: number): NoticeRow[] {
  return Array.from({ length: 6 }, () => {
    const values = Array.from({ length: days }, (_, i) => (i === 1 ? 2 : 0))
    return {
      no: 1,
      dept: '서울청 범죄예방대응과 한강경찰서',
      team: '1팀',
      rankName: '경위 홍길동',
      birthDate: '1980-01-01',
      totalCount: 4,
      days: values,
    }
  })
}

export function useAllowanceNotice() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const advancedSearchOpen = ref(true)

  const year = ref('2026')
  const month = ref('9')

  const days = computed(() => daysInMonth(Number(year.value), Number(month.value)))
  const rows = computed<NoticeRow[]>(() => createMockRows(days.value))

  return { department, advancedSearchOpen, year, month, days, rows }
}
