import { computed, ref } from 'vue'

/** 경찰청 주요 정책 목록(PM-COM-2001) 한 줄.
 *  칸 구성은 화면설계서_게시판_V1.1 8장 표를 따른다 */
export interface BoardListRow {
  no: number | '공지'
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
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력 +22',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      mine: true,
    },
    {
      no: '공지',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-09',
      viewCount: 1813,
      mine: false,
    },
    {
      no: 13538,
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: false,
      writer: '홍길동',
      createdAt: '2026-07-08',
      viewCount: 1776,
      mine: false,
    },
    {
      no: 13537,
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력 +22',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-07',
      viewCount: 1739,
      mine: true,
    },
    {
      no: 13536,
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-06',
      viewCount: 1702,
      mine: false,
    },
    {
      no: 13535,
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1665,
      mine: false,
    },
    {
      no: 13534,
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력 +22',
      hasAttachment: false,
      writer: '홍길동',
      createdAt: '2026-07-09',
      viewCount: 1628,
      mine: true,
    },
    {
      no: 13533,
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-08',
      viewCount: 1591,
      mine: false,
    },
  ]
}

export function useBoard2001List() {
  const authorFilter = ref('all')
  const authorKeyword = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const searchField = ref('all')
  const keyword = ref('')

  const allRows = ref<BoardListRow[]>(createMockRows())

  const rows = computed(() => {
    return allRows.value.filter((row) => {
      if (authorKeyword.value && !row.writer.includes(authorKeyword.value)) return false
      if (keyword.value && !row.title.includes(keyword.value)) return false
      if (dateFrom.value && row.createdAt < dateFrom.value) return false
      if (dateTo.value && row.createdAt > dateTo.value) return false
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
    rows,
  }
}
