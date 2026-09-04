<template>
  <PageHeader>
    <template #left>
      <PageTitle title="출동수당" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <SearchWrapper>
    <template #form>
      <div class="group-gap2" role="group" aria-label="기간검색">
        <DatePicker v-model="dateFrom" label="기간검색" size="sm" input-class="w-40" />
        <span aria-hidden="true">~</span>
        <DatePicker v-model="dateTo" size="sm" input-class="w-40" />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm" @click="onSearch">조회</Button>
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
    height="100%"
    min-height="30rem"
    placeholder="조회된 출동수당 내역이 없습니다."
    show-pagination
    :items-per-page="10"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useDispatchAllowanceList } from './composable/PM-LPO-0109'

defineOptions({ name: 'PmLpo0109' })

useSideMenuSetup({ ...localPoliceMenu, openIndex: 0, activeChild: '출동수당' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '개인수첩' },
  { label: '출동수당' },
]

const { dateFrom, dateTo, rows } = useDispatchAllowanceList()

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '접수일시', field: 'receivedAt', width: 181, hozAlign: 'center' },
  { title: '범죄명', field: 'crimeName', width: 181, hozAlign: 'center' },
  { title: '접수번호', field: 'receiptNo', width: 181, hozAlign: 'center' },
  { title: '사건번호', field: 'caseNo', width: 160, hozAlign: 'center' },
  { title: '도착소요시간', field: 'arrivalTime', width: 181, hozAlign: 'center' },
  { title: '종결일시', field: 'closedAt', width: 181, hozAlign: 'center' },
  { title: '출동자', field: 'responders', widthGrow: 2, hozAlign: 'center' },
  { title: '종결자', field: 'closer', width: 120, hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

function onSearch() {
  toast.success('조회되었습니다.')
}

function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `출동수당_${today}.csv`)
}

useBottomTabSetup({
  value: 'PM-LPO-0109',
  label: '출동수당',
  path: '/views/lpo/PM-LPO-0109',
  componentName: 'PmLpo0109',
  closable: true,
})
</script>
