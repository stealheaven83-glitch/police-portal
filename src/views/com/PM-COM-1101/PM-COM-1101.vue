<template>
  <PageHeader>
    <template #left>
      <PageTitle title="Q&A" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <!-- 카테고리 탭(Figma category tab) — 탭을 고르면 아래 목록이 걸러진다. 내용 영역은 목록 자체라 TabsContent 는 없다 -->
  <Tabs v-model="category">
    <TabsList variant="category" aria-label="카테고리">
      <TabsTrigger v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</TabsTrigger>
    </TabsList>
  </Tabs>

  <SearchWrapper>
    <template #form>
      <div class="search-area">
        <div class="group-gap2">
          <SelectField v-model="authorFilter" label="성명" :options="authorFilterOptions" size="sm" trigger-class="w-40" />
          <InputField2 v-model="authorKeyword" size="sm" placeholder="이름을 검색해주세요." input-class="w-60" />
        </div>
        <div class="group-gap2">
          <DatePicker v-model="dateFrom" label="등록일" size="sm" input-class="w-40"/>
          <span aria-hidden="true">~</span>
          <DatePicker v-model="dateTo" size="sm" input-class="w-40" />
        </div>
        <div class="group-gap2">
          <SelectField v-model="searchField" label="검색어" :options="searchFieldOptions" size="sm" trigger-class="w-30" />
          <InputField2 v-model="keyword" size="sm" placeholder="검색어를 입력하세요." input-class="w-70" />
        </div>
        <div class="group-gap2">
          <SelectField v-model="openState" label="공개상태" :options="openStateOptions" size="sm" trigger-class="w-40" />
        </div>
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <Switch v-model="mineOnly" label="내가 쓴 글" class="board-mine-toggle" />
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
import { Tabs, TabsList, TabsTrigger } from '@/components/custom/tabs'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { Switch } from '@/components/custom/switch'
import { Button } from '@/components/custom/button'
import { badgeVariants } from '@/components/custom/badge'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useDialog } from '@/composable/dialog/dialog'
import {
  useQnaList,
  categoryOptions,
  categoryLabels,
  authorFilterOptions,
  searchFieldOptions,
  openStateOptions,
  type QnaRow,
} from './composable/PM-COM-1101'
import { bulletinMenu } from '../composable/notice'
import { useQnaStore } from '../composable/qna'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({
  name: 'PmCom1101',
})

// LNB: 게시판 > Q&A (presets.ts 에 게시판 메뉴가 아직 없어 도메인 composable 의 구성을 쓴다)
useSideMenuSetup({ ...bulletinMenu, activeChild: 'Q&A' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: 'Q&A' },
]

const router = useRouter()
const dialog = useDialog()
const { selectQna } = useQnaStore()

const {
  category,
  authorFilter,
  authorKeyword,
  dateFrom,
  dateTo,
  searchField,
  keyword,
  openState,
  mineOnly,
  currentPage,
  itemsPerPage,
  totalCount,
  pagedRows,
  removeRows,
} = useQnaList()

/** 고정 공지는 번호 자리에 '공지' 배지(Badge shape="sm" color="primary")가 들어간다.
 *  Tabulator 포매터는 HTML 문자열을 innerHTML 로 넣는 자리라 Vue 컴포넌트 태그를 써도 컴파일되지
 *  않는다 — 대신 Badge 가 쓰는 badgeVariants() 로 같은 클래스 문자열을 받아 <span> 에 입힌다 */
function noFormatter(cell: any) {
  const value = cell.getValue()
  if (value === '공지') {
    return `<span class="${badgeVariants({ shape: 'sm', color: 'primary' })}">공지</span>`
  }
  return String(value)
}

function openFormatter(cell: any) {
  return cell.getValue() ? '공개' : '비공개'
}

function categoryFormatter(cell: any) {
  return categoryLabels[cell.getValue() as keyof typeof categoryLabels] ?? ''
}

/** Figma: 조회수 '1,850' — 천 단위 구분 */
function numberFormatter(cell: any) {
  return Number(cell.getValue()).toLocaleString()
}

/** 첨부파일 있음 아이콘 — 포털 공통 SVG(20×20). 포매터도 HTML 문자열 자리라 <img> 로 넣는다 */
const attachIcon = '/portal/asset/images/icon/ico_attach.svg'

function attachmentFormatter(cell: any) {
  return cell.getValue() ? `<img src="${attachIcon}" alt="첨부파일 있음" width="20" height="20">` : '-'
}

/** 제목 뒤에 댓글 수를 point 색(.lp-em-point)으로 '+22' 처럼 붙인다.
 *  제목은 사용자 입력이라 innerHTML 문자열이 아니라 textContent 로 넣는다 */
function titleFormatter(cell: any) {
  const row = cell.getData() as QnaRow
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
  { title: '공개상태', field: 'open', width: 100, hozAlign: 'center', formatter: openFormatter },
  { title: '카테고리', field: 'category', width: 180, hozAlign: 'center', formatter: categoryFormatter },
  { title: '제목', field: 'title', widthGrow: 4, hozAlign: 'center', formatter: titleFormatter },
  { title: '첨부파일', field: 'hasAttachment', width: 90, hozAlign: 'center', formatter: attachmentFormatter },
  { title: '작성자', field: 'writer', width: 130, hozAlign: 'center' },
  { title: '등록일', field: 'createdAt', width: 140, hozAlign: 'center' },
  { title: '조회수', field: 'viewCount', width: 100, hozAlign: 'center', formatter: numberFormatter },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

/**
 * 삭제 버튼 — 공지사항(PM-COM-1001)과 같은 흐름.
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
  const ids = (gridRef.value?.getSelectedData() ?? []).map((row: QnaRow) => row.id)
  removeRows(ids)
  selectedCount.value = 0
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

function onCreate() {
  router.push({ name: 'PM-COM-1104' })
}

/** 행을 누르면 상세로 간다 — 상세는 사용자 지정으로 PM-COM-0402 폴더에 있다(Figma 는 PM-COM-1102) */
function onRowClick(_event: unknown, row: { getData: () => { id?: number } }) {
  selectQna(row.getData().id ?? 1)
  router.push({ name: 'PM-COM-0402' })
}

useBottomTabSetup({
  value: 'PM-COM-1101',
  label: 'Q&A',
  path: '/views/com/PM-COM-1101',
  componentName: 'PmCom1101',
  closable: true,
})
</script>
