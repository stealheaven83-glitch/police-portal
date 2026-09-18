import { ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 112사건조회 팝업(custom/common/Case112Dialog.vue)의 조회 상태와 목업.
 * 목록·상세 모두 연동 전 목업이고, 값 형태는 시안(15203:139960)을 그대로 따른다.
 * **API 연동 시 이 파일의 createRows/createDetail 만 갈아 끼우면 된다.**
 * 처음 쓰인 곳: PC-LPO-0503(임의등록 PC-LPO-0502 의 '112사건조회' 체크로 연다).
 */

/** 사건목록 한 줄 — 컬럼 구성은 기획서(번호~LBS위치조회), 값은 시안 */
export interface Case112Row {
  no: number
  receivedDate: string
  receivedTime: string
  code: string
  caseNo: string
  caseType: string
  receiptOffice: string
  jurisdictionOffice: string
  closing: string
  lbs: string
}

/** 출동요소목록 한 줄 */
export interface DispatchElementRow {
  element: string
  contact: string
}

/** 사건상세 — 접수정보 / 접수·도착·종결 / 지령 / 도착·종결 / 출동요소목록 */
export interface Case112Detail {
  receiptNo: string
  code: string
  caseNo: string
  receivedDate: string
  caseType: string
  caseStatus: string
  sameCase: string
  receiptType: string
  reporter: string
  reportNo: string
  addressType: string
  address: string
  detailLocation: string
  summary: string
  note: string
  recordStartAt: string
  recordEndAt: string
  receivedAt: string
  orderedAt: string
  dispatchedAt: string
  closeRequestedAt: string
  dispatchMinutes: string
  preOrderedAt: string
  jurisdictionStation: string
  jurisdictionUnit: string
  dispatcher: string
  dispatchElement: string
  closingCode: string
  reporterName: string
  closingCaseCode: string
  tempClosedAt: string
  closingContent: string
  elements: DispatchElementRow[]
}

/** 검색 조건 사건종별 — Select 는 빈 문자열을 못 받아 '전체'를 'all' 로 둔다(CLAUDE.md §5) */
export const case112TypeOptions = [
  { label: '전체', value: 'all' },
  { label: '가정폭력', value: '가정폭력' },
  { label: '상담문의', value: '상담문의' },
  { label: '시비', value: '시비' },
]

function createRows(): Case112Row[] {
  return [195, 194, 193, 192, 191, 190, 189, 188, 187, 186].map((no, index) => ({
    no,
    receivedDate: '2026-06-24',
    receivedTime: '12:00:01',
    code: 'C4',
    caseNo: '04',
    caseType: index % 3 === 1 ? '시비' : '상담문의',
    receiptOffice: '서울청',
    jurisdictionOffice: '을지지구대',
    closing: '남자',
    lbs: '',
  }))
}

function createDetail(row: Case112Row): Case112Detail {
  return {
    receiptNo: `00000[CODE ${row.code}]`,
    code: 'CODE0',
    caseNo: '00000[폭력]',
    receivedDate: '2026-06-19',
    caseType: '위험방지',
    caseStatus: '도착',
    sameCase: '없음',
    receiptType: '112-공조충남청',
    reporter: '',
    reportNo: '01012345678',
    addressType: '도로',
    address: '충청남도 청양군',
    detailLocation: '충남청양경찰서',
    summary: '[CODE0 선지령]\n도와주세요 / 101동 204호\n/ 위치값 /빨리 와주세요.끊김/',
    note: '85세 OOO(여) 키 150cm가량 오해소한 체격. 갈색종절모모자 착용. 상의는 쉐터자켓, 신발은 검정색 털신, 치아임플란트와 틀니착용',
    recordStartAt: '19:23:22',
    recordEndAt: '19:27:22',
    receivedAt: '19:27:33',
    orderedAt: '19:27:55',
    dispatchedAt: '19:28:05',
    closeRequestedAt: '',
    dispatchMinutes: '2',
    preOrderedAt: '',
    jurisdictionStation: '가정폭력',
    jurisdictionUnit: '약수지구대',
    dispatcher: '',
    dispatchElement: '중부 여청01호',
    closingCode: '동일',
    reporterName: '',
    closingCaseCode: '107',
    tempClosedAt: '',
    closingContent: '8134번과 동일건',
    elements: [
      { element: '약수지구대', contact: '01012341234' },
      { element: '중부 순00호', contact: '01012341234' },
      { element: '중부 순01호', contact: '01012341234' },
      { element: '중부 순02호', contact: '01012341234' },
      { element: '중부 순03호', contact: '01012341234' },
    ],
  }
}

export function useCase112Search() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: '', level3: '' })
  /* 시안 프레임은 '상세조회 열림' 상태를 그린 것이고, 기본은 다른 화면과 같이 닫힘이다 */
  const advancedOpen = ref(false)
  const receiptNo = ref('')
  const caseNo = ref('')
  const reportNo = ref('')
  const caseType = ref('가정폭력')
  const dateFrom = ref('2026-07-16')
  const dateTo = ref('2026-07-16')

  const allRows = createRows()
  const rows = ref<Case112Row[]>(allRows)
  const selected = ref<Case112Row | null>(null)
  const detail = ref<Case112Detail | null>(null)

  /** 목업 필터 — 실제 조회(부서·기간 포함)는 개발팀 연동 */
  function search() {
    rows.value = allRows.filter(
      (row) =>
        (!caseNo.value || row.caseNo.includes(caseNo.value)) &&
        (caseType.value === 'all' || caseType.value === '가정폭력' || row.caseType === caseType.value),
    )
    selected.value = null
    detail.value = null
  }

  function select(row: Case112Row) {
    selected.value = row
    detail.value = createDetail(row)
  }

  return {
    department,
    advancedOpen,
    receiptNo,
    caseNo,
    reportNo,
    caseType,
    dateFrom,
    dateTo,
    rows,
    selected,
    detail,
    search,
    select,
  }
}
