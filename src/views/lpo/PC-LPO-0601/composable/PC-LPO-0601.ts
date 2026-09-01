import { reactive, ref } from 'vue'

/* ------------------------------------------------------------------ *
 * 관내현황 (PC-LPO-0601)
 * 퍼블리싱 범위 — 데이터는 전부 목업. 부서정보는 폴넷, 관내정보는 공공데이터포털
 * 연계라 실제 조회는 개발팀이 이어받는다(기획서 1·13).
 * ------------------------------------------------------------------ */

/** 부서 선택(상단 회색 영역) — 본청 › 하위 › 하위 3단 캐스케이드 */
export interface DepartmentValue {
  level1: string
  level2: string
  level3: string
}

export const departmentTree = [
  {
    label: '본청',
    value: 'hq',
    children: [
      {
        label: '중앙학교',
        value: 'central-school',
        children: [
          { label: '실습부서', value: 'practice' },
          { label: '을지지구대', value: 'eulji' },
        ],
      },
    ],
  },
]

/** 소재지 구분 (기획서 8) */
export const siteOptions = [
  { label: '선택', value: 'none' },
  { label: '7대도시', value: 'metro' },
  { label: '도청소재지', value: 'provincial' },
  { label: '3만명 이상 소재지', value: 'over30k' },
  { label: '읍소재', value: 'eup' },
  { label: '면지역', value: 'myeon' },
  { label: '기타시', value: 'etc' },
]

/** 근무형태 — 교대근무형태설정 값 (기획서 9) */
export const workTypeOptions = [
  { label: '선택', value: 'none' },
  { label: '3조 2교대', value: '3-2' },
  { label: '4조 2교대', value: '4-2' },
  { label: '3조 1교대', value: '3-1' },
  { label: '상시근무', value: 'always' },
]

/** 통합운영 관서(유연파출소 / 중심관서) 후보 — 지역경찰서 관내 파출소 리스트 */
export const integratedStationOptions = [
  { label: '관내파출소1', value: 'station-1' },
  { label: '관내파출소2', value: 'station-2' },
  { label: '관내파출소3', value: 'station-3' },
  { label: '관내파출소4', value: 'station-4' },
  { label: '관내파출소5', value: 'station-5' },
  { label: '관내파출소6', value: 'station-6' },
]

/** 통합관리반 — 단일선택 (기획서 12) */
export const integratedManageOptions = [
  { label: '선택', value: 'none' },
  { label: '관내파출소1', value: 'station-1' },
  { label: '관내파출소2', value: 'station-2' },
  { label: '을지지구대', value: 'eulji' },
]

/** 치안센터 유형 (기획서 19-1) */
export const centerTypeOptions = [
  { label: '검문소형', value: 'checkpoint' },
  { label: '출장소형', value: 'branch' },
]

export interface CenterRow {
  id: number
  name: string
  address: string
  phone: string
  type: string
  resident: boolean
  remote: boolean
  island: boolean
  headcount: string
  workStart: string
  workEnd: string
  openDate: string
  closeDate: string
}

export interface HistoryRow {
  id: number
  date: string
  content: string
  basis: string
  note: string
  updater: string
}

export interface PatrolAreaRow {
  id: number
  vehicle: string
  district: string
  routeName: string
  routeDetail: string
}

let seq = 100
const nextId = () => ++seq

export function createEmptyCenter(): CenterRow {
  return {
    id: nextId(),
    name: '',
    address: '',
    phone: '',
    type: '',
    resident: false,
    remote: false,
    island: false,
    headcount: '',
    workStart: '',
    workEnd: '',
    openDate: '',
    closeDate: '',
  }
}

/** 연혁 추가 시 연혁일자 기본값은 오늘 (기획서 23-1) */
export function createEmptyHistory(): HistoryRow {
  const today = new Date().toISOString().slice(0, 10)
  return { id: nextId(), date: today, content: '', basis: '', note: '', updater: '홍길동' }
}

export function useLocalStatus() {
  /** 상단: 폴넷 연동 표시값(읽기 전용) + 저장 이력 */
  const meta = reactive({
    departmentName: '서울중부경찰서 을지지구대',
    officerCount: 60,
    updatedAt: '2024-09-01',
    updatedBy: '홍길동',
  })

  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'central-school', level3: 'eulji' })

  /** 부서정보 폼 */
  const deptForm = reactive({
    openYear: '',
    grade: 1,
    capacity: '',
    addressSearch: '',
    addressDetail: '',
    site: 'none',
    generalPhone: '',
    guardPhone: '',
    guardFax: '',
    workType: 'none',
    workCycle: '',
    dayExclusiveCount: '',
    nightExclusiveCount: '',
    // 유연파출소 / 중심관서는 2가지 중 하나만 (기획서 10·11)
    flexibleEnabled: true,
    flexibleStations: ['station-1', 'station-4'] as string[],
    centralEnabled: false,
    centralStations: [] as string[],
    integratedManageEnabled: false,
    integratedManage: 'none',
  })

  /** 관내정보 (공공데이터포털 연계 — 기획서 13) */
  const localInfo = reactive({
    dongCount: 1,
    dongNames: '사직동, 청운동',
    area: '1.22',
    totalPopulation: 0,
    male: '',
    female: '',
    households: '2853',
    detachedHouse: '',
    rowHouse: '',
    apartmentDong: '',
    villaDong: '',
    oneRoom: '',
    beehiveHouse: '',
    entertainmentBiz: '',
    fullDistrict:
      '법정동 - 사직동, 체부동, 필운동, 내자동(일부)  / 행정동 - 사직동 옥인동, 통인동, 누상동, 누하동',
    regionFeature:
      '법정동 - 사직동, 체부동, 필운동, 내자동(일부)  / 행정동 - 사직동 옥인동, 통인동, 누상동, 누하동',
  })

  /** 순찰차별 관할구역 (기획서 16·25~27) — 순찰차는 장비관리 등록분 */
  const patrolAreas = ref<PatrolAreaRow[]>([
    { id: 1, vehicle: '순마21호', district: '', routeName: '', routeDetail: '' },
    {
      id: 2,
      vehicle: '순마22호',
      district: '장충동2가, 묵정동',
      routeName: '순찰구역명1',
      routeDetail: '신원초등학교 → 센트레빌 → 삼송마을 → 개포주공',
    },
    {
      id: 3,
      vehicle: '순마23호',
      district: '을지로 6가 대형쇼핑몰 일대, 방산시장',
      routeName: '순찰구역명2',
      routeDetail: '신원중학교 → 조호마을',
    },
  ])

  /** 치안센터 (기획서 18) */
  const centers = ref<CenterRow[]>([
    {
      id: 2,
      name: 'DDP치안센터',
      address: '중구 을지로 281',
      phone: '010-1234-1234',
      type: 'branch',
      resident: true,
      remote: false,
      island: true,
      headcount: '1',
      workStart: '09:00',
      workEnd: '18:00',
      openDate: '2026-02-15',
      closeDate: '2026-02-16',
    },
    {
      id: 1,
      name: 'DDP치안센터',
      address: '중구 을지로 281',
      phone: '010-0000-0000',
      type: 'branch',
      resident: true,
      remote: false,
      island: false,
      headcount: '1',
      workStart: '09:00',
      workEnd: '18:00',
      openDate: '2026-02-15',
      closeDate: '2026-02-16',
    },
  ])

  /** 연혁 (기획서 22) */
  const histories = ref<HistoryRow[]>([
    {
      id: 3,
      date: '2018-12-01',
      content: '동부지구대개편, 편입후 을지로6가 치안센터로 운영',
      basis: '',
      note: '',
      updater: '홍길동',
    },
    {
      id: 2,
      date: '2018-12-01',
      content: '동부지구대개편, 편입후 을지로6가 치안센터로 운영',
      basis: '',
      note: '',
      updater: '홍길동',
    },
    {
      id: 1,
      date: '2018-12-01',
      content: '동부지구대개편, 편입후 을지로6가 치안센터로 운영',
      basis: '',
      note: '',
      updater: '홍길동',
    },
  ])

  return {
    meta,
    department,
    deptForm,
    localInfo,
    patrolAreas,
    centers,
    histories,
  }
}
