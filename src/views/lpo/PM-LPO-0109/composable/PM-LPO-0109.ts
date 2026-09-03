import { ref } from 'vue'

export interface DispatchAllowanceRow {
  no: number
  receivedAt: string
  crimeName: string
  receiptNo: string
  caseNo: string
  arrivalTime: string
  closedAt: string
  responders: string
  closer: string
}

function createMockRows(): DispatchAllowanceRow[] {
  return Array.from({ length: 6 }, (_, index) => ({
    no: 6 - index,
    receivedAt: '2026-07-01 14:00',
    crimeName: '구조요청',
    receiptNo: '08202660920301',
    caseNo: '0101',
    arrivalTime: '4분 41초',
    closedAt: '2026-07-01 15:00',
    responders: '홍길동, 이세돌, 차범석, 이홍석',
    closer: '홍길동',
  }))
}

export function useDispatchAllowanceList() {
  const dateFrom = ref('2026-07-16')
  const dateTo = ref('2026-07-16')
  const rows = ref<DispatchAllowanceRow[]>(createMockRows())

  return { dateFrom, dateTo, rows }
}
