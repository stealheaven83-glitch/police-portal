import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/** 활동내역 앞머리에 색으로 구분해 붙는 표시의 종류 (시안 12711:73792) */
export type ActivityTagTone = 'danger' | 'primary' | 'success'

/** 활동내역 본문 맨 앞에 붙는 표시 — 112신고 사건번호, 모바일/태블릿 등록 경로 */
export interface ActivityTag {
  text: string
  tone: ActivityTagTone
}

/** 근무일지(乙) 조회 한 줄 — 등록 화면(PM-LPO-0217)과 달리 읽기 전용이다 */
export interface WorkLogViewRow {
  id: number
  time: string
  kind: string
  /**
   * 활동내역 앞머리 표시. 없는 행이 더 많다.
   * 본문(activity)과 나눠 두는 것은 이 부분만 색과 굵기가 다르기 때문이다.
   */
  tag?: ActivityTag
  /**
   * 활동내역 본문(여러 줄). tag 가 있는 행은 그 바로 뒤에 이어 붙는 문자열이라
   * 시안대로 보이도록 앞 공백도 원문 그대로 둔다(.lp-log-activity 가 pre-wrap).
   */
  activity: string
  /** 활동내역 칸 오른쪽 아래에 따로 표시된다 */
  writtenAt: string
  writer: string
  handlers: string
  /** 인수인계 대상이면 체크 표시 */
  handover: boolean
  hasFile: boolean
  hasDetail: boolean
}

/** 112신고 상세 팝업(시안 12664:92634)에 뿌리는 한 건 */
export interface Report112Detail {
  codeType: string
  caseNo: string
  reportedAt: string
  closedAt: string
  responders: string
  closer: string
  reporter: string
  contact: string
  gender: string
  location: string
  content: string
  note: string
  result: string
}

/** 시안에 그려진 값 그대로. 신고내용·참고사항·처리결과는 시안에서 비어 있다 */
export const report112Detail: Report112Detail = {
  codeType: 'A1',
  caseNo: '12345',
  reportedAt: '23:55',
  closedAt: '07:00',
  responders: '홍길동, 고길동, 홍금보, 박희순',
  closer: '홍길동',
  reporter: '미상',
  contact: '01012345678',
  gender: '남자',
  location: '부산광역시 중구 비프광장로 36 부산극장',
  content: '',
  note: '',
  result: '',
}

export const kindFilterOptions = [
  { label: '전체', value: 'all' },
  { label: '근무 인수 인계 및 교양', value: '근무 인수 인계 및 교양' },
  { label: '112신고', value: '112신고' },
  { label: '도보순찰', value: '도보순찰' },
  { label: '탄력순찰', value: '탄력순찰' },
]

/** 시안(12711:73792)에 그려진 다섯 줄. 문구·표기는 시안 그대로다 */
const sampleRows: Omit<WorkLogViewRow, 'id'>[] = [
  {
    time: '08:00',
    kind: '근무 인수 인계 및 교양',
    activity: [
      '* 교통사고 초등조치 시 사상자 구호 철저',
      '- 인명 구조 최우선 순위로 설정 119 후송 등 적극 구호조피 실시',
      '* 공동출입문 프리패스 활동',
      '* 현장조치 우수사례 미담, 선행 적는 발굴 및 포상',
    ].join('\n'),
    writtenAt: '2026-01-01 14:00',
    writer: '경감 홍길동',
    handlers: '조째즈, 박광현, 홍길동, 불사조',
    handover: true,
    hasFile: true,
    hasDetail: false,
  },
  {
    time: '08:30',
    kind: '112신고',
    tag: { text: 'C1(00000)', tone: 'danger' },
    activity: '-비상벨 (접수일시 : 2026-01-01 09:00:10)\n비상벨 오작동(업주가 잘못 누름)',
    writtenAt: '2026-01-01 14:00',
    writer: '경감 홍길동',
    handlers: '홍길동, 김승민',
    handover: true,
    hasFile: false,
    hasDetail: true,
  },
  {
    time: '09:10',
    kind: '탄력순찰',
    tag: { text: '[모바일]', tone: 'primary' },
    activity: ' 중앙동 근무자 경장 고길동 경장 조째즈 탄력순찰 실시\n비행청소년들 담배핌. 주민신고',
    writtenAt: '2026-01-01 14:00',
    writer: '경감 홍길동',
    handlers: '조째즈, 박광현, 홍길동, 불사조',
    handover: false,
    hasFile: true,
    hasDetail: false,
  },
  {
    time: '10:00',
    kind: '탄력순찰',
    tag: { text: '[테블릿]', tone: 'success' },
    activity:
      ' 중부32호 근무자 경장 고길동 경장 조째즈 탄력순찰 실시\n112신고 다발지역지 범죄 예방 및 112신고',
    writtenAt: '2026-01-01 14:00',
    writer: '경감 홍길동',
    handlers: '조째즈, 박광현, 홍길동, 불사조',
    handover: true,
    hasFile: false,
    hasDetail: false,
  },
  {
    time: '09:10',
    kind: '도보순찰',
    activity:
      '경감 홍길동 경장 고길동 경장 조쨰즈\n남포지구대 > 부산 데파트> 국립수산품질관리원 순찰 특이사항 없음',
    writtenAt: '2026-01-01 14:00',
    writer: '경장 고길동',
    handlers: '조째즈, 박광현, 홍길동, 불사조',
    handover: false,
    hasFile: false,
    hasDetail: false,
  },
]

/** 시안의 페이지네이션이 "총 195건 / 현재 1-10" 이라 다섯 줄을 그만큼 반복해 채운다 */
const MOCK_TOTAL = 195

function createMockRows(): WorkLogViewRow[] {
  return Array.from({ length: MOCK_TOTAL }, (_, index) => ({
    ...sampleRows[index % sampleRows.length],
    id: index + 1,
  }))
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
      // 앞머리 표시도 화면에 보이는 활동내역의 일부라 함께 검색한다
      const activityText = `${row.tag?.text ?? ''}${row.activity}`
      if (keyword.value && !activityText.includes(keyword.value)) return false
      return true
    }),
  )

  return { department, advancedSearchOpen, dateFrom, dateTo, kindFilter, keyword, rows }
}
