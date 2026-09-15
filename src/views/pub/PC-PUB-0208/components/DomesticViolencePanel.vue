<template>
  <Alert state="warning" title="조사 전 유의사항">
    <ol class="lp-bullet-list">
      <li>가해자와 피해자를 장소적으로 분리한 상태에서 조사표를 작성해 주십시오.</li>
      <li>
        조사표 작성의 목적은 "피해자의 안전과 보호"라는 점을 설명하고, 주취상태 · 진술거부 등으로 조사가
        어려운 경우는 확인 가능한 사안만 기록하여 주십시오.
      </li>
      <li>
        조사표는 가 · 피해자의 진술과 현장상황을 토대로 작성해 주시고, 조사 결과가 사건 처리와 긴급임시조치의
        근거가 될 수 있음을 안내해 주십시오.
      </li>
      <li>
        조사표의 각 문항은 피해자 진술, 육안 관찰, 휴대용 정보통신 단말기(PDA)로 신고이력 · 재발우려가정 정보
        등을 통해 확인 및 기록하여 주시고, 필요한 경우 문서 · 사진 · 동영상 등으로 증거를 확보 해 주시기 바랍니다.
      </li>
      <li>
        아동학대 정황이 발견되는 경우 『아동학대 체크리스트』를 활용, 세심하게 점검해 주세요.
        <span class="lp-label-text">* 만 18세 미만 아동에 대한 폭행(눈에 띄는 상처 · 멍 등) · 유기 · 방임 등</span>
      </li>
      <li>
        경청하는 자세로, 개방형 질문을 활용하여 주세요.<br >
        "신고한 내용에 대해 구체적으로 모두 진술해주세요. 어떤 피해를 입으셨나요?"
        <span class="lp-label-text">
          * 관련근거 : 『가정폭력방지법』제9조의4 ' 현장출입조사 ', 『가정폭력처벌법』제5조 ' 응급조치 '
        </span>
      </li>
    </ol>
  </Alert>

  <!-- ── 기본정보 ─────────────────────────────── -->
  <section class="lp-section" aria-labelledby="dv-basic-heading">
    <div class="lp-row-between lp-section-title">
      <h3 id="dv-basic-heading" class="lp-heading-md">기본정보</h3>
      <Button type="button" variant="tertiary" size="sm" @click="emit('print')">인쇄</Button>
    </div>

    <InfoTable :columns="1" size="90">
      <InfoField label="형태">
        <Checkbox v-model="detail.mutual" label="쌍방" />
      </InfoField>

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

      <InfoField label="접수번호" for="dv-receipt-no">
        <div class="lp-unit-row">
          <InputField2 id="dv-receipt-no" v-model="detail.receiptNo" size="sm" class="!space-y-0" input-class="w-50" />
          <Button type="button" variant="secondary" size="sm" @click="emit('search-report')">112신고 조회</Button>
        </div>
      </InfoField>

      <InfoField label="발생일자" for="dv-occurred-date">
        <DatePicker id="dv-occurred-date" v-model="detail.occurredDate" size="sm" input-class="w-40" />
      </InfoField>

      <InfoField label="신고내용" for="dv-report-content">
        <TextareaField id="dv-report-content" v-model="detail.reportContent" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
      </InfoField>
    </InfoTable>

    <FlexRow class="lp-table-gap">
      <FlexCol>
        <section aria-labelledby="dv-victim-heading">
          <h4 id="dv-victim-heading" class="lp-label-text lp-section-title ac">피해자</h4>
          <CasePersonFields :person="detail.victim" id-prefix="dv-victim" legend="피해자" />
        </section>
      </FlexCol>
      <FlexCol>
        <section aria-labelledby="dv-offender-heading">
          <h4 id="dv-offender-heading" class="lp-label-text lp-section-title ac">가해자</h4>
          <CasePersonFields :person="detail.offender" id-prefix="dv-offender" legend="가해자" />
        </section>
      </FlexCol>
    </FlexRow>

    <div class="lp-form-box lp-table-gap">
      <Checkbox v-model="detail.sameAddressAs112" label="112신고 동일주소" />
    </div>

    <InfoTable :columns="1" size="90" class="lp-table-gap">
      <!-- AddressInput 은 두 입력이 각자 aria-label 을 갖는다 — InfoField 에 for 를 주지 않는다 -->
      <InfoField label="주소지">
        <AddressInput
          v-model="detail.address"
          v-model:detail="detail.addressDetail"
          size="sm"
          class="flex-1"
          :disabled="detail.sameAddressAs112"
          @search="emit('search-address')"
        />
      </InfoField>
    </InfoTable>

    <InfoTable :columns="2" size="90" class="form-rest">
      <InfoField label="관계" for="dv-relation">
        <SelectField
          id="dv-relation"
          v-model="detail.relation"
          :options="relationOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>
      <InfoField label="아동유무">
        <RadioGroup v-model="detail.hasChild" :class="infoStyles['info-table-radio']" aria-label="아동유무">
          <RadioGroupItem value="yes" label="유" />
          <RadioGroupItem value="no" label="무" />
        </RadioGroup>
      </InfoField>

      <InfoField label="관서" for="dv-station">
        <SelectField
          id="dv-station"
          v-model="detail.station"
          :options="stationOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>
      <InfoField label="자동배정">
        <RadioGroup v-model="detail.autoAssign" :class="infoStyles['info-table-radio']" aria-label="자동배정">
          <RadioGroupItem value="yes" label="유" />
          <RadioGroupItem value="no" label="무" />
        </RadioGroup>
      </InfoField>
    </InfoTable>
  </section>

  <!-- ── 사건처리 참고기준 ─────────────────────── -->
  <section class="lp-section" aria-labelledby="dv-reference-heading">
    <h3 id="dv-reference-heading" class="lp-heading-md lp-section-title">사건처리 참고기준</h3>
    <CheckItemList :items="domesticReferenceItems" :values="detail.references" />
    <p class="form-note lp-table-gap">[범죄 유형에 따른 조치 기준]</p>
    <p class="form-note">
      * 1~5번 → 체포 · 임의동행 · 발생보고 / 6번 → 발생보고(피해자가 명시적으로 사건처리를 원치 않는
      경우에만 현장종결)
    </p>
  </section>

  <!-- ── 긴급임시조치 결정문항 ─────────────────── -->
  <section class="lp-section" aria-labelledby="dv-decision-heading">
    <div class="lp-row-between lp-section-title">
      <h3 id="dv-decision-heading" class="lp-heading-md">긴급임시조치 결정문항</h3>
      <p class="form-note notice-strong">* 1개만 해당할 경우에도 긴급 임시조치 적극 실시</p>
    </div>
    <h4 class="lp-section-title">
      <Badge color="grayLighter" size="md">경찰관 확인 · 판단</Badge>
    </h4>
    <CheckItemList :items="domesticDecisionItems" :values="detail.decisions" />
  </section>

  <!-- ── 긴급임시조치 평가 기준 ────────────────── -->
  <section class="lp-section" aria-labelledby="dv-score-heading">
    <div class="lp-row-between lp-section-title">
      <h3 id="dv-score-heading" class="lp-heading-md">긴급임시조치 평가 기준</h3>
      <p class="form-note notice-strong">* 총점 5점 이상인 경우 긴급임시조치 적극실시</p>
    </div>
    <ScoreItemList :items="domesticScoreItems" :values="detail.scores" />
    <p class="lp-score-box lp-table-gap">점수 <b>{{ score }}</b> 점</p>
  </section>

  <!-- ── 긴급임시조치 未실시 사유 ──────────────── -->
  <section class="lp-section" aria-labelledby="dv-skip-heading">
    <h3 id="dv-skip-heading" class="lp-heading-md lp-section-title">긴급임시조치 未실시 사유</h3>
    <p class="form-note">
      * 긴급임시조치 결정문항에 해당되거나 평가기준 5점 이상에 해당됨에도 긴급임시조치를 미실시하는
      경우에만 작성하여 주시기 바랍니다.
    </p>
    <TextareaField
      v-model="detail.skipReason"
      aria-label="긴급임시조치 미실시 사유"
      class="w-full !space-y-0"
      textarea-class="w-full"
      :height="110"
      placeholder="내용을 입력하세요"
    />
  </section>

  <!-- ── (긴급) 임시조치 내용 ──────────────────── -->
  <section class="lp-section" aria-labelledby="dv-urgent-heading">
    <div class="lp-row-between lp-section-title">
      <h3 id="dv-urgent-heading" class="lp-heading-md">
        <Checkbox v-model="detail.urgentEnabled" label="(긴급) 임시조치 내용" />
      </h3>
      <Button type="button" variant="tertiary" size="sm" @click="emit('print')">인쇄</Button>
    </div>

    <h4 class="lp-label-text lp-section-title">1. 가해자</h4>
    <InfoTable :columns="2" size="90">
      <InfoField label="성명">
        <span class="readonly-text">{{ detail.offender.name }}</span>
      </InfoField>
      <InfoField label="생년월일">
        <span class="readonly-text">{{ detail.offender.birthDate }}</span>
      </InfoField>
      <InfoField label="주소지" full>
        <AddressInput
          v-model="detail.urgentAddress"
          v-model:detail="detail.urgentAddressDetail"
          size="sm"
          class="flex-1"
          :disabled="!detail.urgentEnabled"
          @search="emit('search-address')"
        />
      </InfoField>
      <InfoField label="성별" full>
        <span class="readonly-text">{{ genderLabel(detail.offender.gender) }}</span>
      </InfoField>
    </InfoTable>

    <InfoTable :columns="1" size="90" class="lp-table-gap">
      <InfoField label="통보일시" for="dv-urgent-date">
        <div class="lp-unit-row">
          <DatePicker id="dv-urgent-date" v-model="detail.urgentNoticeDate" size="sm" input-class="w-40" :disabled="!detail.urgentEnabled" />
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
      <InfoField label="통보장소" for="dv-urgent-place">
        <InputField2 id="dv-urgent-place" v-model="detail.urgentNoticePlace" size="sm" :disabled="!detail.urgentEnabled" class="!space-y-0 flex-1" input-class="w-full" />
      </InfoField>
    </InfoTable>

    <h4 class="lp-label-text lp-section-title lp-table-gap">(긴급) 아동 임시조치 내용</h4>
    <div class="lp-form-box">
      <Checkbox
        v-for="m in urgentMeasures"
        :key="m.id"
        v-model="detail.urgentMeasures[m.id]"
        :disabled="!detail.urgentEnabled"
        :label="m.text"
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
  domesticReferenceItems,
  domesticDecisionItems,
  domesticScoreItems,
  relationOptions,
  stationOptions,
  noticeTimeOptions,
  type DomesticDetail,
} from '../composable/PC-PUB-0208'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'

defineProps<{
  /** 부모의 reactive 객체를 그대로 받아 고친다 */
  detail: DomesticDetail
  score: number
}>()

const emit = defineEmits<{
  (e: 'print'): void
  (e: 'search-report'): void
  (e: 'search-address'): void
}>()

/** 시안의 (긴급) 임시조치 4개 */
const urgentMeasures = [
  { id: 'm1', text: '피해자 또는 가정구성원의 주거 또는 점유하는 방실로부터의 퇴거 등 격리' },
  { id: 'm2', text: '피해아동 또는 가정구성원의 주거, 직장 등에서 100미터 이내의 접근금지' },
  { id: 'm3', text: '피해자 또는 가정구성원에 대한 『전기통신기본법』제2조 제1호의 전기통신을 이용한 접근금지' },
  { id: 'm4', text: '국가경찰관의 유치장 또는 구치소에의 유치' },
]

function genderLabel(value: string) {
  if (value === 'male') return '남'
  if (value === 'female') return '여'
  return ''
}
</script>
