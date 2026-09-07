<template>
  <GenericDialog2
    v-model:open="dispatchInfoOpen"
    title="출동사건정보"
    :size="640"
    :show-cancel="false"
    confirm-text="닫기"
    @confirm="dispatchInfoOpen = false"
  >
    <DispatchInfoPanel :units="dispatchUnits" />
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import DispatchInfoPanel from './DispatchInfoPanel.vue'
import { DispatchSummaryDialogKey } from '../composable/dialogs'

/** 출동사건정보 팝업(PC-LPO-0510) */
const store = inject(DispatchSummaryDialogKey)!
const { dispatchInfoOpen, dispatchUnits } = store
</script>
