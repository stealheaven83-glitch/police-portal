import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/** 사고자/자원근무자 현황 한 행. 실제 조회 API 연동 전까지는 목업 데이터를 그대로 쓴다 */
export interface AccidentVolunteerRow {
  no: number
  /** '자원근무' | '사고자' */
  type: string
  dept: string
  workDate: string
  shift: string
  affDept: string
  name: string
  workTime: string
  reason: string
  /** 취소된 건이면 '취소 YYYY-MM-DD', 아니면 빈 문자열 */
  cancelNote: string
}

export const typeFilterOptions = [
  { label: '전체', value: 'all' },
  { label: '자원근무', value: '자원근무' },
  { label: '사고자', value: '사고자' },
]

function createMockRows(): AccidentVolunteerRow[] {
  return [
    {
      no: 3,
      type: '자원근무',
      dept: '본청 중앙학교 실습부서',
      workDate: '2026-07-15',
      shift: '주',
      affDept: '본청 중앙학교 실습부서',
      name: '[경사] 홍길동',
      workTime: '전일',
      reason: '연가',
      cancelNote: '',
    },
    {
      no: 2,
      type: '사고자',
      dept: '본청 중앙학교 실습부서',
      workDate: '2026-07-15',
      shift: '주',
      affDept: '본청 중앙학교 실습부서',
      name: '[경사] 홍길동',
      workTime: '08:00~10:00',
      reason: '병가',
      cancelNote: '',
    },
    {
      no: 1,
      type: '자원근무',
      dept: '본청 중앙학교 실습부서',
      workDate: '2026-07-15',
      shift: '주',
      affDept: '본청 중앙학교 실습부서',
      name: '[경사] 홍길동',
      workTime: '전일',
      reason: '연가',
      cancelNote: '취소 2026-07-16',
    },
  ]
}

export function useAccidentVolunteerStatus() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const advancedSearchOpen = ref(false)

  const dateFrom = ref('')
  const dateTo = ref('')
  const typeFilter = ref('all')
  const nameFilter = ref('')

  const allRows = ref<AccidentVolunteerRow[]>(createMockRows())

  const rows = computed(() => {
    return allRows.value.filter((row) => {
      if (typeFilter.value !== 'all' && row.type !== typeFilter.value) return false
      if (nameFilter.value && !row.name.includes(nameFilter.value)) return false
      if (dateFrom.value && row.workDate < dateFrom.value) return false
      if (dateTo.value && row.workDate > dateTo.value) return false
      return true
    })
  })

  return {
    department,
    advancedSearchOpen,
    dateFrom,
    dateTo,
    typeFilter,
    nameFilter,
    rows,
  }
}
