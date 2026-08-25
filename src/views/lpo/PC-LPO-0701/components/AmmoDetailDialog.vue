<script setup lang="ts">
import { computed, inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import Stepper from '@/components/custom/input/Stepper.vue'
import { EquipmentListKey, ammoUnitOptions } from '../composable/PC-LPO-0701'
import styles from '../style/PC-LPO-0701.module.css'

const store = inject(EquipmentListKey)!
const { ammoDetail, ammoDetailDialogOpen, saveAmmoDetail, deleteAmmoDetail } = store

const unitLabel = computed(() => ammoUnitOptions.find((o) => o.value === ammoDetail.unit)?.label ?? '')
</script>

<template>
  <GenericDialog2 v-model:open="ammoDetailDialogOpen" title="탄약" :size="800" :show-close-button="true">
    <p :class="styles.legend">• 필수 입력 항목</p>

    <InfoTable :columns="2">
      <InfoField for="ammo-management-name">
        <template #label>장비관리명<span :class="styles.requiredDot" /></template>
        <InputField2 id="ammo-management-name" v-model="ammoDetail.managementName" size="sm" class="!space-y-0 flex-1" />
      </InfoField>
      <InfoField for="ammo-unit">
        <template #label>단위<span :class="styles.requiredDot" /></template>
        <SelectField
          id="ammo-unit"
          v-model="ammoDetail.unit"
          :options="ammoUnitOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택하세요"
        />
      </InfoField>

      <InfoField>
        <template #label>정 수량<span :class="styles.requiredDot" /></template>
        <div :class="styles.tempVehicleRow">
          <Stepper v-model="ammoDetail.stock" :min="0" label="정 수량" />
          <span v-if="unitLabel">{{ unitLabel }}</span>
        </div>
      </InfoField>
      <InfoField>
        <template #label>현 수량<span :class="styles.requiredDot" /></template>
        <div :class="styles.tempVehicleRow">
          <Stepper v-model="ammoDetail.current" :min="0" label="현 수량" />
          <span v-if="unitLabel">{{ unitLabel }}</span>
        </div>
      </InfoField>

      <InfoField label="비고" full layout="column">
        <TextareaField v-model="ammoDetail.note" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" class="w-25" variant="tertiary2" size="md" @click="ammoDetailDialogOpen = false">닫기</Button>
      <Button type="button" class="w-25" variant="tertiary2" size="md" :disabled="ammoDetail.id == null" @click="deleteAmmoDetail">삭제</Button>
      <Button type="button" class="w-25" variant="primary" size="md" @click="saveAmmoDetail">저장</Button>
    </template>
  </GenericDialog2>
</template>
