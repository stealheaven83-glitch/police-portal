<template>
  <GenericDialog2 v-model:open="dispatchOpen" title="출동사건정보" :size="640" :show-cancel="false" confirm-text="닫기" @confirm="dispatchOpen = false">
    <InfoTable :columns="1" popup :size="110">
      <InfoField label="접수번호">08202660920301</InfoField>
      <InfoField label="신고내용">
        <p v-for="(line, i) in reportLines" :key="i" class="lp-duty-line">{{ line }}</p>
      </InfoField>
    </InfoTable>

    <p class="lp-heading-md lp-table-gap">접수코드 : C1</p>
    <InfoTable :columns="2" popup :size="110">
      <InfoField label="접수번호">08202660913456</InfoField>
      <InfoField label="사건번호">12345</InfoField>
      <InfoField label="접수일시">2026-07-06 00:57</InfoField>
      <InfoField label="종결일시">2026-07-06 00:57</InfoField>
      <InfoField label="출동자">홍길동 고길동 홍금보 박희순</InfoField>
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
      :data="dispatchUnits"
      height="200px"
      placeholder="출동요소가 없습니다"
      @table-built="onTableBuilt"
    />
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { WorkLogKey } from '../composable/PM-LPO-0217'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'

/** 출동사건정보 팝업(PM-LPO-0220) — 근무일지 행의 '보기' 버튼에서 연다 */
const store = inject(WorkLogKey)!
const { dispatchOpen, dispatchUnits } = store

const reportLines = [
  '[소방 공동대응 요청접수]',
  '[신고정보]',
  '1. 신고내용 : 기타 경찰의 인적 물적……',
  '2. 신고자전화번호: 02000000',
  '3. 발생주소 : 서울특별시 중구',
  '….',
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const { onTableBuilt } = useDialogGridRedraw(gridRef)

const columns: TabulatorGridColumn[] = [
  { title: '출동요소명', field: 'unit', hozAlign: 'center', minWidth: 120, widthGrow: 1 },
  { title: '도착일시', field: 'arrivedAt', hozAlign: 'center', minWidth: 160, widthGrow: 1 },
  { title: '출동자', field: 'members', hozAlign: 'center', minWidth: 160, widthGrow: 1 },
]
</script>
