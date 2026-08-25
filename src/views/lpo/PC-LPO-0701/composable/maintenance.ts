import { reactive, ref, type Ref } from 'vue'
import type { EquipmentListRow } from './types'

/** 유지보수이력 — 목록의 모든 카테고리가 공유하는 팝업이라 카테고리별 상세 폼과 별도로 둔다 */
export interface MaintenanceRecord {
  id: number
  type: string
  content: string
  date: string
}

/** 장비유지보수 이력 — 카테고리 전부가 공유하는 팝업. allRows 의 id 가 카테고리별로 겹치므로
 * `category-id` 조합을 키로 이력을 따로 보관한다. */
export function useMaintenanceHistory(allRows: Ref<EquipmentListRow[]>) {
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

  return {
    maintenanceDialogOpen,
    maintenanceTitle,
    maintenanceRows,
    openMaintenanceHistory,
    addMaintenanceRow,
    saveMaintenanceHistory,
  }
}
