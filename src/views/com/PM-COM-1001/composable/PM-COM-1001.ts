import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

export interface NoticeRow {
  no: number | '중요'
  dept: string
  title: string
  hasAttachment: boolean
  writer: string
  createdAt: string
  viewCount: number
  recommendCount: number
}

export const authorFilterOptions = [
  { label: '게시글 작성자', value: 'writer' },
  { label: '제목', value: 'title' },
]

export const searchFieldOptions = [
  { label: '전체', value: 'all' },
  { label: '제목', value: 'title' },
  { label: '내용', value: 'content' },
]

function createMockRows(): NoticeRow[] {
  return [
    {
      no: '중요',
      dept: '대구청 지방청',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다.입력한 제목이 표시됩니다. 입력한 제목이 표... +22',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
    {
      no: '중요',
      dept: '대구청 지방청',
      title: '27.10.10 27.10. 10. 대구청 상황점검회의 양식 등 알림 (수범사례 양식) +22',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-11',
      viewCount: 1850,
      recommendCount: 110,
    },
    {
      no: 13539,
      dept: '대전청 대전둔산서',
      title: '입력한 제목이 표시됩니다. 입력 +22',
      hasAttachment: false,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
    {
      no: 13538,
      dept: '광주청 범죄예방대응',
      title: '입력한 제목이 표시됩니다. 입력 +22',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
    {
      no: 13537,
      dept: '본청 범죄예방대응 지역...',
      title: '입력한 제목이 표시됩니다. 입력 +22',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
    {
      no: 13536,
      dept: '대구청 지방청',
      title: '입력한 제목이 표시됩니다. 입력 +22',
      hasAttachment: false,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
    {
      no: 13535,
      dept: '대구청 지방청',
      title: '입력한 제목이 표시됩니다. 입력',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
    {
      no: 13534,
      dept: '대구청 지방청',
      title: '입력한 제목이 표시됩니다. 입력',
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
  ]
}

export function useNoticeList() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const advancedSearchOpen = ref(true)

  const authorFilter = ref('writer')
  const authorKeyword = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const searchField = ref('all')
  const keyword = ref('')

  const allRows = ref<NoticeRow[]>(createMockRows())

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
