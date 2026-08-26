import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

export interface HandoverStatusRow {
  no: number
  dept: string
  workDate: string
  shift: string
  team: number
  handoverBy: string
  receiveBy: string
  confirmDate1: string
  confirmBy1: string
  confirmDate2: string
  inspector: string
  cancelNote: string
}

export const yearOptions = [
  { label: '2026년', value: '2026' },
  { label: '2025년', value: '2025' },
  { label: '2024년', value: '2024' },
]

export const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}월`,
  value: String(i + 1),
}))

function createMockRows(): HandoverStatusRow[] {
  return [
    {
      no: 5,
      dept: '본청 중앙학교 실습부서',
      workDate: '2026-07-15',
      shift: '주',
      team: 1,
      handoverBy: '팀장 홍길동',
      receiveBy: '팀장 정우영',
      confirmDate1: '2026-07-01',
      confirmBy1: '지/파장 윤홍길',
      confirmDate2: '2026-07-01',
      inspector: '과장 최철우',
      cancelNote: '미확인',
    },
    {
      no: 4,
      dept: '본청 중앙학교 실습부서',
      workDate: '2026-07-15',
      shift: '주',
      team: 2,
      handoverBy: '팀장 홍길동',
      receiveBy: '팀장 정우영',
      confirmDate1: '-',
      confirmBy1: '지/파장 윤홍길',
      confirmDate2: '미확인',
      inspector: '과장 최철우',
      cancelNote: '미확인',
    },
    {
      no: 3,
      dept: '본청 중앙학교 실습부서',
      workDate: '2026-07-15',
      shift: '주',
      team: 1,
      handoverBy: '팀장 홍길동',
      receiveBy: '팀장 정우영',
      confirmDate1: '2026-07-01',
      confirmBy1: '지/파장 윤홍길',
      confirmDate2: '2026-07-01',
      inspector: '과장 최철우',
      cancelNote: '2026-07-01',
    },
    {
      no: 2,
      dept: '본청 중앙학교 실습부서',
      workDate: '2026-07-15',
      shift: '주',
      team: 2,
      handoverBy: '팀장 홍길동',
      receiveBy: '팀장 정우영',
      confirmDate1: '-',
      confirmBy1: '지/파장 윤홍길',
      confirmDate2: '2026-07-01',
      inspector: '과장 최철우',
      cancelNote: '2026-07-01',
    },
    {
      no: 1,
      dept: '본청 중앙학교 실습부서',
      workDate: '2026-07-15',
      shift: '주',
      team: 1,
      handoverBy: '팀장 홍길동',
      receiveBy: '팀장 정우영',
      confirmDate1: '2026-07-01',
      confirmBy1: '지/파장 윤홍길',
      confirmDate2: '2026-07-01',
      inspector: '과장 최철우',
      cancelNote: '2026-07-01',
    },
  ]
}

export function useHandoverStatus() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const advancedSearchOpen = ref(true)

  const workYear = ref('2026')
  const workMonth = ref('4')
  const unconfirmedOnly = ref(false)

  const allRows = ref<HandoverStatusRow[]>(createMockRows())

  const rows = computed(() => {
    if (!unconfirmedOnly.value) return allRows.value
    return allRows.value.filter((row) => row.confirmDate2 === '미확인' || row.cancelNote === '미확인')
  })

  return {
    department,
    advancedSearchOpen,
    workYear,
    workMonth,
    unconfirmedOnly,
    rows,
  }
}
