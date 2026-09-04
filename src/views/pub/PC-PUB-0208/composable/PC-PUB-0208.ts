import { computed, ref, type InjectionKey } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * (구) 자료조회 (PC-PUB-0208 가정폭력 / PC-PUB-0209 아동학대 / PC-PUB-0210 스토킹)
 *
 * 탭 세 개가 한 화면 안에서 바뀌는 화면군이라 컴포넌트는 하나다 — CLAUDE.md §3 패턴A.
 * 탭마다 좌측 현황 그리드와 우측 상세 서식이 다르다.
 */

export type CaseTab = 'domestic' | 'child' | 'stalking'

export const caseTabs: { value: CaseTab; label: string }[] = [
  { value: 'domestic', label: '가정폭력' },
  { value: 'child', label: '아동학대' },
  { value: 'stalking', label: '스토킹' },
]

/** 탭마다 좌측 패널 제목이 다르다 */
export const listPanelTitle: Record<CaseTab, string> = {
  domestic: '가정폭력 현황',
  child: '아동학대 현황',
  stalking: '스토킹 현황',
}

/** 좌측 현황 한 행 — 세 탭이 같은 컬럼을 쓴다(시안) */
export interface CaseRow {
  rowKey: string
  no: number
  receiptNo: string
  receiptDate: string
  receiptRoute: string
  caseSummary: string
  victimName: string
  victimPhone: string
}

/** 체크박스 + 딸린 입력 */
export interface CheckWithText {
  checked: boolean
  text: string
}

/** 세 탭이 함께 쓰는 인적사항 */
export interface CasePerson {
  name: string
  gender: string
  birthDate: string
  phone: string
  nationality: string
  nationalityEtc: string
}

/** '해당함' 체크 한 줄짜리 문항 */
export interface CheckItem {
  id: string
  text: string
  /** 문항 아래 작은 보조 설명 */
  note?: string
}

/** 예 / 아니오 / 확인안됨 3지선다 문항 */
export interface ScoreItem {
  id: string
  group: string
  text: string
  note?: string
}

export const receiptRouteOptions = [
  { label: '전체', value: 'all' },
  { label: '112신고', value: '112신고' },
  { label: '고소장접수', value: '고소장접수' },
  { label: '기타', value: '기타' },
]

export const nationalityOptions = [
  { label: '중국', value: 'cn' },
  { label: '베트남', value: 'vn' },
  { label: '기타', value: 'etc' },
]

/** 피해자-가해자 관계 */
export const relationOptions = [
  { label: '배우자', value: 'spouse' },
  { label: '사실혼 배우자', value: 'common-law' },
  { label: '전 배우자', value: 'ex-spouse' },
  { label: '직계존비속', value: 'lineal' },
  { label: '기타 친족', value: 'relative' },
]

export const stationOptions = [
  { label: '서울종로서', value: 'jongno' },
  { label: '서울중부서', value: 'jungbu' },
  { label: '서울양천서', value: 'yangcheon' },
]

export const jobOptions = [
  { label: '무직', value: 'none' },
  { label: '자영업', value: 'self' },
  { label: '회사원', value: 'employee' },
]

export const childRelationOptions = [
  { label: '부', value: 'father' },
  { label: '모', value: 'mother' },
  { label: '(외)조부모', value: 'grandparent' },
  { label: '기타', value: 'etc' },
]

export const familyTypeOptions = [
  { label: '한부모', value: 'single' },
  { label: '조손', value: 'grand' },
  { label: '양친', value: 'both' },
]

export const residenceStateOptions = [
  { label: '자가', value: 'own' },
  { label: '전세', value: 'jeonse' },
  { label: '월세', value: 'monthly' },
]

export const noticeTimeOptions = ['08:08', '09:00', '12:00', '15:00', '18:00'].map((t) => ({
  label: t,
  value: t,
}))

export const baseLocationOptions = [
  { label: '주거', value: 'home' },
  { label: '직장', value: 'work' },
  { label: '학교', value: 'school' },
]

export const stalkingStartYearOptions = Array.from({ length: 6 }, (_, i) => {
  const year = String(2026 - i)
  return { label: `${year}년`, value: year }
})

export const stalkingStartMonthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}월`,
  value: String(i + 1),
}))

/* ────────────────────────────────────────────────────────────────
 * 가정폭력 탭
 * ──────────────────────────────────────────────────────────────── */

/** 사건처리 참고기준 7개 */
export const domesticReferenceItems: CheckItem[] = [
  { id: 'dr1', text: '상해 (타박상, 골절, 혈흔, 응급실 내원 등)' },
  { id: 'dr2', text: '특수폭행 · 협박 (흉기사용)' },
  { id: 'dr3', text: '상습폭행 · 협박 (2회 이상 폭행 · 협박)' },
  { id: 'dr4', text: '손괴 (물건 파손)' },
  {
    id: 'dr5',
    text: '임시조치 · 보호처분 · 피해자보호명령 위반 (격리 · 접근금지)',
    note: '*『가정폭력처벌법』제63조 위반죄 해당',
  },
  { id: 'dr6', text: '일반폭행 · 협박 (존속폭행 · 협박 포함)' },
  { id: 'dr7', text: '긴급임시조치 위반 (격리 · 접근금지)' },
]

/** 긴급임시조치 결정문항 4개 */
export const domesticDecisionItems: CheckItem[] = [
  {
    id: 'dd1',
    text: '피해자에게 치료가 필요한 정도의 뚜렷한 외상(상해)이 확인되거나 가해자가 흉기 등 위험한 물건을 소지(특수폭행 협박)한 것이 확인됨',
  },
  { id: 'dd2', text: '가해자가 출입문 개방에 협조하지 않고, 피해자를 대면한 결과 가정폭력 범죄 피해가 확인됨' },
  {
    id: 'dd3',
    text: '파견, 집기류의 심각한 파손 등 주변 잔여물을 볼 때 가정폭력 범죄가 의심되고 위험성이 있다고 판단됨',
  },
  {
    id: 'dd4',
    text: '가해자가 피해자의 외도를 의심하거나 피해자에게 이혼 요구 받는 상황에서 가정폭력 범죄 피해가 확인됨',
  },
]

/** 긴급임시조치 평가 기준 9개 */
export const domesticScoreItems: ScoreItem[] = [
  { id: 'ds1', group: '경찰관 확인·판단', text: '경찰에 대한 저항 - 가해자가 현장에 출동한 경찰관을 상대로 비협조적인 태도를 보임' },
  { id: 'ds2', group: '경찰관 확인·판단', text: '정당성 주장 - 가해자가 가정폭력 행위를 피해자의 탓으로 돌리며 어쩔 수 없는 행위였다고 주장함' },
  { id: 'ds3', group: '피해자 대상 질문', text: '신고전력 - 이전에도 가정폭력으로 신고한 적이 있나요?' },
  {
    id: 'ds4',
    group: '피해자 대상 질문',
    text: '일반적 폭력성 - 가해자가 가족구성원들을 포함한 다른 사람들과 자주 다투거나, 폭력적인 성향을 보이나요?',
  },
  {
    id: 'ds5',
    group: '피해자 대상 질문',
    text: '알코올 등 약물사용 - 가해자가 일주일에 술을 주 3회 이상 마시거나 기타 약물*을 과다하게 사용하나요?',
    note: '* 향정신성 의약품(마약, 수면제 등), 불법약물(본드, 가스 등)',
  },
  {
    id: 'ds6',
    group: '피해자 대상 질문',
    text: '자살암시 - 가해자가 선생님 탓을 하며 죽겠다고 말하거나 죽으려고 시도한 적 있나요?',
  },
  {
    id: 'ds7',
    group: '피해자 대상 질문',
    text: '지배성향 - 가해자가 선생님께서 다른 사람을 만나지 못하도록 하거나 일거수 일투족을 보고하게 하나요?',
  },
  {
    id: 'ds8',
    group: '피해자 대상 질문',
    text: '가해자에 대한 공포 - 가해자의 손에 죽을 수도 있겠다고 느낀 적이 있나요?',
  },
  { id: 'ds9', group: '피해자 대상 질문', text: '피해자 건강 - 가해자의 문제로 몸이나 마음에 불편한 곳이 있나요?' },
]

/* ────────────────────────────────────────────────────────────────
 * 스토킹 탭
 * ──────────────────────────────────────────────────────────────── */

/** 사건처리 참고기준 5개(6·7번은 별도 입력이라 아래 폼에서 다룬다) */
export const stalkingReferenceItems: CheckItem[] = [
  { id: 'sr1', text: '피해자에게 접근', note: '(찾아오기, 따라다니기, 진로 막아서기, 벨 누르기, 문 두드리기 등)' },
  {
    id: 'sr2',
    text: '기다리거나 지켜봄',
    note: '(주거, 직장, 학교, 그 밖에 일상적으로 생활하는 장소 (이하 "주거 등") 또는 그 부근에서 기다리거나 지켜보기 등)',
  },
  {
    id: 'sr3',
    text: '정보통신망을 이용 연락 또는 물건도달',
    note: '(전화, 문자, 이메일, SNS(카카오톡, 인스타그램, 텔레그램, 페이스북 등) 연락 또는 우편/팩스로 연락하거나 물건도달 등)',
  },
  { id: 'sr4', text: '인편으로 물건도달', note: '(직접 또는 제3자를 통해 주거 등이나 부근에 물건을 도달하는 행위 등)' },
  { id: 'sr5', text: '물건 훼손', note: '(주거 등이나 부근에 있는 물건 훼손)' },
]

/** 긴급응급조치 판단 평가문항 12개 */
export const stalkingScoreItems: ScoreItem[] = [
  { id: 'ss1', group: '피해자 면담', text: '가해자로 부터 협박이나 폭행을 당한 적이 있나요?' },
  {
    id: 'ss2',
    group: '피해자 면담',
    text: '가해자가 당신의 주거지나 직·장학교 등 일상적으로 생활하는 장소를 알고 있나요? (\'주거 등\'에서 마주치거나, 이를 언급하는 등)',
  },
  {
    id: 'ss3',
    group: '피해자 면담',
    text: '가해자의 스토킹 행위로 일상생활에 어려움이나 불편함이 있나요? (이직, 휴학, 이사, SNS계정 변경/삭제, 휴대전화 번호 변경 등)',
  },
  {
    id: 'ss4',
    group: '피해자 면담',
    text: '가해자의 스토킹을 더 심하게 만드는 사건이 발생했거나 발생할 우려가 있나요? (예: 이별요규, 이혼, 양육권 다툼, 법원의 명령 등)',
  },
  { id: 'ss5', group: '가 · 피해자 면담 및 경찰확인', text: '가해자가 평소에 술이나 약물로 인한 문제가 있나요?' },
  {
    id: 'ss6',
    group: '가 · 피해자 면담 및 경찰확인',
    text: '가해자가 정신과 진료를 받은 적이 있나요? (예: 우울증, 조현병, 자폐, 불안장애, PTSD 등)',
  },
  { id: 'ss7', group: '가 · 피해자 면담 및 경찰확인', text: '가해자가 극단적 선택을 언급하거나 시도한 적 있나요?' },
  {
    id: 'ss8',
    group: '가 · 피해자 면담 및 경찰확인',
    text: '가해자가 보호조치(예: 긴급응급조치, 잠정조치, 법원의 피해자보호명령 등)를 위반한 적이 있나요?',
  },
  {
    id: 'ss9',
    group: '경찰확인',
    text: 'APO시스템상 가해자가 스토킹으로 신고당한 이력이 확인됨 (피해자나 신고자가 누구인지는 상관없음)',
  },
  { id: 'ss10', group: '경찰확인', text: '스토킹 행위와 주거침입/폭행 등 기타 범죄가 결합하여 발생한 것이 확인됨' },
  {
    id: 'ss11',
    group: '경찰확인',
    text: '가해자가 스토킹의 원인을 피해자 탓으로 돌리거나 어쩔수 없는 행위였다며 행위 정당화를 시도함',
  },
  { id: 'ss12', group: '경찰확인', text: '가해자의 경찰 지시에 따르지 않고 비협조적이며 통제에 어려움이 있음' },
]

/** 긴급응급조치를 요청하지 않는 이유 */
export const stalkingRefuseItems: CheckItem[] = [
  { id: 'sf1', text: '보복이 두려워서' },
  { id: 'sf2', text: '별일 아니어서' },
  { id: 'sf3', text: '조치 효과가 없을 것 같아서' },
  { id: 'sf4', text: '국가경찰관의 유치장 또는 구치소에의 유치' },
]

/** 스토킹 반복성 — 발생 주기 */
export const stalkingCycleOptions = [
  { label: '최초발생', value: 'first' },
  { label: '1주일', value: 'week' },
  { label: '1개월', value: 'month' },
  { label: '1년', value: 'year' },
]

/* ────────────────────────────────────────────────────────────────
 * 아동학대 탭
 * ──────────────────────────────────────────────────────────────── */

/** 학대의심내용 — 분류별 체크 항목 */
export const abuseSuspicionGroups: { id: string; label: string; items: string[] }[] = [
  {
    id: 'physical',
    label: '신체학대',
    items: ['세게 흔듬', '묶음', '아동 던짐', '조름,비틈', '꼬집거나 뭄', '벽에 부딪힘', '물건 던짐', '흉기로 찌름', '화상', '기타'],
  },
  {
    id: 'emotional',
    label: '정서학대',
    items: ['소리 지름', '무시나 모욕', '무관심', '언어폭력', '가정폭력 노출', '집밖으로 쫓음', '비현실 강요', '수면 금지', '공포분위기', '기타'],
  },
  {
    id: 'sexual',
    label: '성학대',
    items: ['신체 관찰', '성관계 노출', '성기 노출', '자위 노출', '신체 추행', '구강 추행', '성기 추행', '구강 성교', '성기 삽입', '음란물 노출', '성매매', '기타'],
  },
  {
    id: 'neglect',
    label: '방임(유기)',
    items: ['물리적 방임', '의료적 방임', '교육적 방임', '가출 후 찾지 않음', '출생 신고안함', '유기', '기타'],
  },
]

/** 조치결과 — 현장종결 사유 */
export const abuseCloseReasons = ['혐의없음', '오인신고', '중복신고', '재신고', '허위신고', '기타']

/** 조치결과 — 응급조치 */
export const abuseEmergencyActions = ['범죄행위 제지', '학대행위자 격리', '보호시설 인도', '의료기관 인도']

function createPerson(): CasePerson {
  return { name: '', gender: '', birthDate: '', phone: '', nationality: 'kr', nationalityEtc: '' }
}

function createCheck(): CheckWithText {
  return { checked: false, text: '' }
}

/** 가정폭력 탭 서식 */
function createDomesticDetail() {
  return {
    mutual: false,
    receiptRoute: 'report112',
    receiptRouteEtc: '',
    receiptNo: '',
    occurredDate: '',
    reportContent: '',
    victim: createPerson(),
    offender: createPerson(),
    sameAddressAs112: false,
    address: '',
    addressDetail: '',
    relation: '',
    hasChild: '',
    station: '',
    autoAssign: '',
    /** 참고기준 · 결정문항 id → 해당함 */
    references: {} as Record<string, boolean>,
    decisions: {} as Record<string, boolean>,
    /** 평가문항 id → 'yes' | 'no' | 'unknown' */
    scores: {} as Record<string, string>,
    skipReason: '',
    urgentEnabled: false,
    urgentAddress: '',
    urgentAddressDetail: '',
    urgentNoticeDate: '',
    urgentNoticeTime: '',
    urgentNoticePlace: '',
    urgentMeasures: {} as Record<string, boolean>,
  }
}

/** 스토킹 탭 서식 */
function createStalkingDetail() {
  return {
    receiptRoute: 'report112',
    receiptRouteEtc: '',
    receiptNo: '',
    reportDate: '',
    reportTime: '',
    reportContent: '',
    victim: createPerson(),
    offender: createPerson(),
    relation: '',
    references: {} as Record<string, boolean>,
    startYear: '',
    startMonth: '',
    cycle: '',
    cycleCount: '',
    scores: {} as Record<string, string>,
    /** 'yes' | 'no' */
    requestUrgent: '',
    refuseReasons: {} as Record<string, boolean>,
    refuseEtc: createCheck(),
    /** 'act' | 'none' */
    finalAction: '',
  }
}

/** 아동학대 탭 서식 */
function createChildDetail() {
  return {
    receiptRoute: 'report112',
    receiptRouteEtc: '',
    receiptNo: '',
    occurredDate: '',
    reportContent: '',
    childName: '',
    childGender: '',
    childBirthDate: '',
    childAgeYear: '',
    childAgeMonth: '',
    schoolName: '',
    childAddress: '',
    childAddressDetail: '',
    hasInjury: '',
    injuryLevel: '',
    hasTreatment: '',
    treatmentNote: '',
    expression: '',
    clothes: '',
    behavior: '',
    disability: '',
    offenderName: '',
    offenderGender: '',
    offenderBirthDate: '',
    offenderPhone: '',
    offenderJob: '',
    offenderRelation: '',
    offenderAddress: '',
    offenderAddressDetail: '',
    cleanliness: '',
    familyType: '',
    residenceState: '',
    /** 가족관계 세 줄 */
    family: Array.from({ length: 3 }, () => ({
      name: '',
      living: '',
      phone: '',
      birthDate: '',
      job: '',
    })),
    /** '분류id:항목' → 체크 */
    suspicions: {} as Record<string, boolean>,
    closeReasons: {} as Record<string, boolean>,
    emergencyActions: {} as Record<string, boolean>,
    /** 'notified' | 'not-notified' */
    agencyNotice: '',
    urgentEnabled: false,
    urgentOffenderJob: '',
    urgentOffenderRelation: '',
    urgentNoticeDate: '',
    urgentNoticeTime: '',
    urgentNoticePlace: '',
    urgentMeasures: {} as Record<string, boolean>,
    urgentBase: '',
    urgentBaseEtc: '',
  }
}

export type DomesticDetail = ReturnType<typeof createDomesticDetail>
export type StalkingDetail = ReturnType<typeof createStalkingDetail>
export type ChildDetail = ReturnType<typeof createChildDetail>

function createMockRows(prefix: string): CaseRow[] {
  return Array.from({ length: 7 }, (_, i) => ({
    rowKey: `${prefix}-${195 - i}`,
    no: 195 - i,
    receiptNo: '11112222333344',
    receiptDate: '2026-06-24',
    receiptRoute: i === 2 ? '고소장접수' : '112신고',
    caseSummary: '어쩌구저쩌구 ㄴㅇㄹㅇㄹ…',
    victimName: '홍길순',
    victimPhone: '010-1234-5678',
  }))
}

function createLegacyCaseSearch() {
  const activeTab = ref<CaseTab>('domestic')

  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const advancedSearchOpen = ref(false)
  const receiptFrom = ref('')
  const receiptTo = ref('')
  const searchRoute = ref('all')

  /** 탭마다 목록이 따로다 */
  const allRows = ref<Record<CaseTab, CaseRow[]>>({
    domestic: createMockRows('dv'),
    child: createMockRows('ca'),
    stalking: createMockRows('st'),
  })

  const rows = computed(() =>
    allRows.value[activeTab.value].filter((row) => {
      if (searchRoute.value !== 'all' && row.receiptRoute !== searchRoute.value) return false
      if (receiptFrom.value && row.receiptDate < receiptFrom.value) return false
      if (receiptTo.value && row.receiptDate > receiptTo.value) return false
      return true
    }),
  )

  const activeRowKey = ref<Record<CaseTab, string | null>>({
    domestic: null,
    child: null,
    stalking: null,
  })

  const domestic = ref<DomesticDetail>(createDomesticDetail())
  const stalking = ref<StalkingDetail>(createStalkingDetail())
  const child = ref<ChildDetail>(createChildDetail())

  function selectRow(rowKey: string) {
    const row = allRows.value[activeTab.value].find((r) => r.rowKey === rowKey)
    if (!row) return
    activeRowKey.value = { ...activeRowKey.value, [activeTab.value]: rowKey }
    if (activeTab.value === 'domestic') {
      const next = createDomesticDetail()
      next.receiptNo = row.receiptNo
      next.occurredDate = row.receiptDate
      next.victim.name = row.victimName
      next.victim.phone = row.victimPhone
      domestic.value = next
    } else if (activeTab.value === 'stalking') {
      const next = createStalkingDetail()
      next.receiptNo = row.receiptNo
      next.reportDate = row.receiptDate
      next.victim.name = row.victimName
      next.victim.phone = row.victimPhone
      stalking.value = next
    } else {
      const next = createChildDetail()
      next.receiptNo = row.receiptNo
      next.occurredDate = row.receiptDate
      child.value = next
    }
  }

  /** 가정폭력 평가 점수 — '예' 하나에 1점(시안이 계산식을 밝히지 않아 이렇게 뒀다) */
  const domesticScore = computed(
    () => domesticScoreItems.filter((q) => domestic.value.scores[q.id] === 'yes').length,
  )
  /** 스토킹 위험성 총점 — 같은 기준. 4점 이상이면 '높음'(시안 주석) */
  const stalkingScore = computed(
    () => stalkingScoreItems.filter((q) => stalking.value.scores[q.id] === 'yes').length,
  )
  const stalkingRiskLabel = computed(() => (stalkingScore.value >= 4 ? '높음' : '낮음'))

  return {
    activeTab,
    department,
    advancedSearchOpen,
    receiptFrom,
    receiptTo,
    searchRoute,
    rows,
    activeRowKey,
    domestic,
    stalking,
    child,
    selectRow,
    domesticScore,
    stalkingScore,
    stalkingRiskLabel,
  }
}

export type LegacyCaseSearchStore = ReturnType<typeof createLegacyCaseSearch>

export const LegacyCaseSearchKey: InjectionKey<LegacyCaseSearchStore> =
  Symbol('PC-PUB-0208-legacy-case-search')

export function useLegacyCaseSearch() {
  return createLegacyCaseSearch()
}
