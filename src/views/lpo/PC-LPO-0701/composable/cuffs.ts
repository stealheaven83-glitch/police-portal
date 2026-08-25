import { reactive, ref, type Ref } from 'vue'
import type { EquipmentListRow, SelectOption } from './types'

export type CuffsStatus = 'normal' | 'discarded'

export interface CuffsDetailForm {
  id: number | null
  cuffsType: string
  managementName: string
  holder: string
  manufacturer: string
  status: CuffsStatus
  statusDate: string
  deliveryDate: string
  issuedDate: string
  statusReason: string
  note: string
}

export const cuffsTypeOptions: SelectOption[] = [
  { label: '고정식수갑', value: 'fixed' },
  { label: '전자식수갑', value: 'electronic' },
]

export const cuffsStatusLabel: Record<CuffsStatus, string> = {
  normal: '양호',
  discarded: '불량',
}

function createEmptyCuffsDetail(): CuffsDetailForm {
  return {
    id: null,
    cuffsType: '',
    managementName: '',
    holder: '',
    manufacturer: '',
    status: 'normal',
    statusDate: '',
    deliveryDate: '',
    issuedDate: '',
    statusReason: '',
    note: '',
  }
}

export function createCuffsMockRows(): EquipmentListRow[] {
  return [
    {
      id: 2,
      category: 'cuffs',
      typeLabel: '고정식수갑',
      managementName: '고정식수갑',
      manufacturer: 'KNP정공',
      model: '',
      plateNumber: '',
      location: '',
      holder: '',
      statusDate: '2026-01-01',
      deliveryDate: '2026-01-01',
      issuedDate: '2026-01-01',
      statusReason: '',
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
      manufacturer: 'SS산업',
      model: '',
      plateNumber: '',
      location: '',
      holder: '',
      statusDate: '2026-01-01',
      deliveryDate: '2026-01-01',
      issuedDate: '2026-01-01',
      statusReason: '',
      note: '',
      maintenanceCount: 0,
      inUse: true,
      updater: '홍길동',
      updatedAt: '2015-11-00',
    },
  ]
}

/** 수갑 상세 — 관리 관련 날짜(상태일자/보급일자/지급일자)를 각각 따로 관리한다는 점이 다른 카테고리와 다르다. */
export function useCuffsDetail(allRows: Ref<EquipmentListRow[]>) {
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
      holder: row.holder ?? '',
      manufacturer: row.manufacturer,
      status: 'normal' as CuffsStatus,
      statusDate: row.statusDate ?? '',
      deliveryDate: row.deliveryDate ?? '',
      issuedDate: row.issuedDate ?? '',
      statusReason: row.statusReason ?? '',
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
        existing.holder = form.holder
        existing.manufacturer = form.manufacturer
        existing.statusDate = form.statusDate
        existing.deliveryDate = form.deliveryDate
        existing.issuedDate = form.issuedDate
        existing.statusReason = form.statusReason
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
        manufacturer: form.manufacturer,
        model: '',
        plateNumber: '',
        location: '',
        holder: form.holder,
        statusDate: form.statusDate,
        deliveryDate: form.deliveryDate,
        issuedDate: form.issuedDate,
        statusReason: form.statusReason,
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

  return {
    cuffsDetail,
    cuffsDetailDialogOpen,
    openNewCuffsDetail,
    openCuffsDetail,
    saveCuffsDetail,
    deleteCuffsDetail,
  }
}
