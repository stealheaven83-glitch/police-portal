import { computed, ref } from 'vue'

/** 실적 구분 탭 8개 — Figma tab_2(15116:131562). 모바일 MO-LPO-0112~0119 가 PC 에서는 탭 하나씩이다 */
export type PerfTabKey =
  | 'report112'
  | 'summaryTrial'
  | 'noticeDisposition'
  | 'tcs'
  | 'carPatrol'
  | 'footPatrol'
  | 'basePatrol'
  | 'crimePrevention'

export interface PerfTab {
  value: PerfTabKey
  label: string
}

export const perfTabs: PerfTab[] = [
  { value: 'report112', label: '112신고처리' },
  { value: 'summaryTrial', label: '즉결심판' },
  { value: 'noticeDisposition', label: '통고처분' },
  { value: 'tcs', label: 'TCS단속' },
  { value: 'carPatrol', label: '차량순찰' },
  { value: 'footPatrol', label: '도보순찰' },
  { value: 'basePatrol', label: '거점순찰' },
  { value: 'crimePrevention', label: '범죄예방진단' },
]

/** TableWrapper 컬럼. width 는 colgroup 에 그대로 들어간다(시안 번호 60 / 주소 320, 나머지 균등) */
export interface PerfColumn {
  key: string
  label: string
  width?: string
}

/** 한 행. 탭마다 컬럼이 달라 키를 고정하지 않는다 — 번호(no)만 공통 */
export type PerfRow = Record<string, string | number> & { no: number }

/**
 * 탭별 컬럼. 112신고처리만 시안(15116:130943)에 표가 있고, 나머지 7개는 시안에 표가 없어
 * 탭 이름에 맞춰 임의로 잡았다 — 개발팀이 실제 조회 항목으로 바꾼다.
 */
export const perfColumns: Record<PerfTabKey, PerfColumn[]> = {
  report112: [
    { key: 'no', label: '번호', width: '6rem' },
    { key: 'dept', label: '부서' },
    { key: 'closedAt', label: '종결일시' },
    { key: 'caseNo', label: '사건번호' },
    { key: 'reportType', label: '112신고구분' },
    { key: 'caseType', label: '112사건종별' },
    { key: 'address', label: '주소', width: '32rem' },
    { key: 'result', label: '112종결내용' },
  ],
  summaryTrial: [
    { key: 'no', label: '번호', width: '6rem' },
    { key: 'dept', label: '부서' },
    { key: 'handledAt', label: '처리일시' },
    { key: 'caseNo', label: '사건번호' },
    { key: 'violation', label: '위반내용' },
    { key: 'target', label: '대상자' },
    { key: 'address', label: '주소', width: '32rem' },
    { key: 'result', label: '처리결과' },
  ],
  noticeDisposition: [
    { key: 'no', label: '번호', width: '6rem' },
    { key: 'dept', label: '부서' },
    { key: 'handledAt', label: '처분일시' },
    { key: 'noticeNo', label: '통고번호' },
    { key: 'violation', label: '위반내용' },
    { key: 'target', label: '대상자' },
    { key: 'address', label: '주소', width: '32rem' },
    { key: 'result', label: '처분결과' },
  ],
  tcs: [
    { key: 'no', label: '번호', width: '6rem' },
    { key: 'dept', label: '부서' },
    { key: 'handledAt', label: '단속일시' },
    { key: 'controlNo', label: '단속번호' },
    { key: 'controlType', label: '단속유형' },
    { key: 'vehicleNo', label: '차량번호' },
    { key: 'address', label: '주소', width: '32rem' },
    { key: 'result', label: '처리결과' },
  ],
  carPatrol: [
    { key: 'no', label: '번호', width: '6rem' },
    { key: 'dept', label: '부서' },
    { key: 'patrolAt', label: '순찰일시' },
    { key: 'vehicleNo', label: '순찰차' },
    { key: 'area', label: '순찰구역' },
    { key: 'distance', label: '순찰거리' },
    { key: 'address', label: '주소', width: '32rem' },
    { key: 'note', label: '특이사항' },
  ],
  footPatrol: [
    { key: 'no', label: '번호', width: '6rem' },
    { key: 'dept', label: '부서' },
    { key: 'patrolAt', label: '순찰일시' },
    { key: 'officer', label: '순찰자' },
    { key: 'area', label: '순찰구역' },
    { key: 'duration', label: '순찰시간' },
    { key: 'address', label: '주소', width: '32rem' },
    { key: 'note', label: '특이사항' },
  ],
  basePatrol: [
    { key: 'no', label: '번호', width: '6rem' },
    { key: 'dept', label: '부서' },
    { key: 'patrolAt', label: '순찰일시' },
    { key: 'baseName', label: '거점명' },
    { key: 'area', label: '순찰구역' },
    { key: 'duration', label: '근무시간' },
    { key: 'address', label: '주소', width: '32rem' },
    { key: 'note', label: '특이사항' },
  ],
  crimePrevention: [
    { key: 'no', label: '번호', width: '6rem' },
    { key: 'dept', label: '부서' },
    { key: 'diagnosedAt', label: '진단일시' },
    { key: 'diagnosisNo', label: '진단번호' },
    { key: 'target', label: '진단대상' },
    { key: 'diagnosisType', label: '진단유형' },
    { key: 'address', label: '주소', width: '32rem' },
    { key: 'result', label: '진단결과' },
  ],
}

/** 탭별 목업 행 수 — 시안의 탭 건수(12·23·7·12·12·12·15·12)와 같게 두어 탭 숫자와 목록이 맞물린다 */
const mockCounts: Record<PerfTabKey, number> = {
  report112: 12,
  summaryTrial: 23,
  noticeDisposition: 7,
  tcs: 12,
  carPatrol: 12,
  footPatrol: 12,
  basePatrol: 15,
  crimePrevention: 12,
}

/** 한 행의 값 틀. 112신고처리는 시안 값 그대로, 나머지는 탭에 맞춘 임의 값 */
const mockTemplates: Record<PerfTabKey, Omit<PerfRow, 'no'>> = {
  report112: {
    dept: '시도청 경찰서 지구대',
    closedAt: '2026-01-01 14:00',
    caseNo: 'C2 04000',
    reportType: '무질서',
    caseType: '시비',
    address: '서울특별시 중구 을지로6가 18-21',
    result: '합의해산',
  },
  summaryTrial: {
    dept: '시도청 경찰서 지구대',
    handledAt: '2026-01-01 14:00',
    caseNo: 'S1 02000',
    violation: '경범죄처벌법 위반',
    target: '홍길동',
    address: '서울특별시 중구 을지로6가 18-21',
    result: '즉결심판 청구',
  },
  noticeDisposition: {
    dept: '시도청 경찰서 지구대',
    handledAt: '2026-01-01 14:00',
    noticeNo: 'N1 03000',
    violation: '무단횡단',
    target: '홍길동',
    address: '서울특별시 중구 을지로6가 18-21',
    result: '범칙금 통고',
  },
  tcs: {
    dept: '시도청 경찰서 지구대',
    handledAt: '2026-01-01 14:00',
    controlNo: 'T1 05000',
    controlType: '신호위반',
    vehicleNo: '12가 3456',
    address: '서울특별시 중구 을지로6가 18-21',
    result: '범칙금 부과',
  },
  carPatrol: {
    dept: '시도청 경찰서 지구대',
    patrolAt: '2026-01-01 14:00',
    vehicleNo: '순찰 1호',
    area: '을지로 일대',
    distance: '12.5 km',
    address: '서울특별시 중구 을지로6가 18-21',
    note: '특이사항 없음',
  },
  footPatrol: {
    dept: '시도청 경찰서 지구대',
    patrolAt: '2026-01-01 14:00',
    officer: '[경사] 홍길동',
    area: '을지로 일대',
    duration: '02:00',
    address: '서울특별시 중구 을지로6가 18-21',
    note: '특이사항 없음',
  },
  basePatrol: {
    dept: '시도청 경찰서 지구대',
    patrolAt: '2026-01-01 14:00',
    baseName: '을지로6가 거점',
    area: '을지로 일대',
    duration: '02:00',
    address: '서울특별시 중구 을지로6가 18-21',
    note: '특이사항 없음',
  },
  crimePrevention: {
    dept: '시도청 경찰서 지구대',
    diagnosedAt: '2026-01-01 14:00',
    diagnosisNo: 'D1 06000',
    target: '을지로6가 상가',
    diagnosisType: '방범 진단',
    address: '서울특별시 중구 을지로6가 18-21',
    result: '양호',
  },
}

function createMockRows(tab: PerfTabKey): PerfRow[] {
  const count = mockCounts[tab]
  // 시안처럼 번호가 큰 것부터(5,4,3,2,1) 내려온다
  return Array.from({ length: count }, (_, index) => ({ no: count - index, ...mockTemplates[tab] }))
}

function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** 페이지당 건수 — 사용자 지정: 목록은 5개씩 */
export const pageSizeOptions = [
  { label: '5건', value: '5' },
  { label: '10건', value: '10' },
  { label: '20건', value: '20' },
]

export function usePerformanceStats() {
  // 검색기간 초기값은 조회 당일(사용자 지정)
  const dateFrom = ref(today())
  const dateTo = ref(today())

  const activeTab = ref<PerfTabKey>('report112')

  const rowsByTab = ref<Record<PerfTabKey, PerfRow[]>>(
    Object.fromEntries(perfTabs.map((tab) => [tab.value, createMockRows(tab.value)])) as Record<
      PerfTabKey,
      PerfRow[]
    >,
  )

  /** 탭 카드에 붙는 건수 — 목록 길이와 항상 같다 */
  const countByTab = computed(
    () =>
      Object.fromEntries(perfTabs.map((tab) => [tab.value, rowsByTab.value[tab.value].length])) as Record<
        PerfTabKey,
        number
      >,
  )

  const columns = computed(() => perfColumns[activeTab.value])
  const rows = computed(() => rowsByTab.value[activeTab.value])

  const currentPage = ref(1)
  const itemsPerPage = ref(5)
  const totalPages = computed(() => Math.max(1, Math.ceil(rows.value.length / itemsPerPage.value)))
  const pagedRows = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return rows.value.slice(start, start + itemsPerPage.value)
  })

  function onItemsPerPageChange(size: number) {
    itemsPerPage.value = size
    currentPage.value = 1
  }

  /** 탭을 바꾸면 그 탭의 목록 1페이지부터 */
  function selectTab(tab: PerfTabKey) {
    activeTab.value = tab
    currentPage.value = 1
  }

  /*
   * 검색기간은 서버 집계 조건이라 목업에서는 걸 곳이 없다(행의 일시와 대조하면 당일 조건에서
   * 목록이 비어 화면 확인이 안 된다). 조회는 1페이지로 되돌리기만 한다 — 기간 조회는 개발팀.
   */
  function search() {
    currentPage.value = 1
  }

  return {
    dateFrom,
    dateTo,
    activeTab,
    countByTab,
    columns,
    rows,
    pagedRows,
    currentPage,
    itemsPerPage,
    totalPages,
    onItemsPerPageChange,
    selectTab,
    search,
  }
}
