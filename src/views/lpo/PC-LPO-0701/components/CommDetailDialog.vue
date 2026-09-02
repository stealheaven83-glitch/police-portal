<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { EquipmentListKey, commTypeOptions, locationOptions, commManageStatusLabel } from '../composable/PC-LPO-0701'
import styles from '@/components/custom/info-table/InfoTable.module.css'

const store = inject(EquipmentListKey)!
const { commDetail, commDetailDialogOpen, saveCommDetail, deleteCommDetail } = store
</script>

<template>
  <GenericDialog2 v-model:open="commDetailDialogOpen" title="통신장비 상세" :size="800" :show-close-button="true">
    <p :class="styles.legend">필수 입력 항목</p>

    <InfoTable :columns="2" popup>
      <InfoField for="comm-type">
        <template #label>통신장비 종류<span :class="styles.requiredDot" /></template>
        <SelectField
          id="comm-type"
          v-model="commDetail.commType"
          :options="commTypeOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>
      <InfoField for="comm-management-name">
        <template #label>장비관리명<span :class="styles.requiredDot" /></template>
        <InputField2 id="comm-management-name" v-model="commDetail.managementName" size="sm" class="!space-y-0 flex-1" />
      </InfoField>

      <InfoField for="comm-location">
        <template #label>배치장소<span :class="styles.requiredDot" /></template>
        <SelectField
          id="comm-location"
          v-model="commDetail.location"
          :options="locationOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>
      <InfoField for="comm-serial-number">
        <template #label>제조번호<span :class="styles.requiredDot" /></template>
        <InputField2 id="comm-serial-number" v-model="commDetail.serialNumber" size="sm" class="!space-y-0 flex-1" />
      </InfoField>

      <InfoField full>
        <template #label>관리상태<span :class="styles.requiredDot" /></template>
        <RadioGroup v-model="commDetail.manageStatus" class="flex gap-6">
          <RadioGroupItem
            v-for="(label, value) in commManageStatusLabel"
            :key="value"
            :value="value"
            :label="label"
          />
        </RadioGroup>
      </InfoField>

      <InfoField label="비고" full>
        <TextareaField v-model="commDetail.note" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="commDetailDialogOpen = false">취소</Button>
      <Button type="button" variant="tertiary2" size="md" :disabled="commDetail.id == null" @click="deleteCommDetail">삭제</Button>
      <Button type="button" variant="primary" size="md" @click="saveCommDetail">저장</Button>
    </template>
  </GenericDialog2>
</template>
