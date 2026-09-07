<template>
  <GenericDialog2 v-model:open="open" title="범죄예방진단 상세" :size="800" show-close-button>
    <div class="pop-title-sub"><h2>범죄예방진단 카드</h2></div>
      <InfoTable :columns="2" popup>
        <InfoField label="부서">{{ departmentLabel }}</InfoField>
        <InfoField label="관리번호">{{ managementNo }}</InfoField>
        <InfoField label="유형">{{ diagnosis?.type || typeLabel }}</InfoField>
        <InfoField label=""><span aria-hidden="true"></span></InfoField>
        <InfoField
          for="diagnosis-detail-date"
          label="진단일자"
          full
        >
          <DatePicker
            id="diagnosis-detail-date"
            v-model="form.diagnosisDate"
            size="sm"
            input-class="w-full"
            placeholder="YYYY.MM.DD"
          />
          <Button type="button" variant="secondary" size="sm" @click="emit('open-photo')">
            사진자료
          </Button>
        </InfoField>
      </InfoTable>
    <div class="pop-title-sub"><h2>일반현황</h2></div>
      <InfoTable :columns="2" popup>
        <InfoField for="diagnosis-detail-reason" label="진단사유">
          <SelectField
            id="diagnosis-detail-reason"
            v-model="form.reason"
            :options="diagnosisReasonOptions"
            size="sm"
            trigger-class="w-full"
            placeholder="선택"
          />
        </InfoField>

        <InfoField
          for="diagnosis-detail-address"
          label="주소"
          layout="column"
          :row-span="2"
        >
          <InputField2
            id="diagnosis-detail-address"
            v-model="form.address"
            size="sm"
            input-class="w-full"
            :icon="searchIcon"
            icon-class="size-5"
            icon-label="주소 검색"
            search
            @icon-click="onSearchAddress"
          />
          <InputField2
            id="diagnosis-detail-address-extra"
            v-model="form.detailAddress"
            size="sm"
            input-class="w-full"
            aria-label="상세주소"
          />
        </InfoField>

        <InfoField for="diagnosis-detail-biz-name" label="상호명">
          <InputField2
            id="diagnosis-detail-biz-name"
            v-model="form.bizName"
            size="sm"
            input-class="w-full"
          />
        </InfoField>

        <InfoField label="관할동">광희동</InfoField>
        <InfoField label="관할부서">남포지구대</InfoField>
      </InfoTable>

      <InfoTable
        :columns="2"
        popup
      >
        <InfoField for="diagnosis-detail-owner" label="가옥주">
          <InputField2
            id="diagnosis-detail-owner"
            v-model="form.houseOwner"
            size="sm"
            input-class="w-full"
          />
        </InfoField>
        <InfoField for="diagnosis-detail-applicant" label="신청자">
          <InputField2
            id="diagnosis-detail-applicant"
            v-model="form.applicant"
            size="sm"
            input-class="w-full"
          />
        </InfoField>

        <InfoField for="diagnosis-detail-contact" label="연락처">
          <InputField2
            id="diagnosis-detail-contact"
            v-model="form.contact"
            size="sm"
            input-class="w-full"
          />
        </InfoField>
        <InfoField label="거주 가구수">
          <Stepper v-model="form.householdCount" :min="0" label="거주 가구수" />
        </InfoField>

        <InfoField label="층수">
          <Stepper v-model="form.floorCount" :min="0"  label="층수" />
        </InfoField>
        <InfoField label="입주년도">
          <Stepper v-model="form.moveInYear" :min="0" label="입주년도" />
        </InfoField>

        <InfoField label="방범진단">
          <RadioGroup v-model="form.crimePreventionStatus" :class="infoTableStyles['info-table-radio']">
            <RadioGroupItem
              v-for="option in crimePreventionStatusOptions"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </RadioGroup>
        </InfoField>
        <InfoField label="이전 범죄피해">
          <RadioGroup v-model="form.previousCrimeDamage" :class="infoTableStyles['info-table-radio']">
            <RadioGroupItem
              v-for="option in previousCrimeDamageOptions"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </RadioGroup>
        </InfoField>

        <InfoField label="피해 횟수">
          <Stepper v-model="form.damageCount" :min="0" label="피해 횟수" />
        </InfoField>
        <InfoField label=""><span aria-hidden="true"></span></InfoField>
      </InfoTable>
    <div class="pop-title-sub"><h2>참고사항 (2023)</h2></div>
      <div class="pop-title-lv2"><h3>1) 범죄 특성</h3></div>
      <InfoTable :columns="2" popup>
        <InfoField v-for="stat in crimeStats" :key="stat.label" :label="stat.label">
          <div><span>{{ stat.grade }}</span><span>{{ stat.value }}</span></div>
        </InfoField>
      </InfoTable>

      <div class="pop-title-lv2"><h3>2) 인구 사회학적 특성</h3></div>
      <InfoTable :columns="2" popup>
        <InfoField v-for="stat in demographicStats" :key="stat.label" :label="stat.label">
          <div><span>{{ stat.grade }}</span><span>{{ stat.value }}</span></div>
        </InfoField>
      </InfoTable>
    <div class="pop-title-sub"><h2>범죄예방진단 항목 및 진단결과</h2></div>
      <div class="pop-title-lv2"><h3>1) 건물특성</h3></div>
      <InfoTable :columns="1" popup>
        <InfoField v-for="row in buildingAssessmentRows" :key="row.key" :label="row.label" full>
          <RadioGroup
            v-if="row.type === 'radio'"
            :model-value="assessment[row.key]"
            :class="infoTableStyles['info-table-radio']"
            @update:model-value="(value: unknown) => (assessment[row.key] = Number(value))"
          >
            <RadioGroupItem :value="3" label="양호(3)" />
            <RadioGroupItem :value="2" label="보통(2)" />
            <RadioGroupItem :value="1" label="위험(1)" />
          </RadioGroup>
          <template v-else>
            <Stepper v-model="assessment[row.key]" :min="0" :label="row.label" />
            <span>{{ row.unit }}</span>
          </template>
        </InfoField>
      </InfoTable>

      <div class="pop-title-lv2"><h3>2) 추가 항목</h3></div>
      <InfoTable :columns="1" popup>
        <InfoField v-for="row in extraAssessmentRows" :key="row.key" :label="row.label" full>
          <Stepper v-model="assessment[row.key]" :min="0" :label="row.label" />
          <span>{{ row.unit }}</span>
        </InfoField>
      </InfoTable>

      <div class="pop-title-lv2"><h3>3) 기타</h3></div>
      <InfoTable :columns="1" >
        <InfoField for="diagnosis-detail-etc-label" full>
          <template #label>
            <Input
              id="diagnosis-detail-etc-label"
              v-model="form.etcLabel"
              size="sm"
              aria-label="기타 항목"
            />
          </template>
          <Stepper v-model="form.etcCount" :min="0" label="기타 수량" />
        </InfoField>
      </InfoTable>

      <div>
        <span>총점</span>
        <strong>{{ totalScore }}</strong>
        <span>점</span>
      </div>
    <div class="pop-title-sub"><h2>시설개선(예정) 일정</h2></div>
      <InfoTable :columns="1" popup>
        <InfoField for="diagnosis-detail-improvement-date" label="시설개선(예정) 일자" full>
          <DatePicker
            id="diagnosis-detail-improvement-date"
            v-model="form.improvementDate"
            size="sm"
            input-class="w-full"
            placeholder="YYYY.MM.DD"
          />
          <SelectField
            v-model="form.improvementStatus"
            :options="improvementStatusOptions"
            size="sm"
            trigger-class="w-full"
            placeholder="선택"
            aria-label="시설개선 상태"
          />
        </InfoField>
      </InfoTable>
    <div class="pop-title-sub mb-2"><h2>착안사항</h2></div>
      <TextareaField
        v-model="form.note"
        textarea-class="w-full"
        :height="80"
        aria-label="착안사항"
      />
      <div>
        <Checkbox v-model="form.emailNotify" label="범죄예방진단 결과 우편 통보" />
        <p><span>범죄예방진단자 :</span> {{ diagnosis?.diagnoser || '홍길동' }} 경사</p>
      </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="emit('print')">
        인쇄
      </Button>
      <Button type="button" variant="tertiary2" size="md" @click="emit('cancel')">취소</Button>
      <Button type="button" variant="primary" size="md" @click="emit('save')">저장</Button>
    </template>
  </GenericDialog2>

</template>

<script setup lang="ts">
import { computed } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoField, InfoTable } from '@/components/custom/info-table'
import Input from '@/components/custom/input/Input.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import Stepper from '@/components/custom/input/Stepper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { useDialog } from '@/composable/dialog/dialog'
import {
  buildingAssessmentRows,
  crimePreventionStatusOptions,
  diagnosisReasonOptions,
  extraAssessmentRows,
  improvementStatusOptions,
  previousCrimeDamageOptions,
  crimeStats,
  demographicStats,
  type CpoDiagnosisRow,
  type NewDiagnosisForm,
  typeOptions,
} from '../composable/PM-PUB-0103'
import infoTableStyles from '@/components/custom/info-table/InfoTable.module.css'

interface Props {
  form: NewDiagnosisForm
  assessment: Record<string, number>
  totalScore: number
  diagnosis?: CpoDiagnosisRow | null
}

const { form, assessment, diagnosis } = defineProps<Props>()
const open = defineModel<boolean>('open', { default: false })
const dialog = useDialog()

const emit = defineEmits<{
  (event: 'save'): void
  (event: 'cancel'): void
  (event: 'print'): void
  (event: 'open-photo'): void
}>()

/**
 * 주소검색은 별도 화면(PC-COM-0401 주소검색 › 도로명 찾기) 팝업으로 여는 자리다.
 * 아직 그 화면이 없어서, 눌러도 아무 일이 없으면 고장난 것처럼 보이므로 안내만 띄운다.
 * TODO: PC-COM-0401 이 만들어지면 이 알림 대신 그 팝업을 열고 선택값을 form.address 에 넣는다.
 */
async function onSearchAddress() {
  await dialog.alert({ title: '주소검색 기능은 준비 중입니다.' })
}

const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'
const departmentLabel = '부산청 부산중부서 남포지구대'
const managementNo = computed(() => `2026${String(diagnosis?.no ?? 6).padStart(6, '0')}`)
const typeLabel = computed(() => typeOptions.find((option) => option.value === form.type)?.label ?? '-')
</script>
