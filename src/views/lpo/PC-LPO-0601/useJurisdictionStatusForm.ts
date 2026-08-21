import { reactive } from 'vue'

export interface SelectOption {
  label: string
  value: string
}

export interface FlexiblePostGroup {
  /** 유연 파출소 운영 여부 */
  enabled: boolean
  /** 통합운영 관서 (다중 선택) */
  agencies: string[]
}

export interface DepartmentInfoForm {
  deptName: string
  openYear: string
  gradeLevel: number
  capacity: number | null
  currentHeadcount: number
  addressRoad: string
  addressDetail: string
  region: string
  phone: string
  guardPhone: string
  guardFax: string
  workType: string
  workCycle: string
  dayShiftCount: number | null
  nightShiftCount: number | null
  flexiblePosts: [FlexiblePostGroup, FlexiblePostGroup]
  integratedTeam: boolean
}

export interface DistrictInfoForm {
  area: string
  populationTotal: number | null
  populationMale: number | null
  populationFemale: number | null
  households: number | null
  rowHouses: number | null
  apartmentBuildings: number | null
  villaBuildings: number | null
  oneRoomUnits: number | null
  cashIntensiveShops: number | null
  entertainmentShops: number | null
  fullJurisdiction: string
  characteristics: string
}

export interface PatrolZoneSummary {
  code: string
  area: string
}

/** 근무형태 옵션 */
export const workTypeOptions: SelectOption[] = [
  { label: '3부제', value: 'shift3' },
  { label: '4부제', value: 'shift4' },
  { label: '상시근무', value: 'always' },
]

/** 소재지(행정동) 옵션 */
export const regionOptions: SelectOption[] = [
  { label: '사직동', value: 'sajik' },
  { label: '체부동', value: 'chebu' },
  { label: '필운동', value: 'pilun' },
  { label: '내자동', value: 'naeja' },
]

/** 통합운영 관서로 묶을 수 있는 관내파출소 옵션 */
export const jurisdictionPostOptions: SelectOption[] = [
  { label: '관내파출소1', value: 'post1' },
  { label: '관내파출소2', value: 'post2' },
  { label: '관내파출소3', value: 'post3' },
  { label: '관내파출소4', value: 'post4' },
  { label: '관내파출소5', value: 'post5' },
]

export function useJurisdictionStatusForm() {
  const departmentInfo = reactive<DepartmentInfoForm>({
    deptName: '서울중부경찰서 을지지구대',
    openYear: '',
    gradeLevel: 1,
    capacity: null,
    currentHeadcount: 60,
    addressRoad: '',
    addressDetail: '',
    region: '',
    phone: '',
    guardPhone: '',
    guardFax: '',
    workType: '',
    workCycle: '',
    dayShiftCount: null,
    nightShiftCount: null,
    flexiblePosts: [
      { enabled: true, agencies: ['post1', 'post4'] },
      { enabled: false, agencies: ['post1', 'post4'] },
    ],
    integratedTeam: false,
  })

  const districtInfo = reactive<DistrictInfoForm>({
    area: '1.22 km²',
    populationTotal: 0,
    populationMale: null,
    populationFemale: null,
    households: null,
    rowHouses: null,
    apartmentBuildings: null,
    villaBuildings: null,
    oneRoomUnits: null,
    cashIntensiveShops: null,
    entertainmentShops: null,
    fullJurisdiction:
      '법정동- 사직동, 체부동, 필운동, 내자동(일부) / 행정동-사직동\n옥인동, 통인동, 누상동, 누하동',
    characteristics:
      '법정동- 사직동, 체부동, 필운동, 내자동(일부) / 행정동-사직동\n옥인동, 통인동, 누상동, 누하동',
  })

  const patrolZones: PatrolZoneSummary[] = [
    { code: '순마21호', area: '' },
    { code: '순마22호', area: '장충동2가, 묵정동' },
    { code: '순마24호', area: '을지로 6가 대형쇼핑몰 일대, 방산시장' },
  ]

  return {
    departmentInfo,
    districtInfo,
    patrolZones,
    workTypeOptions,
    regionOptions,
    jurisdictionPostOptions,
  }
}
