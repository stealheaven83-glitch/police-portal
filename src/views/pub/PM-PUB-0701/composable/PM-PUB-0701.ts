import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 물리력 사용 보고서 (PM-PUB-0701)
 *
 * 조회 조건으로 거른 목록 하나짜리 화면이다. 상세 조회 권한(작성자 본인 · 1~3차 결재자)은
 * 서버가 판단할 몫이라 화면에서는 안내 문구만 보여준다.
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

/** 기간구분 — sentinel 은 '' 가 아니라 실제 값(CLAUDE.md §8) */
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

function createMockRows(): ForceReportRow[] {
  const dept = '본청 범죄예방대응 지역경찰운영과'
  return [
    { rowKey: 'force-195', no: 195, approval: '1차 결재대기', dept, user: '홍길동', target: '김**', usedAt: '2026-07-01 14:20' },
    { rowKey: 'force-194', no: 194, approval: '1차 결재대기', dept, user: '김철수', target: '김**', usedAt: '2026-07-01 15:05' },
    { rowKey: 'force-193', no: 193, approval: '2차 결재대기', dept, user: '이영희', target: '김**', usedAt: '2026-07-02 09:40' },
    { rowKey: 'force-192', no: 192, approval: '결재완료', dept, user: '홍길동', target: '김**', usedAt: '2026-07-02 18:10' },
  ]
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

  return {
    department,
    advancedSearchOpen,
    periodType,
    periodFrom,
    periodTo,
    userType,
    searchName,
    rows,
  }
}
