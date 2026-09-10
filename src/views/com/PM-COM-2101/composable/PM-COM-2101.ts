import { computed, ref } from 'vue'

/** 정책 제안 및 건의사항 목록(PM-COM-2101) 한 줄.
 *  칸 구성은 화면설계서_게시판_V1.1 8장 표를 따른다 */
export interface BoardListRow {
  no: number | '공지'
  openState: string
  title: string
  hasAttachment: boolean
  writer: string
  createdAt: string
  viewCount: number
  mine: boolean
}

function createMockRows(): BoardListRow[] {
  return [
    {
      no: '공지',
      openState: '공개',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력 +22',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      mine: true,
    },
    {
      no: '공지',
      openState: '비공개',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-09',
      viewCount: 1813,
      mine: false,
    },
    {
      no: 13538,
      openState: '비공개',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: false,
      writer: '홍길동',
      createdAt: '2026-07-08',
      viewCount: 1776,
      mine: false,
    },
    {
      no: 13537,
      openState: '공개',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력 +22',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-07',
      viewCount: 1739,
      mine: true,
    },
    {
      no: 13536,
      openState: '비공개',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-06',
      viewCount: 1702,
      mine: false,
    },
    {
      no: 13535,
      openState: '비공개',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1665,
      mine: false,
    },
    {
      no: 13534,
      openState: '공개',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력 +22',
      hasAttachment: false,
      writer: '홍길동',
      createdAt: '2026-07-09',
      viewCount: 1628,
      mine: true,
    },
    {
      no: 13533,
      openState: '비공개',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-08',
      viewCount: 1591,
      mine: false,
    },
  ]
}

export function useBoard2101List() {
  const authorFilter = ref('all')
  const authorKeyword = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const searchField = ref('all')
  const keyword = ref('')
  const openState = ref('all')
  /** 설계서 21장 4번 — 켜면 내가 쓴 글만 보인다 */
  const mineOnly = ref(false)

  const allRows = ref<BoardListRow[]>(createMockRows())

  const rows = computed(() => {
    return allRows.value.filter((row) => {
      if (authorKeyword.value && !row.writer.includes(authorKeyword.value)) return false
      if (keyword.value && !row.title.includes(keyword.value)) return false
      if (dateFrom.value && row.createdAt < dateFrom.value) return false
      if (dateTo.value && row.createdAt > dateTo.value) return false
      if (openState.value !== 'all') {
        const want = openState.value === 'open' ? '공개' : '비공개'
        if (row.openState !== want) return false
      }
      if (mineOnly.value && !row.mine) return false
      return true
    })
  })

  return {
    authorFilter,
    authorKeyword,
    dateFrom,
    dateTo,
    searchField,
    keyword,
    openState,
    mineOnly,
    rows,
  }
}
