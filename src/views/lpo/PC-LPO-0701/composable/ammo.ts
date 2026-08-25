import { reactive, ref, type Ref } from 'vue'
import type { EquipmentListRow, SelectOption } from './types'

export interface AmmoDetailForm {
  id: number | null
  managementName: string
  unit: string
  stock: number
  current: number
  note: string
}

export const ammoUnitOptions: SelectOption[] = [
  { label: '정', value: 'jung' },
  { label: '발', value: 'bal' },
]

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

export function createAmmoMockRows(): EquipmentListRow[] {
  return [
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
}

/** 탄약 상세 — 결수량/청수량 두 수량을 따로 관리한다. */
export function useAmmoDetail(allRows: Ref<EquipmentListRow[]>) {
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

  return { ammoDetail, ammoDetailDialogOpen, openNewAmmoDetail, openAmmoDetail, saveAmmoDetail, deleteAmmoDetail }
}
