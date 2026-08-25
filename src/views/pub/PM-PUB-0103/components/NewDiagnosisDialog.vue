<template>
  <GenericDialog2 v-model:open="open" title="범죄예방진단 현황 신규" :size="800" show-close-button>
    <section :class="[styles.dialogSection, styles.newDiagnosisDialog]">
      <h4 :class="styles.sectionTitle">범죄예방진단 카드</h4>
      <InfoTable :columns="2" :class="styles.diagnosisCardTable">
        <InfoField label="부서" full>
          <DepartmentCascadeSelect
            v-model="form.department"
            size="sm"
            select-class="w-full"
            :class="styles.departmentSelectGroup"
          />
          <Button
            type="button"
            variant="tertiary2"
            size="sm"
            :class="styles.noticeDataButton"
            @click="onOpenSimpleNoticeData"
          >
            간이진단통보자료
          </Button>
        </InfoField>

        <InfoField label="유형">
          <SelectField v-model="form.type" :options="typeSelectOptions" size="sm" trigger-class="w-full" class="!space-y-0 flex-1" placeholder="선택" />
        </InfoField>
        <InfoField label="진단일자">
          <DatePicker v-model="form.diagnosisDate" size="sm" class="!space-y-0 flex-1" placeholder="YYYY.MM.DD" />
        </InfoField>

        <InfoField label="주소" layout="column" :class="styles.addressField">
          <div :class="styles.addressSearchRow">
            <InputField2
              id="new-diagnosis-address"
              v-model="form.address"
              size="sm"
              class="!space-y-0 w-full"
              input-class="pr-14"
              placeholder="도로명주소"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              :class="styles.addressSearchButton"
              aria-label="주소 검색"
              @click="onSearchAddress"
            >
              <Icon name="search" :size="16" />
            </Button>
          </div>
          <InputField2
            id="new-diagnosis-detail-address"
            v-model="form.detailAddress"
            size="sm"
            :class="['!space-y-0', styles.detailAddressField]"
            input-class="w-full"
            placeholder="상세주소"
            aria-label="상세주소"
          />
        </InfoField>

        <InfoField label="관할동" :class="styles.jurisdictionField">
          <SelectField v-model="form.district" :options="districtOptions" size="sm" trigger-class="w-full" class="!space-y-0 flex-1" placeholder="선택" />
        </InfoField>
        <InfoField label="관할부서" :class="styles.jurisdictionField">
          <InputField2 v-model="form.districtOffice" size="sm" class="!space-y-0 flex-1" />
        </InfoField>
      </InfoTable>
    </section>

    <section :class="styles.dialogSection">
      <h4 :class="styles.sectionTitle">참고사항 (2023)</h4>

      <p :class="styles.subSectionTitle">1) 범죄 특성</p>
      <InfoTable :columns="2" :class="styles.referenceTable">
        <InfoField label="강력/절도/폭력/지능범죄" :class="styles.referenceField">
          <span>-</span><span>-</span>
        </InfoField>
        <InfoField label="112신고(Code()/1/2)" :class="styles.referenceField">
          <span>-</span><span>-</span>
        </InfoField>
      </InfoTable>

      <p :class="styles.subSectionTitle">2) 인구 사회학적 특성</p>
      <InfoTable :columns="2" :class="styles.referenceTable">
        <InfoField label="인구 밀도" :class="styles.referenceField"><span>-</span><span>-</span></InfoField>
        <InfoField label="지역 결속력" :class="styles.referenceField"><span>-</span><span>-</span></InfoField>
        <InfoField label="기초생활수급자수" :class="styles.referenceField"><span>-</span><span>-</span></InfoField>
        <InfoField label="1인가구 비율" :class="styles.referenceField"><span>-</span><span>-</span></InfoField>
        <InfoField label="외국인 비율" :class="styles.referenceField"><span>-</span><span>-</span></InfoField>
        <InfoField label="관리대상자수" :class="styles.referenceField"><span>-</span><span>-</span></InfoField>
        <InfoField label="풍속업소 수" :class="styles.referenceField"><span>-</span><span>-</span></InfoField>
        <InfoField label="설문조사 결과" :class="styles.referenceField"><span>-</span><span>-</span></InfoField>
      </InfoTable>
    </section>

    <section :class="styles.dialogSection">
      <h4 :class="styles.sectionTitle">일반현황</h4>
      <InfoTable :columns="2" :class="styles.generalTable">
        <InfoField label="진단사유">
          <SelectField v-model="form.reason" :options="diagnosisReasonOptions" size="sm" trigger-class="w-full" class="!space-y-0 flex-1" placeholder="선택" />
        </InfoField>
        <InfoField label="상호명">
          <InputField2 v-model="form.bizName" size="sm" class="!space-y-0 flex-1" />
        </InfoField>

        <InfoField label="가옥주">
          <InputField2 v-model="form.houseOwner" size="sm" class="!space-y-0 flex-1" />
        </InfoField>
        <InfoField label="신청자">
          <InputField2 v-model="form.applicant" size="sm" class="!space-y-0 flex-1" />
        </InfoField>

        <InfoField label="연락처">
          <InputField2 v-model="form.contact" size="sm" class="!space-y-0 flex-1" />
        </InfoField>
        <InfoField label="거주 가구수">
          <Stepper v-model="form.householdCount" :min="0" />
        </InfoField>

        <InfoField label="층수">
          <Stepper v-model="form.floorCount" :min="0" />
        </InfoField>
        <InfoField label="입주년도">
          <Stepper v-model="form.moveInYear" :min="0" />
        </InfoField>

        <InfoField label="방범진단">
          <RadioGroup v-model="form.crimePreventionStatus" class="flex gap-6">
            <RadioGroupItem v-for="opt in crimePreventionStatusOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
          </RadioGroup>
        </InfoField>
        <InfoField label="이전 범죄피해">
          <RadioGroup v-model="form.previousCrimeDamage" class="flex gap-6">
            <RadioGroupItem v-for="opt in previousCrimeDamageOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
          </RadioGroup>
        </InfoField>

        <InfoField label="피해 횟수">
          <Stepper v-model="form.damageCount" :min="0" />
        </InfoField>
        <InfoField :class="styles.emptyGeneralField">
          <template #label><span class="sr-only">추가 정보</span></template>
          <span class="sr-only">입력 항목 없음</span>
        </InfoField>
      </InfoTable>
    </section>

    <section :class="styles.dialogSection">
      <h4 :class="styles.sectionTitle">범죄예방진단 항목 및 진단결과</h4>

      <p :class="styles.subSectionTitle">1) 건물특성</p>
      <InfoTable :columns="1" :class="styles.buildingAssessmentTable">
        <InfoField v-for="row in buildingAssessmentRows" :key="row.key" :label="row.label" full>
          <RadioGroup v-if="row.type === 'radio'" :model-value="assessment[row.key]" class="flex gap-6" @update:model-value="(v) => (assessment[row.key] = Number(v))">
            <RadioGroupItem :value="3" label="양호(3)" />
            <RadioGroupItem :value="2" label="보통(2)" />
            <RadioGroupItem :value="1" label="위험(1)" />
          </RadioGroup>
          <template v-else>
            <Stepper v-model="assessment[row.key]" :min="0" :class="styles.assessmentStepper" :label="row.label" />
            <span :class="styles.assessmentUnit">{{ row.unit }}</span>
          </template>
        </InfoField>
      </InfoTable>

      <p :class="styles.subSectionTitle">2) 추가 항목</p>
      <InfoTable :columns="1" :class="styles.extraAssessmentTable">
        <InfoField v-for="row in extraAssessmentRows" :key="row.key" :label="row.label" full>
          <Stepper v-model="assessment[row.key]" :min="0" :class="styles.assessmentStepper" :label="row.label" />
          <span :class="styles.assessmentUnit">{{ row.unit }}</span>
        </InfoField>
      </InfoTable>

      <p :class="styles.subSectionTitle">3) 기타</p>
      <InfoTable :columns="1" :class="styles.etcAssessmentTable">
        <InfoField for="new-diagnosis-etc-label" full>
          <template #label>
            <Input
              id="new-diagnosis-etc-label"
              v-model="form.etcLabel"
              size="sm"
              class="w-full bg-white"
              aria-label="기타 항목"
            />
          </template>
          <Stepper v-model="form.etcCount" :min="0" :class="styles.assessmentStepper" label="기타 수량" />
        </InfoField>
      </InfoTable>

      <div :class="styles.totalScoreRow">
        <span>총점</span>
        <span :class="styles.totalScoreValue">{{ totalScore }}</span>
        <span>점</span>
      </div>
    </section>

    <section :class="styles.dialogSection">
      <h4 :class="styles.sectionTitle">시설개선(예정) 일정</h4>
      <InfoTable :columns="1" :class="styles.improvementTable">
        <InfoField label="시설개선(예정) 일자" full>
          <div :class="styles.improvementDate">
            <DatePicker
              v-model="form.improvementDate"
              size="sm"
              class="!space-y-0 w-full"
              input-class="w-full"
              placeholder="YYYY.MM.DD"
            />
          </div>
          <SelectField
            v-model="form.improvementStatus"
            :options="improvementStatusOptions"
            size="sm"
            trigger-class="w-full"
            :class="styles.improvementStatusSelect"
            placeholder="선택"
          />
        </InfoField>
      </InfoTable>
    </section>

    <section :class="styles.dialogSection">
      <h4 :class="styles.sectionTitle">착안사항</h4>
      <TextareaField v-model="form.note" class="w-full !space-y-0" textarea-class="w-full" :height="80" />
    </section>

    <section :class="[styles.dialogSection, styles.emailNotifySection]">
      <Checkbox v-model="form.emailNotify" label="범죄예방진단 결과 이메일 통보" />
    </section>

    <template #footer>
      <Button type="button" class="w-25" variant="tertiary2" size="md" @click="onCancel">취소</Button>
      <Button type="button" class="w-25" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>

  <EmptyStubDialog
    v-model:open="addressSearchOpen"
    title="주소 검색"
    description="도로명/지번 주소를 검색해 자동으로 입력합니다."
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import { Button } from '@/components/custom/button'
import Icon from '@/components/custom/icon/Icon.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import Input from '@/components/custom/input/Input.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import Stepper from '@/components/custom/input/Stepper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { toast } from 'vue-sonner'
import {
  typeOptions,
  diagnosisReasonOptions,
  districtOptions,
  crimePreventionStatusOptions,
  previousCrimeDamageOptions,
  improvementStatusOptions,
  buildingAssessmentRows,
  extraAssessmentRows,
  type NewDiagnosisForm,
} from '../composable/PM-PUB-0103'
import styles from '../style/PM-PUB-0103.module.css'

interface Props {
  form: NewDiagnosisForm
  assessment: Record<string, number>
  totalScore: number
}

defineProps<Props>()

const open = defineModel<boolean>('open', { default: false })
const addressSearchOpen = ref(false)

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'cancel'): void
}>()

/** 검색조건의 '전체' 옵션은 신규 등록 폼에는 맞지 않는다 */
const typeSelectOptions = typeOptions.filter((o) => o.value !== 'all')

function onSearchAddress() {
  addressSearchOpen.value = true
}

function onOpenSimpleNoticeData() {
  // TODO: 간이진단통보자료(PM-PUB-0115) 팝업 연동
  toast.info('간이진단통보자료는 준비 중입니다.')
}

function onCancel() {
  emit('cancel')
}

function onSave() {
  emit('save')
}
</script>
