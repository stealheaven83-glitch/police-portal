import { computed, ref, watch } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 교육훈련 우수사례 목록(PM-COM-0701) 한 줄.
 *
 * 칸 구성: 부서 O / 공지 고정 O / 추천수 X / 공개상태 X / 카테고리 X.
 * 상세·수정·등록(PM-COM-0702~0704)은 `useBoardStore('training')` 의 상태를 쓰고,
 * 목록 rows 는 그 스토어에 없어서 여기서 따로 둔다.
 */
export interface TrainingCaseRow {
  id: number
  /** 고정 공지는 번호 자리에 '공지' 배지가 들어간다 */
  no: number | '공지'
  dept: string
  title: string
  /** 제목 뒤에 붙는 댓글 수 — 0 이면 안 그린다(포매터가 point 색으로 '+22' 처럼 그린다) */
  commentCount: number
  hasAttachment: boolean
  writer: string
  createdAt: string
  viewCount: number
}

function createMockRows(): TrainingCaseRow[] {
  const dept = '전남 보성시 범죄예방대응과'
  const rows: TrainingCaseRow[] = [
    {
      id: 1,
      no: '공지',
      dept,
      title: '지역경찰 순찰차 적재함 및 탑재장비 개선 관련 현장 의견을 받습니다.',
      commentCount: 22,
      hasAttachment: true,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
    },
  ]

  // 시안은 같은 모양의 줄이 반복된다 — 번호만 내림차순으로 매긴다
  for (let i = 0; i < 24; i += 1) {
    rows.push({
      id: i + 2,
      no: 13540 - i,
      dept,
      title:
        '입력한 제목이 표시됩니다. 입력한 제목이 표시됩니다.입력한 제목이 표시됩니다. 입력한 제목이 표...',
      commentCount: i % 4 === 3 ? 0 : 22,
      hasAttachment: i % 5 !== 4,
      writer: '홍길동',
      createdAt: '2026-07-10',
      viewCount: 1850,
    })
  }

  return rows
}

export function useTrainingCaseList() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  /** 부서줄 오른쪽 '상세조회' 토글로 열고 닫는다 */
  const advancedSearchOpen = ref(false)

  const authorFilter = ref('all')
  const authorKeyword = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const searchField = ref('all')
  const keyword = ref('')

  const allRows = ref<TrainingCaseRow[]>(createMockRows())

  const rows = computed(() =>
    allRows.value.filter((row) => {
      if (authorKeyword.value && !row.writer.includes(authorKeyword.value)) return false
      if (keyword.value && !row.title.includes(keyword.value)) return false
      if (dateFrom.value && row.createdAt < dateFrom.value) return false
      if (dateTo.value && row.createdAt > dateTo.value) return false
      return true
    }),
  )

  /* ── 페이징 — 고정 공지는 건수에서 빼고 매 페이지 맨 위에 고정한다 ──
   * 공지는 번호를 받지 않으며 게시글 영역에 표시되지 않는다(= 총 건수에서 제외).
   * 그리드 내장 페이징은 공지까지 세므로 외부 제어(total-elements / current-page)로 바꿔 여기서 자른다. */
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
