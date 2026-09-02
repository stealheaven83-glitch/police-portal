<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import Stepper from '@/components/custom/input/Stepper.vue'
import { EquipmentListKey } from '../composable/PC-LPO-0701'
import styles from '@/components/custom/info-table/InfoTable.module.css'

const store = inject(EquipmentListKey)!
const { etcDetail, etcDetailDialogOpen, saveEtcDetail, deleteEtcDetail } = store
</script>

<template>
  <GenericDialog2 v-model:open="etcDetailDialogOpen" title="기타 상세" :size="800" :show-close-button="true">
    <p :class="styles.legend">필수 입력 항목</p>

    <InfoTable :columns="2" popup>
      <InfoField for="etc-type">
        <template #label>장비종류<span :class="styles.requiredDot" /></template>
        <InputField2 id="etc-type" v-model="etcDetail.etcType" size="sm" class="!space-y-0 flex-1" />
      </InfoField>
      <InfoField for="etc-management-name">
        <template #label>장비관리명<span :class="styles.requiredDot" /></template>
        <InputField2 id="etc-management-name" v-model="etcDetail.managementName" size="sm" class="!space-y-0 flex-1" />
      </InfoField>

      <InfoField>
        <template #label>기타보유수량<span :class="styles.requiredDot" /></template>
        <Stepper v-model="etcDetail.stock" :min="0" label="보유수량" />
      </InfoField>
      
      <InfoField />

      <InfoField label="비고" full>
        <TextareaField v-model="etcDetail.note" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="etcDetailDialogOpen = false">닫기</Button>
      <Button type="button" variant="tertiary2" size="md" :disabled="etcDetail.id == null" @click="deleteEtcDetail">삭제</Button>
      <Button type="button" variant="primary" size="md" @click="saveEtcDetail">저장</Button>
    </template>
  </GenericDialog2>
</template>
