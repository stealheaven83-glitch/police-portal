import { computed, ref, type InjectionKey } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 아동학대 (PM-PUB-0202)
 *
 * 좌측 현황에서 한 건을 고르면 우측 '아동학대' 조사 서식이 그 건으로 바뀐다.
 * 112신고 조회 팝업이 이 화면에 붙는 화면군이라 상태를 여기서 한 번만 만들고
 * 화면에서 provide 한다 — CLAUDE.md §3 패턴A.
 */

/** 좌측 현황 한 행 */
export interface ChildAbuseRow {
  rowKey: string
  no: number
  receiptNo: string
  receiptDate: string
  receiptRoute: string
  caseSummary: string
  victimName: string
  victimPhone: string
}

/** 112신고 조회 팝업이 보여주는 신고 한 건 */
export interface Report112Row {
  rowKey: string
  receiptNo: string
  receivedAt: string
  progress: string
  place: string
  content: string
}

/** 체크박스 + 딸린 입력 한 쌍 */
export interface CheckWithText {
  checked: boolean
  text: string
}

/** 사람(피해아동 · 학대행위자) 인적사항 */
export interface AbusePerson {
  name: string
  /** 'male' | 'female' */
  gender: string
  birthDate: string
  phone: string
  /** 'kr' | 'etc' */
  nationality: string
  nationalityEtc: string
  address: string
  addressDetail: string
  residence: string
  residenceDetail: string
  /** 학대행위자만 쓴다 — 'father' | 'mother' | 'grandparent' | 'etc' */
  relation: string
  relationEtc: string
}

/** 현장확인 › 신체적 학대의 부위 한 칸 */
export interface BodyPart {
  id: string
  label: string
}

/** 시안의 부위 8칸 — 좌우 두 줄로 흐른다 */
export const bodyParts: BodyPart[] = [
  { id: 'eye', label: '㉠ 눈' },
  { id: 'head', label: '㉡ 머리' },
  { id: 'mouth', label: '㉢ 입 · 입안' },
  { id: 'ear', label: '㉣ 귀' },
  { id: 'limb', label: '㉤ 팔 · 다리(안쪽)' },
  { id: 'neck', label: '㉥ 목' },
  { id: 'torso', label: '㉦ 몸통(안쪽)' },
  { id: 'burn', label: '㉧ 화상' },
]

export const receiptRouteOptions = [
  { label: '전체', value: 'all' },
  { label: '112신고', value: '112신고' },
  { label: '고소장접수', value: '고소장접수' },
  { label: '기타', value: '기타' },
]

/** 국적(기타) — 실제 목록은 개발팀이 채운다 */
export const nationalityOptions = [
  { label: '중국', value: 'cn' },
  { label: '베트남', value: 'vn' },
  { label: '기타', value: 'etc' },
]

/** 아동과의 관계(기타) */
export const relationEtcOptions = [
  { label: '친척', value: 'relative' },
  { label: '동거인', value: 'cohabitant' },
  { label: '보육교사', value: 'teacher' },
]

export const jobOptions = [
  { label: '무직', value: 'none' },
  { label: '자영업', value: 'self' },
  { label: '회사원', value: 'employee' },
]

/** 통보 시각 */
export const noticeTimeOptions = ['08:15', '09:00', '10:00', '13:00', '15:00'].map((t) => ({
  label: t,
  value: t,
}))

/** 기준지 — (긴급) 아동 임시조치 2호의 기준 장소 */
export const baseLocationOptions = [
  { label: '주거', value: 'home' },
  { label: '학교', value: 'school' },
  { label: '보호시설', value: 'shelter' },
]

function createEmptyPerson(): AbusePerson {
  return {
    name: '',
    gender: '',
    birthDate: '',
    phone: '',
    nationality: 'kr',
    nationalityEtc: '',
    address: '',
    addressDetail: '',
    residence: '',
    residenceDetail: '',
    relation: '',
    relationEtc: '',
  }
}

function createCheck(): CheckWithText {
  return { checked: false, text: '' }
}

/** 우측 조사 서식 전체 */
export interface ChildAbuseDetail {
  /* 01 신고정보 */
  receiptRoute: string
  receiptRouteEtc: string
  receiptNo: string
  reportDate: string
  reportTime: string
  reportCount: string
  reporterVictim: boolean
  reporterFamily: boolean
  reporterAnonymous: boolean
  reporterEtc: CheckWithText
  reporterMandatory: CheckWithText
  reportContent: string

  /* 02 신상정보 */
  victim: AbusePerson
  offender: AbusePerson

  /* 03 발생정보 */
  occurredDate: string
  occurredTime: string
  /** 가정(내) — 'yes' | 'no' | 'unknown' */
  domesticViolence: string
  /** 가정(외) — 'institution' | 'public' | 'etc' */
  outsidePlace: string
  outsideInstitution: string
  outsidePublic: string
  outsideEtc: string
  /** 'yes' | 'no' */
  cctv: string

  /* 04 현장확인 */
  toolUsed: CheckWithText
  /** 부위 id → 체크 + 메모 */
  bodyParts: Record<string, CheckWithText>
  physicalNote: string
  sexualContact: boolean
  sexualExposure: boolean
  sexualCoercion: boolean
  sexualTrade: boolean
  sexualEtc: CheckWithText
  emotionalAbuse: boolean
  emotionalConfine: boolean
  emotionalExposure: boolean
  emotionalEtc: CheckWithText
  neglectNoGuardian: boolean
  neglectHunger: boolean
  neglectHygiene: boolean
  neglectEnvironment: boolean
  neglectEtc: CheckWithText

  /* 05 확인경로 */
  routeDirect: boolean
  routeVictim: boolean
  routeOffender: boolean
  routeReporter: boolean
  routeOther: boolean
  routeCctv: boolean
  routeEtc: CheckWithText

  /* 06 판단/조치/결과 */
  judgeFalseReport: boolean
  judgeRepeated: boolean
  judgeSevere: boolean
  resultOnSite: boolean
  emergency1: boolean
  emergency2: boolean
  emergency3: boolean
  emergency4: boolean
  emergency5: boolean
  emergency5Relation: string
  emergency5Name: string
  actionNote: string
  companyLocalGov: boolean
  companyChildAgency: boolean
  companyInvestigation: boolean
  companyApo: boolean
  companyEtc: CheckWithText

  /* (긴급) 아동 임시조치 내용 */
  urgentEnabled: boolean
  urgentOffenderJob: string
  urgentOffenderRelation: string
  urgentNoticeDate: string
  urgentNoticeTime: string
  urgentNoticePlace: string
  urgentMeasure1: boolean
  urgentMeasure2: boolean
  urgentMeasure2Base: string
  urgentMeasure2BaseEtc: string
  urgentMeasure3: boolean
}

function createEmptyDetail(): ChildAbuseDetail {
  return {
    receiptRoute: 'report112',
    receiptRouteEtc: '',
    receiptNo: '',
    reportDate: '',
    reportTime: '',
    reportCount: '0',
    reporterVictim: false,
    reporterFamily: false,
    reporterAnonymous: false,
    reporterEtc: createCheck(),
    reporterMandatory: createCheck(),
    reportContent: '',

    victim: createEmptyPerson(),
    offender: createEmptyPerson(),

    occurredDate: '',
    occurredTime: '',
    domesticViolence: '',
    outsidePlace: '',
    outsideInstitution: '',
    outsidePublic: '',
    outsideEtc: '',
    cctv: '',

    toolUsed: createCheck(),
    bodyParts: Object.fromEntries(bodyParts.map((p) => [p.id, createCheck()])),
    physicalNote: '',
    sexualContact: false,
    sexualExposure: false,
    sexualCoercion: false,
    sexualTrade: false,
    sexualEtc: createCheck(),
    emotionalAbuse: false,
    emotionalConfine: false,
    emotionalExposure: false,
    emotionalEtc: createCheck(),
    neglectNoGuardian: false,
    neglectHunger: false,
    neglectHygiene: false,
    neglectEnvironment: false,
    neglectEtc: createCheck(),

    routeDirect: false,
    routeVictim: false,
    routeOffender: false,
    routeReporter: false,
    routeOther: false,
    routeCctv: false,
    routeEtc: createCheck(),

    judgeFalseReport: false,
    judgeRepeated: false,
    judgeSevere: false,
    resultOnSite: false,
    emergency1: false,
    emergency2: false,
    emergency3: false,
    emergency4: false,
    emergency5: false,
    emergency5Relation: '',
    emergency5Name: '',
    actionNote: '',
    companyLocalGov: false,
    companyChildAgency: false,
    companyInvestigation: false,
    companyApo: false,
    companyEtc: createCheck(),

    urgentEnabled: false,
    urgentOffenderJob: '',
    urgentOffenderRelation: '',
    urgentNoticeDate: '',
    urgentNoticeTime: '',
    urgentNoticePlace: '',
    urgentMeasure1: false,
    urgentMeasure2: false,
    urgentMeasure2Base: '',
    urgentMeasure2BaseEtc: '',
    urgentMeasure3: false,
  }
}

function createMockRows(): ChildAbuseRow[] {
  return Array.from({ length: 7 }, (_, i) => ({
    rowKey: `abuse-${195 - i}`,
    no: 195 - i,
    receiptNo: '11112222333344',
    receiptDate: '2026-06-24',
    receiptRoute: i === 2 ? '고소장접수' : '112신고',
    caseSummary: '어쩌구저쩌구 ㄴㅇㄹㅇㄹ…',
    victimName: '홍길순',
    victimPhone: '010-1234-5678',
  }))
}

function createMock112Rows(): Report112Row[] {
  return [
    {
      rowKey: 'report-1',
      receiptNo: '11112222333344',
      receivedAt: '2026-06-16 08:08',
      progress: '미도착',
      place: '서울특별시 도봉구 행복로 111',
      content: '아동학대 신고',
    },
    {
      rowKey: 'report-2',
      receiptNo: '11112222333345',
      receivedAt: '2026-06-16 09:20',
      progress: '미종결',
      place: '서울특별시 중구 명동',
      content: '아동 방임 신고',
    },
  ]
}

function createChildAbuseSurvey() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const advancedSearchOpen = ref(true)

  const receiptFrom = ref('')
  const receiptTo = ref('')
  const searchRoute = ref('all')

  const allRows = ref<ChildAbuseRow[]>(createMockRows())

  const rows = computed(() =>
    allRows.value.filter((row) => {
      if (searchRoute.value !== 'all' && row.receiptRoute !== searchRoute.value) return false
      if (receiptFrom.value && row.receiptDate < receiptFrom.value) return false
      if (receiptTo.value && row.receiptDate > receiptTo.value) return false
      return true
    }),
  )

  const activeRowKey = ref<string | null>(null)
  const detail = ref<ChildAbuseDetail>(createEmptyDetail())

  function selectRow(rowKey: string) {
    const row = allRows.value.find((r) => r.rowKey === rowKey)
    if (!row) return
    activeRowKey.value = rowKey
    const next = createEmptyDetail()
    next.receiptNo = row.receiptNo
    next.reportDate = row.receiptDate
    next.victim.name = row.victimName
    next.victim.phone = row.victimPhone
    detail.value = next
  }

  function createRow() {
    activeRowKey.value = null
    detail.value = createEmptyDetail()
  }

  /* 112신고 조회 팝업 */
  const report112DialogOpen = ref(false)
  const report112Rows = ref<Report112Row[]>(createMock112Rows())
  const report112Keyword = ref('')

  const filtered112Rows = computed(() =>
    report112Rows.value.filter(
      (row) => !report112Keyword.value || row.receiptNo.includes(report112Keyword.value),
    ),
  )

  function openReport112() {
    report112Keyword.value = ''
    report112DialogOpen.value = true
  }

  function applyReport112(row: Report112Row) {
    const [date = '', time = ''] = row.receivedAt.split(' ')
    detail.value = { ...detail.value, receiptNo: row.receiptNo, reportDate: date, reportTime: time }
    report112DialogOpen.value = false
  }

  /** 화면단 필수값 확인만 한다 — 서버 검증은 개발팀 몫 */
  function validateDetail(): string | null {
    if (!detail.value.receiptNo.trim()) return '접수번호를 입력해 주세요.'
    if (!detail.value.victim.name.trim()) return '피해아동 성명을 입력해 주세요.'
    return null
  }

  return {
    department,
    advancedSearchOpen,
    receiptFrom,
    receiptTo,
    searchRoute,
    rows,
    activeRowKey,
    detail,
    selectRow,
    createRow,
    report112DialogOpen,
    report112Keyword,
    filtered112Rows,
    openReport112,
    applyReport112,
    validateDetail,
  }
}

export type ChildAbuseStore = ReturnType<typeof createChildAbuseSurvey>

export const ChildAbuseKey: InjectionKey<ChildAbuseStore> = Symbol('PM-PUB-0202-child-abuse')

export function useChildAbuseSurvey() {
  return createChildAbuseSurvey()
}
