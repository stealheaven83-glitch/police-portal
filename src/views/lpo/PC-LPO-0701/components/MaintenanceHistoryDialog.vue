<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { EquipmentListKey, maintenanceTypeOptions } from '../composable/PC-LPO-0701'
import styles from '../style/PC-LPO-0701.module.css'

const store = inject(EquipmentListKey)!
const { maintenanceDialogOpen, maintenanceTitle, maintenanceRows, addMaintenanceRow, saveMaintenanceHistory } = store
</script>

<template>
  <GenericDialog2
    v-model:open="maintenanceDialogOpen"
    :title="`장비유지보수 이력(${maintenanceTitle})`"
    :size="700"
    :show-close-button="true"
  >
    <div :class="styles.handlerTableWrap">
      <table :class="styles.handlerTable">
        <caption class="sr-only">장비유지보수 이력 — 번호, 유지보수, 유지보수내용, 유지보수일자</caption>
        <thead>
          <tr>
            <th scope="col">번호</th>
            <th scope="col">유지보수</th>
            <th scope="col">유지보수내용</th>
            <th scope="col">유지보수일자</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in maintenanceRows" :key="record.id">
            <td>{{ maintenanceRows.length - index }}</td>
            <td>
              <SelectField
                v-model="record.type"
                :options="maintenanceTypeOptions"
                size="sm"
                trigger-class="w-full"
                class="!space-y-0"
                placeholder="선택"
              />
            </td>
            <td>
              <InputField2 v-model="record.content" size="sm" class="!space-y-0" />
            </td>
            <td>
              <DatePicker v-model="record.date" size="sm" class="!space-y-0" />
            </td>
          </tr>
          <tr v-if="!maintenanceRows.length">
            <td colspan="4" class="py-10 text-center text-[var(--Text-body_disable)]">등록된 유지보수 이력이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div :class="styles.handlerActions">
      <Button type="button" variant="secondary" size="sm" class="w-25" @click="addMaintenanceRow">추가</Button>
    </div>

    <template #footer>
      <Button type="button" class="w-25" variant="tertiary2" size="md" @click="maintenanceDialogOpen = false">닫기</Button>
      <Button type="button" class="w-25" variant="primary" size="md" @click="saveMaintenanceHistory">저장</Button>
    </template>
  </GenericDialog2>
</template>
