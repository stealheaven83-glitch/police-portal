import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 우수시설인증 (PM-PUB-0113)
 *
 * 좌측 인증 목록에서 한 건을 고르면 우측 체크리스트가 그 건으로 바뀐다.
 * 조회/저장은 개발팀 몫이라 여기서는 목업 배열만 다룬다.
 */

/** 인증 목록 한 행 */
export interface CertificationRow {
  rowKey: string
  no: number
  dept: string
  /** 시설 유형 */
  facilityType: string
  address: string
  /** 진단일시 */
  diagnosedAt: string
  /** 인증구분 */
  certificationType: string
  /** 인증일자 */
  certifiedAt: string
}

/** 우측 체크리스트 */
export interface CertificationChecklist {
  address: string
  facilityName: string
  usageScale: string
  checklistType: string
  approvalDate: string
  ownerName: string
  ownerPhone: string
  /** 'yes' | 'no' */
  damaged: string
  damageCount: number
  /** 인증기준표 기본 항목 — key(b1…b16) → 'good' | 'fair' | 'poor' */
  basicScores: Record<string, string>
  /** 인증기준표 가점 항목 — key(g1…g6) → 'good' | 'poor' */
  bonusScores: Record<string, string>
  memo: string
  /** '' 이면 미선택. certResultOptions 의 value */
  certified: string
}

/** 인증구분 — sentinel 은 '' 가 아니라 'all'(CLAUDE.md §8) */
export const certificationTypeOptions = [
  { label: '전체', value: 'all' },
  { label: '신규인증', value: 'new' },
  { label: '재인증', value: 'renew' },
]

/** 체크리스트 형태 — sentinel 은 '' 가 아니라 'all'(CLAUDE.md §5) */
export const checklistTypeOptions = [
  { label: '전체', value: 'all' },
  { label: '주차장(범용)', value: 'parking-general' },
  { label: '주차장(주거용)', value: 'parking-residential' },
  { label: '주차장(상업용)', value: 'parking-commercial' },
  { label: '원룸', value: 'studio' },
  { label: '놀이터', value: 'playground' },
]


/* ── 인증기준표 (Figma 11255:129011 "주차장(범용)") ─────────────────────
   시안이 정한 고정 기준이라 값이 아니라 상수다. 실제 기준 갱신은 개발팀 연동 대상. */

/** 배점 요약표 — 평가분야별 세부항목과 항목수 */
export const certScoreGroups = [
  {
    field: '감시성',
    items: [
      { label: '진입동선', count: 1 },
      { label: '내부구조물', count: 1 },
      { label: '주요시설물', count: 1 },
      { label: '승강기', count: 1 },
      { label: '조명', count: 1 },
      { label: '반사경', count: 1 },
      { label: '영상감시', count: 3 },
    ],
  },
  {
    field: '접근통제',
    items: [
      { label: '차량출입', count: 1 },
      { label: '보행자 출입', count: 1 },
      { label: '침입 경로', count: 1 },
    ],
  },
  {
    field: '영역성',
    items: [
      { label: '구역 구분', count: 1 },
      { label: '안내표지', count: 2 },
    ],
  },
  {
    field: '유지관리',
    items: [
      { label: '방범시설', count: 1 },
      { label: '청결', count: 1 },
    ],
  },
]

/** 배점표 '비고' 칸 — 시안 문구 그대로 */
export const certScoreNote = [
  { strong: true, text: '<평가 항목>' },
  { strong: false, text: '- 기본 항목 : 총 17개\n  (양호 2점 / 보통 1점 / 미흡 0점)' },
  { strong: false, text: '- 가점 항목 : 총 6개 (항목당 1점)' },
  { strong: true, text: '<인증 기준>' },
  { strong: false, text: '- 기본 항목 평가 점수가 총점의 80%이상(27점이상) 인 경우' },
  { strong: false, text: '* 기본 항목 점수가 27점 미만이더라도 가점항목을 포함한 총점이 27점 이상인 경우 인증 가능' },
]

/** 기본 항목 — 분야 > 항목 > 문항. key 가 checklist.basicScores 의 키다 */
export const certBasicGroups = [
  {
    field: '감시성',
    labels: [
      { label: '진입동선', questions: [{ key: 'b1', no: 1, text: '주차장 진입로 및 보행자 출입구가 외부에서 쉽게 발견(관찰) 가능한지 여부' }] },
      { label: '내부구조물', questions: [{ key: 'b2', no: 2, text: '주차장 내부의 기둥, 벽 등과 같은 내부 구조물이 시야를 방해하지 않도록 배치되었는지 여부' }] },
      { label: '주요시설물', questions: [{ key: 'b3', no: 3, text: '주요 이용시설(무인정산기, 승강기, 계단 등)이 개방된 위치에 배치되어 자연감시가 가능한지 여부' }] },
      { label: '승강기', questions: [{ key: 'b4', no: 4, text: '주차구역 또는 출입구 외부에서 승강기 홀(대기공간)이 시야 확보가 가능한 위치에 배치되어 있는지 여부' }] },
      { label: '조명', questions: [{ key: 'b5', no: 5, text: '출입구, 보행 동선, 기둥 사이 등 사각지대 발생 구간에 조명이 설치되어 있는지 여부' }] },
      { label: '반사경', questions: [{ key: 'b6', no: 6, text: '주차장 내 사각지대(모서리, 기둥 뒤, 경사로 등)에 반사경이 설치되어 시야 확보가 이루어지고 있는지 여부' }] },
      {
        label: '영상감시',
        questions: [
          { key: 'b7', no: 7, text: 'CCTV가 24시간 녹화되고 있으며, 관제센터(관리주체 등)와 연계되어 있어 실시간 영상 확인이 가능한지 여부' },
          { key: 'b8', no: 8, text: 'CCTV가 상호 감시 가능한 구조로 설치되어 있는지 여부' },
          { key: 'b9', no: 9, text: 'CCTV 영상의 화질 수준' },
        ],
      },
    ],
  },
  {
    field: '접근통제',
    labels: [
      { label: '차량출입', questions: [{ key: 'b10', no: 1, text: '차단기, 차량번호 인식 시스템, RFID 등 연동을 통해 외부⋅등록차량에 대한 출입통제가 이루어지고 있는지 여부' }] },
      { label: '보행자 출입', questions: [{ key: 'b11', no: 2, text: '(건물 연결형) 공용 출입구에 카드키, 비밀번호 입력키, 인터폰 등 보행자 통제시설이 설치되어 무단 출입을 제한하고 있는지 여부' }] },
      { label: '침입경로', questions: [{ key: 'b12', no: 3, text: '건물 외곽 또는 주차장 내에 외부인이 침입할 우려가 있는 경로(틈새, 구조물, 담장 등)가 차단되었는지 여부' }] },
    ],
  },
  {
    field: '영역성',
    labels: [
      { label: '구역구분', questions: [{ key: 'b13', no: 1, text: '주차장 내 보행로가 표시되어 차량공간과 구분되고 있는지 여부' }] },
      { label: '안내표지', questions: [{ key: 'b14', no: 2, text: '차량 동선, 출구 방향, 주차 위치 등 공간 정보를 제공하는 표지판이 설치되어 있고 시인성이 확보되어 있는지 여부' }] },
    ],
  },
  {
    field: '유지관리',
    labels: [
      { label: '방범시설', questions: [{ key: 'b15', no: 1, text: '방범시설(CCTV, 조명, 비상벨, 반사경 등)이 고장 및 훼손되지 않고 유지관리 되고 있는지 여부' }] },
      { label: '청결', questions: [{ key: 'b16', no: 2, text: '주차장 내 청결 유지 등 환경 정비 상태' }] },
    ],
  },
]

/** 가점 항목 — 분야가 '가점' 하나뿐이라 항목 라벨 열이 없다 */
export const certBonusItems = [
  { key: 'g1', no: 1, text: '지능형 영상감시시스템(AI CCTV) - 인체감지, 행동분석, 침입 탐지, 열상카메라 등 설치·운영 여부' },
  { key: 'g2', no: 2, text: '체계적인 순찰 시스템 - 전자 순찰체크 시스템을 활용하여 주기적인 순찰체계를 운영하고 있는지 여부' },
  { key: 'g3', no: 3, text: '원격 방송 시스템 – CCTV 영상 감시 중 비상 상황 발생시 주차장 내로 경고 방송을 할 수 있는 원격방송시스템 설치·운영 여부' },
  { key: 'g4', no: 4, text: '주차장 통로에 디밍시스템(평상시에는 저조도로 유지되다가 사람이나 차량 인식 시 자동으로 밝기를 조정하는 시스템) 설치·운영 여부' },
  { key: 'g5', no: 5, text: '계단실에 방범시설물(출입문 옆 비상벨, 계단실 내부 CCTV 등)이 설치되어 있어 위급상황시 신속한 대응이 가능' },
  { key: 'g6', no: 6, text: '주차장 내 관리인 또는 전종요원이 상주하여 상시 관리⋅감시하고 있는지 여부' },
]

/** 기본 항목 배점: 양호 2 / 보통 1 / 미흡 0 */
export const BASIC_SCORE: Record<string, number> = { good: 2, fair: 1, poor: 0 }
/** 가점 항목 배점: 양호 1 / 미흡 0 */
export const BONUS_SCORE: Record<string, number> = { good: 1, poor: 0 }
/** 인증 기준 점수(총점 40점의 80%) */
export const CERT_PASS_SCORE = 27

/** 인증여부 — sentinel 은 '' 를 못 쓴다(CLAUDE.md §5) */
export const certResultOptions = [
  { label: '인증', value: 'certified' },
  { label: '미인증', value: 'rejected' },
]

function createMockRows(): CertificationRow[] {
  return [
    {
      rowKey: 'cert-195',
      no: 195,
      dept: '서울청 서울종로서',
      facilityType: '초대형쇼핑센터 주차장',
      address: '서울특별시 종로구 종로3길 17',
      diagnosedAt: '2026-06-01 00:00',
      certificationType: '신규인증',
      certifiedAt: '2026-06-05',
    },
    {
      rowKey: 'cert-194',
      no: 194,
      dept: '서울청 서울종로서',
      facilityType: '초대형쇼핑센터 주차장',
      address: '서울특별시 종로구 종로3길 17',
      diagnosedAt: '2026-06-01 00:00',
      certificationType: '신규인증',
      certifiedAt: '2026-06-05',
    },
    {
      rowKey: 'cert-193',
      no: 193,
      dept: '서울청 서울종로서',
      facilityType: '초대형쇼핑센터 주차장',
      address: '서울특별시 종로구 종로3길 17',
      diagnosedAt: '2026-06-01 00:00',
      certificationType: '재인증',
      certifiedAt: '2026-06-07',
    },
    {
      rowKey: 'cert-192',
      no: 195,
      dept: '서울청 서울종로서',
      facilityType: '초대형쇼핑센터 주차장',
      address: '서울특별시 종로구 종로3길 17',
      diagnosedAt: '2026-06-01 00:00',
      certificationType: '신규인증',
      certifiedAt: '2026-06-09',
    },
  ]
}

function createChecklist(row?: CertificationRow): CertificationChecklist {
  return {
    address: row ? `${row.address} 하나투어빌딩` : '',
    facilityName: '',
    usageScale: '',
    checklistType: 'all',
    approvalDate: '',
    ownerName: '',
    ownerPhone: '',
    damaged: 'no',
    damageCount: 4,
    // 시안의 총점 35점을 그대로 재현한 목업(기본 16개 양호 32점 + 가점 3개 3점)
    basicScores: Object.fromEntries(
      certBasicGroups.flatMap((g) => g.labels.flatMap((l) => l.questions.map((q) => [q.key, 'good']))),
    ),
    bonusScores: Object.fromEntries(
      certBonusItems.map((item, index) => [item.key, index < 3 ? 'good' : 'poor']),
    ),
    memo: '',
    certified: '',
  }
}

export function useExcellentFacilityCertification() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const advancedSearchOpen = ref(true)

  const registeredFrom = ref('2026-07-16')
  const registeredTo = ref('2026-07-16')
  const certificationType = ref('all')

  const allRows = ref<CertificationRow[]>(createMockRows())

  const rows = computed(() =>
    allRows.value.filter((row) => {
      if (certificationType.value !== 'all') {
        const label = certificationTypeOptions.find((o) => o.value === certificationType.value)?.label
        if (label && row.certificationType !== label) return false
      }
      return true
    }),
  )

  /** 지금 우측 체크리스트에 떠 있는 행 */
  const activeRowKey = ref<string | null>(rows.value[1]?.rowKey ?? null)
  const checklist = ref<CertificationChecklist>(
    createChecklist(allRows.value.find((r) => r.rowKey === activeRowKey.value)),
  )

  /** 인증기준표 총점 — 기본(양호2/보통1/미흡0) + 가점(양호1/미흡0) */
  const totalScore = computed(() => {
    const basic = Object.values(checklist.value.basicScores).reduce((sum, v) => sum + (BASIC_SCORE[v] ?? 0), 0)
    const bonus = Object.values(checklist.value.bonusScores).reduce((sum, v) => sum + (BONUS_SCORE[v] ?? 0), 0)
    return basic + bonus
  })

  /** 시안의 초록 안내문(＊ 인증기준에 적합합니다) 노출 조건 */
  const meetsCertStandard = computed(() => totalScore.value >= CERT_PASS_SCORE)

  function selectRow(rowKey: string) {
    const row = allRows.value.find((r) => r.rowKey === rowKey)
    if (!row) return
    activeRowKey.value = rowKey
    checklist.value = createChecklist(row)
  }

  /** 새 인증 건 — 목록에 먼저 넣고 체크리스트를 비운다 */
  function createRow() {
    const nextNo = allRows.value.reduce((max, row) => Math.max(max, row.no), 0) + 1
    const row: CertificationRow = {
      rowKey: `cert-${Date.now()}`,
      no: nextNo,
      dept: '',
      facilityType: '',
      address: '',
      diagnosedAt: '',
      certificationType: '신규인증',
      certifiedAt: '',
    }
    // 배열은 재할당한다 — splice 제자리 수정은 그리드가 못 잡는다(CLAUDE.md §3)
    allRows.value = [row, ...allRows.value]
    activeRowKey.value = row.rowKey
    checklist.value = createChecklist()
  }

  return {
    department,
    advancedSearchOpen,
    registeredFrom,
    registeredTo,
    certificationType,
    rows,
    activeRowKey,
    checklist,
    totalScore,
    meetsCertStandard,
    selectRow,
    createRow,
  }
}
