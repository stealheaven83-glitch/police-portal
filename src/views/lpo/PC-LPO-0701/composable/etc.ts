import { reactive, ref, type Ref } from 'vue'
import type { EquipmentListRow } from './types'

export interface EtcDetailForm {
  id: number | null
  etcType: string
  managementName: string
  stock: number
  note: string
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

export function createEtcMockRows(): EquipmentListRow[] {
  return [
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
}

/** 기타 상세 */
export function useEtcDetail(allRows: Ref<EquipmentListRow[]>) {
  const etcDetail = reactive<EtcDetailForm>(createEmptyEtcDetail())
  const etcDetailDialogOpen = ref(false)

  function openNewEtcDetail() {
    Object.assign(etcDetail, createEmptyEtcDetail())
    etcDetailDialogOpen.value = true
  }

  function openEtcDetail(row: EquipmentListRow) {
    Object.assign(etcDetail, {
      id: row.id,
      etcType: row.typeLabel,
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
    const typeLabel = form.etcType.trim() || form.managementName
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

  return { etcDetail, etcDetailDialogOpen, openNewEtcDetail, openEtcDetail, saveEtcDetail, deleteEtcDetail }
}
