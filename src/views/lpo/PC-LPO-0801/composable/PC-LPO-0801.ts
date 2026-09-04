import { reactive, ref } from 'vue'

/**
 * 인사관리(PC-LPO-0801) 화면 상태.
 *
 * 퍼블리싱 범위라 데이터는 전부 목업이고, 실제 조회/저장은 개발팀이 잇는다.
 * Figma: 8mQz91txveSEKO0ky7Ck6V / 10766:72722 (PC_지역경찰_07_인사관리)
 */

export interface SelectOption {
  label: string
  value: string
}

/** 좌측 "인사 현황" 목록 한 행 */
export interface PersonnelListRow {
  /**
   * 행 고유키. TabulatorGrid 는 :data 를 복제해서 넘기므로 클릭한 행을 원본에서 되찾을
   * 식별자가 필요하다. 화면에 보이는 "번호"와 같은 값이지만 역할이 달라 따로 둔다.
   */
  rowKey: number
  no: number
  name: string
  rank: string
  position: string
  team: string
  phone: string
  updater: string
  updatedAt: string
}

/** 우측 "인사 상세" 폼 */
export interface PersonnelDetailForm {
  photoUrl: string | null
  name: string
  gender: 'male' | 'female'
  duplicateName: 'none' | 'exists'
  /** 동명구분 — 동명여부가 '있음'일 때만 활성 */
  duplicateType: string
  officerAssignedDate: string
  currentRankAssignedDate: string
  currentDeptTransferDate: string
  /** 근무구분 라디오 */
  position: string
  actingChief: boolean
  actingTeamLead: boolean
  team: string
  /** 소속팀이 '기타'일 때만 활성인 직접입력 */
  teamNote: string
  /** 기타근무 라디오 — 고른 항목의 입력만 활성 */
  etcWork: '' | 'center' | 'partTime' | 'pregnancy' | 'etc'
  partTimeDate: string
  pregnancyDate: string
  etcWorkNote: string
  /** 정기사고자 — 체크해야 사유/일자가 활성 */
  isPeriodicAccident: boolean
  periodicAccidentReason: string
  periodicAccidentDate: string
  teamLeadTrainingDate: string
  teamLeadCertDate: string
  mobilePhone: string
  addressRoad: string
  addressDetail: string
  note: string
}

/** 하단 "전입 전출 현황" 한 행 */
export interface TransferRow {
  rowKey: number
  fromDept: string
  transferInDate: string
  toDept: string
  transferOutDate: string
}

/** 상세조회 - 상태구분. 시안에는 '전체'만 보여서 나머지는 임의로 채웠다 */
export const statusOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  { label: '직급1', value: 'active' },
  { label: '직급2', value: 'leave' },
  { label: '직급3', value: 'transferred' },
]

export const duplicateTypeOptions: SelectOption[] = [
  { label: '동성동명', value: 'same-name' },
  { label: '유사동명', value: 'similar-name' },
]

/** 근무구분 라디오 */
export const positionOptions: SelectOption[] = [
  { label: '관서장', value: 'chief' },
  { label: '치안센터장', value: 'center-chief' },
  { label: '팀장', value: 'team-lead' },
  { label: '부팀장', value: 'deputy-team-lead' },
  { label: '팀원', value: 'member' },
  { label: '관리팀', value: 'admin-team' },
]

export const teamOptions: SelectOption[] = [
  { label: '1팀', value: 'team1' },
  { label: '2팀', value: 'team2' },
  { label: '3팀', value: 'team3' },
  { label: '기타', value: 'etc' },
]

/** 정기사고자 사유. 시안에는 '선택'(placeholder)만 보여서 임의로 채웠다 */
export const periodicAccidentReasonOptions: SelectOption[] = [
  { label: '민원다발', value: 'frequent-complaints' },
  { label: '음주운전', value: 'dui' },
  { label: '기타', value: 'etc' },
]

/** 시안의 목록 8행 — 성명·직책·소속팀·전화번호가 모두 같고 계급만 다르다 */
function createMockListRows(): PersonnelListRow[] {
  const ranks = ['경감', '경감', '경감', '경위', '경감', '경감', '총경', '경감']
  return ranks.map((rank, i) => ({
    rowKey: i + 1,
    no: i + 1,
    name: '홍길동',
    rank,
    position: '관리',
    team: '1팀',
    phone: '010-1234-5678',
    updater: '홍길동',
    updatedAt: '2015-11-00',
  }))
}

function createEmptyDetail(): PersonnelDetailForm {
  return {
    photoUrl: null,
    name: '',
    gender: 'male',
    duplicateName: 'none',
    duplicateType: '',
    officerAssignedDate: '',
    currentRankAssignedDate: '',
    currentDeptTransferDate: '',
    position: '',
    actingChief: false,
    actingTeamLead: false,
    team: '',
    teamNote: '',
    etcWork: '',
    partTimeDate: '',
    pregnancyDate: '',
    etcWorkNote: '',
    isPeriodicAccident: false,
    periodicAccidentReason: '',
    periodicAccidentDate: '',
    teamLeadTrainingDate: '',
    teamLeadCertDate: '',
    mobilePhone: '',
    addressRoad: '',
    addressDetail: '',
    note: '',
  }
}

/** 시안의 전입 전출 현황 3행 — 첫 행은 아직 부서를 안 고른 신규 행이다 */
function createMockTransfers(): TransferRow[] {
  return [
    { rowKey: 1, fromDept: '', transferInDate: '', toDept: '', transferOutDate: '' },
    { rowKey: 2, fromDept: '대구청 범죄예방계', transferInDate: '2026-07-24', toDept: '서울청 범죄예방계', transferOutDate: '2026-07-24' },
    { rowKey: 3, fromDept: '대구청 범죄예방계', transferInDate: '2026-07-24', toDept: '서울청 범죄예방계', transferOutDate: '2026-07-24' },
  ]
}

/**
 * 부서 조회 팝업(PC-LPO-0802) — 좌측 트리 한 노드.
 * TreeView 는 name/children 으로 그린다.
 */
export interface DeptTreeNode {
  name: string
  /** 이 노드를 고르면 우측 '부서 정보'에 뜨는 관서명. 잎 노드가 아니면 없다 */
  station?: string
  children?: DeptTreeNode[]
}

/** 부서 조회 팝업 우측 '부서 정보' 한 행 */
export interface DeptInfoRow {
  station: string
  dept: string
}

/**
 * 부서 트리 목업 — 지역경찰포털 아래 관서(본청 · 경찰대학 · 부산청), 그 아래 부서.
 * 잎 노드의 name 은 '부서 정보' 표의 dept 와 같은 값이라, 나중에 트리 선택으로
 * 우측 목록을 거를 때 station + name 으로 바로 짝지을 수 있다.
 */
export function createDeptTree(): DeptTreeNode[] {
  return [
    {
      name: '지역경찰포털',
      children: [
        {
          name: '본청',
          station: '본청',
          children: [
            { name: '기획조정관', station: '본청' },
            { name: '경무인사기획관', station: '본청' },
            {
              name: '범죄예방대응국',
              station: '본청',
              children: [
                { name: '지역경찰운영과', station: '본청' },
                { name: '범죄예방기획계', station: '본청' },
                { name: '여성청소년범죄수사', station: '본청' },
              ],
            },
            { name: '생활안전교통국', station: '본청' },
            { name: '수사기획조정관', station: '본청' },
            { name: '형사국', station: '본청' },
            { name: '사이버수사국', station: '본청' },
            { name: '안보수사국', station: '본청' },
            { name: '치안상황관리관', station: '본청' },
          ],
        },
        {
          name: '경찰대학',
          station: '경찰대학',
          children: [
            { name: '교무처', station: '경찰대학' },
            { name: '교수부', station: '경찰대학' },
            { name: '운영지원과', station: '경찰대학' },
            { name: '학생지도부', station: '경찰대학' },
            { name: '도서관', station: '경찰대학' },
            { name: '생활지도과', station: '경찰대학' },
            { name: '치안정책연구소', station: '경찰대학' },
            { name: '수사보안연수원', station: '경찰대학' },
            { name: '교육훈련과', station: '경찰대학' },
            { name: '학생과', station: '경찰대학' },
          ],
        },
        {
          name: '부산청',
          station: '부산청',
          children: [
            { name: '청문감사인권관', station: '부산청' },
            { name: '공공안전부', station: '부산청' },
            {
              name: '수사부',
              station: '부산청',
              children: [
                { name: '강력범죄수사대', station: '부산청' },
                { name: '사이버수사대', station: '부산청' },
              ],
            },
            { name: '사상경찰서', station: '부산청' },
            { name: '해운대경찰서', station: '부산청' },
          ],
        },
      ],
    },
  ]
}

/**
 * '부서 정보' 목업.
 * 앞 5행이 시안에 그려진 것이고, 나머지는 스크롤·조회 동작을 확인하려고 덧붙였다.
 */
export function createDeptInfoRows(): DeptInfoRow[] {
  return [
    { station: '경찰대학', dept: '교무처' },
    { station: '경찰대학', dept: '교수부' },
    { station: '경찰대학', dept: '운영지원과' },
    { station: '경찰대학', dept: '학생지도부' },
    { station: '경찰대학', dept: '도서관' },
    { station: '경찰대학', dept: '생활지도과' },
    { station: '경찰대학', dept: '치안정책연구소' },
    { station: '경찰대학', dept: '수사보안연수원' },
    { station: '경찰대학', dept: '교육훈련과' },
    { station: '경찰대학', dept: '학생과' },
    { station: '본청', dept: '기획조정관' },
    { station: '본청', dept: '경무인사기획관' },
    { station: '본청', dept: '범죄예방대응국' },
    { station: '본청', dept: '지역경찰운영과' },
    { station: '본청', dept: '생활안전교통국' },
    { station: '본청', dept: '수사기획조정관' },
    { station: '본청', dept: '형사국' },
    { station: '본청', dept: '사이버수사국' },
    { station: '본청', dept: '안보수사국' },
    { station: '본청', dept: '치안상황관리관' },
  ]
}

export function usePersonnelManage() {
  /* 검색 */
  const advancedSearchOpen = ref(false)
  const searchStatus = ref('all')
  const searchEquipmentName = ref('')

  /* 목록 */
  const listRows = ref<PersonnelListRow[]>(createMockListRows())
  /** 시안은 5번 행이 선택된 상태다 */
  const activeRowKey = ref<number | null>(5)

  /* 상세 */
  const detail = reactive<PersonnelDetailForm>(createEmptyDetail())
  const transfers = ref<TransferRow[]>(createMockTransfers())

  /** 목록에서 행을 고르면 상세를 그 행 값으로 채운다(실제로는 사번으로 상세를 조회해 온다) */
  function selectRow(rowKey: number) {
    const row = listRows.value.find((r) => r.rowKey === rowKey)
    if (!row) return
    activeRowKey.value = rowKey
    Object.assign(detail, createEmptyDetail(), { name: row.name })
  }

  // 추가된 행에도 겹치지 않는 rowKey 를 주려고 목업 범위 밖에서 세어 올린다
  let nextTransferKey = 1000
  function createTransferRow(): TransferRow {
    return {
      rowKey: (nextTransferKey += 1),
      fromDept: '',
      transferInDate: '',
      toDept: '',
      transferOutDate: '',
    }
  }

  return {
    advancedSearchOpen,
    searchStatus,
    searchEquipmentName,
    listRows,
    activeRowKey,
    detail,
    transfers,
    selectRow,
    createTransferRow,
  }
}
