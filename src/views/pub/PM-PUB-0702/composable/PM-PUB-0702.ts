import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 기타 영상기기 사용 보고서 (PM-PUB-0702)
 *
 * 좌측 목록에서 한 건을 고르면 우측 보고서가 그 건으로 바뀐다.
 * 결재 처리·저장은 개발팀 몫이고 여기서는 목업 배열만 다룬다.
 */

/** 목록 한 행 */
export interface VideoReportRow {
  rowKey: string
  no: number
  /** 결재 아이콘 자리 — 연동 전까지 비어 있다 */
  approval: string
  approvalStatus: string
  dept: string
  user: string
  target: string
  writtenAt: string
}

/** 결재선 한 칸 */
export interface ApprovalStep {
  /** 'draft'(기안자) | 'approver' */
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

/** 사용자 정보 한 행 — 시안 주석대로 1명으로 제한한다 */
export interface ReportUser {
  dept: string
  rank: string
  name: string
}

/** 우측 보고서 본문 */
export interface VideoReportDetail {
  /** 'work'(업무용 휴대폰) | 'personal'(개인 휴대폰) | 'etc' */
  device: string
  deviceEtc: string
  deviceReason: string
  /** 'notified'(촬영여부 등 표시) | 'not-notified'(미표시) */
  notice: string
  noticeReason: string
  /** 'report112' | 'patrol' | 'etc' */
  origin: string
  originEtc: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  indoor: boolean
  /** 'home' | 'facility' | 'transport' */
  indoorType: string
  outdoor: boolean
  note: string
}

export const approverOptions = [
  { label: '경정 김길동', value: 'kim' },
  { label: '경감 이영수', value: 'lee' },
  { label: '경위 홍길동', value: 'hong' },
]

function createMockRows(): VideoReportRow[] {
  return [
    {
      rowKey: 'video-195',
      no: 195,
      approval: '',
      approvalStatus: '1차 결재대기',
      dept: '본청 범죄예방대응 지역경찰운영과',
      user: '홍길동',
      target: '김**',
      writtenAt: '2026-07-01',
    },
    {
      rowKey: 'video-194',
      no: 194,
      approval: '',
      approvalStatus: '1차 결재대기',
      dept: '본청 범죄예방대응 지역경찰운영과',
      user: '김철수, 홍길동',
      target: '김**',
      writtenAt: '2026-07-01',
    },
    {
      rowKey: 'video-193',
      no: 193,
      approval: '',
      approvalStatus: '2차 결재대기',
      dept: '본청 범죄예방대응 지역경찰운영과',
      user: '이영희, 정…',
      target: '김**',
      writtenAt: '2026-07-02',
    },
    {
      rowKey: 'video-192',
      no: 195,
      approval: '',
      approvalStatus: '2차 결재대기',
      dept: '본청 범죄예방대응 지역경찰운영과',
      user: '홍길동',
      target: '김**',
      writtenAt: '2026-07-02',
    },
  ]
}

/**
 * 시안에는 결재선 표가 두 개 그려져 있다 — 기안자 시점(3차 결재자 미지정 + 결재회수)과
 * 결재자 시점(내 차례라 반려·결재 버튼). 같은 표의 두 상태라 데이터로 갈라 한 번만 그린다.
 */
function createApprovalLine(): ApprovalStep[] {
  return [
    { kind: 'draft', role: '기안자', person: '경위 홍길동', status: '2026-07-01', action: 'none', selectable: false },
    { kind: 'approver', role: '1차 결재자', person: '경감 이영수', status: '결재완료', action: 'none', selectable: false },
    { kind: 'approver', role: '2차 결재자', person: '경감 홍길동', status: '결재대기', action: 'withdraw', selectable: false },
    { kind: 'approver', role: '3차 결재자', person: '', status: '-', action: 'none', selectable: true },
  ]
}

function createEmptyDetail(): VideoReportDetail {
  return {
    device: '',
    deviceEtc: '',
    deviceReason: '',
    notice: '',
    noticeReason: '',
    origin: '',
    originEtc: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    indoor: false,
    indoorType: '',
    outdoor: false,
    note: '',
  }
}

export function useVideoDeviceReport() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const advancedSearchOpen = ref(true)

  const writtenFrom = ref('2026-07-16')
  const writtenTo = ref('2026-07-16')
  const searchUser = ref('')

  const allRows = ref<VideoReportRow[]>(createMockRows())

  const rows = computed(() =>
    allRows.value.filter((row) => {
      if (searchUser.value && !row.user.includes(searchUser.value)) return false
      return true
    }),
  )

  const activeRowKey = ref<string | null>(allRows.value[1]?.rowKey ?? null)

  const approvalLine = ref<ApprovalStep[]>(createApprovalLine())
  /** 3차 결재자처럼 아직 안 정한 칸에서 고른 값 */
  const nextApprover = ref('')

  const reportUsers = ref<ReportUser[]>([
    { dept: '본청 범죄예방대응 지역경찰운영과 지역경찰기획계', rank: '경위', name: '홍길동' },
  ])

  const detail = ref<VideoReportDetail>(createEmptyDetail())

  function selectRow(rowKey: string) {
    if (!allRows.value.some((r) => r.rowKey === rowKey)) return
    activeRowKey.value = rowKey
    // 연동 전까지는 고른 행에 맞는 본문이 없어서 폼만 비운다
    detail.value = createEmptyDetail()
    approvalLine.value = createApprovalLine()
  }

  function createReport() {
    activeRowKey.value = null
    detail.value = createEmptyDetail()
    approvalLine.value = createApprovalLine()
  }

  /** 화면단 필수값 확인만 한다 — 서버 검증은 개발팀 몫 */
  function validateDetail(): string | null {
    if (!detail.value.device) return '촬영 장비를 선택해 주세요.'
    if (detail.value.device === 'etc' && !detail.value.deviceEtc.trim()) {
      return '촬영 장비(기타)를 입력해 주세요.'
    }
    if (!detail.value.notice) return '고지 여부를 선택해 주세요.'
    if (!detail.value.origin) return '촬영 경위를 선택해 주세요.'
    return null
  }

  return {
    department,
    advancedSearchOpen,
    writtenFrom,
    writtenTo,
    searchUser,
    rows,
    activeRowKey,
    approvalLine,
    nextApprover,
    reportUsers,
    detail,
    selectRow,
    createReport,
    validateDetail,
  }
}
