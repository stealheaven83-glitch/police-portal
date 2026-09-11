<template>
  <GenericDialog2 v-model:open="otherApplyOpen" title="타직원 출동수당 신청" :size="1320">
    <div class="lp-pane-box">
      <section class="lp-pane" aria-labelledby="apply-receipt-heading">
        <h3 id="apply-receipt-heading" class="lp-pane-title">접수내용</h3>
        <div class="lp-pane-wrap">
          <TabulatorGrid
            ref="gridRef"
            :columns="columns"
            :data="receiptRows"
            height="400px"
            placeholder="접수내용이 없습니다"
            @row-click="onRowClick"
            @table-built="onTableBuilt"
          />
        </div>
      </section>

      <section class="lp-pane" aria-labelledby="apply-code-heading">
        <h3 id="apply-code-heading" class="lp-pane-title">접수코드 : C1</h3>
        <div class="lp-pane-wrap">
          <DispatchInfoPanel :units="dispatchUnits" />
        </div>
      </section>
    </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="otherApplyOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onApprove">타 직원 신청승인</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import DispatchInfoPanel from './DispatchInfoPanel.vue'
import { DispatchSummaryDialogKey, type ReceiptRow } from '../composable/dialogs'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/** 타직원 출동수당 신청 팝업(PC-LPO-0509) — 왼쪽 접수건을 고르면 오른쪽에 상세가 뜬다 */
const store = inject(DispatchSummaryDialogKey)!
const { otherApplyOpen, receiptRows, pickedReceiptId, dispatchUnits } = store

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const { onTableBuilt } = useDialogGridRedraw(gridRef)

const columns: TabulatorGridColumn[] = [
  { title: '접수번호', field: 'receiptNo', hozAlign: 'center', minWidth: 130, widthGrow: 2 },
  { title: '신고내용', field: 'reportNo', hozAlign: 'center', minWidth: 80, widthGrow: 1 },
  { title: '근무일자', field: 'workDate', hozAlign: 'center', minWidth: 100, widthGrow: 1 },
  { title: '신청자', field: 'applicant', hozAlign: 'center', minWidth: 100, widthGrow: 1 },
]

function onRowClick(_event: unknown, row: { getData: () => ReceiptRow }) {
  pickedReceiptId.value = row.getData().id
}

async function onApprove() {
  if (!pickedReceiptId.value) {
    await dialog.alert({ title: '신청할 접수건을 선택해 주세요.', btnCancel: '확인' })
    return
  }
  await dialog.alert({ title: '타 직원 신청이 승인되었습니다.', btnCancel: '확인' })
  otherApplyOpen.value = false
}
</script>
