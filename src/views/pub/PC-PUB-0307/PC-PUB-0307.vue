<template>
  <PageHeader>
    <template #left>
      <PageTitle title="활동현황" />
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
    caption="활동현황 목록"
    :show-pagination="false"
    empty-title="조회된 활동현황이 없습니다"
    empty-description="검색 조건을 바꿔 다시 조회해 주세요."
  >
    <!--
      2단 헤더. 앞 4칸은 rowspan 으로 두 줄을 차지하고, '활동실적'·'특별활동실적' 만
      아래에 하위 칸을 갖는다. columns 한 줄로는 못 그려서 헤더를 직접 그린다.
    -->
    <template #header="{ headClass }">
      <TableRow>
        <TableHead v-for="column in leadColumns" :key="column.key" :rowspan="2" :class="headClass">
          {{ column.label }}
        </TableHead>
        <TableHead :colspan="activityColumns.length" :class="headClass">활동실적</TableHead>
        <TableHead :colspan="specialColumns.length" :class="headClass">특별활동실적</TableHead>
      </TableRow>
      <TableRow>
        <TableHead v-for="column in [...activityColumns, ...specialColumns]" :key="column.key" :class="headClass">
          {{ column.label }}
        </TableHead>
      </TableRow>
    </template>

    <!-- 합계 줄. 앞 4칸(번호·관서·단체종류·활동종류)을 colspan 으로 한 칸으로 합친다 -->
    <template #summary-row="{ cellClass }">
      <TableRow class="row-total">
        <TableCell :colspan="leadColumns.length" :class="cellClass">합계</TableCell>
        <TableCell v-for="column in sumColumns" :key="column.key" :class="cellClass">
          {{ totals[column.key] }}
        </TableCell>
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
import { TableCell, TableHead, TableRow } from '@/components/ui/table'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { usePublicSafetyStore, groupTypeOptions, activityTypeOptions } from '../composable/publicSafety'
import HelpButton from '@/components/custom/button/HelpButton.vue'

defineOptions({ name: 'PcPub0307' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '방범협력단체' },
  { label: '활동현황' },
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

function activityTypeLabel(value: string) {
  return activityTypeOptions.find((o) => o.value === value)?.label ?? value
}

function durationHours(from: string, to: string) {
  const [fh, fm] = from.split(':').map(Number)
  const [th, tm] = to.split(':').map(Number)
  if ([fh, fm, th, tm].some((n) => Number.isNaN(n))) return 0
  const minutes = th * 60 + tm - (fh * 60 + fm)
  return Math.max(0, Math.round((minutes / 60) * 10) / 10)
}

interface ActivityStatusRow {
  id: number
  dept: string
  groupType: string
  activityType: string
  participantCount: number
  count: number
  totalHours: number
  jointArrest: number
  crimeReport: number
  drunkProtection: number
  elderlyProtection: number
  safeReturn: number
  etcActivity: number
}

/** 합계 대상 숫자 컬럼 키 */
type SumKey = Exclude<keyof ActivityStatusRow, 'id' | 'dept' | 'groupType' | 'activityType'>

/*
 * 헤더가 2단이라 컬럼을 세 덩어리로 나눠 둔다.
 * - leadColumns: 두 줄을 차지하는 앞칸(rowspan)
 * - activityColumns / specialColumns: 그룹 아래 하위 칸
 * TableWrapper 본문은 이 셋을 이어 붙인 columns 로 그린다.
 */
const leadColumns = [
  { key: 'id', label: '번호', width: '56px' },
  { key: 'dept', label: '관서', width: '200px' },
  { key: 'groupType', label: '단체종류' },
  { key: 'activityType', label: '활동종류' },
]

const activityColumns: { key: SumKey; label: string }[] = [
  { key: 'participantCount', label: '인원' },
  { key: 'count', label: '횟수' },
  { key: 'totalHours', label: '총활동시간' },
]

const specialColumns: { key: SumKey; label: string }[] = [
  { key: 'jointArrest', label: '합동검거' },ㄹ
  { key: 'crimeReport', label: '범죄신고' },
  { key: 'drunkProtection', label: '주취자보호' },
  { key: 'elderlyProtection', label: '노약자보호' },
  { key: 'safeReturn', label: '안심귀가' },
  { key: 'etcActivity', label: '기타' },
]

const sumColumns = [...activityColumns, ...specialColumns]
const columns = [...leadColumns, ...sumColumns]

const filteredActivities = computed(() => {
  return store.activities.value.filter((a) => {
    if (groupTypeFilter.value !== 'all' && a.groupType !== groupTypeFilter.value) return false
    if (groupFilter.value !== 'all' && String(a.groupId) !== groupFilter.value) return false
    if (dateFrom.value && a.date < dateFrom.value) return false
    if (dateTo.value && a.date > dateTo.value) return false
    return true
  })
})

/** 합계는 별도 줄(#summary-row)로 그리므로 데이터 행에는 섞지 않는다 */
const dataRows = computed<ActivityStatusRow[]>(() => {
  const buckets = new Map<string, ActivityStatusRow>()
  for (const a of filteredActivities.value) {
    const key = `${a.dept}__${a.groupType}__${a.activityType}`
    if (!buckets.has(key)) {
      buckets.set(key, {
        id: buckets.size + 1,
        dept: a.dept,
        groupType: groupTypeOptions.find((o) => o.value === a.groupType)?.label ?? a.groupType,
        activityType: activityTypeLabel(a.activityType),
        participantCount: 0,
        count: 0,
        totalHours: 0,
        jointArrest: 0,
        crimeReport: 0,
        drunkProtection: 0,
        elderlyProtection: 0,
        safeReturn: 0,
        etcActivity: 0,
      })
    }
    const bucket = buckets.get(key)!
    bucket.participantCount += a.participantCount
    bucket.count += 1
    bucket.totalHours += durationHours(a.timeFrom, a.timeTo)
    if (a.jointArrest.trim()) bucket.jointArrest += 1
    if (a.crimeReport.trim()) bucket.crimeReport += 1
    if (a.drunkProtection.trim()) bucket.drunkProtection += 1
    if (a.elderlyProtection.trim()) bucket.elderlyProtection += 1
    if (a.safeReturn.trim()) bucket.safeReturn += 1
    if (a.etcActivity.trim()) bucket.etcActivity += 1
  }
  return Array.from(buckets.values())
})

const totals = computed(() => {
  const result = {} as Record<SumKey, number>
  for (const column of sumColumns) {
    result[column.key] = dataRows.value.reduce((sum, row) => sum + row[column.key], 0)
  }
  return result
})

/**
 * TableWrapper 는 TabulatorGrid 의 download() 가 없어 CSV 를 직접 만든다.
 * 엑셀이 UTF-8 을 알아보게 BOM 을 붙인다.
 */
function onDownloadExcel() {
  const header = columns.map((c) => c.label)
  const totalLine = [
    '합계',
    ...Array(leadColumns.length - 1).fill(''),
    ...sumColumns.map((c) => String(totals.value[c.key])),
  ]
  const body = dataRows.value.map((row) =>
    columns.map((c) => String(row[c.key as keyof ActivityStatusRow] ?? '')),
  )

  const csv = [header, totalLine, ...body]
    .map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const today = new Date().toISOString().slice(0, 10)
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `활동현황_${today}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

useSideMenuSetup({ ...publicSafetyMenu, activeChild: '활동현황', openIndex: 2 })

useBottomTabSetup({
  value: 'PC-PUB-0307',
  label: '활동현황',
  path: '/views/pub/PC-PUB-0307',
  componentName: 'PcPub0307',
  closable: true,
})
</script>
