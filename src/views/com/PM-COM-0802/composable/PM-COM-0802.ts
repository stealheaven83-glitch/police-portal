import { computed, ref } from 'vue'

/**
 * 통합검색 결과(PM-COM-0802).
 * 실제 조회는 개발팀이 붙인다 — 여기서는 시안(13323:106609)을 그대로 옮긴 목업이다.
 */

/** 상단 탭 하나. count 는 탭 라벨에 괄호로 붙는다 */
export interface SearchResultTab {
  /** Select/Tabs 의 value 는 빈 문자열을 쓸 수 없다(CLAUDE.md §8) */
  value: string
  label: string
  count: number
}

/** '메뉴' 구역처럼 링크만 나열되는 결과 */
export interface MenuResult {
  /** '생활안전 > 범죄예방진단' 형태의 메뉴 경로 */
  path: string
}

/** 본문이 있는 결과 한 건 */
export interface ContentResult {
  id: number
  title: string
  summary: string
  /** 본문 아래에 붙는 메뉴 경로 링크 */
  path: string
}

/** 화면에 세로로 쌓이는 구역. 카테고리별로 건수와 목록을 갖는다 */
export interface ResultSection {
  /** 어느 탭에 속하는지 — 탭을 바꾸면 이 값으로 거른다 */
  tab: string
  title: string
  total: number
  menus?: MenuResult[]
  contents?: ContentResult[]
}

export const resultTabs: SearchResultTab[] = [
  { value: 'all', label: '전체', count: 1234 },
  { value: 'menu', label: '메뉴', count: 12 },
  { value: 'lpo', label: '지역경찰', count: 2 },
  { value: 'pub', label: '생활안전', count: 1 },
  { value: 'flp', label: '탄력순찰', count: 2 },
  { value: 'com', label: '게시판', count: 99 },
]

const SUMMARY_LONG =
  '경찰청(청장 직무대행 유재성)은 ‘사이버범죄 예방의 날*(4월 2일)’을 맞이하여 사이버범죄에 대한 국민적 경각심을 높이고 예방수칙을 널리 알리기 위해 다양한 온라인 홍보 활동을 전개한다. 경찰청(청장 직무대행 유재성)은 ‘사이버범죄 예방의 날*(4월 2일)’을 맞이하여 사이버범죄에 대한 국민적 경각심을 높이고 예방수칙을 널리 알리기 위해 다양한 온라인 홍보 활동을 전개한다.'
const SUMMARY_SHORT =
  '경찰청(청장 직무대행 유재성)은 ‘사이버범죄 예방의 날*(4월 2일)’을 맞이하여 사이버범죄에 대한 국민적 경각심을 높이고 예방수칙을 널리 알리기 위해 다양한 온라인 홍보 활동을 전개한다.'

function createMockSections(): ResultSection[] {
  return [
    {
      tab: 'menu',
      title: '메뉴',
      total: 4,
      menus: [
        { path: '생활안전 > 범죄예방진단' },
        { path: '게시판 > Q&A > 범죄예방진단' },
        { path: '게시판 > 우수사례 > 범죄예방진단' },
      ],
    },
    {
      tab: 'lpo',
      title: '지역경찰',
      total: 12,
      contents: [
        { id: 1, title: 'MM월 NN일 현장 녹음 내용', summary: SUMMARY_LONG, path: '생활안전 > 범죄예방진단' },
        { id: 2, title: 'MM월 NN일 현장 녹음 내용', summary: SUMMARY_LONG, path: '생활안전 > 범죄예방진단' },
        { id: 3, title: 'MM월 NN일 현장 녹음 내용', summary: SUMMARY_LONG, path: '생활안전 > 범죄예방진단' },
      ],
    },
    {
      tab: 'pub',
      title: '생활안전',
      total: 1,
      contents: [
        { id: 4, title: 'MM월 NN일 현장 녹음 내용', summary: SUMMARY_SHORT, path: '생활안전 > 범죄예방진단' },
      ],
    },
    // 시안의 마지막 구역은 결과 0건(No Data) 예시다. 시안에는 '생활안전'이 한 번 더 적혀
    // 있는데 바로 위 구역과 제목이 겹쳐 탭 목록에 맞춰 '탄력순찰'로 뒀다 — 확인 필요.
    { tab: 'flp', title: '탄력순찰', total: 0, contents: [] },
  ]
}

export function useIntegratedSearchResult() {
  const keyword = ref('')
  const activeTab = ref('all')
  const currentPage = ref(1)
  const sections = ref<ResultSection[]>(createMockSections())

  /** '전체' 탭이면 모든 구역, 아니면 그 탭의 구역만 */
  const visibleSections = computed(() =>
    activeTab.value === 'all'
      ? sections.value
      : sections.value.filter((section) => section.tab === activeTab.value),
  )

  const totalCount = computed(
    () => resultTabs.find((tab) => tab.value === 'all')?.count ?? 0,
  )

  return {
    keyword,
    activeTab,
    currentPage,
    sections,
    visibleSections,
    totalCount,
  }
}
