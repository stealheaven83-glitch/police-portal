<template>
  <PageHeader>
    <template #left>
      <PageTitle title="근무일지(乙) 조회" />
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
        <DateRangePicker
          v-model:from="dateFrom"
          v-model:to="dateTo"
          label="근무날짜"
          from-label="근무날짜 시작일"
          to-label="근무날짜 종료일"
          size="sm"
          input-class="w-40"
        />
        <SelectField v-model="kindFilter" label="구분" :options="kindFilterOptions" size="sm" triggerClass="w-37" />
        <InputField2 v-model="keyword" label="활동내역" size="sm" inputClass="w-48" @keyup.enter="onSearch" />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm" @click="onSearch">조회</Button>
    </template>
  </SearchWrapper>

  <p class="lp-note-text lp-em-danger lp-note-gap">
    ※ 신규등록 시 근무구분 선택 창이 추가되었습니다. 구분 선택 시에 직접입력을 선택하면 기존과 동일하게 입력 가능합니다.
  </p>

  <!-- 활동내역이 여러 줄이라 행 높이가 내용만큼 늘어난다(lp-grid-multiline, tabulator-theme.css) -->
  <TabulatorGrid
    class="flex-1 lp-grid-multiline lp-grid-no-hover"
    :columns="columns"
    :data="rows"
    height="100%"
    min-height="30rem"
    placeholder="조회된 근무일지가 없습니다"
    show-pagination
    :items-per-page="10"
  />

  <Report112Dialog v-model:open="detailOpen" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import Report112Dialog from './components/Report112Dialog.vue'
// 표 셀은 HTML 문자열로 그려서 <Icon> 을 못 쓴다 — 같은 에셋을 경로로 가져다 쓴다
import checkIconUrl from '@/assets/images/icons/check.svg?url'
import attachIconUrl from '@/assets/images/icons/attach.svg?url'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useWorkLogView, kindFilterOptions, type WorkLogViewRow } from './composable/PM-LPO-0223'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

defineOptions({
  name: 'PmLpo0223',
})

// LNB: 근무일지 > 근무일지(乙)
useSideMenuSetup({ ...localPoliceMenu, openIndex: 1, activeChild: '근무일지(乙)' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '근무일지' },
  { label: '근무일지(乙)' },
  { label: '근무일지(乙)조회' },
]

const { department, advancedSearchOpen, dateFrom, dateTo, kindFilter, keyword, rows } = useWorkLogView()

const detailOpen = ref(false)

const escapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** 셀을 HTML 문자열로 그리므로 목업 문구(꺾쇠 등)를 그대로 태그로 읽지 않게 막는다 */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => escapeMap[char])
}

/**
 * 활동내역 칸: 앞머리 표시(색·굵기 다름) + 본문 여러 줄 + 오른쪽 아래 작성일시.
 * 세 조각이 한 칸에 들어가 Tabulator 기본 포매터로는 안 돼서 직접 그린다
 * (스타일은 police-common.css 의 .lp-log-* 가 갖고 있다).
 */
function activityFormatter(cell: any): string {
  const row = cell.getRow().getData() as WorkLogViewRow
  const tag = row.tag
    ? `<span class="lp-log-tag lp-log-tag-${row.tag.tone}">${escapeHtml(row.tag.text)}</span>`
    : ''
  return [
    '<div class="lp-log-cell">',
    `<p class="lp-log-activity">${tag}${escapeHtml(row.activity)}</p>`,
    `<p class="lp-log-written-at">작성일시 : ${escapeHtml(row.writtenAt)}</p>`,
    '</div>',
  ].join('')
}

/** 값이 참인 행에만 아이콘 하나를 그리는 표시 전용 칸(인수인계·파일) */
function iconFormatter(src: string, size: number, alt: string) {
  return (cell: any): string =>
    cell.getValue() ? `<img src="${src}" alt="${alt}" width="${size}" height="${size}">` : ''
}

const columns: TabulatorGridColumn[] = [
  { title: '근무시간', field: 'time', hozAlign: 'center', width: 120 },
  { title: '구분', field: 'kind', hozAlign: 'center', width: 220 },
  // 폭을 주지 않아 남는 폭을 전부 가져간다. 이 칸의 높이가 곧 행 높이가 된다(variableHeight)
  {
    title: '활동내역',
    field: 'activity',
    hozAlign: 'left',
    minWidth: 320,
    variableHeight: true,
    formatter: activityFormatter,
  },
  { title: '작성자', field: 'writer', hozAlign: 'center', width: 148 },
  // 시안에서 처리자만 왼쪽 정렬이고, 이름이 길면 두 줄로 접힌다
  { title: '처리자', field: 'handlers', hozAlign: 'left', width: 200 },
  // 조회 화면이라 세 칸 모두 표시 전용이다
  {
    title: '인수인계',
    field: 'handover',
    hozAlign: 'center',
    width: 80,
    formatter: iconFormatter(checkIconUrl, 16, '인수인계 대상'),
  },
  {
    title: '파일',
    field: 'hasFile',
    hozAlign: 'center',
    width: 88,
    formatter: iconFormatter(attachIconUrl, 20, '첨부파일 있음'),
  },
  {
    title: '상세',
    field: 'hasDetail',
    hozAlign: 'center',
    width: 88,
    cellType: 'button',
    buttonVariant: 'tertiary',
    // 좁은 칸이라 Button 기본 min-width(100px)를 푼다(police-override.css)
    buttonClass: 'lp-grid-btn-compact',
    // buttonVisible 이 false 인 행은 라벨을 글자로만 그리므로, 빈 라벨을 줘서 빈 칸으로 둔다
    buttonLabel: (row: WorkLogViewRow) => (row.hasDetail ? '보기' : ''),
    buttonVisible: (row: WorkLogViewRow) => row.hasDetail,
    onButtonClick: (row: WorkLogViewRow) => {
      if (row.hasDetail) detailOpen.value = true
    },
  },
]

async function onSearch() {
  await dialog.alert({ title: '조회되었습니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PM-LPO-0223',
  label: '근무일지(乙)조회',
  path: '/views/lpo/PM-LPO-0223',
  componentName: 'PmLpo0223',
  closable: true,
})
</script>
