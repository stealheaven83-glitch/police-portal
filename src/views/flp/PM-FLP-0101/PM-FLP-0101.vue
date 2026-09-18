<template>
  <PageHeader>
    <template #left>
      <PageTitle title="요청관리" />
    </template>
    <template #right>
      <div class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </div>
    </template>
  </PageHeader>

  <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </template>

    <template #form>
      <div class="search-area">
        <SelectField
          v-model="periodType"
          label="기간구분"
          :options="periodTypeOptions"
          size="sm"
          trigger-class="w-37"
        />

        <DateRangePicker
          v-model:from="dateFrom"
          v-model:to="dateTo"
          label="기간"
          from-label="기간 시작일"
          to-label="기간 종료일"
          size="sm"
          input-class="w-40"
        />

        <SelectField
          v-model="receiptType"
          label="접수구분"
          :options="receiptTypeOptions"
          size="sm"
          trigger-class="w-37"
        />
      </div>
    </template>

    <template #btns>
      <Button type="button" variant="secondary" size="sm" @click="onSearch">
        조회
      </Button>
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
      <Download :size="16" aria-hidden="true" />
      엑셀다운로드
    </Button>
    <Button type="button" variant="primary" size="sm">신규</Button>
  </div>

  <TabulatorGrid
    ref="gridRef"
    v-model:data="rows"
    class="flex-1"
    :columns="columns"
    layout="fitDataFill"
    height="100%"
    min-height="30rem"
    placeholder="조회된 요청이 없습니다"
    show-pagination
    :items-per-page="10"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useRequestManage, periodTypeOptions, receiptTypeOptions } from './composable/PM-FLP-0101'
import HelpButton from '@/components/custom/button/HelpButton.vue'
// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수, useBottomTabSetup 의 componentName 과 일치)
defineOptions({ name: 'PmFlp0101' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '탄력순찰' },
  { label: '요청관리' },
]

const {
  rows,
  department,
  advancedSearchOpen,
  periodType,
  dateFrom,
  dateTo,
  receiptType,
  search,
} = useRequestManage()

/**
 * 컬럼이 16개라 컨테이너 폭에 나눠 담으면 글자가 뭉개진다.
 * layout="fitDataFill" + 컬럼마다 고정 width 로 가로 스크롤을 쓴다(CLAUDE.md §6).
 */
const columns: TabulatorGridColumn[] = [
  { title: '관리번호', field: 'id', width: 120, hozAlign: 'center' },
  { title: '접수일자', field: 'receivedAt', width: 120, hozAlign: 'center' },
  { title: '요청기간', field: 'requestPeriod', width: 200, hozAlign: 'center' },
  { title: '요청시간', field: 'requestTime', width: 100, hozAlign: 'center' },
  { title: '접수구분', field: 'receiptCategory', width: 110, hozAlign: 'center' },
  { title: '주소(지번)', field: 'addressJibun', width: 240, hozAlign: 'left' },
  { title: '주소(도로명)', field: 'addressRoad', width: 220, hozAlign: 'left' },
  { title: '요청건수', field: 'requestCount', width: 100, hozAlign: 'center' },
  { title: '순찰요청사항', field: 'patrolRequest', width: 180, hozAlign: 'left' },
  { title: '순찰사유', field: 'patrolReason', width: 180, hozAlign: 'left' },
  { title: '신고건수', field: 'reportCount', width: 100, hozAlign: 'center' },
  { title: '핫스팟', field: 'hotspot', width: 100, hozAlign: 'center' },
  { title: '경력수요형태', field: 'demandType', width: 140, hozAlign: 'left' },
  { title: '경력수요인원', field: 'demandPersonnel', width: 130, hozAlign: 'center' },
  { title: '이메일', field: 'email', width: 200, hozAlign: 'left' },
  { title: '등록자', field: 'registrant', width: 100, hozAlign: 'center' },
  { title: '등록일', field: 'registeredAt', width: 120, hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

function onSearch() {
  search()
  gridRef.value?.setPage(1)
}

function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `요청관리_${today}.csv`)
}

useSideMenuSetup('flexiblePatrol')

useBottomTabSetup({
  value: 'PM-FLP-0101',
  label: '요청관리',
  path: '/views/flp/PM-FLP-0101',
  componentName: 'PmFlp0101',
  closable: true,
})
</script>
