import { computed, ref } from 'vue'

/** 중요정보 변경이력 한 행. 실제 조회 API 연동 전까지는 목업 데이터를 그대로 쓴다 */
export interface ImportantChangeRow {
  no: number
  /** '[계급] 이름' 형태 */
  user: string
  dept: string
  menuName: string
  /** '등록' · '수정' · '삭제' 같은 변경 구분 */
  changeType: string
  /** 무엇을 바꿨는지 한 줄 설명 */
  description: string
  ip: string
  /** 'YYYY-MM-DD HH:mm' */
  changedAt: string
}

const MOCK_USER = '[경위] 홍길동'
const MOCK_DEPT = '서울청 범죄예방대응과 한강경찰서'
const MOCK_IP = '123.123.123.123'
const MOCK_CHANGED_AT = '2026-01-01 14:00'

function createMockRows(): ImportantChangeRow[] {
  const rows = [
    { no: 6, menuName: '근무지정표작성', changeType: '등록', description: '근주지정표작성 초기화' },
    { no: 5, menuName: '인수인계', changeType: '인계관 확인', description: '인계관 확인' },
    { no: 4, menuName: '사용자관리', changeType: '등록', description: '사용자 권한 추가' },
    { no: 3, menuName: '근무지정표작성', changeType: '등록', description: '사용자 추가' },
    { no: 2, menuName: '사용자관리', changeType: '등록', description: '엑셀파일 다운로드' },
    { no: 1, menuName: '근무지정표작성', changeType: '등록', description: '근주지정표작성 초기화' },
  ]

  return rows.map((row) => ({
    ...row,
    user: MOCK_USER,
    dept: MOCK_DEPT,
    ip: MOCK_IP,
    changedAt: MOCK_CHANGED_AT,
  }))
}

export function useImportantChangeHistory() {
  const dateFrom = ref('2026-07-16')
  const dateTo = ref('2026-07-16')
  const userKeyword = ref('')

  /**
   * 시안에 조회 버튼이 있어 입력값을 바로 물리지 않고 search() 에서만 옮긴다.
   * 입력 중에 목록이 흔들리지 않게 하려는 것 — PC-COM-2402 와 같은 형태.
   */
  const appliedKeyword = ref('')

  const allRows = ref<ImportantChangeRow[]>(createMockRows())

  /*
   * 기간(dateFrom·dateTo)은 목업에 걸지 않는다.
   * 시안의 기본 기간은 2026-07-16 인데 시안의 6행은 전부 2026-01-01 이라, 그대로 거르면
   * 첫 화면이 빈 목록이 된다. 시안 데이터를 바꾸지 않으려고 사용자 검색어만 건다 —
   * 기간 조회는 개발팀이 서버에서 한다.
   */
  const rows = computed(() => {
    const keyword = appliedKeyword.value.trim()
    if (!keyword) return allRows.value
    return allRows.value.filter((row) => row.user.includes(keyword))
  })

  function search() {
    appliedKeyword.value = userKeyword.value
  }

  return {
    dateFrom,
    dateTo,
    userKeyword,
    rows,
    search,
  }
}
