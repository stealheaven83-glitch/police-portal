import { computed, reactive, ref, type InjectionKey } from 'vue'

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
  /** 무기 전용 — 총번 */
  serialNumber?: string
  /** 무기 전용 — 휴대자 */
  holder?: string
  /** 수갑 전용 — 관리번호 */
  managementNumber?: string
  /** 수갑 전용 — 지급일자 */
  issuedDate?: string
  /** 수갑 전용 — 만료일자 */
  expiryDate?: string
  /** 탄약 전용 — 단위 */
  unit?: string
  /** 탄약(결수량)/기타(보유수량) 전용 */
  stock?: number
  /** 탄약 전용 — 청수량 */
  current?: number
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

export interface WeaponHandler {
  id: number
  name: string
}

export interface WeaponDetailForm {
  id: number | null
  gunType: string
  managementName: string
  serialNumber: string
  introducedDate: string
  location: string
  note: string
  handlers: WeaponHandler[]
  isSaved: boolean
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

export interface AmmoDetailForm {
  id: number | null
  managementName: string
  unit: string
  stock: number
  current: number
  note: string
}

export type CuffsStatus = 'normal' | 'discarded'

export interface CuffsDetailForm {
  id: number | null
  cuffsType: string
  managementName: string
  managementNumber: string
  holder: string
  status: CuffsStatus
  issuedDate: string
  expiryDate: string
  note: string
}

export interface EtcDetailForm {
  id: number | null
  etcType: string
  managementName: string
  stock: number
  note: string
}

/** 유지보수이력 — 목록의 모든 카테고리가 공유하는 팝업이라 카테고리별 상세 폼과 별도로 둔다 */
export interface MaintenanceRecord {
  id: number
  type: string
  content: string
  date: string
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

export const gunTypeOptions: SelectOption[] = [
  { label: '38구경', value: 'gun-38' },
  { label: '22구경', value: 'gun-22' },
  { label: '4.5구경', value: 'gun-45' },
  { label: 'M-16', value: 'm16' },
  { label: 'K-1', value: 'k1' },
  { label: 'K-2', value: 'k2' },
  { label: '기타(CAR빈)', value: 'etc-carbine' },
  { label: '전자충격기', value: 'taser' },
  { label: '가스분사기', value: 'gas-spray' },
  { label: '가스살포기', value: 'gas-sprayer' },
]

export const gunSerialOptions: SelectOption[] = [
  { label: '12345678', value: '12345678' },
  { label: '23456789', value: '23456789' },
  { label: '34567890', value: '34567890' },
]

export const ammoUnitOptions: SelectOption[] = [
  { label: '정', value: 'jung' },
  { label: '발', value: 'bal' },
]

export const cuffsTypeOptions: SelectOption[] = [
  { label: '고정식수갑', value: 'fixed' },
  { label: '전자식수갑', value: 'electronic' },
]

export const cuffsStatusLabel: Record<CuffsStatus, string> = {
  normal: '정상',
  discarded: '폐기',
}

export const etcTypeOptions: SelectOption[] = [
  { label: '이동식스피커', value: 'speaker' },
  { label: '확성기', value: 'megaphone' },
  { label: '기타', value: 'etc' },
]

export const maintenanceTypeOptions: SelectOption[] = [
  { label: '수리완료', value: 'done' },
  { label: '수리중', value: 'in-progress' },
  { label: '점검', value: 'inspect' },
]

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

  const weaponRows: EquipmentListRow[] = [
    {
      id: 2,
      category: 'weapon',
      typeLabel: '38구경',
      managementName: '권총',
      manufacturer: '',
      model: '',
      plateNumber: '',
      serialNumber: '12345678',
      location: '지구대/파출소',
      holder: '',
      note: '',
      maintenanceCount: 0,
      inUse: true,
      updater: '홍길동',
      updatedAt: '2015-11-00',
    },
    {
      id: 1,
      category: 'weapon',
      typeLabel: '4.5구경',
      managementName: '장총',
      manufacturer: '',
      model: '',
      plateNumber: '',
      serialNumber: '12345678',
      location: '치안센터',
      holder: '',
      note: '',
      maintenanceCount: 0,
      inUse: true,
      updater: '홍길동',
      updatedAt: '2015-11-00',
    },
  ]

  const ammoRows: EquipmentListRow[] = [
    {
      id: 2,
      category: 'ammo',
      typeLabel: '공기소총',
      managementName: '공기소총',
      manufacturer: '',
      model: '',
      plateNumber: '',
      location: '',
      unit: '정',
      stock: 24,
      current: 24,
      note: '',
      maintenanceCount: 0,
      inUse: true,
      updater: '홍길동',
      updatedAt: '2015-11-00',
    },
    {
      id: 1,
      category: 'ammo',
      typeLabel: '실탄',
      managementName: '실탄',
      manufacturer: '',
      model: '',
      plateNumber: '',
      location: '',
      unit: '정',
      stock: 84,
      current: 84,
      note: '',
      maintenanceCount: 0,
      inUse: true,
      updater: '홍길동',
      updatedAt: '2015-11-00',
    },
  ]

  const cuffsRows: EquipmentListRow[] = [
    {
      id: 2,
      category: 'cuffs',
      typeLabel: '고정식수갑',
      managementName: '고정식수갑',
      manufacturer: '',
      model: '',
      plateNumber: '',
      location: '',
      managementNumber: 'KNP-01-217',
      issuedDate: '2026-01-01',
      expiryDate: '2026-01-01',
      note: '',
      maintenanceCount: 0,
      inUse: true,
      updater: '홍길동',
      updatedAt: '2015-11-00',
    },
    {
      id: 1,
      category: 'cuffs',
      typeLabel: '전자식수갑',
      managementName: '전자식수갑',
      manufacturer: '',
      model: '',
      plateNumber: '',
      location: '',
      managementNumber: 'SS-0001',
      issuedDate: '2026-01-01',
      expiryDate: '2026-01-01',
      note: '',
      maintenanceCount: 0,
      inUse: true,
      updater: '홍길동',
      updatedAt: '2015-11-00',
    },
  ]

  const etcRows: EquipmentListRow[] = [
    {
      id: 2,
      category: 'etc',
      typeLabel: '이동식스피커',
      managementName: '이동식스피커',
      manufacturer: '',
      model: '',
      plateNumber: '',
      location: '',
      stock: 1,
      note: '',
      maintenanceCount: 0,
      inUse: true,
      updater: '홍길동',
      updatedAt: '2015-11-00',
    },
    {
      id: 1,
      category: 'etc',
      typeLabel: '확성기',
      managementName: '확성기',
      manufacturer: '',
      model: '',
      plateNumber: '',
      location: '',
      stock: 2,
      note: '',
      maintenanceCount: 0,
      inUse: true,
      updater: '홍길동',
      updatedAt: '2015-11-00',
    },
  ]

  return [...mobileRows, ...commRows, ...weaponRows, ...ammoRows, ...cuffsRows, ...etcRows]
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

function createEmptyWeaponDetail(): WeaponDetailForm {
  return {
    id: null,
    gunType: '',
    managementName: '',
    serialNumber: '',
    introducedDate: '',
    location: '',
    note: '',
    handlers: [{ id: 1, name: '' }],
    isSaved: false,
  }
}

function createEmptyAmmoDetail(): AmmoDetailForm {
  return {
    id: null,
    managementName: '',
    unit: '',
    stock: 0,
    current: 0,
    note: '',
  }
}

function createEmptyCuffsDetail(): CuffsDetailForm {
  return {
    id: null,
    cuffsType: '',
    managementName: '',
    managementNumber: '',
    holder: '',
    status: 'normal',
    issuedDate: '',
    expiryDate: '',
    note: '',
  }
}

function createEmptyEtcDetail(): EtcDetailForm {
  return {
    id: null,
    etcType: '',
    managementName: '',
    stock: 0,
    note: '',
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

  // 무기 상세 — 담당자(휴대자) 다건 목록을 갖는다는 점이 기동장비/통신장비와 다르다.
  const weaponDetail = reactive<WeaponDetailForm>(createEmptyWeaponDetail())
  const weaponDetailDialogOpen = ref(false)

  function openNewWeaponDetail() {
    Object.assign(weaponDetail, createEmptyWeaponDetail())
    weaponDetailDialogOpen.value = true
  }

  function openWeaponDetail(row: EquipmentListRow) {
    Object.assign(weaponDetail, {
      id: row.id,
      gunType: '',
      managementName: row.managementName,
      serialNumber: row.serialNumber ?? '',
      introducedDate: '',
      location: '',
      note: row.note,
      handlers: row.holder ? [{ id: 1, name: row.holder }] : [{ id: 1, name: '' }],
      isSaved: true,
    })
    weaponDetailDialogOpen.value = true
  }

  function addWeaponHandler() {
    const nextId = weaponDetail.handlers.length ? Math.max(...weaponDetail.handlers.map((h) => h.id)) + 1 : 1
    weaponDetail.handlers.push({ id: nextId, name: '' })
  }

  function saveWeaponDetail() {
    toWeaponListRow(weaponDetail)
    weaponDetailDialogOpen.value = false
  }

  function toWeaponListRow(form: WeaponDetailForm) {
    const typeLabel = gunTypeOptions.find((o) => o.value === form.gunType)?.label ?? form.managementName
    const holder = form.handlers.map((h) => h.name.trim()).filter(Boolean).join(', ')
    if (form.id != null) {
      const existing = allRows.value.find((r) => r.id === form.id)
      if (existing) {
        existing.typeLabel = typeLabel
        existing.managementName = form.managementName
        existing.serialNumber = form.serialNumber
        existing.location = form.location
        existing.note = form.note
        existing.holder = holder
        return
      }
    }
    const nextId = allRows.value.length ? Math.max(...allRows.value.map((r) => r.id)) + 1 : 1
    allRows.value = [
      {
        id: nextId,
        category: 'weapon',
        typeLabel,
        managementName: form.managementName,
        manufacturer: '',
        model: '',
        plateNumber: '',
        serialNumber: form.serialNumber,
        location: form.location,
        holder,
        note: form.note,
        maintenanceCount: 0,
        inUse: true,
        updater: '홍길동',
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      ...allRows.value,
    ]
  }

  function deleteWeaponDetail() {
    if (weaponDetail.id != null) {
      allRows.value = allRows.value.filter((r) => r.id !== weaponDetail.id)
    }
    weaponDetailDialogOpen.value = false
  }

  // 탄약 상세 — 결수량/청수량 두 수량을 따로 관리한다.
  const ammoDetail = reactive<AmmoDetailForm>(createEmptyAmmoDetail())
  const ammoDetailDialogOpen = ref(false)

  function openNewAmmoDetail() {
    Object.assign(ammoDetail, createEmptyAmmoDetail())
    ammoDetailDialogOpen.value = true
  }

  function openAmmoDetail(row: EquipmentListRow) {
    Object.assign(ammoDetail, {
      id: row.id,
      managementName: row.managementName,
      unit: '',
      stock: row.stock ?? 0,
      current: row.current ?? 0,
      note: row.note,
    })
    ammoDetailDialogOpen.value = true
  }

  function saveAmmoDetail() {
    toAmmoListRow(ammoDetail)
    ammoDetailDialogOpen.value = false
  }

  function toAmmoListRow(form: AmmoDetailForm) {
    const unitLabel = ammoUnitOptions.find((o) => o.value === form.unit)?.label ?? ''
    if (form.id != null) {
      const existing = allRows.value.find((r) => r.id === form.id && r.category === 'ammo')
      if (existing) {
        existing.typeLabel = form.managementName
        existing.managementName = form.managementName
        existing.unit = unitLabel
        existing.stock = form.stock
        existing.current = form.current
        existing.note = form.note
        return
      }
    }
    const ammoIds = allRows.value.filter((r) => r.category === 'ammo').map((r) => r.id)
    const nextId = ammoIds.length ? Math.max(...ammoIds) + 1 : 1
    allRows.value = [
      {
        id: nextId,
        category: 'ammo',
        typeLabel: form.managementName,
        managementName: form.managementName,
        manufacturer: '',
        model: '',
        plateNumber: '',
        location: '',
        unit: unitLabel,
        stock: form.stock,
        current: form.current,
        note: form.note,
        maintenanceCount: 0,
        inUse: true,
        updater: '홍길동',
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      ...allRows.value,
    ]
  }

  function deleteAmmoDetail() {
    if (ammoDetail.id != null) {
      allRows.value = allRows.value.filter((r) => !(r.id === ammoDetail.id && r.category === 'ammo'))
    }
    ammoDetailDialogOpen.value = false
  }

  // 수갑 상세 — 관리번호/지급일자~만료일자를 갖는다는 점이 다른 카테고리와 다르다.
  const cuffsDetail = reactive<CuffsDetailForm>(createEmptyCuffsDetail())
  const cuffsDetailDialogOpen = ref(false)

  function openNewCuffsDetail() {
    Object.assign(cuffsDetail, createEmptyCuffsDetail())
    cuffsDetailDialogOpen.value = true
  }

  function openCuffsDetail(row: EquipmentListRow) {
    Object.assign(cuffsDetail, {
      id: row.id,
      cuffsType: '',
      managementName: row.managementName,
      managementNumber: row.managementNumber ?? '',
      holder: '',
      status: 'normal' as CuffsStatus,
      issuedDate: row.issuedDate ?? '',
      expiryDate: row.expiryDate ?? '',
      note: row.note,
    })
    cuffsDetailDialogOpen.value = true
  }

  function saveCuffsDetail() {
    toCuffsListRow(cuffsDetail)
    cuffsDetailDialogOpen.value = false
  }

  function toCuffsListRow(form: CuffsDetailForm) {
    const typeLabel = cuffsTypeOptions.find((o) => o.value === form.cuffsType)?.label ?? form.managementName
    if (form.id != null) {
      const existing = allRows.value.find((r) => r.id === form.id && r.category === 'cuffs')
      if (existing) {
        existing.typeLabel = typeLabel
        existing.managementName = form.managementName
        existing.managementNumber = form.managementNumber
        existing.issuedDate = form.issuedDate
        existing.expiryDate = form.expiryDate
        existing.note = form.note
        return
      }
    }
    const cuffsIds = allRows.value.filter((r) => r.category === 'cuffs').map((r) => r.id)
    const nextId = cuffsIds.length ? Math.max(...cuffsIds) + 1 : 1
    allRows.value = [
      {
        id: nextId,
        category: 'cuffs',
        typeLabel,
        managementName: form.managementName,
        manufacturer: '',
        model: '',
        plateNumber: '',
        location: '',
        managementNumber: form.managementNumber,
        issuedDate: form.issuedDate,
        expiryDate: form.expiryDate,
        note: form.note,
        maintenanceCount: 0,
        inUse: true,
        updater: '홍길동',
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      ...allRows.value,
    ]
  }

  function deleteCuffsDetail() {
    if (cuffsDetail.id != null) {
      allRows.value = allRows.value.filter((r) => !(r.id === cuffsDetail.id && r.category === 'cuffs'))
    }
    cuffsDetailDialogOpen.value = false
  }

  // 기타 상세
  const etcDetail = reactive<EtcDetailForm>(createEmptyEtcDetail())
  const etcDetailDialogOpen = ref(false)

  function openNewEtcDetail() {
    Object.assign(etcDetail, createEmptyEtcDetail())
    etcDetailDialogOpen.value = true
  }

  function openEtcDetail(row: EquipmentListRow) {
    Object.assign(etcDetail, {
      id: row.id,
      etcType: '',
      managementName: row.managementName,
      stock: row.stock ?? 0,
      note: row.note,
    })
    etcDetailDialogOpen.value = true
  }

  function saveEtcDetail() {
    toEtcListRow(etcDetail)
    etcDetailDialogOpen.value = false
  }

  function toEtcListRow(form: EtcDetailForm) {
    const typeLabel = etcTypeOptions.find((o) => o.value === form.etcType)?.label ?? form.managementName
    if (form.id != null) {
      const existing = allRows.value.find((r) => r.id === form.id && r.category === 'etc')
      if (existing) {
        existing.typeLabel = typeLabel
        existing.managementName = form.managementName
        existing.stock = form.stock
        existing.note = form.note
        return
      }
    }
    const etcIds = allRows.value.filter((r) => r.category === 'etc').map((r) => r.id)
    const nextId = etcIds.length ? Math.max(...etcIds) + 1 : 1
    allRows.value = [
      {
        id: nextId,
        category: 'etc',
        typeLabel,
        managementName: form.managementName,
        manufacturer: '',
        model: '',
        plateNumber: '',
        location: '',
        stock: form.stock,
        note: form.note,
        maintenanceCount: 0,
        inUse: true,
        updater: '홍길동',
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      ...allRows.value,
    ]
  }

  function deleteEtcDetail() {
    if (etcDetail.id != null) {
      allRows.value = allRows.value.filter((r) => !(r.id === etcDetail.id && r.category === 'etc'))
    }
    etcDetailDialogOpen.value = false
  }

  // 장비유지보수 이력 — 카테고리 전부가 공유하는 팝업. allRows 의 id 가 카테고리별로 겹치므로
  // `category-id` 조합을 키로 이력을 따로 보관한다.
  const maintenanceHistory = reactive<Record<string, MaintenanceRecord[]>>({
    'mobile-50': [{ id: 1, type: 'done', content: '정기 점검 및 부품 교체 완료', date: '2026-01-01' }],
  })
  const maintenanceDialogOpen = ref(false)
  const maintenanceTitle = ref('')
  const maintenanceRows = ref<MaintenanceRecord[]>([])
  let maintenanceActiveKey = ''

  function maintenanceKey(row: EquipmentListRow) {
    return `${row.category}-${row.id}`
  }

  function openMaintenanceHistory(row: EquipmentListRow) {
    maintenanceActiveKey = maintenanceKey(row)
    maintenanceTitle.value = row.managementName
    maintenanceRows.value = maintenanceHistory[maintenanceActiveKey]
      ? maintenanceHistory[maintenanceActiveKey].map((r) => ({ ...r }))
      : []
    maintenanceDialogOpen.value = true
  }

  function addMaintenanceRow() {
    const nextId = maintenanceRows.value.length ? Math.max(...maintenanceRows.value.map((r) => r.id)) + 1 : 1
    maintenanceRows.value = [{ id: nextId, type: '', content: '', date: '' }, ...maintenanceRows.value]
  }

  function saveMaintenanceHistory() {
    maintenanceHistory[maintenanceActiveKey] = maintenanceRows.value.map((r) => ({ ...r }))
    const row = allRows.value.find((r) => maintenanceKey(r) === maintenanceActiveKey)
    if (row) row.maintenanceCount = maintenanceRows.value.length
    maintenanceDialogOpen.value = false
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
    weaponDetail,
    weaponDetailDialogOpen,
    openNewWeaponDetail,
    openWeaponDetail,
    addWeaponHandler,
    saveWeaponDetail,
    deleteWeaponDetail,
    ammoDetail,
    ammoDetailDialogOpen,
    openNewAmmoDetail,
    openAmmoDetail,
    saveAmmoDetail,
    deleteAmmoDetail,
    cuffsDetail,
    cuffsDetailDialogOpen,
    openNewCuffsDetail,
    openCuffsDetail,
    saveCuffsDetail,
    deleteCuffsDetail,
    etcDetail,
    etcDetailDialogOpen,
    openNewEtcDetail,
    openEtcDetail,
    saveEtcDetail,
    deleteEtcDetail,
    maintenanceDialogOpen,
    maintenanceTitle,
    maintenanceRows,
    openMaintenanceHistory,
    addMaintenanceRow,
    saveMaintenanceHistory,
  }
}

/**
 * PC-LPO-0701.vue 에서 useEquipmentList() 를 한 번만 호출해 provide 하고,
 * 하위 팝업 컴포넌트(components/)들은 이 키로 inject 해서 같은 인스턴스를 공유한다.
 * (각자 useEquipmentList() 를 다시 부르면 상태가 따로 생겨 목록과 어긋난다)
 */
export type EquipmentListStore = ReturnType<typeof useEquipmentList>
export const EquipmentListKey: InjectionKey<EquipmentListStore> = Symbol('PC-LPO-0701-equipment-list')
