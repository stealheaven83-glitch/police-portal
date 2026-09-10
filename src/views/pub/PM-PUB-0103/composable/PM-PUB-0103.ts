import { computed, reactive, ref, watch } from 'vue'
import { useDialog } from '@/composable/dialog/dialog'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

export interface SelectOption {
  label: string
  value: string
}

/** 좌측 'CPO 범죄예방진단 현황' 한 행 */
export interface CpoDiagnosisRow {
  /** 화면에 보이는 번호이자 이력 조회 키 */
  no: number
  /** 진단일자 — PC-PUB-0105(CPO 확인용) 좌측 목록에 뜬다 */
  diagnosedAt: string
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
  /**
   * 간이진단통보자료(PM-PUB-0109) 보유 여부.
   * TODO: API 연동 시 실제 자료 유무로 대체. 없으면 버튼을 눌러도 알림창만 뜬다.
   */
  hasSimpleNotice: boolean
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

/** 신규 등록 카드의 현금다액업소 여부 — 검색조건의 cashOptions(해당/해당없음)와 달리 기획서 표기가 여/부다 */
export const cashIntensiveOptions: SelectOption[] = [
  { label: '여', value: 'y' },
  { label: '부', value: 'n' },
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

/** 시설개선(예정) 상태 — 진단 추가(PM-PUB-0106)는 기획서상 완료/미완료 두 가지다 */
export const improvementDoneOptions: SelectOption[] = [
  { label: '완료', value: 'done' },
  { label: '미완료', value: 'notDone' },
]

/** 참고사항 한 줄 — 항목명 + 등급 + 수치 */
export interface ReferenceStat {
  label: string
  grade: string
  value: string
}

/** 참고사항 1) 범죄 특성 (시안 기준 표시값) */
export const crimeStats: ReferenceStat[] = [
  { label: '강력/절도/폭력/지능범죄', grade: '보통', value: '618' },
  { label: '112신고(Code()/1/2)', grade: '보통', value: '8823' },
]

/** 참고사항 2) 인구 사회학적 특성 (시안 기준 표시값) */
export const demographicStats: ReferenceStat[] = [
  { label: '인구 밀도', grade: '보통', value: '6729' },
  { label: '지역 결속력', grade: '보통', value: '111' },
  { label: '기초생활수급자수', grade: '보통', value: '111' },
  { label: '1인가구 비율', grade: '위험', value: '0' },
  { label: '외국인 비율', grade: '양호', value: '0' },
  { label: '관리대상자수', grade: '위험', value: '0' },
  { label: '풍속업소 수', grade: '보통', value: '173' },
  { label: '설문조사 결과', grade: '보통', value: '0' },
]

/** 좌측 현황에 새 건을 등록하는 팝업(PM-PUB-0114)의 입력값 */
export interface NewDiagnosisForm {
  department: DepartmentValue
  /** 진단 추가(PM-PUB-0106)에서만 쓰는 읽기 전용 관리번호 */
  managementNo: string
  type: string
  diagnosisDate: string
  address: string
  detailAddress: string
  district: string
  districtOffice: string
  cashIntensive: string
  reason: string
  bizName: string
  houseOwner: string
  applicant: string
  /** 진단 추가(PM-PUB-0106)의 관리자 */
  manager: string
  contact: string
  householdCount: number
  /** 진단 추가(PM-PUB-0106)의 직원수 */
  employeeCount: number
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
    managementNo: '',
    type: '',
    diagnosisDate: '',
    address: '',
    detailAddress: '',
    district: '',
    districtOffice: '',
    cashIntensive: 'y',
    reason: '',
    bizName: '',
    houseOwner: '',
    applicant: '',
    manager: '',
    contact: '',
    householdCount: 0,
    employeeCount: 0,
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
      diagnosedAt: '2026-06-24',
      dept: DEPTS[no % DEPTS.length],
      type: TYPES[no % TYPES.length],
      bizName: BIZ_NAMES[no % BIZ_NAMES.length],
      score: 30 + (no % 7) * 10,
      diagnoser: '홍길동',
      baseAddress: BASE_ADDRESS,
      detailAddress: `${DETAIL_ADDRESS}${(no % 9) + 1}호`,
      cashIntensive: no % 7 === 0 ? '해당' : '해당없음',
      /* 목업: 3의 배수 건은 자료가 없는 것으로 둬서 알림창 경로도 확인할 수 있게 한다 */
      hasSimpleNotice: no % 3 !== 0,
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
  const dialog = useDialog()

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

  /** 좌측 행을 다시 클릭한 경우에도 우측 이력을 확실히 새로 채운다. */
  function selectRow(row: CpoDiagnosisRow | null) {
    selectedRow.value = row
    historyRows.value = createHistoryRows(row)
  }


  /** 신규 등록 팝업(PM-PUB-0114) 상태 */
  const newDiagnosisDialogOpen = ref(false)
  const newHistoryDialogOpen = ref(false)
  const detailDialogOpen = ref(false)
  const photoDialogOpen = ref(false)
  const simpleNoticeDialogOpen = ref(false)
  const diagnosisHistoryDialogOpen = ref(false)
  const keepResultDialogOpen = ref(false)
  const cpoResultDialogOpen = ref(false)
  const mailNoticeDialogOpen = ref(false)
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

  /** 목록/이력에서 선택한 진단 건을 긴 공용 진단 폼에 채운다. */
  function loadDiagnosis(row: CpoDiagnosisRow) {
    Object.assign(newDiagnosisForm, createEmptyNewDiagnosisForm(), {
      managementNo: `2026${String(row.no).padStart(6, '0')}`,
      type: typeOptions.find((option) => option.label === row.type)?.value ?? 'etc',
      diagnosisDate: '2026-06-16',
      address: row.baseAddress,
      detailAddress: row.detailAddress,
      district: 'daecheong',
      districtOffice: row.dept,
      cashIntensive: row.cashIntensive === '해당' ? 'y' : 'n',
      reason: 'patrol',
      bizName: row.bizName,
      houseOwner: '성명불상',
      applicant: '홍길동',
      manager: '성명불상',
      contact: '01012342341',
      householdCount: 4,
      employeeCount: 6,
      floorCount: 4,
      moveInYear: 1999,
      crimePreventionStatus: 'continue',
      previousCrimeDamage: 'no',
      damageCount: 3,
      note: '시골 농촌지역으로 파출소 근처에 있어 대체로 위험성이 없는 편임.',
      emailNotify: historyRows.value[0]?.mailRequested === '예',
    })
    Object.assign(assessmentValues, createEmptyAssessmentValues())
    for (const item of buildingAssessmentRows) {
      assessmentValues[item.key] = item.type === 'radio' ? 3 : 4
    }
    assessmentValues.cctvCount = 2
    assessmentValues.surveillanceFacilityCount = 1
    assessmentValues.streetLightMaxDistance = 20
    assessmentValues.streetLightLux = 20
    assessmentValues.buildingMinDistance = 10
    for (const item of extraAssessmentRows) assessmentValues[item.key] = 4
  }

  function getActiveDiagnosis() {
    const row = selectedRow.value ?? rows.value[0] ?? null
    if (row && selectedRow.value?.no !== row.no) selectRow(row)
    return row
  }

  async function openNewHistory() {
    const row = getActiveDiagnosis()
    if (!row) {
      await dialog.alert({ title: '진단 건을 먼저 선택해 주세요.', btnCancel: '확인' })
      return
    }
    loadDiagnosis(row)
    newHistoryDialogOpen.value = true
  }

  function openDetail(row?: CpoDiagnosisRow | null) {
    const target = row ?? getActiveDiagnosis()
    if (!target) return
    if (selectedRow.value?.no !== target.no) selectRow(target)
    loadDiagnosis(target)
    detailDialogOpen.value = true
  }

  async function saveNewHistory() {
    const row = getActiveDiagnosis()
    if (!row) return
    historyRows.value = [
      {
        id: Date.now(),
        diagnosedAt: newDiagnosisForm.diagnosisDate || '2026-06-16',
        bizName: newDiagnosisForm.bizName || row.bizName,
        address: `${newDiagnosisForm.address || row.baseAddress} ${newDiagnosisForm.detailAddress || row.detailAddress}`,
        mailRequested: newDiagnosisForm.emailNotify ? '예' : '아니오',
        mailStatus: '미발송',
        diagnoser: '홍길동',
      },
      ...historyRows.value,
    ]
    await dialog.alert({ title: '등록 되었습니다.' })
    newHistoryDialogOpen.value = false
  }

  async function saveDetail() {
    const mailRequested = newDiagnosisForm.emailNotify ? '예' : '아니오'
    historyRows.value = historyRows.value.map((row) => ({ ...row, mailRequested }))
    await dialog.alert({ title: '등록 되었습니다.' })
    detailDialogOpen.value = false
  }

  function openPhotoData() {
    getActiveDiagnosis()
    photoDialogOpen.value = true
  }

  /**
   * 상세(PM-PUB-0107)에서 '사진자료' 로 진입하는 경로.
   * 기획서상 사진자료는 별도 화면ID(PM-PUB-0108)라, 상세 팝업을 겹쳐 두지 않고 닫아
   * useAutoTrigger 역방향 동기화가 화면ID를 PM-PUB-0108 로 바꾸게 한다
   * (두 팝업이 동시에 열려 있으면 어느 화면ID 조건도 완전히 일치하지 않아 0107 에 머문다).
   */
  function openPhotoDataFromDetail() {
    detailDialogOpen.value = false
    openPhotoData()
  }

  /**
   * 기획서: 자료가 있으면 간이진단통보자료(PM-PUB-0109)를 열고, 없으면 알림창만 띄운다.
   * 세 곳(0105 CPO확인용 · 0114 신규 · 0106 진단추가)의 버튼이 모두 이 함수로 모이므로
   * 존재 여부 판단도 여기 한 곳에서 한다.
   */
  async function openSimpleNoticeData() {
    const row = getActiveDiagnosis()
    if (!row?.hasSimpleNotice) {
      await dialog.alert({ title: '간이진단통보자료가 없습니다.' })
      return
    }
    simpleNoticeDialogOpen.value = true
  }

  function openDiagnosisHistory() {
    getActiveDiagnosis()
    diagnosisHistoryDialogOpen.value = true
  }

  function cancelNewDiagnosis() {
    newDiagnosisDialogOpen.value = false
  }

  async function saveNewDiagnosis() {
    // TODO: API 연동. 지금은 목록 맨 앞에 새 행을 끼워 넣는 것으로 등록을 흉내낸다.
    const nextNo = rows.value.reduce((max, row) => Math.max(max, row.no), 0) + 1
    rows.value = [
      {
        no: nextNo,
        diagnosedAt: newDiagnosisForm.diagnosisDate || '2026-06-24',
        dept: DEPTS[nextNo % DEPTS.length],
        type: typeOptions.find((o) => o.value === newDiagnosisForm.type)?.label ?? '',
        bizName: newDiagnosisForm.bizName,
        score: totalScore.value,
        diagnoser: '홍길동',
        baseAddress: newDiagnosisForm.address,
        detailAddress: newDiagnosisForm.detailAddress,
        cashIntensive: '해당없음',
        /* 새로 등록한 건은 아직 간이진단통보자료가 없다 */
        hasSimpleNotice: false,
      },
      ...rows.value,
    ]
    await dialog.alert({ title: '등록 되었습니다.' })
    newDiagnosisDialogOpen.value = false
  }

  function printKeep() {
    getActiveDiagnosis()
    keepResultDialogOpen.value = true
  }

  function printCpoConfirm() {
    const row = getActiveDiagnosis()
    if (row) loadDiagnosis(row)
    cpoResultDialogOpen.value = true
  }

  function sendNotice() {
    getActiveDiagnosis()
    mailNoticeDialogOpen.value = true
  }

  /**
   * 이력 그리드가 다 만들어졌는지 여부와, 그전에 들어온 작업을 담아두는 자리.
   *
   * URL 로 팝업 화면ID(PC-PUB-0105 · PM-PUB-0106/0107)에 직접 들어오면 useAutoTrigger 가 마운트
   * 도중 팝업을 열고, 아래 워처가 대표 진단 건을 채우면서 historyRows 를 갈아끼운다.
   * 그런데 그 시점엔 Tabulator 가 아직 build 중이라 setData 가 내부에서 터진다
   * (TypeError: reading 'verticalFillMode'). 그래서 그리드가 준비됐다고 알려줄 때까지
   * 미뤄뒀다가 실행한다.
   */
  const historyGridReady = ref(false)
  let pendingAutoLoad: (() => void) | null = null

  function markHistoryGridReady() {
    historyGridReady.value = true
    const job = pendingAutoLoad
    pendingAutoLoad = null
    job?.()
  }

  function runWhenHistoryGridReady(job: () => void) {
    if (historyGridReady.value) job()
    else pendingAutoLoad = job
  }

  /** 화면ID로 팝업에 직접 진입한 경우에도 상세 폼에 대표 진단 건을 채운다. */
  watch([newHistoryDialogOpen, detailDialogOpen, cpoResultDialogOpen], (states, previous) => {
    if (!states.some((state, index) => state && !previous?.[index])) return
    runWhenHistoryGridReady(() => {
      const row = getActiveDiagnosis()
      if (row) loadDiagnosis(row)
    })
  })

  return {
    advancedSearchOpen,
    searchForm,
    rows,
    selectedRow,
    historyRows,
    markHistoryGridReady,
    selectRow,
    /** PC-PUB-0105 팝업 안 목록에서 다른 건을 고르면 상세 폼을 다시 채우는 데 쓴다 */
    loadDiagnosis,
    newDiagnosisDialogOpen,
    newHistoryDialogOpen,
    detailDialogOpen,
    photoDialogOpen,
    simpleNoticeDialogOpen,
    diagnosisHistoryDialogOpen,
    keepResultDialogOpen,
    cpoResultDialogOpen,
    mailNoticeDialogOpen,
    newDiagnosisForm,
    assessmentValues,
    totalScore,
    openNewDiagnosis,
    cancelNewDiagnosis,
    saveNewDiagnosis,
    openNewHistory,
    saveNewHistory,
    openDetail,
    saveDetail,
    openPhotoData,
    openPhotoDataFromDetail,
    openSimpleNoticeData,
    openDiagnosisHistory,
    printKeep,
    printCpoConfirm,
    sendNotice,
  }
}
