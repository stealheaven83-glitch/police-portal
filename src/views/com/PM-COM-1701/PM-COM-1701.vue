<template>
  <PageHeader>
    <template #left>
      <PageTitle title="현장대응팁" />
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
      <div class="search-area board-search-row">
        <div class="group-gap2">
          <SelectField v-model="authorFilter" label="성명" :options="authorFilterOptions" size="sm" triggerClass="w-[15.4rem]" />
          <InputField2 v-model="authorKeyword" size="sm" inputClass="w-[37.2rem]" placeholder="이름을 검색해주세요." />
        </div>
      </div>
      <div class="search-area">
        <div class="group-gap2">
          <DatePicker v-model="dateFrom" label="등록일" size="sm" inputClass="w-[25rem]" />
          <span aria-hidden="true">~</span>
          <DatePicker v-model="dateTo" size="sm" inputClass="w-[25rem]" />
        </div>
        <div class="group-gap2">
          <SelectField v-model="searchField" label="검색어" :options="searchFieldOptions" size="sm" triggerClass="w-[15.3rem]" />
          <InputField2 v-model="keyword" size="sm" inputClass="w-[37.2rem]" placeholder="검색어를 입력하세요." />
        </div>
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm" @click="onSearch">조회</Button>
    </template>
  </SearchWrapper>

  <TabulatorGrid
    ref="gridRef"
    class="mt-[1.2rem] flex-1"
    :columns="columns"
    :data="rows"
    select-mode="checkbox"
    height="100%"
    min-height="40rem"
    placeholder="등록된 대응팁이 없습니다"
    show-pagination
    :items-per-page="10"
    @row-selection-changed="selectedCount = $event.length"
    @row-click="onRowClick"
  />

  <div class="list-actions">
    <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSelected">삭제</Button>
    <Button type="button" variant="primary" size="sm" @click="onRegister">등록</Button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useBoard1701List } from './composable/PM-COM-1701'
import {
  boardMenu,
  BOARD_SPECS,
  useBoardStore,
  authorFilterOptions,
  searchFieldOptions,
} from '../composable/board'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({
  name: 'PmCom1701',
})

const spec = BOARD_SPECS.tip

// LNB: 게시판 > 교육자료 나눔터 > 현장대응팁 (presets.ts 에 게시판 메뉴가 아직 없어 도메인 composable 의 구성을 쓴다)
useSideMenuSetup({ ...boardMenu, openIndex: spec.openIndex, activeChild: spec.menuChild })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '교육자료 나눔터' },
  { label: '현장대응팁' },
]

const router = useRouter()
const { selectPost } = useBoardStore('tip')

const {
  authorFilter,
  authorKeyword,
  dateFrom,
  dateTo,
  searchField,
  keyword,
  rows,
} = useBoard1701List()

function attachmentFormatter(cell: any) {
  return cell.getValue() ? '📎' : '-'
}

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 90, hozAlign: 'center' },
  { title: '제목', field: 'title', widthGrow: 4, hozAlign: 'center' },
  { title: '첨부파일', field: 'hasAttachment', width: 90, hozAlign: 'center', formatter: attachmentFormatter },
  { title: '작성자', field: 'writer', width: 110, hozAlign: 'center' },
  { title: '등록일', field: 'createdAt', width: 120, hozAlign: 'center' },
  { title: '조회수', field: 'viewCount', width: 100, hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

/** 목록 필터는 rows computed 가 이미 걸고 있다 — 버튼은 눌린 것만 알린다 */
function onSearch() {
  toast.success('조회되었습니다.')
}

function onDeleteSelected() {
  if (!selectedCount.value) {
    toast.warning('삭제할 대응팁을 선택해 주세요.')
    return
  }
  gridRef.value?.deleteSelected()
  toast.success('삭제되었습니다.')
}

function onRegister() {
  router.push({ name: 'PM-COM-1704' })
}

/** 행을 누르면 상세로 간다 */
function onRowClick(_event: unknown, row: { getData: () => { id?: number } }) {
  selectPost(row.getData().id ?? 1)
  router.push({ name: 'PM-COM-1702' })
}

useBottomTabSetup({
  value: 'PM-COM-1701',
  label: '현장대응팁',
  path: '/views/com/PM-COM-1701',
  componentName: 'PmCom1701',
  closable: true,
})
</script>
