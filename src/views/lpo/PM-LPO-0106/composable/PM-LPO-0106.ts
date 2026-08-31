import { computed, reactive, ref } from 'vue'

export interface NotificationRow {
  id: number
  /** 구분 */
  category: string
  /** 내용 */
  content: string
  /** 일시 */
  date: string
  /** 읽음 여부. 상태 컬럼(안읽음/읽음)은 이 값으로부터 계산한다 */
  read: boolean
}

export type NotificationStatus = 'all' | 'unread' | 'read'
export type NotificationSearchCondition = 'all' | 'category' | 'content'

export interface NotificationSearchForm {
  status: NotificationStatus
  condition: NotificationSearchCondition
  keyword: string
}

/** Select 의 value 에는 빈 문자열을 못 쓰므로 "전체" 는 'all' 로 둔다 */
export const statusOptions = [
  { label: '전체', value: 'all' },
  { label: '안읽음', value: 'unread' },
  { label: '읽음', value: 'read' },
]

export const searchConditionOptions = [
  { label: '전체', value: 'all' },
  { label: '구분', value: 'category' },
  { label: '내용', value: 'content' },
]

const categories = ['근무일지(甲)', '인수인계']

function createMockRows(): NotificationRow[] {
  const templates = [
    '2026-01-01 09:00 상황근무가 지정 되었습니다. (조재현, 김균영)',
    '2026-01-01 13:11 인수관 홍길동 인수확인이 되었습니다.',
  ]
  return Array.from({ length: 37 }, (_, i) => ({
    id: i + 1,
    category: categories[i % categories.length],
    content: templates[i % templates.length],
    date: `2026-0${((i % 6) + 3)}-${String((i % 27) + 1).padStart(2, '0')} ${String(9 + (i % 10)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    read: i % 3 === 0,
  })).reverse()
}

export function useNotificationList() {
  const allRows = ref<NotificationRow[]>(createMockRows())

  /** 검색영역이 물고 있는 입력값. 조회 버튼을 눌러야 목록에 반영된다 */
  const searchForm = reactive<NotificationSearchForm>({
    status: 'all',
    condition: 'all',
    keyword: '',
  })

  /** 실제로 목록에 적용된 조회 조건(= 마지막으로 조회 버튼을 눌렀을 때의 searchForm) */
  const appliedForm = ref<NotificationSearchForm>({ ...searchForm })

  const filteredRows = computed(() => {
    const { status, condition, keyword } = appliedForm.value
    const trimmed = keyword.trim()

    return allRows.value.filter((row) => {
      if (status === 'unread' && row.read) return false
      if (status === 'read' && !row.read) return false
      if (!trimmed) return true
      if (condition === 'category') return row.category.includes(trimmed)
      if (condition === 'content') return row.content.includes(trimmed)
      return row.category.includes(trimmed) || row.content.includes(trimmed)
    })
  })

  /** 그리드 표시용: 상태 컬럼에 쓸 라벨을 미리 얹어 내려준다 */
  const displayRows = computed(() =>
    filteredRows.value.map((row) => ({ ...row, statusLabel: row.read ? '읽음' : '안읽음' })),
  )

  /** TODO: API 연동. 지금은 목업이라 조회 조건을 그대로 목록 필터에 옮기기만 한다 */
  function search() {
    appliedForm.value = { ...searchForm }
  }

  function findRow(id: number) {
    return allRows.value.find((row) => row.id === id) ?? null
  }

  function markRead(id: number) {
    const row = findRow(id)
    if (!row) return
    // 배열 상태는 항상 재할당한다(TabulatorGrid 의 :data watch 가 얕은 비교라 제자리 수정은 못 잡는다)
    allRows.value = allRows.value.map((r) => (r.id === id ? { ...r, read: true } : r))
  }

  function deleteRows(ids: number[]) {
    const idSet = new Set(ids)
    allRows.value = allRows.value.filter((row) => !idSet.has(row.id))
  }

  return {
    searchForm,
    displayRows,
    search,
    findRow,
    markRead,
    deleteRows,
  }
}
