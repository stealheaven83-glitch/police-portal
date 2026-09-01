import { computed, reactive, ref } from 'vue'

export interface SelectOption {
  label: string
  value: string
}

/** 병상 1칸의 상태 */
export type BedState = 'inuse' | 'free'

export interface DrunkOccupant {
  name: string
  gender: 'male' | 'female'
  ageGroup: string
  symptom: string
  admitDate: string
  admitHour: string
  admitMinute: string
  leaveDate: string
  leaveHour: string
  leaveMinute: string
  receiptRoute: string
  receiptNo: string
  receiptEtc: string
}

export interface CenterBedRow {
  id: number
  no: number
  region: string
  centerName: string
  phone: string
  beds: BedState[]
  registrant: string
  updatedAt: string
  /** 우측 상세정보에 뿌릴 목업 주취자 정보 */
  occupant: DrunkOccupant
}

export interface BedDetailForm extends DrunkOccupant {
  totalBeds: number
  availableBeds: number
  assign: boolean
}

/* ------------------------------------------------------------------ 검색 옵션 (§8 sentinel = 'all') */

// 기획서: 서울/부산/대구/인천/광주/대전/울산/세종/경기남부/경기북부/강원/충북/충남/전북/전남/경북/경남/제주 (18개)
const REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기남부',
  '경기북부', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
]

export const regionOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  ...REGIONS.map((r) => ({ label: r, value: r })),
]

export const centerOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  { label: '주취자응급의료센터(서울동부병원)', value: '주취자응급의료센터(서울동부병원)' },
  { label: '주취해소센터(부산의료원)', value: '주취해소센터(부산의료원)' },
  { label: '주취자응급의료센터(천안의료원)', value: '주취자응급의료센터(천안의료원)' },
]

// 기획서: 10대~90대
export const ageGroupOptions: SelectOption[] = Array.from({ length: 9 }, (_, i) => {
  const decade = String((i + 1) * 10)
  return { label: `${decade}대`, value: decade }
})

// 기획서: 증상 = 중증 / 경증 / 단순 ('단순'은 8/13 추가분)
export const symptomOptions: SelectOption[] = [
  { label: '중증', value: 'severe' },
  { label: '경증', value: 'mild' },
  { label: '단순', value: 'simple' },
]

// 기획서: 접수경로 = 112신고 / 소방 / 기타
export const receiptRouteOptions: SelectOption[] = [
  { label: '112신고', value: 'report112' },
  { label: '소방', value: 'fire' },
  { label: '기타', value: 'etc' },
]

export const hourOptions: SelectOption[] = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, '0')
  return { label: h, value: h }
})

export const minuteOptions: SelectOption[] = Array.from({ length: 12 }, (_, i) => {
  const m = String(i * 5).padStart(2, '0')
  return { label: m, value: m }
})

/* ------------------------------------------------------------------ 목업 데이터 */

function makeBeds(total: number, inUse: number): BedState[] {
  return Array.from({ length: total }, (_, i) => (i < inUse ? 'inuse' : 'free'))
}

function createMockRows(): CenterBedRow[] {
  const seed: Array<Omit<CenterBedRow, 'no' | 'occupant'>> = [
    { id: 195, region: '서울', centerName: '주취자응급의료센터(서울동부병원)', phone: '02-700-3968', beds: makeBeds(2, 1), registrant: '홍길순', updatedAt: '2026-07-22 10:18' },
    { id: 194, region: '부산', centerName: '주취해소센터(부산의료원)', phone: '051-899-3746', beds: makeBeds(3, 2), registrant: '김두한', updatedAt: '2026-07-21 09:22' },
    { id: 193, region: '충남', centerName: '주취자응급의료센터(천안의료원)', phone: '041-590-2620', beds: makeBeds(4, 1), registrant: '계두식', updatedAt: '2026-07-20 13:33' },
    { id: 192, region: '대구', centerName: '주취해소센터(대구의료원)', phone: '053-560-7770', beds: makeBeds(2, 0), registrant: '홍길순', updatedAt: '2026-07-19 15:04' },
    { id: 191, region: '인천', centerName: '주취자응급의료센터(인천의료원)', phone: '032-580-6000', beds: makeBeds(3, 3), registrant: '홍길순', updatedAt: '2026-07-18 11:47' },
    { id: 190, region: '광주', centerName: '주취해소센터(광주기독병원)', phone: '062-650-5000', beds: makeBeds(2, 1), registrant: '이순신', updatedAt: '2026-07-17 08:31' },
    { id: 189, region: '대전', centerName: '주취자응급의료센터(대전의료원)', phone: '042-580-2000', beds: makeBeds(3, 1), registrant: '홍길순', updatedAt: '2026-07-16 17:12' },
    { id: 188, region: '울산', centerName: '주취해소센터(울산병원)', phone: '052-259-5000', beds: makeBeds(2, 2), registrant: '강감찬', updatedAt: '2026-07-15 09:59' },
    { id: 187, region: '경기남부', centerName: '주취자응급의료센터(수원의료원)', phone: '031-888-0114', beds: makeBeds(4, 2), registrant: '홍길순', updatedAt: '2026-07-14 14:25' },
    { id: 186, region: '경기북부', centerName: '주취해소센터(의정부의료원)', phone: '031-828-5000', beds: makeBeds(3, 0), registrant: '유관순', updatedAt: '2026-07-13 10:03' },
    { id: 185, region: '강원', centerName: '주취자응급의료센터(강릉의료원)', phone: '033-610-1200', beds: makeBeds(2, 1), registrant: '홍길순', updatedAt: '2026-07-12 16:40' },
    { id: 184, region: '충북', centerName: '주취해소센터(청주의료원)', phone: '043-279-0114', beds: makeBeds(3, 2), registrant: '신사임당', updatedAt: '2026-07-11 12:18' },
    { id: 183, region: '전북', centerName: '주취자응급의료센터(군산의료원)', phone: '063-472-5000', beds: makeBeds(2, 0), registrant: '홍길순', updatedAt: '2026-07-10 09:07' },
    { id: 182, region: '전남', centerName: '주취해소센터(목포시의료원)', phone: '061-260-6500', beds: makeBeds(4, 3), registrant: '정약용', updatedAt: '2026-07-09 15:51' },
    { id: 181, region: '경북', centerName: '주취자응급의료센터(포항의료원)', phone: '054-247-0551', beds: makeBeds(3, 1), registrant: '홍길순', updatedAt: '2026-07-08 11:22' },
    { id: 180, region: '경남', centerName: '주취해소센터(마산의료원)', phone: '055-249-1000', beds: makeBeds(2, 2), registrant: '김유신', updatedAt: '2026-07-07 08:44' },
    { id: 179, region: '제주', centerName: '주취자응급의료센터(제주의료원)', phone: '064-720-2222', beds: makeBeds(3, 0), registrant: '홍길순', updatedAt: '2026-07-06 17:33' },
    { id: 178, region: '세종', centerName: '주취해소센터(세종충남대병원)', phone: '044-995-4000', beds: makeBeds(2, 1), registrant: '장영실', updatedAt: '2026-07-05 13:09' },
    { id: 177, region: '서울', centerName: '주취해소센터(서울의료원)', phone: '02-2276-7000', beds: makeBeds(4, 4), registrant: '홍길순', updatedAt: '2026-07-04 10:55' },
  ]

  return seed.map((row, i) => ({
    ...row,
    no: seed.length - i,
    occupant: {
      name: i % 3 === 0 ? '김민준' : i % 3 === 1 ? '이서연' : '박도윤',
      gender: i % 2 === 0 ? 'male' : 'female',
      ageGroup: String(((i % 6) + 2) * 10),
      symptom: i % 3 === 0 ? 'severe' : i % 3 === 1 ? 'mild' : 'simple',
      admitDate: '2026-06-16',
      admitHour: '12',
      admitMinute: '30',
      leaveDate: '',
      leaveHour: '',
      leaveMinute: '',
      receiptRoute: i % 2 === 0 ? 'report112' : 'fire',
      receiptNo: i % 2 === 0 ? '11112222333344' : '',
      receiptEtc: '',
    },
  }))
}

function createEmptyDetail(): BedDetailForm {
  return {
    name: '',
    gender: 'male',
    ageGroup: '',
    symptom: '',
    admitDate: '',
    admitHour: '',
    admitMinute: '',
    leaveDate: '',
    leaveHour: '',
    leaveMinute: '',
    receiptRoute: 'report112',
    receiptNo: '',
    receiptEtc: '',
    totalBeds: 0,
    availableBeds: 0,
    assign: false,
  }
}

/** 성을 제외한 이름을 * 로 가린다 (기획서: 목록/상세에서 이름 마스킹) */
export function maskName(name: string): string {
  if (!name) return ''
  const [first, ...rest] = [...name]
  return first + '*'.repeat(Math.max(rest.length, 1))
}

export function useCenterBedStatus() {
  const allRows = createMockRows()
  const listRows = ref<CenterBedRow[]>(allRows)
  const selectedId = ref<number | null>(null)

  const searchRegion = ref('all')
  const searchCenter = ref('all')

  const detail = reactive<BedDetailForm>(createEmptyDetail())

  const itemsPerPage = 10
  const currentPage = ref(1)
  const totalPages = computed(() => Math.max(1, Math.ceil(listRows.value.length / itemsPerPage)))
  const pagedRows = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return listRows.value.slice(start, start + itemsPerPage)
  })

  const selectedRow = computed(() =>
    listRows.value.find((row) => row.id === selectedId.value) ?? null,
  )

  function search() {
    // 기획서 2-1: 지역 or 센터명 택일 조회. 센터명이 지정되면 그 값으로, 아니면 지역으로 거른다.
    listRows.value = allRows.filter((row) => {
      if (searchCenter.value !== 'all') return row.centerName === searchCenter.value
      if (searchRegion.value !== 'all') return row.region === searchRegion.value
      return true
    })
    currentPage.value = 1
  }

  function selectRow(row: CenterBedRow | null) {
    selectedId.value = row?.id ?? null
    if (!row) {
      Object.assign(detail, createEmptyDetail())
      return
    }
    const available = row.beds.filter((b) => b === 'free').length
    Object.assign(detail, createEmptyDetail(), {
      ...row.occupant,
      totalBeds: row.beds.length,
      availableBeds: available,
      assign: false,
    })
  }

  /** 기획서 5: 선택된 목록 삭제 */
  function deleteSelected(): boolean {
    if (selectedId.value == null) return false
    listRows.value = listRows.value.filter((row) => row.id !== selectedId.value)
    selectedId.value = null
    Object.assign(detail, createEmptyDetail())
    return true
  }

  return {
    listRows,
    pagedRows,
    itemsPerPage,
    currentPage,
    totalPages,
    selectedId,
    selectedRow,
    searchRegion,
    searchCenter,
    detail,
    search,
    selectRow,
    deleteSelected,
  }
}
