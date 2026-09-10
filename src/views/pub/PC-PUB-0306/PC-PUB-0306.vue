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
        <SelectField v-model="groupTypeFilter" label="단체종류" placeholder="선택" :options="groupTypeFilterOptions" size="sm" trigger-class="w-32" />
        <SelectField v-model="groupFilter" label="단체명" :options="groupFilterOptions" size="sm" trigger-class="w-40" />
        <DateRangePicker
          v-model:from="dateFrom"
          v-model:to="dateTo"
          label="기간"
          from-label="기간 시작일"
          to-label="기간 종료일"
          size="sm"
          input-class="w-40"
        />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
      <Download :size="16" aria-hidden="true" />
      엑셀다운로드
    </Button>
  </div>

  <!--
    본문만 세로로 스크롤시키고 헤더와 합계 줄은 고정한다(lp-table-sticky, police-override.css).
    헤더가 1단이라 --lp-thead-h 기본값(4rem)이 그대로 맞다 — 2단이면 lp-table-sticky-head2 를 같이 건다.
  -->
  <TableWrapper
    class="lp-table-sticky"
    :columns="columns"
    :items="pagedRows"
    caption="단체현황 목록"
    show-pagination
    :items-per-page="itemsPerPage"
    :total-elements="dataRows.length"
    :total-pages="totalPages"
    :current-page="currentPage"
    empty-title="조회된 단체가 없습니다"
    empty-description="검색 조건을 바꿔 다시 조회해 주세요."
    @page-change="(page) => (currentPage = page)"
    @update:items-per-page="onItemsPerPageChange"
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
import { computed, ref, watch } from 'vue'
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
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
// 시안(11502:115639)의 단체종류는 아직 아무것도 안 고른 상태('선택' placeholder)다
const groupTypeFilter = ref('')
const groupFilter = ref('all')
const dateFrom = ref('2026-07-16')
const dateTo = ref('2026-07-16')
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
    // 안 고른 상태('')와 '전체'는 거르지 않는다
    if (groupTypeFilter.value && groupTypeFilter.value !== 'all' && g.groupType !== groupTypeFilter.value) return false
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

/** 합계는 보고 있는 페이지가 아니라 조회된 전체를 대상으로 한다 */
const totals = computed(() => ({
  memberCount: dataRows.value.reduce((s, r) => s + r.memberCount, 0),
  budgetAmount: dataRows.value.reduce((s, r) => s + r.budgetAmount, 0),
  insuredCount: dataRows.value.reduce((s, r) => s + r.insuredCount, 0),
  vehicleCount: dataRows.value.reduce((s, r) => s + r.vehicleCount, 0),
}))

/*
 * 페이지네이션. TableWrapper 는 목록을 내부에서 자르지 않고 받은 items 를 그대로 그리므로,
 * 자르는 것과 페이지 상태는 화면이 갖는다(PM-PUB-0409 와 같은 방식).
 */
const currentPage = ref(1)
const itemsPerPage = ref(10)

const totalPages = computed(() => Math.max(1, Math.ceil(dataRows.value.length / itemsPerPage.value)))

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return dataRows.value.slice(start, start + itemsPerPage.value)
})

function onItemsPerPageChange(size: number) {
  itemsPerPage.value = size
  currentPage.value = 1
}

/** 조회 조건이 바뀌어 목록이 줄면 보고 있던 페이지가 범위를 벗어난다 — 1페이지로 되돌린다 */
watch(dataRows, () => {
  currentPage.value = 1
})

/*
 * 폭은 시안(11502:115639) 실측값이다. 모든 칸에 폭을 주는 이유는 두 가지다.
 * - table-layout: fixed 라 폭을 안 주면 남는 폭을 나눠 가져 인원 같은 좁은 칸이 넓어진다.
 * - 폭의 합(1560px)보다 화면이 좁아지면 칸이 쪼그라드는 대신 가로 스크롤이 생긴다
 *   (그리드의 layout="fitDataFill" 과 같은 동작 — 컨테이너는 ui/table 이 이미 overflow:auto).
 */
const columns = [
  { key: 'id', label: '번호', width: '6rem' },
  { key: 'dept', label: '관서', width: '20rem' },
  { key: 'groupType', label: '단체종류', width: '12rem' },
  { key: 'groupName', label: '단체명', width: '17rem' },
  { key: 'memberCount', label: '인원', width: '6rem' },
  { key: 'equipmentNote', label: '장비지원내용', width: '19rem' },
  { key: 'budgetAmount', label: '지자체 예산지원', width: '19rem' },
  { key: 'insuredCount', label: '보험가입', width: '19rem' },
  { key: 'vehicleCount', label: '보유차량', width: '19rem' },
  { key: 'awardNote', label: '포상내용', width: '19rem' },
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
