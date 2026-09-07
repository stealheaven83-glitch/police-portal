import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/** 근무일지(乙) 조회 한 줄 — 등록 화면(PM-LPO-0217)과 달리 읽기 전용이다 */
export interface WorkLogViewRow {
  id: number
  time: string
  kind: string
  /** 활동내역 (여러 줄) + 마지막 줄에 작성일시 */
  activity: string
  writtenAt: string
  writer: string
  handlers: string
  /** 인수인계 대상이면 체크 표시 */
  handover: boolean
  hasFile: boolean
  hasDetail: boolean
}

export const kindFilterOptions = [
  { label: '전체', value: 'all' },
  { label: '근무 인수 인계 및 교양', value: '근무 인수 인계 및 교양' },
  { label: '112신고', value: '112신고' },
  { label: '도보순찰', value: '도보순찰' },
  { label: '탄력순찰', value: '탄력순찰' },
]

function createMockRows(): WorkLogViewRow[] {
  return [
    {
      id: 1,
      time: '08:00',
      kind: '근무 인수 인계 및 교양',
      activity: [
        '• 교통사고 초동조치 시 사상자 구호 철저',
        '• 인명 구조 최우선 순위로 설정 119 후송 등 적극 구호조피 실시',
        '• 공동출입문 프리패스 활동',
        '• 현장조치 우수사례 미담, 선행 적는 발굴 및 포상',
      ].join('\n'),
      writtenAt: '2026-01-01 14:00',
      writer: '경감 홍길동',
      handlers: '조째즈, 박광현, 홍길동, 불사조',
      handover: true,
      hasFile: true,
      hasDetail: false,
    },
    {
      id: 2,
      time: '08:30',
      kind: '112신고',
      activity: 'C1(00000)-비상벨 (접수일시 : 2026-01-01 09:00:10)\n비상벨 오작동(업주가 잘못 누름)',
      writtenAt: '2026-01-01 14:00',
      writer: '경감 홍길동',
      handlers: '홍길동, 김승민',
      handover: true,
      hasFile: false,
      hasDetail: true,
    },
    {
      id: 3,
      time: '09:10',
      kind: '탄력순찰',
      activity: '[모바일] 중앙동 근무자 경장 고길동 경장 조째즈 탄력순찰 실시\n비행청소년들 담배핌. 주민신고',
      writtenAt: '2026-01-01 14:00',
      writer: '경감 홍길동',
      handlers: '조째즈, 박광현, 홍길동, 불사조',
      handover: false,
      hasFile: true,
      hasDetail: false,
    },
    {
      id: 4,
      time: '10:00',
      kind: '탄력순찰',
      activity: '[테블릿] 중부32호 근무자 경장 고길동 경장 조째즈 탄력순찰 실시\n112신고 다발지역지 범죄 예방 및 112신고',
      writtenAt: '2026-01-01 14:00',
      writer: '경감 홍길동',
      handlers: '조째즈, 박광현, 홍길동, 불사조',
      handover: true,
      hasFile: false,
      hasDetail: false,
    },
    {
      id: 5,
      time: '09:10',
      kind: '도보순찰',
      activity: '경감 홍길동 경장 고길동 경장 조째즈\n남포지구대 > 부산 데파트> 국립수산품질관리원 순찰 특이사항 없음',
      writtenAt: '2026-01-01 14:00',
      writer: '경장 고길동',
      handlers: '조째즈, 박광현, 홍길동, 불사조',
      handover: false,
      hasFile: false,
      hasDetail: false,
    },
  ]
}

export function useWorkLogView() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const advancedSearchOpen = ref(true)

  const dateFrom = ref('2026-07-16')
  const dateTo = ref('2026-07-16')
  const kindFilter = ref('all')
  const keyword = ref('')

  const allRows = ref<WorkLogViewRow[]>(createMockRows())

  const rows = computed(() =>
    allRows.value.filter((row) => {
      if (kindFilter.value !== 'all' && row.kind !== kindFilter.value) return false
      if (keyword.value && !row.activity.includes(keyword.value)) return false
      return true
    }),
  )

  return { department, advancedSearchOpen, dateFrom, dateTo, kindFilter, keyword, rows }
}
