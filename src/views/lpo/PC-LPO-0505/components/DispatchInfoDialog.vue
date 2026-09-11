<template>
  <GenericDialog2 v-model:open="dispatchInfoOpen" title="출동사건정보" :size="1320">
    <div class="lp-pane-box lp-pane-box-tall">
      <section class="lp-pane lp-pane-list" aria-labelledby="case-receipt-heading">
        <h3 id="case-receipt-heading" class="lp-pane-title">접수내용</h3>
        <div class="lp-pane-wrap detail-scroll">
          <TabulatorGrid
            ref="gridRef"
            class="lp-grid-multiline"
            :columns="columns"
            :data="receiptRows"
            :row-class="rowClass"
            height="100%"
            placeholder="접수내용이 없습니다"
            @row-click="onRowClick"
            @table-built="onTableBuilt"
          />
        </div>
      </section>

      <section class="lp-pane" aria-labelledby="case-code-heading">
        <h3 id="case-code-heading" class="lp-pane-title">접수코드 : C1</h3>
        <div class="lp-pane-wrap detail-scroll">
          <DispatchInfoPanel :units="dispatchUnits" />
        </div>
      </section>
    </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="dispatchInfoOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onDeleteCase">출동수당 사건삭제</Button>
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
const store = inject(DispatchSummaryDialogKey)!
const { dispatchInfoOpen, receiptRows, pickedReceiptId, dispatchUnits } = store

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const { onTableBuilt } = useDialogGridRedraw(gridRef)

const columns: TabulatorGridColumn[] = [
  { title: '접수번호', field: 'receiptNo', hozAlign: 'center', width: 160 },
  {
    title: '신고내용',
    field: 'content',
    hozAlign: 'left',
    minWidth: 200,
    widthGrow: 1,
    variableHeight: true,
    cssClass: 'lp-grid-multiline-cell',
    formatter: (cell: { getValue: () => unknown }) => {
      const body = document.createElement('p')
      body.className = 'lp-pre-line'
      body.textContent = String(cell.getValue() ?? '')
      return body
    },
  },
]

function rowClass(row: ReceiptRow) {
  return row.id === pickedReceiptId.value ? 'lp-grid-active-row' : undefined
}

function onRowClick(_event: unknown, row: { getData: () => ReceiptRow }) {
  pickedReceiptId.value = row.getData().id
}

async function onDeleteCase() {
  if (!pickedReceiptId.value) {
    await dialog.alert({ title: '삭제할 접수건을 선택해 주세요.', btnCancel: '확인' })
    return
  }
  const result = await dialog.confirm({ title: '출동수당 사건을 삭제하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}
</script>
