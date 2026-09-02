import { reactive, ref } from 'vue'
import type { SelectCellOption } from '@/components/custom/tabulator'

/**
 * PC-LPO-0601 관내현황 — 화면 상태와 목업 데이터.
 *
 * 퍼블 범위라 저장/조회는 목업이다(CLAUDE.md 프로젝트 범위).
 * 팝업(PC-LPO-0602 순찰차별 관할구역 관리 / PC-LPO-0603 관할행정동 검색)은
 * 이 화면 하나가 소유하므로 provide/inject 없이 부모가 v-model 로 넘긴다.
 */

/* ── 셀렉트 옵션 ─────────────────────────────────────────────── */

/** sentinel 은 '' 를 쓸 수 없다(CLAUDE.md §8) */
export const locationOptions = [
  { label: '자체청사', value: 'own' },
  { label: '임차청사', value: 'rent' },
  { label: '파출소 병설', value: 'annex' },
]

export const workTypeOptions = [
  { label: '4교대', value: 'shift4' },
  { label: '3교대', value: 'shift3' },
  { label: '주간근무', value: 'day' },
]

/** 유연 파출소 여부 · 중심관서 드롭다운(다중선택) */
export const integratedOfficeOptions = [
  { label: '관내파출소1', value: 'office1' },
  { label: '관내파출소2', value: 'office2' },
  { label: '관내파출소3', value: 'office3' },
  { label: '관내파출소4', value: 'office4' },
  { label: '관내파출소5', value: 'office5' },
]

/** 치안센터 유형 (그리드 셀 셀렉트) */
export const safetyCenterTypeOptions: SelectCellOption[] = [
  { label: '출장소형', value: '출장소형' },
  { label: '상담소형', value: '상담소형' },
  { label: '방범초소형', value: '방범초소형' },
]

/** 관할행정동 검색 팝업 — 시도 */
export const sidoOptions = [
  { label: '서울특별시', value: 'seoul' },
  { label: '부산광역시', value: 'busan' },
  { label: '대구광역시', value: 'daegu' },
  { label: '인천광역시', value: 'incheon' },
]

/** 관할행정동 검색 팝업 — 시군구 (시도 무관 목업) */
export const sigunguOptions = [
  { label: '사하구', value: 'saha' },
  { label: '중구', value: 'jung' },
  { label: '종로구', value: 'jongno' },
]

/* ── 타입 ────────────────────────────────────────────────────── */

/** 순찰차별 관할구역 (관내정보 안의 표) */
export interface PatrolVehicleRow {
  id: number
  /** 순찰차명 */
  vehicle: string
  /** 관할구역 (지도 팝업에서 채워진다) */
  area: string
  /** 순찰구역명 */
  areaName: string
  /** 순찰구역상세 */
  areaDetail: string
}

/** 치안센터 */
export interface SafetyCenterRow {
  no: number
  name: string
  address: string
  phone: string
  type: string
  resident: boolean
  remote: boolean
  island: boolean
  headcount: string
  startTime: string
  endTime: string
  openedAt: string
  closedAt: string
}

/** 연혁 */
export interface HistoryRow {
  no: number
  date: string
  content: string
  basis: string
  note: string
  updater: string
}

/** 행정동 (검색 결과 · 현재 행정동 공용) */
export interface DongRow {
  no: number
  sido: string
  sigungu: string
  dong: string
  code: string
}

/* ── 화면 상태 ───────────────────────────────────────────────── */

export function useJurisdictionStatus() {
  /** 부서정보 */
  const department = reactive({
    name: '서울중부경찰서 을지지구대',
    openedYear: '',
    grade: '',
    quota: '',
    address: '',
    addressDetail: '',
    location: '',
    generalPhone: '',
    securityPhone: '',
    securityFax: '',
    workType: '',
    workCycle: '',
    dayDedicated: '',
    nightDedicated: '',
    /** 유연 파출소 여부 */
    flexibleUse: true,
    flexibleOffices: ['office1', 'office4'] as string[],
    /** 중심관서 */
    centralUse: false,
    centralOffices: [] as string[],
    /** 통합관리반 */
    integratedTeamUse: false,
    integratedTeamOffices: [] as string[],
  })

  /** 현원은 조회 전용 표시값이라 폼과 분리한다 */
  const officerHeadcount = ref(60)

  /** 관내정보 */
  const district = reactive({
    /** 관할행정동 요약 — 행정동 수정 팝업 결과로 갱신된다 */
    dongSummary: '관할행정동 1개 (사직동, 청운동) 면적 1.22 k㎡',
    totalPopulation: 0,
    male: '',
    female: '',
    households: 2853,
    detachedHouse: '',
    rowHouse: '',
    apartment: '',
    villa: '',
    oneRoom: '',
    separateHouse: '',
    entertainment: '',
    wholeArea:
      '법정동- 사직동, 체부동, 필운동, 내자동(일부)  / 행정동-사직동 옥인동, 통인동,누상동, 누하동',
    features:
      '법정동- 사직동, 체부동, 필운동, 내자동(일부)  / 행정동-사직동\n옥인동, 통인동,누상동, 누하동',
  })

  /** 순찰차별 관할구역 */
  const patrolVehicles = ref<PatrolVehicleRow[]>([
    { id: 1, vehicle: '순마21호', area: '', areaName: '', areaDetail: '' },
    {
      id: 2,
      vehicle: '순마22호',
      area: '장충동2가, 묵정동',
      areaName: '순찰구역명1',
      areaDetail: '신원초등학교 → 센트레빌 → 삼송마을 → 개포주공',
    },
    {
      id: 3,
      vehicle: '순마23호',
      area: '을지로 6가 대형쇼핑몰 일대, 방산시장',
      areaName: '순찰구역명2',
      areaDetail: '신원중학교 → 조호마을',
    },
  ])

  /** 치안센터 — 시안대로 최신 번호가 위로 온다 */
  const safetyCenters = ref<SafetyCenterRow[]>([
    {
      no: 3,
      name: '',
      address: '',
      phone: '',
      type: '',
      resident: false,
      remote: false,
      island: false,
      headcount: '',
      startTime: '',
      endTime: '',
      openedAt: '',
      closedAt: '',
    },
    {
      no: 2,
      name: 'DDP치안센터',
      address: '중구 을지로 281',
      phone: '01012341234',
      type: '출장소형',
      resident: true,
      remote: false,
      island: true,
      headcount: '1',
      startTime: '09:00',
      endTime: '18:00',
      openedAt: '2026.02.16',
      closedAt: '2026.02.16',
    },
    {
      no: 1,
      name: 'DDP치안센터',
      address: '중구 을지로 281',
      phone: '01000000000',
      type: '출장소형',
      resident: true,
      remote: false,
      island: false,
      headcount: '1',
      startTime: '09:00',
      endTime: '18:00',
      openedAt: '2026.02.16',
      closedAt: '2026.02.16',
    },
  ])

  /** 연혁 */
  const histories = ref<HistoryRow[]>([
    { no: 4, date: '', content: '', basis: '', note: '', updater: '홍길동' },
    {
      no: 3,
      date: '2018-12-01',
      content: '동부지구대개편,편입후 을지로6가 치안센터로 운영',
      basis: '',
      note: '',
      updater: '홍길동',
    },
    {
      no: 2,
      date: '2018-12-01',
      content: '동부지구대개편,편입후 을지로6가 치안센터로 운영',
      basis: '',
      note: '',
      updater: '홍길동',
    },
    {
      no: 1,
      date: '2018-12-01',
      content: '동부지구대개편,편입후 을지로6가 치안센터로 운영',
      basis: '',
      note: '',
      updater: '홍길동',
    },
  ])

  /** 현재 행정동 — 관할행정동 검색 팝업의 결과가 반영된다 */
  const currentDongs = ref<DongRow[]>([
    { no: 1, sido: '부산광역시', sigungu: '사하구', dong: '다대1동', code: '2638060100' },
    { no: 2, sido: '부산광역시', sigungu: '사하구', dong: '다대1동', code: '2638060100' },
    { no: 3, sido: '부산광역시', sigungu: '사하구', dong: '다대1동', code: '2638060100' },
  ])

  function nextNo(rows: { no: number }[]) {
    return rows.reduce((max, row) => Math.max(max, row.no), 0) + 1
  }

  function createSafetyCenter(): SafetyCenterRow {
    return {
      no: nextNo(safetyCenters.value),
      name: '',
      address: '',
      phone: '',
      type: '',
      resident: false,
      remote: false,
      island: false,
      headcount: '',
      startTime: '',
      endTime: '',
      openedAt: '',
      closedAt: '',
    }
  }

  function createHistory(): HistoryRow {
    return {
      no: nextNo(histories.value),
      date: '',
      content: '',
      basis: '',
      note: '',
      updater: '홍길동',
    }
  }

  return {
    department,
    officerHeadcount,
    district,
    patrolVehicles,
    safetyCenters,
    histories,
    currentDongs,
    createSafetyCenter,
    createHistory,
  }
}

/** 관할행정동 검색 팝업의 검색 결과 목업 */
export function createDongSearchResult(): DongRow[] {
  return Array.from({ length: 8 }, (_, index) => ({
    no: index + 1,
    sido: '부산광역시',
    sigungu: '사하구',
    dong: '다대1동',
    code: '2638060100',
  }))
}

/** 지도 팝업(PC-LPO-0602)에서 고르는 순찰차 목록 */
export const patrolVehicleOptions = [
  { label: '순마21호', value: '순마21호' },
  { label: '순마22호', value: '순마22호' },
  { label: '순마23호', value: '순마23호' },
  { label: '순마24호', value: '순마24호' },
  { label: '순마25호', value: '순마25호' },
  { label: '순마26호', value: '순마26호' },
]
