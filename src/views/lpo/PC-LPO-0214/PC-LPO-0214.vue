<template>
  <PageHeader>
    <template #left>
      <PageTitle title="기본주기설정" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div class="lp-row-between">
    <span class="group-gap2">
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </span>
    <span class="group-gap2">
      <Button type="button" variant="secondary" size="sm" @click="onNew">신규</Button>
      <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
    </span>
  </div>

  <div class="lp-page-scroll">
    <p class="lp-heading-md lp-table-gap">기본주기설정</p>
    <div class="lp-row-between lp-table-gap">
      <span class="search-area">
        <SelectField v-model="groupCount" :options="groupOptions" size="sm" triggerClass="w-20" aria-label="조 수" />
        <span class="lp-label-text">조</span>
        <NumberStepper v-model="shiftCount" :min="1" :max="9" aria-label="교대 수" />
        <span class="lp-label-text">교대</span>
        <NumberStepper v-model="dayCycle" :min="1" :max="30" aria-label="일 주기" />
        <span class="lp-label-text">일 주기</span>
      </span>
      <span class="group-gap2">
        <SelectField
          v-model="basicCycle"
          :options="basicCycleOptions"
          placeholder="기본 주기 선택"
          size="sm"
          triggerClass="w-40"
          :disabled="noBasicCycle"
          aria-label="기본 주기"
        />
        <Button type="button" variant="tertiary2" size="sm" :disabled="noBasicCycle" @click="onApplyCycle">
          기본 주기 설정 적용
        </Button>
        <Button type="button" variant="tertiary2" size="sm" @click="noBasicCycle = !noBasicCycle">
          기본주기 없음
        </Button>
      </span>
    </div>

    <GridTitle title="교대 형태 설정" class="lp-table-gap">
      <Button type="button" variant="tertiary2" size="sm" @click="onDeleteShiftRows">선택삭제</Button>
      <Button type="button" variant="secondary" size="sm" @click="addShiftFormRow">추가</Button>
    </GridTitle>
    <TabulatorGrid
      :columns="shiftColumns"
      :data="shiftFormRows"
      layout="fitColumns"
      select-mode="checkbox"
      placeholder="등록된 교대 형태가 없습니다"
      @row-selection-changed="onShiftSelectionChanged"
    />

    <GridTitle title="팀 일자 별 배치" class="lp-table-gap">
      <Button type="button" variant="tertiary2" size="sm" @click="onDeleteTeamRows">선택삭제</Button>
      <Button type="button" variant="secondary" size="sm" @click="addTeamPlanRow">추가</Button>
    </GridTitle>
    <div class="search-area lp-table-gap">
      <span class="lp-label-text">현재(오늘) 배치 일자</span>
      <NumberStepper v-model="todayPlanDay" :min="1" :max="4" aria-label="현재 배치 일자" />
    </div>
    <TabulatorGrid
      :columns="teamColumns"
      :data="teamPlanRows"
      layout="fitColumns"
      select-mode="checkbox"
      placeholder="등록된 배치가 없습니다"
      @row-selection-changed="onTeamSelectionChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import NumberStepper from '@/components/custom/input/NumberStepper.vue'
import { Button } from '@/components/custom/button'
import { GridTitle } from '@/components/custom/grid-title'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  useBasicCycle,
  hourOptions,
  shiftKindOptions,
  groupOptions,
  basicCycleOptions,
  type ShiftFormRow,
  type TeamPlanRow,
} from './composable/PC-LPO-0214'

defineOptions({
  name: 'PcLpo0214',
})

// LNB: 근무일지 > 근무일지(甲) (프리셋은 2뎁스까지라 '기본주기설정'이 아직 없다 — §5 ③)
useSideMenuSetup({ ...localPoliceMenu, openIndex: 1, activeChild: '근무일지(甲)' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '근무일지' },
  { label: '근무일지(甲)' },
  { label: '기본주기설정' },
]

const {
  department,
  groupCount,
  shiftCount,
  dayCycle,
  basicCycle,
  noBasicCycle,
  shiftFormRows,
  todayPlanDay,
  teamPlanRows,
  addShiftFormRow,
  removeShiftFormRows,
  addTeamPlanRow,
  removeTeamPlanRows,
  resetAll,
} = useBasicCycle()

const shiftColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', hozAlign: 'center', width: 70 },
  { title: '이름', field: 'name', cellType: 'input' },
  { title: '업무시간지정', field: 'fixedHours', cellType: 'checkbox', hozAlign: 'center', width: 130 },
  { title: '시작시간', field: 'startTime', cellType: 'select', selectOptions: hourOptions, selectPlaceholder: '선택' },
  { title: '종료시간', field: 'endTime', cellType: 'select', selectOptions: hourOptions, selectPlaceholder: '선택' },
  { title: '간격(분)', field: 'interval', cellType: 'input' },
  { title: '교대시간(분)', field: 'handoverMinutes', cellType: 'input' },
  { title: '인수인계여부', field: 'handover', cellType: 'checkbox', hozAlign: 'center', width: 130 },
]

const teamColumns: TabulatorGridColumn[] = [
  { title: '팀', field: 'team', hozAlign: 'center', width: 90 },
  { title: '1일차', field: 'day1', cellType: 'select', selectOptions: shiftKindOptions, selectPlaceholder: '선택' },
  { title: '2일차', field: 'day2', cellType: 'select', selectOptions: shiftKindOptions, selectPlaceholder: '선택' },
  { title: '3일차', field: 'day3', cellType: 'select', selectOptions: shiftKindOptions, selectPlaceholder: '선택' },
  { title: '4일차', field: 'day4', cellType: 'select', selectOptions: shiftKindOptions, selectPlaceholder: '선택' },
]

/** @row-selection-changed 는 RowComponent 배열을 넘긴다(CLAUDE.md §6) */
function toIds<T extends { id: number }>(rows: unknown[]) {
  return new Set(
    rows.map((r) => {
      const data = (typeof (r as { getData?: () => T }).getData === 'function'
        ? (r as { getData: () => T }).getData()
        : r) as T
      return data.id
    }),
  )
}

const shiftSelection = ref<Set<number>>(new Set())
const teamSelection = ref<Set<number>>(new Set())

function onShiftSelectionChanged(rows: unknown[]) {
  shiftSelection.value = toIds<ShiftFormRow>(rows)
}

function onTeamSelectionChanged(rows: unknown[]) {
  teamSelection.value = toIds<TeamPlanRow>(rows)
}

function onDeleteShiftRows() {
  if (!shiftSelection.value.size) {
    toast.warning('삭제할 교대 형태를 선택해 주세요.')
    return
  }
  removeShiftFormRows(shiftSelection.value)
  shiftSelection.value = new Set()
  toast.success('삭제되었습니다.')
}

function onDeleteTeamRows() {
  if (!teamSelection.value.size) {
    toast.warning('삭제할 배치를 선택해 주세요.')
    return
  }
  removeTeamPlanRows(teamSelection.value)
  teamSelection.value = new Set()
  toast.success('삭제되었습니다.')
}

function onApplyCycle() {
  if (!basicCycle.value) {
    toast.warning('기본 주기를 선택해 주세요.')
    return
  }
  toast.success('기본 주기 설정을 적용했습니다.')
}

function onNew() {
  resetAll()
  toast.success('새로 입력할 수 있습니다.')
}

function onSave() {
  toast.success('저장되었습니다.')
}

useBottomTabSetup({
  value: 'PC-LPO-0214',
  label: '기본주기설정',
  path: '/views/lpo/PC-LPO-0214',
  componentName: 'PcLpo0214',
  closable: true,
})
</script>
