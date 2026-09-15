import { computed, ref, watch } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/** 우수사례 › 지역경찰 시책 목록(PM-COM-0501, Figma PM-COM-1201) 한 줄.
 *  칸 구성은 Figma 11015:105117 — 번호·부서·제목·첨부파일·작성자·등록일·조회수(공지사항과 달리 중요/추천수 없음) */
export interface PolicyCaseRow {
  id: number
  no: number
  dept: string
  title: string
  /** 제목 뒤에 붙는 댓글 수 — 0 이면 안 그린다(포매터가 point 색으로 '+22' 처럼 그린다) */
  commentCount: number
  hasAttachment: boolean
  writer: string
  createdAt: string
  viewCount: number
}

/** 성명 검색 옵션 — 공지사항(PM-COM-1001)과 같은 구성. 시안 초기값은 '게시글 작성자' */
export const authorFilterOptions = [
  { label: '전체', value: 'all' },
  { label: '게시글 작성자', value: 'writer' },
  { label: '댓글 작성자', value: 'commenter' },
]

/** 검색어 옵션 */
export const searchFieldOptions = [
  { label: '전체', value: 'all' },
  { label: '제목', value: 'title' },
  { label: '내용', value: 'content' },
]

const MOCK_TITLE = '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다.입력한 제목이 표시됩니다. 입력한 제목이 표...'

function createMockRows(): PolicyCaseRow[] {
  const rows: PolicyCaseRow[] = []
  for (let i = 0; i < 25; i++) {
    rows.push({
      id: i + 1,
      no: 13540 - i,
      dept: '전남 보성시 범죄예방대응과',
      title: MOCK_TITLE,
      commentCount: i % 5 === 4 ? 0 : 22,
      hasAttachment: i % 6 !== 5,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
    })
  }
  return rows
}

export function usePolicyCaseList() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  /** 부서줄 오른쪽 '상세조회' 토글 — 시안은 펼친 상태 */
  const advancedSearchOpen = ref(true)

  const authorFilter = ref('writer')
  const authorKeyword = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const searchField = ref('all')
  const keyword = ref('')

  const allRows = ref<PolicyCaseRow[]>(createMockRows())

  const rows = computed(() => {
    return allRows.value.filter((row) => {
      if (authorKeyword.value && !row.writer.includes(authorKeyword.value)) return false
      if (keyword.value && !row.title.includes(keyword.value)) return false
      if (dateFrom.value && row.createdAt < dateFrom.value) return false
      if (dateTo.value && row.createdAt > dateTo.value) return false
      return true
    })
  })

  /* ── 페이징 — 화면이 자른다. API 연동 시 개발팀이 이 자리에 서버 페이징을 붙이면 된다 */
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  const totalCount = computed(() => rows.value.length)

  const pagedRows = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return rows.value.slice(start, start + itemsPerPage.value)
  })

  /** 검색 조건이나 페이지당 건수가 바뀌면 1페이지로 */
  watch([rows, itemsPerPage], () => {
    currentPage.value = 1
  })

  /** 선택 삭제 — 그리드가 아니라 원본을 지워야 페이지를 옮겨도 되살아나지 않는다 */
  function removeRows(ids: number[]) {
    allRows.value = allRows.value.filter((row) => !ids.includes(row.id))
  }

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
    currentPage,
    itemsPerPage,
    totalCount,
    pagedRows,
    removeRows,
  }
}
