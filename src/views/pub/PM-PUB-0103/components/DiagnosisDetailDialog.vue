<template>
  <GenericDialog2 v-model:open="open" title="범죄예방진단 상세" :size="800" show-close-button>
    <section :class="styles.dialogSection">
      <div class="pop-title-sub"><h2>범죄예방진단 카드</h2></div>
      <InfoTable :columns="2" popup :class="styles.detailCardTable">
        <InfoField label="부서">{{ departmentLabel }}</InfoField>
        <InfoField label="관리번호">{{ managementNo }}</InfoField>
        <InfoField label="유형">{{ diagnosis?.type || typeLabel }}</InfoField>
        <InfoField label=""><span aria-hidden="true"></span></InfoField>
        <InfoField
          for="diagnosis-detail-date"
          label="진단일자"
          full
          :class="styles.inlineActionField"
        >
          <DatePicker
            id="diagnosis-detail-date"
            v-model="form.diagnosisDate"
            size="sm"
            :class="styles.detailDateField"
            input-class="w-full"
            placeholder="YYYY.MM.DD"
            clearable
          />
          <Button type="button" variant="secondary" size="sm" @click="emit('open-photo')">
            사진자료
          </Button>
        </InfoField>
      </InfoTable>
    </section>

    <section :class="styles.dialogSection">
      <div class="pop-title-sub"><h2>일반현황</h2></div>
      <InfoTable :columns="2" popup :class="[styles.generalTable, styles.detailGeneralTop]">
        <InfoField
          for="diagnosis-detail-reason"
          label="진단사유"
          :class="styles.detailReasonField"
        >
          <SelectField
            id="diagnosis-detail-reason"
            v-model="form.reason"
            :options="diagnosisReasonOptions"
            size="sm"
            trigger-class="w-full"
            :class="styles.detailControlFill"
            placeholder="선택"
          />
        </InfoField>

        <InfoField
          for="diagnosis-detail-address"
          label="주소"
          layout="column"
          :class="styles.detailAddressField"
        >
          <InputField2
            id="diagnosis-detail-address"
            v-model="form.address"
            size="sm"
            :class="styles.detailControlFill"
            input-class="w-full"
            :icon="searchIcon"
            icon-class="size-5"
            icon-label="주소 검색"
            search
            @icon-click="addressSearchOpen = true"
            clearable
          />
          <InputField2
            id="diagnosis-detail-address-extra"
            v-model="form.detailAddress"
            size="sm"
            :class="styles.detailAddressExtra"
            input-class="w-full"
            aria-label="상세주소"
            clearable
          />
        </InfoField>

        <InfoField
          for="diagnosis-detail-biz-name"
          label="상호명"
          :class="styles.detailBizNameField"
        >
          <InputField2
            id="diagnosis-detail-biz-name"
            v-model="form.bizName"
            size="sm"
            :class="styles.detailControlFill"
            input-class="w-full"
            clearable
          />
        </InfoField>

        <InfoField label="관할동" :class="styles.detailDistrictField">광희동</InfoField>
        <InfoField label="관할부서" :class="styles.detailOfficeField">남포지구대</InfoField>
      </InfoTable>

      <InfoTable
        :columns="2"
        popup
        :class="[styles.generalTable, styles.detailGeneralBottom]"
      >
        <InfoField for="diagnosis-detail-owner" label="가옥주">
          <InputField2
            id="diagnosis-detail-owner"
            v-model="form.houseOwner"
            size="sm"
            :class="styles.detailControlFill"
            input-class="w-full"
            clearable
          />
        </InfoField>
        <InfoField for="diagnosis-detail-applicant" label="신청자">
          <InputField2
            id="diagnosis-detail-applicant"
            v-model="form.applicant"
            size="sm"
            :class="styles.detailControlFill"
            input-class="w-full"
            clearable
          />
        </InfoField>

        <InfoField for="diagnosis-detail-contact" label="연락처">
          <InputField2
            id="diagnosis-detail-contact"
            v-model="form.contact"
            size="sm"
            :class="styles.detailControlFill"
            input-class="w-full"
            clearable
          />
        </InfoField>
        <InfoField label="거주 가구수">
          <Stepper v-model="form.householdCount" :min="0" :class="styles.detailStepperFull" label="거주 가구수" />
        </InfoField>

        <InfoField label="층수">
          <Stepper v-model="form.floorCount" :min="0" :class="styles.detailStepperFull" label="층수" />
        </InfoField>
        <InfoField label="입주년도">
          <Stepper v-model="form.moveInYear" :min="0" :class="styles.detailStepperFull" label="입주년도" />
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
          <Stepper v-model="form.damageCount" :min="0" :class="styles.detailStepperFull" label="피해 횟수" />
        </InfoField>
        <InfoField label=""><span aria-hidden="true"></span></InfoField>
      </InfoTable>
    </section>

    <section :class="styles.dialogSection">
      <div class="pop-title-sub"><h2>참고사항 (2023)</h2></div>
      <div :class="styles.refTables">
        <div class="pop-title-lv2"><h3>1) 범죄 특성</h3></div>
        <InfoTable :columns="2" popup>
          <InfoField label="강력/절도/폭력/지능범죄">
            <div :class="styles.referenceValueGrid"><span>보통</span><span>618</span></div>
          </InfoField>
          <InfoField label="112신고(Code()/1/2)">
            <div :class="styles.referenceValueGrid"><span>보통</span><span>8823</span></div>
          </InfoField>
        </InfoTable>

        <div class="pop-title-lv2"><h3>2) 인구 사회학적 특성</h3></div>
        <InfoTable :columns="2" popup>
          <InfoField label="인구 밀도">
            <div :class="styles.referenceValueGrid"><span>보통</span><span>6729</span></div>
          </InfoField>
          <InfoField label="지역 결속력">
            <div :class="styles.referenceValueGrid"><span>보통</span><span>111</span></div>
          </InfoField>
          <InfoField label="기초생활수급자수">
            <div :class="styles.referenceValueGrid"><span>보통</span><span>111</span></div>
          </InfoField>
          <InfoField label="1인가구 비율">
            <div :class="styles.referenceValueGrid"><span>위험</span><span>0</span></div>
          </InfoField>
          <InfoField label="외국인 비율">
            <div :class="styles.referenceValueGrid"><span>양호</span><span>0</span></div>
          </InfoField>
          <InfoField label="관리대상자수">
            <div :class="styles.referenceValueGrid"><span>위험</span><span>0</span></div>
          </InfoField>
          <InfoField label="풍속업소 수">
            <div :class="styles.referenceValueGrid"><span>보통</span><span>173</span></div>
          </InfoField>
          <InfoField label="설문조사 결과">
            <div :class="styles.referenceValueGrid"><span>보통</span><span>0</span></div>
          </InfoField>
        </InfoTable>
      </div>
    </section>

    <section :class="styles.dialogSection">
      <div class="pop-title-sub"><h2>범죄예방진단 항목 및 진단결과</h2></div>
      <div class="pop-title-lv2"><h3>1) 건물특성</h3></div>
      <InfoTable :columns="1" popup :class="styles.buildingTable">
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
            <Stepper v-model="assessment[row.key]" :min="0" :class="styles.detailStepper" :label="row.label" />
            <span :class="styles.assessmentUnit">{{ row.unit }}</span>
          </template>
        </InfoField>
      </InfoTable>

      <div class="pop-title-lv2"><h3>2) 추가 항목</h3></div>
      <div :class="styles.wideTables">
        <InfoTable :columns="1" popup>
          <InfoField v-for="row in extraAssessmentRows" :key="row.key" :label="row.label" full>
            <Stepper v-model="assessment[row.key]" :min="0" :class="styles.detailStepper" :label="row.label" />
            <span :class="styles.assessmentUnit">{{ row.unit }}</span>
          </InfoField>
        </InfoTable>

        <div class="pop-title-lv2"><h3>3) 기타</h3></div>
        <InfoTable :columns="1" popup>
          <InfoField for="diagnosis-detail-etc-label" full :class="styles.etcLabelField">
            <template #label>
              <Input
                id="diagnosis-detail-etc-label"
                v-model="form.etcLabel"
                size="sm"
                :class="styles.detailEtcInput"
                aria-label="기타 항목"
              />
            </template>
            <Stepper v-model="form.etcCount" :min="0" :class="styles.detailStepper" label="기타 수량" />
          </InfoField>
        </InfoTable>
      </div>

      <div :class="styles.detailTotalScoreRow">
        <span :class="styles.totalScoreLabel">총점</span>
        <strong>43</strong>
        <span :class="styles.totalScoreUnit">점</span>
      </div>
    </section>

    <section :class="styles.dialogSection">
      <div class="pop-title-sub"><h2>시설개선(예정) 일정</h2></div>
      <InfoTable :columns="1" popup :class="styles.scheduleTable">
        <InfoField for="diagnosis-detail-improvement-date" label="시설개선(예정) 일자" full>
          <DatePicker
            id="diagnosis-detail-improvement-date"
            v-model="form.improvementDate"
            size="sm"
            :class="styles.detailImprovementDate"
            input-class="w-full"
            placeholder="YYYY.MM.DD"
            clearable
          />
          <SelectField
            v-model="form.improvementStatus"
            :options="improvementStatusOptions"
            size="sm"
            trigger-class="w-full"
            :class="styles.detailImprovementStatus"
            placeholder="선택"
            aria-label="시설개선 상태"
          />
        </InfoField>
      </InfoTable>
    </section>

    <section :class="[styles.dialogSection, styles.noteSection]">
      <div class="pop-title-sub"><h2>착안사항</h2></div>
      <TextareaField
        v-model="form.note"
        :class="styles.detailTextarea"
        textarea-class="w-full"
        :height="80"
        aria-label="착안사항"
      />
      <div :class="styles.detailNoteMeta">
        <Checkbox v-model="form.emailNotify" label="범죄예방진단 결과 이메일 통보" />
        <p><span>범죄예방진단자 :</span> {{ diagnosis?.diagnoser || '홍길동' }} 경사</p>
      </div>
    </section>

    <template #footer>
      <Button type="button" :class="styles.detailPrintButton" variant="tertiary2" size="md" @click="emit('print')">
        인쇄
      </Button>
      <Button type="button" variant="tertiary2" size="md" @click="emit('cancel')">취소</Button>
      <Button type="button" variant="primary" size="md" @click="emit('save')">저장</Button>
    </template>
  </GenericDialog2>

  <AddressSearchDialog v-model:open="addressSearchOpen" @select="form.address = $event" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
import AddressSearchDialog from '@/views/pub/components/AddressSearchDialog.vue'
import {
  buildingAssessmentRows,
  crimePreventionStatusOptions,
  diagnosisReasonOptions,
  extraAssessmentRows,
  improvementStatusOptions,
  previousCrimeDamageOptions,
  type CpoDiagnosisRow,
  type NewDiagnosisForm,
  typeOptions,
} from '../composable/PM-PUB-0103'
import styles from '../style/PM-PUB-0103.module.css'
import infoTableStyles from '@/components/custom/info-table/InfoTable.module.css'

interface Props {
  form: NewDiagnosisForm
  assessment: Record<string, number>
  totalScore: number
  diagnosis?: CpoDiagnosisRow | null
}

const { form, assessment, diagnosis } = defineProps<Props>()
const open = defineModel<boolean>('open', { default: false })
const addressSearchOpen = ref(false)

const emit = defineEmits<{
  (event: 'save'): void
  (event: 'cancel'): void
  (event: 'print'): void
  (event: 'open-photo'): void
}>()

const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'
const departmentLabel = '부산청 부산중부서 남포지구대'
const managementNo = computed(() => `2026${String(diagnosis?.no ?? 6).padStart(6, '0')}`)
const typeLabel = computed(() => typeOptions.find((option) => option.value === form.type)?.label ?? '-')
</script>
