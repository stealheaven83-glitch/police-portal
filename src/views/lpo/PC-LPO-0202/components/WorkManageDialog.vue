<template>
  <GenericDialog2
    v-model:open="workManageOpen"
    title="근무관리"
    :size="560"
  >
    <p class="lp-block-title lp-note-text2">* 추가 근무자를 선택 후 저장하세요.</p>

    <TabulatorGrid
      ref="gridRef"
      :columns="columns"
      :data="workKindRows"
      height="400px"
      placeholder="등록된 근무가 없습니다"
      @cell-edited="onCellEdited"
      @table-built="onTableBuilt"
    />

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="workManageOpen = false">닫기</Button>
      <Button type="button" variant="secondary" size="md" @click="addWorkKindRow">추가</Button>
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
import { workKindOptions } from '../composable/useWorkScheduleDialogs'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/** 근무관리 팝업(PC-LPO-0207) — 근무명·종별·순번·사용여부를 셀에서 바로 고친다(§6-1) */
const store = inject(WorkScheduleKey)!
const { workManageOpen, workKindRows, addWorkKindRow, keyNoteOpen } = store

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const { onTableBuilt } = useDialogGridRedraw(gridRef)

const columns: TabulatorGridColumn[] = [
  { title: '근무', field: 'work', cellType: 'input', minWidth: 160, widthGrow: 2 },
  { title: '종별', field: 'kind', cellType: 'select', selectOptions: workKindOptions, minWidth: 160, widthGrow: 2 },
  { title: '순번', field: 'order', hozAlign: 'center', minWidth: 80, widthGrow: 1 },
  { title: '사용여부', field: 'used', cellType: 'checkbox', hozAlign: 'center', minWidth: 80, widthGrow: 1 },
]

function onCellEdited(cell: { getField: () => string; getValue: () => unknown }) {
  if (cell.getField() === 'kind' && cell.getValue() === '중점사항') {
    keyNoteOpen.value = true
  }
}

async function onSave() {
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  workManageOpen.value = false
}
</script>
