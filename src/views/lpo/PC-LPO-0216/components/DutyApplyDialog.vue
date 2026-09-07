<template>
  <GenericDialog2 :open="open" :title="title" :size="420" :show-footer="false" @update:open="(v: boolean) => emit('update:open', v)">
    <InfoTable :columns="1" popup :size="110">
      <InfoField label="이름">
        <SelectField v-model="form.name" :options="applyNameOptions" placeholder="선택" size="sm" />
      </InfoField>
      <InfoField label="구분">
        <SelectField v-model="form.reason" :options="applyReasonOptions" placeholder="선택" size="sm" />
      </InfoField>
      <InfoField label="사고시간">
        <RadioGroup v-model="form.range" class="lp-icon-row">
          <RadioGroupItem value="all" label="전일" />
          <RadioGroupItem value="part" label="부분" />
        </RadioGroup>
      </InfoField>
      <InfoField label="시작시간">
        <SelectField
          v-model="form.startTime"
          :options="hourOptions"
          placeholder="선택"
          size="sm"
          :disabled="form.range === 'all'"
        />
      </InfoField>
      <InfoField label="종료시간">
        <SelectField
          v-model="form.endTime"
          :options="hourOptions"
          placeholder="선택"
          size="sm"
          :disabled="form.range === 'all'"
        />
      </InfoField>
    </InfoTable>

    <div class="lp-dialog-footer lp-table-gap">
      <Button type="button" variant="tertiary2" size="md" @click="emit('update:open', false)">취소</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </div>
  </GenericDialog2>
</template>

<script setup lang="ts">
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import SelectField from '@/components/custom/select/SelectField.vue'
import {
  applyNameOptions,
  applyReasonOptions,
  hourOptions,
  type ApplyForm,
} from '../composable/PC-LPO-0216'

/**
 * 사고신청(PC-LPO-0225) / 자원근무신청(PC-LPO-0226) 팝업.
 * Figma 상 두 팝업의 폼이 같아서 제목만 바꿔 한 컴포넌트로 쓴다
 * (사고신청은 Figma 프레임이 따로 없어 자원근무신청 폼을 그대로 따랐다).
 */
defineProps<{
  open: boolean
  title: string
  form: ApplyForm
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save'): void
}>()

function onSave() {
  emit('save')
}
</script>
