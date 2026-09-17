import { computed, ref } from 'vue'

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

const categories = ['근무일지(甲)', '인수인계']

function createMockRows(): NotificationRow[] {
  const templates = [
    '22026-01-01 09:00 상황근무가 지정 되었습니다. (조재현, 김균영) 알림내용이 길어지면 이렇게 줄바꿈 길어짐 길어짐 길어짐 알림내용이 길어지면 이렇게 줄바꿈 길어짐 길어짐 길어짐',
    '2026-01-01 13:11 인수관 홍길동 인수확인이 되었습니다.',
    // 알림 내용이 길면 줄바꿈해 전문을 보여준다
    '2026-01-01 09:00 상황근무가 지정 되었습니다. (조재현, 김균영)\n알림내용이 길어지면 이렇게 줄바꿈 길어짐\n길어짐 길어짐',
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
  const status = ref<NotificationStatus>('all')

  const counts = computed(() => ({
    all: allRows.value.length,
    unread: allRows.value.filter((row) => !row.read).length,
    read: allRows.value.filter((row) => row.read).length,
  }))

  const filteredRows = computed(() => {
    if (status.value === 'unread') return allRows.value.filter((row) => !row.read)
    if (status.value === 'read') return allRows.value.filter((row) => row.read)
    return allRows.value
  })

  /** 그리드 표시용: 상태 컬럼에 쓸 라벨을 미리 얹어 내려준다 */
  const displayRows = computed(() =>
    filteredRows.value.map((row) => ({ ...row, statusLabel: row.read ? '읽음' : '안읽음' })),
  )

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
    status,
    counts,
    displayRows,
    findRow,
    markRead,
    deleteRows,
  }
}
