import { computed, reactive, ref } from 'vue'

export interface SelectOption {
  label: string
  value: string
}

export interface PersonnelListRow {
  no: number
  name: string
  rank: string
  position: string
  team: string
  phone: string
  updater: string
  updatedAt: string
}

export interface PersonnelDetailForm {
  photoUrl: string | null
  name: string
  gender: 'male' | 'female'
  duplicateName: 'none' | 'exists'
  duplicateType: string
  officerAssignedDate: string
  currentRankAssignedDate: string
  currentDeptTransferDate: string
  position: string
  actingChief: boolean
  actingTeamLead: boolean
  team: string
  teamNote: string
  workType: 'center' | 'day' | ''
  isPeriodicAccidentTarget: boolean
  periodicAccidentReason: string
  teamLeadTrainingDate: string
  teamLeadCertDate: string
  mobilePhone: string
  addressRoad: string
  addressDetail: string
  note: string
}

export interface TransferRecord {
  no: number
  fromDept: string
  transferInDate: string
  toDept: string
  transferOutDate: string
}

export const rankOptions: SelectOption[] = [
  { label: '전체', value: 'all' },
  { label: '총경', value: 'chief-superintendent' },
  { label: '경감', value: 'superintendent' },
  { label: '경위', value: 'inspector' },
]

export const duplicateTypeOptions: SelectOption[] = [
  { label: '동성동명', value: 'same-name' },
  { label: '유사동명', value: 'similar-name' },
]

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

export const periodicAccidentReasonOptions: SelectOption[] = [
  { label: '민원다발', value: 'frequent-complaints' },
  { label: '음주운전', value: 'dui' },
  { label: '기타', value: 'etc' },
]

function createMockListRows(): PersonnelListRow[] {
  return Array.from({ length: 20 }, (_, i) => ({
    no: 20 - i,
    name: '홍길동',
    rank: i % 7 === 6 ? '총경' : '경감',
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
    workType: '',
    isPeriodicAccidentTarget: false,
    periodicAccidentReason: '',
    teamLeadTrainingDate: '',
    teamLeadCertDate: '',
    mobilePhone: '',
    addressRoad: '',
    addressDetail: '',
    note: '',
  }
}

export function usePersonnelForm() {
  const allRows = createMockListRows()
  const listRows = ref<PersonnelListRow[]>(allRows)
  const selectedRowIndex = ref<number | null>(null)
  const detail = reactive<PersonnelDetailForm>(createEmptyDetail())

  const searchRank = ref('all')
  const searchName = ref('')
  const showAdvancedSearch = ref(true)

  const itemsPerPage = 10
  const currentPage = ref(1)
  const totalPages = computed(() => Math.max(1, Math.ceil(listRows.value.length / itemsPerPage)))
  const pagedListRows = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return listRows.value.slice(start, start + itemsPerPage)
  })

  const rankLabelByValue: Record<string, string> = {
    'chief-superintendent': '총경',
    superintendent: '경감',
    inspector: '경위',
  }

  function search() {
    listRows.value = allRows.filter((row) => {
      const matchesRank = searchRank.value === 'all' || row.rank === rankLabelByValue[searchRank.value]
      const matchesName = !searchName.value.trim() || row.name.includes(searchName.value.trim())
      return matchesRank && matchesName
    })
    currentPage.value = 1
  }

  const transfers = ref<TransferRecord[]>([
    { no: 3, fromDept: '', transferInDate: '', toDept: '', transferOutDate: '' },
    { no: 2, fromDept: '대구청 범죄예방계', transferInDate: '2026-07-24', toDept: '서울청 범죄예방계', transferOutDate: '2026-07-24' },
    { no: 1, fromDept: '대구청 범죄예방계', transferInDate: '2026-07-24', toDept: '서울청 범죄예방계', transferOutDate: '2026-07-24' },
  ])

  function selectRow(index: number, row: PersonnelListRow) {
    selectedRowIndex.value = index
    Object.assign(detail, createEmptyDetail(), {
      name: row.name,
      workType: '',
    })
  }

  function addTransferRow() {
    const nextNo = transfers.value.length
      ? Math.max(...transfers.value.map((t) => t.no)) + 1
      : 1
    transfers.value = [{ no: nextNo, fromDept: '', transferInDate: '', toDept: '', transferOutDate: '' }, ...transfers.value]
  }

  function removeTransferRows(rowsToRemove: TransferRecord[]) {
    const nos = new Set(rowsToRemove.map((r) => r.no))
    transfers.value = transfers.value.filter((r) => !nos.has(r.no))
  }

  return {
    listRows,
    pagedListRows,
    itemsPerPage,
    currentPage,
    totalPages,
    selectedRowIndex,
    detail,
    transfers,
    searchRank,
    searchName,
    showAdvancedSearch,
    search,
    selectRow,
    addTransferRow,
    removeTransferRows,
  }
}
