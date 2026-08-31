<script setup lang="ts">
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useHandoverStatus, yearOptions, monthOptions } from './composable/PC-LPO-0301'

defineOptions({ name: 'PcLpo0301' })

useSideMenuSetup({ ...localPoliceMenu, openIndex: 2, activeChild: '인수인계 현황' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰', path: '/lpo' },
  { label: '인수인계', path: '/lpo' },
  { label: '월별인수인계현황' },
]

const { department, advancedSearchOpen, workYear, workMonth, unconfirmedOnly, rows } = useHandoverStatus()

/** 값이 '미확인'이면 위험색으로 강조 — Tabulator formatter는 HTML 문자열을 직접 반환한다 */
function unconfirmedFormatter(cell: any) {
  const value = cell.getValue()
  if (value === '미확인') return `<span style="color:var(--danger)">${value}</span>`
  return value
}

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '부서명', field: 'dept', widthGrow: 2, hozAlign: 'center' },
  { title: '근무일자', field: 'workDate', width: 120, hozAlign: 'center' },
  { title: '근무', field: 'shift', width: 70, hozAlign: 'center' },
  { title: '근무팀', field: 'team', width: 90, hozAlign: 'center' },
  { title: '인계관', field: 'handoverBy', hozAlign: 'center' },
  { title: '인수관', field: 'receiveBy', hozAlign: 'center' },
  { title: '확인일', field: 'confirmDate1', width: 120, hozAlign: 'center' },
  { title: '확인관', field: 'confirmBy1', hozAlign: 'center' },
  { title: '확인일', field: 'confirmDate2', width: 120, hozAlign: 'center', formatter: unconfirmedFormatter },
  { title: '점검관', field: 'inspector', hozAlign: 'center' },
  { title: '취소', field: 'cancelNote', width: 120, hozAlign: 'center', formatter: unconfirmedFormatter },
]

useBottomTabSetup({
  value: 'PC-LPO-0301',
  label: '월별인수인계현황',
  path: '/views/lpo/PC-LPO-0301',
  componentName: 'PcLpo0301',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="월별 인수인계서" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <div class="mb-[1.2rem]">
    <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
      <template #department>
        <span class="dept-name">부서</span>
        <DepartmentCascadeSelect v-model="department" size="sm" />
      </template>
      <template #form>
        <div class="search-area">
          <div class="group-gap3">
            <SelectField label="근무일" v-model="workYear" :options="yearOptions" size="sm" triggerClass="w-30" />
            <SelectField v-model="workMonth" :options="monthOptions" size="sm" triggerClass="w-20" />
          </div>
          <Checkbox v-model="unconfirmedOnly" label="미 인수인계" />
        </div>
      </template>
      <template #btns>
        <Button variant="secondary" size="sm">조회</Button>
      </template>
    </SearchWrapper>
  </div>

  <TabulatorGrid
    class="flex-1"
    :columns="columns"
    :data="rows"
    height="100%"
    min-height="30rem"
    placeholder="조회된 인수인계 내역이 없습니다"
  />
</template>
