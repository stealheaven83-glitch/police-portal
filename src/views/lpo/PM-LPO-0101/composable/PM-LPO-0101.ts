import { computed, reactive, ref, watch } from 'vue'

export interface MemoItem {
  id: number
  title: string
  /** 본문 전문 — 목록에서는 1줄 말줄임 미리보기로 쓴다 */
  content: string
  /** 요약 결과 (없으면 빈 문자열) */
  summary: string
  /** 첨부파일명 목록 */
  files: string[]
  /** 표시용 날짜 (예: 2026.07.01.) */
  date: string
  /** 표시용 시간 (예: 22:40) */
  time: string
  /** 중요 표시(별) */
  important: boolean
  /** 받은 메모=보낸 사람 / 보낸 메모=받은 사람 이름 */
  person: string
  /** 어느 함(내/받은/보낸)에 속한 메모인지 */
  box: MemoTab
}

export type MemoTab = 'mine' | 'received' | 'sent'

/**
 * 화면군 안에서 지금 보고 있는 화면.
 * list=PM-LPO-0101 목록 / detail=PM-LPO-0102 상세·수정 / write=PM-LPO-0104 등록
 * (라우트 name 과의 매핑은 PM-LPO-0101.vue 의 screenTriggers 에서 선언한다)
 */
export type MemoView = 'list' | 'detail' | 'write'

/** 저장 폼이 올려보내는 값 — 상세(수정)/등록이 같은 모양을 쓴다 */
export interface MemoFormPayload {
  title: string
  content: string
  summary: string
  files: string[]
  important: boolean
}

const templates = [
  {
    title: '긴급 회의 안건',
    content:
      '간단한 설명이 들어가는 영역입니다. 간단한 설명이 들어가는 영역입니다. 간단한 설명이 들어가는 영역입니다.',
    files: [] as string[],
  },
  {
    title: '2월 6일 밤 22시 38분 순찰 중 유흥거리 00주점에서 신고전화가 들어와서',
    content:
      '간단한 설명이 들어가는 영역입니다. 간단한 설명이 들어가는 영역입니다. 간단한 설명이 들어가는 영역입니다.',
    files: ['전입신고서 [주민등록법 시행령 : 별지서식 15, 15호의2호] [hwp, 17KB]'],
  },
  {
    title: '4월 15일 사건 인터뷰',
    content:
      '선생님 계십니까? 안녕하십니까 고성방가 신고 받고 출동한 신촌서 홍길동입니다. 잠시 시간 괜찮으실까요?',
    files: [],
  },
  {
    title: '4월 20일 오후 8시 사건 요약',
    content:
      '4월 20일 오후 8시 신천동에서 4명의 가출 청소년 발견. 길가는 행인에게 시비를 걸어 행인과 폭행시비.',
    files: ['위임장(주민등록법 시행령 별지 제15호의2호서식) [hwp, 17KB]'],
  },
]
/** 상세(PM-LPO-0102) 요약 영역 목업 — Figma 10523:43293 의 문구 */
const SUMMARY_SAMPLE =
  '요약된 내용이 표시됩니다. 요약된 내용이 표시됩니다. 요약된 내용이 표시됩니다. 요약된 내용이 표시됩니다. 요약된 내용이 표시됩니다. 요약된 내용이 표시됩니다.'

const persons = ['홍길동', '김순경', '이경위', '박형사']
const boxes: MemoTab[] = ['mine', 'received', 'sent']

function createMockMemos(): MemoItem[] {
  return Array.from({ length: 72 }, (_, i) => {
    const t = templates[i % templates.length]
    return {
      id: i + 1,
      title: t.title,
      content: t.content,
      summary: SUMMARY_SAMPLE,
      files: [...t.files],
      date: '2026.07.01.',
      time: '22:40',
      important: i % 5 === 0,
      person: persons[i % persons.length],
      box: boxes[i % boxes.length],
    }
  })
}

interface SearchForm {
  dateFrom: string
  dateTo: string
  keyword: string
  importantOnly: boolean
}

/** 등록 화면 기본 제목 (기획서 1: 제목 미입력 시 'YYYY년 MM월 NN일 입력 메모') */
export function defaultMemoTitle(now = new Date()) {
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 입력 메모`
}

export function useMemoList() {
  const allMemos = ref<MemoItem[]>(createMockMemos())

  /** 탭 전환은 조회 없이 즉시 반영 (받은/보낸 메모는 메타에 이름 표시) */
  const activeTab = ref<MemoTab>('mine')

  /** 검색영역이 물고 있는 입력값 */
  const form = reactive<SearchForm>({
    dateFrom: '',
    dateTo: '',
    keyword: '',
    importantOnly: false,
  })
  /** 조회 버튼을 눌렀을 때의 조건 (실제 목록에 적용) */
  const applied = ref<SearchForm>({ ...form })

  const selectedIds = ref<Set<number>>(new Set())
  const itemsPerPage = ref(10)
  const currentPage = ref(1)

  // ── 화면군 상태 (목록 ↔ 상세 ↔ 등록) ─────────────────────
  const view = ref<MemoView>('list')
  /** 상세(PM-LPO-0102)에서 보고 있는 메모 */
  const currentMemo = ref<MemoItem | null>(null)

  const filtered = computed(() => {
    const { keyword, dateFrom, dateTo, importantOnly } = applied.value
    const kw = keyword.trim()
    return allMemos.value.filter((m) => {
      if (m.box !== activeTab.value) return false
      if (importantOnly && !m.important) return false
      if (kw && !m.title.includes(kw) && !m.content.includes(kw)) return false
      if (dateFrom && m.date.replace(/\./g, '-').slice(0, 10) < dateFrom) return false
      if (dateTo && m.date.replace(/\./g, '-').slice(0, 10) > dateTo) return false
      return true
    })
  })

  const totalElements = computed(() => filtered.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalElements.value / itemsPerPage.value)))
  const pagedMemos = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return filtered.value.slice(start, start + itemsPerPage.value)
  })

  const isAllSelected = computed(
    () => pagedMemos.value.length > 0 && pagedMemos.value.every((m) => selectedIds.value.has(m.id)),
  )
  const selectedCount = computed(() => selectedIds.value.size)

  function search() {
    applied.value = { ...form }
    currentPage.value = 1
    selectedIds.value = new Set()
  }

  /** 탭을 바꾸면 페이지·선택을 초기화한다 (다른 함의 메모라 선택 유지가 무의미) */
  watch(activeTab, () => {
    currentPage.value = 1
    selectedIds.value = new Set()
  })

  function toggleSelect(id: number) {
    const next = new Set(selectedIds.value)
    next.has(id) ? next.delete(id) : next.add(id)
    selectedIds.value = next
  }

  function toggleSelectAll(checked: boolean) {
    const next = new Set(selectedIds.value)
    for (const m of pagedMemos.value) {
      if (checked) next.add(m.id)
      else next.delete(m.id)
    }
    selectedIds.value = next
  }

  function toggleImportant(id: number) {
    // 배열 상태는 항상 재할당 (얕은 비교 watch 대응)
    allMemos.value = allMemos.value.map((m) => (m.id === id ? { ...m, important: !m.important } : m))
    if (currentMemo.value?.id === id) {
      currentMemo.value = allMemos.value.find((m) => m.id === id) ?? null
    }
  }

  function deleteSelected() {
    allMemos.value = allMemos.value.filter((m) => !selectedIds.value.has(m.id))
    selectedIds.value = new Set()
  }

  function changePage(page: number) {
    currentPage.value = page
  }
  function changePageSize(size: number) {
    itemsPerPage.value = size
    currentPage.value = 1
  }

  // ── 화면 전환 ────────────────────────────────────────────
  /** 목록에서 제목/카드 클릭 → 상세(PM-LPO-0102) */
  function openDetail(memo: MemoItem) {
    currentMemo.value = memo
    view.value = 'detail'
  }
  /** 작성 버튼 → 등록(PM-LPO-0104) */
  function openWrite() {
    currentMemo.value = null
    view.value = 'write'
  }
  function backToList() {
    view.value = 'list'
  }

  /**
   * URL 로 바로 PM-LPO-0102 에 들어오면 어떤 메모인지 알 수 없다(useAutoTrigger 의 알려진 한계).
   * 그럴 때는 목록 첫 항목을 상세로 보여준다 — PM-LPO-0106/0107 과 같은 처리.
   */
  function ensureCurrentMemo() {
    if (!currentMemo.value) currentMemo.value = pagedMemos.value[0] ?? null
  }

  let idSeq = 1000

  /** 등록(PM-LPO-0104) 저장 — 목록 맨 앞에 넣고, 그대로 상세에서 다시 열 수 있다 */
  function createMemo(payload: MemoFormPayload): MemoItem {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const memo: MemoItem = {
      id: ++idSeq,
      title: payload.title.trim() || defaultMemoTitle(now),
      content: payload.content,
      summary: payload.summary,
      files: [...payload.files],
      date: `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}.`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
      important: payload.important,
      person: '홍길동',
      box: 'mine',
    }
    allMemos.value = [memo, ...allMemos.value]
    // 등록 직후 '내 메모' 1페이지 맨 위에서 바로 보이도록
    activeTab.value = 'mine'
    currentPage.value = 1
    return memo
  }

  /** 상세(PM-LPO-0102) 저장 */
  function updateMemo(id: number, payload: MemoFormPayload) {
    allMemos.value = allMemos.value.map((m) =>
      m.id === id
        ? {
            ...m,
            title: payload.title.trim() || m.title,
            content: payload.content,
            summary: payload.summary,
            files: [...payload.files],
            important: payload.important,
          }
        : m,
    )
    currentMemo.value = allMemos.value.find((m) => m.id === id) ?? null
  }

  /** 상세(PM-LPO-0102) 삭제 */
  function deleteMemo(id: number) {
    allMemos.value = allMemos.value.filter((m) => m.id !== id)
    currentMemo.value = null
  }

  return {
    activeTab,
    form,
    allMemos,
    pagedMemos,
    selectedIds,
    isAllSelected,
    selectedCount,
    itemsPerPage,
    currentPage,
    totalElements,
    totalPages,
    search,
    toggleSelect,
    toggleSelectAll,
    toggleImportant,
    deleteSelected,
    changePage,
    changePageSize,

    view,
    currentMemo,
    openDetail,
    openWrite,
    backToList,
    ensureCurrentMemo,
    createMemo,
    updateMemo,
    deleteMemo,
  }
}
