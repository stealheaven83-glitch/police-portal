<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import Stepper from '@/components/custom/input/Stepper.vue'
import { EquipmentListKey, etcTypeOptions } from '../composable/PC-LPO-0701'
import styles from '../style/PC-LPO-0701.module.css'

const store = inject(EquipmentListKey)!
const { etcDetail, etcDetailDialogOpen, saveEtcDetail, deleteEtcDetail } = store
</script>

<template>
  <GenericDialog2 v-model:open="etcDetailDialogOpen" title="기타" :size="700" :show-close-button="true">
    <p :class="styles.legend">• 필수 입력 항목</p>

    <InfoTable :columns="2">
      <InfoField for="etc-type">
        <template #label>장비유형<span :class="styles.requiredDot" /></template>
        <SelectField
          id="etc-type"
          v-model="etcDetail.etcType"
          :options="etcTypeOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택하세요"
        />
      </InfoField>
      <InfoField for="etc-management-name">
        <template #label>장비관리명<span :class="styles.requiredDot" /></template>
        <InputField2 id="etc-management-name" v-model="etcDetail.managementName" size="sm" class="!space-y-0 flex-1" />
      </InfoField>

      <InfoField full>
        <template #label>보유수량<span :class="styles.requiredDot" /></template>
        <Stepper v-model="etcDetail.stock" :min="0" label="보유수량" />
      </InfoField>

      <InfoField label="비고" full layout="column">
        <TextareaField v-model="etcDetail.note" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" class="w-25" variant="tertiary2" size="md" @click="etcDetailDialogOpen = false">닫기</Button>
      <Button type="button" class="w-25" variant="tertiary2" size="md" :disabled="etcDetail.id == null" @click="deleteEtcDetail">삭제</Button>
      <Button type="button" class="w-25" variant="primary" size="md" @click="saveEtcDetail">저장</Button>
    </template>
  </GenericDialog2>
</template>
