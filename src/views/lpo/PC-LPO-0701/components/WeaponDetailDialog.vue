<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { EquipmentListKey, gunTypeOptions, gunSerialOptions, locationOptions } from '../composable/PC-LPO-0701'
import styles from '../style/PC-LPO-0701.module.css'

const store = inject(EquipmentListKey)!
const { weaponDetail, weaponDetailDialogOpen, addWeaponHandler, saveWeaponDetail, deleteWeaponDetail } = store
</script>

<template>
  <GenericDialog2 v-model:open="weaponDetailDialogOpen" title="무기" :size="700" :show-close-button="true">
    <p :class="styles.legend">• 필수 입력 항목</p>

    <InfoTable :columns="2">
      <InfoField for="weapon-gun-type">
        <template #label>총기종류<span :class="styles.requiredDot" /></template>
        <SelectField
          id="weapon-gun-type"
          v-model="weaponDetail.gunType"
          :options="gunTypeOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택하세요"
        />
      </InfoField>
      <InfoField for="weapon-management-name">
        <template #label>장비관리명<span :class="styles.requiredDot" /></template>
        <InputField2 id="weapon-management-name" v-model="weaponDetail.managementName" size="sm" class="!space-y-0 flex-1" />
      </InfoField>

      <InfoField for="weapon-serial-number">
        <template #label>총번<span :class="styles.requiredDot" /></template>
        <SelectField
          id="weapon-serial-number"
          v-model="weaponDetail.serialNumber"
          :options="gunSerialOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택하세요"
        />
      </InfoField>
      <InfoField for="weapon-introduced-date">
        <template #label>도입일자<span :class="styles.requiredDot" /></template>
        <DatePicker id="weapon-introduced-date" v-model="weaponDetail.introducedDate" size="sm" class="!space-y-0 flex-1" />
      </InfoField>

      <InfoField for="weapon-location" full>
        <template #label>배치장소<span :class="styles.requiredDot" /></template>
        <SelectField
          id="weapon-location"
          v-model="weaponDetail.location"
          :options="locationOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택하세요"
        />
      </InfoField>

      <InfoField label="비고" full layout="column">
        <TextareaField v-model="weaponDetail.note" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
      </InfoField>

      <InfoField label="담당자" full layout="column">
        <div :class="styles.handlerTableWrap">
          <table :class="styles.handlerTable">
            <caption class="sr-only">담당자 목록 — 번호, 담당자</caption>
            <thead>
              <tr>
                <th scope="col">번호</th>
                <th scope="col">담당자</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(handler, index) in weaponDetail.handlers" :key="handler.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <InputField2 v-model="handler.name" size="sm" class="!space-y-0" placeholder="담당자명 입력" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div :class="styles.handlerActions">
          <Button type="button" variant="secondary" size="sm" class="w-25" @click="addWeaponHandler">담당자추가</Button>
        </div>
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" class="w-25" variant="tertiary2" size="md" @click="weaponDetailDialogOpen = false">닫기</Button>
      <Button type="button" class="w-25" variant="tertiary2" size="md" :disabled="weaponDetail.id == null" @click="deleteWeaponDetail">삭제</Button>
      <Button type="button" class="w-25" variant="primary" size="md" @click="saveWeaponDetail">저장</Button>
    </template>
  </GenericDialog2>
</template>
