<template>
  <p class="lp-heading-md">접수코드 : C1</p>
  <InfoTable :columns="2" popup :size="100">
    <InfoField label="접수번호">08202660913456</InfoField>
    <InfoField label="사건번호">101</InfoField>
    <InfoField label="접수일시">2026-07-06 00:57</InfoField>
    <InfoField label="종결시간">2026-07-06 00:57</InfoField>
    <InfoField label="출동자">홍길동, 차범근</InfoField>
    <InfoField label="종결자">홍길동</InfoField>
    <InfoField label="신고자">홍길동</InfoField>
    <InfoField label="연락처">01012345678</InfoField>
    <InfoField label="신고위치" full>부산광역시 중구 비프광장로 36 부산극장</InfoField>
    <InfoField label="처리결과" full>요구조자 보호자에게 인계하여 마감</InfoField>
    <InfoField label="증빙구분" full>[기타] 112신고사건 내역서 등</InfoField>
  </InfoTable>

  <p class="lp-heading-md lp-table-gap">출동요소목록</p>
  <TabulatorGrid
    ref="gridRef"
    :columns="columns"
    :data="units"
    height="180px"
    placeholder="출동요소가 없습니다"
    @table-built="onTableBuilt"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import type { DispatchUnitRow } from '../composable/dialogs'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'

/**
 * 출동사건 상세 내용 — 출동사건정보 팝업(PC-LPO-0510)과
 * 타직원 출동수당 신청 팝업(PC-LPO-0509)의 오른쪽 칸이 같은 내용이라 따로 뺐다.
 */
defineProps<{ units: DispatchUnitRow[] }>()

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const { onTableBuilt } = useDialogGridRedraw(gridRef)

const columns: TabulatorGridColumn[] = [
  { title: '출동요소명', field: 'unit', hozAlign: 'center', minWidth: 110, widthGrow: 1 },
  { title: '도착일시', field: 'arrivedAt', hozAlign: 'center', minWidth: 150, widthGrow: 1 },
  { title: '출동자', field: 'members', hozAlign: 'center', minWidth: 130, widthGrow: 1 },
]
</script>
