import { computed, reactive, ref, type InjectionKey } from 'vue'

/** 팝업공지 한 건. 조회 API 연동 전까지는 목업 데이터를 그대로 쓴다 */
export interface PopupNoticeRow {
  no: number
  /** 공지 시작일 */
  startDate: string
  /** 공지 종료일 */
  endDate: string
  title: string
  /** '사용' | '미사용' */
  use: string
  createdAt: string
  createdBy: string
}

function createMockRows(): PopupNoticeRow[] {
  const titles = [
    '지역경찰포털 기능개선 알림',
    '근무수첩 이용관련 공지사항',
    '지문신원확인 관련 공지',
    '지역경찰포털 기능개선 알림',
    '지역경찰포털 기능개선 알림',
    '지역경찰포털 기능개선 알림',
  ]

  // 시안은 최신 건이 위로 오는 내림차순이다
  return titles.map((title, index) => ({
    no: titles.length - index,
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    title,
    use: '사용',
    createdAt: '2026-01-01',
    createdBy: '홍길동',
  }))
}

export function usePopupNoticeList() {
  /** 조회 조건 입력값 */
  const searchFrom = ref('')
  const searchTo = ref('')

  const allRows = ref<PopupNoticeRow[]>(createMockRows())

  /**
   * 조회 버튼을 눌렀을 때 확정되는 조건.
   * 입력값을 바로 필터에 물리면 날짜를 고르는 중에 목록이 흔들린다.
   */
  const appliedFrom = ref('')
  const appliedTo = ref('')

  const rows = computed(() => {
    return allRows.value.filter((row) => {
      // 공지 종료일이 조회 시작일보다 이르면 기간이 겹치지 않는다
      if (appliedFrom.value && row.endDate < appliedFrom.value) return false
      // 공지 시작일이 조회 종료일보다 늦어도 마찬가지
      if (appliedTo.value && row.startDate > appliedTo.value) return false
      return true
    })
  })

  function search() {
    appliedFrom.value = searchFrom.value
    appliedTo.value = searchTo.value
  }

  return {
    searchFrom,
    searchTo,
    rows,
    search,
  }
}

/* ------------------------------------------------------------------ *
 * 공지팝업 등록/상세 (PC-COM-2402 팝업)
 * ------------------------------------------------------------------ */

export interface PopupNoticeForm {
  /** 공개 시작일 */
  openFrom: string
  /** 공개 종료일 */
  openTo: string
  /** 공지대상 — all | portal | mobile */
  target: string
  title: string
  /** 에디터 본문 HTML */
  content: string
  /** 첨부파일 (10MB 제한) */
  file: File | null
  /** 창 크기(px) */
  windowWidth: string
  windowHeight: string
  /** 창 위치(px) */
  windowLeft: string
  windowTop: string
  /** 사용여부 — Y | N */
  use: string
}

export const targetOptions = [
  { label: '전체', value: 'all' },
  { label: '포털', value: 'portal' },
  { label: '모바일', value: 'mobile' },
]

/** 첨부파일 최대 용량 (시안 안내문구와 같은 값) */
export const MAX_FILE_SIZE_MB = 10

function createForm(): PopupNoticeForm {
  return {
    openFrom: '',
    openTo: '',
    target: 'all',
    title: '',
    content: '',
    file: null,
    windowWidth: '',
    windowHeight: '',
    windowLeft: '',
    windowTop: '',
    use: 'Y',
  }
}

export function usePopupNoticeDetail() {
  const detailOpen = ref(false)
  const detailForm = reactive<PopupNoticeForm>(createForm())
  /** 수정 중인 건의 번호. null 이면 신규 등록이라 삭제 버튼을 숨긴다 */
  const editingNo = ref<number | null>(null)

  function openNew() {
    Object.assign(detailForm, createForm())
    editingNo.value = null
    detailOpen.value = true
  }

  function openDetail(row: PopupNoticeRow) {
    // TODO: 실제로는 번호로 상세를 조회해 와야 한다
    Object.assign(detailForm, createForm(), {
      openFrom: row.startDate,
      openTo: row.endDate,
      title: row.title,
      use: row.use === '사용' ? 'Y' : 'N',
    })
    editingNo.value = row.no
    detailOpen.value = true
  }

  function closeDetail() {
    detailOpen.value = false
  }

  /**
   * 시안에서 빨간 점이 붙은 항목이 필수다.
   * 처음 비어 있는 항목 하나만 알려준다(한 번에 여러 개를 띄우면 읽기 어렵다).
   */
  function findMissingField(): string | null {
    if (!detailForm.openFrom || !detailForm.openTo) return '공개기간'
    if (!detailForm.target) return '공지대상'
    if (!detailForm.title.trim()) return '제목'
    if (!detailForm.windowWidth || !detailForm.windowHeight) return '창사이즈'
    if (!detailForm.windowLeft || !detailForm.windowTop) return '창위치'
    if (!detailForm.use) return '사용여부'
    return null
  }

  return {
    detailOpen,
    detailForm,
    editingNo,
    openNew,
    openDetail,
    closeDetail,
    findMissingField,
  }
}

/**
 * PC-COM-2402.vue 에서 두 컴포저블을 합쳐 한 번만 만들고 provide 하면,
 * 팝업(components/)은 이 키로 inject 해서 같은 상태를 쓴다.
 */
export type PopupNoticeStore = ReturnType<typeof usePopupNoticeList> &
  ReturnType<typeof usePopupNoticeDetail>
export const PopupNoticeKey: InjectionKey<PopupNoticeStore> = Symbol('PC-COM-2402-popup-notice')
