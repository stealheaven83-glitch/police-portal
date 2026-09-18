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

/** 출동사건정보 팝업(PM-LPO-0110) 한 건 — Figma 13116:103180 */
export interface DispatchCaseInfo {
  /** 상단 표: 112 접수번호 */
  receiptNo: string
  /** 상단 표: 신고내용 (줄바꿈 포함) */
  report: string
  /** 접수코드 (제목에 붙는다 — '접수코드 : C1') */
  receiptCode: string
  caseReceiptNo: string
  caseNo: string
  receivedAt: string
  closedAt: string
  responders: string
  closer: string
  reporter: string
  contact: string
  location: string
  result: string
  evidence: string
  elements: DispatchElementRow[]
}

/** 출동요소목록 한 줄 */
export interface DispatchElementRow {
  name: string
  arrivedAt: string
  responders: string
}

/** 출동요소목록 표 컬럼 (시안: 3등분) */
export const elementColumns = [
  { key: 'name', label: '출동요소명' },
  { key: 'arrivedAt', label: '도착일시' },
  { key: 'responders', label: '출동자' },
]

/** 시안 기준 총 195건. 접수일시는 7/1 부터 하루씩 늘려 검색기간이 실제로 걸러지게 한다 */
function createMockRows(): DispatchAllowanceRow[] {
  const TOTAL = 195
  return Array.from({ length: TOTAL }, (_, index) => ({
    no: TOTAL - index,
    receivedAt: `2026-07-${String((index % 31) + 1).padStart(2, '0')} 14:00`,
    crimeName: '구조요청',
    receiptNo: '08202660920301',
    caseNo: '0101',
    arrivalTime: '4분 41초',
    closedAt: '2026-07-01 15:00',
    responders: '홍길동, 이세돌, 차범석, 이홍석',
    closer: '홍길동',
  }))
}

/** 팝업 목업 — 실제 값은 접수번호로 조회해 채운다(인계 대상) */
function createMockCase(receiptNo: string): DispatchCaseInfo {
  return {
    receiptNo,
    report: [
      '[소방 공동대응 요청접수]',
      '[신고정보]',
      ' 1. 신고내용 : 기타 경찰의 인적 물적……',
      ' 2. 신고자전화번호: 02000000',
      ' 3. 발생주소 : 서울특별시 중구',
      ' ….',
    ].join('\n'),
    receiptCode: 'C1',
    caseReceiptNo: '08202660913456',
    caseNo: '12345',
    receivedAt: '2026-07-06 00:57',
    closedAt: '2026-07-06 00:57',
    responders: '홍길동 고길동 홍금보 박희순',
    closer: '홍길동',
    reporter: '홍길동',
    contact: '01012345678',
    location: '부산광역시 중구 비프광장로 36 부산극장',
    result: '요구조자 보호자에게 인계하여 마감',
    evidence: '[기타] 112신고사건 내역서 등',
    elements: Array.from({ length: 4 }, () => ({
      name: '약수지구대',
      arrivedAt: '2026-08-08 14:00',
      responders: '홍길동, 이기소',
    })),
  }
}

export function useDispatchAllowanceList() {
  const dateFrom = ref('2026-07-01')
  const dateTo = ref('2026-07-31')
  const allRows = ref<DispatchAllowanceRow[]>(createMockRows())
  const rows = ref<DispatchAllowanceRow[]>(allRows.value)

  /** 조회 버튼 — 접수일시가 기간 안에 드는 건만 남긴다 */
  function search() {
    rows.value = allRows.value.filter((row) => {
      const day = row.receivedAt.slice(0, 10)
      if (dateFrom.value && day < dateFrom.value) return false
      if (dateTo.value && day > dateTo.value) return false
      return true
    })
  }

  // ── 출동사건정보 팝업(PM-LPO-0110) ────────────────────────
  const caseDialogOpen = ref(false)
  const caseInfo = ref<DispatchCaseInfo>(createMockCase('08202660920301'))

  /** 목록의 접수번호를 누르면 그 건의 사건정보를 연다 */
  function openCase(row: DispatchAllowanceRow) {
    caseInfo.value = createMockCase(row.receiptNo)
    caseDialogOpen.value = true
  }

  return { dateFrom, dateTo, rows, search, caseDialogOpen, caseInfo, openCase }
}
