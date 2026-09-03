import { computed, reactive, ref, watch } from 'vue'

export interface MemoItem {
  id: number
  title: string
  /** 본문 미리보기 (1줄 말줄임) */
  preview: string
  /** 표시용 날짜 (예: 2026.07.01.) */
  date: string
  /** 표시용 시간 (예: 22:40) */
  time: string
  /** 중요 표시(별) */
  important: boolean
  hasAttachment: boolean
  /** 받은 메모=보낸 사람 / 보낸 메모=받은 사람 이름 */
  person: string
  /** 어느 함(내/받은/보낸)에 속한 메모인지 */
  box: MemoTab
}

export type MemoTab = 'mine' | 'received' | 'sent'

const templates = [
  { title: '긴급 회의 안건', preview: '간단한 설명이 들어가는 영역입니다. 간단한 설명이 들어가는 영역입니다.', attach: false },
  { title: '2월 6일 밤 22시 38분 순찰 중 유흥거리 00주점에서 신고전화가 들어와서', preview: '간단한 설명이 들어가는 영역입니다. 간단한 설명이 들어가는 영역입니다.', attach: true },
  { title: '4월 15일 사건 인터뷰', preview: '선생님 계십니까? 안녕하십니까 고성방가 신고 받고 출동한 신촌서 홍길동입니다. 잠시 시간 괜찮으실까요?', attach: false },
  { title: '4월 20일 오후 8시 사건 요약', preview: '4월 20일 오후 8시 신천동에서 4명의 가출 청소년 발견. 길가는 행인에게 시비를 걸어 행인과 폭행시비.', attach: true },
]
const persons = ['홍길동', '김순경', '이경위', '박형사']
const boxes: MemoTab[] = ['mine', 'received', 'sent']

function createMockMemos(): MemoItem[] {
  return Array.from({ length: 72 }, (_, i) => {
    const t = templates[i % templates.length]
    return {
      id: i + 1,
      title: t.title,
      preview: t.preview,
      date: '2026.07.01.',
      time: '22:40',
      important: i % 5 === 0,
      hasAttachment: t.attach,
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

  const filtered = computed(() => {
    const { keyword, dateFrom, dateTo, importantOnly } = applied.value
    const kw = keyword.trim()
    return allMemos.value.filter((m) => {
      if (m.box !== activeTab.value) return false
      if (importantOnly && !m.important) return false
      if (kw && !m.title.includes(kw) && !m.preview.includes(kw)) return false
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
  }
}
