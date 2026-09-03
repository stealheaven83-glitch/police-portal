<template>
  <PageHeader>
    <template #left>
      <PageTitle title="주취자입퇴소현황" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <SearchWrapper>
    <template #form>
      <div class="search-area">
        <SelectField
          v-model="receiptRouteFilter"
          label="접수경로"
          :options="receiptRouteOptions"
          placeholder="선택"
          size="sm"
          trigger-class="w-40"
        />
        <SelectField
          v-model="regionFilter"
          label="지역"
          :options="regionFilterOptions"
          placeholder="선택"
          size="sm"
          trigger-class="w-40"
        />
        <SelectField
          v-model="centerFilter"
          label="센터명"
          :options="centerFilterOptions"
          placeholder="선택"
          size="sm"
          trigger-class="w-70"
        />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <TabulatorGrid
    class="flex-1"
    :columns="columns"
    :data="rows"
    height="100%"
    min-height="40rem"
    placeholder="조회된 입·퇴소 내역이 없습니다"
    show-pagination
    :items-per-page="10"
  />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useDrunkCenterStore, regionFilterOptions, regionLabel } from '../composable/drunkCenter'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import {
  useDrunkAdmissionStatus,
  receiptRouteOptions,
  formatReceiptRoute,
  type DrunkAdmissionRow,
} from './composable/PC-PUB-0413'

// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!) — useBottomTabSetup 의 componentName 과 일치해야 한다.
defineOptions({ name: 'PcPub0413' })

/*
 * 브레드크럼: 기획서 GNB 표기가 'HOME > 생활안전 > 보호조치대응팀' 3단계라 그대로 따른다
 * (다른 화면처럼 마지막에 화면명을 붙이지 않았다). path 는 실제 라우트가 있는 항목만 준다.
 */
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '보호조치대응팀' },
]

const store = useDrunkCenterStore()
const { receiptRouteFilter, regionFilter, centerFilter, rows } = useDrunkAdmissionStatus()

/**
 * 기획서 [2][3] — 등록된 주취자센터의 지역·센터 목록을 노출하고,
 * 지역을 고르지 않으면 전체 센터 목록을 보여준다.
 * 센터는 코드가 아니라 이름으로 거른다(입퇴소 행이 센터명을 문자열로 들고 있다 — 기획서 [4]).
 */
const centerFilterOptions = computed(() => [
  { label: '전체', value: 'all' },
  ...store.centers.value
    .filter((center) => regionFilter.value === 'all' || center.region === regionFilter.value)
    .map((center) => ({ label: center.name, value: center.name })),
])

// 지역을 바꾸면 직전에 고른 센터가 목록에 없을 수 있어 '전체'로 되돌린다.
watch(regionFilter, () => {
  centerFilter.value = 'all'
})

const columns: TabulatorGridColumn[] = [
  { title: 'NO', field: 'no', width: 70, hozAlign: 'center' },
  { title: '성명', field: 'name', width: 100, hozAlign: 'center' },
  { title: '성별', field: 'gender', width: 80, hozAlign: 'center' },
  { title: '연령대', field: 'ageGroup', width: 90, hozAlign: 'center' },
  { title: '증상', field: 'symptom', width: 90, hozAlign: 'center' },
  {
    title: '접수경로',
    field: 'receiptRoute',
    widthGrow: 2,
    hozAlign: 'center',
    formatter: (cell: any) => formatReceiptRoute(cell.getRow().getData() as DrunkAdmissionRow),
  },
  { title: '지역', field: 'region', width: 100, hozAlign: 'center', formatter: (cell: any) => regionLabel(cell.getValue()) },
  { title: '센터명', field: 'centerName', widthGrow: 2, hozAlign: 'left' },
  { title: '입소일시', field: 'admittedAt', width: 150, hozAlign: 'center' },
  { title: '퇴소일시', field: 'dischargedAt', width: 150, hozAlign: 'center' },
]

// items[4] = '보호조치 대응팀' > '주취자 입퇴소 현황'
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 4, activeChild: '주취자 입퇴소 현황' })

useBottomTabSetup({
  value: 'PC-PUB-0413',
  label: '주취자 입퇴소 현황',
  path: '/views/pub/PC-PUB-0413',
  componentName: 'PcPub0413',
  closable: true,
})
</script>
