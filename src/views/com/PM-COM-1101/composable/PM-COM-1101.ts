import { computed, ref, watch } from 'vue'
import { qnaCategoryLabels, type QnaCategory } from '../../composable/qna'

/** Q&A 목록(PM-COM-1101) 한 줄.
 *  칸 구성은 Figma 11220:44762 — 공지사항(PM-COM-1001)과 달리 부서·추천수가 없고 공개상태·카테고리가 있다 */
export interface QnaRow {
  id: number
  /** 고정 공지는 번호 자리에 '공지' 배지가 들어간다 */
  no: number | '공지'
  open: boolean
  category: QnaCategory
  title: string
  /** 제목 뒤에 붙는 댓글 수 — 0 이면 안 그린다(포매터가 point 색으로 '+22' 처럼 그린다) */
  commentCount: number
  hasAttachment: boolean
  writer: string
  createdAt: string
  viewCount: number
  /** '내가 쓴 글' 토글용 — 로그인 사용자가 쓴 글인지 */
  mine: boolean
}

export type { QnaCategory }

/** 카테고리 탭 — Figma category tab(14374:123334). 'all' 은 전체 */
export const categoryOptions: { label: string; value: 'all' | QnaCategory }[] = [
  { label: '전체', value: 'all' },
  { label: '장애처리', value: 'trouble' },
  { label: '출동수당', value: 'allowance' },
  { label: '범죄예방진단', value: 'diagnosis' },
  { label: '해바라기 센터', value: 'sunflower' },
]

/** 목록 칸에 보이는 카테고리 이름 — 도메인(qna.ts)의 것 */
export const categoryLabels = qnaCategoryLabels

/** 성명 검색 옵션 — 공지사항(PM-COM-1001)과 같은 구성 */
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

/** 공개상태 옵션 */
export const openStateOptions = [
  { label: '전체', value: 'all' },
  { label: '공개', value: 'open' },
  { label: '비공개', value: 'closed' },
]

const MOCK_TITLE = '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다.입력한 제목이 표시됩니다. 입력한 제목이 표...'

function createMockRows(): QnaRow[] {
  const categories: QnaCategory[] = ['sunflower', 'trouble', 'allowance', 'diagnosis']
  const rows: QnaRow[] = [
    {
      id: 1,
      no: '공지',
      open: true,
      category: 'sunflower',
      title: MOCK_TITLE,
      commentCount: 22,
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      mine: false,
    },
  ]
  for (let i = 0; i < 24; i++) {
    rows.push({
      id: i + 2,
      no: 13539 - i,
      open: i % 3 === 2,
      category: categories[i % categories.length],
      title: MOCK_TITLE,
      commentCount: i % 5 === 4 ? 0 : 22,
      hasAttachment: i % 4 !== 3,
      writer: i % 6 === 0 ? '강길동' : '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      mine: i % 6 === 0,
    })
  }
  return rows
}

export function useQnaList() {
  /** 카테고리 탭 — 'all' 이면 전부 */
  const category = ref<'all' | QnaCategory>('all')

  const authorFilter = ref('all')
  const authorKeyword = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const searchField = ref('all')
  const keyword = ref('')
  const openState = ref('all')
  /** '내가 쓴 글' 토글 */
  const mineOnly = ref(false)

  const allRows = ref<QnaRow[]>(createMockRows())

  const rows = computed(() => {
    return allRows.value.filter((row) => {
      if (category.value !== 'all' && row.category !== category.value) return false
      if (mineOnly.value && !row.mine) return false
      if (openState.value === 'open' && !row.open) return false
      if (openState.value === 'closed' && row.open) return false
      if (authorKeyword.value && !row.writer.includes(authorKeyword.value)) return false
      if (keyword.value && !row.title.includes(keyword.value)) return false
      if (dateFrom.value && row.createdAt < dateFrom.value) return false
      if (dateTo.value && row.createdAt > dateTo.value) return false
      return true
    })
  })

  /* ── 페이징 — 고정 공지는 건수에서 빼고 매 페이지 맨 위에 고정한다(PM-COM-1001 과 같은 방식) ──
   * API 연동 시 개발팀이 이 자리에 서버 페이징을 붙이면 된다. */
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  const pinnedRows = computed(() => rows.value.filter((row) => row.no === '공지'))
  const normalRows = computed(() => rows.value.filter((row) => row.no !== '공지'))

  /** 페이지네이션의 '총 N건' — 고정 공지 제외 */
  const totalCount = computed(() => normalRows.value.length)

  /** 그리드에 넘기는 행: 고정 공지 + 현재 페이지의 일반 글 */
  const pagedRows = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return [...pinnedRows.value, ...normalRows.value.slice(start, start + itemsPerPage.value)]
  })

  /** 검색 조건·탭·페이지당 건수가 바뀌면 1페이지로 */
  watch([rows, itemsPerPage], () => {
    currentPage.value = 1
  })

  /** 선택 삭제 — 그리드가 아니라 원본을 지워야 페이지를 옮겨도 되살아나지 않는다 */
  function removeRows(ids: number[]) {
    allRows.value = allRows.value.filter((row) => !ids.includes(row.id))
  }

  return {
    category,
    authorFilter,
    authorKeyword,
    dateFrom,
    dateTo,
    searchField,
    keyword,
    openState,
    mineOnly,
    rows,
    currentPage,
    itemsPerPage,
    totalCount,
    pagedRows,
    removeRows,
  }
}
