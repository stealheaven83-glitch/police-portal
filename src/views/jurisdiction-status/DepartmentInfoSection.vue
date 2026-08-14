<script setup lang="ts">
import { ref } from 'vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import MultiCheckSelect from '@/components/custom/select/MultiCheckSelect.vue'
import Stepper from '@/components/custom/input/Stepper.vue'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import Icon from '@/components/custom/icon/Icon.vue'
import type { DepartmentInfoForm, SelectOption } from './useJurisdictionStatusForm'
import styles from './infoGrid.module.css'

const props = defineProps<{
  modelValue: DepartmentInfoForm
  workTypeOptions: SelectOption[]
  regionOptions: SelectOption[]
  jurisdictionPostOptions: SelectOption[]
}>()

function postLabels(values: string[]) {
  return props.jurisdictionPostOptions
    .filter((opt) => values.includes(opt.value))
    .map((opt) => opt.label)
    .join(', ') || '지정된 파출소 없음'
}

const addressSearchOpen = ref(false)
</script>

<template>
  <section :class="styles.section" aria-labelledby="department-info-heading">
    <div :class="styles.sectionHead">
      <h3 id="department-info-heading" :class="styles.sectionTitle">부서정보</h3>
    </div>

    <div :class="styles.grid">
      <!-- 부서명 -->
      <div :class="styles.field">
        <span :class="styles.label" id="lbl-dept-name">부서명</span>
        <div :class="styles.control" role="group" aria-labelledby="lbl-dept-name">
          <p :class="styles.staticValue">{{ modelValue.deptName }}</p>
        </div>
      </div>

      <!-- 개소년도 -->
      <div :class="styles.field">
        <label :class="styles.label" for="dept-open-year">개소년도</label>
        <div :class="styles.control">
          <DatePicker id="dept-open-year" v-model="modelValue.openYear" size="sm" input-class="w-full max-w-[18rem]" />
        </div>
      </div>

      <!-- 급지 / 정원 -->
      <div :class="styles.field">
        <span :class="styles.label" id="lbl-grade-level">급지</span>
        <div :class="styles.control" role="group" aria-labelledby="lbl-grade-level">
          <Stepper v-model="modelValue.gradeLevel" :min="1" :max="9" label="급지" />
          <label class="text-[1.4rem] text-[var(--Text-body_1)]" for="dept-capacity">정원</label>
          <InputField2
            id="dept-capacity"
            v-model="modelValue.capacity"
            size="sm"
            input-class="w-20"
            class="!space-y-0"
          />
          <span :class="styles.hint">경찰관 현원 {{ modelValue.currentHeadcount }}명</span>
        </div>
      </div>

      <!-- 소재지 주소 -->
      <div :class="styles.field">
        <label :class="styles.label" for="dept-address-road">소재지 주소</label>
        <div :class="styles.control">
          <InputField2
            id="dept-address-road"
            v-model="modelValue.addressRoad"
            size="sm"
            input-class="w-full max-w-[26rem]"
            class="!space-y-0 flex-1 min-w-[16rem]"
            placeholder="도로명주소"
          />
          <Button type="button" variant="tertiary2" size="sm" @click="addressSearchOpen = true">
            <Icon name="search" :size="16" aria-label="" />
            주소검색
          </Button>
        </div>
      </div>

      <!-- 소재지 -->
      <div :class="styles.field">
        <label :class="styles.label" for="dept-region">소재지</label>
        <div :class="styles.control">
          <SelectField
            id="dept-region"
            v-model="modelValue.region"
            :options="regionOptions"
            size="sm"
            trigger-class="w-full max-w-[18rem]"
            class="!space-y-0"
            placeholder="선택"
          />
        </div>
      </div>

      <!-- 상세주소 -->
      <div :class="styles.field">
        <label :class="styles.label" for="dept-address-detail">상세주소</label>
        <div :class="styles.control">
          <InputField2 id="dept-address-detail" v-model="modelValue.addressDetail" size="sm" class="!space-y-0 flex-1" />
        </div>
      </div>

      <!-- 일반전화 -->
      <div :class="styles.field">
        <label :class="styles.label" for="dept-phone">일반전화</label>
        <div :class="styles.control">
          <InputField2 id="dept-phone" v-model="modelValue.phone" size="sm" class="!space-y-0 flex-1" placeholder="00-0000-0000" />
        </div>
      </div>

      <!-- 경비전화 -->
      <div :class="styles.field">
        <label :class="styles.label" for="dept-guard-phone">경비전화</label>
        <div :class="styles.control">
          <InputField2 id="dept-guard-phone" v-model="modelValue.guardPhone" size="sm" class="!space-y-0 flex-1" placeholder="00-0000-0000" />
        </div>
      </div>

      <!-- 경비팩스 -->
      <div :class="styles.field">
        <label :class="styles.label" for="dept-guard-fax">경비팩스</label>
        <div :class="styles.control">
          <InputField2 id="dept-guard-fax" v-model="modelValue.guardFax" size="sm" class="!space-y-0 flex-1" placeholder="00-0000-0000" />
        </div>
      </div>

      <!-- 근무형태 -->
      <div :class="styles.field">
        <label :class="styles.label" for="dept-work-type">근무형태</label>
        <div :class="styles.control">
          <SelectField
            id="dept-work-type"
            v-model="modelValue.workType"
            :options="workTypeOptions"
            size="sm"
            trigger-class="w-full max-w-[18rem]"
            class="!space-y-0"
            placeholder="선택"
          />
        </div>
      </div>

      <!-- 근무주기 -->
      <div :class="styles.field">
        <label :class="styles.label" for="dept-work-cycle">근무주기</label>
        <div :class="styles.control">
          <InputField2 id="dept-work-cycle" v-model="modelValue.workCycle" size="sm" class="!space-y-0 flex-1" />
        </div>
      </div>

      <!-- 주간전종인원 -->
      <div :class="styles.field">
        <label :class="styles.label" for="dept-day-shift">주간전종인원</label>
        <div :class="styles.control">
          <InputField2 id="dept-day-shift" v-model="modelValue.dayShiftCount" size="sm" class="!space-y-0 flex-1" />
        </div>
      </div>

      <!-- 야간전종인원 -->
      <div :class="styles.field">
        <label :class="styles.label" for="dept-night-shift">야간전종인원</label>
        <div :class="styles.control">
          <InputField2 id="dept-night-shift" v-model="modelValue.nightShiftCount" size="sm" class="!space-y-0 flex-1" />
        </div>
      </div>

      <!-- 유연 파출소 여부 x2 -->
      <div
        v-for="(group, index) in modelValue.flexiblePosts"
        :key="index"
        :class="[styles.field, styles.fieldFull]"
      >
        <span :class="styles.label" :id="`lbl-flexible-post-${index}`">유연 파출소 여부</span>
        <div :class="styles.control" role="group" :aria-labelledby="`lbl-flexible-post-${index}`">
          <div :class="styles.flexiblePostGroup">
            <Checkbox v-model="group.enabled" :label="`유연 파출소 ${index + 1}조 운영`" />
            <label class="text-[1.4rem] text-[var(--Text-body_1)]" :for="`dept-flexible-agency-${index}`">통합운영 관서</label>
            <MultiCheckSelect
              :id="`dept-flexible-agency-${index}`"
              v-model="group.agencies"
              :options="jurisdictionPostOptions"
              :disabled="!group.enabled"
              size="sm"
              :trigger-class="styles.flexiblePostSelect"
              group-label="통합운영 관서 선택"
            />
            <span :class="styles.previewText">{{ postLabels(group.agencies) }}</span>
          </div>
        </div>
      </div>

      <!-- 통합관리반 -->
      <div :class="[styles.field, styles.fieldFull]">
        <span :class="styles.label" id="lbl-integrated-team">통합관리반</span>
        <div :class="styles.control" role="group" aria-labelledby="lbl-integrated-team">
          <Checkbox v-model="modelValue.integratedTeam" label="통합관리반 운영" />
        </div>
      </div>
    </div>

    <EmptyStubDialog v-model:open="addressSearchOpen" title="주소 검색" description="도로명/지번 주소를 검색해 자동으로 입력합니다." />
  </section>
</template>
