<template>
  <GenericDialog2
    :open="open"
    title="사고신청"
    :size="480"
    :show-footer="false"
    @update:open="close"
  >
    <InfoTable :columns="1" popup :size="110">
      <InfoField label="구분">
        <SelectField
          v-model="form.reason"
          :options="incidentReasonOptions"
          placeholder="선택"
          size="sm"
          class="w-full"
          trigger-class="w-full"
        />
      </InfoField>

      <InfoField label="신청일자" for="incident-apply-date">
        <DatePicker
          id="incident-apply-date"
          v-model="form.applyDate"
          size="sm"
          class="!space-y-0 flex-1"
          input-class="w-full"
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
          class="w-full"
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
          class="w-full"
          trigger-class="w-full"
          :disabled="form.range === 'all'"
        />
      </InfoField>
    </InfoTable>

    <div class="lp-dialog-footer lp-table-gap">
      <Button type="button" variant="tertiary2" size="md" @click="close(false)">취소</Button>
      <Button type="button" variant="primary" size="md" @click="apply">신청</Button>
    </div>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoField, InfoTable } from '@/components/custom/info-table'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import SelectField from '@/components/custom/select/SelectField.vue'
import styles from '@/components/custom/info-table/InfoTable.module.css'

export interface IncidentApplyForm {
  reason: string
  applyDate: string
  range: 'all' | 'part'
  startTime: string
  endTime: string
}

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'apply', value: IncidentApplyForm): void
}>()

const form = reactive<IncidentApplyForm>({
  reason: '',
  applyDate: '',
  range: 'all',
  startTime: '',
  endTime: '',
})

const incidentReasonOptions = [
  { label: '병가', value: '병가' },
  { label: '연가', value: '연가' },
  { label: '교육', value: '교육' },
  { label: '육아시간', value: '육아시간' },
  { label: '특별휴가', value: '특별휴가' },
]

const hourOptions = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, '0')}:00`
  return { label: value, value }
})

watch(
  () => form.range,
  (range) => {
    if (range === 'all') {
      form.startTime = ''
      form.endTime = ''
    }
  },
)

function close(value = false) {
  emit('update:open', value)
}

function apply() {
  emit('apply', { ...form })
}
</script>
