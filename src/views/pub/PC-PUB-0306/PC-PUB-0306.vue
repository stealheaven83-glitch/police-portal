<script setup lang="ts">
import { computed, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { usePublicSafetyStore, groupTypeOptions } from '../composable/publicSafety'

defineOptions({ name: 'PcPub0306' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '방범협력단체' },
  { label: '단체현황' },
]

const store = usePublicSafetyStore()

const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
const groupTypeFilter = ref('all')
const groupFilter = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const advancedSearchOpen = ref(false)

const groupTypeFilterOptions = [{ label: '전체', value: 'all' }, ...groupTypeOptions]
const groupFilterOptions = computed(() => [{ label: '전체', value: 'all' }, ...store.groupOptions.value])

interface StatusRow {
  id: number | string
  dept: string
  groupType: string
  groupName: string
  memberCount: number
  equipmentNote: string
  budgetAmount: number
  insuredCount: number
  vehicleCount: number
  awardNote: string
}

function groupTypeLabel(groupType: string, etc: string) {
  if (groupType === 'etc') return etc || '기타'
  return groupTypeOptions.find((o) => o.value === groupType)?.label ?? groupType
}

const filteredGroups = computed(() => {
  return store.groups.value.filter((g) => {
    if (groupTypeFilter.value !== 'all' && g.groupType !== groupTypeFilter.value) return false
    if (groupFilter.value !== 'all' && String(g.id) !== groupFilter.value) return false
    return true
  })
})

const rows = computed<StatusRow[]>(() => {
  const dataRows: StatusRow[] = filteredGroups.value.map((g) => ({
    id: g.id,
    dept: g.dept,
    groupType: groupTypeLabel(g.groupType, g.groupTypeEtc),
    groupName: g.groupName,
    memberCount: g.memberCount,
    equipmentNote: g.equipmentSupport.length ? `${g.equipmentSupport.length}건` : '',
    budgetAmount: g.budgetSupport.reduce((sum, b) => sum + b.amount, 0),
    insuredCount: g.insuredCount,
    vehicleCount: g.vehicleCount,
    awardNote: g.awards.length ? `${g.awards.length}건` : '',
  }))
  const total: StatusRow = {
    id: '합계',
    dept: '합계',
    groupType: '',
    groupName: '',
    memberCount: dataRows.reduce((s, r) => s + r.memberCount, 0),
    equipmentNote: '',
    budgetAmount: dataRows.reduce((s, r) => s + r.budgetAmount, 0),
    insuredCount: dataRows.reduce((s, r) => s + r.insuredCount, 0),
    vehicleCount: dataRows.reduce((s, r) => s + r.vehicleCount, 0),
    awardNote: '',
  }
  return [total, ...dataRows]
})

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 70, hozAlign: 'center' },
  { title: '관서', field: 'dept', hozAlign: 'center' },
  { title: '단체종류', field: 'groupType', hozAlign: 'center' },
  { title: '단체명', field: 'groupName', hozAlign: 'center' },
  { title: '인원', field: 'memberCount', hozAlign: 'center' },
  { title: '장비지원내용', field: 'equipmentNote', hozAlign: 'center' },
  { title: '지자체 예산지원', field: 'budgetAmount', hozAlign: 'center' },
  { title: '보험가입', field: 'insuredCount', hozAlign: 'center' },
  { title: '보유차량', field: 'vehicleCount', hozAlign: 'center' },
  { title: '포상내용', field: 'awardNote', hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `단체현황_${today}.csv`)
}

useSideMenuSetup({ ...publicSafetyMenu, activeChild: '단체현황', openIndex: 2 })

useBottomTabSetup({
  value: 'PC-PUB-0306',
  label: '단체현황',
  path: '/views/pub/PC-PUB-0306',
  componentName: 'PcPub0306',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="단체현황" />
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
        <SelectField v-model="groupTypeFilter" label="단체종류" :options="groupTypeFilterOptions" label-position="left" size="sm" triggerClass="w-32" />
        <SelectField v-model="groupFilter" label="단체명" :options="groupFilterOptions" label-position="left" size="sm" triggerClass="w-40" />
        <DatePicker v-model="dateFrom" label="기간" size="sm" inputClass="w-40" />
        <span aria-hidden="true">~</span>
        <DatePicker v-model="dateTo" size="sm" inputClass="w-40" />
      </div>
    </template>
    <template #btns>
      <Button variant="secondary" size="sm" class="w-25">조회</Button>
    </template>
  </SearchWrapper>

  <div class="mt-[1.6rem] flex justify-end">
    <Button type="button" variant="tertiary2" size="sm" @click="onDownloadExcel">
      <Download :size="16" aria-hidden="true" />
      엑셀다운로드
    </Button>
  </div>

  <TabulatorGrid
    ref="gridRef"
    class="mt-[1.2rem] flex-1"
    :columns="columns"
    :data="rows"
    height="100%"
    min-height="40rem"
    placeholder="조회된 단체가 없습니다"
  />
</template>
