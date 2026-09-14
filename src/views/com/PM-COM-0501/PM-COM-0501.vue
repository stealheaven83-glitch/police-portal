<template>
  <PageHeader>
    <template #left>
      <PageTitle title="지역경찰 시책" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <!-- Figma 11015:105135: 부서줄 → 검색상자 20 / 상자 안 줄 사이 16 / 상자 → 버튼줄 20 / 버튼줄 → 표 20 -->
  <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </template>
    <template #form>
      <!-- 시안은 두 줄 고정: 성명 / 등록일 + 검색어 (줄 사이 16) -->
      <div class="lp-search-rows">
        <div class="search-area">
          <div class="group-gap2">
            <SelectField v-model="authorFilter" label="성명" :options="authorFilterOptions" size="sm" trigger-class="w-40" />
            <InputField2 v-model="authorKeyword" size="sm" placeholder="이름을 검색해주세요." input-class="w-92" />
          </div>
        </div>
        <div class="search-area">
          <div class="group-gap2">
            <DatePicker v-model="dateFrom" label="등록일" size="sm" input-class="w-60" />
            <span aria-hidden="true">~</span>
            <DatePicker v-model="dateTo" size="sm" input-class="w-60" />
          </div>
          <div class="group-gap2">
            <SelectField v-model="searchField" label="검색어" :options="searchFieldOptions" size="sm" trigger-class="w-40" />
            <InputField2 v-model="keyword" size="sm" placeholder="검색어를 입력하세요." input-class="w-92" />
          </div>
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
    placeholder="등록된 게시글이 없습니다"
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
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useDialog } from '@/composable/dialog/dialog'
import { usePolicyCaseList, authorFilterOptions, searchFieldOptions, type PolicyCaseRow } from './composable/PM-COM-0501'
import { bulletinMenu } from '../composable/notice'
import { usePolicyCaseStore } from '../composable/policyCase'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({
  name: 'PmCom0501',
})

// LNB: 게시판 > 우수사례(items[2]) > 지역경찰 시책
useSideMenuSetup({ ...bulletinMenu, openIndex: 2, activeChild: '지역경찰 시책' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '우수사례' },
  { label: '지역경찰 시책' },
]

const router = useRouter()
const dialog = useDialog()
const { selectCase } = usePolicyCaseStore()

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
} = usePolicyCaseList()

/** Figma: 번호·조회수 '13,540' '1,850' — 천 단위 구분 */
function numberFormatter(cell: any) {
  return Number(cell.getValue()).toLocaleString()
}

/** 첨부파일 있음 아이콘 — 포털 공통 SVG(20×20). 포매터는 HTML 문자열 자리라 <img> 로 넣는다 */
const attachIcon = '/portal/asset/images/icon/ico_attach.svg'

function attachmentFormatter(cell: any) {
  return cell.getValue() ? `<img src="${attachIcon}" alt="첨부파일 있음" width="20" height="20">` : '-'
}

/** 제목 뒤에 댓글 수를 point 색(.lp-em-point)으로 '+22' 처럼 붙인다.
 *  제목은 사용자 입력이라 innerHTML 문자열이 아니라 textContent 로 넣는다 */
function titleFormatter(cell: any) {
  const row = cell.getData() as PolicyCaseRow
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

/** 칸 폭은 Figma th 실측(체크 60 / 번호 100 / 부서 240 / 제목 나머지 / 첨부 80 / 작성자 140 / 등록일 140 / 조회수 100) */
const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 100, hozAlign: 'center', formatter: numberFormatter },
  { title: '부서', field: 'dept', width: 240, hozAlign: 'center' },
  { title: '제목', field: 'title', widthGrow: 4, hozAlign: 'center', formatter: titleFormatter },
  { title: '첨부파일', field: 'hasAttachment', width: 80, hozAlign: 'center', formatter: attachmentFormatter },
  { title: '작성자', field: 'writer', width: 140, hozAlign: 'center' },
  { title: '등록일', field: 'createdAt', width: 140, hozAlign: 'center' },
  { title: '조회수', field: 'viewCount', width: 100, hozAlign: 'center', formatter: numberFormatter },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

/**
 * 삭제 버튼 — 공지사항(PM-COM-0301)과 같은 흐름.
 * 선택이 없으면 알림창, 있으면 되돌릴 수 없는 삭제라 CLAUDE.md §4 의 confirm 예외에 해당한다.
 */
async function onDeleteSelected() {
  if (!selectedCount.value) {
    await dialog.alert({ title: '삭제할 게시글을 선택해 주세요.', btnCancel: '확인' })
    return
  }
  const result = await dialog.confirm({
    title: '삭제된 게시물은 복구할 수 없습니다. 선택된 게시물을 삭제 하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  // 페이징을 화면이 쥐고 있어(pagedRows) 그리드 안에서만 지우면 페이지를 옮길 때 되살아난다 — 원본에서 지운다
  const ids = (gridRef.value?.getSelectedData() ?? []).map((row: PolicyCaseRow) => row.id)
  removeRows(ids)
  selectedCount.value = 0
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

/** 등록 → PM-COM-0504 (사용자 지정 ID, Figma 는 PM-COM-1204) */
function onCreate() {
  router.push({ name: 'PM-COM-0504' })
}

/** 행을 누르면 상세(PM-COM-0502)로 간다 — 사용자 지정 ID, Figma 는 PM-COM-1202 */
function onRowClick(_event: unknown, row: { getData: () => { id?: number } }) {
  selectCase(row.getData().id ?? 1)
  router.push({ name: 'PM-COM-0502' })
}

useBottomTabSetup({
  value: 'PM-COM-0501',
  label: '우수사례',
  path: '/views/com/PM-COM-0501',
  componentName: 'PmCom0501',
  closable: true,
})
</script>
