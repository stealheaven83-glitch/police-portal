import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 참고사항 (PM-PUB-0111)
 *
 * 읍면동 단위로 한 해의 범죄·112신고·인구/사회학적 통계를 입력해 두는 화면이다.
 * 소계는 입력값에서 바로 계산해 보여주고(읽기 전용), 저장은 개발팀 몫이다.
 */

/** 범죄 통계 */
export interface CrimeStats {
  railway: number
  violence: number
  intelligence: number
  murder: number
  robbery: number
  rape: number
  arson: number
}

/** 112신고 통계 */
export interface ReportStats {
  code1: number
  code2: number
}

/** 인구·사회학적 통계 */
export interface PopulationStats {
  landArea: number
  area: number
  density: number
  prevPopulation: number
  migration: number
  basicLivingCount: number
  basicLiving: number
  households: number
  singleHouseholdRate: number
  singleHouseholds: number
  foreignerRate: number
  registeredForeigners: number
  managedTargets: number
  exOffenders: number
  /** 풍속업소는 아래 업종 합계라 입력이 아니라 계산값이다 */
  entertainmentTotalNote: string
  registeredIdentityTargets: number
  population: number
}

/** 풍속업소 업종별 */
export interface EntertainmentStats {
  bar: number
  karaokeRoom: number
  pub: number
  gameArcade: number
  lodging: number
  danceAcademy: number
  barbershop: number
  danceHall: number
  videoRoom: number
}

export const yearOptions = Array.from({ length: 6 }, (_, i) => {
  const year = String(2026 - i)
  return { label: year, value: year }
})

/** 읍면동 — 실제 목록은 개발팀이 채운다 */
export const townOptions = [
  { label: '서울특별시 중구 필동', value: 'jung-pildong' },
  { label: '서울특별시 중구 명동', value: 'jung-myeongdong' },
  { label: '서울특별시 종로구 사직동', value: 'jongno-sajik' },
]

/** 업로드 팝업 첨부 제한 — 시안 문구의 '최대 3개' (Figma 11213:88495) */
export const UPLOAD_MAX_FILES = 3

/** 업로드 결과 중 실패한 줄 — 목업. 실제 검증 결과는 개발팀이 채운다 */
export const uploadFailures = [
  '라인 : 16 - 구분: 서울특별시 종로구 종로1,2,3,4가동 (대학로파출소) / 사유 : 통계값은 숫자만 입력 가능합니다.',
  '라인 : 16 - 구분: 서울특별시 종로구 종로1,2,3,4가동 (대학로파출소) / 사유 : 통계값은 숫자만 입력 가능합니다.',
  '라인 : 16 - 구분: 서울특별시 종로구 종로1,2,3,4가동 (대학로파출소) / 사유 : 통계값은 숫자만 입력 가능합니다.',
]

export function useDiagnosisReference() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const advancedSearchOpen = ref(true)

  const year = ref('2026')
  const town = ref('jung-pildong')

  const crime = ref<CrimeStats>({
    railway: 4,
    violence: 4,
    intelligence: 4,
    murder: 4,
    robbery: 4,
    rape: 4,
    arson: 4,
  })

  const report = ref<ReportStats>({ code1: 0, code2: 0 })

  const population = ref<PopulationStats>({
    landArea: 0,
    area: 0,
    density: 0,
    prevPopulation: 0,
    migration: 0,
    basicLivingCount: 0,
    basicLiving: 0,
    households: 0,
    singleHouseholdRate: 0,
    singleHouseholds: 0,
    foreignerRate: 0,
    registeredForeigners: 0,
    managedTargets: 0,
    exOffenders: 0,
    entertainmentTotalNote: '',
    registeredIdentityTargets: 0,
    population: 0,
  })

  const entertainment = ref<EntertainmentStats>({
    bar: 0,
    karaokeRoom: 0,
    pub: 0,
    gameArcade: 0,
    lodging: 0,
    danceAcademy: 0,
    barbershop: 0,
    danceHall: 0,
    videoRoom: 0,
  })

  /* 소계는 입력값 합이라 화면에서 계산한다 — 시안에서도 입력이 아니라 결과 칸이다 */
  const crimeSubtotal = computed(
    () => crime.value.railway + crime.value.violence + crime.value.intelligence,
  )
  const violentCrimeSubtotal = computed(
    () => crime.value.murder + crime.value.robbery + crime.value.rape + crime.value.arson,
  )
  const reportTotal = computed(() => report.value.code1 + report.value.code2)
  const entertainmentTotal = computed(() =>
    Object.values(entertainment.value).reduce((sum, n) => sum + n, 0),
  )

  return {
    department,
    advancedSearchOpen,
    year,
    town,
    crime,
    report,
    population,
    entertainment,
    crimeSubtotal,
    violentCrimeSubtotal,
    reportTotal,
    entertainmentTotal,
  }
}
