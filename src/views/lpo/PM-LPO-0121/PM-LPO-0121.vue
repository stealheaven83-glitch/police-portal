<template>
  <PageHeader>
    <template #left>
      <PageTitle title="결재함" />
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
          input-class="w-40"
        />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions space-between">
    <FilterChipGroup v-model="activeFilter" :items="approvalFilters" />
  </div>

  <TabulatorGrid
    class="flex-1 lp-grid-no-hover"
    :columns="columns"
    :data="rows"
    height="100%"
    placeholder="조회된 내역이 없습니다"
    show-pagination
    :items-per-page="10"
  />
</template>

<script setup lang="ts">
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import { Button } from '@/components/custom/button'
import FilterChipGroup from '@/components/custom/filter-chip/FilterChipGroup.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useApprovalBox, approvalFilters, type ApprovalRow } from '../composable/approvalBox'

defineOptions({
  name: 'PmLpo0121',
})

// LNB: 개인수첩 > 결재함 (프리셋 미등록 — Figma LNB 라벨을 그대로 넣었다, CLAUDE.md §5 ③)
useSideMenuSetup({ ...localPoliceMenu, openIndex: 0, activeChild: '결재함' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '개인수첩' },
  { label: '결재함' },
]

const { dateFrom, dateTo, activeFilter, rows } = useApprovalBox()

/**
 * 결재승인자 화면 — 처리할 게 남은 행만 상태 칸이 버튼이 된다.
 * buttonVisible 이 false 면 버튼 테두리 없이 라벨(=상태 문구)만 그려진다(§6-1).
 */
const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 80, hozAlign: 'center' },
  { title: '구분', field: 'category', width: 240, hozAlign: 'center' },
  { title: '일시', field: 'targetAt', hozAlign: 'center' },
  { title: '현재단계', field: 'step', hozAlign: 'center' },
  {
    title: '상태',
    field: 'status',
    hozAlign: 'center',
    cellType: 'button',
    buttonVariant: 'tertiary',
    // 시안: 상태 버튼 높이 36px (Button sm 은 40px 이라 높이만 낮춘다)
    buttonClass: 'h-9',
    buttonLabel: (row: ApprovalRow) => row.actionLabel || row.status,
    buttonVisible: (row: ApprovalRow) => !!row.actionLabel,
    onButtonClick: (row: ApprovalRow) => onApprove(row),
  },
  { title: '확인(결재)일시', field: 'confirmedAt', hozAlign: 'center' },
]


/**
 * 결재 처리는 화면 밖 일이고 기획서에 화면 동작(확인창·안내문구)이 정의돼 있지 않다.
 * 지정되지 않은 동작은 만들지 않고 비워 둔다(CLAUDE.md 서두 — 인계 대상).
 */
function onApprove(_row: ApprovalRow) {}

useBottomTabSetup({
  value: 'PM-LPO-0121',
  label: '결재함(승인)',
  path: '/views/lpo/PM-LPO-0121',
  componentName: 'PmLpo0121',
  closable: true,
})
</script>
