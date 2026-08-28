<script setup lang="ts">
import { computed, inject } from 'vue'
import { toast } from 'vue-sonner'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { FlexRow, FlexCol } from '@/components/custom/flex-grid'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { EquipmentListKey, vehicleTypeLabel, carTypeOptions, locationOptions, info112Options } from '../composable/PC-LPO-0701'
import styles from '../style/PC-LPO-0701.module.css'

const store = inject(EquipmentListKey)!
const { detail, detailDialogOpen, saveDetail, deleteDetail, openVehicle112Dialog } = store

/** 순찰차 외(오토바이/자전거)에는 없는 차량 전용 항목들 */
const isVehicleRestricted = computed(() => detail.vehicleType !== 'patrol')
const isPlateNumberDisabled = computed(() => isVehicleRestricted.value || detail.isSaved)

function onSave() {
  saveDetail()
  toast.success('저장되었습니다.')
}
</script>

<template>
  <GenericDialog2 v-model:open="detailDialogOpen" title="기동장비 상세" :size="800" :show-close-button="true">
    <p :class="styles.legend">• 필수 입력 항목</p>

    <!--
      라벨-값 표를 FlexGrid 로 만든다. FlexCol type="title"/"value" 가 InfoField 와 같은
      회색 라벨칸/흰 값칸 스타일을 컴포넌트 안에서 입혀주므로 화면에서 다시 칠하지 않는다.
      size 12 = 한 줄 전체, size 6 = 한 줄에 두 쌍(InfoTable columns=2 와 같은 배치).
      팝업 폭이 600px 이하로 좁아지면 6 짜리도 12 로 떨어져 한 쌍씩 쌓인다.
    -->
    <FlexRow type="table">
      <FlexCol :size="12">
        <FlexRow>
          <FlexCol type="title" required>기동장비 구분</FlexCol>
          <FlexCol type="value">
            <RadioGroup v-model="detail.vehicleType" class="flex gap-6">
              <RadioGroupItem v-for="(label, value) in vehicleTypeLabel" :key="value" :value="value" :label="label" />
            </RadioGroup>
          </FlexCol>
        </FlexRow>
      </FlexCol>

      <FlexCol :size="12">
        <FlexRow>
          <FlexCol type="title" for="equip-plate-number" required>차량번호</FlexCol>
          <FlexCol type="value">
            <InputField2
              id="equip-plate-number"
              v-model="detail.plateNumber"
              size="sm"
              class="!space-y-0 flex-1"
              :disabled="isPlateNumberDisabled"
            />
            <span v-if="!isVehicleRestricted && !detail.isSaved" :class="styles.hint">저장 이후에는 차량번호는 수정할 수 없습니다.</span>
          </FlexCol>
        </FlexRow>
      </FlexCol>

      <FlexCol :size="{ default: 6, '600>=': 12 }">
        <FlexRow>
          <FlexCol type="title" for="equip-management-name" required>장비관리명</FlexCol>
          <FlexCol type="value">
            <InputField2 id="equip-management-name" v-model="detail.managementName" size="sm" class="!space-y-0 flex-1" />
          </FlexCol>
        </FlexRow>
      </FlexCol>
      <FlexCol :size="{ default: 6, '600>=': 12 }">
        <FlexRow>
          <FlexCol type="title" for="equip-car-type" required>차량유형</FlexCol>
          <FlexCol type="value">
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
          </FlexCol>
        </FlexRow>
      </FlexCol>

      <FlexCol :size="{ default: 6, '600>=': 12 }">
        <FlexRow>
          <FlexCol type="title" for="equip-location" required>배치장소</FlexCol>
          <FlexCol type="value">
            <SelectField
              id="equip-location"
              v-model="detail.location"
              :options="locationOptions"
              size="sm"
              trigger-class="w-full"
              class="!space-y-0 flex-1"
              placeholder="선택"
            />
          </FlexCol>
        </FlexRow>
      </FlexCol>
      <FlexCol :size="{ default: 6, '600>=': 12 }">
        <FlexRow>
          <FlexCol type="title" for="equip-manufacturer" required>차량제조사</FlexCol>
          <FlexCol type="value">
            <InputField2
              id="equip-manufacturer"
              v-model="detail.manufacturer"
              size="sm"
              class="!space-y-0 flex-1"
              :disabled="isVehicleRestricted"
            />
          </FlexCol>
        </FlexRow>
      </FlexCol>

      <FlexCol :size="{ default: 6, '600>=': 12 }">
        <FlexRow>
          <FlexCol type="title" for="equip-model" required>차종명</FlexCol>
          <FlexCol type="value">
            <InputField2 id="equip-model" v-model="detail.model" size="sm" class="!space-y-0 flex-1" />
          </FlexCol>
        </FlexRow>
      </FlexCol>
      <FlexCol :size="{ default: 6, '600>=': 12 }">
        <FlexRow>
          <FlexCol type="title" for="equip-year" required>차량연식</FlexCol>
          <FlexCol type="value">
            <InputField2
              id="equip-year"
              v-model="detail.year"
              size="sm"
              class="!space-y-0 flex-1"
              :disabled="isVehicleRestricted"
            />
          </FlexCol>
        </FlexRow>
      </FlexCol>

      <FlexCol :size="12">
        <FlexRow>
          <FlexCol type="title" for="equip-info112">112차량정보</FlexCol>
          <FlexCol type="value">
            <SelectField
              id="equip-info112"
              v-model="detail.info112"
              :options="info112Options"
              size="sm"
              trigger-class="w-full"
              class="!space-y-0 flex-1"
              placeholder="선택하세요"
              :disabled="isVehicleRestricted"
            />
          </FlexCol>
        </FlexRow>
      </FlexCol>

      <FlexCol :size="12">
        <FlexRow>
          <FlexCol type="title">임시차량</FlexCol>
          <FlexCol type="value">
            <div :class="styles.tempVehicleRow">
              <InputField2 size="sm" class="!space-y-0 flex-1" readonly />
              <Button type="button" variant="secondary" size="sm" @click="openVehicle112Dialog">차량조회</Button>
            </div>
          </FlexCol>
        </FlexRow>
      </FlexCol>

      <FlexCol :size="12">
        <FlexRow>
          <FlexCol type="title">비고</FlexCol>
          <FlexCol type="value" layout="column">
            <TextareaField v-model="detail.note" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
          </FlexCol>
        </FlexRow>
      </FlexCol>
    </FlexRow>

    <template #footer>
      <Button type="button" class="w-25" variant="tertiary2" size="md" @click="detailDialogOpen = false">닫기</Button>
      <Button type="button" class="w-25" variant="tertiary2" size="md" :disabled="detail.id == null" @click="deleteDetail">삭제</Button>
      <Button type="button" class="w-25" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>
