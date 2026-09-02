import { computed, reactive, ref, type InjectionKey } from 'vue'

export interface AppVersionRow {
  no: number
  version: string
  title: string
  inUse: boolean
  writer: string
  createdAt: string
}

/**
 * 앱관리 등록 팝업(PC-COM-2502) 폼.
 * 목록의 '신규' 버튼에서 열린다 — Figma 12342:88216 (PC_시스템관리_05_앱관리_신규팝업).
 */
export interface AppVersionDetailForm {
  /** 공개기간 시작/종료 */
  openFrom: string
  openTo: string
  /** 앱버전 — 화면에는 'Ver.' 접두어가 따로 붙고 여기엔 숫자 부분만 담는다 */
  version: string
  title: string
  /** 에디터 본문(HTML) */
  content: string
  /** 등록자/등록일시 — 읽기 전용 표시. 실제 값은 서버가 채운다 */
  writer: string
  createdAt: string
  use: 'Y' | 'N'
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

/**
 * 신규 등록 폼의 기본값.
 * 시안(12342:88216)에 채워져 있던 값을 그대로 목업으로 둔다 — 공개기간은 2026-07-16,
 * 등록자/등록일시는 로그인 사용자와 등록 시각 자리라 서버가 채울 값이다.
 */
function createEmptyDetail(): AppVersionDetailForm {
  return {
    openFrom: '2026-07-16',
    openTo: '2026-07-16',
    version: '',
    title: '',
    content: '',
    writer: '경위 홍길동',
    createdAt: '2026-01-01 14:00',
    use: 'Y',
  }
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

  /* ---------------------------------------------------------------- 등록 팝업 */
  const detailOpen = ref(false)
  const detailForm = reactive<AppVersionDetailForm>(createEmptyDetail())

  function openNewDetail() {
    Object.assign(detailForm, createEmptyDetail())
    detailOpen.value = true
  }

  function closeDetail() {
    detailOpen.value = false
  }

  /** 시안에서 라벨에 붉은 점(필수)이 붙은 항목. 비어 있는 첫 항목명을 돌려준다 */
  function findMissingField(): string | null {
    if (!detailForm.openFrom || !detailForm.openTo) return '공개기간'
    if (!detailForm.version.trim()) return '앱버전'
    if (!detailForm.title.trim()) return '제목'
    if (!detailForm.use) return '사용여부'
    return null
  }

  return {
    searchCondition,
    keyword,
    rows,
    detailOpen,
    detailForm,
    openNewDetail,
    closeDetail,
    findMissingField,
  }
}

/**
 * 목록 화면이 useAppVersionList() 를 한 번만 호출해 provide 하고, 등록 팝업은 inject 로
 * 같은 상태를 쓴다(CLAUDE.md §3 패턴A — 팝업이 각자 호출하면 상태가 갈라진다).
 */
export type AppVersionStore = ReturnType<typeof useAppVersionList>
export const AppVersionKey: InjectionKey<AppVersionStore> = Symbol('PC-COM-2501-app-version')
