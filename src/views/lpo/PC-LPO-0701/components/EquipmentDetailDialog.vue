<template>
  <GenericDialog2 v-model:open="detailDialogOpen" title="기동장비 상세" :size="800" :show-close-button="true">
    <p :class="styles.legend">필수 입력 항목</p>

    <InfoTable :columns="2">
      <!-- 라디오/버튼처럼 값 영역에 컨트롤이 여러 개면 for 를 주지 않는다(InfoField 가 role="group" 으로 묶는다) -->
      <InfoField full>
        <template #label>기동장비 구분<span :class="styles.requiredDot" /></template>
        <RadioGroup v-model="detail.vehicleType" class="flex gap-6">
          <RadioGroupItem v-for="(label, value) in vehicleTypeLabel" :key="value" :value="value" :label="label" />
        </RadioGroup>
      </InfoField>

      <InfoField for="equip-plate-number" full>
        <template #label>차량번호<span :class="styles.requiredDot" /></template>
        <InputField2
          id="equip-plate-number"
          v-model="detail.plateNumber"
          size="sm"
          class="!space-y-0 flex-1"
          :disabled="isPlateNumberDisabled"
        />
        <span v-if="!isVehicleRestricted && !detail.isSaved" :class="styles.hint">저장 이후에는 차량번호는 수정할 수 없습니다.</span>
      </InfoField>

      <InfoField for="equip-management-name">
        <template #label>장비관리명<span :class="styles.requiredDot" /></template>
        <InputField2 id="equip-management-name" v-model="detail.managementName" size="sm" class="!space-y-0 flex-1" />
      </InfoField>
      <InfoField for="equip-car-type">
        <template #label>차량유형<span :class="styles.requiredDot" /></template>
        <SelectField
          id="equip-car-type"
          v-model="detail.carType"
          :options="carTypeOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
          :disabled="isVehicleRestricted"
        />
      </InfoField>

      <InfoField for="equip-location">
        <template #label>배치장소<span :class="styles.requiredDot" /></template>
        <SelectField
          id="equip-location"
          v-model="detail.location"
          :options="locationOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>
      <InfoField for="equip-manufacturer">
        <template #label>차량제조사<span :class="styles.requiredDot" /></template>
        <InputField2
          id="equip-manufacturer"
          v-model="detail.manufacturer"
          size="sm"
          class="!space-y-0 flex-1"
          :disabled="isVehicleRestricted"
        />
      </InfoField>

      <InfoField for="equip-model">
        <template #label>차종명<span :class="styles.requiredDot" /></template>
        <InputField2 id="equip-model" v-model="detail.model" size="sm" class="!space-y-0 flex-1" />
      </InfoField>
      <InfoField for="equip-year">
        <template #label>차량연식<span :class="styles.requiredDot" /></template>
        <InputField2
          id="equip-year"
          v-model="detail.year"
          size="sm"
          class="!space-y-0 flex-1"
          :disabled="isVehicleRestricted"
        />
      </InfoField>

      <InfoField label="112차량정보" for="equip-info112" full>
        <SelectField
          id="equip-info112"
          v-model="detail.info112"
          :options="info112Options"
          size="sm"
          trigger-class="w-60"
          class="!space-y-0 flex-1"
          placeholder="선택하세요"
          :disabled="isVehicleRestricted"
        />
      </InfoField>

      <InfoField label="임시차량" full>
        <div class="group-gap3">
          <InputField2 size="sm" class="!space-y-0 w-50" readonly />
          <Button type="button" variant="secondary" size="sm" class="min-w-21" @click="openVehicle112Dialog">차량조회</Button>
        </div>
      </InfoField>

      <InfoField label="비고" full>
        <TextareaField v-model="detail.note" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="detailDialogOpen = false">닫기</Button>
      <Button type="button" variant="tertiary2" size="md" :disabled="detail.id == null" @click="deleteDetail">삭제</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { EquipmentListKey, vehicleTypeLabel, carTypeOptions, locationOptions, info112Options } from '../composable/PC-LPO-0701'
import styles from '@/components/custom/info-table/InfoTable.module.css'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()


const store = inject(EquipmentListKey)!
const { detail, detailDialogOpen, saveDetail, deleteDetail, openVehicle112Dialog } = store

/** 순찰차 외(오토바이/자전거)에는 없는 차량 전용 항목들 */
const isVehicleRestricted = computed(() => detail.vehicleType !== 'patrol')
const isPlateNumberDisabled = computed(() => isVehicleRestricted.value || detail.isSaved)

async function onSave() {
  saveDetail()
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
}
</script>
