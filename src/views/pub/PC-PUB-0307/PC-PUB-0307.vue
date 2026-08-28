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
import { usePublicSafetyStore, groupTypeOptions, activityTypeOptions } from '../composable/publicSafety'

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
  id: number | string
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

const filteredActivities = computed(() => {
  return store.activities.value.filter((a) => {
    if (groupTypeFilter.value !== 'all' && a.groupType !== groupTypeFilter.value) return false
    if (groupFilter.value !== 'all' && String(a.groupId) !== groupFilter.value) return false
    if (dateFrom.value && a.date < dateFrom.value) return false
    if (dateTo.value && a.date > dateTo.value) return false
    return true
  })
})

const rows = computed<ActivityStatusRow[]>(() => {
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
  const dataRows = Array.from(buckets.values())
  const sum = (key: keyof ActivityStatusRow) => dataRows.reduce((s, r) => s + (r[key] as number), 0)
  const total: ActivityStatusRow = {
    id: '합계',
    dept: '합계',
    groupType: '',
    activityType: '',
    participantCount: sum('participantCount'),
    count: sum('count'),
    totalHours: sum('totalHours'),
    jointArrest: sum('jointArrest'),
    crimeReport: sum('crimeReport'),
    drunkProtection: sum('drunkProtection'),
    elderlyProtection: sum('elderlyProtection'),
    safeReturn: sum('safeReturn'),
    etcActivity: sum('etcActivity'),
  }
  return [total, ...dataRows]
})

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 70, hozAlign: 'center' },
  { title: '관서', field: 'dept', hozAlign: 'center' },
  { title: '단체종류', field: 'groupType', hozAlign: 'center' },
  { title: '활동종류', field: 'activityType', hozAlign: 'center' },
  {
    title: '활동실적',
    columns: [
      { title: '인원', field: 'participantCount', hozAlign: 'center' },
      { title: '횟수', field: 'count', hozAlign: 'center' },
      { title: '총활동시간', field: 'totalHours', hozAlign: 'center' },
    ],
  },
  {
    title: '특별활동실적',
    columns: [
      { title: '합동검거', field: 'jointArrest', hozAlign: 'center' },
      { title: '범죄신고', field: 'crimeReport', hozAlign: 'center' },
      { title: '주취자보호', field: 'drunkProtection', hozAlign: 'center' },
      { title: '노약자보호', field: 'elderlyProtection', hozAlign: 'center' },
      { title: '안심귀가', field: 'safeReturn', hozAlign: 'center' },
      { title: '기타', field: 'etcActivity', hozAlign: 'center' },
    ],
  },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `활동현황_${today}.csv`)
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

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="활동현황" />
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
    placeholder="조회된 활동현황이 없습니다"
  />
</template>
