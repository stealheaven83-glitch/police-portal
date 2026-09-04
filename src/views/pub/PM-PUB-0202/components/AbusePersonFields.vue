<template>
  <InfoTable :columns="2" size="90">
    <InfoField label="성명" :for="`${idPrefix}-name`">
      <InputField2 :id="`${idPrefix}-name`" v-model="person.name" size="sm" class="!space-y-0 flex-1" input-class="w-full" />
    </InfoField>
    <InfoField label="성별">
      <RadioGroup v-model="person.gender" :class="infoStyles['info-table-radio']" :aria-label="`${legend} 성별`">
        <RadioGroupItem value="male" label="남" />
        <RadioGroupItem value="female" label="여" />
      </RadioGroup>
    </InfoField>

    <!-- 시안은 피해아동이 생년월일→연락처, 학대행위자가 연락처→생년월일 순이다 -->
    <template v-if="showRelation">
      <InfoField label="연락처" :for="`${idPrefix}-phone`">
        <InputField2 :id="`${idPrefix}-phone`" v-model="person.phone" size="sm" type="tel" class="!space-y-0 flex-1" input-class="w-full" />
      </InfoField>
      <InfoField label="생년월일" :for="`${idPrefix}-birth`">
        <DatePicker :id="`${idPrefix}-birth`" v-model="person.birthDate" size="sm" class="flex-1" input-class="w-full" />
      </InfoField>
    </template>
    <template v-else>
      <InfoField label="생년월일" :for="`${idPrefix}-birth`">
        <DatePicker :id="`${idPrefix}-birth`" v-model="person.birthDate" size="sm" class="flex-1" input-class="w-full" />
      </InfoField>
      <InfoField label="연락처" :for="`${idPrefix}-phone`">
        <InputField2 :id="`${idPrefix}-phone`" v-model="person.phone" size="sm" type="tel" clearable class="!space-y-0 flex-1" input-class="w-full" />
      </InfoField>
    </template>

    <InfoField label="국적" full>
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
        trigger-class="w-40"
        class="!space-y-0"
        placeholder="선택"
        :disabled="person.nationality !== 'etc'"
      />
    </InfoField>

    <!-- 학대행위자에만 있는 칸 -->
    <InfoField v-if="showRelation" label="아동과의 관계" full>
      <RadioGroup v-model="person.relation" class="lp-unit-row" aria-label="아동과의 관계">
        <RadioGroupItem value="father" label="부" />
        <RadioGroupItem value="mother" label="모" />
        <RadioGroupItem value="grandparent" label="(외)조부모" />
        <RadioGroupItem value="etc" label="기타" />
      </RadioGroup>
      <SelectField
        v-model="person.relationEtc"
        :options="relationEtcOptions"
        label="아동과의 관계 상세"
        label-class="sr-only"
        size="sm"
        trigger-class="w-40"
        class="!space-y-0"
        placeholder="선택"
        :disabled="person.relation !== 'etc'"
      />
    </InfoField>

    <!-- AddressInput 은 두 입력이 각자 aria-label 을 갖는다 — InfoField 에 for 를 주지 않는다 -->
    <InfoField label="주소지" full>
      <AddressInput
        v-model="person.address"
        v-model:detail="person.addressDetail"
        size="sm"
        class="flex-1"
        @search="emit('search-address', 'address')"
      />
    </InfoField>
    <InfoField label="거주지" full>
      <AddressInput
        v-model="person.residence"
        v-model:detail="person.residenceDetail"
        size="sm"
        class="flex-1"
        @search="emit('search-address', 'residence')"
      />
    </InfoField>
  </InfoTable>
</template>

<script setup lang="ts">
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import AddressInput from '@/components/custom/address/AddressInput.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import {
  nationalityOptions,
  relationEtcOptions,
  type AbusePerson,
} from '../composable/PM-PUB-0202'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'

/**
 * 신상정보 한 사람분. 피해아동과 학대행위자가 같은 항목을 쓰되
 * '아동과의 관계'는 학대행위자에만 있다.
 */
defineProps<{
  /** 부모의 reactive 객체를 그대로 받아 고친다(v-model 여러 개를 늘어놓지 않기 위해) */
  person: AbusePerson
  /** 입력 id 앞에 붙일 접두사 — 같은 화면에 두 벌이 있어 id 가 겹치면 안 된다(CLAUDE.md §8) */
  idPrefix: string
  /** 접근성 이름에 쓰는 사람 구분 */
  legend: string
  showRelation?: boolean
}>()

const emit = defineEmits<{ (e: 'search-address', kind: 'address' | 'residence'): void }>()
</script>
