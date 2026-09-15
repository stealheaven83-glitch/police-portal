import { computed, ref } from 'vue'

/** 메뉴별 사용통계 한 행. 실제 조회 API 연동 전까지는 목업 데이터를 그대로 쓴다 */
export interface MenuUsageRow {
  no: number
  /** 메뉴 이름 */
  menuName: string
  /** 최상위 메뉴부터 이어 붙인 경로 */
  menuPath: string
  /** 집계 기간 동안의 접속수 */
  visitCount: number
}

function createMockRows(): MenuUsageRow[] {
  return [
    { no: 6, menuName: '메모', menuPath: '지역경찰 > 메모', visitCount: 500 },
    {
      no: 5,
      menuName: '근무지정표작성',
      menuPath: '지역경찰 > 근무일지 > 근무일지(甲)',
      visitCount: 400,
    },
    { no: 4, menuName: '인수인계 작성', menuPath: '지역경찰 >인수인계', visitCount: 200 },
    { no: 3, menuName: '해바라기센터 관리', menuPath: '생활안전 > 해바라기센터', visitCount: 100 },
    { no: 2, menuName: '요청관리', menuPath: '탄력순찰', visitCount: 50 },
    { no: 1, menuName: '범죄 안전 지도', menuPath: '탄력순찰', visitCount: 20 },
  ]
}

export function useMenuUsageStats() {
  const dateFrom = ref('2026-07-16')
  const dateTo = ref('2026-07-16')
  const pageKeyword = ref('')

  /**
   * 시안에 조회 버튼이 있어 입력값을 바로 물리지 않고 search() 에서만 옮긴다.
   * 입력 중에 목록이 흔들리지 않게 하려는 것 — PC-COM-2402 와 같은 형태.
   */
  const appliedKeyword = ref('')

  const allRows = ref<MenuUsageRow[]>(createMockRows())

  /*
   * 기간(dateFrom·dateTo)은 집계 기간이라 행에 대응하는 날짜 값이 없다.
   * 목업에서는 걸 곳이 없어 키워드만 거른다 — 기간별 집계는 개발팀이 서버에서 한다.
   */
  const rows = computed(() => {
    const keyword = appliedKeyword.value.trim()
    if (!keyword) return allRows.value
    return allRows.value.filter(
      (row) => row.menuName.includes(keyword) || row.menuPath.includes(keyword),
    )
  })

  function search() {
    appliedKeyword.value = pageKeyword.value
  }

  return {
    dateFrom,
    dateTo,
    pageKeyword,
    rows,
    search,
  }
}
