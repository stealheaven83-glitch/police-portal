import { computed, ref } from 'vue'

/**
 * 결재함 목록 — 결재요청자(PM-LPO-0120)와 결재승인자(PM-LPO-0121)가 같은 목록을 쓰고
 * '상태' 칸만 다르게 그린다(요청자는 상태 문구, 승인자는 처리 버튼).
 * 두 화면이 각자 목업을 들고 있으면 컬럼이 갈라지므로 도메인 레벨에 한 벌만 둔다.
 */
export interface ApprovalRow {
  no: number
  /** 결재 대상 업무 (출동수당 / 인수인계 / 물리력사용보고서 …) */
  category: string
  /** 대상 기간 또는 일시 */
  targetAt: string
  /** 현재단계 (예: 지구대/파출소(팀장/계장)(1/2)) */
  step: string
  /** 상태 문구 (승인완료 / 확인완료 / 결재대기 …) */
  status: ApprovalStatus
  /** 승인자 화면에서 눌러야 할 버튼 라벨 — 처리할 게 없으면 빈 문자열 */
  actionLabel: string
  /** 확인(결재)일시 — 아직 처리 전이면 빈 문자열 */
  confirmedAt: string
}

export type ApprovalStatus = '승인완료' | '승인대기' | '확인완료' | '결재대기'

export const approvalFilters = [
  { key: 'all', label: '전체', count: 345 },
  { key: 'request', label: '확인(결재)요청', count: 45 },
  { key: 'done', label: '확인(결재)완료', count: 345 },
]

/** 처리가 끝난 상태 — '확인(결재)완료' 칩에 걸리는 값 */
const DONE_STATUSES: ApprovalStatus[] = ['승인완료', '확인완료']

function createMockRows(): ApprovalRow[] {
  return [
    { no: 6, category: '출동수당', targetAt: '2026-08-01~2026-08-31 (총 10건)', step: '지구대/파출소(팀장/계장)(1/2)', status: '승인완료', actionLabel: '', confirmedAt: '2026-01-01 12:00' },
    { no: 5, category: '출동수당', targetAt: '2026-08-01~2026-08-31 (총 10건)', step: '경찰서(과장)(2/2)', status: '승인대기', actionLabel: '출동수당 승인', confirmedAt: '' },
    { no: 4, category: '인수인계', targetAt: '2026-01-01 (4팀)', step: '인계저장 완료(1/4)', status: '확인완료', actionLabel: '인수관 확인', confirmedAt: '' },
    { no: 3, category: '인수인계', targetAt: '2026-01-01 (4팀)', step: '인수관 확인완료(2/4)', status: '확인완료', actionLabel: '', confirmedAt: '2026-01-01 12:00' },
    { no: 2, category: '물리력사용보고서', targetAt: '2026-01-01 10:00', step: '보고서 등록완료(1/4)', status: '결재대기', actionLabel: '점검관 확인', confirmedAt: '' },
    { no: 1, category: '기타 영상기기 사용보고서', targetAt: '2026-01-01 10:00', step: '1차 결재완료(2/3)', status: '결재대기', actionLabel: '결재 확인', confirmedAt: '' },
  ]
}

export function useApprovalBox() {
  const dateFrom = ref('2026-07-16')
  const dateTo = ref('2026-07-16')
  const activeFilter = ref('all')

  const allRows = ref<ApprovalRow[]>(createMockRows())

  const rows = computed(() =>
    allRows.value.filter((row) => {
      if (activeFilter.value === 'done') return DONE_STATUSES.includes(row.status)
      if (activeFilter.value === 'request') return !DONE_STATUSES.includes(row.status)
      return true
    }),
  )

  return { dateFrom, dateTo, activeFilter, allRows, rows }
}
