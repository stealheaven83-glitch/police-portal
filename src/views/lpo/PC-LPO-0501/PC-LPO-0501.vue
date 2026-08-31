<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useDispatchAllowanceList } from './composable/PC-LPO-0501'

defineOptions({ name: 'PcLpo0501' })

useSideMenuSetup({ ...localPoliceMenu, openIndex: 3, activeChild: '출동수당 조회' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰', path: '/lpo' },
  { label: '출동수당', path: '/lpo' },
  { label: '출동수당 조회' },
]

const { department, advancedSearchOpen, dateFrom, dateTo, keyword, rows } = useDispatchAllowanceList()

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '신청부서', field: 'applyDept', hozAlign: 'center' },
  { title: '타지역 관서(전소속 부서)', field: 'otherStation', hozAlign: 'center' },
  { title: '타지역관서(전소속부서) 실적가져오기', field: 'otherStationRef', hozAlign: 'center' },
  { title: '접수번호', field: 'receiptNo', hozAlign: 'center' },
  { title: '사건번호', field: 'caseNo', hozAlign: 'center' },
  { title: '신고내용', field: 'reportContent', hozAlign: 'center', widthGrow: 2 },
  { title: '현장조치내용', field: 'onSiteAction', hozAlign: 'center', widthGrow: 2 },
  { title: '임의등록사유', field: 'manualReason', width: 120, hozAlign: 'center' },
  { title: '접수일시', field: 'receivedAt', width: 150, hozAlign: 'center' },
  { title: '도착일시', field: 'arrivedAt', width: 150, hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `출동수당조회_${today}.csv`)
}

function onManualRegister() {
  toast.success('임의등록 화면은 준비 중입니다.')
}

function onSave() {
  toast.success('저장되었습니다.')
}

useBottomTabSetup({
  value: 'PC-LPO-0501',
  label: '출동수당조회',
  path: '/views/lpo/PC-LPO-0501',
  componentName: 'PcLpo0501',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="출동수당조회" />
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
            <DatePicker v-model="dateFrom" label="접수일" size="sm" inputClass="w-40" />
            <span aria-hidden="true">~</span>
            <DatePicker v-model="dateTo" size="sm" inputClass="w-40" />
          </div>
          <InputField2 v-model="keyword" label="목록검색" size="sm" inputClass="w-60" placeholder="검색어를 입력해주세요." />
        </div>
      </template>
      <template #btns>
        <Button variant="secondary" size="sm">조회</Button>
      </template>
    </SearchWrapper>
  </div>

  
  <div class="list-actions space-between items-end">
    <div class="list-actions-txt">
      <p>＊ 출동업무수당 지급대상 자동체크는 매일 오전 08시~12시에 반영됩니다. 12시 이후에 확인 후 작성하세요</p>
      <p>＊ 출동업무수당 자동체크 된 지급대상 사건과 임의등록 사건 만 표시됩니다.</p>
    </div>
    <div class="group-gap2">
      <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
        <Download :size="16" aria-hidden="true" />
        엑셀다운로드
      </Button>
      <Button type="button" variant="secondary" size="sm" @click="onManualRegister">임의등록</Button>
      <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
    </div>
  </div>

  <TabulatorGrid
    ref="gridRef"
    class="flex-1"
    :columns="columns"
    :data="rows"
    select-mode="checkbox"
    height="100%"
    min-height="30rem"
    placeholder="조회된 출동수당 내역이 없습니다"
    @row-selection-changed="selectedCount = $event.length"
  />
</template>
