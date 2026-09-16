<template>
  <!-- ── 기본 정보 ─────────────────────────────── -->
  <section class="lp-section" aria-labelledby="ca-basic-heading">
    <h3 id="ca-basic-heading" class="lp-heading-md lp-section-title">기본 정보</h3>
    <InfoTable :columns="1" size="90">
      <InfoField>
        <template #label>접수경로<span :class="infoStyles.requiredDot" /></template>
        <RadioGroup v-model="detail.receiptRoute" :class="infoStyles['info-table-radio']" aria-label="접수경로">
          <RadioGroupItem value="report112" label="112신고" />
          <RadioGroupItem value="complaint" label="고소장접수" />
          <RadioGroupItem value="etc" label="기타" />
        </RadioGroup>
        <InputField2
          v-model="detail.receiptRouteEtc"
          size="sm"
          aria-label="접수경로 기타"
          :disabled="detail.receiptRoute !== 'etc'"
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </InfoField>

      <InfoField label="접수번호" for="ca-receipt-no">
        <div class="lp-unit-row">
          <InputField2 id="ca-receipt-no" v-model="detail.receiptNo" size="sm" class="!space-y-0" input-class="w-50" />
          <Button type="button" variant="secondary" size="sm" @click="emit('search-report')">112신고 조회</Button>
        </div>
      </InfoField>

      <InfoField label="발생일자" for="ca-occurred-date">
        <DatePicker id="ca-occurred-date" v-model="detail.occurredDate" size="sm" input-class="w-40" />
      </InfoField>

      <InfoField label="신고내용" for="ca-report-content">
        <TextareaField id="ca-report-content" v-model="detail.reportContent" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
      </InfoField>
    </InfoTable>
  </section>

  <!-- ── 피해아동 ──────────────────────────────── -->
  <section class="lp-section" aria-labelledby="ca-child-heading">
    <h3 id="ca-child-heading" class="lp-heading-md lp-section-title">피해아동</h3>
    <InfoTable :columns="2" size="90">
      <InfoField label="성명" for="ca-child-name">
        <InputField2 id="ca-child-name" v-model="detail.childName" size="sm" class="!space-y-0 flex-1" input-class="w-full" />
      </InfoField>
      <InfoField label="성별">
        <RadioGroup v-model="detail.childGender" :class="infoStyles['info-table-radio']" aria-label="피해아동 성별">
          <RadioGroupItem value="male" label="남" />
          <RadioGroupItem value="female" label="여" />
        </RadioGroup>
      </InfoField>

      <InfoField label="생년월일" for="ca-child-birth">
        <DatePicker id="ca-child-birth" v-model="detail.childBirthDate" size="sm" class="flex-1" input-class="w-full" />
      </InfoField>
      <InfoField label="연령">
        <div class="lp-unit-row">
          <InputField2 v-model="detail.childAgeYear" size="sm" type="number" aria-label="연령(년)" placeholder="년" class="!space-y-0" input-class="w-20" />
          <InputField2 v-model="detail.childAgeMonth" size="sm" type="number" aria-label="연령(개월)" placeholder="개월" class="!space-y-0" input-class="w-20" />
        </div>
      </InfoField>

      <InfoField label="교육기관명" for="ca-school" full>
        <InputField2 id="ca-school" v-model="detail.schoolName" size="sm" class="!space-y-0 flex-1" input-class="w-full" />
      </InfoField>

      <!-- AddressInput 은 두 입력이 각자 aria-label 을 갖는다 — InfoField 에 for 를 주지 않는다 -->
      <InfoField label="거주지" full>
        <AddressInput
          v-model="detail.childAddress"
          v-model:detail="detail.childAddressDetail"
          size="sm"
          class="flex-1"
          @search="emit('search-address')"
        />
      </InfoField>

      <InfoField label="외상유무">
        <RadioGroup v-model="detail.hasInjury" :class="infoStyles['info-table-radio']" aria-label="외상유무">
          <RadioGroupItem value="yes" label="있음" />
          <RadioGroupItem value="no" label="없음" />
        </RadioGroup>
      </InfoField>
      <InfoField label="외상정도">
        <RadioGroup v-model="detail.injuryLevel" :class="infoStyles['info-table-radio']" :disabled="detail.hasInjury !== 'yes'" aria-label="외상정도">
          <RadioGroupItem value="severe" label="중상" />
          <RadioGroupItem value="minor" label="경상" />
        </RadioGroup>
      </InfoField>

      <InfoField label="치료경력">
        <RadioGroup v-model="detail.hasTreatment" :class="infoStyles['info-table-radio']" aria-label="치료경력">
          <RadioGroupItem value="yes" label="있음" />
          <RadioGroupItem value="no" label="없음" />
        </RadioGroup>
      </InfoField>
      <InfoField label="치료내용" for="ca-treatment">
        <InputField2
          id="ca-treatment"
          v-model="detail.treatmentNote"
          size="sm"
          :disabled="detail.hasTreatment !== 'yes'"
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </InfoField>

      <InfoField label="표정" full>
        <RadioGroup v-model="detail.expression" :class="infoStyles['info-table-radio']" aria-label="표정">
          <RadioGroupItem value="dark" label="어두움" />
          <RadioGroupItem value="bright" label="밝음" />
          <RadioGroupItem value="none" label="무표정" />
          <RadioGroupItem value="etc" label="기타" />
        </RadioGroup>
      </InfoField>
      <InfoField label="의복" full>
        <RadioGroup v-model="detail.clothes" :class="infoStyles['info-table-radio']" aria-label="의복">
          <RadioGroupItem value="dirty" label="더러움" />
          <RadioGroupItem value="normal" label="평범함" />
          <RadioGroupItem value="clean" label="깨끗함" />
          <RadioGroupItem value="none" label="미착용" />
        </RadioGroup>
      </InfoField>
      <InfoField label="행동" full>
        <RadioGroup v-model="detail.behavior" :class="infoStyles['info-table-radio']" aria-label="행동">
          <RadioGroupItem value="natural" label="자연스러움" />
          <RadioGroupItem value="slightly" label="약간자연스러움" />
          <RadioGroupItem value="unnatural" label="부자연스러움" />
          <RadioGroupItem value="avoid" label="숨거나 회피함" />
        </RadioGroup>
      </InfoField>
      <InfoField label="장애어부" full>
        <RadioGroup v-model="detail.disability" :class="infoStyles['info-table-radio']" aria-label="장애 여부">
          <RadioGroupItem value="intellectual" label="지적장애" />
          <RadioGroupItem value="physical" label="신체장애" />
          <RadioGroupItem value="both" label="지적+신체장애" />
          <RadioGroupItem value="etc" label="기타" />
        </RadioGroup>
      </InfoField>
    </InfoTable>
  </section>

  <!-- ── 학대의심자 ────────────────────────────── -->
  <section class="lp-section" aria-labelledby="ca-offender-heading">
    <h3 id="ca-offender-heading" class="lp-heading-md lp-section-title">학대의심자</h3>
    <InfoTable :columns="2" size="90">
      <InfoField label="성명" for="ca-offender-name">
        <InputField2 id="ca-offender-name" v-model="detail.offenderName" size="sm" class="!space-y-0 flex-1" input-class="w-full" />
      </InfoField>
      <InfoField label="성별">
        <RadioGroup v-model="detail.offenderGender" :class="infoStyles['info-table-radio']" aria-label="학대의심자 성별">
          <RadioGroupItem value="male" label="남" />
          <RadioGroupItem value="female" label="여" />
        </RadioGroup>
      </InfoField>

      <InfoField label="생년월일" for="ca-offender-birth">
        <DatePicker id="ca-offender-birth" v-model="detail.offenderBirthDate" size="sm" class="flex-1" input-class="w-full" />
      </InfoField>
      <InfoField label="연락처" for="ca-offender-phone">
        <InputField2 id="ca-offender-phone" v-model="detail.offenderPhone" size="sm" type="tel" class="!space-y-0 flex-1" input-class="w-full" />
      </InfoField>

      <InfoField label="직업" for="ca-offender-job">
        <SelectField
          id="ca-offender-job"
          v-model="detail.offenderJob"
          :options="jobOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>
      <InfoField label="아동과의 관계" for="ca-offender-relation">
        <SelectField
          id="ca-offender-relation"
          v-model="detail.offenderRelation"
          :options="childRelationOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>

      <InfoField label="거주지" full>
        <AddressInput
          v-model="detail.offenderAddress"
          v-model:detail="detail.offenderAddressDetail"
          size="sm"
          class="flex-1"
          @search="emit('search-address')"
        />
      </InfoField>
    </InfoTable>
  </section>

  <!-- ── 가정환경 ──────────────────────────────── -->
  <section class="lp-section" aria-labelledby="ca-home-heading">
    <h3 id="ca-home-heading" class="lp-heading-md lp-section-title">가정환경</h3>
    <InfoTable :columns="2" size="90">
      <InfoField label="청소상태" full>
        <RadioGroup v-model="detail.cleanliness" :class="infoStyles['info-table-radio']" aria-label="청소상태">
          <RadioGroupItem value="clean" label="깨끗함" />
          <RadioGroupItem value="normal" label="보통" />
          <RadioGroupItem value="dirty" label="더러움" />
        </RadioGroup>
      </InfoField>
      <InfoField label="가족유형" for="ca-family-type">
        <SelectField
          id="ca-family-type"
          v-model="detail.familyType"
          :options="familyTypeOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>
      <InfoField label="거주상태" for="ca-residence-state">
        <SelectField
          id="ca-residence-state"
          v-model="detail.residenceState"
          :options="residenceStateOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>
    </InfoTable>
  </section>

  <!-- ── 가족관계 ──────────────────────────────── -->
  <section class="lp-section" aria-labelledby="ca-family-heading">
    <h3 id="ca-family-heading" class="lp-heading-md lp-section-title">가족관계</h3>
    <!-- 시안은 같은 묶음이 세 벌 반복된다 -->
    <InfoTable
      v-for="(member, index) in detail.family"
      :key="index"
      :columns="2"
      size="90"
      :class="index > 0 ? 'form-rest' : undefined"
    >
      <InfoField label="성명" :for="`ca-family-${index}-name`">
        <InputField2 :id="`ca-family-${index}-name`" v-model="member.name" size="sm" class="!space-y-0 flex-1" input-class="w-full" />
      </InfoField>
      <InfoField label="동거여부">
        <RadioGroup v-model="member.living" :class="infoStyles['info-table-radio']" :aria-label="`가족 ${index + 1} 동거여부`">
          <RadioGroupItem value="together" label="동거" />
          <RadioGroupItem value="apart" label="비동거" />
        </RadioGroup>
      </InfoField>
      <InfoField label="연락처" :for="`ca-family-${index}-phone`">
        <InputField2 :id="`ca-family-${index}-phone`" v-model="member.phone" size="sm" type="tel" class="!space-y-0 flex-1" input-class="w-full" />
      </InfoField>
      <InfoField label="생년월일" :for="`ca-family-${index}-birth`">
        <DatePicker :id="`ca-family-${index}-birth`" v-model="member.birthDate" size="sm" class="flex-1" input-class="w-full" />
      </InfoField>
      <InfoField label="직업(학교)" :for="`ca-family-${index}-job`" full>
        <InputField2 :id="`ca-family-${index}-job`" v-model="member.job" size="sm" class="!space-y-0 flex-1" input-class="w-full" />
      </InfoField>
    </InfoTable>
  </section>

  <!-- ── 학대의심내용 ──────────────────────────── -->
  <section class="lp-section" aria-labelledby="ca-suspicion-heading">
    <h3 id="ca-suspicion-heading" class="lp-heading-md lp-section-title">학대의심내용</h3>
    <InfoTable :columns="1" size="90">
      <InfoField v-for="group in abuseSuspicionGroups" :key="group.id" :label="group.label">
        <div class="lp-unit-row">
          <Checkbox
            v-for="item in group.items"
            :key="item"
            v-model="detail.suspicions[`${group.id}:${item}`]"
            :label="item"
          />
        </div>
      </InfoField>
    </InfoTable>
  </section>

  <!-- ── 조치결과 ──────────────────────────────── -->
  <section class="lp-section" aria-labelledby="ca-result-heading">
    <h3 id="ca-result-heading" class="lp-heading-md lp-section-title">조치결과</h3>
    <InfoTable :columns="1" size="110">
      <InfoField label="현장종결">
        <div class="lp-unit-row">
          <Checkbox v-for="reason in abuseCloseReasons" :key="reason" v-model="detail.closeReasons[reason]" :label="reason" />
        </div>
      </InfoField>
      <InfoField label="응급조치">
        <div class="lp-unit-row">
          <Checkbox v-for="action in abuseEmergencyActions" :key="action" v-model="detail.emergencyActions[action]" :label="action" />
        </div>
      </InfoField>
      <InfoField label="아동보호전문기관 통보여부">
        <RadioGroup v-model="detail.agencyNotice" :class="infoStyles['info-table-radio']" aria-label="아동보호전문기관 통보여부">
          <RadioGroupItem value="notified" label="통보" />
          <RadioGroupItem value="not-notified" label="미통보" />
        </RadioGroup>
      </InfoField>
    </InfoTable>
  </section>

  <!-- ── (긴급) 아동 임시조치 내용 ─────────────── -->
  <section class="lp-section" aria-labelledby="ca-urgent-heading">
    <div class="lp-row-between lp-section-title">
      <h3 id="ca-urgent-heading" class="lp-heading-md">
        <Checkbox v-model="detail.urgentEnabled" label="(긴급) 아동 임시조치 내용" />
      </h3>
      <Button type="button" variant="tertiary" size="sm" @click="emit('print')">인쇄</Button>
    </div>

    <h4 class="lp-label-text lp-section-title">1. 가해자</h4>
    <InfoTable :columns="2" size="90">
      <InfoField label="성명">
        <span class="readonly-text">{{ detail.offenderName }}</span>
      </InfoField>
      <InfoField label="생년월일">
        <span class="readonly-text">{{ detail.offenderBirthDate }}</span>
      </InfoField>
      <InfoField label="직업" for="ca-urgent-job">
        <SelectField
          id="ca-urgent-job"
          v-model="detail.urgentOffenderJob"
          :options="jobOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
          :disabled="!detail.urgentEnabled"
        />
      </InfoField>
      <InfoField label="아동과의 관계" for="ca-urgent-relation">
        <SelectField
          id="ca-urgent-relation"
          v-model="detail.urgentOffenderRelation"
          :options="childRelationOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
          :disabled="!detail.urgentEnabled"
        />
      </InfoField>
      <InfoField label="주소지" full>
        <span class="readonly-text">{{ detail.offenderAddress }}</span>
      </InfoField>
    </InfoTable>

    <h4 class="lp-label-text lp-section-title lp-table-gap">2. 피해아동</h4>
    <InfoTable :columns="2" size="90">
      <InfoField label="성명">
        <span class="readonly-text">{{ detail.childName }}</span>
      </InfoField>
      <InfoField label="생년월일">
        <span class="readonly-text">{{ detail.childBirthDate }}</span>
      </InfoField>
      <InfoField label="주소지" full>
        <span class="readonly-text">{{ detail.childAddress }}</span>
      </InfoField>
    </InfoTable>

    <InfoTable :columns="1" size="90" class="lp-table-gap">
      <InfoField label="통보일시" for="ca-urgent-date">
        <div class="lp-unit-row">
          <DatePicker id="ca-urgent-date" v-model="detail.urgentNoticeDate" size="sm" input-class="w-40" :disabled="!detail.urgentEnabled" />
          <SelectField
            v-model="detail.urgentNoticeTime"
            :options="noticeTimeOptions"
            label="통보 시각"
            label-class="sr-only"
            size="sm"
            trigger-class="w-30"
            class="!space-y-0"
            placeholder="선택"
            :disabled="!detail.urgentEnabled"
          />
        </div>
      </InfoField>
      <InfoField label="통보장소" for="ca-urgent-place">
        <InputField2 id="ca-urgent-place" v-model="detail.urgentNoticePlace" size="sm" :disabled="!detail.urgentEnabled" class="!space-y-0 flex-1" input-class="w-full" />
      </InfoField>
    </InfoTable>

    <h4 class="lp-label-text lp-section-title lp-table-gap">(긴급) 아동 임시조치 내용</h4>
    <div class="lp-form-box">
      <Checkbox
        v-model="detail.urgentMeasures.m1"
        :disabled="!detail.urgentEnabled"
        label="피해아동 또는 가정구성원의 주거로부터 퇴거 등 격리(제19조제1항제1호)"
      />
      <Checkbox
        v-model="detail.urgentMeasures.m2"
        :disabled="!detail.urgentEnabled"
        label="피해아동 또는 가정구성원의 주거, 학교또는 보호시설 등에서 100미터 이내의 접근금지 (제19조제1항제2호)"
      />
      <div class="lp-unit-row">
        <span class="lp-label-text">기준지</span>
        <SelectField
          v-model="detail.urgentBase"
          :options="baseLocationOptions"
          label="기준지"
          label-class="sr-only"
          size="sm"
          trigger-class="w-30"
          class="!space-y-0"
          placeholder="선택"
          :disabled="!detail.urgentMeasures.m2"
        />
        <InputField2
          v-model="detail.urgentBaseEtc"
          size="sm"
          aria-label="기준지 상세"
          :disabled="!detail.urgentMeasures.m2"
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </div>
      <Checkbox
        v-model="detail.urgentMeasures.m3"
        :disabled="!detail.urgentEnabled"
        label="피해아동 또는 가정구성원에 대한 「전기통신기본법」제2조제1호의 전기통신을 이용한 접근 금지 (제19조제1항제3호)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import AddressInput from '@/components/custom/address/AddressInput.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import {
  abuseSuspicionGroups,
  abuseCloseReasons,
  abuseEmergencyActions,
  jobOptions,
  childRelationOptions,
  familyTypeOptions,
  residenceStateOptions,
  noticeTimeOptions,
  baseLocationOptions,
  type ChildDetail,
} from '../composable/PC-PUB-0208'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'

defineProps<{
  /** 부모의 reactive 객체를 그대로 받아 고친다 */
  detail: ChildDetail
}>()

const emit = defineEmits<{
  (e: 'print'): void
  (e: 'search-report'): void
  (e: 'search-address'): void
}>()
</script>
