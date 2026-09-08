<template>
  <PageHeader>
    <template #left>
      <PageTitle title="근무일지(乙) 등록" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div class="lp-row-between">
    <span class="group-gap2">
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </span>
  </div>

  <div class="lp-row-between lp-table-gap">
    <span class="search-area">
      <span class="group-gap2">
        <span class="lp-label-text">근무일</span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="이전 근무일" @click="shiftWorkDate(-1)">
          <Icon name="arrowLeft" :size="18" />
        </Button>
        <span class="lp-heading-md">{{ workDate }}</span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="다음 근무일" @click="shiftWorkDate(1)">
          <Icon name="arrowNext" :size="18" />
        </Button>
      </span>
      <span class="group-gap2">
        <span class="lp-label-text">· 교대 :</span>
        <RadioGroup v-model="shift" class="lp-icon-row">
          <RadioGroupItem value="day" label="주" />
          <RadioGroupItem value="night" label="야" />
          <RadioGroupItem value="none" label="미편성" />
        </RadioGroup>
      </span>
      <span class="group-gap2">
        <span class="lp-label-text">보기(방식) :</span>
        <RadioGroup v-model="viewMode" class="lp-icon-row">
          <RadioGroupItem value="basic" label="기본" />
          <RadioGroupItem value="all" label="전체" />
        </RadioGroup>
      </span>
    </span>
  </div>

  <div class="lp-row-between lp-table-gap">
    <p class="lp-note-text lp-em-danger">
      ※ 신규등록 시 근무구분 선택 창이 추가되었습니다. 구분 선택 시에 직접입력을 선택하면 기존과 동일하게 입력 가능합니다.
    </p>
    <span class="group-gap2">
      <Button type="button" variant="tertiary2" size="sm" @click="onPrint">인쇄</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="missingOpen = true">112누락정보</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="onDelete">삭제</Button>
      <Button type="button" variant="secondary" size="sm" @click="addRow">추가</Button>
      <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
    </span>
  </div>

  <TabulatorGrid
    class="flex-1"
    :columns="columns"
    :data="rows"
    height="100%"
    select-mode="checkbox"
    placeholder="등록된 근무일지가 없습니다"
    show-pagination
    :items-per-page="10"
    @row-selection-changed="onSelectionChanged"
  />

  <MissingReportDialog />
  <HandlerManageDialog />
  <FileUploadDialog />
  <DispatchInfoDialog />
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Button } from '@/components/custom/button'
import Icon from '@/components/custom/icon/Icon.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import MissingReportDialog from './components/MissingReportDialog.vue'
import HandlerManageDialog from './components/HandlerManageDialog.vue'
import FileUploadDialog from './components/FileUploadDialog.vue'
import DispatchInfoDialog from './components/DispatchInfoDialog.vue'
import { useWorkLogWrite, WorkLogKey, workKindOptions, type WorkLogRow } from './composable/PM-LPO-0217'

defineOptions({
  name: 'PmLpo0217',
})

// LNB: 근무일지 > 근무일지(乙)
useSideMenuSetup({ ...localPoliceMenu, openIndex: 1, activeChild: '근무일지(乙)' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '근무일지' },
  { label: '근무일지(乙)' },
  { label: '근무일지(乙)등록' },
]

const store = useWorkLogWrite()
provide(WorkLogKey, store)

const {
  department,
  workDate,
  shift,
  viewMode,
  rows,
  missingOpen,
  openHandler,
  openFile,
  dispatchOpen,
  addRow,
  removeRows,
  shiftWorkDate,
} = store

const columns: TabulatorGridColumn[] = [
  { title: '근무시간', field: 'time', cellType: 'input', width: 110 },
  { title: '구분', field: 'kind', cellType: 'select', selectOptions: workKindOptions, selectPlaceholder: '선택', width: 170 },
  // 활동내역은 여러 줄이라 Tabulator 의 textarea 포매터로 줄바꿈을 살린다
  { title: '활동내역', field: 'activity', formatter: 'textarea', variableHeight: true },
  { title: '작성자', field: 'writer', hozAlign: 'center', width: 110 },
  {
    title: '처리자',
    field: 'handlers',
    hozAlign: 'center',
    width: 150,
    cellType: 'button',
    buttonVariant: 'tertiary',
    // 처리자가 비어 있으면 '처리자 관리' 버튼, 지정돼 있으면 이름만 텍스트로(§6-1)
    buttonLabel: (row: WorkLogRow) => row.handlers || '처리자 관리',
    buttonVisible: (row: WorkLogRow) => !row.handlers,
    onButtonClick: (row: WorkLogRow) => openHandler(row),
  },
  { title: '인수인계', field: 'handover', cellType: 'checkbox', hozAlign: 'center', width: 90 },
  {
    title: '파일',
    field: 'hasFile',
    hozAlign: 'center',
    width: 90,
    cellType: 'button',
    buttonVariant: 'tertiary',
    buttonLabel: (row: WorkLogRow) => (row.hasFile ? '파일' : '첨부'),
    onButtonClick: (row: WorkLogRow) => openFile(row),
  },
  {
    title: '상세',
    field: 'hasDetail',
    hozAlign: 'center',
    width: 90,
    cellType: 'button',
    buttonVariant: 'tertiary',
    buttonLabel: '보기',
    buttonVisible: (row: WorkLogRow) => row.hasDetail,
    onButtonClick: (row: WorkLogRow) => {
      if (row.hasDetail) dispatchOpen.value = true
    },
  },
]

const selectedIds = ref<Set<number>>(new Set())

// @row-selection-changed 는 RowComponent 배열을 넘긴다(CLAUDE.md §6)
function onSelectionChanged(selectedRows: unknown[]) {
  selectedIds.value = new Set(
    selectedRows.map((r) => {
      const data = (typeof (r as { getData?: () => WorkLogRow }).getData === 'function'
        ? (r as { getData: () => WorkLogRow }).getData()
        : r) as WorkLogRow
      return data.id
    }),
  )
}

function onDelete() {
  if (!selectedIds.value.size) {
    toast.warning('삭제할 근무일지를 선택해 주세요.')
    return
  }
  removeRows(selectedIds.value)
  selectedIds.value = new Set()
  toast.success('삭제되었습니다.')
}

function onPrint() {
  window.print()
}

function onSave() {
  toast.success('저장되었습니다.')
}

/**
 * 화면ID ↔ 팝업 상태 동기화(docs/create/tab-popup.md §4).
 *   0217 근무일지(乙) 등록 · 0219 112누락정보
 *
 * 뺀 화면ID — 특정 행을 골라야만 열리는 팝업이라 URL 만으로는 어느 행인지 알 수 없다:
 *   0220 112신고 내역 상세 · 0221 처리자 관리 · 0222 파일 업로드
 * 라우트는 등록돼 있으므로 그 주소로 들어오면 팝업 없이 0217 화면이 뜬다.
 */
const screenTriggers: ScreenTriggerMap = {
  'PM-LPO-0217': [],
  'PM-LPO-0219': [[missingOpen, true]],
}
useAutoTrigger(screenTriggers)

useBottomTabSetup({
  value: 'PM-LPO-0217',
  label: '근무일지(乙)등록',
  path: '/views/lpo/PM-LPO-0217',
  componentName: 'PmLpo0217',
  closable: true,
})
</script>
