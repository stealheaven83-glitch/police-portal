import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 출동수당 취합(일별) 한 행 — PC-LPO-0505와 같은 이유로 rowspan 대신 반복 표시한다.
 * 사람 1명당 접수 건수만큼(시안 기준 4행)의 상세 내역이 이어진다.
 */
export interface DailyDispatchAllowanceRow {
  no: number
  dept: string
  team: string
  rankName: string
  birthDate: string
  dispatchCount: number
  receivedAt: string
  arrivalTime: string
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

function createPersonRows(no: number): DailyDispatchAllowanceRow[] {
  const base = {
    dept: '서울청 범죄예방대응과 한강경찰서',
    team: '1팀',
    rankName: '경위 홍길동',
    birthDate: '1980-01-01',
    dispatchCount: 1,
    receivedAt: '2026-08-01 14:00',
    arrivalTime: '4분 7초',
    crimeName: '위험방지',
    receiptNo: '0000000000',
    caseNo: '400',
    reportContent: '요구조자와 전화통화가 되어 순38호가 당산철.',
    processContent: '요구조자 홍익지구대 보호조치 후 보호자(부친)',
    onSiteAction: '보호조치',
    manualReason: '출동수당신청',
  }
  const staff = {
    1: {
      team: '1팀',
      rankName: '경위 홍길동',
      birthDate: '1980-01-01',
      dispatchCount: 4,
      crimeName: '위험방지',
      reportContent: '요구조자 안전 확인 요청',
      processContent: '현장 출동 후 보호자에게 인계',
      onSiteAction: '보호조치',
      manualReason: '자동체크',
    },
    2: {
      team: '2팀',
      rankName: '경사 김하늘',
      birthDate: '1984-05-16',
      dispatchCount: 2,
      crimeName: '가정폭력',
      reportContent: '가정 내 다툼 및 소란 신고',
      processContent: '피해자 분리 및 상담 연계',
      onSiteAction: '분리조치',
      manualReason: '출동수당 신청',
    },
    3: {
      team: '4팀',
      rankName: '경장 이도윤',
      birthDate: '1991-11-03',
      dispatchCount: 3,
      crimeName: '주취소란',
      reportContent: '주취자 소란 및 귀가 지원 요청',
      processContent: '주취자 안정 후 가족에게 인계',
      onSiteAction: '귀가조치',
      manualReason: '자동체크',
    },
  } as const
  const dispatchStaff = staff[no as keyof typeof staff] ?? staff[1]

  return Array.from({ length: dispatchStaff.dispatchCount }, (_, index) => ({
    no,
    ...base,
    ...dispatchStaff,
    receivedAt: `2026-08-${String(index + no).padStart(2, '0')} ${String(9 + index).padStart(2, '0')}:00`,
    receiptNo: `00000[CODE C2]-${String((no - 1) * 4 + index + 1).padStart(3, '0')}`,
    caseNo: `00000[CODE C2]-${String(400 + (no - 1) * 4 + index).padStart(3, '0')}`,
  }))
}

function createMockRows(): DailyDispatchAllowanceRow[] {
  return [...createPersonRows(1), ...createPersonRows(2), ...createPersonRows(3)]
}

export function useDispatchSummaryDaily() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'central-report', level3: 'front-line' })
  const advancedSearchOpen = ref(false)

  const workYear = ref('2026')
  const workMonth = ref('8')
  const applicant = ref('all')
  const applyType = ref('all')

  const allRows = ref<DailyDispatchAllowanceRow[]>(createMockRows())

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
