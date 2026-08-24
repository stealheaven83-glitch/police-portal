import { computed, reactive, ref } from 'vue'

export interface MemoItem {
  id: number
  title: string
  preview: string
  date: string
  time: string
  important: boolean
  hasAttachment: boolean
}

export type MemoTab = 'mine' | 'received' | 'sent'
export type MemoSort = 'latest' | 'oldest'

export const sortOptions = [
  { label: '최신순', value: 'latest' },
  { label: '오래된순', value: 'oldest' },
]

function createMockMemos(): MemoItem[] {
  const templates = [
    { title: '긴급 회의 안건', preview: '간단한 설명이 들어가는 영역입니다. 최대 2줄까지 작성합니다. 간단…', attachment: false },
    { title: '2월 6일 밤 22시 38분 순찰 중 유흥거리 O…', preview: '간단한 설명이 들어가는 영역입니다. 최대 2줄까지 작성합니다. 간단…', attachment: true },
    { title: '4월 15일 사건 인터뷰', preview: '선생님 계십니까? 안녕하십니까 고성방가 신고 받고 출동한 신촌서 홍…', attachment: false },
    { title: '4월 20일 오후 8시 사건 요약', preview: '4월 20일 오후 8시 신천동에서 4명의 가출 청소년 발견. 길가는 행인…', attachment: true },
  ]
  return Array.from({ length: 24 }, (_, i) => {
    const t = templates[i % templates.length]
    return {
      id: i + 1,
      title: t.title,
      preview: t.preview,
      date: '2026.07.01.',
      time: '22:40',
      important: i % 5 === 0,
      hasAttachment: t.attachment,
    }
  })
}

export function useMemoList() {
  const allMemos = createMockMemos()
  const activeTab = ref<MemoTab>('mine')
  const sort = ref<MemoSort>('latest')
  const importantOnly = ref(false)

  const searchDateFrom = ref('')
  const searchDateTo = ref('')
  const searchKeyword = ref('')

  const memos = ref<MemoItem[]>(allMemos)
  const selectedIds = reactive(new Set<number>())

  const itemsPerPage = ref(10)
  const currentPage = ref(1)

  const filteredMemos = computed(() => {
    let result = memos.value
    if (importantOnly.value) result = result.filter((m) => m.important)
    if (searchKeyword.value.trim()) {
      const kw = searchKeyword.value.trim()
      result = result.filter((m) => m.title.includes(kw) || m.preview.includes(kw))
    }
    result = [...result].sort((a, b) => (sort.value === 'latest' ? b.id - a.id : a.id - b.id))
    return result
  })

  const totalElements = computed(() => filteredMemos.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalElements.value / itemsPerPage.value)))
  const pagedMemos = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return filteredMemos.value.slice(start, start + itemsPerPage.value)
  })

  const isAllSelected = computed(
    () => pagedMemos.value.length > 0 && pagedMemos.value.every((m) => selectedIds.has(m.id)),
  )

  function search() {
    currentPage.value = 1
  }

  function toggleSelectAll(checked: boolean) {
    for (const memo of pagedMemos.value) {
      if (checked) selectedIds.add(memo.id)
      else selectedIds.delete(memo.id)
    }
  }

  function toggleSelect(id: number, checked: boolean) {
    if (checked) selectedIds.add(id)
    else selectedIds.delete(id)
  }

  function toggleImportant(id: number) {
    const memo = memos.value.find((m) => m.id === id)
    if (memo) memo.important = !memo.important
  }

  function deleteSelected() {
    memos.value = memos.value.filter((m) => !selectedIds.has(m.id))
    selectedIds.clear()
  }

  function changePageSize(size: number) {
    itemsPerPage.value = size
    currentPage.value = 1
  }

  return {
    activeTab,
    sort,
    importantOnly,
    searchDateFrom,
    searchDateTo,
    searchKeyword,
    pagedMemos,
    selectedIds,
    isAllSelected,
    itemsPerPage,
    currentPage,
    totalPages,
    totalElements,
    search,
    toggleSelectAll,
    toggleSelect,
    toggleImportant,
    deleteSelected,
    changePageSize,
  }
}
