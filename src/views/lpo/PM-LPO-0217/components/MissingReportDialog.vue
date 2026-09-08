<template>
  <GenericDialog2 v-model:open="missingOpen" title="112누락정보" :size="480">
    <InfoTable :columns="1" popup :size="110">
      <InfoField label="접수번호">
        <span class="group-gap2">
          <InputField2 v-model="missingForm.receiptNo" size="sm" inputClass="w-48" aria-label="접수번호" />
          <Button type="button" variant="secondary" size="sm" @click="onLookup">조회</Button>
        </span>
        <p class="lp-note-text">* 112신고 사건 조회 시 기록이 저장 됩니다.</p>
      </InfoField>
      <InfoField label="코드">
        <InputField2 v-model="missingForm.code" size="sm" aria-label="코드" />
      </InfoField>
      <InfoField label="사건번호">
        <InputField2 v-model="missingForm.caseNo" size="sm" aria-label="사건번호" />
      </InfoField>
      <InfoField label="종결내용">
        <TextareaField v-model="missingForm.closing" aria-label="종결내용" :height="80" />
      </InfoField>
    </InfoTable>

    <p class="lp-heading-md lp-table-gap">근무자 지정</p>
    <InfoTable :columns="1" popup :size="110">
      <InfoField label="근무일자">
        <DatePicker v-model="missingForm.workDate" size="sm" aria-label="근무일자" />
      </InfoField>
      <InfoField label="교대">
        <RadioGroup v-model="missingForm.shift" class="lp-icon-row">
          <RadioGroupItem value="day" label="주" />
          <RadioGroupItem value="night" label="야" />
          <RadioGroupItem value="none" label="미편성" />
        </RadioGroup>
      </InfoField>
      <InfoField label="근무자">
        <SelectField v-model="missingForm.worker" :options="workerOptions" placeholder="선택" size="sm" />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="missingOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { toast } from 'vue-sonner'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { WorkLogKey } from '../composable/PM-LPO-0217'

/** 112누락정보 팝업(PM-LPO-0219) — 접수번호로 112신고를 끌어와 근무일지에 붙인다 */
const store = inject(WorkLogKey)!
const { missingOpen, missingForm } = store

const workerOptions = [
  { label: '[경감] 홍길동', value: '홍길동' },
  { label: '[경사] 김순인', value: '김순인' },
  { label: '[경위] 조택주', value: '조택주' },
]

/** 실제 112 조회는 개발팀 몫 — 화면에서는 목업 값을 채워 넣는다 */
function onLookup() {
  if (!missingForm.value.receiptNo.trim()) {
    toast.warning('접수번호를 입력해 주세요.')
    return
  }
  missingForm.value = {
    ...missingForm.value,
    code: 'C1',
    caseNo: '12345',
    closing: '요구조자 보호자에게 인계하여 마감',
  }
  toast.success('조회되었습니다.')
}

function onSave() {
  if (!missingForm.value.receiptNo.trim()) {
    toast.warning('접수번호를 입력해 주세요.')
    return
  }
  toast.success('저장되었습니다.')
  missingOpen.value = false
}
</script>
