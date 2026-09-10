<template>
  <PageHeader>
    <template #left>
      <PageTitle title="출동수당 취합(월별)" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
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
          <SelectField label="근무월" v-model="workYearStr" :options="yearOptions" size="sm" triggerClass="w-25" />
          <span aria-hidden="true">년</span>
          <SelectField v-model="workMonthStr" :options="monthOptions" size="sm" triggerClass="w-20" />
          <span aria-hidden="true">월</span>
          <SelectField label="신청자" v-model="applicant" :options="applicantOptions" size="sm" triggerClass="w-32" />
          <SelectField label="신청구분" v-model="applyType" :options="applyTypeOptions" size="sm" triggerClass="w-32" />
        </div>
      </template>
      <template #btns>
        <Button variant="secondary" size="sm">조회</Button>
      </template>
    </SearchWrapper>
  </div>

  <div class="list-actions space-between">
    <span class="lp-toolbar-left">
      <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
        <Download :size="16" aria-hidden="true" />
        엑셀다운로드
      </Button>
    </span>
    <span class="lp-toolbar-right">
      <Button type="button" variant="tertiary2" size="sm" @click="approveOpen = true">승인관리</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="cancelOpen = true">승인취소관리</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="otherApplyOpen = true">타직원 출동수당 신청</Button>
      <Button type="button" variant="secondary" size="sm" @click="dispatchInfoOpen = true">출동사건정보</Button>
    </span>
  </div>

  <TabulatorGrid
    ref="gridRef"
    class="flex-1"
    :columns="columns"
    :data="gridRows"
    height="100%"
    min-height="40rem"
    placeholder="조회된 출동수당 취합 내역이 없습니다"

    :items-per-page="10"
  />

  <ApproveManageDialog />
  <ApproveCancelDialog />
  <OtherApplyDialog />
  <DispatchInfoDialog />
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
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
import { useDispatchSummaryMonthly, applicantOptions, applyTypeOptions } from './composable/PC-LPO-0505'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import ApproveManageDialog from './components/ApproveManageDialog.vue'
import ApproveCancelDialog from './components/ApproveCancelDialog.vue'
import OtherApplyDialog from './components/OtherApplyDialog.vue'
import DispatchInfoDialog from './components/DispatchInfoDialog.vue'
import { useDispatchSummaryDialogs, DispatchSummaryDialogKey } from './composable/dialogs'
defineOptions({ name: 'PcLpo0505' })

useSideMenuSetup({ ...localPoliceMenu, openIndex: 3, activeChild: '승인관리' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '출동수당' },
  { label: '출동수당 취합(월별)' },
]

/** 이 화면에서 열리는 팝업(PC-LPO-0506~0510)들의 상태 — 팝업 컴포넌트가 inject 한다 */
const dialogs = useDispatchSummaryDialogs()
provide(DispatchSummaryDialogKey, dialogs)
const { approveOpen, cancelOpen, otherApplyOpen, dispatchInfoOpen } = dialogs

const yearOptions = [
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
]
const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: String(i + 1), value: String(i + 1) }))

const {
  department,
  advancedSearchOpen,
  workYear,
  workMonth,
  applicant,
  applyType,
  days,
  rows,
} = useDispatchSummaryMonthly()

const workYearStr = computed({
  get: () => String(workYear.value),
  set: (v: string) => (workYear.value = Number(v)),
})
const workMonthStr = computed({
  get: () => String(workMonth.value),
  set: (v: string) => (workMonth.value = Number(v)),
})

/** 근무월이 바뀌면 그 달의 일수만큼 컬럼도 다시 생성된다(28~31일 가변) */
const columns = computed<TabulatorGridColumn[]>(() => [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '부서', field: 'dept', hozAlign: 'center' },
  { title: '팀', field: 'team', width: 70, hozAlign: 'center' },
  { title: '직급성명', field: 'rankName', hozAlign: 'center' },
  { title: '생년월일', field: 'birthDate', width: 110, hozAlign: 'center' },
  { title: '총 출동건수', field: 'totalCount', width: 90, hozAlign: 'center' },
  {
    title: '계',
    columns: [
      { title: '범죄명', field: 'category', width: 100, hozAlign: 'center' },
      { title: '건수', field: 'count', width: 70, hozAlign: 'center' },
    ],
  },
  {
    title: '근무일자',
    columns: Array.from({ length: days.value }, (_, i) => ({
      title: String(i + 1),
      field: `day${i + 1}`,
      width: 60,
      hozAlign: 'center' as const,
    })),
  },
])

/** days 배열(월별 일수만큼)을 day1, day2 ... 필드로 펼쳐야 그리드 컬럼과 매칭된다 */
const gridRows = computed(() =>
  rows.value.map((row) => {
    const dayFields: Record<string, number> = {}
    row.days.forEach((value, i) => (dayFields[`day${i + 1}`] = value))
    return { ...row, ...dayFields }
  }),
)

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `출동수당취합_월별_${today}.csv`)
}

useBottomTabSetup({
  value: 'PC-LPO-0505',
  label: '출동수당취합(월별)',
  path: '/views/lpo/PC-LPO-0505',
  componentName: 'PcLpo0505',
  closable: true,
})
</script>
