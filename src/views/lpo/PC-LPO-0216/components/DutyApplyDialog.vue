<template>
  <GenericDialog2 :open="open" :title="title" :size="560" :show-footer="false" @update:open="(v: boolean) => emit('update:open', v)">
    <InfoTable :columns="1" popup :size="140">
      <InfoField label="이름">
        <SelectField
          v-model="form.name"
          :options="applyNameOptions"
          placeholder="선택"
          size="sm"
          class="!space-y-0 flex-1"
          trigger-class="w-full"
        />
      </InfoField>
      <InfoField label="구분">
        <SelectField
          v-model="form.reason"
          :options="applyReasonOptions"
          placeholder="선택"
          size="sm"
          class="!space-y-0 flex-1"
          trigger-class="w-full"
        />
      </InfoField>
      <InfoField label="사고시간">
        <RadioGroup v-model="form.range" :class="styles['info-table-radio']">
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
          class="!space-y-0 flex-1"
          trigger-class="w-full"
          :disabled="form.range === 'all'"
        />
      </InfoField>
      <InfoField label="종료시간">
        <SelectField
          v-model="form.endTime"
          :options="hourOptions"
          placeholder="선택"
          size="sm"
          class="!space-y-0 flex-1"
          trigger-class="w-full"
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
import { watch } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import SelectField from '@/components/custom/select/SelectField.vue'
import styles from '@/components/custom/info-table/InfoTable.module.css'
import {
  applyNameOptions,
  applyReasonOptions,
  hourOptions,
  type ApplyForm,
} from '../composable/PC-LPO-0216'

const props = defineProps<{
  open: boolean
  title: string
  form: ApplyForm
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save'): void
}>()

// 전일이면 시작·종료시간이 disabled 되므로 값도 비운다 (IncidentApplyDialog 와 동일)
watch(
  () => props.form.range,
  (range) => {
    if (range === 'all') {
      props.form.startTime = ''
      props.form.endTime = ''
    }
  },
)

function onSave() {
  emit('save')
}
</script>
