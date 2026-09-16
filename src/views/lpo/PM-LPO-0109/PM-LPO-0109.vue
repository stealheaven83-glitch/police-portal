<template>
  <PageHeader>
    <template #left>
      <PageTitle title="출동수당" />
      </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
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

  <!-- PM-LPO-0110 출동사건정보 — 접수번호를 누르면 열린다 -->
  <DispatchCaseDialog v-model:open="caseDialogOpen" :info="caseInfo" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
import DispatchCaseDialog from './components/DispatchCaseDialog.vue'
import { useDispatchAllowanceList, type DispatchAllowanceRow } from './composable/PM-LPO-0109'

defineOptions({ name: 'PmLpo0109' })

useSideMenuSetup({ ...localPoliceMenu, openIndex: 0, activeChild: '출동수당' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '개인수첩' },
  { label: '출동수당' },
]

const { dateFrom, dateTo, rows, search, caseDialogOpen, caseInfo, openCase } = useDispatchAllowanceList()

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '접수일시', field: 'receivedAt', width: 181, hozAlign: 'center' },
  { title: '범죄명', field: 'crimeName', width: 181, hozAlign: 'center' },
  {
    title: '접수번호',
    field: 'receiptNo',
    width: 181,
    hozAlign: 'center',
    // 시안: 밑줄 링크 — 누르면 출동사건정보 팝업(PM-LPO-0110)
    cellType: 'button',
    buttonVariant: 'link',
    buttonSize: 'xxs',
    buttonClass: 'underline',
    buttonLabel: (row) => String((row as DispatchAllowanceRow).receiptNo),
    onButtonClick: (row) => openCase(row as DispatchAllowanceRow),
  },
  { title: '사건번호', field: 'caseNo', width: 160, hozAlign: 'center' },
  { title: '도착소요시간', field: 'arrivalTime', width: 181, hozAlign: 'center' },
  { title: '종결일시', field: 'closedAt', width: 181, hozAlign: 'center' },
  { title: '출동자', field: 'responders', width: 300, hozAlign: 'center' },
  { title: '종결자', field: 'closer', width: 120, hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

/** 기간검색으로 목업 목록을 거른다 (실제 조회는 인계 대상) */
function onSearch() {
  search()
}

function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `출동수당_${today}.csv`)
}

/**
 * 화면ID ↔ 팝업 상태 동기화 (PM-LPO-0106/0107 과 같은 방식).
 *   PM-LPO-0109 출동수당 목록 · PM-LPO-0110 출동사건정보 팝업
 * URL 만으로는 어느 건인지 알 수 없어(useAutoTrigger 의 알려진 한계) 직접 진입 시엔
 * 목업 기본 건이 열린다.
 */
const screenTriggers: ScreenTriggerMap = {
  'PM-LPO-0109': [[caseDialogOpen, false]],
  'PM-LPO-0110': [[caseDialogOpen, true]],
}
useAutoTrigger(screenTriggers)

useBottomTabSetup({
  value: 'PM-LPO-0109',
  label: '출동수당',
  path: '/views/lpo/PM-LPO-0109',
  componentName: 'PmLpo0109',
  closable: true,
})
</script>
