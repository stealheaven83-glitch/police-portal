<template>
  <PageHeader>
    <template #left>
      <PageTitle title="개인실적조회" />
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
        <DateRangePicker
          v-model:from="dateFrom"
          v-model:to="dateTo"
          label="검색기간"
          from-label="검색기간 시작일"
          to-label="검색기간 종료일"
          size="sm"
        />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm" @click="search">조회</Button>
    </template>
  </SearchWrapper>

  <!--
    실적 구분 탭(시안 tab_2 8개, 4열 2줄). 공통 Tabs 의 fill 변형이 테두리·활성 남색까지 같고
    칸 모양(높이 58·좌우 16·양끝 정렬·17px)만 달라 .perf-tab* 로 덮는다(police-override.css).
    목록은 탭 하나에 하나씩 — TabsContent 하나가 activeTab 을 따라가며 tabpanel 역할을 맡는다.
  -->
  <Tabs :model-value="activeTab" class="perf-tabs" @update:model-value="onTabChange">
    <TabsList variant="fill" class="perf-tab-list" aria-label="실적 구분">
      <TabsTrigger v-for="tab in perfTabs" :key="tab.value" :value="tab.value" class="perf-tab">
        <span>{{ tab.label }}</span>
        <span class="perf-tab-count">
          <span class="perf-tab-num">{{ countByTab[tab.value] }}</span>
          <span class="perf-tab-unit">건</span>
        </span>
      </TabsTrigger>
    </TabsList>

    <TabsContent :value="activeTab" class="perf-tab-panel">
      <div class="list-actions">
        <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
          <Download :size="16" aria-hidden="true" />
          엑셀다운로드
        </Button>
      </div>

      <!-- 사용자 지정: 그리드 대신 TableWrapper, 페이지당 5건 -->
      <TableWrapper
        :columns="columns"
        :items="pagedRows"
        show-pagination
        :items-per-page="itemsPerPage"
        :items-per-page-options="pageSizeOptions"
        :total-elements="rows.length"
        :total-pages="totalPages"
        :current-page="currentPage"
        empty-title="조회된 실적이 없습니다"
        empty-description="검색 조건을 바꿔 다시 조회해 주세요."
        @page-change="(page) => (currentPage = page)"
        @update:items-per-page="onItemsPerPageChange"
      />
    </TabsContent>
  </Tabs>
</template>

<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import { Button } from '@/components/custom/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/custom/tabs'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { usePerformanceStats, perfTabs, pageSizeOptions, type PerfTabKey } from './composable/PC-LPO-0111'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(CLAUDE.md §3)
defineOptions({ name: 'PcLpo0111' })

/**
 * LNB. 프리셋을 인라인으로 펼쳐 동기 경로로 준다(docs/create.md §3).
 * 이 화면은 items[0] '개인수첩' > '개인실적조회' — presets.ts 에 path 가 이미 있어
 * syncActiveByRoute() 가 경로로도 맞춘다.
 */
useSideMenuSetup({ ...localPoliceMenu, openIndex: 0, activeChild: '개인실적조회' })

// 브레드크럼은 시안대로 홈 > 지역경찰 > 개인수첩 — Breadcrumb 이 마지막 항목(현재 화면명)은 숨긴다.
// 실제 라우트가 있는 항목만 path 를 준다.
const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '개인수첩' },
  { label: '개인실적조회' },
]

const {
  dateFrom,
  dateTo,
  activeTab,
  countByTab,
  columns,
  rows,
  pagedRows,
  currentPage,
  itemsPerPage,
  totalPages,
  onItemsPerPageChange,
  selectTab,
  search,
} = usePerformanceStats()

/** reka-ui Tabs 는 string | number 로 넘긴다 — 탭 키로 좁혀서 composable 에 준다 */
function onTabChange(value: string | number) {
  selectTab(value as PerfTabKey)
}

/** 현재 탭 목록 전체를 CSV 로 — TableWrapper 에는 download 가 없어 화면에서 만든다(PC-PUB-0306 과 같은 형태) */
function onDownloadExcel() {
  const header = columns.value.map((c) => c.label)
  const body = rows.value.map((row) => columns.value.map((c) => String(row[c.key] ?? '')))
  const csv = [header, ...body]
    .map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const tabLabel = perfTabs.find((tab) => tab.value === activeTab.value)?.label ?? '개인실적'
  const today = new Date().toISOString().slice(0, 10)
  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `개인실적조회_${tabLabel}_${today}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

useBottomTabSetup({
  value: 'PC-LPO-0111',
  label: '개인실적조회',
  path: '/views/lpo/PC-LPO-0111',
  componentName: 'PcLpo0111',
  closable: true,
})
</script>
