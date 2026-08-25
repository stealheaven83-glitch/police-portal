import { ref } from 'vue'
import type { EquipmentDetailForm } from './mobile'

export interface Vehicle112Row {
  id: number
  deptName: string
  patrolName: string
}

function createMock112List(): Vehicle112Row[] {
  return Array.from({ length: 7 }, (_, i) => ({
    id: i + 1,
    deptName: '서울중부서',
    patrolName: '중부교1호',
  }))
}

/** 기동장비 상세 팝업 안에서 여는 하위팝업 — 고른 차량을 detail.tempVehicle 에 바로 반영한다 */
export function useVehicle112(detail: EquipmentDetailForm) {
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
    vehicle112DialogOpen,
    vehicle112Keyword,
    vehicle112Rows,
    selectedVehicle112Id,
    openVehicle112Dialog,
    searchVehicle112,
    assignVehicle112,
  }
}
