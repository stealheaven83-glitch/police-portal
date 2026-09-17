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
      <div class="search-area">
        <div class="group-gap2 lp-row-end">
          <SelectField v-model="authorFilter" label="성명" :options="authorFilterOptions" size="sm" trigger-class="w-40" />
          <InputField2 v-model="authorKeyword" size="sm" placeholder="이름을 검색해주세요." />
        </div>
        <div class="group-gap2">
          <DatePicker v-model="dateFrom" label="등록일" size="sm" input-class="w-40" />
          <span aria-hidden="true">~</span>
          <DatePicker v-model="dateTo" size="sm" input-class="w-40" />
        </div>
        <div class="group-gap2">
          <SelectField v-model="searchField" label="검색어" :options="searchFieldOptions" size="sm" trigger-class="w-40"/>
          <InputField2 v-model="keyword" size="sm" placeholder="검색어를 입력하세요." trigger-class="w-60"/>
        </div>
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSelected">삭제</Button>
    <Button type="button" variant="primary" size="sm" @click="onCreate">작성</Button>
  </div>

  <TabulatorGrid
    ref="gridRef"
    class="flex-1"
    :columns="columns"
    :data="pagedRows"
    select-mode="checkbox"
    height="100%"
    min-height="40rem"
    placeholder="등록된 공지사항이 없습니다"
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
import { useNoticeList, authorFilterOptions, searchFieldOptions, type NoticeRow } from './composable/PM-COM-0301'
import { useNoticeStore, bulletinMenu } from '../composable/notice'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({
  name: 'PmCom0301',
})

// LNB: 게시판 > 공지사항 (presets.ts 에 게시판 메뉴가 아직 없어 도메인 composable 의 구성을 쓴다)
useSideMenuSetup({ ...bulletinMenu, activeChild: '공지사항' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '공지사항' },
]

const router = useRouter()
const dialog = useDialog()
const { selectNotice } = useNoticeStore()

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
} = useNoticeList()

/** 중요 공지는 번호 자리에 '중요' 배지(Badge shape="sm" color="point")가 들어간다.
 *  Tabulator 포매터는 HTML 문자열을 innerHTML 로 넣는 자리라 Vue 컴포넌트 태그를 써도 컴파일되지
 *  않는다 — 대신 Badge 가 쓰는 badgeVariants() 로 같은 클래스 문자열을 받아 <span> 에 입힌다 */
function noFormatter(cell: any) {
  const value = cell.getValue()
  if (value === '중요') {
    return `<span class="${badgeVariants({ shape: 'sm', color: 'point' })}">중요</span>`
  }
  return String(value)
}

/** 첨부파일 있음 아이콘 — 포털 공통 SVG(20×20). 포매터도 HTML 문자열 자리라 <img> 로 넣는다 */
const attachIcon = '/portal/asset/images/icon/ico_attach.svg'

function attachmentFormatter(cell: any) {
  return cell.getValue() ? `<img src="${attachIcon}" alt="첨부파일 있음" width="20" height="20">` : '-'
}

/** 제목 뒤에 댓글 수를 point 색(.lp-em-point)으로 '+22' 처럼 붙인다.
 *  제목은 사용자 입력이라 innerHTML 문자열이 아니라 textContent 로 넣는다 */
function titleFormatter(cell: any) {
  const row = cell.getData() as NoticeRow
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

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 90, hozAlign: 'center', formatter: noFormatter },
  { title: '부서', field: 'dept', width: 200, hozAlign: 'center' },
  { title: '제목', field: 'title', widthGrow: 4, hozAlign: 'left', formatter: titleFormatter },
  { title: '첨부파일', field: 'hasAttachment', width: 90, hozAlign: 'center', formatter: attachmentFormatter },
  { title: '작성자', field: 'writer', width: 110, hozAlign: 'center' },
  { title: '등록일', field: 'createdAt', width: 120, hozAlign: 'center' },
  { title: '조회수', field: 'viewCount', width: 100, hozAlign: 'center' },
  { title: '추천수', field: 'recommendCount', width: 100, hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

/**
 * 삭제 버튼.
 * 설계서 1) "선택한 항목이 없는 경우 — 삭제 버튼 비활성화"는 사용자 지정으로 알림창으로 대신한다(버튼은 항상 활성).
 * 설계서 2) 선택이 있으면 Confirm — 되돌릴 수 없는 삭제라 CLAUDE.md §4 의 confirm 예외에 해당한다.
 *   취소 → 닫고 변동 없음 / 확인 → 닫고 선택 게시물 삭제 후 화면 새로고침
 */
async function onDeleteSelected() {
  if (!selectedCount.value) {
    await dialog.alert({ title: '삭제할 공지사항을 선택해 주세요.', btnCancel: '확인' })
    return
  }
  const result = await dialog.confirm({
    title: '삭제된 게시물은 복구할 수 없습니다. 선택된 게시물을 삭제 하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  // 페이징을 화면이 쥐고 있어(pagedRows) 그리드 안에서만 지우면 페이지를 옮길 때 되살아난다 — 원본에서 지운다
  const ids = (gridRef.value?.getSelectedData() ?? []).map((row: NoticeRow) => row.id)
  removeRows(ids)
  selectedCount.value = 0
  // 화면 새로고침(목록 재조회)은 API 연동 시 개발팀이 붙인다 — 지금은 목업 행 삭제로 목록이 바로 갱신된다
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

/** 시안의 버튼 문구가 '작성'이다(설계서 6번은 '등록'이라 적혀 있다 — 시안을 따랐다) */
function onCreate() {
  router.push({ name: 'PM-COM-0304' })
}

/** 행을 누르면 상세(PM-COM-0302)로 간다 */
function onRowClick(_event: unknown, row: { getData: () => { id?: number } }) {
  selectNotice(row.getData().id ?? 1)
  router.push({ name: 'PM-COM-0302' })
}

useBottomTabSetup({
  value: 'PM-COM-0301',
  label: '공지사항',
  path: '/views/com/PM-COM-0301',
  componentName: 'PmCom0301',
  closable: true,
})
</script>
