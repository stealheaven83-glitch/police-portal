import { reactive, ref, type Ref } from 'vue'
import type { EquipmentListRow, SelectOption } from './types'

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

export function createWeaponMockRows(): EquipmentListRow[] {
  return [
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
}

/** 무기 상세 — 담당자(휴대자) 다건 목록을 갖는다는 점이 기동장비/통신장비와 다르다. */
export function useWeaponDetail(allRows: Ref<EquipmentListRow[]>) {
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
      const existing = allRows.value.find((r) => r.id === form.id && r.category === 'weapon')
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
    const weaponIds = allRows.value.filter((r) => r.category === 'weapon').map((r) => r.id)
    const nextId = weaponIds.length ? Math.max(...weaponIds) + 1 : 1
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
      allRows.value = allRows.value.filter((r) => !(r.id === weaponDetail.id && r.category === 'weapon'))
    }
    weaponDetailDialogOpen.value = false
  }

  return {
    weaponDetail,
    weaponDetailDialogOpen,
    openNewWeaponDetail,
    openWeaponDetail,
    addWeaponHandler,
    saveWeaponDetail,
    deleteWeaponDetail,
  }
}
