import { computed, ref } from 'vue'
import { format } from 'date-fns'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 출동수당 취합(월별) 한 행 — "사람 1명당 범죄명별 4행"이 세로 병합(rowspan)된 표지만,
 * TabulatorGrid(Tabulator 6.x)는 데이터 셀 rowspan/colspan을 지원하지 않는다.
 * 시안(12769:79145)대로 번호/부서/팀/직급성명/생년월일/총출동건수는 **첫 행에만** 넣고
 * 나머지 행은 비워 둔다(빈 칸이 병합처럼 보인다).
 */
export interface DispatchSummaryRow {
  no?: number
  dept?: string
  team?: string
  rankName?: string
  birthDate?: string
  totalCount?: number
  category: string
  count: number
  days: number[]
}

/**
 * 출동수당 승인자 한 사람 — 직책 · 이름 뒤에 상태 하나가 붙는다(시안 '승인자 케이스' 13092:100022).
 * 셋 다 없으면 이름까지만(케이스 A). 우선순위는 approvedAt → unapproved → canApprove.
 * 승인 버튼은 팀장/계장·경찰서 과장 어느 쪽에도 올 수 있다(과장 승인 전 = 팀장 승인일 + 과장 버튼).
 */
export interface Approver {
  label: string
  name: string
  /** 승인 일시 — 'YYYY-MM-DD HH:mm 승인' 으로 표시(케이스 C). 기획: 승인 처리 시 버튼이 사라지고 승인일시 출력 */
  approvedAt?: string
  /** '미승인' 표시(케이스 C 의 경찰서 과장) */
  unapproved?: boolean
  /** '출동수당 승인' 버튼 표시 — 승인 전이고 내가 승인권자일 때(케이스 B) */
  canApprove?: boolean
}

export const yearOptions = [
  { label: '2026년', value: '2026' },
  { label: '2025년', value: '2025' },
]

export const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}월`, value: String(i + 1) }))

export const applicantOptions = [
  { label: '전체', value: 'all' },
  { label: '경위 홍길동', value: 'hong' },
]

export const applyTypeOptions = [
  { label: '전체', value: 'all' },
  { label: '자동체크', value: 'auto' },
  { label: '임의등록', value: 'manual' },
]

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function createPersonRows(no: number, days: number): DispatchSummaryRow[] {
  const person = {
    no,
    dept: '서울청 범죄예방대응과 한강경찰서',
    team: '1팀',
    rankName: '경위 홍길동',
    birthDate: '1980-01-01',
    totalCount: 4,
  }
  const categories: Array<{ category: string; count: number }> = [
    { category: '위험방지', count: 1 },
    { category: '자살', count: 1 },
    { category: '구조요청', count: 2 },
    { category: '지급건수', count: 4 },
  ]
  return categories.map((c, i) => ({
    ...(i === 0 ? person : {}),
    category: c.category,
    count: c.count,
    days: Array(days).fill(1),
  }))
}

function createMockRows(days: number): DispatchSummaryRow[] {
  return [...createPersonRows(1, days), ...createPersonRows(2, days)]
}

export function useDispatchSummaryMonthly() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'central-report', level3: 'front-line' })
  const advancedSearchOpen = ref(false)

  const workYear = ref(2026)
  const workMonth = ref(9)
  const applicant = ref('all')
  const applyType = ref('all')

  const days = computed(() => daysInMonth(workYear.value, workMonth.value))
  const rows = computed<DispatchSummaryRow[]>(() => createMockRows(days.value))

  /** 타직원 출동수당 신청 요청 건수 — 목록 위 '요청갯수 : N' */
  const requestCount = ref(0)

  /**
   * 출동수당 승인자 줄 — 본 화면 시안(13092:99695)은 팀장/계장 승인 버튼 + 경찰서 과장 미승인.
   * 다른 케이스는 approvedAt / unapproved / canApprove 를 바꾸면 된다(Approver 주석).
   */
  const approvers = ref<Approver[]>([
    { label: '지구대/파출소 (팀장/계장)', name: '경정 홍길동', canApprove: true },
    { label: '경찰서(과장)', name: '경정 홍길동', unapproved: true },
  ])

  /**
   * 승인관리 팝업(PC-LPO-0506)에서 결재자를 지정하면 승인자 줄이 그 사람들로 바뀐다(기획: "결재자 지정 시
   * 출동수당 승인 항목이 노출되고 지정된 결재 사용자 출력"). 상태는 처음으로 — 1차 승인 버튼 + 2차 미승인.
   */
  function assignApprovers(teamLeader: string, chief: string) {
    approvers.value = [
      { label: '지구대/파출소 (팀장/계장)', name: teamLeader, canApprove: true },
      { label: '경찰서(과장)', name: chief, unapproved: true },
    ]
  }

  /**
   * '출동수당 승인' 처리 — 버튼 자리가 승인일시로 바뀌고, 1차(지구대/파출소)가 끝나면 다음 사람(2차 경찰서 과장)의
   * '미승인' 이 승인 버튼으로 바뀐다(기획: "1차 승인 후 2차 승인자 버튼 출력").
   */
  function approveDispatchAllowance(list: Approver[], index: number) {
    const current = list[index]
    if (!current) return
    current.approvedAt = format(new Date(), 'yyyy-MM-dd HH:mm')
    current.canApprove = false
    const next = list[index + 1]
    if (next && !next.approvedAt) {
      next.unapproved = false
      next.canApprove = true
    }
  }

  /**
   * ⚠ 임시 — 승인자 줄 케이스 A~D 를 화면에서 한꺼번에 보려고 둔 것. 확인이 끝나면 이 배열과
   * PC-LPO-0505.vue 의 v-for 래퍼를 지우고 위 approvers 하나만 남긴다(샘플은 /component/search-area 에 있다).
   */
  const approverCases = ref<Array<{ title: string; approvers: Approver[] }>>([
    {
      title: 'A. 이름까지만',
      approvers: [
        { label: '지구대/파출소 (팀장/계장)', name: '경정 홍길동' },
        { label: '경찰서(과장)', name: '경정 홍길동' },
      ],
    },
    {
      title: 'B. 승인 버튼',
      approvers: [
        { label: '지구대/파출소 (팀장/계장)', name: '경정 홍길동', canApprove: true },
        { label: '경찰서(과장)', name: '경정 홍길동' },
      ],
    },
    {
      title: 'C. 승인일 + 미승인',
      approvers: [
        { label: '지구대/파출소 (팀장/계장)', name: '경정 홍길동', approvedAt: '2026-08-27' },
        { label: '경찰서(과장)', name: '경정 홍길동', unapproved: true },
      ],
    },
    // 재할당(assignApprovers)을 따라가도록 getter 로 둔다
    { title: 'D. 승인 버튼 + 미승인 (본 화면)', get approvers() { return approvers.value } },
    {
      title: 'E. 승인일 + 승인 버튼 (경찰서 과장 승인 전)',
      approvers: [
        { label: '지구대/파출소 (팀장/계장)', name: '경정 홍길동', approvedAt: '2026-08-27' },
        { label: '경찰서(과장)', name: '경정 홍길동', canApprove: true },
      ],
    },
  ])

  return {
    approverCases,
    department,
    advancedSearchOpen,
    workYear,
    workMonth,
    applicant,
    applyType,
    days,
    rows,
    requestCount,
    approvers,
    assignApprovers,
    approveDispatchAllowance,
  }
}
