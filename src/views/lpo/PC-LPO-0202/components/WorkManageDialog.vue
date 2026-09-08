<template>
  <GenericDialog2
    v-model:open="workManageOpen"
    title="근무관리"
    :size="480"
  >
    <p class="lp-dialog-subtitle lp-note-text">* 추가 근무자를 선택 후 저장하세요.</p>

    <TabulatorGrid
      ref="gridRef"
      :columns="columns"
      :data="workKindRows"
      height="300px"
      placeholder="등록된 근무가 없습니다"
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
import { toast } from 'vue-sonner'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { WorkScheduleKey } from '../composable/useWorkSchedule'
import { workKindOptions } from '../composable/useWorkScheduleDialogs'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'

/** 근무관리 팝업(PC-LPO-0207) — 근무명·종별·순번·사용여부를 셀에서 바로 고친다(§6-1) */
const store = inject(WorkScheduleKey)!
const { workManageOpen, workKindRows, addWorkKindRow } = store

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const { onTableBuilt } = useDialogGridRedraw(gridRef)

const columns: TabulatorGridColumn[] = [
  { title: '근무', field: 'work', cellType: 'input', minWidth: 140, widthGrow: 2 },
  { title: '종별', field: 'kind', cellType: 'select', selectOptions: workKindOptions, minWidth: 120, widthGrow: 2 },
  { title: '순번', field: 'order', hozAlign: 'center', minWidth: 70, widthGrow: 1 },
  { title: '사용여부', field: 'used', cellType: 'checkbox', hozAlign: 'center', minWidth: 90, widthGrow: 1 },
]

function onSave() {
  toast.success('저장되었습니다.')
  workManageOpen.value = false
}
</script>
