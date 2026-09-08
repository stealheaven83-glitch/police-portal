<template>
  <PageHeader>
    <template #left>
      <PageTitle title="단체현황" />
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
        <SelectField v-model="groupTypeFilter" label="단체종류" :options="groupTypeFilterOptions" label-position="left" size="sm" triggerClass="w-32" />
        <SelectField v-model="groupFilter" label="단체명" :options="groupFilterOptions" label-position="left" size="sm" triggerClass="w-40" />
        <div class="group-gap3">
          <DatePicker v-model="dateFrom" label="기간" size="sm" inputClass="w-40" />
          <span aria-hidden="true">~</span>
          <DatePicker v-model="dateTo" size="sm" inputClass="w-40" />
        </div>
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

  <TableWrapper
    :columns="columns"
    :items="dataRows"
    caption="단체현황 목록"
    :show-pagination="false"
    empty-title="조회된 단체가 없습니다"
    empty-description="검색 조건을 바꿔 다시 조회해 주세요."
  >
    <!--
      합계 줄. 앞 4칸(번호·관서·단체종류·단체명)을 colspan 으로 한 칸으로 합친다 —
      TabulatorGrid 는 셀 병합이 없어 이 화면은 TableWrapper 를 쓴다.
    -->
    <template #summary-row="{ cellClass }">
      <TableRow class="row-total">
        <TableCell :colspan="4" :class="cellClass">합계</TableCell>
        <TableCell :class="cellClass">{{ totals.memberCount }}</TableCell>
        <TableCell :class="cellClass" />
        <TableCell :class="cellClass">{{ totals.budgetAmount }}</TableCell>
        <TableCell :class="cellClass">{{ totals.insuredCount }}</TableCell>
        <TableCell :class="cellClass">{{ totals.vehicleCount }}</TableCell>
        <TableCell :class="cellClass" />
      </TableRow>
    </template>
  </TableWrapper>
</template>

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
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { TableCell, TableRow } from '@/components/ui/table'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { usePublicSafetyStore, groupTypeOptions } from '../composable/publicSafety'
import HelpButton from '@/components/custom/button/HelpButton.vue'

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
  id: number
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

/** 합계는 별도 줄(#summary-row)로 그리므로 데이터 행에는 섞지 않는다 */
const dataRows = computed<StatusRow[]>(() =>
  filteredGroups.value.map((g) => ({
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
  })),
)

const totals = computed(() => ({
  memberCount: dataRows.value.reduce((s, r) => s + r.memberCount, 0),
  budgetAmount: dataRows.value.reduce((s, r) => s + r.budgetAmount, 0),
  insuredCount: dataRows.value.reduce((s, r) => s + r.insuredCount, 0),
  vehicleCount: dataRows.value.reduce((s, r) => s + r.vehicleCount, 0),
}))

const columns = [
  { key: 'id', label: '번호', width: '70px' },
  { key: 'dept', label: '관서', width: '200px' },
  { key: 'groupType', label: '단체종류' },
  { key: 'groupName', label: '단체명' },
  { key: 'memberCount', label: '인원' },
  { key: 'equipmentNote', label: '장비지원내용' },
  { key: 'budgetAmount', label: '지자체 예산지원' },
  { key: 'insuredCount', label: '보험가입' },
  { key: 'vehicleCount', label: '보유차량' },
  { key: 'awardNote', label: '포상내용' },
]

/**
 * TableWrapper 는 TabulatorGrid 의 download() 가 없어 CSV 를 직접 만든다.
 * 엑셀이 UTF-8 을 알아보게 BOM 을 붙인다.
 */
function onDownloadExcel() {
  const header = columns.map((c) => c.label)
  const body = dataRows.value.map((row) => columns.map((c) => String(row[c.key as keyof StatusRow] ?? '')))
  const totalLine = ['합계', '', '', '', String(totals.value.memberCount), '', String(totals.value.budgetAmount), String(totals.value.insuredCount), String(totals.value.vehicleCount), '']

  const csv = [header, totalLine, ...body]
    .map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const today = new Date().toISOString().slice(0, 10)
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `단체현황_${today}.csv`
  link.click()
  URL.revokeObjectURL(url)
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
