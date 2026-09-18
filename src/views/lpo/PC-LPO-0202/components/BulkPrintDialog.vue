<template>
  <GenericDialog2 v-model:open="bulkPrintOpen" title="甲지 일괄 출력" :size="560">
    <p class="lp-block-title lp-note-text2 ver1 lp-notice-detail-actions2">* 甲지 인쇄는 최대 30일치 가능합니다.</p>
      <DateRangePicker
        v-model:from="bulkPrintFrom"
        v-model:to="bulkPrintTo"
        label="근무기간"
        from-label="근무기간 시작일"
        to-label="근무기간 종료일"
        size="sm"
        input-class="w-40"
      />

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="bulkPrintOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onPrint">일괄인쇄</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { DateRangePicker } from '@/components/custom/datepicker'
import { WorkScheduleKey } from '../composable/useWorkSchedule'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/** 甲지 일괄 출력 팝업(PC-LPO-0211) */
const store = inject(WorkScheduleKey)!
const { bulkPrintOpen, bulkPrintFrom, bulkPrintTo } = store

async function onPrint() {
  if (!bulkPrintFrom.value || !bulkPrintTo.value) {
    await dialog.alert({ title: '근무기간을 입력해 주세요.', btnCancel: '확인' })
    return
  }
  // 실제 인쇄는 개발팀 몫 — 화면에서는 브라우저 인쇄만 띄운다
  window.print()
  bulkPrintOpen.value = false
}
</script>
