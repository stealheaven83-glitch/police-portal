<script setup lang="ts">
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { regionOptions, type MentalCenterDetail } from '../composable/mentalEmergency'
import styles from '../style/MentalCenterDetailForm.module.css'

/**
 * 정신응급대응팀 상세(PM-PUB-0414)/등록(PC-PUB-0415) 공용 폼.
 * 두 화면의 항목 구성(지역 · 센터명 · 연락처 · 총 병상 수)이 완전히 같아 하나로 둔다.
 * 저장/삭제/신규 버튼은 화면마다 위치가 달라 각 페이지에서 둔다.
 *
 * 2단 분할의 좁은 패널에 들어가므로 InfoTable 은 columns="1" 이다(2 로 두면 값 영역이 겹친다).
 * id 는 두 화면이 동시에 떠 있지 않아도 접두어를 달리해 label for 가 엉키지 않게 한다.
 */
const props = defineProps<{
  form: MentalCenterDetail
  /** 필드 id 접두어. 화면마다 다르게 준다(예: 'mental-detail', 'mental-new') */
  idPrefix: string
}>()

/** 입력값은 문자열로 올라오는데 총 병상 수는 숫자로 다룬다(빈 칸·숫자 아닌 값은 0) */
function onBedTotalInput(value: string | number) {
  props.form.bedTotal = Number(value) || 0
}
</script>

<template>
  <!-- 기획서 시안: 폼 위 안내 문구 -->
  <p class="form-note">※ 센터명에 언더바(“_”)를 제외한 특수문자 사용은 불가합니다</p>

  <InfoTable :columns="1">
    <InfoField label="지역" :for="`${props.idPrefix}-region`">
      <SelectField
        :id="`${props.idPrefix}-region`"
        v-model="form.region"
        :options="regionOptions"
        placeholder="선택"
        size="sm"
        trigger-class="w-full"
        class="!space-y-0 w-[180px]"
      />
    </InfoField>

    <InfoField label="센터명" :for="`${props.idPrefix}-name`">
      <InputField2
        :id="`${props.idPrefix}-name`"
        v-model="form.name"
        size="sm"
        class="!space-y-0 flex-1"
      />
    </InfoField>

    <InfoField label="연락처">
      <div :class="styles.valueRow">
        <InputField2
          v-model="form.phone1"
          size="sm"
          inputmode="numeric"
          maxlength="4"
          aria-label="연락처 지역번호"
          class="!space-y-0 flex-1"
          input-class="text-center"
        />
        <span :class="styles.hyphen" aria-hidden="true">-</span>
        <InputField2
          v-model="form.phone2"
          size="sm"
          inputmode="numeric"
          maxlength="4"
          aria-label="연락처 국번"
          class="!space-y-0 flex-1"
          input-class="text-center"
        />
        <span :class="styles.hyphen" aria-hidden="true">-</span>
        <InputField2
          v-model="form.phone3"
          size="sm"
          inputmode="numeric"
          maxlength="4"
          aria-label="연락처 뒷번호"
          class="!space-y-0 flex-1"
          input-class="text-center"
        />
      </div>
    </InfoField>

    <InfoField label="총 병상 수" :for="`${props.idPrefix}-bed-total`">
      <div :class="styles.valueRow">
        <InputField2
          :id="`${props.idPrefix}-bed-total`"
          :model-value="form.bedTotal"
          @update:model-value="onBedTotalInput"
          size="sm"
          inputmode="numeric"
          class="!space-y-0 w-[80px]"
        />
        <span :class="styles.unit">개</span>
      </div>
    </InfoField>
  </InfoTable>
</template>
