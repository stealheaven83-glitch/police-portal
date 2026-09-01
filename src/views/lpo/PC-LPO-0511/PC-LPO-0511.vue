<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useDispatchSummaryDaily, applicantOptions, applyTypeOptions } from './composable/PC-LPO-0511'

defineOptions({ name: 'PcLpo0511' })

useSideMenuSetup({ ...localPoliceMenu, openIndex: 3, activeChild: '승인관리' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '출동수당' },
  { label: '출동수당 취합(일별)' },
]

const yearOptions = [
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
]
const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: String(i + 1), value: String(i + 1) }))

const { department, advancedSearchOpen, workYear, workMonth, applicant, applyType, rows } =
  useDispatchSummaryDaily()

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '부서', field: 'dept', hozAlign: 'center' },
  { title: '팀', field: 'team', width: 70, hozAlign: 'center' },
  { title: '직급성명', field: 'rankName', hozAlign: 'center' },
  { title: '생년월일', field: 'birthDate', width: 110, hozAlign: 'center' },
  { title: '출동건수', field: 'dispatchCount', width: 90, hozAlign: 'center' },
  { title: '접수일시', field: 'receivedAt', width: 140, hozAlign: 'center' },
  { title: '범죄명', field: 'crimeName', width: 100, hozAlign: 'center' },
  { title: '접수번호', field: 'receiptNo', width: 130, hozAlign: 'center' },
  { title: '사건번호', field: 'caseNo', width: 90, hozAlign: 'center' },
  { title: '신고내용', field: 'reportContent', widthGrow: 2, hozAlign: 'center' },
  { title: '처리내용', field: 'processContent', widthGrow: 2, hozAlign: 'center' },
  { title: '현장조치내용', field: 'onSiteAction', width: 110, hozAlign: 'center' },
  { title: '임의등록사유', field: 'manualReason', width: 130, hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `출동수당취합_일별_${today}.csv`)
}

useBottomTabSetup({
  value: 'PC-LPO-0511',
  label: '출동수당취합(일별)',
  path: '/views/lpo/PC-LPO-0511',
  componentName: 'PcLpo0511',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="출동수당 취합(일별)" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </template>
    <template #form>
      <div class="search-area">
        <SelectField label="근무월" v-model="workYear" :options="yearOptions" size="sm" triggerClass="w-25" />
        <span aria-hidden="true">년</span>
        <SelectField v-model="workMonth" :options="monthOptions" size="sm" triggerClass="w-20" />
        <span aria-hidden="true">월</span>
        <SelectField label="신청자" v-model="applicant" :options="applicantOptions" size="sm" triggerClass="w-32" />
        <SelectField label="신청구분" v-model="applyType" :options="applyTypeOptions" size="sm" triggerClass="w-32" />
      </div>
    </template>
    <template #btns>
      <Button variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

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
    layout="fitDataFill"
    height="100%"
    min-height="40rem"
    placeholder="조회된 출동수당 취합 내역이 없습니다"
    show-pagination
    :items-per-page="10"
  />
</template>
