<template>
  <GenericDialog2 v-model:open="cuffsDetailDialogOpen" title="수갑 상세" :size="800" :show-close-button="true">
    <p :class="styles.legend">필수 입력 항목</p>

    <InfoTable :columns="2" popup>
      <InfoField for="cuffs-type">
        <template #label>수갑종류<span :class="styles.requiredDot" /></template>
        <SelectField
          id="cuffs-type"
          v-model="cuffsDetail.cuffsType"
          :options="cuffsTypeOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택하세요"
        />
      </InfoField>
      <InfoField for="cuffs-management-name">
        <template #label>장비관리명<span :class="styles.requiredDot" /></template>
        <InputField2 id="cuffs-management-name" v-model="cuffsDetail.managementName" size="sm" class="!space-y-0 flex-1" />
      </InfoField>

      <InfoField for="cuffs-holder">
        <template #label>사용자<span :class="styles.requiredDot" /></template>
        <InputField2 id="cuffs-holder" v-model="cuffsDetail.holder" size="sm" class="!space-y-0 flex-1" />
      </InfoField>
      <InfoField for="cuffs-manufacturer">
        <template #label>제조회사<span :class="styles.requiredDot" /></template>
        <InputField2 id="cuffs-manufacturer" v-model="cuffsDetail.manufacturer" size="sm" class="!space-y-0 flex-1" />
      </InfoField>

      <InfoField>
        <template #label>관리상태<span :class="styles.requiredDot" /></template>
        <RadioGroup v-model="cuffsDetail.status" class="flex gap-6">
          <RadioGroupItem
            v-for="(label, value) in cuffsStatusLabel"
            :key="value"
            :value="value"
            :label="label"
          />
        </RadioGroup>
      </InfoField>
      <InfoField for="cuffs-status-date">
        <template #label>상태일자<span :class="styles.requiredDot" /></template>
        <DatePicker id="cuffs-status-date" v-model="cuffsDetail.statusDate" size="sm" class="!space-y-0 flex-1" />
      </InfoField>

      <InfoField for="cuffs-delivery-date">
        <template #label>보급일자<span :class="styles.requiredDot" /></template>
        <DatePicker id="cuffs-delivery-date" v-model="cuffsDetail.deliveryDate" size="sm" class="!space-y-0 flex-1" />
      </InfoField>
      <InfoField for="cuffs-issued-date">
        <template #label>지급일자<span :class="styles.requiredDot" /></template>
        <DatePicker id="cuffs-issued-date" v-model="cuffsDetail.issuedDate" size="sm" class="!space-y-0 flex-1" />
      </InfoField>
      <InfoField for="cuffs-status-reason" full>
        <template #label>상태사유<span :class="styles.requiredDot" /></template>
        <InputField2 id="cuffs-status-reason" v-model="cuffsDetail.statusReason" size="sm" class="!space-y-0 flex-1" />
      </InfoField>

      <InfoField label="비고" full>
        <TextareaField v-model="cuffsDetail.note" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="cuffsDetailDialogOpen = false">닫기</Button>
      <Button type="button" variant="tertiary2" size="md" :disabled="cuffsDetail.id == null" @click="deleteCuffsDetail">삭제</Button>
      <Button type="button" variant="primary" size="md" @click="saveCuffsDetail">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { EquipmentListKey, cuffsTypeOptions, cuffsStatusLabel } from '../composable/PC-LPO-0701'
import styles from '@/components/custom/info-table/InfoTable.module.css'

const store = inject(EquipmentListKey)!
const { cuffsDetail, cuffsDetailDialogOpen, saveCuffsDetail, deleteCuffsDetail } = store
</script>
