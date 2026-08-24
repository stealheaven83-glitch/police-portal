import { computed, reactive, ref } from 'vue'

export interface SelectOption {
  label: string
  value: string
}

export type EquipmentCategory = 'mobile' | 'comm' | 'weapon' | 'ammo' | 'cuffs' | 'etc'
export type VehicleType = 'patrol' | 'motorcycle' | 'bicycle'

export interface EquipmentListRow {
  id: number
  category: EquipmentCategory
  typeLabel: string
  managementName: string
  manufacturer: string
  model: string
  plateNumber: string
  location: string
  note: string
  maintenanceCount: number
  inUse: boolean
  updater: string
  updatedAt: string
}

export interface EquipmentDetailForm {
  id: number | null
  vehicleType: VehicleType
  plateNumber: string
  managementName: string
  carType: string
  location: string
  manufacturer: string
  model: string
  year: string
  info112: string
  tempVehicle: string
  note: string
  isSaved: boolean
}

export interface Vehicle112Row {
  id: number
  deptName: string
  patrolName: string
}

export type CommManageStatus = 'done' | 'hold'

export interface CommDetailForm {
  id: number | null
  commType: string
  managementName: string
  location: string
  serialNumber: string
  manageStatus: CommManageStatus
  note: string
}

export const categoryTabs: { value: EquipmentCategory; label: string }[] = [
  { value: 'mobile', label: '기동장비' },
  { value: 'comm', label: '통신장비' },
  { value: 'weapon', label: '무기' },
  { value: 'ammo', label: '탄약' },
  { value: 'cuffs', label: '수갑' },
  { value: 'etc', label: '기타' },
]

export const vehicleTypeLabel: Record<VehicleType, string> = {
  patrol: '순찰차',
  motorcycle: '오토바이',
  bicycle: '자전거',
}

export const carTypeOptions: SelectOption[] = [
  { label: '승용', value: 'sedan' },
  { label: 'SUV', value: 'suv' },
  { label: '승합', value: 'van' },
]

export const locationOptions: SelectOption[] = [
  { label: '지구대/파출소', value: 'substation' },
  { label: '본청', value: 'hq' },
  { label: '치안센터', value: 'center' },
]

export const info112Options: SelectOption[] = [
  { label: '중부교1호', value: 'jungbu-1' },
  { label: '중부교2호', value: 'jungbu-2' },
]

export const commTypeOptions: SelectOption[] = [
  { label: '원격조정기', value: 'remote-controller' },
  { label: '간이중계소', value: 'relay-station' },
  { label: '무전기', value: 'radio' },
]

export const commManageStatusLabel: Record<CommManageStatus, string> = {
  done: '완료',
  hold: '보류',
}

const MOCK_LIST_SIZE = 50

function createMockList(): EquipmentListRow[] {
  // 최신 등록분이 위로 오도록 번호를 내림차순(50 → 1)으로 만든다.
  // 건수와 무관하게 1 미만이 나오지 않도록 목록 길이를 기준으로 계산한다.
  const mobileRows: EquipmentListRow[] = Array.from({ length: MOCK_LIST_SIZE }, (_, i) => ({
    id: MOCK_LIST_SIZE - i,
    category: 'mobile',
    typeLabel: '순찰차',
    managementName: '남포1',
    manufacturer: '현대',
    model: '2.0소나타',
    plateNumber: '999어1234',
    location: '지구대/파출소',
    note: '중부11 순20호',
    maintenanceCount: 0,
    inUse: true,
    updater: '홍길동',
    updatedAt: '2015-11-00',
  }))

  const commRows: EquipmentListRow[] = [
    {
      id: 2,
      category: 'comm',
      typeLabel: '원격조정기',
      managementName: '원격조정기',
      manufacturer: '',
      model: '',
      plateNumber: '',
      location: '지구대/파출소',
      note: '',
      maintenanceCount: 0,
      inUse: true,
      updater: '홍길동',
      updatedAt: '2015-11-00',
    },
    {
      id: 1,
      category: 'comm',
      typeLabel: '간이중계소',
      managementName: '간이중계소',
      manufacturer: '',
      model: '',
      plateNumber: '',
      location: '치안센터',
      note: '',
      maintenanceCount: 0,
      inUse: true,
      updater: '홍길동',
      updatedAt: '2015-11-00',
    },
  ]

  return [...mobileRows, ...commRows]
}

function createEmptyCommDetail(): CommDetailForm {
  return {
    id: null,
    commType: '',
    managementName: '',
    location: '',
    serialNumber: '',
    manageStatus: 'done',
    note: '',
  }
}

function createEmptyDetail(): EquipmentDetailForm {
  return {
    id: null,
    vehicleType: 'patrol',
    plateNumber: '',
    managementName: '',
    carType: '',
    location: '',
    manufacturer: '',
    model: '',
    year: '',
    info112: '',
    tempVehicle: '',
    note: '',
    isSaved: false,
  }
}

function createMock112List(): Vehicle112Row[] {
  return Array.from({ length: 7 }, (_, i) => ({
    id: i + 1,
    deptName: '서울중부서',
    patrolName: '중부교1호',
  }))
}

export function useEquipmentList() {
  const activeCategory = ref<EquipmentCategory>('mobile')
  const showAdvancedSearch = ref(true)

  const allRows = ref<EquipmentListRow[]>(createMockList())
  const rowsByCategory = computed(() => allRows.value.filter((r) => r.category === activeCategory.value))

  const detail = reactive<EquipmentDetailForm>(createEmptyDetail())
  const detailDialogOpen = ref(false)

  function openNewDetail() {
    Object.assign(detail, createEmptyDetail())
    detailDialogOpen.value = true
  }

  function openDetail(row: EquipmentListRow) {
    Object.assign(detail, {
      id: row.id,
      vehicleType: 'patrol' as VehicleType,
      plateNumber: row.plateNumber,
      managementName: row.managementName,
      carType: '',
      location: '',
      manufacturer: row.manufacturer,
      model: row.model,
      year: '',
      info112: '',
      tempVehicle: '',
      note: row.note,
      isSaved: true,
    })
    detailDialogOpen.value = true
  }

  function saveDetail() {
    detail.isSaved = true
  }

  function deleteDetail() {
    if (detail.id != null) {
      allRows.value = allRows.value.filter((r) => r.id !== detail.id)
    }
    detailDialogOpen.value = false
  }

  // 통신장비 상세 — 기동장비와 필드 구성이 완전히 달라 별도 폼/모달로 관리한다.
  const commDetail = reactive<CommDetailForm>(createEmptyCommDetail())
  const commDetailDialogOpen = ref(false)

  function openNewCommDetail() {
    Object.assign(commDetail, createEmptyCommDetail())
    commDetailDialogOpen.value = true
  }

  function openCommDetail(row: EquipmentListRow) {
    Object.assign(commDetail, {
      id: row.id,
      commType: '',
      managementName: row.managementName,
      location: '',
      serialNumber: '',
      manageStatus: 'done',
      note: row.note,
    })
    commDetailDialogOpen.value = true
  }

  function saveCommDetail() {
    toCommListRow(commDetail)
    commDetailDialogOpen.value = false
  }

  function toCommListRow(form: CommDetailForm) {
    const typeLabel = commTypeOptions.find((o) => o.value === form.commType)?.label ?? form.managementName
    if (form.id != null) {
      const existing = allRows.value.find((r) => r.id === form.id)
      if (existing) {
        existing.typeLabel = typeLabel
        existing.managementName = form.managementName
        existing.location = form.location
        existing.note = form.note
        return
      }
    }
    const nextId = allRows.value.length ? Math.max(...allRows.value.map((r) => r.id)) + 1 : 1
    allRows.value = [
      {
        id: nextId,
        category: 'comm',
        typeLabel,
        managementName: form.managementName,
        manufacturer: '',
        model: '',
        plateNumber: '',
        location: form.location,
        note: form.note,
        maintenanceCount: 0,
        inUse: true,
        updater: '홍길동',
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      ...allRows.value,
    ]
  }

  function deleteCommDetail() {
    if (commDetail.id != null) {
      allRows.value = allRows.value.filter((r) => r.id !== commDetail.id)
    }
    commDetailDialogOpen.value = false
  }

  // 112차량 조회
  const vehicle112DialogOpen = ref(false)
  const vehicle112Keyword = ref('')
  const vehicle112AllRows = createMock112List()
  const vehicle112Rows = ref<Vehicle112Row[]>(vehicle112AllRows)
  const selectedVehicle112Id = ref<number | null>(null)

  function openVehicle112Dialog() {
    vehicle112Rows.value = vehicle112AllRows
    selectedVehicle112Id.value = null
    vehicle112DialogOpen.value = true
  }

  function searchVehicle112() {
    const kw = vehicle112Keyword.value.trim()
    vehicle112Rows.value = kw
      ? vehicle112AllRows.filter((r) => r.deptName.includes(kw) || r.patrolName.includes(kw))
      : vehicle112AllRows
  }

  function assignVehicle112() {
    const row = vehicle112Rows.value.find((r) => r.id === selectedVehicle112Id.value)
    if (row) detail.tempVehicle = `${row.deptName} ${row.patrolName}`
    vehicle112DialogOpen.value = false
  }

  return {
    activeCategory,
    showAdvancedSearch,
    rowsByCategory,
    detail,
    detailDialogOpen,
    openNewDetail,
    openDetail,
    saveDetail,
    deleteDetail,
    vehicle112DialogOpen,
    vehicle112Keyword,
    vehicle112Rows,
    selectedVehicle112Id,
    openVehicle112Dialog,
    searchVehicle112,
    assignVehicle112,
    commDetail,
    commDetailDialogOpen,
    openNewCommDetail,
    openCommDetail,
    saveCommDetail,
    deleteCommDetail,
  }
}
