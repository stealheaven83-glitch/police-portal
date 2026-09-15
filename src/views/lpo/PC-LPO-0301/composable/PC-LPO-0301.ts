import { computed, reactive, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/* ── 결재(인계인수) ──────────────────────────────────────────── */

/** 결재 칸 하나 — 인계관·인수관·확인관·점검관 */
export interface ApprovalStep {
  /** 칸 키. TableWrapper 컬럼 key 와 같아야 셀 슬롯이 붙는다 */
  role: 'giver' | 'receiver' | 'confirmer' | 'inspector'
  /** 직급 + 성명. 아직 지정 전이면 빈 문자열(시안 1행의 인수관·확인관·점검관) */
  person: string
  /** 보고일 / 승인일시. 없으면 빈 문자열 */
  reportedAt: string
  /** 그 칸에 놓이는 조작 — 없음 / 인수인계 취소 / 반려+결재 */
  action: 'none' | 'cancel' | 'decide'
  /** action 이 decide 일 때 파란 버튼 라벨(확인관은 '검토', 점검관은 '승인') */
  decideLabel?: string
  /** 반려 버튼으로 돌려보낸 칸 — 보고일 자리에 '반려' 로 표시한다(화면 정의서 2) */
  rejected?: boolean
}

/** 결재선 한 줄(표 하나) */
export interface ApprovalLine {
  id: number
  steps: ApprovalStep[]
}

/** 결재 표의 칸 구성 — 첫 칸은 '직급/성명·보고일/승인일시' 라벨 열이라 데이터가 없다 */
export const approvalColumns = [
  { key: 'label', label: '' },
  { key: 'giver', label: '인계관' },
  { key: 'receiver', label: '인수관' },
  { key: 'confirmer', label: '확인관' },
  { key: 'inspector', label: '점검관' },
]

/* ── 주요 장비 현황 ──────────────────────────────────────────── */

export interface EquipmentItem {
  /** 카드 머리줄(기동장비·통신장비·총기류·탄약) */
  category: string
  name: string
  count: number
}

/* ── 통계 입력(1)·2)·3) 구역) ────────────────────────────────── */

/** 한 라벨 뒤에 붙는 입력칸 하나 — key 는 stats 객체의 필드명, unit 은 옆 단위 글자 */
export interface StatField {
  key: string
  unit: string
}

export interface StatRow {
  label: string
  fields: StatField[]
}

/**
 * 1) 주요범죄 발생 및 검거 실적.
 * InfoTable(columns=2)이 행 우선으로 채우므로 [왼쪽칸, 오른쪽칸] 순서로 번갈아 적는다.
 */
export const crimeStatRows: StatRow[] = [
  { label: '살인발생', fields: [{ key: 'murderCase', unit: '(건)' }, { key: 'murderPerson', unit: '(명)' }] },
  { label: '살인검거', fields: [{ key: 'murderArrestCase', unit: '(건)' }, { key: 'murderArrestPerson', unit: '(명)' }] },
  { label: '강도발생', fields: [{ key: 'robberyCase', unit: '(건)' }, { key: 'robberyPerson', unit: '(명)' }] },
  { label: '강도검거', fields: [{ key: 'robberyArrestCase', unit: '(건)' }, { key: 'robberyArrestPerson', unit: '(명)' }] },
  { label: '강간발생', fields: [{ key: 'rapeCase', unit: '(건)' }, { key: 'rapePerson', unit: '(명)' }] },
  { label: '강간검거', fields: [{ key: 'rapeArrestCase', unit: '(건)' }, { key: 'rapeArrestPerson', unit: '(명)' }] },
  { label: '절도발생', fields: [{ key: 'theftCase', unit: '(건)' }, { key: 'theftPerson', unit: '(명)' }] },
  { label: '절도검거', fields: [{ key: 'theftArrestCase', unit: '(건)' }, { key: 'theftArrestPerson', unit: '(명)' }] },
  { label: '폭력발생', fields: [{ key: 'violenceCase', unit: '(건)' }, { key: 'violencePerson', unit: '(명)' }] },
  { label: '폭력검거', fields: [{ key: 'violenceArrestCase', unit: '(건)' }, { key: 'violenceArrestPerson', unit: '(명)' }] },
  { label: '기타형사범발생', fields: [{ key: 'etcCase', unit: '(건)' }, { key: 'etcPerson', unit: '(명)' }] },
  { label: '기타형사범검거', fields: [{ key: 'etcArrestCase', unit: '(건)' }, { key: 'etcArrestPerson', unit: '(명)' }] },
]

/**
 * 2) 기소중지 검거 및 경범처리.
 * 시안에 '도난차량회수' 가 좌·우 칸에 한 번씩 두 번 나온다 — 오타로 보이지만 시안대로 뒀다.
 * 키는 놓인 칸으로 구분한다(Right = 오른쪽 칸, Left = 왼쪽 칸).
 */
export const minorCaseRows: StatRow[] = [
  { label: '기소중지자검거', fields: [{ key: 'suspendedCase', unit: '(건)' }, { key: 'suspendedPerson', unit: '(명)' }] },
  { label: '즉심', fields: [{ key: 'summaryCase', unit: '(건)' }, { key: 'summaryPerson', unit: '(명)' }] },
  { label: '통고처분교통', fields: [{ key: 'trafficTicket', unit: '(건)' }] },
  { label: '도난차량회수', fields: [{ key: 'stolenCarRecoveredRight', unit: '(건)' }] },
  { label: '도난차량회수', fields: [{ key: 'stolenCarRecoveredLeft', unit: '(건)' }] },
  { label: '지도장', fields: [{ key: 'guidanceNotice', unit: '(건)' }] },
]

/** 3) 112 신고건수 — 윗 표(2칸) */
export const reportRows: StatRow[] = [
  { label: '112신고', fields: [{ key: 'report112', unit: '(건)' }] },
  { label: '임의접수', fields: [{ key: 'voluntaryReceipt', unit: '(건)' }] },
]

/** 3) 112 신고건수 — 아랫 표(3칸) */
export const reportDetailRows: StatRow[] = [
  { label: '소재수사 접수', fields: [{ key: 'locateReceived', unit: '(건)' }] },
  { label: '소재수사 처리', fields: [{ key: 'locateHandled', unit: '(건)' }] },
  { label: '소재수사 미결', fields: [{ key: 'locatePending', unit: '(건)' }] },
  { label: '민원처리 접수', fields: [{ key: 'civilReceived', unit: '(건)' }] },
  { label: '민원처리 처리', fields: [{ key: 'civilHandled', unit: '(건)' }] },
  { label: '민원처리 미결', fields: [{ key: 'civilPending', unit: '(건)' }] },
]

/* ── 주요취급사항 · 순찰차 현황 ──────────────────────────────── */

export interface HandlingRow {
  no: number
  /** 구분(교육훈련 등) */
  category: string
  /** 여러 줄로 적힌 내용 — 화면에서 줄바꿈을 그대로 보여준다 */
  content: string
  writtenAt: string
}

export interface PatrolCarRow {
  no: number
  dept: string
  /** 관리명(순마1 등) */
  manageName: string
  carNo: string
  carName: string
  maker: string
  /** 연식 */
  modelYear: string
  /** 점검여부 — true 면 '점검 완료', false 면 '미점검' 버튼 */
  checked: boolean
}

const WEEKDAY_LABELS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

/** 'yyyy.MM.dd.' 문자열을 Date 로 — DatePicker 의 value-format 과 같은 모양을 쓴다 */
function parseWorkDate(value: string) {
  const [year, month, day] = value.replace(/\.$/, '').split('.').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

function formatWorkDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}.${month}.${day}.`
}

function createApprovalLines(): ApprovalLine[] {
  return [
    {
      id: 1,
      steps: [
        { role: 'giver', person: '경위 홍길동', reportedAt: '2026-06-30', action: 'cancel' },
        { role: 'receiver', person: '', reportedAt: '', action: 'none' },
        { role: 'confirmer', person: '', reportedAt: '', action: 'none' },
        { role: 'inspector', person: '', reportedAt: '', action: 'none' },
      ],
    },
    {
      id: 2,
      steps: [
        { role: 'giver', person: '경위 홍길동', reportedAt: '2026-06-30', action: 'cancel' },
        { role: 'receiver', person: '경감 이영수', reportedAt: '2026-06-30', action: 'none' },
        { role: 'confirmer', person: '경감 황철수', reportedAt: '', action: 'decide', decideLabel: '검토' },
        { role: 'inspector', person: '경정 김길동', reportedAt: '', action: 'decide', decideLabel: '승인' },
      ],
    },
  ]
}

function createEquipmentItems(): EquipmentItem[] {
  return [
    { category: '기동장비', name: '순찰차', count: 4 },
    { category: '통신장비', name: '폴리폰(휴대용조회기,PDA)', count: 6 },
    { category: '통신장비', name: '112모바일폰', count: 4 },
    { category: '통신장비', name: '무전기', count: 71 },
    { category: '통신장비', name: '바디캠', count: 13 },
    { category: '총기류', name: '38권총', count: 38 },
    { category: '총기류', name: '전자충격기', count: 6 },
    { category: '탄약', name: '약재통(가스분사기)', count: 100 },
  ]
}

function createHandlingRows(): HandlingRow[] {
  return [
    {
      no: 1,
      category: '교육훈련',
      content: [
        '상황기반현장교육',
        '- 교육일시 : 2026.01.01 12:00~10:00',
        '- 교육장소 : 파출소 1층 회의실',
        '- 교육주제 : 스토킹범죄 대응 및 관리체계 강화방안',
        '- 교육인원 : 순찰 2팀장 포함 10명',
        '- 첨부 : 교육결과보고서 1부.',
      ].join('\n'),
      writtenAt: '2026-01-01 09:00',
    },
  ]
}

function createPatrolCarRows(): PatrolCarRow[] {
  return [5, 4, 3, 2, 1].map((no) => ({
    no,
    dept: '본청 중앙학교 실습부서',
    manageName: '순마1',
    carNo: '12가1234',
    carName: '카니발',
    maker: '기아',
    modelYear: '2015',
    checked: no === 5,
  }))
}

/** 모든 통계 입력칸을 빈 문자열로 깔아 둔다 — 목업이라 값은 사용자가 채운다 */
function createStats() {
  const keys = [...crimeStatRows, ...minorCaseRows, ...reportRows, ...reportDetailRows]
    .flatMap((row) => row.fields.map((field) => field.key))
  return reactive(Object.fromEntries(keys.map((key) => [key, ''])) as Record<string, string>)
}

export function useHandoverWrite() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })

  const workDate = ref('2026.08.11.')
  const weekdayLabel = computed(() => WEEKDAY_LABELS[parseWorkDate(workDate.value).getDay()] ?? '')
  /** 주간('day') / 야간('night') */
  const shift = ref('day')

  const approvalLines = ref<ApprovalLine[]>(createApprovalLines())
  const handoverNote = ref('0.112신고      건 처리\n -')

  const equipmentItems = ref<EquipmentItem[]>(createEquipmentItems())
  const stats = createStats()

  const handlingRows = ref<HandlingRow[]>(createHandlingRows())
  const patrolCarRows = ref<PatrolCarRow[]>(createPatrolCarRows())

  /** 근무일을 하루씩 앞뒤로 옮긴다(< > 버튼) */
  function shiftWorkDate(delta: number) {
    const date = parseWorkDate(workDate.value)
    date.setDate(date.getDate() + delta)
    workDate.value = formatWorkDate(date)
  }

  return {
    department,
    workDate,
    weekdayLabel,
    shift,
    shiftWorkDate,
    approvalLines,
    handoverNote,
    equipmentItems,
    stats,
    handlingRows,
    patrolCarRows,
  }
}
