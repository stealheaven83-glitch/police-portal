<template>
  <InfoTable :columns="1" size="80">
    <InfoField label="성명" :for="`${idPrefix}-name`">
      <InputField2 :id="`${idPrefix}-name`" v-model="person.name" size="sm" class="!space-y-0 flex-1" input-class="w-full" />
    </InfoField>
    <InfoField label="성별">
      <RadioGroup v-model="person.gender" :class="infoStyles['info-table-radio']" :aria-label="`${legend} 성별`">
        <RadioGroupItem value="male" label="남" />
        <RadioGroupItem value="female" label="여" />
      </RadioGroup>
    </InfoField>
    <InfoField label="생년월일" :for="`${idPrefix}-birth`">
      <DatePicker :id="`${idPrefix}-birth`" v-model="person.birthDate" size="sm" class="flex-1" input-class="w-full" />
    </InfoField>
    <InfoField label="연락처" :for="`${idPrefix}-phone`">
      <InputField2 :id="`${idPrefix}-phone`" v-model="person.phone" size="sm" type="tel" class="!space-y-0 flex-1" input-class="w-full" />
    </InfoField>
    <InfoField v-if="showNationality" label="국적">
      <div class="lp-unit-row">
        <RadioGroup v-model="person.nationality" class="lp-unit-row" :aria-label="`${legend} 국적`">
          <RadioGroupItem value="kr" label="한국" />
          <RadioGroupItem value="etc" label="기타" />
        </RadioGroup>
        <SelectField
          v-model="person.nationalityEtc"
          :options="nationalityOptions"
          :label="`${legend} 국적 상세`"
          label-class="sr-only"
          size="sm"
          trigger-class="w-30"
          class="!space-y-0"
          placeholder="선택"
          :disabled="person.nationality !== 'etc'"
        />
      </div>
    </InfoField>
  </InfoTable>
</template>

<script setup lang="ts">
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { nationalityOptions, type CasePerson } from '../composable/PC-PUB-0208'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'

/** 피해자 · 가해자 인적사항 한 벌. 탭마다 국적 칸이 있고 없고가 갈린다 */
withDefaults(
  defineProps<{
    /** 부모의 reactive 객체를 그대로 받아 고친다 */
    person: CasePerson
    /** 입력 id 앞에 붙일 접두사 — 같은 화면에 두 벌이 있어 id 가 겹치면 안 된다(CLAUDE.md §8) */
    idPrefix: string
    legend: string
    showNationality?: boolean
  }>(),
  { showNationality: true },
)
</script>
