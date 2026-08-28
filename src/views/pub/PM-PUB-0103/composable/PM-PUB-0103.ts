import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

export interface SelectOption {
  label: string
  value: string
}

/** 좌측 'CPO 범죄예방진단 현황' 한 행 */
export interface CpoDiagnosisRow {
  /** 화면에 보이는 번호이자 이력 조회 키 */
  no: number
  /** 진단 부서(지구대/파출소) */
  dept: string
  /** 진단 유형 */
  type: string
  /** 진단 대상 상호명 */
  bizName: string
  /** 진단 총점 */
  score: number
  /** 진단자 */
  diagnoser: string
  baseAddress: string
  detailAddress: string
  /** 현금다액취급업소 여부 */
  cashIntensive: string
}

/** 우측 'CPO 범죄예방진단 이력' 한 행 */
export interface CpoHistoryRow {
  id: number
  diagnosedAt: string
  bizName: string
  address: string
  /** 진단통보 우편발송 희망 여부 */
  mailRequested: string
  /** 우편발송 처리 상태 */
  mailStatus: string
  diagnoser: string
}

/** 검색영역 입력값 */
export interface CpoSearchForm {
  department: DepartmentValue
  detailAddress: string
  sortBy: string
  managementNo: string
  bizName: string
  type: string
  facilityImproved: string
  hasNotice: string
  cashIntensive: string
  diagnosedFrom: string
  diagnosedTo: string
  reason: string
  diagnoser: string
}

export const sortOptions: SelectOption[] = [
  { label: '기본', value: 'default' },
  { label: '최신순', value: 'latest' },
  { label: '오래된순', value: 'oldest' },
  { label: '총점 높은순', value: 'scoreDesc' },
  { label: '총점 낮은순', value: 'scoreAsc' },
]

export const typeOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  { label: '기타', value: 'etc' },
  { label: '공동주택', value: 'apartment' },
  { label: '단독주택', value: 'house' },
  { label: '상가', value: 'store' },
]

export const yesNoAllOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  { label: '예', value: 'y' },
  { label: '아니오', value: 'n' },
]

export const cashOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  { label: '해당', value: 'y' },
  { label: '해당없음', value: 'n' },
]

export const reasonOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  { label: '지역안전순찰', value: 'patrol' },
  { label: '신고접수', value: 'report' },
  { label: '주민요청', value: 'request' },
  { label: '기타', value: 'etc' },
]

/** 신규 등록 팝업의 진단사유 — 검색조건과 달리 '전체'가 없다 */
export const diagnosisReasonOptions: SelectOption[] = reasonOptions.filter((o) => o.value !== 'all')

export const districtOptions: SelectOption[] = [
  { label: '남포동', value: 'nampo' },
  { label: '중앙동', value: 'jungang' },
  { label: '대청동', value: 'daecheong' },
  { label: '광복동', value: 'gwangbok' },
]

export const crimePreventionStatusOptions: SelectOption[] = [
  { label: '신규', value: 'new' },
  { label: '계속', value: 'continue' },
]

export const previousCrimeDamageOptions: SelectOption[] = [
  { label: '있음', value: 'yes' },
  { label: '없음', value: 'no' },
]

export const improvementStatusOptions: SelectOption[] = [
  { label: '예정', value: 'planned' },
  { label: '진행중', value: 'inProgress' },
  { label: '완료', value: 'done' },
]

/** 진단결과 항목 한 줄. 라디오(양호/보통/위험) 또는 수량 스테퍼 둘 중 하나다 */
export interface AssessmentRadioRow {
  type: 'radio'
  key: string
  label: string
}
export interface AssessmentStepperRow {
  type: 'stepper'
  key: string
  label: string
  unit: string
}
export type AssessmentRow = AssessmentRadioRow | AssessmentStepperRow

/** 1) 건물특성 — 시안에 나온 순서 그대로 (라디오 항목과 그 옆의 수량 항목이 섞여 있다) */
export const buildingAssessmentRows: AssessmentRow[] = [
  { type: 'radio', key: 'householdCount', label: '주택 거주 세대/가구원 수' },
  { type: 'stepper', key: 'householdCountDetail', label: '주택 거주 세대/가구원세대수', unit: '세대' },
  { type: 'radio', key: 'patrolActivity', label: '경찰 순찰 활동' },
  { type: 'radio', key: 'cctv', label: '주택 주변 방범용 CCTV' },
  { type: 'stepper', key: 'cctvCount', label: '주택 주변 방범용 CCTV 대수', unit: '대' },
  { type: 'radio', key: 'dayTraffic', label: '주간 주택 주변 거주자 왕래' },
  { type: 'radio', key: 'nightTraffic', label: '야간 주택 주변 거주자 왕래' },
  { type: 'radio', key: 'fenceHeight', label: '담장 높이 및 투시성' },
  { type: 'radio', key: 'windowVisibility', label: '창문의 투시성' },
  { type: 'radio', key: 'alleyVisibility', label: '주택 골목길 가시성' },
  { type: 'radio', key: 'streetFacility', label: '주택 주변 가로시설물' },
  { type: 'stepper', key: 'surveillanceFacilityCount', label: '주택 주변 감시방행시설물', unit: '개' },
  { type: 'radio', key: 'streetLightDistance', label: '가로등 거리' },
  { type: 'stepper', key: 'streetLightMaxDistance', label: '가로등 최대거리', unit: 'm' },
  { type: 'radio', key: 'streetLightBrightness', label: '가로등 밝기' },
  { type: 'stepper', key: 'streetLightLux', label: '가로등 조도', unit: 'lux' },
  { type: 'radio', key: 'buildingDistance', label: '건물 간 거리' },
  { type: 'stepper', key: 'buildingMinDistance', label: '건물 간 최단거리', unit: 'm' },
  { type: 'radio', key: 'doorLock', label: '출입문 시정장치' },
  { type: 'radio', key: 'gasPipeRisk', label: '가스 배관 등 침입용이성' },
  { type: 'radio', key: 'securityWindow', label: '방범창호의 설치여부' },
  { type: 'stepper', key: 'securityWindowCount', label: '방범창호개수', unit: '개' },
  { type: 'radio', key: 'cleanliness', label: '쓰레기 투기 등 청결도' },
  { type: 'radio', key: 'buildingAge', label: '주택의 노후도 및 관리 정도' },
]

/** 2) 추가 항목 — 전부 수량 스테퍼, 점수에는 포함되지 않는다 */
export const extraAssessmentRows: AssessmentStepperRow[] = [
  { type: 'stepper', key: 'mirror', label: '반사경 및 미러시트', unit: '개' },
  { type: 'stepper', key: 'doorLockDevice', label: '출입문 방범보조장치(도어락, 특수보조키 등)', unit: '개' },
  { type: 'stepper', key: 'intrusionSensor', label: '감지형 침입경보장치(진동, 적외선, 열, 파손)', unit: '개' },
  { type: 'stepper', key: 'securityLight', label: '보안조명(감지센서, 스마트조명 등)', unit: '개' },
  { type: 'stepper', key: 'emergencyBell', label: '비상벨(감지형 포함)', unit: '개' },
]

/** 좌측 현황에 새 건을 등록하는 팝업(PM-PUB-0114)의 입력값 */
export interface NewDiagnosisForm {
  department: DepartmentValue
  type: string
  diagnosisDate: string
  address: string
  detailAddress: string
  district: string
  districtOffice: string
  reason: string
  bizName: string
  houseOwner: string
  applicant: string
  contact: string
  householdCount: number
  floorCount: number
  moveInYear: number
  crimePreventionStatus: string
  previousCrimeDamage: string
  damageCount: number
  improvementDate: string
  improvementStatus: string
  etcLabel: string
  etcCount: number
  note: string
  emailNotify: boolean
}

function createEmptyNewDiagnosisForm(): NewDiagnosisForm {
  return {
    department: { level1: 'hq', level2: 'all', level3: 'all' },
    type: '',
    diagnosisDate: '',
    address: '',
    detailAddress: '',
    district: '',
    districtOffice: '',
    reason: '',
    bizName: '',
    houseOwner: '',
    applicant: '',
    contact: '',
    householdCount: 0,
    floorCount: 0,
    moveInYear: 0,
    crimePreventionStatus: 'new',
    previousCrimeDamage: 'no',
    damageCount: 0,
    improvementDate: '',
    improvementStatus: '',
    etcLabel: '',
    etcCount: 0,
    note: '',
    emailNotify: false,
  }
}

/** 라디오는 미선택(0), 스테퍼는 0개로 시작한다 */
function createEmptyAssessmentValues(): Record<string, number> {
  const values: Record<string, number> = {}
  for (const row of [...buildingAssessmentRows, ...extraAssessmentRows]) values[row.key] = 0
  return values
}

/** TODO: API 연동 전까지 쓰는 더미 목록. 시안의 "총 195건" 을 그대로 맞춰둔다. */
const DEPTS = ['남포지구대', '중부지구대', '대청파출소', '광복파출소']
const BIZ_NAMES = ['고심정사', '대청상가', '광복빌라', '중앙마트', '남포전자']
const TYPES = ['기타', '상가', '공동주택', '단독주택']
const BASE_ADDRESS = '부산광역시 중구 대청로 135'
const DETAIL_ADDRESS = '102동 21'

function createRows(total: number): CpoDiagnosisRow[] {
  return Array.from({ length: total }, (_, index) => {
    // 번호는 최신 건이 위로 오도록 내림차순
    const no = total - index
    return {
      no,
      dept: DEPTS[no % DEPTS.length],
      type: TYPES[no % TYPES.length],
      bizName: BIZ_NAMES[no % BIZ_NAMES.length],
      score: 30 + (no % 7) * 10,
      diagnoser: '홍길동',
      baseAddress: BASE_ADDRESS,
      detailAddress: `${DETAIL_ADDRESS}${(no % 9) + 1}호`,
      cashIntensive: no % 7 === 0 ? '해당' : '해당없음',
    }
  })
}

/**
 * 선택한 건의 진단통보(우편) 이력.
 * 실제로는 관리번호로 이력을 다시 조회해 오는 자리다. 지금은 같은 건이 여러 번 통보된
 * 모습을 보여주려고 선택 행에서 2건을 만들어 둔다.
 */
function createHistoryRows(row: CpoDiagnosisRow | null): CpoHistoryRow[] {
  if (!row) return []
  return [0, 1].map((offset) => ({
    id: row.no * 10 + offset,
    diagnosedAt: '2026-06-16',
    bizName: row.bizName,
    address: `${row.baseAddress} ${row.detailAddress}`,
    mailRequested: '아니오',
    mailStatus: '미발송',
    diagnoser: row.diagnoser,
  }))
}

/**
 * CPO 입력 · 관리 목록 화면 상태.
 *
 * 좌측 현황에서 고른 행 하나가 우측 이력의 조회 조건이다. 이력은 체크박스로 선택 삭제할
 * 수 있어야 하므로 파생값이 아니라 별도의 뮤터블 상태로 들고 있는다.
 */
export function useCpoList() {
  /** 시안은 상세조회가 펼쳐진 상태로 열린다 */
  const advancedSearchOpen = ref(false)

  const searchForm = ref<CpoSearchForm>({
    department: { level1: 'hq', level2: 'all', level3: 'all' },
    detailAddress: '',
    sortBy: 'default',
    managementNo: '',
    bizName: '',
    type: 'all',
    facilityImproved: 'all',
    hasNotice: 'all',
    cashIntensive: 'all',
    diagnosedFrom: '2026-07-16',
    diagnosedTo: '',
    reason: 'all',
    diagnoser: '',
  })

  const rows = ref<CpoDiagnosisRow[]>(createRows(195))
  /** 다른 화면(PM-PUB-0101)과 동일하게, 화면 진입 시에는 아무 건도 선택되어 있지 않다.
   *  좌측 목록에서 행을 클릭해야 그 건의 이력이 우측에 뜬다. */
  const selectedRow = ref<CpoDiagnosisRow | null>(null)
  const historyRows = ref<CpoHistoryRow[]>([])

  /** 좌측 선택 행이 바뀌면 우측 이력을 새로 채운다(직접 편집 가능한 로컬 상태) */
  watch(selectedRow, (row) => {
    historyRows.value = createHistoryRows(row)
  })

  function selectRow(row: CpoDiagnosisRow | null) {
    selectedRow.value = row
  }

  function search() {
    // TODO: API 연동. 지금은 더미 목록이라 조회 조건이 결과에 반영되지 않는다.
    toast.success('조회되었습니다.')
  }

  /** 신규 등록 팝업(PM-PUB-0114) 상태 */
  const newDiagnosisDialogOpen = ref(false)
  const newDiagnosisForm = reactive<NewDiagnosisForm>(createEmptyNewDiagnosisForm())
  const assessmentValues = reactive<Record<string, number>>(createEmptyAssessmentValues())

  /** 건물특성(라디오)만 점수에 들어간다 — 추가 항목/기타 수량은 참고용이라 더하지 않는다 */
  const totalScore = computed(() =>
    buildingAssessmentRows
      .filter((row): row is AssessmentRadioRow => row.type === 'radio')
      .reduce((sum, row) => sum + (assessmentValues[row.key] || 0), 0),
  )

  function openNewDiagnosis() {
    Object.assign(newDiagnosisForm, createEmptyNewDiagnosisForm())
    Object.assign(assessmentValues, createEmptyAssessmentValues())
    newDiagnosisDialogOpen.value = true
  }

  function cancelNewDiagnosis() {
    newDiagnosisDialogOpen.value = false
  }

  function saveNewDiagnosis() {
    // TODO: API 연동. 지금은 목록 맨 앞에 새 행을 끼워 넣는 것으로 등록을 흉내낸다.
    const nextNo = rows.value.reduce((max, row) => Math.max(max, row.no), 0) + 1
    rows.value = [
      {
        no: nextNo,
        dept: DEPTS[nextNo % DEPTS.length],
        type: typeOptions.find((o) => o.value === newDiagnosisForm.type)?.label ?? '',
        bizName: newDiagnosisForm.bizName,
        score: totalScore.value,
        diagnoser: '홍길동',
        baseAddress: newDiagnosisForm.address,
        detailAddress: newDiagnosisForm.detailAddress,
        cashIntensive: '해당없음',
      },
      ...rows.value,
    ]
    newDiagnosisDialogOpen.value = false
    toast.success('등록되었습니다.')
  }

  function openNewHistory() {
    // TODO: 진단통보 이력 신규 등록 팝업 연결
    toast.info('이력 등록 화면은 준비 중입니다.')
  }

  function printKeep() {
    // TODO: 범죄예방진단결과(보관용) 출력 연동
    toast.info('보관용 진단결과를 준비 중입니다.')
  }

  function printCpoConfirm() {
    // TODO: 범죄예방진단결과(CPO확인용) 출력 연동
    toast.info('CPO확인용 진단결과를 준비 중입니다.')
  }

  function sendNotice() {
    // TODO: 진단통보 우편 발송 연동
    toast.info('진단통보 우편 발송은 준비 중입니다.')
  }

  return {
    advancedSearchOpen,
    searchForm,
    rows,
    selectedRow,
    historyRows,
    selectRow,
    search,
    newDiagnosisDialogOpen,
    newDiagnosisForm,
    assessmentValues,
    totalScore,
    openNewDiagnosis,
    cancelNewDiagnosis,
    saveNewDiagnosis,
    openNewHistory,
    printKeep,
    printCpoConfirm,
    sendNotice,
  }
}
