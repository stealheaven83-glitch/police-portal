<template>
  <PageHeader>
    <template #left>
      <PageTitle title="상시학습자료" />
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
        <div class="group-gap2">
          <SelectField v-model="authorFilter" label="성명" :options="authorFilterOptions" size="sm" trigger-class="w-40" />
          <InputField2 v-model="authorKeyword" size="sm" placeholder="이름을 검색해주세요." />
        </div>
        <div class="group-gap2">
          <DatePicker v-model="dateFrom" label="등록일" size="sm" input-class="w-40" />
          <span aria-hidden="true">~</span>
          <DatePicker v-model="dateTo" size="sm" input-class="w-40" />
        </div>
        <div class="group-gap2">
          <SelectField v-model="searchField" label="검색어" :options="searchFieldOptions" size="sm" trigger-class="w-40" />
          <InputField2 v-model="keyword" size="sm" placeholder="검색어를 입력하세요." trigger-class="w-60" />
        </div>
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSelected">삭제</Button>
    <Button type="button" variant="primary" size="sm" @click="onCreate">등록</Button>
  </div>

  <TabulatorGrid
    ref="gridRef"
    class="flex-1"
    :columns="columns"
    :data="pagedRows"
    select-mode="checkbox"
    height="100%"
    min-height="40rem"
    placeholder="등록된 학습자료가 없습니다"
    show-pagination
    v-model:current-page="currentPage"
    :items-per-page="itemsPerPage"
    :total-elements="totalCount"
    @update:items-per-page="itemsPerPage = $event"
    @row-selection-changed="selectedCount = $event.length"
    @row-click="onRowClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { Button } from '@/components/custom/button'
import { badgeVariants } from '@/components/custom/badge'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useDialog } from '@/composable/dialog/dialog'
import { useStudyList, type StudyRow } from './composable/PM-COM-1501'
import {
  boardMenu,
  useBoardStore,
  authorFilterOptions,
  searchFieldOptions,
} from '../composable/board'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({ name: 'PmCom1501' })

// LNB: 게시판 > 교육자료 나눔터 > 상시학습자료
// (presets.ts 에 게시판 메뉴가 아직 없어 도메인 composable 의 구성을 쓴다 — docs/create.md §3)
useSideMenuSetup({ ...boardMenu, openIndex: 4, activeChild: '상시학습자료' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '교육자료 나눔터' },
  { label: '상시학습자료' },
]

const router = useRouter()
const dialog = useDialog()
const { selectPost } = useBoardStore('study')

const {
  department,
  advancedSearchOpen,
  authorFilter,
  authorKeyword,
  dateFrom,
  dateTo,
  searchField,
  keyword,
  currentPage,
  itemsPerPage,
  totalCount,
  pagedRows,
  removeRows,
} = useStudyList()

/** 고정 공지는 번호 자리에 '공지' 배지가 들어간다.
 *  Tabulator 포매터는 HTML 문자열을 innerHTML 로 넣는 자리라 Vue 컴포넌트 태그를 써도 컴파일되지
 *  않는다 — 대신 Badge 가 쓰는 badgeVariants() 로 같은 클래스 문자열을 받아 <span> 에 입힌다 */
function noFormatter(cell: any) {
  const value = cell.getValue()
  if (value === '공지') {
    return `<span class="${badgeVariants({ shape: 'sm', color: 'primary' })}">공지</span>`
  }
  return String(value)
}

/** 첨부파일 있음 아이콘 — 포털 공통 SVG(20×20). 포매터도 HTML 문자열 자리라 <img> 로 넣는다 */
const attachIcon = '/portal/asset/images/icon/ico_attach.svg'

function attachmentFormatter(cell: any) {
  return cell.getValue() ? `<img src="${attachIcon}" alt="첨부파일 있음" width="20" height="20">` : '-'
}

/** 제목 뒤에 댓글 수를 point 색으로 '+22' 처럼 붙인다.
 *  제목은 사용자 입력이라 innerHTML 문자열이 아니라 textContent 로 넣는다 */
function titleFormatter(cell: any) {
  const row = cell.getData() as StudyRow
  const wrap = document.createElement('span')
  wrap.textContent = row.title
  if (row.commentCount > 0) {
    const count = document.createElement('b')
    count.className = 'lp-em-point'
    count.textContent = ` +${row.commentCount}`
    wrap.appendChild(count)
  }
  return wrap
}

/** 추천수는 이 게시판에 없다 */
const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 90, hozAlign: 'center', formatter: noFormatter },
  { title: '부서', field: 'dept', width: 200, hozAlign: 'center' },
  { title: '제목', field: 'title', widthGrow: 4, hozAlign: 'left', formatter: titleFormatter },
  { title: '첨부파일', field: 'hasAttachment', width: 90, hozAlign: 'center', formatter: attachmentFormatter },
  { title: '작성자', field: 'writer', width: 110, hozAlign: 'center' },
  { title: '등록일', field: 'createdAt', width: 120, hozAlign: 'center' },
  { title: '조회수', field: 'viewCount', width: 100, hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

/**
 * 삭제.
 * 1) 선택한 항목이 없는 경우 — 버튼 비활성이지만 알림창으로 막는다.
 * 2) 선택이 있으면 Confirm — 되돌릴 수 없는 삭제라 CLAUDE.md §4 의 confirm 예외에 해당한다.
 */
async function onDeleteSelected() {
  if (!selectedCount.value) {
    await dialog.alert({ title: '삭제할 게시물을 선택해 주세요.', btnCancel: '확인' })
    return
  }
  const result = await dialog.confirm({
    title: '삭제된 게시물은 복구할 수 없습니다. 선택된 게시물을 삭제 하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  // 페이징을 화면이 쥐고 있어(pagedRows) 그리드 안에서만 지우면 페이지를 옮길 때 되살아난다 — 원본에서 지운다
  const ids = (gridRef.value?.getSelectedData() ?? []).map((row: StudyRow) => row.id)
  removeRows(ids)
  selectedCount.value = 0
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

/** 게시물 작성 가능 계정이면 등록 화면으로 이동 */
function onCreate() {
  router.push({ name: 'PM-COM-1504' })
}

/** 제목을 누르면 상세로 이동 */
function onRowClick(_event: unknown, row: { getData: () => { id?: number } }) {
  selectPost(row.getData().id ?? 1)
  router.push({ name: 'PM-COM-1502' })
}

useBottomTabSetup({
  value: 'PM-COM-1501',
  label: '상시학습자료',
  path: '/views/com/PM-COM-1501',
  componentName: 'PmCom1501',
  closable: true,
})
</script>
