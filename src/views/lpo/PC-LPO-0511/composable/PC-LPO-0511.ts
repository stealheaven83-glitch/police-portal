import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 출동수당 취합(일별) 한 행 — PC-LPO-0505와 같은 이유로 rowspan 대신 반복 표시한다.
 * 사람 1명당 접수 건수만큼(시안 기준 4행)의 상세 내역이 이어진다.
 */
export interface DispatchDetailRow {
  no: number
  dept: string
  team: string
  rankName: string
  birthDate: string
  dispatchCount: number
  receivedAt: string
  crimeName: string
  receiptNo: string
  caseNo: string
  reportContent: string
  processContent: string
  onSiteAction: string
  manualReason: string
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

function createPersonRows(no: number): DispatchDetailRow[] {
  const base = {
    dept: '서울청 범죄예방대응과 한강경찰서',
    team: '1팀',
    rankName: '경위 홍길동',
    birthDate: '1980-01-01',
    dispatchCount: 1,
    receivedAt: '2026-08-01 14:00',
    crimeName: '위험방지',
    receiptNo: '0000000000',
    caseNo: '400',
    reportContent: '요구조자와 전화통화가 되어 순38호가 당산철.',
    processContent: '요구조자 홍익지구대 보호조치 후 보호자(부친)',
    onSiteAction: '보호조치',
    manualReason: '출동수당신청',
  }
  return Array.from({ length: 4 }, () => ({ no, ...base }))
}

function createMockRows(): DispatchDetailRow[] {
  return [...createPersonRows(1), ...createPersonRows(2)]
}

export function useDispatchSummaryDaily() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'central-report', level3: 'front-line' })
  const advancedSearchOpen = ref(true)

  const workYear = ref('2026')
  const workMonth = ref('8')
  const applicant = ref('all')
  const applyType = ref('all')

  const allRows = ref<DispatchDetailRow[]>(createMockRows())

  const rows = computed(() => allRows.value)

  return {
    department,
    advancedSearchOpen,
    workYear,
    workMonth,
    applicant,
    applyType,
    rows,
  }
}
