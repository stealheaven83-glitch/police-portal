<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import Stepper from '@/components/custom/input/Stepper.vue'
import { Button } from '@/components/custom/button'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import AddressSearchDialog from './AddressSearchDialog.vue'
import { groupTypeOptions, equipmentColumnLabels, type GroupDetailForm } from '../composable/publicSafety'

/**
 * 단체정보 상세(PC-PUB-0302)/등록(PC-PUB-0303) 공용 폼.
 * 두 화면 다 필드 구성이 완전히 같고, 부서 표시 방식(신규=선택, 상세=고정 텍스트)만 달라서
 * mode 로 그 부분만 가른다. 저장/삭제/목록 이동 버튼은 페이지 헤더 쪽 관례라 각 페이지에서 둔다.
 */
const props = defineProps<{
  form: GroupDetailForm
  mode: 'new' | 'edit'
}>()

const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'

const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
const addressSearchOpen = ref(false)

/**
 * DepartmentCascadeSelect 는 <script setup> 이라 자기 기본 트리(라벨 데이터)를 내보낼 수 없어서
 * (script setup 은 값을 export 할 수 없다) 표시용 라벨만 필요한 최소 매핑을 여기 따로 둔다.
 * 코드값(hq, busan 등)을 못 찾으면 코드값을 그대로 보여준다.
 */
const departmentLabels: Record<string, string> = {
  hq: '본청',
  busan: '부산청',
  daegu: '대구청',
  'busan-central': '부산중부서',
  'busan-east': '부산동부서',
  'daegu-central': '대구중부서',
}

watch(
  department,
  (dept) => {
    if (props.mode !== 'new') return
    // 신규 등록에서만 부서 캐스케이드 선택값을 표시용 텍스트로 합쳐 폼에 반영한다.
    // immediate 로 초기값도 반영해야, 사용자가 부서를 한 번도 안 건드리고 저장해도 dept 가 비지 않는다.
    const parts = [dept.level1, dept.level2, dept.level3]
      .filter((v) => v && v !== 'all')
      .map((v) => departmentLabels[v] ?? v)
    props.form.dept = parts.join(' ')
  },
  { deep: true, immediate: true },
)

function onSelectAddress(address: string) {
  props.form.address = address
}

// 폭은 시안 기준. 장비 컬럼 11개는 89px 씩이라 전체가 컨테이너 폭에 맞아 가로 스크롤이 없다.
const equipmentColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '날짜', field: 'date', width: 148, hozAlign: 'center', cellType: 'date' },
  ...equipmentColumnLabels.map((c): TabulatorGridColumn => ({ title: c.label, field: c.field, width: 89, hozAlign: 'center', cellType: 'input' })),
  { title: '총금액(원)', field: 'amount', width: 120, hozAlign: 'center', cellType: 'input' },
  { title: '비고', field: 'note', width: 180, hozAlign: 'center', cellType: 'input' },
]

const budgetColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '날짜', field: 'date', hozAlign: 'center', cellType: 'date' },
  { title: '금액(원)', field: 'amount', hozAlign: 'center', cellType: 'input' },
]

const awardColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '날짜', field: 'date', width: 180, hozAlign: 'center', cellType: 'date' },
  { title: '경찰청장', field: 'policeCommissioner', hozAlign: 'center', cellType: 'input' },
  { title: '지방청장', field: 'provincialCommissioner', hozAlign: 'center', cellType: 'input' },
  { title: '경찰서장', field: 'stationChief', hozAlign: 'center', cellType: 'input' },
  { title: '비고', field: 'note', hozAlign: 'center', cellType: 'input' },
]

function nextRowId<T extends { id: number }>(rows: T[]) {
  return rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1
}

function addEquipmentRow() {
  props.form.equipmentSupport = [
    { id: nextRowId(props.form.equipmentSupport), date: '', vest: 0, baton: 0, flashlight: 0, cap: 0, raincoat: 0, gloves: 0, whistle: 0, jumper: 0, earmuffs: 0, liner: 0, etc: 0, amount: 0, note: '' },
    ...props.form.equipmentSupport,
  ]
}

function addBudgetRow() {
  props.form.budgetSupport = [{ id: nextRowId(props.form.budgetSupport), date: '', amount: 0 }, ...props.form.budgetSupport]
}

function addAwardRow() {
  props.form.awards = [
    { id: nextRowId(props.form.awards), date: '', policeCommissioner: '', provincialCommissioner: '', stationChief: '', note: '' },
    ...props.form.awards,
  ]
}

const equipmentGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const budgetGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const awardGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

const isEtcType = computed(() => props.form.groupType === 'etc')
const memberTotal = computed(() => props.form.memberMale + props.form.memberFemale)
</script>

<template>
  <section class="lp-section" aria-labelledby="group-info-heading">
    <h2 id="group-info-heading" class="lp-heading-md lp-section-title">방범협력단체 정보</h2>

    <!--
      시안 기준 3열 배치. 주소가 두 행을 차지하고(row-span) 나머지 칸은 그리드 자동 배치로 흘러간다:
      1행 단체종류/단체명/설립일 · 2행 대표자명/전화번호/구성인원 · 3행 보험가입인원/주소/주요활동지역
      · 4행 보유차량수(+주소 이어짐) · 5행 비고(전체 폭)
    -->
    <!-- 라벨 열은 시안대로 120px — InfoTable 기본값(14rem)보다 좁다 -->
    <InfoTable :columns="3" size="120">
      <InfoField v-if="mode === 'new'" label="부서" full>
        <DepartmentCascadeSelect v-model="department" size="sm" />
      </InfoField>

      <InfoField for="group-type" label="단체종류">
        <div class="group-gap2 lp-flex-fill">
          <SelectField
            id="group-type"
            v-model="form.groupType"
            :options="groupTypeOptions"
            size="sm"
            trigger-class="w-full"
            class="!space-y-0 flex-1"
            placeholder="선택"
          />
          <InputField2
            v-if="isEtcType"
            v-model="form.groupTypeEtc"
            size="sm"
             trigger-class="w-full"
            placeholder="단체종류 입력"
            class="!space-y-0 flex-1 "
          />
        </div>
      </InfoField>
      <InfoField for="group-name" label="단체명">
        <InputField2 id="group-name" v-model="form.groupName" size="sm" class="!space-y-0 flex-1" />
      </InfoField>
      <InfoField for="group-founded-date" label="설립일">
        <DatePicker id="group-founded-date" v-model="form.foundedDate" size="sm" class="!space-y-0 flex-1" />
      </InfoField>

      <InfoField for="group-leader" label="대표자명">
        <InputField2 id="group-leader" v-model="form.leaderName" size="sm" class="!space-y-0 flex-1" />
      </InfoField>
      <InfoField for="group-phone" label="전화번호">
        <InputField2 id="group-phone" v-model="form.phone" size="sm" class="!space-y-0 flex-1" />
      </InfoField>
      <InfoField label="구성인원">
        <div class="lp-field-row">
          <span class="lp-nowrap">{{ memberTotal }} 명</span>
          <span class="group-gap3">
            <span>남자</span>
            <Stepper v-model="form.memberMale" :min="0" label="남자 인원" class="w-[9.2rem]" />
          </span>
          <span class="group-gap3">
            <span>여자</span>
            <Stepper v-model="form.memberFemale" :min="0" label="여자 인원" class="w-[9.2rem]" />
          </span>
        </div>
      </InfoField>

      <InfoField label="보험가입인원">
        <Stepper v-model="form.insuredCount" :min="0" label="보험가입인원" class="w-[17.6rem]" />
      </InfoField>
      <InfoField label="주소" layout="column" :row-span="2">
        <InputField2
          id="group-address"
          v-model="form.address"
          size="sm"
          class="!space-y-0 w-full"
          placeholder="주소검색"
          readonly
          :icon="searchIcon"
          icon-class="size-5"
          icon-label="주소 검색"
          search
          @icon-click="addressSearchOpen = true"
        />
        <InputField2
          id="group-address-detail"
          v-model="form.addressDetail"
          size="sm"
          class="!space-y-0 w-full"
          placeholder="상세주소"
        />
      </InfoField>
      <InfoField for="group-activity-area" label="주요활동지역 및 활동시간">
        <InputField2 id="group-activity-area" v-model="form.activityAreaTime" size="sm" class="!space-y-0 flex-1" />
      </InfoField>

      <InfoField label="보유차량수">
        <Stepper v-model="form.vehicleCount" :min="0" label="보유차량수" class="w-[17.6rem]" />
      </InfoField>
      <!-- 주소가 두 행을 차지해 비는 칸. 표 테두리를 시안처럼 이어 주기만 하는 자리라 읽어줄 내용이 없다 -->
      <InfoField class="lp-info-blank-cell" aria-hidden="true" />

      <InfoField for="group-note" label="비고" full layout="column">
        <TextareaField id="group-note" v-model="form.note" class="w-full !space-y-0" textarea-class="w-full" :height="80" />
      </InfoField>
    </InfoTable>
  </section>

  <section class="lp-section" aria-labelledby="equipment-heading">
    <div class="section-bar">
      <h2 id="equipment-heading">장비지원 현황</h2>
      <div class="section-bar-actions">
        <Button type="button" variant="tertiary2" size="xs" @click="equipmentGridRef?.deleteSelected()">선택삭제</Button>
        <Button type="button" variant="tertiary2" size="xs" @click="addEquipmentRow">추가</Button>
      </div>
    </div>
    <TabulatorGrid
      ref="equipmentGridRef"
      v-model:data="form.equipmentSupport"
      class="grid-wrap"
      :columns="equipmentColumns"
      select-mode="checkbox"
      height="18rem"
      placeholder="등록된 장비지원 내역이 없습니다"
    />
  </section>

  <section class="lp-section" aria-labelledby="budget-heading">
    <div class="section-bar">
      <h2 id="budget-heading">지자체 예산 지원 현황</h2>
      <div class="section-bar-actions">
        <Button type="button" variant="tertiary2" size="xs" @click="budgetGridRef?.deleteSelected()">선택삭제</Button>
        <Button type="button" variant="tertiary2" size="xs" @click="addBudgetRow">추가</Button>
      </div>
    </div>
    <TabulatorGrid
      ref="budgetGridRef"
      v-model:data="form.budgetSupport"
      class="grid-wrap"
      :columns="budgetColumns"
      select-mode="checkbox"
      height="18rem"
      placeholder="등록된 예산지원 내역이 없습니다"
    />
  </section>

  <section class="lp-section" aria-labelledby="award-heading">
    <div class="section-bar">
      <h2 id="award-heading">포상 현황</h2>
      <div class="section-bar-actions">
        <Button type="button" variant="tertiary2" size="xs" @click="awardGridRef?.deleteSelected()">선택삭제</Button>
        <Button type="button" variant="tertiary2" size="xs" @click="addAwardRow">추가</Button>
      </div>
    </div>
    <TabulatorGrid
      ref="awardGridRef"
      v-model:data="form.awards"
      class="grid-wrap"
      :columns="awardColumns"
      select-mode="checkbox"
      height="18rem"
      placeholder="등록된 포상 내역이 없습니다"
    />
  </section>

  <AddressSearchDialog v-model:open="addressSearchOpen" @select="onSelectAddress" />
</template>
