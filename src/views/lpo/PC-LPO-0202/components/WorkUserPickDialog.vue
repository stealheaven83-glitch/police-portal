<template>
  <GenericDialog2 v-model:open="workUserPickOpen" title="근무 사용자 선택" :size="720">
    <LayoutSplite :count="3">
      <template #layout-1>
        <LayoutHeader title="운전자 선택" />
        <TabulatorGrid
          ref="driverGridRef"
          :columns="driverColumns"
          :data="driverRows"
          height="330px"
          placeholder="운전자가 없습니다"
          @table-built="onDriverBuilt"
        />
      </template>
      <template #layout-2>
        <LayoutHeader title="근무자" />
        <TabulatorGrid
          ref="workerGridRef"
          :columns="workerColumns"
          :data="workUserRows"
          height="330px"
          placeholder="근무자가 없습니다"
          @table-built="onWorkerBuilt"
        />
      </template>
      <template #layout-3>
        <LayoutHeader title="자원 근무자" />
        <TabulatorGrid
          ref="volunteerGridRef"
          :columns="volunteerColumns"
          :data="volunteerUserRows"
          height="330px"
          placeholder="자원 근무자가 없습니다"
          @table-built="onVolunteerBuilt"
        />
      </template>
    </LayoutSplite>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="workUserPickOpen = false">취소</Button>
      <Button type="button" variant="primary" size="md" @click="onConfirm">확인</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutHeader from '@/components/custom/content-layout/layoutHeader.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { WorkScheduleKey } from '../composable/useWorkSchedule'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/**
 * 근무 사용자 선택 팝업(PC-LPO-0212).
 * 운전자 선택 / 근무자 / 자원 근무자 세 목록을 나란히 놓고 배정할 사람을 고른다.
 */
const store = inject(WorkScheduleKey)!
const { workUserPickOpen, driverRows, workUserRows, volunteerUserRows } = store

const driverGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const workerGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const volunteerGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const { onTableBuilt: onDriverBuilt } = useDialogGridRedraw(driverGridRef)
const { onTableBuilt: onWorkerBuilt } = useDialogGridRedraw(workerGridRef)
const { onTableBuilt: onVolunteerBuilt } = useDialogGridRedraw(volunteerGridRef)

const driverColumns: TabulatorGridColumn[] = [
  { title: '성명', field: 'name', hozAlign: 'center', minWidth: 80, widthGrow: 2 },
  { title: '운전', field: 'driving', cellType: 'checkbox', hozAlign: 'center', minWidth: 60, widthGrow: 1 },
]

const workerColumns: TabulatorGridColumn[] = [
  { title: '조', field: 'team', hozAlign: 'center', minWidth: 40, widthGrow: 1 },
  { title: '계급', field: 'rank', hozAlign: 'center', minWidth: 60, widthGrow: 1 },
  { title: '성명', field: 'name', hozAlign: 'center', minWidth: 70, widthGrow: 2 },
]

const volunteerColumns: TabulatorGridColumn[] = [
  { title: '계급', field: 'rank', hozAlign: 'center', minWidth: 60, widthGrow: 1 },
  { title: '성명', field: 'name', hozAlign: 'center', minWidth: 70, widthGrow: 2 },
]

async function onConfirm() {
  await dialog.alert({ title: '선택되었습니다.', btnCancel: '확인' })
  workUserPickOpen.value = false
}
</script>
