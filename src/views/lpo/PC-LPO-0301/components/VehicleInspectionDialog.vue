<template>
  <GenericDialog2 v-model:open="open" title="차량 일일점검" :size="800">
    <!-- Figma 15116:130172 — 블록 사이 16 균일(.lp-dialog-body), 구역 제목(.lp-heading-md) → 표 8(.lp-field), 라벨 120, 행 48, 라디오 사이 24(info-table-radio) -->
    <div class="lp-dialog-body">
    <InfoTable :columns="2" :size="120">
      <InfoField label="시작" for="inspect-km-start">
        <span class="lp-field-inline">
          <InputField2 id="inspect-km-start" v-model="form.kmStart" size="sm" input-class="w-full" :clearable="false" />
          <span class="lp-label-text">Km</span>
        </span>
      </InfoField>
      <InfoField label="종료" for="inspect-km-end">
        <span class="lp-field-inline">
          <InputField2 id="inspect-km-end" v-model="form.kmEnd" size="sm" input-class="w-full" :clearable="false" />
          <span class="lp-label-text">Km</span>
        </span>
      </InfoField>
    </InfoTable>

    <div v-for="section in inspectionSections" :key="section.title" class="lp-field">
      <h3 class="lp-heading-md">{{ section.title }}</h3>
      <InfoTable :columns="2" :size="120">
        <InfoField v-for="item in section.items" :key="item.key" :label="item.label">
          <RadioGroup
            v-if="item.key"
            :model-value="form.status[item.key]"
            :class="infoTableStyles['info-table-radio']"
            :aria-label="item.label"
            @update:model-value="(v: string) => (form.status[item.key] = v)"
          >
            <RadioGroupItem v-for="opt in item.options" :key="opt.value" :value="opt.value" :label="opt.label" />
          </RadioGroup>
        </InfoField>
      </InfoTable>
    </div>

    <TextareaField
      id="inspect-note"
      v-model="form.note"
      label="고장 및 수리내역"
      :height="100"
      class="w-full"
    />
    </div>

    <template #footer>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import infoTableStyles from '@/components/custom/info-table/InfoTable.module.css'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { useDialog } from '@/composable/dialog/dialog'
import {
  inspectionSections,
  createEmptyInspectionForm,
  type VehicleInspectionForm,
} from '../composable/vehicleInspection'
/**
 * 차량 일일점검 팝업 — PC-LPO-0303 (Figma 15116:130172).
 * 인수인계 화면(PC-LPO-0301) 순찰차 표의 '미점검' 버튼이 연다. 저장하면 부모가 그 차량을 '점검 완료' 로 바꾼다.
 * 항목·선택지는 composable(vehicleInspection.ts)에 두고 여기서는 그린다.
 */
const emit = defineEmits<{
  (e: 'save', form: VehicleInspectionForm): void
}>()

const open = defineModel<boolean>('open', { default: false })
const dialog = useDialog()

const form = reactive<VehicleInspectionForm>(createEmptyInspectionForm())

/** 열 때마다 비운다 — 차량마다 새로 점검한다 */
watch(open, (isOpen) => {
  if (isOpen) Object.assign(form, createEmptyInspectionForm())
})

/** 사용자 지정(저장 흐름 기본): 「저장 하시겠습니까?」 컨펌 → 「저장 되었습니다.」 알림 → 닫기 */
async function onSave() {
  const { confirmed } = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!confirmed) return
  emit('save', { ...form, status: { ...form.status } })
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
  open.value = false
}
</script>
