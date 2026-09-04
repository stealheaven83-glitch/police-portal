<template>
  <Alert state="warning" title="조사 전 유의사항">
    <ol class="lp-bullet-list">
      <li>가해자와 피해자를 장소적으로 분리한 상태에서 조사표를 작성해 주십시오.</li>
      <li>
        조사표 작성의 목적은 "피해자의 안전과 보호"라는 점을 설명하고, 주취상태 · 진술거부 등으로 조사가
        어려운 경우는 확인 가능한 사안만 기록하여 주십시오.
      </li>
      <li>
        조사표는 가 · 피해자의 진술과 현장상황을 토대로 작성해 주시고, 조사 결과가 사건 처리와 긴급응급조치의
        근거가 될 수 있음을 안내해 주십시오.
      </li>
      <li>경청하는 자세로, 개방형 질문을 활용하여 주세요.</li>
    </ol>
  </Alert>

  <!-- ── 기본정보 ─────────────────────────────── -->
  <section class="lp-section" aria-labelledby="st-basic-heading">
    <h3 id="st-basic-heading" class="lp-heading-md lp-section-title">기본정보</h3>

    <InfoTable :columns="1" size="90">
      <InfoField>
        <template #label>접수경로<span :class="infoStyles.requiredDot" /></template>
        <RadioGroup v-model="detail.receiptRoute" class="lp-unit-row" aria-label="접수경로">
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

      <InfoField label="접수번호" for="st-receipt-no">
        <div class="lp-unit-row">
          <InputField2 id="st-receipt-no" v-model="detail.receiptNo" size="sm" class="!space-y-0" input-class="w-50" />
          <Button type="button" variant="secondary" size="sm" @click="emit('search-report')">112신고 조회</Button>
        </div>
      </InfoField>

      <InfoField label="신고일시" for="st-report-date">
        <div class="lp-unit-row">
          <DatePicker id="st-report-date" v-model="detail.reportDate" size="sm" input-class="w-40" />
          <InputField2 v-model="detail.reportTime" size="sm" aria-label="신고 시각" placeholder="00:00" class="!space-y-0" input-class="w-25" />
        </div>
      </InfoField>

      <InfoField label="신고내용" for="st-report-content">
        <TextareaField id="st-report-content" v-model="detail.reportContent" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
      </InfoField>
    </InfoTable>

    <FlexRow class="lp-table-gap">
      <FlexCol>
        <section aria-labelledby="st-victim-heading">
          <h4 id="st-victim-heading" class="lp-label-text lp-section-title ac">피해자</h4>
          <CasePersonFields :person="detail.victim" id-prefix="st-victim" legend="피해자" :show-nationality="false" />
        </section>
      </FlexCol>
      <FlexCol>
        <section aria-labelledby="st-offender-heading">
          <h4 id="st-offender-heading" class="lp-label-text lp-section-title ac">가해자</h4>
          <CasePersonFields :person="detail.offender" id-prefix="st-offender" legend="가해자" :show-nationality="false" />
        </section>
      </FlexCol>
    </FlexRow>

    <InfoTable :columns="1" size="130" class="lp-table-gap">
      <InfoField label="가해자 · 피해자 관계" for="st-relation">
        <SelectField
          id="st-relation"
          v-model="detail.relation"
          :options="relationOptions"
          size="sm"
          trigger-class="w-50"
          class="!space-y-0"
          placeholder="선택"
        />
      </InfoField>
    </InfoTable>
  </section>

  <!-- ── 사건처리 참고기준 ─────────────────────── -->
  <section class="lp-section" aria-labelledby="st-reference-heading">
    <h3 id="st-reference-heading" class="lp-heading-md lp-section-title">사건처리 참고기준</h3>
    <CheckItemList :items="stalkingReferenceItems" :values="detail.references" />

    <ol class="lp-survey-list lp-table-gap" start="6">
      <li class="lp-survey-item">
        <div><p>6. (지속성) 가해자의 스토킹이 대략 언제부터 시작되었나요?</p></div>
        <div class="lp-unit-row lp-survey-choice">
          <SelectField
            v-model="detail.startYear"
            :options="stalkingStartYearOptions"
            label="스토킹 시작 연도"
            label-class="sr-only"
            size="sm"
            trigger-class="w-30"
            class="!space-y-0"
            placeholder="연도"
          />
          <SelectField
            v-model="detail.startMonth"
            :options="stalkingStartMonthOptions"
            label="스토킹 시작 월"
            label-class="sr-only"
            size="sm"
            trigger-class="w-25"
            class="!space-y-0"
            placeholder="월"
          />
        </div>
      </li>
    </ol>

    <div class="lp-table-gap">
      <p>7. (반복성) 스토킹 행위가 얼마나 자주 발생하나요?</p>
      <p class="lp-label-text">(입력예시: 답변이 주3회인 경우, "1주일" 클릭 후 숫자 "3" 입력)</p>
      <div class="lp-unit-row">
        <RadioGroup v-model="detail.cycle" class="lp-unit-row" aria-label="스토킹 발생 주기">
          <RadioGroupItem v-for="opt in stalkingCycleOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
        </RadioGroup>
        <InputField2
          v-model="detail.cycleCount"
          size="sm"
          type="number"
          aria-label="발생 횟수"
          :disabled="!detail.cycle || detail.cycle === 'first'"
          class="!space-y-0"
          input-class="w-20"
        />
        <span>회</span>
      </div>
    </div>
  </section>

  <!-- ── 긴급응급조치 판단 평가문항 ────────────── -->
  <section class="lp-section" aria-labelledby="st-score-heading">
    <h3 id="st-score-heading" class="lp-heading-md lp-section-title">긴급응급조치 판단 평가문항</h3>
    <p class="form-note notice-strong">
      * '확인안됨'으로 응답하는 경우 '아니오'와 마찬가지로 점수가 부여되지 않아 위험성이 과소평가될 우려가
      있습니다. 관련자 면담 및 시스템 기록 등을 통해 최대한 확인 바랍니다.
    </p>
    <ScoreItemList :items="stalkingScoreItems" :values="detail.scores" />

    <h4 class="lp-section-title lp-table-gap">
      <Badge color="grayLighter" size="md">위험성 총점</Badge>
    </h4>
    <p class="lp-score-box">
      점수 <b>{{ score }}</b> 점 <span aria-hidden="true">|</span> 위험성
      <b :class="riskLabel === '높음' ? 'notice-strong' : undefined">{{ riskLabel }}</b>
    </p>
    <p class="form-note">
      * 4점 이상부터 위험성이 인정되어 긴급응급조치 필요성이 있습니다. (위험군 분류 : 0~3점 "낮음", 4~12점 "높음")
    </p>
  </section>

  <!-- ── 위험성 판단 ───────────────────────────── -->
  <section class="lp-section" aria-labelledby="st-risk-heading">
    <h3 id="st-risk-heading" class="lp-heading-md lp-section-title">위험성 판단</h3>
    <InfoTable :columns="1" size="120">
      <InfoField label="피해자 의사 확인">
        <span class="lp-flex-fill">긴급응급조치를 요청합니까?</span>
        <RadioGroup v-model="detail.requestUrgent" class="lp-unit-row" aria-label="긴급응급조치 요청 여부">
          <RadioGroupItem value="yes" label="예" />
          <RadioGroupItem value="no" label="아니오" />
        </RadioGroup>
      </InfoField>
    </InfoTable>

    <!-- '아니오' 를 골랐을 때만 채우는 칸이다(시안) -->
    <p class="form-note lp-table-gap notice-strong">* 요청하지 않는 이유는?</p>
    <div class="lp-form-box">
      <Checkbox
        v-for="item in stalkingRefuseItems"
        :key="item.id"
        v-model="detail.refuseReasons[item.id]"
        :disabled="detail.requestUrgent !== 'no'"
        :label="item.text"
      />
      <div class="lp-unit-row">
        <Checkbox v-model="detail.refuseEtc.checked" label="기타" :disabled="detail.requestUrgent !== 'no'" />
        <InputField2
          v-model="detail.refuseEtc.text"
          size="sm"
          aria-label="요청하지 않는 이유 기타"
          :disabled="!detail.refuseEtc.checked"
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </div>
    </div>
  </section>

  <!-- ── 최종 조치결정 ─────────────────────────── -->
  <section class="lp-section" aria-labelledby="st-final-heading">
    <h3 id="st-final-heading" class="lp-heading-md lp-section-title">최종 조치결정</h3>
    <p class="form-note">* 위험성과 피해자 요청여부를 고려하여 최종적으로 조치 여부를 결정하여 주시기 바랍니다.</p>
    <p class="form-note">
      * 위험성 총점이 낮더라도 담당자가 달리 판단할 근거가 있는 경우, 그에 따라 종합적으로 조치여부를
      결정하시기 바랍니다.
    </p>
    <div class="lp-form-box lp-form-box-center">
      <RadioGroup v-model="detail.finalAction" class="lp-unit-row" aria-label="최종 조치결정">
        <RadioGroupItem value="act" label="긴급응급조치함" />
        <RadioGroupItem value="none" label="조치 안함" />
      </RadioGroup>
    </div>
  </section>

  <!-- ── 작성자 ────────────────────────────────── -->
  <section class="lp-section" aria-labelledby="st-writer-heading">
    <h3 id="st-writer-heading" class="lp-heading-md lp-section-title">작성자</h3>
    <InfoTable :columns="1" size="90">
      <InfoField label="소속">
        <span class="readonly-text">서울청 서울양천서 신정3파출소</span>
      </InfoField>
      <InfoField label="이름">
        <span class="readonly-text">OOO</span>
      </InfoField>
      <InfoField label="직위">
        <span class="readonly-text">경사</span>
      </InfoField>
    </InfoTable>
  </section>
</template>

<script setup lang="ts">
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { Badge } from '@/components/custom/badge'
import { Button } from '@/components/custom/button'
import Alert from '@/components/custom/alert/Alert.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import FlexRow from '@/components/custom/flex-grid/FlexRow.vue'
import FlexCol from '@/components/custom/flex-grid/FlexCol.vue'
import CasePersonFields from './CasePersonFields.vue'
import CheckItemList from './CheckItemList.vue'
import ScoreItemList from './ScoreItemList.vue'
import {
  stalkingReferenceItems,
  stalkingScoreItems,
  stalkingRefuseItems,
  stalkingCycleOptions,
  stalkingStartYearOptions,
  stalkingStartMonthOptions,
  relationOptions,
  type StalkingDetail,
} from '../composable/PC-PUB-0208'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'

defineProps<{
  /** 부모의 reactive 객체를 그대로 받아 고친다 */
  detail: StalkingDetail
  score: number
  riskLabel: string
}>()

const emit = defineEmits<{
  (e: 'search-report'): void
}>()
</script>
