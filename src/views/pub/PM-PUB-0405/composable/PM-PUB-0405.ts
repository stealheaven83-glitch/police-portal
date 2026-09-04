import { ref, type InjectionKey } from 'vue'

/**
 * 조사예약 (PM-PUB-0405 월별 / PC-PUB-0406 주간별)
 *
 * 월간·주간은 달력 컴포넌트 안의 토글이라 화면은 하나다(화면군 — CLAUDE.md §3 패턴A).
 * 여기에 조사예약 등록(PC-PUB-0408) · 상세(PC-PUB-0407) 팝업이 붙는다.
 */

/** 등록 팝업(PC-PUB-0408) 입력 폼 */
export interface ReservationForm {
  centerName: string
  requestDate: string
  /** 신청자는 로그인 사용자라 화면에서 고치지 않는다 */
  requester: string
  startHour: string
  startMinute: string
  endHour: string
  endMinute: string
  victimAge: string
  crimeName: string
}

/** 상세 팝업(PC-PUB-0407) 이 보여주는 예약 한 건 */
export interface ReservationDetail {
  centerName: string
  requestDate: string
  requester: string
  /** '10시 00분 ~ 12시 30분' 처럼 이미 만들어진 문구 */
  period: string
  victimAge: string
  crimeName: string
  /** 'approve' | 'reject' — 아직 처리 전이면 빈 문자열 */
  decision: string
  rejectReason: string
}

export const centerOptions = [
  { label: '서울(서울대병원)', value: 'seoul' },
  { label: '부산(부산의료원)', value: 'busan' },
  { label: '광주(조선대병원)', value: 'gwangju' },
]

/** 관할청 — 달력 위 조회 조건 */
export const officeOptions = [
  { label: '서울청', value: 'seoul' },
  { label: '부산청', value: 'busan' },
  { label: '광주청', value: 'gwangju' },
]

/** 신청기간 시/분 셀렉트. value 에 빈 문자열을 못 쓰므로 실제 값만 넣는다(CLAUDE.md §8) */
export const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: String(i).padStart(2, '0'),
  value: String(i).padStart(2, '0'),
}))

export const minuteOptions = ['00', '10', '20', '30', '40', '50'].map((m) => ({ label: m, value: m }))

function createEmptyForm(): ReservationForm {
  return {
    centerName: '',
    requestDate: '',
    requester: '서울청 아똑7팀 경장 홍길동',
    startHour: '',
    startMinute: '',
    endHour: '',
    endMinute: '',
    victimAge: '',
    crimeName: '',
  }
}

function createMockDetail(): ReservationDetail {
  return {
    centerName: '서울(서울대병원)',
    requestDate: '2026-07-23',
    requester: '서울청 아똑7팀 경장 홍길동',
    period: '10시 00분 ~ 12시 30분',
    victimAge: '35세',
    crimeName: '아동학대',
    decision: '',
    rejectReason: '',
  }
}

function createReservationCalendar() {
  /* 달력 위 조회 조건 — 시안에 조회 버튼이 없다 */
  const searchOffice = ref('')
  const searchCenter = ref('')

  /* 조사예약 등록 팝업(PC-PUB-0408) */
  const createDialogOpen = ref(false)
  const form = ref<ReservationForm>(createEmptyForm())

  function openCreate() {
    form.value = createEmptyForm()
    createDialogOpen.value = true
  }

  function validateForm(): string | null {
    if (!form.value.centerName) return '센터명을 선택해 주세요.'
    if (!form.value.requestDate) return '신청일자를 선택해 주세요.'
    if (!form.value.startHour || !form.value.startMinute || !form.value.endHour || !form.value.endMinute) {
      return '신청기간을 선택해 주세요.'
    }
    return null
  }

  /* 조사예약 상세 팝업(PC-PUB-0407) */
  const detailDialogOpen = ref(false)
  const detail = ref<ReservationDetail>(createMockDetail())

  /**
   * 달력의 일정을 눌렀을 때 연다.
   * 달력 컴포넌트가 아직 이벤트를 밖으로 넘기지 않아 지금은 목업 한 건을 보여준다.
   */
  function openDetail() {
    detail.value = createMockDetail()
    detailDialogOpen.value = true
  }

  function validateDecision(): string | null {
    if (!detail.value.decision) return '승인 또는 거부를 선택해 주세요.'
    if (detail.value.decision === 'reject' && !detail.value.rejectReason.trim()) {
      return '거부내용을 입력해 주세요.'
    }
    return null
  }

  return {
    searchOffice,
    searchCenter,
    createDialogOpen,
    form,
    openCreate,
    validateForm,
    detailDialogOpen,
    detail,
    openDetail,
    validateDecision,
  }
}

export type ReservationCalendarStore = ReturnType<typeof createReservationCalendar>

export const ReservationCalendarKey: InjectionKey<ReservationCalendarStore> =
  Symbol('PM-PUB-0405-reservation-calendar')

export function useReservationCalendar() {
  return createReservationCalendar()
}
