import { ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 탄력순찰 > 요청관리 화면 상태.
 * 화면(.vue)에는 조립만 남기고 옵션·목업·조회/등록 로직은 전부 여기로 뺀다.
 */

export interface SelectOption {
  label: string
  value: string
}

/** 접수구분 */
export type ReceiptType = 'internal' | 'external' | 'crime-analysis'

/** 요청관리 목록 한 행 */
export interface RequestRow {
  /** 관리번호 */
  id: string
  receivedAt: string
  /** 그리드에 그대로 보여줄 '시작 ~ 종료' 문자열 */
  requestPeriod: string
  /** 기간 조회에 쓰는 원본 값 */
  requestPeriodFrom: string
  requestPeriodTo: string
  requestTime: string
  addressJibun: string
  addressRoad: string
  requestCount: number
  patrolRequest: string
  patrolReason: string
  reportCount: number
  hotspot: string
  demandType: string
  demandPersonnel: number
  email: string
  registrant: string
  registeredAt: string
  receiptType: ReceiptType
}

/** 기간구분 — 어떤 날짜를 기간 조건으로 볼지 */
export const periodTypeOptions: SelectOption[] = [
  // Select 의 value 에는 빈 문자열을 못 쓴다(CLAUDE.md §8) — '전체'도 실제 문자열로
  { label: '전체', value: 'all' },
  { label: '접수일자', value: 'receipt' },
  { label: '요청기간', value: 'request' },
]

export const receiptTypeOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  { label: '내부접수', value: 'internal' },
  { label: '외부접수', value: 'external' },
  { label: '범죄분석', value: 'crime-analysis' },
]

const DISTRICTS = ['중구 대청동', '서구 동대신동', '동구 초량동', '영도구 봉래동', '부산진구 부전동']
const ROADS = ['망양로', '중앙대로', '구덕로', '태종로', '가야대로']
const REQUESTS = [
  '민원인 요청지역 야간 집중순찰 요망',
  '등하교 시간대 통학로 순찰 요망',
  '공원 주변 취객 관련 순찰 요망',
]
const REASONS = [
  '범죄발생전력(절도·폭력 다발지역)',
  '순찰강화 및 적발필요',
  '야간 취약지역 순찰',
  '축제/행사 대비 순찰',
]
const HOTSPOTS = ['BLUE', 'RED', 'YELLOW', '-']
const DEMAND_TYPES = ['경력수요강화', '경력수요유지', '경력수요완화']
const RECEIPT_TYPES: ReceiptType[] = ['internal', 'external', 'crime-analysis']

/** 시안의 '총 195건'을 그대로 재현한다 */
const TOTAL_MOCK_ROWS = 195

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toDateString(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** TODO: API 연동 전까지 쓰는 목업 */
function buildMockRows(): RequestRow[] {
  return Array.from({ length: TOTAL_MOCK_ROWS }, (_, index) => {
    const month = (index % 12) + 1
    const day = (index % 27) + 1
    const receivedAt = `2026-${pad(month)}-${pad(day)}`
    const from = `2026-${pad(month)}-${pad(Math.min(day + 1, 28))}`
    const to = `2026-${pad(month)}-${pad(Math.min(day + 26, 28))}`
    const district = DISTRICTS[index % DISTRICTS.length]

    return {
      id: String(21307894 - index),
      receivedAt,
      requestPeriod: `${from} ~ ${to}`,
      requestPeriodFrom: from,
      requestPeriodTo: to,
      requestTime: `${pad(index % 24)}~${pad((index % 24) + 3)}`,
      addressJibun: `부산광역시 ${district} 4가 ${(index % 90) + 1}-${(index % 20) + 1}`,
      addressRoad: `부산광역시 ${district.split(' ')[0]} ${ROADS[index % ROADS.length]} ${(index % 400) + 1}`,
      requestCount: (index % 5) + 1,
      patrolRequest: REQUESTS[index % REQUESTS.length],
      patrolReason: REASONS[index % REASONS.length],
      reportCount: index % 4,
      hotspot: HOTSPOTS[index % HOTSPOTS.length],
      demandType: DEMAND_TYPES[index % DEMAND_TYPES.length],
      demandPersonnel: (index % 6) + 1,
      email: `officer${TOTAL_MOCK_ROWS - index}@police.go.kr`,
      registrant: '홍길동',
      registeredAt: receivedAt,
      receiptType: RECEIPT_TYPES[index % RECEIPT_TYPES.length],
    }
  })
}

export function useRequestManage() {
  const allRows = ref<RequestRow[]>(buildMockRows())
  /** 조회 결과 = 그리드에 그리는 목록. 배열은 항상 재할당한다(CLAUDE.md §3) */
  const rows = ref<RequestRow[]>(allRows.value)

  /* ── 조회 조건 ─────────────────────────────── */
  /** 시안 기본값: 본청 / 전체 / 전체 */
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  /** 상세조회(회색 영역) 펼침 상태 — 시안은 펼쳐진 상태다 */
  const advancedSearchOpen = ref(true)
  const periodType = ref('all')
  const dateFrom = ref('2026-07-16')
  const dateTo = ref('2026-07-16')
  const receiptType = ref('all')

  function matchesPeriod(row: RequestRow) {
    if (periodType.value === 'all') return true
    if (!dateFrom.value && !dateTo.value) return true

    // 접수일자는 하루, 요청기간은 구간이라 겹치는지를 본다
    if (periodType.value === 'receipt') {
      if (dateFrom.value && row.receivedAt < dateFrom.value) return false
      if (dateTo.value && row.receivedAt > dateTo.value) return false
      return true
    }
    if (dateFrom.value && row.requestPeriodTo < dateFrom.value) return false
    if (dateTo.value && row.requestPeriodFrom > dateTo.value) return false
    return true
  }

  function search() {
    rows.value = allRows.value.filter(
      (row) =>
        (receiptType.value === 'all' || row.receiptType === receiptType.value) && matchesPeriod(row),
    )
  }

  function resetSearch() {
    department.value = { level1: 'hq', level2: 'all', level3: 'all' }
    periodType.value = 'all'
    dateFrom.value = ''
    dateTo.value = ''
    receiptType.value = 'all'
    search()
  }

  /* ── 신규 등록 ─────────────────────────────── */
  /** 그리드 맨 위에 붙일 빈 행. 관리번호만 채워서 내려준다 */
  function createEmptyRow(): RequestRow {
    const now = new Date()
    const today = toDateString(now)
    const nextId = String(Math.max(...allRows.value.map((row) => Number(row.id))) + 1)

    const newRow: RequestRow = {
      id: nextId,
      receivedAt: today,
      requestPeriod: `${today} ~ ${today}`,
      requestPeriodFrom: today,
      requestPeriodTo: today,
      requestTime: `${pad(now.getHours())}~${pad(now.getHours() + 1)}`,
      addressJibun: '',
      addressRoad: '',
      requestCount: 0,
      patrolRequest: '',
      patrolReason: '',
      reportCount: 0,
      hotspot: '-',
      demandType: '',
      demandPersonnel: 0,
      email: '',
      registrant: '홍길동',
      registeredAt: today,
      receiptType: 'internal',
    }

    allRows.value = [newRow, ...allRows.value]
    return newRow
  }

  return {
    rows,
    department,
    advancedSearchOpen,
    periodType,
    dateFrom,
    dateTo,
    receiptType,
    search,
    resetSearch,
    createEmptyRow,
  }
}
