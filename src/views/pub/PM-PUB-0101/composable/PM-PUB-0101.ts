import { computed, ref } from 'vue'

export interface SelectOption {
  label: string
  value: string
}

/** 좌측 '간이 범죄예방진단 현황' 한 행 */
export interface DiagnosisRow {
  /** 화면에 보이는 번호이자 이력 조회 키 */
  no: number
  /** 진단 부서(지구대/파출소) */
  dept: string
  /** 진단 유형 */
  type: string
  /** 진단 대상 상호명 */
  bizName: string
  /** 진단자 */
  diagnoser: string
  address: string
  /** 현금다액취급업소 여부 */
  cashIntensive: boolean
}

/** 우측 '간이 범죄예방진단 이력' 한 행 */
export interface DiagnosisHistoryRow {
  no: number
  diagnosedAt: string
  bizName: string
  /** 진단사유(지역안전순찰 · 신고접수 등) */
  reason: string
  address: string
  diagnoser: string
}

export const typeOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  { label: '기타', value: 'etc' },
  { label: '공동주택', value: 'apartment' },
  { label: '단독주택', value: 'house' },
  { label: '상가', value: 'store' },
]

export const reasonOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  { label: '지역안전순찰', value: 'patrol' },
  { label: '신고접수', value: 'report' },
  { label: '주민요청', value: 'request' },
]

/** TODO: API 연동 전까지 쓰는 더미 목록. 시안의 "총 195건" 을 그대로 맞춰둔다. */
const DEPTS = ['남포지구대', '중부지구대', '대청파출소', '광복파출소']
const BIZ_NAMES = ['고심정사', '대청상가', '광복빌라', '중앙마트', '남포전자']
const TYPES = ['기타', '상가', '공동주택', '단독주택']
const ADDRESS = '부산광역시 중구 대청로 135번길 20'
const REASONS = ['지역안전순찰', '신고접수', '주민요청']

function createRows(total: number): DiagnosisRow[] {
  return Array.from({ length: total }, (_, index) => {
    // 번호는 최신 건이 위로 오도록 내림차순
    const no = total - index
    return {
      no,
      dept: DEPTS[no % DEPTS.length],
      type: TYPES[no % TYPES.length],
      bizName: BIZ_NAMES[no % BIZ_NAMES.length],
      diagnoser: '홍길동',
      address: ADDRESS,
      cashIntensive: no % 7 === 0,
    }
  })
}

/**
 * 간이 범죄예방진단 목록 화면 상태.
 *
 * 좌측 현황에서 고른 행 하나가 우측 이력의 조회 조건이 된다. 이력은 화면에서 직접 편집하지
 * 않으므로 선택 행에서 파생시키기만 하고 별도 상태로 들고 있지 않는다.
 */
export function useDiagnosisList() {
  const rows = ref<DiagnosisRow[]>(createRows(195))
  const selectedRow = ref<DiagnosisRow | null>(null)

  /**
   * 선택한 건의 진단 이력.
   * 실제로는 번호로 이력을 다시 조회해 오는 자리다. 지금은 같은 건이 여러 번 진단된
   * 모습을 보여주려고 선택 행에서 2건을 만들어 둔다.
   */
  const historyRows = computed<DiagnosisHistoryRow[]>(() => {
    const row = selectedRow.value
    if (!row) return []

    return [0, 1].map((offset) => ({
      no: row.no,
      diagnosedAt: '2026-06-16',
      bizName: row.bizName,
      reason: REASONS[(row.no + offset) % REASONS.length],
      address: row.address,
      diagnoser: row.diagnoser,
    }))
  })

  function selectRow(row: DiagnosisRow | null) {
    selectedRow.value = row
  }

  return {
    rows,
    selectedRow,
    historyRows,
    selectRow,
  }
}
