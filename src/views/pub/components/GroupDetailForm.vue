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
import styles from '../style/GroupDetailForm.module.css'

/**
 * 단체정보 상세(PC-PUB-0302)/등록(PC-PUB-0303) 공용 폼.
 * 두 화면 다 필드 구성이 완전히 같고, 부서 표시 방식(신규=선택, 상세=고정 텍스트)만 달라서
 * mode 로 그 부분만 가른다. 저장/삭제/목록 이동 버튼은 페이지 헤더 쪽 관례라 각 페이지에서 둔다.
 */
const props = defineProps<{
  form: GroupDetailForm
  mode: 'new' | 'edit'
}>()

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

const equipmentColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '날짜', field: 'date', width: 130, hozAlign: 'center', cellType: 'date' },
  ...equipmentColumnLabels.map((c): TabulatorGridColumn => ({ title: c.label, field: c.field, width: 80, hozAlign: 'center', cellType: 'input' })),
  { title: '총금액(원)', field: 'amount', width: 110, hozAlign: 'center', cellType: 'input' },
  { title: '비고', field: 'note', width: 160, cellType: 'input' },
]

const budgetColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '날짜', field: 'date', hozAlign: 'center', cellType: 'date' },
  { title: '금액(원)', field: 'amount', hozAlign: 'center', cellType: 'input' },
]

const awardColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '날짜', field: 'date', width: 130, hozAlign: 'center', cellType: 'date' },
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
</script>

<template>
  <p :class="styles.legend">• 필수 입력 항목</p>

  <InfoTable :columns="2">
    <InfoField v-if="mode === 'new'" full>
      <template #label>부서<span :class="styles.requiredDot" /></template>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </InfoField>

    <InfoField for="group-type">
      <template #label>단체종류<span :class="styles.requiredDot" /></template>
      <div :class="styles.row">
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
          placeholder="단체종류 입력"
          class="!space-y-0 flex-1"
        />
      </div>
    </InfoField>
    <InfoField for="group-name">
      <template #label>단체명<span :class="styles.requiredDot" /></template>
      <InputField2 id="group-name" v-model="form.groupName" size="sm" class="!space-y-0 flex-1" />
    </InfoField>

    <InfoField for="group-founded-date">
      <template #label>설립일<span :class="styles.requiredDot" /></template>
      <DatePicker id="group-founded-date" v-model="form.foundedDate" size="sm" class="!space-y-0 flex-1" />
    </InfoField>
    <InfoField for="group-leader">
      <template #label>대표자명<span :class="styles.requiredDot" /></template>
      <InputField2 id="group-leader" v-model="form.leaderName" size="sm" class="!space-y-0 flex-1" />
    </InfoField>

    <InfoField for="group-phone">
      <template #label>전화번호<span :class="styles.requiredDot" /></template>
      <InputField2 id="group-phone" v-model="form.phone" size="sm" class="!space-y-0 flex-1" />
    </InfoField>
    <InfoField>
      <template #label>구성인원<span :class="styles.requiredDot" /></template>
      <div :class="styles.row">
        <span :class="styles.memberTotal">{{ form.memberMale + form.memberFemale }}명</span>
        <span>남</span>
        <Stepper v-model="form.memberMale" :min="0" label="남자 인원" />
        <span>여</span>
        <Stepper v-model="form.memberFemale" :min="0" label="여자 인원" />
      </div>
    </InfoField>

    <InfoField>
      <template #label>보험가입인원</template>
      <Stepper v-model="form.insuredCount" :min="0" label="보험가입인원" />
    </InfoField>
    <InfoField>
      <template #label>보유차량수</template>
      <Stepper v-model="form.vehicleCount" :min="0" label="보유차량수" />
    </InfoField>

    <InfoField label="주소" full layout="column">
      <div :class="styles.row">
        <InputField2 v-model="form.address" size="sm" placeholder="주소검색" readonly class="!space-y-0 flex-1" />
        <Button type="button" variant="secondary" size="sm" @click="addressSearchOpen = true">주소검색</Button>
      </div>
      <InputField2 v-model="form.addressDetail" size="sm" placeholder="상세주소" class="!space-y-0 mt-2" />
    </InfoField>

    <InfoField label="주요활동지역 및 활동시간" full>
      <InputField2 v-model="form.activityAreaTime" size="sm" class="!space-y-0 flex-1" />
    </InfoField>

    <InfoField label="비고" full layout="column">
      <TextareaField v-model="form.note" class="w-full !space-y-0" textarea-class="w-full" :height="80" />
    </InfoField>
  </InfoTable>

  <section :class="styles.section">
    <div :class="styles.sectionHeader">
      <h2 :class="styles.sectionTitle">장비지원현황</h2>
      <div :class="styles.sectionActions">
        <Button type="button" variant="tertiary2" size="sm" @click="equipmentGridRef?.deleteSelected()">선택삭제</Button>
        <Button type="button" variant="secondary" size="sm" @click="addEquipmentRow">추가</Button>
      </div>
    </div>
    <TabulatorGrid
      ref="equipmentGridRef"
      v-model:data="form.equipmentSupport"
      :columns="equipmentColumns"
      layout="fitDataFill"
      select-mode="checkbox"
      height="22rem"
      placeholder="등록된 장비지원 내역이 없습니다"
    />
  </section>

  <div :class="styles.sectionGrid">
    <section :class="styles.section">
      <div :class="styles.sectionHeader">
        <h2 :class="styles.sectionTitle">지자체 예산지원현황</h2>
        <div :class="styles.sectionActions">
          <Button type="button" variant="tertiary2" size="sm" @click="budgetGridRef?.deleteSelected()">선택삭제</Button>
          <Button type="button" variant="secondary" size="sm" @click="addBudgetRow">추가</Button>
        </div>
      </div>
      <TabulatorGrid
        ref="budgetGridRef"
        v-model:data="form.budgetSupport"
        :columns="budgetColumns"
        select-mode="checkbox"
        height="18rem"
        placeholder="등록된 예산지원 내역이 없습니다"
      />
    </section>

    <section :class="styles.section">
      <div :class="styles.sectionHeader">
        <h2 :class="styles.sectionTitle">포상현황</h2>
        <div :class="styles.sectionActions">
          <Button type="button" variant="tertiary2" size="sm" @click="awardGridRef?.deleteSelected()">선택삭제</Button>
          <Button type="button" variant="secondary" size="sm" @click="addAwardRow">추가</Button>
        </div>
      </div>
      <TabulatorGrid
        ref="awardGridRef"
        v-model:data="form.awards"
        :columns="awardColumns"
        select-mode="checkbox"
        height="18rem"
        placeholder="등록된 포상 내역이 없습니다"
      />
    </section>
  </div>

  <AddressSearchDialog v-model:open="addressSearchOpen" @select="onSelectAddress" />
</template>
