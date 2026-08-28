import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

export interface DispatchAllowanceRow {
  no: number
  applyDept: string
  otherStation: string
  otherStationRef: string
  receiptNo: string
  caseNo: string
  reportContent: string
  onSiteAction: string
  manualReason: string
  receivedAt: string
  arrivedAt: string
}

function createMockRows(): DispatchAllowanceRow[] {
  const reportContent = '부인이 친구랑 술마시다 없어졌다, 남편도 같이 있었다....'
  return [
    {
      no: 3,
      applyDept: '홍익지구대',
      otherStation: '충정로지구대',
      otherStationRef: '01000000',
      receiptNo: '01000000',
      caseNo: '임의등록 [실종(실종아동)]',
      reportContent,
      onSiteAction: reportContent,
      manualReason: '누락',
      receivedAt: '2026-08-01 00:49',
      arrivedAt: '2026-08-01 00:49',
    },
    {
      no: 2,
      applyDept: '홍익지구대',
      otherStation: '충정로지구대',
      otherStationRef: '01000000',
      receiptNo: '01000000',
      caseNo: '임의등록 [실종(실종아동)]',
      reportContent,
      onSiteAction: reportContent,
      manualReason: '누락',
      receivedAt: '2026-08-01 00:49',
      arrivedAt: '2026-08-01 00:49',
    },
    {
      no: 1,
      applyDept: '홍익지구대',
      otherStation: '충정로지구대',
      otherStationRef: '',
      receiptNo: '01000000',
      caseNo: '임의등록 [실종(실종아동)]',
      reportContent,
      onSiteAction: reportContent,
      manualReason: '누락',
      receivedAt: '2026-08-01 00:49',
      arrivedAt: '2026-08-01 00:49',
    },
  ]
}

export function useDispatchAllowanceList() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'central-report', level3: 'front-line' })
  const advancedSearchOpen = ref(false)

  const dateFrom = ref('2026-07-16')
  const dateTo = ref('')
  const keyword = ref('')

  const allRows = ref<DispatchAllowanceRow[]>(createMockRows())

  const rows = computed(() => {
    if (!keyword.value) return allRows.value
    return allRows.value.filter(
      (row) => row.reportContent.includes(keyword.value) || row.caseNo.includes(keyword.value),
    )
  })

  return {
    department,
    advancedSearchOpen,
    dateFrom,
    dateTo,
    keyword,
    rows,
  }
}
