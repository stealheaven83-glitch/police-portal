<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useAccidentVolunteerStatus, typeFilterOptions } from './composable/PC-LPO-0215'

defineOptions({ name: 'PcLpo0215' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰', path: '/lpo' },
  { label: '근무일지', path: '/lpo' },
  { label: '근무일지(甲)', path: '/lpo' },
  { label: '사고자/자원근무자현황' },
]

const { department, advancedSearchOpen, dateFrom, dateTo, typeFilter, nameFilter, rows } =
  useAccidentVolunteerStatus()

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '구분', field: 'type', hozAlign: 'center' },
  { title: '부서명', field: 'dept', width: 240, hozAlign: 'center' },
  { title: '근무일자', field: 'workDate', hozAlign: 'center' },
  { title: '교대', field: 'shift', width: 100, hozAlign: 'center' },
  { title: '소속 부서명', field: 'affDept', width: 240, hozAlign: 'center' },
  { title: '이름', field: 'name', hozAlign: 'center' },
  { title: '근무(사고)시간', field: 'workTime', hozAlign: 'center' },
  { title: '사유(구분)', field: 'reason', hozAlign: 'center' },
  { title: '취소', field: 'cancelNote', hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `사고자_자원근무자현황_${today}.csv`)
}

useBottomTabSetup({
  value: 'PC-LPO-0215',
  label: '사고자/자원근무자현황',
  path: '/views/lpo/PC-LPO-0215',
  componentName: 'PcLpo0215',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="사고자/자원근무자 현황" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>
  <div>
    <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
      <template #department>
        <span class="dept-name">부서</span>
        <DepartmentCascadeSelect v-model="department" size="sm" />
      </template>
      <template #form>
        <div class="search-area">
          <div class="group-gap2">
            <DatePicker v-model="dateFrom" label="근무일자" size="sm" inputClass="w-40" />
            <span aria-hidden="true">~</span>
            <DatePicker v-model="dateTo" size="sm" inputClass="w-40" />
          </div>
          <SelectField v-model="typeFilter" label="구분" :options="typeFilterOptions" size="sm" triggerClass="w-37" />
          <InputField2 v-model="nameFilter" label="이름" size="sm" inputClass="w-[13.3rem]" />
        </div>
      </template>
      <template #btns>
        <Button variant="secondary" size="sm">조회</Button>
      </template>
    </SearchWrapper>
  </div>

  <div class="list-actions">
    <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
      <Download :size="16" aria-hidden="true" />
      엑셀다운로드
    </Button>
  </div>

  <TabulatorGrid
    ref="gridRef"
    class="flex-1"
    :columns="columns"
    :data="rows"
    height="100%"
    min-height="30rem"
    placeholder="조회된 내역이 없습니다"
  />
</template>
