import { reactive, ref, type Ref } from 'vue'
import type { EquipmentListRow, SelectOption } from './types'

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

export const commTypeOptions: SelectOption[] = [
  { label: '원격조정기', value: 'remote-controller' },
  { label: '간이중계소', value: 'relay-station' },
  { label: '무전기', value: 'radio' },
]

export const commManageStatusLabel: Record<CommManageStatus, string> = {
  done: '완료',
  hold: '보류',
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

export function createCommMockRows(): EquipmentListRow[] {
  return [
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
}

/** 통신장비 상세 — 기동장비와 필드 구성이 완전히 달라 별도 폼/모달로 관리한다. */
export function useCommDetail(allRows: Ref<EquipmentListRow[]>) {
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
      const existing = allRows.value.find((r) => r.id === form.id && r.category === 'comm')
      if (existing) {
        existing.typeLabel = typeLabel
        existing.managementName = form.managementName
        existing.location = form.location
        existing.note = form.note
        return
      }
    }
    const commIds = allRows.value.filter((r) => r.category === 'comm').map((r) => r.id)
    const nextId = commIds.length ? Math.max(...commIds) + 1 : 1
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
      allRows.value = allRows.value.filter((r) => !(r.id === commDetail.id && r.category === 'comm'))
    }
    commDetailDialogOpen.value = false
  }

  return { commDetail, commDetailDialogOpen, openNewCommDetail, openCommDetail, saveCommDetail, deleteCommDetail }
}
