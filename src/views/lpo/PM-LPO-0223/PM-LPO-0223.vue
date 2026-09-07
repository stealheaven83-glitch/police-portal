<template>
  <PageHeader>
    <template #left>
      <PageTitle title="근무일지(乙) 조회" />
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
          <DatePicker v-model="dateFrom" label="근무날짜" size="sm" inputClass="w-40" />
          <span aria-hidden="true">~</span>
          <DatePicker v-model="dateTo" size="sm" inputClass="w-40" />
        </div>
        <SelectField v-model="kindFilter" label="구분" :options="kindFilterOptions" size="sm" triggerClass="w-37" />
        <InputField2 v-model="keyword" label="활동내역" size="sm" inputClass="w-48" @keyup.enter="onSearch" />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm" @click="onSearch">조회</Button>
    </template>
  </SearchWrapper>

  <p class="lp-note-text lp-em-danger lp-table-gap">
    ※ 신규등록 시 근무구분 선택 창이 추가되었습니다. 구분 선택 시에 직접입력을 선택하면 기존과 동일하게 입력 가능합니다.
  </p>

  <TabulatorGrid
    class="flex-1"
    :columns="columns"
    :data="rows"
    height="100%"
    placeholder="조회된 근무일지가 없습니다"
    show-pagination
    :items-per-page="10"
  />

  <EmptyStubDialog
    v-model:open="detailOpen"
    title="출동사건정보"
    description="112신고 사건의 상세 정보를 보여주는 팝업입니다."
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { Button } from '@/components/custom/button'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useWorkLogView, kindFilterOptions, type WorkLogViewRow } from './composable/PM-LPO-0223'

defineOptions({
  name: 'PmLpo0223',
})

// LNB: 근무일지 > 근무일지(乙)
useSideMenuSetup({ ...localPoliceMenu, openIndex: 1, activeChild: '근무일지(乙)' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '근무일지' },
  { label: '근무일지(乙)' },
  { label: '근무일지(乙)조회' },
]

const { department, advancedSearchOpen, dateFrom, dateTo, kindFilter, keyword, rows } = useWorkLogView()

const detailOpen = ref(false)

const columns: TabulatorGridColumn[] = [
  { title: '근무시간', field: 'time', hozAlign: 'center', width: 100 },
  { title: '구분', field: 'kind', hozAlign: 'center', width: 170 },
  // 활동내역은 여러 줄이라 Tabulator 의 textarea 포매터로 줄바꿈을 살린다
  { title: '활동내역', field: 'activity', formatter: 'textarea', variableHeight: true },
  { title: '작성자', field: 'writer', hozAlign: 'center', width: 120 },
  { title: '처리자', field: 'handlers', hozAlign: 'center', width: 160 },
  {
    title: '인수인계',
    field: 'handover',
    hozAlign: 'center',
    width: 90,
    formatter: (cell: { getValue: () => boolean }) => (cell.getValue() ? '✓' : ''),
  },
  {
    title: '파일',
    field: 'hasFile',
    hozAlign: 'center',
    width: 80,
    formatter: (cell: { getValue: () => boolean }) => (cell.getValue() ? '📎' : ''),
  },
  {
    title: '상세',
    field: 'hasDetail',
    hozAlign: 'center',
    width: 90,
    cellType: 'button',
    buttonVariant: 'tertiary',
    buttonLabel: '보기',
    buttonVisible: (row: WorkLogViewRow) => row.hasDetail,
    onButtonClick: (row: WorkLogViewRow) => {
      if (row.hasDetail) detailOpen.value = true
    },
  },
]

function onSearch() {
  toast.success('조회되었습니다.')
}

useBottomTabSetup({
  value: 'PM-LPO-0223',
  label: '근무일지(乙)조회',
  path: '/views/lpo/PM-LPO-0223',
  componentName: 'PmLpo0223',
  closable: true,
})
</script>
