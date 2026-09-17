<template>
  <PageHeader>
    <template #left>
      <PageTitle title="(구) 자료조회" />
    </template>
    <template #right>
      <div class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </div>
    </template>
  </PageHeader>

  <!-- 탭 세 개가 한 화면 안에서 바뀐다(화면군 PC-PUB-0208 / 0209 / 0210) -->
  <Tabs v-model="activeTab" class="my-5">
    <TabsList variant="fill" :grow="true">
      <TabsTrigger v-for="tab in caseTabs" :key="tab.value" :value="tab.value">{{ tab.label }}</TabsTrigger>
    </TabsList>
  </Tabs>

  <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </template>
    <template #form>
      <div class="search-area"> 
        <DateRangePicker
          v-model:from="receiptFrom"
          v-model:to="receiptTo"
          label="접수일자"
          from-label="접수일자 시작일"
          to-label="접수일자 종료일"
          size="sm"
          input-class="w-40"
        />
        <SelectField
          v-model="searchRoute"
          label="접수경로"
          :options="receiptRouteOptions"
          size="sm"
          trigger-class="w-30"
        />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <p class="form-note end">
      * 개인정보를 공무수행 목적외 사적으로 조회 또는 유출하여 타인의 비밀을 침해하거나 누설할 경우
      <span class="notice-strong">5년이하의 징역 또는 5천만원 이하의 벌금</span>에 처해집니다.
    </p>
  </div>

  <LayoutSplit :count="2" :widths="[54, 46]" :min-widths="[38, 34]">
    <template #layout-1>
      <LayoutPanel :title="listPanelTitle[activeTab]">
        <!-- 컬럼이 많아 가로 스크롤이 필요하다 — fitColumns 가 아니라 fitDataFill(CLAUDE.md §6) -->
        <TabulatorGrid
          :columns="listColumns"
          :data="rows"
          class="flex-1"
          height="100%"
          layout="fitDataFill"
          :row-class="rowClass"
          placeholder="조회된 내역이 없습니다"
          show-pagination
          :items-per-page="10"
          @row-click="onListRowClick"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="상세정보">
        <template #actions>
          <Button type="button" variant="tertiary" size="sm" @click="onPrint">인쇄</Button>
        </template>

        <DomesticViolencePanel
          v-if="activeTab === 'domestic'"
          :detail="domestic"
          :score="domesticScore"
          @print="onPrint"
          @search-report="onSearchReport"
          @search-address="onSearchAddress"
        />
        <ChildAbusePanel
          v-else-if="activeTab === 'child'"
          :detail="child"
          @print="onPrint"
          @search-report="onSearchReport"
          @search-address="onSearchAddress"
        />
        <StalkingPanel
          v-else
          :detail="stalking"
          :score="stalkingScore"
          :risk-label="stalkingRiskLabel"
          @search-report="onSearchReport"
        />
      </LayoutPanel>
    </template>
  </LayoutSplit>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import { Button } from '@/components/custom/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/custom/tabs'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import LayoutSplit from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import DomesticViolencePanel from './components/DomesticViolencePanel.vue'
import ChildAbusePanel from './components/ChildAbusePanel.vue'
import StalkingPanel from './components/StalkingPanel.vue'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  useLegacyCaseSearch,
  LegacyCaseSearchKey,
  caseTabs,
  listPanelTitle,
  receiptRouteOptions,
  type CaseRow,
} from './composable/PC-PUB-0208'
// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(§5)
defineOptions({ name: 'PcPub0208' })

/*
 * LNB: publicSafetyMenu items[1] = '여성청소년'.
 * ⚠ 프리셋 children 은 '통합판단조사표 / 아동학대' 둘뿐인데 시안 LNB 에는
 *   '맞춤형 순찰현황' 과 '(구) 자료조회' 도 있다 — 시안 라벨을 그대로 넣어 뒀고
 *   프리셋 배치 등록 시 확인이 필요하다(CLAUDE.md §5 ③).
 */
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 1, activeChild: '(구) 자료조회' })

// '/pub' 은 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '여성청소년' },
  { label: '(구)자료조회' },
]

/* 탭 세 개가 같은 상태를 쓰도록 여기서 한 번만 만든다 */
const store = useLegacyCaseSearch()
provide(LegacyCaseSearchKey, store)
const {
  activeTab,
  department,
  advancedSearchOpen,
  receiptFrom,
  receiptTo,
  searchRoute,
  rows,
  activeRowKey,
  domestic,
  stalking,
  child,
  selectRow,
  domesticScore,
  stalkingScore,
  stalkingRiskLabel,
} = store

const dialog = useDialog()

const listColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  { title: '접수번호', field: 'receiptNo', width: 160, hozAlign: 'center' },
  { title: '접수일자', field: 'receiptDate', width: 120, hozAlign: 'center' },
  { title: '접수경로', field: 'receiptRoute', width: 110, hozAlign: 'center' },
  { title: '사건내용', field: 'caseSummary', width: 180, hozAlign: 'center' },
  { title: '피해자 성명', field: 'victimName', width: 110, hozAlign: 'center' },
  { title: '피해자 전화번호', field: 'victimPhone', width: 150, hozAlign: 'center' },
]

/** 지금 오른쪽 상세에 떠 있는 행만 배경으로 표시한다(탭마다 따로 기억한다) */
function rowClass(row: CaseRow) {
  return row.rowKey === activeRowKey.value[activeTab.value] ? 'lp-grid-active-row' : undefined
}

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onListRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as CaseRow
  selectRow(data.rowKey)
}

/* 인쇄 · 112신고 조회 · 주소검색은 개발팀 연동 대상이라 화면단에서는 안내만 낸다 */
async function onPrint() {
  await dialog.alert({ title: '인쇄는 연동 후 제공됩니다.', btnCancel: '확인' })
}
async function onSearchReport() {
  await dialog.alert({ title: '112신고 조회는 연동 후 제공됩니다.', btnCancel: '확인' })
}
async function onSearchAddress() {
  await dialog.alert({ title: '주소검색은 연동 후 제공됩니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PC-PUB-0208',
  label: '(구)자료조회',
  path: '/views/pub/PC-PUB-0208',
  componentName: 'PcPub0208',
  closable: true,
})
</script>
