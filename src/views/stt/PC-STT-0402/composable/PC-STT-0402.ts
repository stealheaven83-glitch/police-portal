import { computed, ref } from 'vue'

/** 접속이력 한 행. 실제 조회 API 연동 전까지는 목업 데이터를 그대로 쓴다 */
export interface VisitLogRow {
  /** 일별이면 '1'~'31', 월별이면 '1'~'12' */
  label: string
  /** 누적 방문 수 */
  totalVisits: number
  /** 그 날(달)의 방문 수 */
  visits: number
  /** 그래프 막대 길이로 쓰는 비율(%) */
  ratio: number
}

/** 조회 단위 — 시안의 '일별' / '월별' 라디오 */
export const periodUnitOptions = [
  { label: '일별', value: 'day' },
  { label: '월별', value: 'month' },
]

/** 년 선택 목록. 올해부터 5년 전까지 */
export const yearOptions = Array.from({ length: 5 }, (_, index) => {
  const year = 2026 - index
  return { label: `${year}년`, value: String(year) }
})

/** 월 선택 목록. 맨 위 '전체' 는 빈 문자열을 value 로 못 써서 'all' 이다(CLAUDE.md §5) */
export const monthOptions = [
  { label: '전체', value: 'all' },
  ...Array.from({ length: 12 }, (_, index) => ({
    label: `${index + 1}월`,
    value: String(index + 1),
  })),
]

/** 시안의 6행. 막대 길이는 ratio 를 그대로 % 로 쓴다 */
function createDailyRows(): VisitLogRow[] {
  return [
    { label: '1', totalVisits: 1000, visits: 10, ratio: 50 },
    { label: '2', totalVisits: 1000, visits: 10, ratio: 30 },
    { label: '3', totalVisits: 1000, visits: 10, ratio: 45 },
    { label: '4', totalVisits: 1000, visits: 10, ratio: 25 },
    { label: '5', totalVisits: 1000, visits: 10, ratio: 20 },
    { label: '6', totalVisits: 1000, visits: 10, ratio: 30 },
  ]
}

export function useVisitLogStats() {
  const year = ref('2026')
  const periodUnit = ref('day')

  const month = ref('9')

  const allRows = ref<VisitLogRow[]>(createDailyRows())

  /*
   * 집계는 서버가 한다. 목업에서는 행을 다시 만들 근거가 없어 같은 6행을 그대로 보여준다 —
   * 방문수 컬럼 제목만 단위를 따라간다.
   */
  const rows = computed(() => allRows.value)

  /**
   * 세 번째 컬럼 제목. 시안은 일별 기준의 '일 방문수' 다.
   * 조회 버튼을 기다리지 않고 라디오를 누르는 즉시 바뀐다(사용자 지정).
   */
  const visitsColumnTitle = computed(() =>
    periodUnit.value === 'month' ? '월 방문수' : '일 방문수',
  )

  /**
   * 조회 버튼. 실제 집계 조회는 개발팀이 서버에서 붙인다.
   * 목업에는 걸러낼 근거(날짜별 행)가 없어 화면에서 할 일이 없다.
   */
  function search() {}

  return {
    year,
    month,
    periodUnit,
    rows,
    visitsColumnTitle,
    search,
  }
}
