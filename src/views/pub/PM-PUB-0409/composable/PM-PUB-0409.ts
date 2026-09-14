import { computed, reactive, ref, watch } from 'vue'

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

  /**
   * 기획서: 선택된 지역의 센터 목록만 노출. 지역이 '전체'면 등록된 센터 전부.
   * 전용 컴포넌트를 만들지 않고 SelectField 둘 + computed 로 화면에서 직접 잇는다(PM-PUB-0411 과 같은 형태).
   */
  const centerOptions = computed<SelectOption[]>(() => {
    const names = allRows
      .filter((row) => searchRegion.value === 'all' || row.region === searchRegion.value)
      .map((row) => row.centerName)
    return [
      { label: '전체', value: 'all' },
      ...Array.from(new Set(names)).map((name) => ({ label: name, value: name })),
    ]
  })

  // 지역을 바꾸면 직전에 고른 센터가 목록에 없을 수 있어 '전체'로 되돌린다.
  watch(searchRegion, () => {
    searchCenter.value = 'all'
  })

  const detail = reactive<BedDetailForm>(createEmptyDetail())

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

  /**
   * 기획서 4: 주취자등록 & 병상배정 등록 시작.
   * 고른 센터의 병상 수는 그대로 두고 주취자 입력만 비운다(기획서 PC-PUB-0410 시안에서
   * 총 병상·사용가능 병상은 값이 채워진 채로 시작한다).
   */
  function startRegister() {
    const { totalBeds, availableBeds } = detail
    Object.assign(detail, createEmptyDetail(), { totalBeds, availableBeds })
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
    selectedId,
    selectedRow,
    searchRegion,
    searchCenter,
    centerOptions,
    detail,
    search,
    selectRow,
    startRegister,
    deleteSelected,
  }
}

/* ------------------------------------------------------------------ 병상현황 셀 */

/**
 * 병상현황 그리드 셀. Tabulator 셀 안은 Vue 템플릿이 아니라 DOM 이라 컴포넌트를 못 붙여서,
 * 시안 bed 컴포넌트(10951:65227 / 10951:65246)를 내보낸 SVG 를 좌표 그대로 그린다.
 * 색은 police-common.css 의 .lp-bed-* 가 잡는다(하드코딩 hex 금지 — CLAUDE.md §2).
 * 목록을 그대로 쓰는 PC-PUB-0410 과 공유한다.
 */
const BED_FRAME =
  '<path class="lp-bed-frame" d="M0.625 20.3906H23.3738"/>' +
  '<path class="lp-bed-frame" d="M0.625 8V23.6762"/>' +
  '<path class="lp-bed-frame" d="M23.3738 23.6759V18.1188C23.3738 16.9154 22.3979 15.9395 21.1945 15.9395H0.625"/>'

/** 침대 오른쪽 위에 겹치는 상태 배지 — 원 + 글리프 */
const BADGE_DOT = '<circle class="lp-bed-dot" cx="13" cy="9" r="7.5"/>'
const X_MARK =
  '<path class="lp-bed-mark" d="M14.8251 6.32613C15.0594 6.09181 15.4394 6.09181 15.6737 6.32613C15.9079 6.56046 15.908 6.94051 15.6737 7.17476L13.8476 9.00093L15.6728 10.8261C15.9068 11.0605 15.907 11.4405 15.6728 11.6748C15.4385 11.9089 15.0584 11.9087 14.8241 11.6748L12.9989 9.84956L11.1737 11.6748C10.9395 11.9088 10.5594 11.9088 10.3251 11.6748C10.0909 11.4405 10.091 11.0605 10.3251 10.8261L12.1503 9.00093L10.3241 7.17476C10.0898 6.94048 10.0899 6.56045 10.3241 6.32613C10.5584 6.09181 10.9384 6.09181 11.1728 6.32613L12.9989 8.1523L14.8251 6.32613Z"/>'
const CHECK_MARK =
  '<path class="lp-bed-mark" fill-rule="evenodd" clip-rule="evenodd" d="M15.8155 6.25506C16.0891 6.44202 16.1593 6.81537 15.9723 7.08896L12.8973 11.589C12.7966 11.7364 12.6355 11.8312 12.4577 11.8478C12.28 11.8644 12.1041 11.801 11.9778 11.6748L10.1016 9.79984C9.86726 9.5656 9.86714 9.1857 10.1014 8.95132C10.3356 8.71693 10.7155 8.71681 10.9499 8.95105L12.3146 10.3149L14.9816 6.41193C15.1685 6.13834 15.5419 6.06811 15.8155 6.25506Z"/>'

function bedSvg(inUse: boolean): string {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">' +
    BED_FRAME +
    BADGE_DOT +
    (inUse ? X_MARK : CHECK_MARK) +
    '</svg>'
  )
}

const BED_IN_USE_SVG = bedSvg(true)
const BED_FREE_SVG = bedSvg(false)

/**
 * 사용중(연회색 침대 + 회색 원 X) / 사용가능(진회색 침대 + 초록 원 체크) — 기획서 3.
 * 대체텍스트(Figma 코멘트): 아이콘 하나하나를 읽히면 병상 수만큼 반복되므로 줄 전체를
 * role="img" 한 덩어리로 묶어 '사용가능 N개'를 읽히고, 마우스에는 title 로 상태를 보여준다.
 */
export function bedCellFormatter(cell: any): string {
  const beds = (cell.getValue() ?? []) as BedState[]
  const free = beds.filter((b) => b === 'free').length
  const icons = beds
    .map((bed) => {
      const inUse = bed === 'inuse'
      const stateClass = inUse ? 'lp-bed-in-use' : 'lp-bed-free'
      const title = inUse ? '사용중' : '사용가능'
      const svg = inUse ? BED_IN_USE_SVG : BED_FREE_SVG
      return `<span class="lp-bed ${stateClass}" title="${title}" aria-hidden="true">${svg}</span>`
    })
    .join('')
  const label = `총 ${beds.length}병상 중 사용가능 ${free}개`
  return `<span class="lp-bed-row" role="img" aria-label="${label}">${icons}</span>`
}

/** 목록 컬럼 — PM-PUB-0409 · PC-PUB-0410 이 같은 목록을 쓴다(시안 폭 그대로) */
export const centerBedColumns = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '지역', field: 'region', width: 80, hozAlign: 'center' },
  { title: '센터명', field: 'centerName', width: 228, hozAlign: 'left' },
  { title: '연락처', field: 'phone', width: 148, hozAlign: 'center' },
  {
    title: '병상현황',
    field: 'beds',
    width: 188,
    hozAlign: 'left',
    headerSort: false,
    formatter: bedCellFormatter,
  },
  { title: '등록자', field: 'registrant', width: 72, hozAlign: 'center' },
  { title: '수정일시', field: 'updatedAt', width: 148, hozAlign: 'center' },
]
