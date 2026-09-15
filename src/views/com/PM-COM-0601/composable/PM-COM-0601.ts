import { computed, ref, watch } from 'vue'

/** 우수사례 › 현장조치 목록(PM-COM-0601, Figma PM-COM-1301) 한 줄.
 *  칸 구성은 Figma 11015:107395 — 번호·지방청·주차·제목·첨부파일·작성자·등록일·조회수 */
export interface FieldCaseRow {
  id: number
  no: number
  /** 지방청 — 위 카테고리 탭으로 걸러진다 */
  province: string
  /** 주차(예: '3주차') */
  week: string
  title: string
  /** 제목 뒤에 붙는 댓글 수 — 0 이면 안 그린다(포매터가 point 색으로 '+22' 처럼 그린다) */
  commentCount: number
  hasAttachment: boolean
  writer: string
  createdAt: string
  viewCount: number
}

/**
 * 지방청 탭 — Figma tab(11015:107839) category tab 20개. 시안 뒤쪽 3개는 'Title' placeholder 라
 * 시도청 순서대로 경북청·경남청·제주청으로 채웠다(확인 필요). 'all' 은 전체
 */
export const provinceOptions: { label: string; value: string }[] = [
  { label: '전체', value: 'all' },
  { label: '경찰청', value: '경찰청' },
  { label: '서울청', value: '서울청' },
  { label: '부산청', value: '부산청' },
  { label: '대구청', value: '대구청' },
  { label: '인천청', value: '인천청' },
  { label: '광주청', value: '광주청' },
  { label: '대전청', value: '대전청' },
  { label: '울산청', value: '울산청' },
  { label: '세종청', value: '세종청' },
  { label: '경기남부청', value: '경기남부청' },
  { label: '경기북부청', value: '경기북부청' },
  { label: '강원청', value: '강원청' },
  { label: '충북청', value: '충북청' },
  { label: '충남청', value: '충남청' },
  { label: '전북청', value: '전북청' },
  { label: '전남청', value: '전남청' },
  { label: '경북청', value: '경북청' },
  { label: '경남청', value: '경남청' },
  { label: '제주청', value: '제주청' },
]

/** 성명 검색 옵션 — 시안 초기값 '전체' */
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

function createMockRows(): FieldCaseRow[] {
  const provinces = provinceOptions.slice(1).map((o) => o.value)
  const rows: FieldCaseRow[] = []
  for (let i = 0; i < 25; i++) {
    rows.push({
      id: i + 1,
      no: 13540 - i,
      province: provinces[i % provinces.length],
      week: `${(i % 4) + 1}주차`,
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

export function useFieldCaseList() {
  /** 지방청 탭 — 'all' 이면 전부 */
  const province = ref('all')

  const authorFilter = ref('all')
  const authorKeyword = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const searchField = ref('all')
  const keyword = ref('')

  const allRows = ref<FieldCaseRow[]>(createMockRows())

  const rows = computed(() => {
    return allRows.value.filter((row) => {
      if (province.value !== 'all' && row.province !== province.value) return false
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

  /** 검색 조건·탭·페이지당 건수가 바뀌면 1페이지로 */
  watch([rows, itemsPerPage], () => {
    currentPage.value = 1
  })

  /** 선택 삭제 — 그리드가 아니라 원본을 지워야 페이지를 옮겨도 되살아나지 않는다 */
  function removeRows(ids: number[]) {
    allRows.value = allRows.value.filter((row) => !ids.includes(row.id))
  }

  return {
    province,
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
