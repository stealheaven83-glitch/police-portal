<template>
  <PageHeader>
    <template #left>
      <PageTitle title="출동수당통보" />
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
          <SelectField v-model="year" label="근무월" :options="yearOptions" size="sm" triggerClass="w-32" />
          <SelectField v-model="month" :options="monthOptions" size="sm" triggerClass="w-28" aria-label="월" />
        </div>
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
    :data="gridRows"
    layout="fitDataFill"
    height="100%"
    min-height="40rem"
    placeholder="조회된 출동수당 통보 내역이 없습니다"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useAllowanceNotice, yearOptions, monthOptions } from './composable/PC-LPO-0512'

defineOptions({
  name: 'PcLpo0512',
})

// LNB: 출동수당 > 출동수당통보
useSideMenuSetup({ ...localPoliceMenu, openIndex: 3, activeChild: '출동수당통보' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '출동수당' },
  { label: '출동수당통보' },
]

const { department, advancedSearchOpen, year, month, days, rows } = useAllowanceNotice()

/** 근무월이 바뀌면 그 달의 일수만큼 컬럼도 다시 생성된다(28~31일 가변) */
const columns = computed<TabulatorGridColumn[]>(() => [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '부서', field: 'dept', width: 240, hozAlign: 'center' },
  { title: '팀', field: 'team', width: 80, hozAlign: 'center' },
  { title: '직급성명', field: 'rankName', width: 120, hozAlign: 'center' },
  { title: '생년월일', field: 'birthDate', width: 120, hozAlign: 'center' },
  { title: '총 출동건수', field: 'totalCount', width: 90, hozAlign: 'center' },
  {
    title: '근무일자',
    columns: Array.from({ length: days.value }, (_, i) => ({
      title: String(i + 1),
      field: `day${i + 1}`,
      width: 56,
      hozAlign: 'center' as const,
    })),
  },
])

/** days 배열(월별 일수만큼)을 day1, day2 ... 필드로 펼쳐야 그리드 컬럼과 매칭된다 */
const gridRows = computed(() =>
  rows.value.map((row, index) => {
    const dayFields: Record<string, string> = {}
    row.days.forEach((value, i) => (dayFields[`day${i + 1}`] = value ? String(value) : ''))
    return { ...row, no: index + 1, ...dayFields }
  }),
)

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

function onSearch() {
  toast.success('조회되었습니다.')
}

function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `출동수당통보_${today}.csv`)
}

useBottomTabSetup({
  value: 'PC-LPO-0512',
  label: '출동수당통보',
  path: '/views/lpo/PC-LPO-0512',
  componentName: 'PcLpo0512',
  closable: true,
})
</script>
