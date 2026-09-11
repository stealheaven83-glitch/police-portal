<template>
  <GenericDialog2
    v-model:open="open"
    title="출동사건 상세"
    :size="1000"
    :show-close-button="true"
  >
    <InfoTable :columns="2" popup size="120">
      <InfoField label="접수번호">{{ detail?.receiptNo }}</InfoField>
      <InfoField label="사건번호">{{ detail?.caseNo }}</InfoField>
      <InfoField label="접수일시">{{ detail?.receivedAt }}</InfoField>
      <InfoField label="종결일시">{{ detail?.closedAt }}</InfoField>
      <InfoField label="출동자">{{ detail?.dispatcher }}</InfoField>
      <InfoField label="사건종별">{{ detail?.caseType }}</InfoField>
      <InfoField label="신고자">{{ detail?.reporter }}</InfoField>
      <InfoField label="연락처">{{ detail?.contact }}</InfoField>
      <InfoField label="신고위치" full>{{ detail?.reportLocation }}</InfoField>
      <InfoField label="처리결과" full>{{
        detail?.processingResult
      }}</InfoField>
    </InfoTable>

    <div class="pop-title-sub mb-2"><h2>출동요소목록</h2></div>
    <TableWrapper
      :columns="dispatchElementColumns"
      :items="dispatchElementItems"
      :show-pagination="false"
    />
    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false"
        >닫기</Button
      >
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import GenericDialog2 from "@/components/custom/dialog/GenericDialog2.vue";
import { Button } from "@/components/custom/button";
import { InfoTable, InfoField } from "@/components/custom/info-table";
import TableWrapper from "@/components/custom/table/TableWrapper.vue";
import type { DispatchAllowanceDetail } from "../composable/PC-LPO-0501";
import { computed } from "vue";

defineOptions({ name: "DispatchAllowanceDetailDialog" });

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  detail: DispatchAllowanceDetail | null;
}>();

const dispatchElementColumns = [
  { key: "dispatchElementName", label: "출동요소명", width: "33.3%" },
  {
    key: "arrivedAt",
    label: "도착일시",
    width: "33.3%",
  },
  { key: "dispatcher", label: "출동자", width: "33.3%" },
];

const dispatchElementItems = computed(() => [
  {
    dispatchElementName: "약수지구대",
    arrivedAt: "2026-08-08 14:00",
    dispatcher: "홍길동, 이기소",
  },
  {
    dispatchElementName: "약수지구대",
    arrivedAt: "2026-08-08 14:00",
    dispatcher: "홍길동, 이기소",
  },
  {
    dispatchElementName: "약수지구대",
    arrivedAt: "2026-08-08 14:00",
    dispatcher: "홍길동, 이기소",
  },
  {
    dispatchElementName: "약수지구대",
    arrivedAt: "2026-08-08 14:00",
    dispatcher: "홍길동, 이기소",
  },
]);
</script>
