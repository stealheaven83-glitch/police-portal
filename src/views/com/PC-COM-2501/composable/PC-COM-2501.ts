import { computed, ref } from 'vue'

export interface AppVersionRow {
  no: number
  version: string
  title: string
  inUse: boolean
  writer: string
  createdAt: string
}

export const searchConditionOptions = [
  { label: '전체', value: 'all' },
  { label: '버전', value: 'version' },
  { label: '제목', value: 'title' },
]

function createMockRows(): AppVersionRow[] {
  const titles = [
    '지역포털앱v0.3업데이트',
    '근무수첩 이용관련 공지사항',
    '지역포털앱v0.2업데이트',
    '지역경찰포털 기능개선 알림',
    '지역포털앱v0.1업데이트',
    '지역경찰포털 기능개선 알림',
  ]
  return Array.from({ length: 6 }, (_, i) => ({
    no: 6 - i,
    version: `V0.${6 - i}`,
    title: titles[i],
    inUse: true,
    writer: '경위 홍길동',
    createdAt: '2026-01-01 14:00',
  }))
}

export function useAppVersionList() {
  const searchCondition = ref('all')
  const keyword = ref('')

  const allRows = ref<AppVersionRow[]>(createMockRows())

  const rows = computed(() => {
    if (!keyword.value) return allRows.value
    return allRows.value.filter((row) => {
      if (searchCondition.value === 'version') return row.version.includes(keyword.value)
      if (searchCondition.value === 'title') return row.title.includes(keyword.value)
      return row.version.includes(keyword.value) || row.title.includes(keyword.value)
    })
  })

  return {
    searchCondition,
    keyword,
    rows,
  }
}
