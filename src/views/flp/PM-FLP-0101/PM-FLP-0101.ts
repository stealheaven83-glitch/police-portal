import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

export interface SelectOption {
  label: string
  value: string
}

export type ReceiptType = 'internal' | 'external' | 'crime-analysis'

export interface RequestRow {
  id: string
  receivedAt: string
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

export const periodTypeOptions: SelectOption[] = [
  { label: '접수', value: 'receipt' },
  { label: '요청', value: 'request' },
]

export const receiptTypeOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  { label: '내부접수', value: 'internal' },
  { label: '외부접수', value: 'external' },
  { label: '범죄분석', value: 'crime-analysis' },
]

export const pageSizeOptions: SelectOption[] = [
  { label: '10건씩 보기', value: '10' },
  { label: '20건씩 보기', value: '20' },
  { label: '50건씩 보기', value: '50' },
]

const DISTRICTS = ['중구 대청동', '서구 동대신동', '동구 초량동', '영도구 봉래동', '부산진구 부전동']
const ROADS = ['망양로', '중앙대로', '구덕로', '태종로', '가야대로']
const REASONS = ['순찰강화 및 적발필요', '민원인 요청지역 잦은 순찰', '야간 취약지역 순찰', '축제/행사 대비 순찰']
const HOTSPOTS = ['BLUE', 'RED', 'YELLOW', '']
const DEMAND_TYPES = ['경력수요강화', '경력수요유지', '경력수요완화']
const RECEIPT_TYPES: ReceiptType[] = ['internal', 'external', 'crime-analysis']

const TOTAL_MOCK_ROWS = 195

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function buildMockRows(): RequestRow[] {
  return Array.from({ length: TOTAL_MOCK_ROWS }, (_, i) => {
    const no = TOTAL_MOCK_ROWS - i
    const day = (i % 27) + 1
    const month = (i % 12) + 1
    const receivedAt = `2026-${pad(month)}-${pad(day)}`
    const toDay = Math.min(day + 26, 28)
    return {
      id: String(21307894 - i),
      receivedAt,
      requestPeriodFrom: `2026-${pad(month)}-${pad(Math.min(day + 1, 28))}`,
      requestPeriodTo: `2026-${pad(month)}-${pad(toDay)}`,
      requestTime: `${pad((i % 24))}:${pad((i * 7) % 60)}`,
      addressJibun: `부산광역시 ${DISTRICTS[i % DISTRICTS.length]} 4가 ${(i % 90) + 1}-${(i % 20) + 1}`,
      addressRoad: `부산광역시 ${DISTRICTS[i % DISTRICTS.length].split(' ')[0]} ${ROADS[i % ROADS.length]} ${(i % 400) + 1}`,
      requestCount: (i % 5) + 1,
      patrolRequest: '민원인 요청지역 어쩌고저쩌고',
      patrolReason: REASONS[i % REASONS.length],
      reportCount: i % 4,
      hotspot: HOTSPOTS[i % HOTSPOTS.length],
      demandType: DEMAND_TYPES[i % DEMAND_TYPES.length],
      demandPersonnel: (i % 6) + 1,
      email: `officer${no}@police.go.kr`,
      registrant: '홍길동',
      registeredAt: receivedAt,
      receiptType: RECEIPT_TYPES[i % RECEIPT_TYPES.length],
    }
  })
}

export function useRequestManagementForm() {
  const allRows = ref<RequestRow[]>(buildMockRows())
  const filteredRows = ref<RequestRow[]>(allRows.value)

  const department = ref<DepartmentValue>({ level1: 'busan', level2: 'busan-central', level3: 'all' })
  const periodType = ref('receipt')
  const dateFrom = ref('')
  const dateTo = ref('')
  const receiptType = ref('all')

  const pageSize = ref('10')
  const itemsPerPage = computed(() => Number(pageSize.value))
  const currentPage = ref(1)
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredRows.value.length / itemsPerPage.value)),
  )
  const pagedRows = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return filteredRows.value.slice(start, start + itemsPerPage.value)
  })

  const selectedRow = ref<RequestRow | null>(null)
  const detailOpen = ref(false)

  function matchesDateRange(row: RequestRow) {
    if (!dateFrom.value && !dateTo.value) return true
    const target = periodType.value === 'request' ? row.requestPeriodFrom : row.receivedAt
    if (dateFrom.value && target < dateFrom.value) return false
    if (dateTo.value && target > dateTo.value) return false
    return true
  }

  function search() {
    filteredRows.value = allRows.value.filter((row) => {
      const matchesReceipt = receiptType.value === 'all' || row.receiptType === receiptType.value
      return matchesReceipt && matchesDateRange(row)
    })
    currentPage.value = 1
  }

  function resetSearch() {
    department.value = { level1: 'busan', level2: 'busan-central', level3: 'all' }
    periodType.value = 'receipt'
    dateFrom.value = ''
    dateTo.value = ''
    receiptType.value = 'all'
    search()
  }

  /** 입력/설정 없이 즉시 빈 행을 목록 맨 앞에 등록 */
  function registerRow() {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
    const nextId = String(Math.max(...allRows.value.map((r) => Number(r.id))) + 1)
    const newRow: RequestRow = {
      id: nextId,
      receivedAt: todayStr,
      requestPeriodFrom: todayStr,
      requestPeriodTo: todayStr,
      requestTime: `${pad(today.getHours())}:${pad(today.getMinutes())}`,
      addressJibun: '',
      addressRoad: '',
      requestCount: 0,
      patrolRequest: '',
      patrolReason: '',
      reportCount: 0,
      hotspot: '',
      demandType: '',
      demandPersonnel: 0,
      email: '',
      registrant: '홍길동',
      registeredAt: todayStr,
      receiptType: 'internal',
    }
    allRows.value = [newRow, ...allRows.value]
    search()
  }

  function selectRow(payload: { index: number; item: RequestRow }) {
    selectedRow.value = payload.item
    detailOpen.value = true
  }

  const EXCEL_COLUMNS: { key: keyof RequestRow; label: string }[] = [
    { key: 'id', label: '관리번호' },
    { key: 'receivedAt', label: '접수일자' },
    { key: 'requestPeriodFrom', label: '요청기간(시작)' },
    { key: 'requestPeriodTo', label: '요청기간(종료)' },
    { key: 'requestTime', label: '요청시간' },
    { key: 'addressJibun', label: '주소(지번)' },
    { key: 'addressRoad', label: '주소(도로명)' },
    { key: 'requestCount', label: '요청건수' },
    { key: 'patrolRequest', label: '순찰요청사항' },
    { key: 'patrolReason', label: '순찰사유' },
    { key: 'reportCount', label: '신고건수' },
    { key: 'hotspot', label: '핫스팟' },
    { key: 'demandType', label: '경력수요형태' },
    { key: 'demandPersonnel', label: '경력수요인원' },
    { key: 'email', label: '이메일' },
    { key: 'registrant', label: '등록자' },
    { key: 'registeredAt', label: '등록일' },
  ]

  /** xlsx 등 별도 라이브러리 없이 CSV(엑셀에서 바로 열리는 포맷)로 현재 조회 결과를 내려받는다. */
  function downloadExcel() {
    const escapeCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const header = EXCEL_COLUMNS.map((c) => escapeCell(c.label)).join(',')
    const body = filteredRows.value
      .map((row) => EXCEL_COLUMNS.map((c) => escapeCell(row[c.key])).join(','))
      .join('\r\n')
    const csv = `﻿${header}\r\n${body}`

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `요청관리_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return {
    filteredRows,
    pagedRows,
    pageSize,
    itemsPerPage,
    currentPage,
    totalPages,
    department,
    periodType,
    dateFrom,
    dateTo,
    receiptType,
    selectedRow,
    detailOpen,
    search,
    resetSearch,
    registerRow,
    selectRow,
    downloadExcel,
  }
}
