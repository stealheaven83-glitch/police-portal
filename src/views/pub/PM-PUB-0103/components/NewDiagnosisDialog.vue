<template>
  <GenericDialog2 v-model:open="open" :title="title" :size="800" show-close-button>
    <section :class="styles.dialogSection">
      <div class="pop-title-sub"><h2>범죄예방진단 카드</h2></div>
      <InfoTable :columns="2" popup :class="styles.cardTable">
        <InfoField label="부서" full :class="styles.inlineActionField">
          <DepartmentCascadeSelect
            v-model="form.department"
            size="sm"
            select-class="w-full"
            :class="styles.departmentSelectGroup"
          />
          <Button type="button" variant="secondary" size="sm" @click="onOpenSimpleNoticeData">
            간이진단통보자료
          </Button>
        </InfoField>

        <InfoField for="new-diagnosis-type" label="유형">
          <SelectField
            id="new-diagnosis-type"
            v-model="form.type"
            :options="typeSelectOptions"
            size="sm"
            trigger-class="w-full"
            class="!space-y-0 flex-1"
            placeholder="선택"
          />
        </InfoField>
        <InfoField for="new-diagnosis-date" label="진단일자" :class="styles.inlineActionField">
          <DatePicker
            id="new-diagnosis-date"
            v-model="form.diagnosisDate"
            size="sm"
            class="!space-y-0 flex-1 min-w-0"
            placeholder="YYYY.MM.DD"
            clearable
          />
          <Button type="button" variant="secondary" size="sm" @click="onOpenPhotoData">사진자료</Button>
        </InfoField>

        <InfoField label="현금다액업소 여부" full>
          <RadioGroup v-model="form.cashIntensive" :class="infoTableStyles['info-table-radio']">
            <RadioGroupItem v-for="opt in cashIntensiveOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
          </RadioGroup>
        </InfoField>

        <div :class="styles.addressGrid">
          <InfoField
            for="new-diagnosis-address"
            label="주소"
            layout="column"
            :class="styles.addressField"
          >
            <InputField2
              id="new-diagnosis-address"
              v-model="form.address"
              size="sm"
              class="!space-y-0 w-full"
              :icon="searchIcon"
              icon-class="size-5"
              icon-label="주소 검색"
              search
              @icon-click="onSearchAddress"
              clearable
            />
            <div :class="styles.detailAddressRow">
              <InputField2
                id="new-diagnosis-detail-address"
                v-model="form.detailAddress"
                size="sm"
                class="!space-y-0 flex-1 min-w-0"
                input-class="w-full"
                aria-label="상세주소"
                clearable
              />
              <Button type="button" variant="secondary" size="sm" @click="onOpenHistory">이력보기</Button>
            </div>
          </InfoField>

          <InfoField
            for="new-diagnosis-district"
            label="관할동"
            :class="styles.jurisdictionRow"
          >
            <SelectField
              id="new-diagnosis-district"
              v-model="form.district"
              :options="districtOptions"
              size="sm"
              trigger-class="w-full"
              class="!space-y-0 flex-1"
              placeholder="선택"
            />
          </InfoField>
          <InfoField
            for="new-diagnosis-office"
            label="관할부서"
            :class="styles.jurisdictionRow"
          >
            <InputField2
              id="new-diagnosis-office"
              v-model="form.districtOffice"
              size="sm"
              class="!space-y-0 flex-1"
              clearable
            />
          </InfoField>
        </div>
      </InfoTable>
    </section>

    <section :class="styles.dialogSection">
      <div class="pop-title-sub"><h2>참고사항 (2023)</h2></div>
      <div :class="styles.refTables">
        <div class="pop-title-lv2"><h3>1) 범죄 특성</h3></div>
        <InfoTable :columns="2" popup>
          <InfoField label="강력/절도/폭력/지능범죄">
            <div :class="styles.referenceValueGrid"><span>-</span><span>-</span></div>
          </InfoField>
          <InfoField label="112신고(Code()/1/2)">
            <div :class="styles.referenceValueGrid"><span>-</span><span>-</span></div>
          </InfoField>
        </InfoTable>

        <div class="pop-title-lv2"><h3>2) 인구 사회학적 특성</h3></div>
        <InfoTable :columns="2" popup>
          <InfoField label="인구 밀도"><div :class="styles.referenceValueGrid"><span>-</span><span>-</span></div></InfoField>
          <InfoField label="지역 결속력"><div :class="styles.referenceValueGrid"><span>-</span><span>-</span></div></InfoField>
          <InfoField label="기초생활수급자수"><div :class="styles.referenceValueGrid"><span>-</span><span>-</span></div></InfoField>
          <InfoField label="1인가구 비율"><div :class="styles.referenceValueGrid"><span>-</span><span>-</span></div></InfoField>
          <InfoField label="외국인 비율"><div :class="styles.referenceValueGrid"><span>-</span><span>-</span></div></InfoField>
          <InfoField label="관리대상자수"><div :class="styles.referenceValueGrid"><span>-</span><span>-</span></div></InfoField>
          <InfoField label="풍속업소 수"><div :class="styles.referenceValueGrid"><span>-</span><span>-</span></div></InfoField>
          <InfoField label="설문조사 결과"><div :class="styles.referenceValueGrid"><span>-</span><span>-</span></div></InfoField>
        </InfoTable>
      </div>
    </section>

    <section :class="styles.dialogSection">
      <div class="pop-title-sub"><h2>일반현황</h2></div>
      <InfoTable :columns="2" popup :class="styles.generalTable">
        <InfoField for="new-diagnosis-reason" label="진단사유">
          <SelectField
            id="new-diagnosis-reason"
            v-model="form.reason"
            :options="diagnosisReasonOptions"
            size="sm"
            trigger-class="w-full"
            class="!space-y-0 flex-1"
            placeholder="선택"
          />
        </InfoField>
        <InfoField for="new-diagnosis-biz-name" label="상호명">
            <InputField2 id="new-diagnosis-biz-name" v-model="form.bizName" size="sm" class="!space-y-0 flex-1" clearable />
        </InfoField>

        <InfoField for="new-diagnosis-owner" label="가옥주">
            <InputField2 id="new-diagnosis-owner" v-model="form.houseOwner" size="sm" class="!space-y-0 flex-1" clearable />
        </InfoField>
        <InfoField for="new-diagnosis-applicant" label="신청자">
            <InputField2 id="new-diagnosis-applicant" v-model="form.applicant" size="sm" class="!space-y-0 flex-1" clearable />
        </InfoField>

        <InfoField for="new-diagnosis-contact" label="연락처">
            <InputField2 id="new-diagnosis-contact" v-model="form.contact" size="sm" class="!space-y-0 flex-1" clearable />
        </InfoField>
        <InfoField label="거주 가구수">
            <Stepper v-model="form.householdCount" :min="0" label="거주 가구수" />
        </InfoField>

        <InfoField label="층수">
            <Stepper v-model="form.floorCount" :min="0" label="층수" />
        </InfoField>
        <InfoField label="입주년도">
            <Stepper v-model="form.moveInYear" :min="0" label="입주년도" />
        </InfoField>

        <InfoField label="방범진단">
            <RadioGroup v-model="form.crimePreventionStatus" :class="infoTableStyles['info-table-radio']">
              <RadioGroupItem v-for="opt in crimePreventionStatusOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
            </RadioGroup>
        </InfoField>
        <InfoField label="이전 범죄피해">
            <RadioGroup v-model="form.previousCrimeDamage" :class="infoTableStyles['info-table-radio']">
              <RadioGroupItem v-for="opt in previousCrimeDamageOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
            </RadioGroup>
        </InfoField>

        <InfoField label="피해 횟수">
            <Stepper v-model="form.damageCount" :min="0" label="피해 횟수" />
        </InfoField>
        <InfoField>
            <template #label><span class="sr-only">추가 정보</span></template>
            <span class="sr-only">입력 항목 없음</span>
        </InfoField>
      </InfoTable>
    </section>

    <section :class="styles.dialogSection">
      <div class="pop-title-sub"><h2>범죄예방진단 항목 및 진단결과</h2></div>
      <div class="pop-title-lv2"><h3>1) 건물특성</h3></div>
      <InfoTable :columns="1" popup :class="styles.buildingTable">
          <InfoField v-for="row in buildingAssessmentRows" :key="row.key" :label="row.label" full>
            <RadioGroup v-if="row.type === 'radio'" :model-value="assessment[row.key]" :class="infoTableStyles['info-table-radio']" @update:model-value="(v: unknown) => (assessment[row.key] = Number(v))">
              <RadioGroupItem :value="3" label="양호(3)" />
              <RadioGroupItem :value="2" label="보통(2)" />
              <RadioGroupItem :value="1" label="위험(1)" />
            </RadioGroup>
            <template v-else>
              <Stepper v-model="assessment[row.key]" :min="0" class="w-30 shrink-0" :label="row.label" />
              <span :class="styles.assessmentUnit">{{ row.unit }}</span>
            </template>
          </InfoField>
      </InfoTable>

      <div class="pop-title-lv2"><h3>2) 추가 항목</h3></div>
      <div :class="styles.wideTables">
        <InfoTable :columns="1" popup>
          <InfoField v-for="row in extraAssessmentRows" :key="row.key" :label="row.label" full>
            <Stepper v-model="assessment[row.key]" :min="0" class="w-30 shrink-0" :label="row.label" />
            <span :class="styles.assessmentUnit">{{ row.unit }}</span>
          </InfoField>
        </InfoTable>

        <div class="pop-title-lv2"><h3>3) 기타</h3></div>
        <InfoTable :columns="1" popup>
          <InfoField for="new-diagnosis-etc-label" full :class="styles.etcLabelField">
            <template #label>
              <Input
                id="new-diagnosis-etc-label"
                v-model="form.etcLabel"
                size="sm"
                class="w-full bg-white"
                aria-label="기타 항목"
              />
            </template>
            <Stepper v-model="form.etcCount" :min="0" class="w-30 shrink-0" label="기타 수량" />
          </InfoField>
        </InfoTable>
      </div>

      <div :class="styles.totalScoreRow">
        <span :class="styles.totalScoreLabel">총점</span>
        <span :class="styles.totalScoreValue">{{ totalScore }}</span>
        <span :class="styles.totalScoreUnit">점</span>
      </div>
    </section>

    <section :class="styles.dialogSection">
      <div class="pop-title-sub"><h2>시설개선(예정) 일정</h2></div>
      <InfoTable :columns="1" popup :class="styles.scheduleTable">
        <InfoField for="new-diagnosis-improvement-date" label="시설개선(예정) 일자" full>
            <DatePicker
              id="new-diagnosis-improvement-date"
              v-model="form.improvementDate"
              size="sm"
              class="!space-y-0 w-50"
              :class="styles.improvementDate"
              input-class="w-full"
              placeholder="YYYY.MM.DD"
              clearable
            />
            <SelectField
              v-model="form.improvementStatus"
              :options="improvementStatusOptions"
              size="sm"
              trigger-class="w-full"
              class="w-30"
              :class="styles.improvementStatusSelect"
              placeholder="선택"
              aria-label="시설개선 상태"
            />
        </InfoField>
      </InfoTable>
    </section>

    <section :class="[styles.dialogSection, styles.noteSection]">
      <div class="pop-title-sub"><h2>착안사항</h2></div>
      <TextareaField v-model="form.note" class="w-full !space-y-0" textarea-class="w-full" :height="80" aria-label="착안사항" />
    </section>

    <section :class="[styles.dialogSection, styles.emailNotifySection]">
      <Checkbox v-model="form.emailNotify" label="범죄예방진단 결과 이메일 통보" />
    </section>

    <template #footer>
      <Button v-if="showPrint" type="button" class="mr-auto" variant="tertiary2" size="md" @click="emit('print')">인쇄</Button>
      <Button type="button" variant="tertiary2" size="md" @click="onCancel">취소</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">{{ saveText }}</Button>
    </template>
  </GenericDialog2>

  <AddressSearchDialog
    v-model:open="addressSearchOpen"
    @select="onSelectAddress"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
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
import AddressSearchDialog from '@/views/pub/components/AddressSearchDialog.vue'
import {
  typeOptions,
  diagnosisReasonOptions,
  districtOptions,
  cashIntensiveOptions,
  crimePreventionStatusOptions,
  previousCrimeDamageOptions,
  improvementStatusOptions,
  buildingAssessmentRows,
  extraAssessmentRows,
  type NewDiagnosisForm,
} from '../composable/PM-PUB-0103'
import styles from '../style/PM-PUB-0103.module.css'
/** RadioGroup 정렬(.info-table-radio) 같은 InfoTable 관련 공통 클래스는 공용 파일에서 그대로 가져온다 */
import infoTableStyles from '@/components/custom/info-table/InfoTable.module.css'

interface Props {
  form: NewDiagnosisForm
  assessment: Record<string, number>
  totalScore: number
  title?: string
  saveText?: string
  showPrint?: boolean
}

const {
  form,
  title = '범죄예방진단 신규',
  saveText = '저장',
  showPrint = false,
} = defineProps<Props>()

const open = defineModel<boolean>('open', { default: false })
const addressSearchOpen = ref(false)

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'cancel'): void
  (e: 'print'): void
  (e: 'open-simple-notice'): void
  (e: 'open-photo'): void
  (e: 'open-history'): void
}>()

/** 검색조건의 '전체' 옵션은 신규 등록 폼에는 맞지 않는다 */
const typeSelectOptions = typeOptions.filter((o) => o.value !== 'all')
const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'

function onSearchAddress() {
  addressSearchOpen.value = true
}

function onSelectAddress(address: string) {
  form.address = address
}

function onOpenSimpleNoticeData() {
  emit('open-simple-notice')
}

function onOpenPhotoData() {
  emit('open-photo')
}

function onOpenHistory() {
  emit('open-history')
}

function onCancel() {
  emit('cancel')
}

function onSave() {
  emit('save')
}
</script>
