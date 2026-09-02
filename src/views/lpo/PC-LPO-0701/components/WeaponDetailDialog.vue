<script setup lang="ts">
import { inject, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { EquipmentListKey, gunTypeOptions, gunSerialOptions, locationOptions } from '../composable/PC-LPO-0701'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'
import styles from '@/components/custom/info-table/InfoTable.module.css'

const store = inject(EquipmentListKey)!
const { weaponDetail, weaponDetailDialogOpen, addWeaponHandler, saveWeaponDetail, deleteWeaponDetail } = store

const handlerGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

// 팝업 등장 애니메이션(scale) 중에 컬럼 폭이 계산돼 오른쪽에 빈 칸이 남는 것을 막는다
const { onTableBuilt } = useDialogGridRedraw(handlerGridRef)

/**
 * 담당자 목록 그리드.
 * "번호"는 저장되는 값이 아니라 화면상의 순번이라 formatter 로 행 위치에서 계산한다
 * (담당자추가/삭제로 행이 바뀌어도 1부터 다시 매겨진다).
 */
const handlerColumns: TabulatorGridColumn[] = [
  {
    title: '번호',
    width: 70,
    hozAlign: 'center',
    formatter: (cell: any) => String(cell.getRow().getPosition(true)),
  },
  {
    title: '담당자',
    field: 'name',
    cellType: 'input',
    hozAlign: 'left',
  },
]
</script>

<template>
  <GenericDialog2 v-model:open="weaponDetailDialogOpen" title="무기 상세" :size="800" :show-close-button="true">
    <p :class="styles.legend">필수 입력 항목</p>

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
          class="w-60"
          placeholder="선택하세요"
        />
      </InfoField>

      <InfoField label="비고" full>
        <TextareaField v-model="weaponDetail.note" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
      </InfoField>

    </InfoTable>

    <!--
      담당자(휴대자) 목록. 하단 '담당자추가' 버튼으로 행이 늘어난다.
      .grid-wrap 은 police-style.css 의 공통 클래스(그리드 위 여백).
      height 를 비워 행 수만큼 표가 늘어나게 한다(시안처럼 남는 빈 행이 없다).
    -->
    <TabulatorGrid
      ref="handlerGridRef"
      class="grid-wrap"
      :columns="handlerColumns"
      v-model:data="weaponDetail.handlers"
      height=""
      placeholder="등록된 담당자가 없습니다"
      @table-built="onTableBuilt"
    />

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="weaponDetailDialogOpen = false">닫기</Button>
      <Button type="button" variant="tertiary2" size="md" :disabled="weaponDetail.id == null" @click="deleteWeaponDetail">삭제</Button>
      <Button type="button" variant="secondary" size="md" @click="addWeaponHandler">담당자추가</Button>
      <Button type="button" variant="primary" size="md" @click="saveWeaponDetail">저장</Button>
    </template>
  </GenericDialog2>
</template>
