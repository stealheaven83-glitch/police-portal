import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/** 상시학습자료 목록(PM-COM-1501) 한 줄.
 *  칸 구성은 화면설계서_게시판_V1.1 8장 표를 따른다 */
export interface BoardListRow {
  no: number | '공지'
  dept: string
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
      dept: '본청 범죄예방대응 지역...',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력 +22',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      mine: true,
    },
    {
      no: '공지',
      dept: '대구청 지방청',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-09',
      viewCount: 1813,
      mine: false,
    },
    {
      no: 13538,
      dept: '대전청 대전둔산서',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: false,
      writer: '홍길동',
      createdAt: '2026-07-08',
      viewCount: 1776,
      mine: false,
    },
    {
      no: 13537,
      dept: '광주청 범죄예방대응',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력 +22',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-07',
      viewCount: 1739,
      mine: true,
    },
    {
      no: 13536,
      dept: '본청 범죄예방대응 지역...',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-06',
      viewCount: 1702,
      mine: false,
    },
    {
      no: 13535,
      dept: '대구청 지방청',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1665,
      mine: false,
    },
    {
      no: 13534,
      dept: '대전청 대전둔산서',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력 +22',
      hasAttachment: false,
      writer: '홍길동',
      createdAt: '2026-07-09',
      viewCount: 1628,
      mine: true,
    },
    {
      no: 13533,
      dept: '광주청 범죄예방대응',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다. 입력',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-08',
      viewCount: 1591,
      mine: false,
    },
  ]
}

export function useBoard1501List() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const advancedSearchOpen = ref(false)

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
    department,
    advancedSearchOpen,
    authorFilter,
    authorKeyword,
    dateFrom,
    dateTo,
    searchField,
    keyword,
    rows,
  }
}
