import { computed, ref, type InjectionKey } from 'vue'

/**
 * 예약불가 관리 (PC-PUB-0419)
 *
 * 목록 화면 하나에 예약불가 상세/수정(PC-PUB-0420) · 등록(PC-PUB-0421) 팝업이 붙는 화면군이라
 * 상태를 여기서 한 번만 만들고 화면에서 provide 한다 — docs/create/tab-popup.md §3 패턴A.
 */

/** 예약불가 관리 한 행. 실제 조회 API 연동 전까지는 목업 데이터를 그대로 쓴다 */
export interface UnavailableReservationRow {
  rowKey: string
  no: number
  /** '예약불가' | '예약불가 해제' */
  status: string
  centerName: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  reason: string
  registeredDate: string
}

/** 상세/수정 · 등록 팝업이 쓰는 입력 폼 — 시간은 '시'·'분' 셀렉트 둘로 갈라 든다 */
export interface UnavailableReservationForm {
  /** null 이면 신규 등록 */
  rowKey: string | null
  centerName: string
  startDate: string
  startHour: string
  startMinute: string
  endDate: string
  endHour: string
  endMinute: string
  reason: string
  status: string
}

/** 등록 팝업의 센터명 셀렉트 — 목록에 찍히는 문자열 그대로를 값으로 쓴다 */
export const centerOptions = [
  '서울(서울대병원)',
  '서울(경찰병원)',
  '광주(조선대병원)',
  '부산(부산대병원)',
  '대구(경북대병원)',
].map((name) => ({ label: name, value: name }))

export const statusOptions = [
  { label: '예약불가', value: '예약불가' },
  { label: '예약불가 해제', value: '예약불가 해제' },
]

export const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: String(i).padStart(2, '0'),
  value: String(i).padStart(2, '0'),
}))

export const minuteOptions = ['00', '10', '20', '30', '40', '50'].map((m) => ({ label: m, value: m }))

function createEmptyForm(): UnavailableReservationForm {
  return {
    rowKey: null,
    centerName: '',
    startDate: '',
    startHour: '',
    startMinute: '',
    endDate: '',
    endHour: '',
    endMinute: '',
    reason: '',
    status: '',
  }
}

/* 시안(15093-131379)에 보이는 세 줄 + 페이지네이션이 넘어가도록 채운 줄 */
function createMockRows(): UnavailableReservationRow[] {
  const figmaRows: UnavailableReservationRow[] = [
    {
      rowKey: 'unavailable-3',
      no: 3,
      status: '예약불가',
      centerName: '서울(서울대병원)',
      startDate: '2026-07-25',
      startTime: '09:00',
      endDate: '2026-07-28',
      endTime: '18:00',
      reason: '센터 행사',
      registeredDate: '2026-09-14',
    },
    {
      rowKey: 'unavailable-2',
      no: 2,
      status: '예약불가',
      centerName: '서울(경찰병원)',
      startDate: '2026-07-25',
      startTime: '09:00',
      endDate: '2026-07-28',
      endTime: '18:00',
      reason: '센터 내부 공사',
      registeredDate: '2026-09-14',
    },
    {
      rowKey: 'unavailable-1',
      no: 1,
      status: '예약불가 해제',
      centerName: '광주(조선대병원)',
      startDate: '2026-07-25',
      startTime: '09:00',
      endDate: '2026-07-28',
      endTime: '18:00',
      reason: '센터 직원 외부 교육',
      registeredDate: '2026-09-14',
    },
  ]

  const centers = centerOptions.map((o) => o.value)
  const reasons = ['센터 행사', '센터 내부 공사', '센터 직원 외부 교육', '시설 점검']
  const fillerRows: UnavailableReservationRow[] = Array.from({ length: 12 }, (_, i) => ({
    rowKey: `unavailable-${15 - i}`,
    no: 15 - i,
    status: i % 4 === 3 ? '예약불가 해제' : '예약불가',
    centerName: centers[i % centers.length],
    startDate: `2026-08-${String(10 + i).padStart(2, '0')}`,
    startTime: '09:00',
    endDate: `2026-08-${String(12 + i).padStart(2, '0')}`,
    endTime: '18:00',
    reason: reasons[i % reasons.length],
    registeredDate: '2026-09-14',
  }))

  return [...fillerRows, ...figmaRows]
}

function createUnavailableReservation() {
  const rows = ref<UnavailableReservationRow[]>(createMockRows())

  /* 예약불가 상세/수정(PC-PUB-0420) · 등록(PC-PUB-0421) 팝업 — 폼 하나를 모드로 나눠 쓴다 */
  const formDialogOpen = ref(false)
  const formMode = ref<'detail' | 'create'>('create')
  const form = ref<UnavailableReservationForm>(createEmptyForm())

  /**
   * 등록 팝업만 URL(PC-PUB-0421)과 동기화한다 — useAutoTrigger 가 set 할 수 있게 쓰기 가능한 computed.
   * 상세(0420)는 어느 행인지 URL 만으로 알 수 없어 동기화하지 않는다(docs/create/tab-popup.md §4).
   */
  const createDialogOpen = computed({
    get: () => formDialogOpen.value && formMode.value === 'create',
    set: (open) => {
      if (open) openCreate()
      else formDialogOpen.value = false
    },
  })

  function openCreate() {
    formMode.value = 'create'
    form.value = createEmptyForm()
    formDialogOpen.value = true
  }

  function openDetail(rowKey: string) {
    const row = rows.value.find((r) => r.rowKey === rowKey)
    if (!row) return
    const [startHour = '', startMinute = ''] = row.startTime.split(':')
    const [endHour = '', endMinute = ''] = row.endTime.split(':')
    form.value = {
      rowKey: row.rowKey,
      centerName: row.centerName,
      startDate: row.startDate,
      startHour,
      startMinute,
      endDate: row.endDate,
      endHour,
      endMinute,
      reason: row.reason,
      status: row.status,
    }
    formMode.value = 'detail'
    formDialogOpen.value = true
  }

  function validateForm(): string | null {
    const f = form.value
    if (formMode.value === 'create' && !f.centerName) return '센터명을 선택해 주세요.'
    if (!f.startDate || !f.startHour || !f.startMinute) return '시작일시를 입력해 주세요.'
    if (!f.endDate || !f.endHour || !f.endMinute) return '종료일시를 입력해 주세요.'
    if (!f.reason.trim()) return '사유를 입력해 주세요.'
    if (formMode.value === 'detail' && !f.status) return '상태를 선택해 주세요.'
    return null
  }

  /** 배열은 재할당한다 — splice 제자리 수정은 그리드가 못 잡는다(CLAUDE.md §5) */
  function commitForm() {
    const f = form.value
    const startTime = `${f.startHour}:${f.startMinute}`
    const endTime = `${f.endHour}:${f.endMinute}`
    if (f.rowKey) {
      rows.value = rows.value.map((row) =>
        row.rowKey === f.rowKey
          ? { ...row, startDate: f.startDate, startTime, endDate: f.endDate, endTime, reason: f.reason, status: f.status }
          : row,
      )
    } else {
      const nextNo = rows.value.reduce((max, row) => Math.max(max, row.no), 0) + 1
      rows.value = [
        {
          rowKey: `unavailable-${Date.now()}`,
          no: nextNo,
          // 등록 시안에는 상태 칸이 없다 — 새로 등록한 건은 '예약불가' 로 둔다(인계 메모)
          status: '예약불가',
          centerName: f.centerName,
          startDate: f.startDate,
          startTime,
          endDate: f.endDate,
          endTime,
          reason: f.reason,
          registeredDate: new Date().toISOString().slice(0, 10),
        },
        ...rows.value,
      ]
    }
    formDialogOpen.value = false
  }

  return {
    rows,
    formDialogOpen,
    formMode,
    createDialogOpen,
    form,
    openCreate,
    openDetail,
    validateForm,
    commitForm,
  }
}

export type UnavailableReservationStore = ReturnType<typeof createUnavailableReservation>

export const UnavailableReservationKey: InjectionKey<UnavailableReservationStore> = Symbol('unavailable-reservation')

export function useUnavailableReservation() {
  return createUnavailableReservation()
}
