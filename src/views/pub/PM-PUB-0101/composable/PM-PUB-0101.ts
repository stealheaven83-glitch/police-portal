import { computed, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

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

/** 검색영역 입력값 (시안 2줄 구성 순서대로) */
export interface DiagnosisSearchForm {
  department: DepartmentValue
  /** 관리번호 */
  managementNo: string
  bizName: string
  type: string
  /** 통보유무 */
  notified: string
  /** 현금다액취급업소 해당 여부 */
  cashIntensive: string
  diagnosedFrom: string
  diagnosedTo: string
  /** 진단사유 */
  reason: string
  diagnoser: string
}

/** 진단 유형 한 갈래. 상가용1·2 만 하위 업종을 갖는다 */
export interface DiagnosisTypeNode {
  label: string
  value: string
  children?: DiagnosisTypeNode[]
}

/**
 * 진단 유형 원본 트리.
 * 목록 필터 말고 등록·상세 화면에서도 같은 분류를 써야 하므로 트리 그대로 내보낸다.
 */
export const diagnosisTypeTree: DiagnosisTypeNode[] = [
  { label: '주택용', value: 'house' },
  { label: '아파트용', value: 'apartment' },
  { label: '금융업용', value: 'finance' },
  {
    label: '상가용1(환금성높음)',
    value: 'store-high',
    children: [
      { label: '편의점', value: 'store-high-convenience' },
      { label: '귀금속점', value: 'store-high-jewelry' },
      { label: '주요소', value: 'store-high-gas' },
      { label: '일반상점', value: 'store-high-general' },
      { label: '기타', value: 'store-high-etc' },
    ],
  },
  {
    label: '상가용2(환금성낮음)',
    value: 'store-low',
    children: [
      { label: 'PC방', value: 'store-low-pcroom' },
      { label: '미용실', value: 'store-low-salon' },
      { label: '통신판매업', value: 'store-low-telesales' },
      { label: '주점', value: 'store-low-pub' },
      { label: '일반음식점', value: 'store-low-restaurant' },
      { label: '기타', value: 'store-low-etc' },
    ],
  },
  { label: '사무용', value: 'office' },
  { label: '공장형', value: 'factory' },
  { label: '가로용', value: 'street' },
  { label: '공원용', value: 'park' },
  { label: '공동주택용', value: 'multi-house' },
]

/**
 * 셀렉트는 평면 목록만 받으므로 트리를 펼치면서 하위 항목에만 '-' 를 붙여 한 단계 들여쓴다.
 * (상위 항목도 그대로 고를 수 있어야 해서 그룹 헤더로 만들지 않는다)
 */
function flattenTypes(nodes: DiagnosisTypeNode[], depth = 0): SelectOption[] {
  return nodes.flatMap((node) => [
    { label: depth > 0 ? `- ${node.label}` : node.label, value: node.value },
    ...(node.children ? flattenTypes(node.children, depth + 1) : []),
  ])
}

export const typeOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  ...flattenTypes(diagnosisTypeTree),
]

export const reasonOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  { label: '주민요청', value: 'patrol' },
  { label: '침입범죄발생', value: 'report' },
  { label: '취약지역으로', value: 'request' },
  { label: '판단', value: 'request' },
  { label: '관서장지시', value: 'request' },
  { label: '지역안전순찰', value: 'request' },
]

export const notifiedOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  { label: '유', value: 'existence' },
  { label: '무', value: 'none' },
]

export const cashIntensiveOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  { label: '예', value: 'yes' },
  { label: '아니오', value: 'no' },
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
 * 좌측 현황에서 고른 행 하나가 우측 이력의 조회 조건이다. 이력은 화면에서 직접 편집하지
 * 않으므로 선택 행에서 파생시키기만 하고 별도 상태로 들고 있지 않는다.
 */
export function useDiagnosisList() {
  /** 시안은 상세조회가 접힌 상태로 열린다 */
  const advancedSearchOpen = ref(false)

  const searchForm = reactive<DiagnosisSearchForm>({
    department: { level1: 'hq', level2: 'all', level3: 'all' },
    managementNo: '',
    bizName: '',
    type: 'all',
    notified: 'all',
    cashIntensive: 'all',
    diagnosedFrom: '',
    diagnosedTo: '',
    reason: 'all',
    diagnoser: '',
  })

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

  function search() {
    // TODO: API 연동. 지금은 더미 목록이라 조회 조건이 결과에 반영되지 않는다.
    toast.success('조회되었습니다.')
  }

  function openNew() {
    // TODO: 진단신규(등록) 팝업 PM-PUB-0107 연결
    toast.info('신규 등록 화면은 준비 중입니다.')
  }

  return {
    advancedSearchOpen,
    searchForm,
    rows,
    selectedRow,
    historyRows,
    selectRow,
    search,
    openNew,
  }
}
