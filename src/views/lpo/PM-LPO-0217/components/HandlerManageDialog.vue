<template>
  <GenericDialog2 v-model:open="handlerOpen" title="처리자 관리" :size="720">
    <LayoutSplite :count="2">
      <template #layout-1>
        <LayoutHeader title="동행 근무자 목록" />
        <TabulatorGrid
          ref="companionGridRef"
          :columns="columns"
          :data="companionRows"
          height="280px"
          placeholder="동행 근무자가 없습니다"
          @table-built="onCompanionBuilt"
        />
      </template>
      <template #layout-2>
        <LayoutHeader title="근무자 목록" />
        <TabulatorGrid
          ref="workerGridRef"
          :columns="columns"
          :data="handlerRows"
          height="280px"
          placeholder="근무자가 없습니다"
          @table-built="onWorkerBuilt"
        />
      </template>
    </LayoutSplite>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="handlerOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { toast } from 'vue-sonner'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutHeader from '@/components/custom/content-layout/layoutHeader.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { WorkLogKey } from '../composable/PM-LPO-0217'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'

/** 처리자 관리 팝업(PM-LPO-0221) — 근무자 목록에서 고른 사람이 동행 근무자가 된다 */
const store = inject(WorkLogKey)!
const { handlerOpen, companionRows, handlerRows, confirmHandlers } = store

const companionGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const workerGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const { onTableBuilt: onCompanionBuilt } = useDialogGridRedraw(companionGridRef)
const { onTableBuilt: onWorkerBuilt } = useDialogGridRedraw(workerGridRef)

const columns: TabulatorGridColumn[] = [
  { title: '계급', field: 'rank', hozAlign: 'center', minWidth: 70, widthGrow: 1 },
  { title: '성명', field: 'name', hozAlign: 'center', minWidth: 80, widthGrow: 1 },
]

function onSave() {
  confirmHandlers()
  toast.success('저장되었습니다.')
}
</script>
