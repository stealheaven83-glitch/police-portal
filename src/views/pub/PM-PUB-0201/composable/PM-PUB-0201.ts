import { computed, ref, type InjectionKey } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 통합 판단조사표 (PM-PUB-0201)
 *
 * 좌측 현황에서 한 건을 고르면 우측 '긴급임시 · 긴급응급 조치' 가 그 건으로 바뀐다.
 * 112신고 조회 팝업과 그 안의 미도착/미종결 목록 팝업이 이 화면에 붙는 화면군이라
 * 상태를 여기서 한 번만 만들고 화면에서 provide 한다 — CLAUDE.md §3 패턴A.
 */

/** 좌측 현황 한 행 */
export interface JudgementRow {
  rowKey: string
  no: number
  receiptNo: string
  receiptDate: string
  /** '112신고' | '고소장접수' … */
  receiptRoute: string
  caseSummary: string
  victimName: string
  victimPhone: string
  /** 위험성 총점 */
  score: number
}

/** 112신고 조회 팝업이 보여주는 신고 한 건 */
export interface Report112Row {
  rowKey: string
  receiptNo: string
  receivedAt: string
  /** 미도착 / 미종결 / 종결 */
  progress: string
  place: string
  content: string
}

/** 평가문항 한 개 */
export interface SurveyQuestion {
  id: string
  /** 'victim'(피해자 면담) | 'victim-police'(피해자 면담 및 경찰확인) | 'police'(경찰확인) */
  group: SurveyGroup
  text: string
}

export type SurveyGroup = 'victim' | 'victim-police' | 'police'

export const surveyGroupLabel: Record<SurveyGroup, string> = {
  victim: '피해자 면담',
  'victim-police': '피해자 면담 및 경찰확인',
  police: '경찰확인',
}

/**
 * 시안의 문항 10개를 그대로 옮겼다.
 * ⚠ 시안 텍스트가 작아 괄호 안 예시 문구는 읽은 대로 적었다 — 검수 때 대조가 필요하다.
 */
export const surveyQuestions: SurveyQuestion[] = [
  { id: 'q1', group: 'victim', text: '가해자가 피해자에게 외상(상해)를 입히거나 폭행·협박을 함' },
  {
    id: 'q2',
    group: 'victim',
    text: '가해자의 행위를 더 심하게 만드는 요인이 존재함 (예: 이별요구, 외도 의심, 이혼, 실직, 양육권 다툼, 법원의 명령 등)',
  },
  { id: 'q3', group: 'victim', text: '가해자가 평소에 거친 언행, 잦은 싸움 등 폭력적인 모습을 보임' },
  {
    id: 'q4',
    group: 'victim',
    text: '가해자가 피해자의 일상생활을 통제함 (예: 간섭, 감시, 집착, 고립, 위협 등)',
  },
  {
    id: 'q5',
    group: 'victim',
    text: '피해자가 가해자에 대한 불안을 강하게 호소함 (예: 가해자를 무서워함, 보복을 두려워함, 생명의 위협을 느낌 등)',
  },
  {
    id: 'q6',
    group: 'victim-police',
    text: '가해자가 이전에도 관계성 범죄로 신고당한 적이 있음 (예: 가정폭력, 스토킹, 교제폭력 등)',
  },
  {
    id: 'q7',
    group: 'victim-police',
    text: '가해자가 접근금지 등 보호조치를 위반한 적이 있음 (예: (긴급)임시조치, (긴급)응급조치, 잠정조치, 법원의 피해자보호명령 등)',
  },
  {
    id: 'q8',
    group: 'victim-police',
    text: '가해자가 술이나 약물로 인한 문제가 있음 (예: 잦은 폭음, 당해 사건에서 주취 상태, 약물 오남용 등)',
  },
  { id: 'q9', group: 'police', text: '가해자가 경찰관을 상대로 비협조적 태도를 보이며 통제에 어려움이 있음' },
  { id: 'q10', group: 'police', text: '가해자가 자신의 행위를 피해자의 탓으로 돌리며 정당화함' },
]

/** 좌측 현황 검색의 접수경로 — sentinel 은 '' 가 아니라 'all'(CLAUDE.md §8) */
export const receiptRouteOptions = [
  { label: '전체', value: 'all' },
  { label: '112신고', value: '112신고' },
  { label: '고소장접수', value: '고소장접수' },
  { label: '기타', value: '기타' },
]

/** 사건유형 체크박스 묶음 */
export interface CaseTypes {
  domestic: boolean
  mutual: boolean
  commonLaw: boolean
  child: boolean
  stalking: boolean
}

/** 피해자 · 가해자 인적사항 */
export interface PersonInfo {
  name: string
  /** 'male' | 'female' */
  gender: string
  birthDate: string
  phone: string
}

/** 우측 '긴급임시 · 긴급응급 조치' 본문 */
export interface JudgementDetail {
  /** 'report112' | 'complaint' | 'etc' */
  receiptRoute: string
  receiptRouteEtc: string
  receiptNo: string
  reportDate: string
  reportTime: string
  reportContent: string
  caseTypes: CaseTypes
  victim: PersonInfo
  offender: PersonInfo
  /** 문항 id → 'yes' | 'no' */
  answers: Record<string, string>
  /** 'yes' | 'no' */
  finalDecision: string
  decisionReason: string
  extraRiskFactor: string
}

function createEmptyPerson(): PersonInfo {
  return { name: '', gender: '', birthDate: '', phone: '' }
}

function createEmptyDetail(): JudgementDetail {
  return {
    receiptRoute: 'report112',
    receiptRouteEtc: '',
    receiptNo: '',
    reportDate: '',
    reportTime: '',
    reportContent: '',
    caseTypes: { domestic: false, mutual: false, commonLaw: false, child: false, stalking: false },
    victim: createEmptyPerson(),
    offender: createEmptyPerson(),
    answers: {},
    finalDecision: '',
    decisionReason: '',
    extraRiskFactor: '',
  }
}

function createMockRows(): JudgementRow[] {
  return Array.from({ length: 7 }, (_, i) => ({
    rowKey: `judgement-${195 - i}`,
    no: 195 - i,
    receiptNo: '11112222333344',
    receiptDate: '2026-06-24',
    receiptRoute: i === 2 ? '고소장접수' : '112신고',
    caseSummary: '어쩌구저쩌구 ㄴㅇㄹㅇㄹ…',
    victimName: '홍길순',
    victimPhone: '010-1234-5678',
    score: 0,
  }))
}

function createMock112Rows(): Report112Row[] {
  return [
    {
      rowKey: 'report-1',
      receiptNo: '11112222333344',
      receivedAt: '2026-06-16 08:08',
      progress: '미도착',
      place: '서울특별시 중구 필동',
      content: '가정폭력 신고',
    },
    {
      rowKey: 'report-2',
      receiptNo: '11112222333345',
      receivedAt: '2026-06-16 09:20',
      progress: '미종결',
      place: '서울특별시 중구 명동',
      content: '스토킹 신고',
    },
    {
      rowKey: 'report-3',
      receiptNo: '11112222333346',
      receivedAt: '2026-06-16 11:05',
      progress: '종결',
      place: '서울특별시 종로구 사직동',
      content: '아동학대 신고',
    },
  ]
}

function createJudgementSurvey() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const advancedSearchOpen = ref(false)

  const receiptFrom = ref('')
  const receiptTo = ref('')
  const searchRoute = ref('all')

  const allRows = ref<JudgementRow[]>(createMockRows())

  const rows = computed(() =>
    allRows.value.filter((row) => {
      if (searchRoute.value !== 'all' && row.receiptRoute !== searchRoute.value) return false
      if (receiptFrom.value && row.receiptDate < receiptFrom.value) return false
      if (receiptTo.value && row.receiptDate > receiptTo.value) return false
      return true
    }),
  )

  const activeRowKey = ref<string | null>(null)
  const detail = ref<JudgementDetail>(createEmptyDetail())

  function selectRow(rowKey: string) {
    const row = allRows.value.find((r) => r.rowKey === rowKey)
    if (!row) return
    activeRowKey.value = rowKey
    detail.value = {
      ...createEmptyDetail(),
      receiptNo: row.receiptNo,
      reportDate: row.receiptDate,
      victim: { ...createEmptyPerson(), name: row.victimName, phone: row.victimPhone },
    }
  }

  function createRow() {
    activeRowKey.value = null
    detail.value = createEmptyDetail()
  }

  /** 위험성 총점 — '예' 하나에 1점(시안이 계산식을 밝히지 않아 이렇게 뒀다) */
  const riskScore = computed(
    () => surveyQuestions.filter((q) => detail.value.answers[q.id] === 'yes').length,
  )

  /* 112신고 조회 팝업(시안: 통합판단조사표_112신고조회) */
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

  /** 팝업에서 고른 신고를 본문 접수번호·신고일시에 옮긴다 */
  function applyReport112(row: Report112Row) {
    const [date = '', time = ''] = row.receivedAt.split(' ')
    detail.value = { ...detail.value, receiptNo: row.receiptNo, reportDate: date, reportTime: time }
    report112DialogOpen.value = false
  }

  /* 미도착 · 미종결 목록 팝업 — 112신고 조회 팝업에서 다시 연다 */
  const pendingDialogOpen = ref(false)
  const pendingRows = computed(() =>
    report112Rows.value.filter((row) => row.progress === '미도착' || row.progress === '미종결'),
  )

  function openPending() {
    pendingDialogOpen.value = true
  }

  /** 화면단 필수값 확인만 한다 — 서버 검증은 개발팀 몫 */
  function validateDetail(): string | null {
    if (!detail.value.receiptNo.trim()) return '접수번호를 입력해 주세요.'
    if (!detail.value.finalDecision) return '최종판단을 선택해 주세요.'
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
    riskScore,
    selectRow,
    createRow,
    report112DialogOpen,
    report112Keyword,
    filtered112Rows,
    openReport112,
    applyReport112,
    pendingDialogOpen,
    pendingRows,
    openPending,
    validateDetail,
  }
}

export type JudgementSurveyStore = ReturnType<typeof createJudgementSurvey>

export const JudgementSurveyKey: InjectionKey<JudgementSurveyStore> =
  Symbol('PM-PUB-0201-judgement-survey')

export function useJudgementSurvey() {
  return createJudgementSurvey()
}
