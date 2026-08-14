<script setup lang="ts">
import GenericDialog from '@/components/custom/dialog/GenericDialog.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import type { RequestRow } from './useRequestManagementForm'

interface Props {
  open: boolean
  row: RequestRow | null
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()
</script>

<template>
  <GenericDialog
    :open="open"
    title="요청 상세"
    :description="row ? `관리번호 ${row.id}` : undefined"
    size="lg"
    :show-cancel="false"
    confirm-text="닫기"
    @update:open="(v) => emit('update:open', v)"
    @confirm="emit('update:open', false)"
  >
    <div v-if="row" class="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div class="min-w-0 flex-1">
        <InfoTable :columns="1">
          <InfoField label="관리번호">{{ row.id }}</InfoField>
          <InfoField label="접수일자">{{ row.receivedAt }}</InfoField>
          <InfoField label="요청기간">{{ row.requestPeriodFrom }} ~ {{ row.requestPeriodTo }}</InfoField>
          <InfoField label="요청시간">{{ row.requestTime }}</InfoField>
          <InfoField label="주소(지번)">{{ row.addressJibun }}</InfoField>
          <InfoField label="주소(도로명)">{{ row.addressRoad }}</InfoField>
          <InfoField label="요청건수">{{ row.requestCount }}</InfoField>
          <InfoField label="순찰요청사항">{{ row.patrolRequest || '-' }}</InfoField>
          <InfoField label="순찰사유">{{ row.patrolReason || '-' }}</InfoField>
          <InfoField label="신고건수">{{ row.reportCount }}</InfoField>
          <InfoField label="핫스팟">{{ row.hotspot || '-' }}</InfoField>
          <InfoField label="경력수요형태">{{ row.demandType || '-' }}</InfoField>
          <InfoField label="경력수요인원">{{ row.demandPersonnel }}</InfoField>
          <InfoField label="이메일">{{ row.email || '-' }}</InfoField>
          <InfoField label="등록자">{{ row.registrant }}</InfoField>
          <InfoField label="등록일">{{ row.registeredAt }}</InfoField>
        </InfoTable>
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <span class="text-[1.4rem] font-semibold text-[var(--Text-body_0)]">위치 지도</span>
        <div
          class="flex min-h-[24rem] flex-1 items-center justify-center rounded-[0.8rem] border border-dashed border-[var(--Border_gray02)] bg-[var(--Background-gray01)] text-[1.4rem] text-[var(--Text-body_disable)]"
          role="img"
          aria-label="지도 컴포넌트 없음"
        >
          컴포넌트 없음
        </div>
      </div>
    </div>
  </GenericDialog>
</template>
