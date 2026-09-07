<template>
  <PageHeader>
    <template #left>
      <PageTitle title="공지사항" />
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
      <div class="search-area mb-4">
        <div class="group-gap2">
          <SelectField v-model="authorFilter" label="성명" labelClass="" :options="authorFilterOptions" size="sm" triggerClass="w-[15.4rem]" />
          <InputField2 v-model="authorKeyword" size="sm" inputClass="w-[37.2rem]" placeholder="이름을 검색해주세요." />
        </div>
      </div>
      <div class="search-area">
        <div class="group-gap2">
          <DatePicker v-model="dateFrom" label="등록일" size="sm" inputClass="w-[250px]" />
          <span aria-hidden="true">~</span>
          <DatePicker v-model="dateTo" size="sm" inputClass="w-[25rem]" />
        </div>
        <div class="group-gap2">
          <SelectField v-model="searchField" label="검색어" :options="searchFieldOptions" size="sm" triggerClass="w-[15.3rem]" />
          <InputField2 v-model="keyword" size="sm" inputClass="w-[37.2rem]" placeholder="검색어를 입력해주세요." />
        </div>
      </div>
    </template>
    <template #btns>
      <Button variant="secondary" size="sm">조회</Button>
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
    placeholder="등록된 공지사항이 없습니다"
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
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useNoticeList, authorFilterOptions, searchFieldOptions } from './composable/PM-COM-1001'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useNoticeStore, bulletinMenu } from '../composable/notice'
import HelpButton from '@/components/custom/button/HelpButton.vue'
defineOptions({ name: 'PmCom1001' })

// LNB: 게시판 > 공지사항 (presets.ts 에 게시판 메뉴가 아직 없어 도메인 composable 의 구성을 쓴다)
useSideMenuSetup(bulletinMenu)

const router = useRouter()
const { selectNotice } = useNoticeStore()

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '공지사항' },
]

const {
  department,
  advancedSearchOpen,
  authorFilter,
  authorKeyword,
  dateFrom,
  dateTo,
  searchField,
  keyword,
  rows,
} = useNoticeList()

/** '중요' 공지는 빨간 배지로, 일반 글은 번호 그대로 표시 */
function noFormatter(cell: any) {
  const value = cell.getValue()
  if (value === '중요') {
    return '<span style="display:inline-flex;align-items:center;justify-content:center;height:2rem;padding:0 0.8rem;border-radius:0.4rem;background:var(--danger);color:#fff;font-size:1.2rem;font-weight:600;">중요</span>'
  }
  return String(value)
}

function attachmentFormatter(cell: any) {
  return cell.getValue() ? '📎' : '-'
}

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 90, hozAlign: 'center', formatter: noFormatter },
  { title: '부서', field: 'dept', width: 200, hozAlign: 'center' },
  { title: '제목', field: 'title', widthGrow: 4, hozAlign: 'center' },
  { title: '첨부파일', field: 'hasAttachment', width: 90, hozAlign: 'center', formatter: attachmentFormatter },
  { title: '작성자', field: 'writer', width: 110, hozAlign: 'center' },
  { title: '등록일', field: 'createdAt', width: 120, hozAlign: 'center' },
  { title: '조회수', field: 'viewCount', width: 100, hozAlign: 'center' },
  { title: '추천수', field: 'recommendCount', width: 100, hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

function onDeleteSelected() {
  if (!selectedCount.value) {
    toast.warning('삭제할 게시글을 선택해 주세요.')
    return
  }
  gridRef.value?.deleteSelected()
  toast.success('삭제되었습니다.')
}

function onRegister() {
  router.push({ name: 'PM-COM-1004' })
}

/** 제목을 누르면 상세(PM-COM-1002)로 간다 */
function onRowClick(_event: unknown, row: { getData: () => { id?: number } }) {
  selectNotice(row.getData().id ?? 1)
  router.push({ name: 'PM-COM-1002' })
}

useBottomTabSetup({
  value: 'PM-COM-1001',
  label: '공지사항',
  path: '/views/com/PM-COM-1001',
  componentName: 'PmCom1001',
  closable: true,
})
</script>
