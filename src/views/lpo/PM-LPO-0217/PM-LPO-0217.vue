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

  <!-- 시안(11969:40061) 부서영역 — 조회조건 상자는 없고 부서줄만 있다.
       SearchWrapper 는 #form 없이 #department 만 주면 이 줄만 그리고 아래 20px 을 띄운다 -->
  <SearchWrapper>
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </template>
  </SearchWrapper>

  <!-- 시안(11969:40065): 조회조건 한 줄, 오른쪽 끝에 인쇄 버튼 -->
  <div class="lp-row-between">
    <span class="lp-filter-row">
      <span class="group-gap3">
        <span class="lp-label-text">근무일</span>
        <!-- 시안(11969:40069): 버튼 영역 20×20(삼각형 13.35×8.11), 버튼↔날짜 10 -->
        <span class="lp-daynav">
          <button type="button" class="lp-icon-btn lp-icon-btn-20" aria-label="이전 근무일" @click="shiftWorkDate(-1)">
            <Icon name="arrowDropDown" :size="20" class="lp-icon-prev" />
          </button>
          <span class="group-gap2">
            <span class="lp-heading-lg">{{ workDate }}</span>
            <Icon name="calendar" :size="24" />
          </span>
          <button type="button" class="lp-icon-btn lp-icon-btn-20" aria-label="다음 근무일" @click="shiftWorkDate(1)">
            <Icon name="arrowDropDown" :size="20" class="lp-icon-next" />
          </button>
        </span>
      </span>
      <span class="lp-divider-v" aria-hidden="true"></span>
      <span class="group-gap3">
        <span class="lp-label-text">교대</span>
        <RadioGroup v-model="shift" class="lp-radio-inline">
          <RadioGroupItem value="day" label="주" />
          <RadioGroupItem value="night" label="야" />
          <RadioGroupItem value="none" label="미편성" />
        </RadioGroup>
      </span>
      <span class="lp-divider-v" aria-hidden="true"></span>
      <span class="group-gap3">
        <span class="lp-label-text">보기방식</span>
        <RadioGroup v-model="viewMode" class="lp-radio-inline">
          <RadioGroupItem value="basic" label="기본" />
          <RadioGroupItem value="all" label="전체" />
        </RadioGroup>
      </span>
    </span>
    <Button type="button" variant="tertiary2" size="sm" @click="onPrint">인쇄</Button>
  </div>

  <div class="lp-row-between lp-row-gap">
    <p class="form-note end lp-em-point">＊ 신규등록 시 근무구분 선택 창이 추가되었습니다. 구분 선택 시에 직접입력을 선택하면 기존과 동일하게 입력 가능합니다.</p>
    <span class="group-gap3">
      <!-- 기획서 6~10: 112누락정보 · 새로고침 · 신규 · 저장 · 삭제 -->
      <Button type="button" variant="tertiary2" size="sm" @click="missingOpen = true">112누락정보</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="onRefresh">새로고침</Button>
      <Button type="button" variant="secondary" size="sm" @click="addRow">추가</Button>
      <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="onDelete">삭제</Button>
    </span>
  </div>

  <TabulatorGrid
    class="flex-1 lp-row-gap"
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
import { useDialog } from '@/composable/dialog/dialog'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
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
import { useWorkLogWrite, WorkLogKey, workKindOptions, workTimeOptions, type WorkLogRow } from './composable/PM-LPO-0217'

const dialog = useDialog()

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
  handlerOpen,
  fileOpen,
  openHandler,
  openFile,
  dispatchOpen,
  addRow,
  removeRows,
  shiftWorkDate,
} = store

/**
 * 활동내역 앞머리 표식과 색 (시안 12711:73770~ — 모두 600).
 *   C1(00000)-… 접수코드 #B02A30 / [모바일] #0054A6 / [테블릿] #00880B
 */
const ACTIVITY_MARKS: Array<[RegExp, string]> = [
  [/^C\d+\([^)]*\)/, 'lp-em-point'],
  [/^\[모바일\]/, 'lp-em-primary'],
  [/^\[테블릿\]/, 'lp-em-success'],
]

/** 활동내역 입력칸 기본 높이 (시안 47px) — 내용이 늘면 이보다 커진다 */
const ACTIVITY_INPUT_MIN_H = 47

/**
 * 활동내역 셀 — 신규 입력 행은 입력상자, 나머지는 본문(줄바꿈 유지) + 작성일시 한 줄.
 * cellType 에 textarea 가 없어 이 셀만 포매터로 그린다.
 */
function activityFormatter(cell: {
  getRow: () => { getData: () => WorkLogRow; normalizeHeight?: () => void }
}) {
  const row = cell.getRow().getData()

  if (row.isNew) {
    const input = document.createElement('textarea')
    input.className = 'lp-cell-textarea'
    input.value = row.activity ?? ''
    input.rows = 1

    /* 시안 코멘트: 줄이 늘면 입력칸도 같이 늘어난다. 늘어난 만큼 행 높이도 다시 잡는다 */
    const grow = () => {
      input.style.height = 'auto'
      input.style.height = `${Math.max(ACTIVITY_INPUT_MIN_H, input.scrollHeight)}px`
      cell.getRow().normalizeHeight?.()
    }
    input.addEventListener('input', grow)
    requestAnimationFrame(grow)

    input.addEventListener('change', () => {
      row.activity = input.value
    })
    // 그리드가 행 클릭을 체크박스 선택으로 받아 입력이 막히므로 여기서 끊는다
    // (컴포넌트가 mountCell 로 그리는 셀들도 같은 처리를 한다)
    input.addEventListener('mousedown', (e) => e.stopPropagation())
    input.addEventListener('click', (e) => e.stopPropagation())
    return input
  }

  const wrap = document.createElement('div')

  const body = document.createElement('p')
  body.className = 'lp-pre-line'
  const text = row.activity ?? ''
  const hit = ACTIVITY_MARKS.find(([re]) => re.test(text))
  if (hit) {
    const mark = text.match(hit[0])![0]
    const em = document.createElement('span')
    em.className = `${hit[1]} lp-em-strong`
    em.textContent = mark
    body.append(em, document.createTextNode(text.slice(mark.length)))
  } else {
    body.textContent = text
  }
  wrap.appendChild(body)

  if (row.writtenAt) {
    const note = document.createElement('p')
    note.className = 'lp-cell-note'
    note.textContent = `작성일시 : ${row.writtenAt}`
    wrap.appendChild(note)
  }
  return wrap
}

/** 시안·기획서 8-1: 입력칸은 신규 행에만 두고, 저장된 행은 값만 보여준다 */
const onlyNewRow = (row: WorkLogRow) => !!row.isNew

// 컬럼 폭은 시안(12622:71085) 실측 — 체크박스 44 를 뺀 합이 1520 이다
const columns: TabulatorGridColumn[] = [
  {
    title: '근무시간',
    field: 'time',
    width: 120,
    widthShrink: 1,
    minWidth: 90,
    hozAlign: 'center',
    cellType: 'select',
    selectOptions: workTimeOptions,
    selectPlaceholder: '선택',
    cellVisible: onlyNewRow,
  },
  {
    title: '구분',
    field: 'kind',
    width: 220,
    widthShrink: 1,
    minWidth: 90,
    cellType: 'select',
    selectOptions: workKindOptions,
    selectPlaceholder: '선택',
    cellVisible: onlyNewRow,
  },
    // 활동내역만 폭을 비워 둔다 — fitColumns 는 width 를 준 컬럼을 전부 '고정'으로 보고,
  // 유연한 컬럼이 하나도 없으면 표가 좁아져도 줄이지 못해 가로 스크롤이 생긴다.
  // 폭을 비우면 남는 폭을 이 컬럼이 받는다(시안 1564 에서 576).
  { title: '활동내역', field: 'activity', formatter: activityFormatter, variableHeight: true, widthGrow: 1, minWidth: 160, cssClass: 'lp-grid-multiline-cell', hozAlign: 'left' },
  { title: '작성자', field: 'writer', hozAlign: 'center', width: 148, widthShrink: 1, minWidth: 80 },
  {
    title: '처리자',
    field: 'handlers',
    hozAlign: 'center',
    width: 200,
    widthShrink: 1,
    minWidth: 90,
    cellType: 'button',
    buttonVariant: 'tertiary',
    buttonClass: 'h-9 px-3 min-w-0',
    // 처리자가 비어 있으면 '처리자 관리' 버튼(가운데), 지정돼 있으면 이름만 텍스트로(왼쪽)
    cssClass: 'lp-grid-handler-cell',
    buttonLabel: (row: WorkLogRow) => row.handlers || '처리자 관리',
    buttonVisible: (row: WorkLogRow) => !row.handlers,
    onButtonClick: (row: WorkLogRow) => openHandler(row),
  },
  { title: '인수인계', field: 'handover', cellType: 'checkbox', hozAlign: 'center', width: 80 },
  {
    title: '파일',
    field: 'hasFile',
    hozAlign: 'center',
    width: 88,
    cellType: 'button',
    buttonVariant: 'tertiary',
    buttonClass: 'h-9 px-3 min-w-0',
    // 파일이 붙어 있으면 클립 아이콘만(라벨 없는 span + lp-grid-clip-cell 가상요소), 없으면 '첨부' 버튼
    cssClass: 'lp-grid-clip-cell',
    buttonLabel: (row: WorkLogRow) => (row.hasFile ? '' : '첨부'),
    buttonVisible: (row: WorkLogRow) => !row.hasFile,
    onButtonClick: (row: WorkLogRow) => openFile(row),
  },
  {
    title: '상세',
    field: 'hasDetail',
    hozAlign: 'center',
    width: 88,
    cellType: 'button',
    buttonVariant: 'tertiary',
    buttonClass: 'h-9 px-3 min-w-0',
    // 112신고 행만 '보기' 버튼이 있고, 나머지 행은 아무것도 안 그린다(텍스트로 남으면 안 된다)
    buttonLabel: (row: WorkLogRow) => (row.hasDetail ? '보기' : ''),
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

/** 설계서 A03 — 한 버튼에 모달은 하나만 붙인다(빈값 체크·완료 알림은 인계 대상) */
async function onDelete() {
  if (!selectedIds.value.size) return
  const { confirmed } = await dialog.confirm({ title: '삭제 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!confirmed) return
  removeRows(selectedIds.value)
  selectedIds.value = new Set()
}

function onPrint() {
  window.print()
}

/** 기획서 7: 새로고침 — 실제 재조회는 인계 대상이라 화면만 다시 불러온다 */
function onRefresh() {
  window.location.reload()
}

/** 설계서 A01 */
async function onSave() {
  const { confirmed } = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!confirmed) return
}

/**
 * 화면ID ↔ 팝업 상태 동기화(docs/create/tab-popup.md §4).
 *   0217 근무일지(乙) 등록 · 0219 112누락정보 · 0221 처리자 관리 · 0222 파일 업로드
 *
 * 0221·0222 는 원래 행을 골라야 열리는 팝업이라 URL 만으로는 어느 행인지 알 수 없다
 * (useAutoTrigger 의 알려진 한계) — 그 주소로 직접 들어오면 대상 행 없이 팝업만 뜬다.
 *
 * 뺀 화면ID — 0220 112신고 내역 상세. 라우트가 따로 없어 0217 화면만 뜬다.
 */
const screenTriggers: ScreenTriggerMap = {
  'PM-LPO-0217': [],
  'PM-LPO-0219': [[missingOpen, true]],
  'PM-LPO-0221': [[handlerOpen, true]],
  'PM-LPO-0222': [[fileOpen, true]],
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
