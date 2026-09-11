<template>
  <GenericDialog2 v-model:open="patrolDetailOpen" title="순찰구역 상세" :size="1000">

    <div class="meta-wrapper ver1">
      <span>순찰구역명: <em>{{ patrolDetailName }}</em></span>
    </div>
    <TabulatorGrid
      ref="gridRef"
      class="lp-table-gap"
      :columns="columns"
      :data="patrolPointRows"
      height="450px"
      select-mode="checkbox"
      placeholder="등록된 지점이 없습니다"
      @row-selection-changed="onSelectionChanged"
      @table-built="onTableBuilt"
    />

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="patrolDetailOpen = false">닫기</Button>
      <Button type="button" variant="tertiary2" size="md" @click="onDelete">삭제</Button>
      <Button type="button" variant="secondary" size="md" @click="addPatrolPointRow">추가</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { WorkScheduleKey } from '../composable/useWorkSchedule'
import type { PatrolPointRow } from '../composable/useWorkScheduleDialogs'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/** 순찰구역 상세 팝업(PC-LPO-0210) — 순찰구역 안의 지점(순서·구역명·주소)을 다룬다 */
const store = inject(WorkScheduleKey)!
const { patrolDetailOpen, patrolDetailName, patrolPointRows, addPatrolPointRow, removePatrolPointRows } = store

const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const { onTableBuilt } = useDialogGridRedraw(gridRef)

const columns: TabulatorGridColumn[] = [
  { title: '순서', field: 'order', cellType: 'input', hozAlign: 'center', width: 100 },
  { title: '구역명', field: 'name', cellType: 'input', width: 200 },
  {
    title: '주소',
    field: 'address',
    cellType: 'input',
    cellIcon: searchIcon,
    cellIconLabel: '주소 조회',
    onCellIconClick: () => dialog.alert({ title: '주소 검색은 개발 연동 예정입니다.', btnCancel: '확인' }),
  },
  { title: '주소상세', field: 'addressDetail', cellType: 'input', width: 200, },
]

const selectedIds = ref<Set<number>>(new Set())

// @row-selection-changed 는 RowComponent 배열을 넘긴다(CLAUDE.md §6)
function onSelectionChanged(rows: unknown[]) {
  selectedIds.value = new Set(
    rows.map((r) => {
      const data = (typeof (r as { getData?: () => PatrolPointRow }).getData === 'function'
        ? (r as { getData: () => PatrolPointRow }).getData()
        : r) as PatrolPointRow
      return data.id
    }),
  )
}

async function onDelete() {
  if (!selectedIds.value.size) {
    await dialog.alert({ title: '삭제할 지점을 선택해 주세요.', btnCancel: '확인' })
    return
  }
  removePatrolPointRows(selectedIds.value)
  selectedIds.value = new Set()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

async function onSave() {
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  patrolDetailOpen.value = false
}
</script>
