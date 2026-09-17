import { computed, ref, watch } from 'vue'

/**
 * 현장대응팁 목록(PM-COM-1701) 한 줄.
 *
 * 칸 구성: 부서 X / 공지 고정 X / 추천수 X / 공개상태 X / 카테고리 X.
 * 상세·수정·등록(PM-COM-1702~0716)은 `useBoardStore('tip')` 의 상태를 쓰고,
 * 목록 rows 는 그 스토어에 없어서 여기서 따로 둔다.
 */
export interface TipRow {
  id: number
  no: number
  title: string
  /** 제목 뒤에 붙는 댓글 수 — 0 이면 안 그린다(포매터가 point 색으로 '+22' 처럼 그린다) */
  commentCount: number
  hasAttachment: boolean
  writer: string
  createdAt: string
  viewCount: number
}

function createMockRows(): TipRow[] {
  const rows: TipRow[] = []

  // 시안은 같은 모양의 줄이 반복된다 — 번호만 내림차순으로 매긴다
  for (let i = 0; i < 25; i += 1) {
    rows.push({
      id: i + 1,
      no: 13540 - i,
      title:
        '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다.입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다.',
      commentCount: i % 4 === 3 ? 0 : 22,
      hasAttachment: i % 5 !== 4,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
    })
  }

  return rows
}

export function useTipList() {
  const authorFilter = ref('all')
  const authorKeyword = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const searchField = ref('all')
  const keyword = ref('')

  const allRows = ref<TipRow[]>(createMockRows())

  const rows = computed(() =>
    allRows.value.filter((row) => {
      if (authorKeyword.value && !row.writer.includes(authorKeyword.value)) return false
      if (keyword.value && !row.title.includes(keyword.value)) return false
      if (dateFrom.value && row.createdAt < dateFrom.value) return false
      if (dateTo.value && row.createdAt > dateTo.value) return false
      return true
    }),
  )

  /* ── 페이징 — 다른 교육자료 목록(0701·0705·0709)과 같은 외부 제어(total-elements / current-page) ──
   * 이 게시판은 고정 공지가 없어 전체 행을 그대로 자른다. */
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  /** 페이지네이션의 '총 N건' */
  const totalCount = computed(() => rows.value.length)

  /** 그리드에 넘기는 행: 현재 페이지의 글 */
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
