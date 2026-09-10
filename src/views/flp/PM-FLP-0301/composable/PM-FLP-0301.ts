import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/** 탄력순찰 이행현황 한 행. 실제 조회 API 연동 전까지는 목업 데이터를 그대로 쓴다 */
export interface PatrolComplianceRow {
  dept: string
  /** 표에 그대로 보여주는 기간 문자열 */
  patrolPeriod: string
  /** 기간 검색용 시작일. patrolPeriod 의 앞부분과 같은 날짜다 */
  patrolFrom: string
  /** '이행' | '미이행' */
  compliance: string
  addressLot: string
  addressRoad: string
  request: string
}

export const complianceOptions = [
  { label: '전체', value: 'all' },
  { label: '이행', value: '이행' },
  { label: '미이행', value: '미이행' },
]

function createMockRows(): PatrolComplianceRow[] {
  const base = [
    ['부산 중부경찰서 대청지구대', '2026-05-04', '이행', '부산광역시 중구 대청동 4가 73-11', '부산광역시 중구 망양로 313', '민원인 요청지역 - 야간 취객 소란 다발'],
    ['부산 중부경찰서 대청지구대', '2026-05-06', '이행', '부산광역시 중구 보수동 1가 12-4', '부산광역시 중구 보수대로 41', '초등학교 통학로 주변 순찰 요청'],
    ['부산 중부경찰서 광복파출소', '2026-05-08', '미이행', '부산광역시 중구 신창동 2가 30-2', '부산광역시 중구 광복로 55', '상가 밀집지역 절도 예방 순찰 요청'],
    ['부산 중부경찰서 광복파출소', '2026-05-11', '이행', '부산광역시 중구 남포동 5가 8-1', '부산광역시 중구 자갈치로 22', '심야 노점 주변 소란 신고 다발'],
    ['부산 동구경찰서 초량파출소', '2026-05-13', '미이행', '부산광역시 동구 초량동 1140-2', '부산광역시 동구 중앙대로 375', '공원 내 청소년 비행 우려 지역'],
    ['부산 동구경찰서 초량파출소', '2026-05-15', '이행', '부산광역시 동구 수정동 1023-5', '부산광역시 동구 고관로 18', '주택가 골목 차량털이 예방 요청'],
    ['부산 동구경찰서 범일지구대', '2026-05-18', '이행', '부산광역시 동구 범일동 830-11', '부산광역시 동구 자성로 133', '재래시장 주변 야간 순찰 요청'],
    ['부산 서구경찰서 암남파출소', '2026-05-20', '미이행', '부산광역시 서구 암남동 620-1', '부산광역시 서구 암남공원로 79', '등산로 입구 주정차 및 소란 민원'],
    ['부산 서구경찰서 암남파출소', '2026-05-22', '이행', '부산광역시 서구 충무동 3가 15-9', '부산광역시 서구 충무대로 168', '버스정류장 인근 취객 신고 다발'],
    ['부산 영도경찰서 청학지구대', '2026-05-25', '이행', '부산광역시 영도구 청학동 45-7', '부산광역시 영도구 와치로 121', '어린이보호구역 과속 단속 요청'],
    ['부산 영도경찰서 청학지구대', '2026-05-27', '미이행', '부산광역시 영도구 동삼동 962-3', '부산광역시 영도구 해양로 301', '해안가 야간 무단 출입 우려'],
    ['부산 영도경찰서 남항파출소', '2026-05-29', '이행', '부산광역시 영도구 남항동 2가 55', '부산광역시 영도구 남항로 64', '조선소 주변 심야 절도 예방 요청'],
  ]
  return base.map(([dept, from, compliance, addressLot, addressRoad, request]) => {
    const to = new Date(`${from}T00:00:00`)
    to.setDate(to.getDate() + 9)
    const toText = to.toISOString().slice(0, 10)
    return {
      dept,
      patrolPeriod: `${from} ~ ${toText}`,
      patrolFrom: from,
      compliance,
      addressLot,
      addressRoad,
      request,
    }
  })
}

export function usePatrolCompliance() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  // 시안은 상세조회가 펼쳐진 상태로 그려져 있다
  const advancedSearchOpen = ref(true)

  const dateFrom = ref('')
  const dateTo = ref('')
  const compliance = ref('all')

  const allRows = ref<PatrolComplianceRow[]>(createMockRows())

  // 지금은 입력값이 바뀌면 즉시 걸러진다(목업). 조회 버튼으로 커밋하는 방식이 필요해지면
  // 입력값과 "적용된 값"을 분리하고 search() 에서만 옮긴다 — PC-COM-2402 참고.
  const rows = computed(() => {
    return allRows.value.filter((row) => {
      if (compliance.value !== 'all' && row.compliance !== compliance.value) return false
      if (dateFrom.value && row.patrolFrom < dateFrom.value) return false
      if (dateTo.value && row.patrolFrom > dateTo.value) return false
      return true
    })
  })

  return {
    department,
    advancedSearchOpen,
    dateFrom,
    dateTo,
    compliance,
    rows,
  }
}
