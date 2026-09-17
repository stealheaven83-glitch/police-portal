<template>
  <PageHeader>
    <template #left>
      <PageTitle title="월별 인수인계서" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>
  <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </template>
    <template #form>
      <div class="search-area">
        <div class="group-gap2">
          <SelectField v-model="year" label="근무일" :options="yearOptions" size="sm" triggerClass="w-32" />
          <SelectField v-model="month" :options="monthOptions" size="sm" triggerClass="w-28" aria-label="월" />
        </div>
        <Checkbox id="only-pending" v-model="onlyPending" label="미 인수인계" />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm" @click="onSearch">조회</Button>
    </template>
  </SearchWrapper>

  <TabulatorGrid
    class="flex-1 lp-grid-no-hover"
    :columns="columns"
    :data="rows"
    :row-class="rowClass"
    height="100%"
    placeholder="조회된 인수인계가 없습니다"
    show-pagination
    :items-per-page="10"
  />
</template>

<script setup lang="ts">
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useMonthlyHandover, isPendingHandover, yearOptions, monthOptions, type HandoverRow } from './composable/PC-LPO-0304'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

defineOptions({
  name: 'PcLpo0304',
})

// LNB: 인수인계 > 인수인계 현황
useSideMenuSetup({ ...localPoliceMenu, openIndex: 2, activeChild: '인수인계 현황' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '인수인계' },
  { label: '월별인수인계현황' },
]

const { department, advancedSearchOpen, year, month, onlyPending, rows } = useMonthlyHandover()

/** '미확인'만 강조색 글씨로 — Figma color/text/point(#b02a30) */
function pendingFormatter(cell: { getValue: () => string }) {
  const value = cell.getValue() ?? ''
  return value === '미확인' ? `<span class="lp-cell-point font-bold">${value}</span>` : value
}

/**
 * 확인이 끝난 행만 회색 배경 — Figma color/surface/gray-subtle.
 * 미확인이 남은 행은 배경 없음(흰색)이라 클래스를 안 붙인다.
 */
function rowClass(row: HandoverRow) {
  return isPendingHandover(row) ? undefined : 'lp-grid-done-row'
}

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', hozAlign: 'center', width: 70 },
  { title: '부서명', field: 'dept', hozAlign: 'center', width: 200 },
  { title: '근무일자', field: 'workDate', hozAlign: 'center' },
  { title: '근무', field: 'shift', hozAlign: 'center', width: 80 },
  { title: '근무팀', field: 'team', hozAlign: 'center', width: 90 },
  { title: '인계관', field: 'giver', hozAlign: 'center' },
  { title: '인수관', field: 'receiver', hozAlign: 'center' },
  { title: '확인일', field: 'receiverConfirmedAt', hozAlign: 'center', formatter: pendingFormatter },
  { title: '확인관', field: 'approver', hozAlign: 'center' },
  { title: '확인일', field: 'approverConfirmedAt', hozAlign: 'center', formatter: pendingFormatter },
  { title: '점검관', field: 'inspector', hozAlign: 'center' },
  { title: '취소', field: 'canceledAt', hozAlign: 'center', formatter: pendingFormatter },
]

async function onSearch() {
  await dialog.alert({ title: '조회되었습니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PC-LPO-0304',
  label: '월별인수인계현황',
  path: '/views/lpo/PC-LPO-0304',
  componentName: 'PcLpo0304',
  closable: true,
})
</script>
