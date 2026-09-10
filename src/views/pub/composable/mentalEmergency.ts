import { ref } from 'vue'

export interface SelectOption {
  label: string
  value: string
}

/**
 * 기획서(정신응대.pptx) "선택범위" 18개 지역.
 *
 * `drunkCenter.ts` 의 목록과 값이 같지만 **합치지 않는다** — 동시 작업 중인 남의 파일을 건드리면
 * pull 때 충돌이 나고, 중복 제거로 얻는 이득보다 비용이 크다(CLAUDE.md §1 "남이 만든 파일과
 * 코드가 겹쳐도 합치지 않는다").
 */
export const regionOptions: SelectOption[] = [
  { label: '서울', value: 'seoul' },
  { label: '부산', value: 'busan' },
  { label: '대구', value: 'daegu' },
  { label: '인천', value: 'incheon' },
  { label: '광주', value: 'gwangju' },
  { label: '대전', value: 'daejeon' },
  { label: '울산', value: 'ulsan' },
  { label: '세종', value: 'sejong' },
  { label: '경기남부', value: 'gyeonggi-south' },
  { label: '경기북부', value: 'gyeonggi-north' },
  { label: '강원', value: 'gangwon' },
  { label: '충북', value: 'chungbuk' },
  { label: '충남', value: 'chungnam' },
  { label: '전북', value: 'jeonbuk' },
  { label: '전남', value: 'jeonnam' },
  { label: '경북', value: 'gyeongbuk' },
  { label: '경남', value: 'gyeongnam' },
  { label: '제주', value: 'jeju' },
]

/** 검색용 "전체" sentinel 은 빈 문자열을 못 쓴다 — CLAUDE.md §8 */
export const regionFilterOptions: SelectOption[] = [{ label: '전체', value: 'all' }, ...regionOptions]

export function regionLabel(value: string): string {
  return regionOptions.find((option) => option.value === value)?.label ?? value
}

/** 정신응급대응팀 센터 한 건. 조회 API 연동 전까지는 목업 데이터를 그대로 쓴다 */
export interface MentalCenterRow {
  id: number
  region: string
  name: string
  /** 연락처는 기획서 시안이 3칸으로 나뉘어 있어 입력값도 나눠 보관한다 */
  phone1: string
  phone2: string
  phone3: string
  bedTotal: number
}

/** 상세/등록 폼 — 목록 행과 필드는 같고 id 만 신규 등록을 위해 null 을 허용한다 */
export type MentalCenterDetail = Omit<MentalCenterRow, 'id'> & { id: number | null }

export function createEmptyCenterForm(): MentalCenterDetail {
  return { id: null, region: '', name: '', phone1: '', phone2: '', phone3: '', bedTotal: 0 }
}

/** 그리드 "연락처" 컬럼 표시용. 비어 있는 칸이 있으면 하이픈이 남지 않게 걸러 낸다 */
export function formatPhone(row: Pick<MentalCenterRow, 'phone1' | 'phone2' | 'phone3'>): string {
  return [row.phone1, row.phone2, row.phone3].filter(Boolean).join('-')
}

/**
 * 기획서 "※ 센터명에 언더바("_")를 제외한 특수문자 사용은 불가합니다" — 화면단 체크.
 * 한글·영문·숫자·공백·괄호·언더바까지만 허용한다(괄호는 기획서 예시 센터명에 들어 있다).
 */
const CENTER_NAME_ALLOWED = /^[가-힣a-zA-Z0-9_() ]*$/

export function isValidCenterName(name: string): boolean {
  return CENTER_NAME_ALLOWED.test(name)
}

/** 전국 주취자 응급의료센터 — 사용자가 준 표(지역 → 의료기관) 순서 그대로. 센터명 셀렉트가 이 목록에서 파생된다.
 *  `drunkCenter.ts` 목업과 같은 목록이지만 합치지 않는다(CLAUDE.md §1).
 *  연락처·병상 수는 표에 없어 목업이다: 지역번호만 실제이고 나머지 자리(000-00NN)는 자리표시자다 */
function createMockCenters(): MentalCenterRow[] {
  return [
    { id: 1, region: 'seoul', name: '국립중앙의료원', phone1: '02', phone2: '000', phone3: '0001', bedTotal: 2 },
    { id: 2, region: 'seoul', name: '서울의료원', phone1: '02', phone2: '000', phone3: '0002', bedTotal: 3 },
    { id: 3, region: 'seoul', name: '서울특별시 보라매병원', phone1: '02', phone2: '000', phone3: '0003', bedTotal: 4 },
    { id: 4, region: 'seoul', name: '서울적십자병원', phone1: '02', phone2: '000', phone3: '0004', bedTotal: 2 },
    { id: 5, region: 'seoul', name: '서울특별시 동부병원', phone1: '02', phone2: '000', phone3: '0005', bedTotal: 3 },
    { id: 6, region: 'seoul', name: '서울특별시 서남병원', phone1: '02', phone2: '000', phone3: '0006', bedTotal: 2 },
    { id: 7, region: 'incheon', name: '인천의료원', phone1: '032', phone2: '000', phone3: '0007', bedTotal: 3 },
    { id: 8, region: 'daegu', name: '대구의료원', phone1: '053', phone2: '000', phone3: '0008', bedTotal: 2 },
    { id: 9, region: 'ulsan', name: '중앙병원', phone1: '052', phone2: '000', phone3: '0009', bedTotal: 4 },
    { id: 10, region: 'busan', name: '부산의료원', phone1: '051', phone2: '000', phone3: '0010', bedTotal: 3 },
    { id: 11, region: 'gyeonggi-south', name: '경기도의료원 수원병원', phone1: '031', phone2: '000', phone3: '0011', bedTotal: 5 },
    { id: 12, region: 'gyeonggi-south', name: '부천다니엘병원', phone1: '032', phone2: '000', phone3: '0012', bedTotal: 2 },
    { id: 13, region: 'gyeonggi-north', name: '한양대학교 구리병원', phone1: '031', phone2: '000', phone3: '0013', bedTotal: 3 },
    { id: 14, region: 'chungbuk', name: '청주의료원', phone1: '043', phone2: '000', phone3: '0014', bedTotal: 2 },
    { id: 15, region: 'chungnam', name: '서산의료원', phone1: '041', phone2: '000', phone3: '0015', bedTotal: 3 },
    { id: 16, region: 'jeonbuk', name: '원광대학교병원', phone1: '063', phone2: '000', phone3: '0016', bedTotal: 4 },
    { id: 17, region: 'gyeongbuk', name: '포항의료원', phone1: '054', phone2: '000', phone3: '0017', bedTotal: 2 },
    { id: 18, region: 'jeju', name: '제주대학교병원', phone1: '064', phone2: '000', phone3: '0018', bedTotal: 3 },
    { id: 19, region: 'jeju', name: '제주한라병원', phone1: '064', phone2: '000', phone3: '0019', bedTotal: 2 },
    { id: 20, region: 'jeju', name: '서귀포의료원', phone1: '064', phone2: '000', phone3: '0020', bedTotal: 2 },
  ]
}

/**
 * 정신응급대응팀 도메인 상태.
 *
 * 목록/상세(PM-PUB-0414)와 등록(PC-PUB-0415)이 별개 라우트라 Layout.vue 가 이동할 때마다
 * 컴포넌트를 통째로 리마운트한다. setup() 안에 상태를 두면 화면을 옮길 때마다 초기화되므로
 * 모듈 스코프 싱글턴으로 둔다 — CLAUDE.md §3 패턴 B.
 */
function createMentalCenterStore() {
  const centers = ref<MentalCenterRow[]>(createMockCenters())

  /** 신규면 새 id 로 맨 앞에 넣고, 기존 건이면 같은 id 를 갈아 끼운다. 저장된 id 를 돌려준다 */
  function saveCenter(form: MentalCenterDetail): number {
    if (form.id == null) {
      const nextId = centers.value.reduce((max, center) => Math.max(max, center.id), 0) + 1
      // 배열은 splice 로 제자리 수정하지 않고 항상 재할당한다 — CLAUDE.md §3
      centers.value = [{ ...form, id: nextId }, ...centers.value]
      return nextId
    }
    const id = form.id
    centers.value = centers.value.map((center) => (center.id === id ? { ...form, id } : center))
    return id
  }

  function deleteCenter(id: number) {
    centers.value = centers.value.filter((center) => center.id !== id)
  }

  return { centers, saveCenter, deleteCenter }
}

let singleton: ReturnType<typeof createMentalCenterStore> | null = null

export function useMentalCenterStore() {
  if (!singleton) singleton = createMentalCenterStore()
  return singleton
}
