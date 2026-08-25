import { reactive, ref, type Ref } from 'vue'
import type { EquipmentListRow, SelectOption } from './types'

export type VehicleType = 'patrol' | 'motorcycle' | 'bicycle'

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

export const info112Options: SelectOption[] = [
  { label: '중부교1호', value: 'jungbu-1' },
  { label: '중부교2호', value: 'jungbu-2' },
]

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

const MOBILE_MOCK_SIZE = 50

export function createMobileMockRows(): EquipmentListRow[] {
  // 최신 등록분이 위로 오도록 번호를 내림차순(50 → 1)으로 만든다.
  // 건수와 무관하게 1 미만이 나오지 않도록 목록 길이를 기준으로 계산한다.
  return Array.from({ length: MOBILE_MOCK_SIZE }, (_, i) => ({
    id: MOBILE_MOCK_SIZE - i,
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
}

export function useMobileDetail(allRows: Ref<EquipmentListRow[]>) {
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
      allRows.value = allRows.value.filter((r) => !(r.id === detail.id && r.category === 'mobile'))
    }
    detailDialogOpen.value = false
  }

  return { detail, detailDialogOpen, openNewDetail, openDetail, saveDetail, deleteDetail }
}
