<template>
  <GenericDialog2 v-model:open="handlerOpen" title="처리자 관리" :size="800">
    <LayoutSplite :count="2" class="lp-pop-handler-split">
      <template #layout-1>
        <!-- 시안 Popup Grid Title — 17px/600, 좌우 20 -->
        <LayoutHeader title="동행 근무자 목록" class="lp-pop-grid-head" />
        <!-- height 를 비우면 행 수만큼만 높이를 잡는다(고정값이면 빈 여백이 남는다) -->
        <TabulatorGrid
          ref="companionGridRef"
          class="lp-pop-handler-grid"
          :columns="columns"
          :data="companionRows"
          height=""
          placeholder="동행 근무자가 없습니다"
          @table-built="onCompanionBuilt"
        />
      </template>
      <template #layout-2>
        <LayoutHeader title="근무자 목록" class="lp-pop-grid-head" />
        <TabulatorGrid
          ref="workerGridRef"
          class="lp-pop-handler-grid"
          :columns="columns"
          :data="handlerRows"
          height=""
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
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutHeader from '@/components/custom/content-layout/layoutHeader.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useDialog } from '@/composable/dialog/dialog'
import { WorkLogKey } from '../composable/PM-LPO-0217'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'

const dialog = useDialog()

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

/** 설계서 A01 */
async function onSave() {
  const { confirmed } = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!confirmed) return
  confirmHandlers()
}
</script>
