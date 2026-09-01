import { computed, ref } from 'vue'

/** 기획서 [1] 선택범위 : 112신고, 소방 ('전체' sentinel 은 빈 문자열을 못 쓴다 — CLAUDE.md §8) */
export const receiptRouteOptions = [
  { label: '전체', value: 'all' },
  { label: '112신고', value: 'report112' },
  { label: '소방', value: 'fire' },
]

export function receiptRouteLabel(value: string): string {
  return receiptRouteOptions.find((option) => option.value === value)?.label ?? value
}

/** 주취자 입·퇴소 한 건. 조회 API 연동 전까지는 목업 데이터를 그대로 쓴다 */
export interface DrunkAdmissionRow {
  no: number
  name: string
  gender: string
  ageGroup: string
  symptom: string
  receiptRoute: string
  /** 112신고 건에만 붙는 접수번호. 소방 접수는 빈 문자열 */
  receiptNo: string
  /** 지역 코드(drunkCenter.ts 의 regionOptions value) */
  region: string
  /**
   * 센터명을 코드가 아니라 문자열로 그대로 들고 있는다.
   * 기획서 [4] "'주취자센터'가 삭제되어도 이 화면에서는 센터명이 노출되게 처리" 때문에
   * 센터 목록을 참조해 이름을 찾는 방식을 쓰지 않는다.
   */
  centerName: string
  admittedAt: string
  /** 아직 퇴소하지 않았으면 빈 문자열 */
  dischargedAt: string
}

/** 그리드 "접수경로" 컬럼 표시용 — 112신고는 접수번호를 괄호로 덧붙인다 */
export function formatReceiptRoute(row: DrunkAdmissionRow): string {
  const label = receiptRouteLabel(row.receiptRoute)
  return row.receiptNo ? `${label}(접수번호 : ${row.receiptNo})` : label
}

function createMockRows(): DrunkAdmissionRow[] {
  return [
    { no: 12, name: '김**', gender: '남', ageGroup: '30대', symptom: '경증', receiptRoute: 'report112', receiptNo: '11112222333344', region: 'seoul', centerName: '주취자응급의료센터(서울동부병원)', admittedAt: '2026-07-22 12:30', dischargedAt: '' },
    { no: 11, name: '이**', gender: '여', ageGroup: '50대', symptom: '경증', receiptRoute: 'fire', receiptNo: '', region: 'busan', centerName: '주취해소센터(부산의료원)', admittedAt: '2026-07-21 16:20', dischargedAt: '2026-07-23 11:30' },
    { no: 10, name: '박**', gender: '남', ageGroup: '40대', symptom: '중증', receiptRoute: 'report112', receiptNo: '11112222333345', region: 'chungnam', centerName: '주취자응급의료센터(천안의료원)', admittedAt: '2026-07-21 09:05', dischargedAt: '2026-07-21 18:40' },
    { no: 9, name: '최**', gender: '남', ageGroup: '20대', symptom: '경증', receiptRoute: 'fire', receiptNo: '', region: 'daegu', centerName: '주취해소센터(대구의료원)', admittedAt: '2026-07-20 23:10', dischargedAt: '2026-07-21 07:00' },
    { no: 8, name: '정**', gender: '여', ageGroup: '30대', symptom: '경증', receiptRoute: 'report112', receiptNo: '11112222333346', region: 'incheon', centerName: '주취자응급의료센터(인천의료원)', admittedAt: '2026-07-20 21:45', dischargedAt: '2026-07-21 06:20' },
    { no: 7, name: '강**', gender: '남', ageGroup: '60대', symptom: '중증', receiptRoute: 'report112', receiptNo: '11112222333347', region: 'gwangju', centerName: '주취해소센터(빛고을전남대병원)', admittedAt: '2026-07-19 19:30', dischargedAt: '2026-07-20 09:10' },
    { no: 6, name: '조**', gender: '남', ageGroup: '40대', symptom: '경증', receiptRoute: 'fire', receiptNo: '', region: 'daejeon', centerName: '주취자응급의료센터(대전보훈병원)', admittedAt: '2026-07-19 02:15', dischargedAt: '2026-07-19 10:50' },
    { no: 5, name: '윤**', gender: '여', ageGroup: '20대', symptom: '경증', receiptRoute: 'report112', receiptNo: '11112222333348', region: 'ulsan', centerName: '주취해소센터(울산병원)', admittedAt: '2026-07-18 22:40', dischargedAt: '2026-07-19 08:00' },
    { no: 4, name: '장**', gender: '남', ageGroup: '50대', symptom: '중증', receiptRoute: 'report112', receiptNo: '11112222333349', region: 'gyeonggi-south', centerName: '주취자응급의료센터(수원의료원)', admittedAt: '2026-07-18 20:05', dischargedAt: '2026-07-19 12:25' },
    { no: 3, name: '임**', gender: '남', ageGroup: '30대', symptom: '경증', receiptRoute: 'fire', receiptNo: '', region: 'gyeonggi-north', centerName: '주취해소센터(의정부의료원)', admittedAt: '2026-07-17 23:55', dischargedAt: '2026-07-18 07:30' },
    { no: 2, name: '한**', gender: '여', ageGroup: '40대', symptom: '경증', receiptRoute: 'report112', receiptNo: '11112222333350', region: 'gangwon', centerName: '주취자응급의료센터(강원대병원)', admittedAt: '2026-07-17 18:20', dischargedAt: '2026-07-18 03:10' },
    { no: 1, name: '오**', gender: '남', ageGroup: '60대', symptom: '중증', receiptRoute: 'fire', receiptNo: '', region: 'jeju', centerName: '주취해소센터(제주의료원)', admittedAt: '2026-07-16 21:00', dischargedAt: '2026-07-17 09:45' },
  ]
}

export function useDrunkAdmissionStatus() {
  const receiptRouteFilter = ref('all')
  const regionFilter = ref('all')
  const centerFilter = ref('all')

  const allRows = ref<DrunkAdmissionRow[]>(createMockRows())

  /** 기획서 [공통] 조회 전에도 목록이 기본 노출되므로 입력값이 바뀌면 바로 걸러진다 */
  const rows = computed(() =>
    allRows.value.filter((row) => {
      if (receiptRouteFilter.value !== 'all' && row.receiptRoute !== receiptRouteFilter.value) return false
      if (regionFilter.value !== 'all' && row.region !== regionFilter.value) return false
      if (centerFilter.value !== 'all' && row.centerName !== centerFilter.value) return false
      return true
    }),
  )

  return { receiptRouteFilter, regionFilter, centerFilter, rows }
}
