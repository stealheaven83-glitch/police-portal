<template>
  <GenericDialog2 v-model:open="open" title="출동사건정보" :size="800" show-close-button>
    <InfoTable :columns="1" popup size="120">
      <InfoField label="접수번호" full>{{ info.receiptNo }}</InfoField>
      <!-- 신고내용은 줄바꿈이 그대로 보여야 한다(시안: 접수/신고정보가 여러 줄) -->
      <InfoField label="신고내용" full class="lp-pre-line">{{ info.report }}</InfoField>
    </InfoTable>

    <div class="pop-title-sub"><h2>접수코드 : {{ info.receiptCode }}</h2></div>
    <InfoTable :columns="2" popup size="120">
      <InfoField label="접수번호">{{ info.caseReceiptNo }}</InfoField>
      <InfoField label="사건번호">{{ info.caseNo }}</InfoField>
      <InfoField label="접수일시">{{ info.receivedAt }}</InfoField>
      <InfoField label="종결일시">{{ info.closedAt }}</InfoField>
      <InfoField label="출동자">{{ info.responders }}</InfoField>
      <InfoField label="종결자">{{ info.closer }}</InfoField>
      <InfoField label="신고자">{{ info.reporter }}</InfoField>
      <InfoField label="연락처">{{ info.contact }}</InfoField>
      <InfoField label="신고위치" full>{{ info.location }}</InfoField>
      <InfoField label="처리결과" full>{{ info.result }}</InfoField>
      <InfoField label="증빙구분" full>{{ info.evidence }}</InfoField>
    </InfoTable>

    <div class="pop-title-sub mb-2"><h2>출동요소목록</h2></div>
    <TableWrapper
      :columns="elementColumns"
      :items="info.elements"
      :show-pagination="false"
    />

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">닫기</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoField, InfoTable } from '@/components/custom/info-table'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { elementColumns, type DispatchCaseInfo } from '../composable/PM-LPO-0109'

/**
 * 출동사건정보 팝업(PM-LPO-0110).
 * 출동수당 목록(PM-LPO-0109)에서 접수번호를 누르면 열린다 — 같은 컴포넌트를 쓰는 화면군이라
 * 라우트는 둘 다 PM-LPO-0109.vue 를 가리키고 useAutoTrigger 가 화면ID를 맞춘다.
 * Figma 13116:103180.
 */
interface Props {
  info: DispatchCaseInfo
}

defineProps<Props>()

const open = defineModel<boolean>('open', { default: false })
</script>
