<template>
  <GenericDialog2
    v-model:open="pendingDialogOpen"
    title="미도착 · 미종결 목록"
    :size="700"
    :height="480"
    :show-close-button="true"
  >
    <div class="pop-body">
      <TabulatorGrid
        :columns="columns"
        :data="pendingRows"
        class="flex-1"
        height="100%"
        placeholder="미도착 · 미종결 신고가 없습니다"
        @row-click="onRowClick"
      />
    </div>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { JudgementSurveyKey, type Report112Row } from '../composable/PM-PUB-0201'

const store = inject(JudgementSurveyKey)!
const { pendingDialogOpen, pendingRows, applyReport112 } = store

const columns: TabulatorGridColumn[] = [
  { title: '접수번호', field: 'receiptNo', width: 170, hozAlign: 'center' },
  { title: '접수일시', field: 'receivedAt', width: 160, hozAlign: 'center' },
  { title: '진행상태', field: 'progress', width: 100, hozAlign: 'center' },
  { title: '장소', field: 'place', hozAlign: 'center' },
]

/** 여기서 고른 신고도 본문에 그대로 옮긴다. 두 팝업을 같이 닫는다 */
function onRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as Report112Row
  applyReport112(data)
  pendingDialogOpen.value = false
}
</script>
