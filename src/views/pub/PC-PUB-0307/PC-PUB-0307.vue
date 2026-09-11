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
    이 화면은 헤더가 2단이라 합계 줄이 붙는 높이(--lp-thead-h)를 8rem 으로 올리는
    lp-table-sticky-head2 를 같이 건다.
  -->
  <TableWrapper
    class="lp-table-sticky lp-table-sticky-head2"
    :columns="columns"
    :items="pagedRows"
    caption="활동현황 목록"
    show-pagination
    :items-per-page="itemsPerPage"
    :total-elements="dataRows.length"
    :total-pages="totalPages"
    :current-page="currentPage"
    empty-title="조회된 활동현황이 없습니다"
    empty-description="검색 조건을 바꿔 다시 조회해 주세요."
    @page-change="(page) => (currentPage = page)"
    @update:items-per-page="onItemsPerPageChange"
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
        <!-- 그룹 칸은 앞 칸과 세로선으로 끊는다 — headClass 에는 아래 선만 있다(lp-th-group-start) -->
        <TableHead :colspan="activityColumns.length" :class="[headClass, 'lp-th-group-start']">활동실적</TableHead>
        <TableHead :colspan="specialColumns.length" :class="[headClass, 'lp-th-group-start']">특별활동실적</TableHead>
      </TableRow>
      <TableRow>
        <!-- 둘째 줄에서 그룹 경계에 오는 첫 칸(인원)도 위 그룹 칸과 같은 자리라 세로선을 잇는다 -->
        <TableHead
          v-for="column in sumColumns"
          :key="column.key"
          :class="[headClass, column === activityColumns[0] ? 'lp-th-group-start' : '']"
        >
          {{ column.label }}
        </TableHead>
      </TableRow>
    </template>

    <!--
      합계 줄. 앞 4칸(번호·관서·단체종류·활동종류)을 colspan 으로 한 칸으로 합친다 —
      TabulatorGrid 는 셀 병합이 없어 이 화면은 TableWrapper 를 쓴다.
    -->
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
// 시안(11542:118007)의 단체종류는 아직 아무것도 안 고른 상태('선택' placeholder)다
const groupTypeFilter = ref('')

/*
 * 시안은 단체명이 '신당동자율방범대'로 잡힌 상태다. 목업 id 는 순서가 바뀔 수 있으니
 * 이름으로 찾는다 — 못 찾으면 '전체'로 떨어진다.
 */
const defaultGroup = store.groups.value.find((g) => g.groupName === '신당동자율방범대')
const groupFilter = ref(defaultGroup ? String(defaultGroup.id) : 'all')

/*
 * 시안의 기간은 2026-07-16 하루지만 목업 활동일이 2026-05 라 그대로 두면 목록이 빈다.
 * 시안과 같은 2줄(간담회·순찰)이 잡히는 구간으로 둔다 — 실제 기본값은 개발팀이 정한다.
 */
const dateFrom = ref('2026-05-23')
const dateTo = ref('2026-05-31')
const advancedSearchOpen = ref(false)

const groupTypeFilterOptions = [{ label: '전체', value: 'all' }, ...groupTypeOptions]
const groupFilterOptions = computed(() => [{ label: '전체', value: 'all' }, ...store.groupOptions.value])

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
 * 폭은 시안(11542:118007) 실측값이다. colgroup 으로 들어가므로 앞칸 4개와 하위 칸 9개를
 * 이어 붙인 columns 의 순서가 곧 표의 칸 순서다.
 */
const leadColumns = [
  { key: 'id', label: '번호', width: '6rem' },
  { key: 'dept', label: '관서', width: '22rem' },
  { key: 'groupType', label: '단체종류', width: '12rem' },
  { key: 'activityType', label: '활동종류', width: '12rem' },
]

const activityColumns: { key: SumKey; label: string; width: string }[] = [
  { key: 'participantCount', label: '인원', width: '10rem' },
  { key: 'count', label: '횟수', width: '10rem' },
  { key: 'totalHours', label: '총활동시간', width: '10rem' },
]

const specialColumns: { key: SumKey; label: string; width: string }[] = [
  { key: 'jointArrest', label: '합동검거', width: '12.4rem' },
  { key: 'crimeReport', label: '범죄신고', width: '12.4rem' },
  { key: 'drunkProtection', label: '주취자보호', width: '12.4rem' },
  { key: 'elderlyProtection', label: '노약자보호', width: '12.4rem' },
  { key: 'safeReturn', label: '안심귀가', width: '12.4rem' },
  { key: 'etcActivity', label: '기타', width: '12.4rem' },
]

const sumColumns = [...activityColumns, ...specialColumns]
const columns = [...leadColumns, ...sumColumns]

function activityTypeLabel(value: string) {
  return activityTypeOptions.find((o) => o.value === value)?.label ?? value
}

function groupTypeLabel(value: string) {
  return groupTypeOptions.find((o) => o.value === value)?.label ?? value
}

/** 활동시간(HH:mm ~ HH:mm)을 시간 단위로. 소수 한 자리까지만 남긴다 */
function durationHours(from: string, to: string) {
  const [fh, fm] = from.split(':').map(Number)
  const [th, tm] = to.split(':').map(Number)
  if ([fh, fm, th, tm].some((n) => Number.isNaN(n))) return 0
  const minutes = th * 60 + tm - (fh * 60 + fm)
  return Math.max(0, Math.round((minutes / 60) * 10) / 10)
}

const filteredActivities = computed(() => {
  return store.activities.value.filter((a) => {
    // 안 고른 상태('')와 '전체'는 거르지 않는다
    if (groupTypeFilter.value && groupTypeFilter.value !== 'all' && a.groupType !== groupTypeFilter.value) return false
    if (groupFilter.value !== 'all' && String(a.groupId) !== groupFilter.value) return false
    if (dateFrom.value && a.date < dateFrom.value) return false
    if (dateTo.value && a.date > dateTo.value) return false
    return true
  })
})

/**
 * 관서 + 단체종류 + 활동종류로 묶어 집계한다.
 * 합계는 별도 줄(#summary-row)로 그리므로 데이터 행에는 섞지 않는다.
 * 시안이 번호를 내림차순(2, 1)으로 보여주므로 묶은 순서대로 번호를 매긴 뒤 뒤집어 그린다.
 */
const dataRows = computed<ActivityStatusRow[]>(() => {
  const buckets = new Map<string, ActivityStatusRow>()
  for (const a of filteredActivities.value) {
    const key = `${a.dept}__${a.groupType}__${a.activityType}`
    if (!buckets.has(key)) {
      buckets.set(key, {
        id: buckets.size + 1,
        dept: a.dept,
        groupType: groupTypeLabel(a.groupType),
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
    // 특별활동실적은 메모가 적혀 있으면 1건으로 센다
    if (a.jointArrest.trim()) bucket.jointArrest += 1
    if (a.crimeReport.trim()) bucket.crimeReport += 1
    if (a.drunkProtection.trim()) bucket.drunkProtection += 1
    if (a.elderlyProtection.trim()) bucket.elderlyProtection += 1
    if (a.safeReturn.trim()) bucket.safeReturn += 1
    if (a.etcActivity.trim()) bucket.etcActivity += 1
  }
  return Array.from(buckets.values()).reverse()
})

/** 합계는 보고 있는 페이지가 아니라 조회된 전체를 대상으로 한다 */
const totals = computed(() => {
  const result = {} as Record<SumKey, number>
  for (const column of sumColumns) {
    result[column.key] = dataRows.value.reduce((sum, row) => sum + row[column.key], 0)
  }
  return result
})

/*
 * 페이지네이션. TableWrapper 는 목록을 내부에서 자르지 않고 받은 items 를 그대로 그리므로,
 * 자르는 것과 페이지 상태는 화면이 갖는다(PC-PUB-0306 과 같은 방식).
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
