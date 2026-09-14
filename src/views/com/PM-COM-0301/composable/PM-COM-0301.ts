import { computed, ref, watch } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/** 공지사항 목록(PM-COM-0301) 한 줄.
 *  칸 구성은 화면설계서_게시판_V1.1 8장 표(공지사항: 부서 O, 추천수 O, 공개상태 X, 카테고리 X) */
export interface NoticeRow {
  id: number
  /** 중요 공지는 번호 자리에 '중요' 배지가 들어간다 */
  no: number | '중요'
  dept: string
  title: string
  /** 제목 뒤에 붙는 댓글 수 — 0 이면 안 그린다(포매터가 point 색으로 '+22' 처럼 그린다) */
  commentCount: number
  hasAttachment: boolean
  writer: string
  createdAt: string
  viewCount: number
  recommendCount: number
}

/** 성명 검색 옵션 — 설계서 10장 1-2 (default 전체) */
export const authorFilterOptions = [
  { label: '전체', value: 'all' },
  { label: '게시글 작성자', value: 'writer' },
  { label: '댓글 작성자', value: 'commenter' },
]

/** 검색어 옵션 — 설계서 10장 1-4 (default 전체) */
export const searchFieldOptions = [
  { label: '전체', value: 'all' },
  { label: '제목', value: 'title' },
  { label: '내용', value: 'content' },
]

function createMockRows(): NoticeRow[] {
  return [
    {
      id: 1,
      no: '중요',
      dept: '대구청 지방청',
      title: '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다.입력한 제목이 표시됩니다. 입력한 제목이 표...',
      commentCount: 22,
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
    {
      id: 2,
      no: '중요',
      dept: '대구청 지방청',
      title: '27.10.10 27.10. 10. 대구청 상황점검회의 양식 등 알림 (수범사례 양식)',
      commentCount: 22,
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-11',
      viewCount: 1850,
      recommendCount: 110,
    },
    {
      id: 3,
      no: 13539,
      dept: '대전청 대전둔산서',
      title: '입력한 제목이 표시됩니다. 입력',
      commentCount: 22,
      hasAttachment: false,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
    {
      id: 4,
      no: 13538,
      dept: '광주청 범죄예방대응과',
      title: '입력한 제목이 표시됩니다. 입력',
      commentCount: 22,
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
    {
      id: 5,
      no: 13537,
      dept: '본청 범죄예방대응 지역...',
      title: '입력한 제목이 표시됩니다. 입력',
      commentCount: 22,
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
    {
      id: 6,
      no: 13536,
      dept: '대구청 지방청',
      title: '입력한 제목이 표시됩니다. 입력',
      commentCount: 22,
      hasAttachment: false,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
    {
      id: 7,
      no: 13535,
      dept: '대구청 지방청',
      title: '입력한 제목이 표시됩니다. 입력',
      commentCount: 0,
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
    {
      id: 8,
      no: 13534,
      dept: '대구청 지방청',
      title: '입력한 제목이 표시됩니다. 입력',
      commentCount: 0,
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
    {
      id: 9,
      no: 13537,
      dept: '대구청 지방청',
      title: '입력한 제목이 표시됩니다. 입력',
      commentCount: 22,
      hasAttachment: false,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },
    {
      id: 10,
      no: 13537,
      dept: '대구청 지방청',
      title: '입력한 제목이 표시됩니다. 입력',
      commentCount: 22,
      hasAttachment: false,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },    
      {
      id: 11,
      no: 13538,
      dept: '대구청 지방청',
      title: '입력한 제목이 표시됩니다. 입력',
      commentCount: 22,
      hasAttachment: false,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
      recommendCount: 109,
    },  
  ]
}

export function useNoticeList() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  /** 부서줄 오른쪽 '상세조회' 토글로 열고 닫는다 */
  const advancedSearchOpen = ref(false)

  const authorFilter = ref('all')
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

  /* ── 페이징 — 중요 공지는 건수에서 빼고 매 페이지 맨 위에 고정한다 ──
   * 그리드 내장 페이징은 중요 공지까지 세므로 외부 제어(total-elements / current-page)로 바꿔
   * 여기서 자른다. API 연동 시 개발팀이 이 자리에 서버 페이징을 붙이면 된다. */
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  const importantRows = computed(() => rows.value.filter((row) => row.no === '중요'))
  const normalRows = computed(() => rows.value.filter((row) => row.no !== '중요'))

  /** 페이지네이션의 '총 N건' — 중요 공지 제외 */
  const totalCount = computed(() => normalRows.value.length)

  /** 그리드에 넘기는 행: 중요 공지 + 현재 페이지의 일반 공지 */
  const pagedRows = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return [...importantRows.value, ...normalRows.value.slice(start, start + itemsPerPage.value)]
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
