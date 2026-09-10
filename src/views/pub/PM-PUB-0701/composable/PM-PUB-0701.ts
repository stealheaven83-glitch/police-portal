import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 물리력 사용 보고서 (PM-PUB-0701)
 *
 * 좌측 목록에서 한 건을 고르면 우측 보고서가 그 건으로 바뀐다(시안 13462:140685).
 * 결재 처리·저장·주소 검색은 개발팀 몫이고 여기서는 목업 배열만 다룬다.
 *
 * 체크박스 묶음은 `Record<문자열, boolean>` 으로 둔다 — 항목이 많아 하나씩 필드를 만들면
 * 폼이 읽히지 않고, Checkbox 컴포넌트가 배열 v-model 을 받지 않는다(PC-PUB-0208 과 같은 방식).
 */

/** 목록 한 행 */
export interface ForceReportRow {
  rowKey: string
  no: number
  /** 결재 상태 */
  approval: string
  dept: string
  user: string
  target: string
  usedAt: string
}

/** 결재선 한 칸 (0702 와 같은 구조 — 두 화면이 같은 결재선 표를 쓴다) */
export interface ApprovalStep {
  kind: 'draft' | 'approver'
  /** 표 머리에 나오는 이름 — '기안자' '1차 결재자' … */
  role: string
  /** '경위 홍길동'. 아직 지정 전이면 빈 문자열 */
  person: string
  /** 기안자는 날짜, 결재자는 '결재완료' '결재대기' 같은 상태 */
  status: string
  /** 이 칸에서 누를 수 있는 것 — 'withdraw'(결재회수) | 'decide'(반려·결재) | 'none' */
  action: 'withdraw' | 'decide' | 'none'
  /** 아직 사람을 안 정한 칸이면 셀렉트를 보여준다 */
  selectable: boolean
}

/** 사용자 정보 한 행 — 기획서 5: 최대 4명 */
export interface ReportUser {
  no: number
  dept: string
  rank: string
  name: string
}

/** 사용자 정보는 최대 4명까지 등록한다(기획서 13-5) */
export const MAX_REPORT_USERS = 4

/** 총기류 — 일련번호·사용 개수를 같이 적는 항목(기획서 13-3-1) */
export const gunForceOptions = [
  { id: 'pistol-real', label: '권총 (실제사격)', unit: '(발)' },
  { id: 'pistol-warn', label: '권총 (경고사격)', unit: '(발)' },
  { id: 'taser-probe', label: '전자충격기 (전극침)', unit: '(정)' },
  { id: 'taser-stun', label: '전자충격기 (스턴)', unit: '(정)' },
]

/** 그 밖의 물리력 — 체크만 한다 */
export const forceOptions = [
  { id: 'spray', label: '분사기' },
  { id: 'baton', label: '경찰봉 (삼단봉)' },
  { id: 'shield', label: '방패 (모든 방패)' },
  { id: 'cuffs', label: '수갑' },
  { id: 'rope', label: '포승' },
  { id: 'physical', label: '신체적 물리력' },
]

export const damageOptions = [
  { id: 'none', label: '피해 없음' },
  { id: 'scratch', label: '경미한 찰과상' },
  { id: 'bruise', label: '타박상' },
  { id: 'bleeding', label: '출혈을 동반한 상처' },
  { id: 'fracture', label: '골절' },
  { id: 'faint', label: '기절' },
  { id: 'serious', label: '중상해' },
  { id: 'death', label: '사망' },
]

/** 정신상태 — 주취(택 1) */
export const drunkOptions = [
  { value: 'slight', label: '약간' },
  { value: 'drunk', label: '만취' },
  { value: 'unconscious', label: '인사불성' },
  { value: 'none', label: '해당 없음' },
]

export const mentalIllnessOptions = [
  { id: 'epilepsy', label: '간질' },
  { id: 'autism', label: '자폐' },
  { id: 'schizophrenia', label: '정신분열' },
  { id: 'disability', label: '기타 지적장애' },
  { id: 'unknown', label: '불상' },
]

export const addictionOptions = [
  { id: 'drug', label: '마약' },
  { id: 'bond', label: '본드' },
  { id: 'cannabis', label: '대마초' },
  { id: 'etc-drug', label: '기타 약물' },
  { id: 'unknown', label: '불상' },
]

/** 신체상태 — 체격(택 1) */
export const buildOptions = [
  { value: 'big', label: '거구' },
  { value: 'small', label: '왜소' },
  { value: 'strong', label: '다부진 체격' },
  { value: 'normal', label: '보통' },
]

export const disabilityOptions = [
  { id: 'deaf', label: '농아자' },
  { id: 'blind', label: '시각장애' },
  { id: 'physical', label: '기타 지체장애' },
]

export const medicalHistoryOptions = [
  { id: 'internal', label: '내과질환' },
  { id: 'surgical', label: '외과질환' },
  { id: 'unknown', label: '불상' },
]

/** 흉기 종류 — '흉기 있음' 일 때만 고를 수 있다(기획서 15-1-2) */
export const weaponOptions = [
  { id: 'gun', label: '총기류' },
  { id: 'knife', label: '칼' },
  { id: 'pipe', label: '쇠파이프' },
  { id: 'club', label: '각목' },
  { id: 'car', label: '차량' },
]

export const sceneOptions = [
  { id: 'disturb', label: '단순 소란' },
  { id: 'assault', label: '공격 (폭행)' },
  { id: 'destroy', label: '공격 (손괴)' },
  { id: 'selfharm', label: '자해' },
  { id: 'suicide', label: '자살' },
  { id: 'escape', label: '도주' },
  { id: 'riot', label: '난동 (소요)' },
]

export const behaviorOptions = [
  { id: 'refuse', label: '이동거부 / 물체 잡고 버팀' },
  { id: 'strike', label: '신체가격 (임박)' },
  { id: 'weapon-attack', label: '총기 · 흉기 · 둔기로 공격 (임박)' },
  { id: 'shake-off', label: '강하게 뿌리치기' },
  { id: 'group-strike', label: '2인 이상 신체가격 (임박)' },
  { id: 'severe', label: '생명 · 신체에 심각한 위해를 가하는 폭력 행사 (임박)' },
  { id: 'push', label: '신체밀기 / 당기기' },
  { id: 'threat', label: '흉기 · 둔기로 위협하며 저항' },
  { id: 'lethal', label: '2명 이상 치명적 공격 (임박)' },
  { id: 'property', label: '재물 손괴 등 공공위해' },
  { id: 'selfharm', label: '자해 · 자살 행위' },
  { id: 'take-weapon', label: '무기 · 장구 탈출시도' },
]

export const escapeOptions = [
  { id: 'try', label: '도주시도' },
  { id: 'simple', label: '단순도주' },
  { id: 'vehicle', label: '차량주행도주' },
  { id: 'harm', label: '인적 · 물적 위해를 가하는 도주' },
]

/** 사용일시 — 주간/야간/심야(택 1) */
export const timeZoneOptions = [
  { value: 'day', label: '주간' },
  { value: 'night', label: '야간' },
  { value: 'midnight', label: '심야' },
]

export const placeOptions = [
  { id: 'indoor', label: '실내' },
  { id: 'crowded', label: '다중 밀집 지역' },
  { id: 'field', label: '공터' },
  { id: 'street', label: '대로변' },
  { id: 'alley', label: '골목' },
]

/** 경고 — '있음' 일 때만 고를 수 있다(기획서 17-1) */
export const warningOptions = [
  { id: 'verbal', label: '구두경고' },
  { id: 'blank', label: '공포탄' },
  { id: 'live', label: '실탄 경고사격' },
]

/** 기간구분 — sentinel 은 '' 가 아니라 실제 값(CLAUDE.md §5) */
export const periodTypeOptions = [
  { label: '사용일', value: 'used' },
  { label: '작성일', value: 'written' },
  { label: '결재일', value: 'approved' },
]

export const userTypeOptions = [
  { label: '전체', value: 'all' },
  { label: '작성자', value: 'writer' },
  { label: '결재자', value: 'approver' },
]

export const approverOptions = [
  { label: '경정 김길동', value: 'kim' },
  { label: '경감 이영수', value: 'lee' },
  { label: '경위 홍길동', value: 'hong' },
]

/** 우측 보고서 본문 */
export interface ForceReportDetail {
  /* 사용 물리력 */
  forces: Record<string, boolean>
  gunSerial: Record<string, string>
  gunCount: Record<string, string>
  forceEtc: boolean
  forceEtcText: string
  /* 피해 상황 */
  damages: Record<string, boolean>
  damageEtc: boolean
  damageEtcText: string
  /* 대상자 정보 — 기본 정보 */
  targetName: string
  /** 'male' | 'female' */
  targetGender: string
  targetBirth: string
  targetAge: string
  targetPhone: string
  targetAddress: string
  targetAddressDetail: string
  /* 대상자 정보 — 정신/신체 상태 */
  noSpecial: boolean
  drunk: string
  mentalIllness: Record<string, boolean>
  addiction: Record<string, boolean>
  build: string
  disability: Record<string, boolean>
  medicalHistory: Record<string, boolean>
  /* 대상자 정보 — 흉기 휴대 */
  /** 'yes' | 'no' */
  hasWeapon: string
  weapons: Record<string, boolean>
  weaponEtc: boolean
  weaponEtcText: string
  /** 기타 소지 물건 — 흉기 유무와 무관하게 입력한다(기획서 15-1-3) */
  weaponOther: string
  /* 현장 상황 */
  scenes: Record<string, boolean>
  sceneEtc: boolean
  sceneEtcText: string
  /* 상황(상세) */
  behaviors: Record<string, boolean>
  behaviorEtc: boolean
  behaviorEtcText: string
  escapes: Record<string, boolean>
  escapeEtc: boolean
  escapeEtcText: string
  /* 사용일시 */
  timeZone: string
  usedDate: string
  usedTime: string
  /* 사용 장소 */
  places: Record<string, boolean>
  placeEtc: boolean
  placeEtcText: string
  /* 경고 */
  /** 'none' | 'yes' */
  warning: string
  warnings: Record<string, boolean>
  warningVerbalCount: string
  /* 목격자 */
  /** 'none' | 'yes' */
  witness: string
  witnessCount: string
  witnessInfo: string
  /* 서술형 */
  reason: string
  followUp: string
  note: string
}

function createMockRows(): ForceReportRow[] {
  const dept = '본청 범죄예방대응 지역경찰운영과'
  return [
    { rowKey: 'force-195', no: 195, approval: '1차 결재대기', dept, user: '홍길동', target: '김**', usedAt: '2026-07-01 14:20' },
    { rowKey: 'force-194', no: 194, approval: '1차 결재대기', dept, user: '김철수', target: '김**', usedAt: '2026-07-01 15:05' },
    { rowKey: 'force-193', no: 193, approval: '2차 결재대기', dept, user: '이영희', target: '김**', usedAt: '2026-07-02 09:40' },
    { rowKey: 'force-192', no: 192, approval: '결재완료', dept, user: '홍길동', target: '김**', usedAt: '2026-07-02 18:10' },
  ]
}

/**
 * 시안에는 결재선 표가 세 개 그려져 있다 — 결재자 미지정(신규), 기안자 시점(결재회수),
 * 결재자 시점(반려·결재). 같은 표의 세 상태라 데이터로 갈라 한 번만 그린다.
 */
function createApprovalLine(): ApprovalStep[] {
  return [
    { kind: 'draft', role: '기안자', person: '경위 홍길동', status: '2026-07-01', action: 'none', selectable: false },
    { kind: 'approver', role: '1차 결재자', person: '경감 이영수', status: '결재완료', action: 'none', selectable: false },
    { kind: 'approver', role: '2차 결재자', person: '경감 홍길동', status: '결재대기', action: 'withdraw', selectable: false },
    { kind: 'approver', role: '3차 결재자', person: '', status: '-', action: 'none', selectable: true },
  ]
}

function createEmptyDetail(): ForceReportDetail {
  return {
    forces: {},
    gunSerial: {},
    gunCount: {},
    forceEtc: false,
    forceEtcText: '',
    damages: {},
    damageEtc: false,
    damageEtcText: '',
    targetName: '',
    targetGender: '',
    targetBirth: '',
    targetAge: '',
    targetPhone: '',
    targetAddress: '',
    targetAddressDetail: '',
    noSpecial: false,
    drunk: '',
    mentalIllness: {},
    addiction: {},
    build: '',
    disability: {},
    medicalHistory: {},
    hasWeapon: '',
    weapons: {},
    weaponEtc: false,
    weaponEtcText: '',
    weaponOther: '',
    scenes: {},
    sceneEtc: false,
    sceneEtcText: '',
    behaviors: {},
    behaviorEtc: false,
    behaviorEtcText: '',
    escapes: {},
    escapeEtc: false,
    escapeEtcText: '',
    timeZone: '',
    usedDate: '',
    usedTime: '',
    places: {},
    placeEtc: false,
    placeEtcText: '',
    warning: '',
    warnings: {},
    warningVerbalCount: '',
    witness: '',
    witnessCount: '',
    witnessInfo: '',
    reason: '',
    followUp: '',
    note: '',
  }
}

export function useForceUseReport() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const advancedSearchOpen = ref(true)

  const periodType = ref('used')
  const periodFrom = ref('2026-07-16')
  const periodTo = ref('2026-07-16')
  const userType = ref('all')
  const searchName = ref('')

  const allRows = ref<ForceReportRow[]>(createMockRows())

  const rows = computed(() =>
    allRows.value.filter((row) => {
      if (searchName.value && !row.user.includes(searchName.value)) return false
      return true
    }),
  )

  /** 지금 우측 보고서에 떠 있는 행 */
  const activeRowKey = ref<string | null>(allRows.value[1]?.rowKey ?? null)

  const approvalLine = ref<ApprovalStep[]>(createApprovalLine())
  /** 3차 결재자처럼 아직 안 정한 칸에서 고른 값 */
  const nextApprover = ref('')

  const reportUsers = ref<ReportUser[]>([
    { no: 1, dept: '본청 범죄예방대응 지역경찰운영과 지역경찰기획계', rank: '경위', name: '홍길동' },
  ])

  const detail = ref<ForceReportDetail>(createEmptyDetail())

  function selectRow(rowKey: string) {
    if (!allRows.value.some((r) => r.rowKey === rowKey)) return
    activeRowKey.value = rowKey
    // 연동 전까지는 고른 행에 맞는 본문이 없어서 폼만 비운다
    detail.value = createEmptyDetail()
    approvalLine.value = createApprovalLine()
  }

  /** 기획서 11-3-1 '신규' — 목록 선택을 풀고 작성 중이던 내용을 지운다 */
  function createReport() {
    activeRowKey.value = null
    detail.value = createEmptyDetail()
    approvalLine.value = createApprovalLine()
  }

  /** 기획서 13-5-2 — 빈 자리에 사용자를 더한다(최대 4명) */
  function addReportUser() {
    if (reportUsers.value.length >= MAX_REPORT_USERS) return
    reportUsers.value = [
      ...reportUsers.value,
      {
        no: reportUsers.value.length + 1,
        dept: '본청 범죄예방대응 지역경찰운영과 지역경찰기획계',
        rank: '경사',
        name: '김순경',
      },
    ]
  }

  /** 기획서 13-5-1 — 사용자가 아닌 사람을 뺀다 */
  function removeReportUser(no: number) {
    reportUsers.value = reportUsers.value
      .filter((user) => user.no !== no)
      .map((user, index) => ({ ...user, no: index + 1 }))
  }

  /** 화면단 필수값 확인만 한다 — 서버 검증은 개발팀 몫 */
  function validateDetail(): string | null {
    const usedForce =
      gunForceOptions.some((o) => detail.value.forces[o.id]) ||
      forceOptions.some((o) => detail.value.forces[o.id]) ||
      detail.value.forceEtc
    if (!usedForce) return '사용 물리력을 선택해 주세요.'
    if (detail.value.forceEtc && !detail.value.forceEtcText.trim()) {
      return '사용 물리력(기타)을 입력해 주세요.'
    }
    if (!detail.value.targetName.trim()) return '대상자 성명을 입력해 주세요.'
    if (!detail.value.reason.trim()) return '사용 경위를 입력해 주세요.'
    return null
  }

  return {
    department,
    advancedSearchOpen,
    periodType,
    periodFrom,
    periodTo,
    userType,
    searchName,
    rows,
    activeRowKey,
    approvalLine,
    nextApprover,
    reportUsers,
    detail,
    selectRow,
    createReport,
    addReportUser,
    removeReportUser,
    validateDetail,
  }
}
