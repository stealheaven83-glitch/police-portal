<template>
  <PageHeader>
    <template #left>
      <PageTitle title="CPO 입력 · 관리" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="searchForm.department" size="sm" />
    </template>
    <template #form>
      <div class="search-area" :class="styles.searchArea">
        <InputField2 v-model="searchForm.detailAddress" label="상세주소" size="sm" inputClass="w-40" clearable />
        <SelectField
          v-model="searchForm.sortBy"
          label="정렬기준"
          :options="sortOptions"
          label-position="left"
          size="sm"
          triggerClass="w-30"
        />
        <InputField2 v-model="searchForm.managementNo" label="관리번호" size="sm" inputClass="w-32" clearable />
        <InputField2 v-model="searchForm.bizName" label="상호명" size="sm" inputClass="w-32" clearable />
        <SelectField
          v-model="searchForm.type"
          label="유형"
          :options="typeOptions"
          label-position="left"
          size="sm"
          triggerClass="w-50"
        />
        <SelectField
          v-model="searchForm.facilityImproved"
          label="시설개선 확인유무"
          :options="yesNoAllOptions"
          label-position="left"
          size="sm"
          triggerClass="w-30"
        />
        <SelectField
          v-model="searchForm.hasNotice"
          label="착안사항 유무"
          :options="yesNoAllOptions"
          label-position="left"
          size="sm"
          triggerClass="w-30"
        />
        <SelectField
          v-model="searchForm.cashIntensive"
          label="현금다액업소"
          :options="cashOptions"
          label-position="left"
          size="sm"
          triggerClass="w-30"
        />
        <div class="flex items-center">
          <DatePicker label="진단일자" labelPosition="left" size="sm" inputClass="w-[160px]" clearable></DatePicker>
          <span class="px-3">~</span>
          <DatePicker size="sm" inputClass="w-[160px]" clearable></DatePicker>
        </div>
        <SelectField
          v-model="searchForm.reason"
          label="진단사유"
          :options="reasonOptions"
          label-position="left"
          size="sm"
          triggerClass="w-50"
        />
        <InputField2 v-model="searchForm.diagnoser" label="진단자" size="sm" inputClass="w-30" clearable />
      </div>
    </template>
    <template #btns>
      <Button variant="secondary" size="sm" @click="search">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel(true)">
      <Download :size="16" aria-hidden="true" />
      엑셀다운로드 (헤더+값)
    </Button>
    <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel(false)">
      <Download :size="16" aria-hidden="true" />
      엑셀다운로드 (값)
    </Button>
    <Button type="button" variant="tertiary2" size="sm" @click="printKeep">범죄예방진단결과(보관용)</Button>
    <Button type="button" variant="tertiary2" size="sm" @click="printCpoConfirm">범죄예방진단결과(CPO확인용)</Button>
    <Button type="button" variant="tertiary2" size="sm" @click="sendNotice">진단통보(우편 발송)</Button>
  </div>

  <!--
    좌측에서 고른 한 건이 우측 이력의 조회 조건이라, 두 그리드를 나란히 두고 폭만 조절하게 한다.
    좁은 화면에서는 LayoutSplite 가 알아서 위아래로 쌓는다.
  -->
  <LayoutSplite :count="2" :widths="[55, 45]">
    <template #layout-1>
      <LayoutPanel title="범죄예방진단 현황">
        <template #actions>
          <Button type="button" variant="primary" size="sm" @click="openNewDiagnosis">신규</Button>
        </template>
        <TabulatorGrid
          ref="listGridRef"
          class="flex-1"
          :columns="listColumns"
          :data="rows"
          select-mode="single"
          height="100%"
          min-height="40rem"
          placeholder="조회된 진단 내역이 없습니다"
          show-pagination
          :items-per-page="10"
          @row-selection-changed="onRowSelectionChanged"
          @row-click="onDiagnosisRowClick"
          @row-dbl-click="onDiagnosisRowDoubleClick"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="범죄예방진단 이력">
        <template #actions>
          <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSelectedHistory">선택삭제</Button>
          <Button type="button" variant="primary" size="sm" @click="openNewHistory">신규</Button>
        </template>
        <TabulatorGrid
          ref="historyGridRef"
          class="flex-1"
          :columns="historyColumns"
          v-model:data="historyRows"
          select-mode="checkbox"
          height="100%"
          min-height="40rem"
          placeholder="좌측 목록에서 진단 건을 선택해 주세요"
        />
      </LayoutPanel>
    </template>
  </LayoutSplite>

  <NewDiagnosisDialog
    v-model:open="newDiagnosisDialogOpen"
    title="범죄예방진단 현황 신규"
    :form="newDiagnosisForm"
    :assessment="assessmentValues"
    :total-score="totalScore"
    @save="saveNewDiagnosis"
    @cancel="cancelNewDiagnosis"
    @open-simple-notice="openSimpleNoticeData"
    @open-photo="openPhotoData"
    @open-history="openDiagnosisHistory"
  />

  <NewDiagnosisDialog
    v-model:open="newHistoryDialogOpen"
    title="범죄예방진단 이력 신규"
    :form="newDiagnosisForm"
    :assessment="assessmentValues"
    :total-score="totalScore"
    @save="saveNewHistory"
    @cancel="newHistoryDialogOpen = false"
    @open-simple-notice="openSimpleNoticeData"
    @open-photo="openPhotoData"
    @open-history="openDiagnosisHistory"
  />

  <DiagnosisDetailDialog
    v-model:open="detailDialogOpen"
    :form="newDiagnosisForm"
    :assessment="assessmentValues"
    :total-score="totalScore"
    :diagnosis="selectedRow"
    @save="saveDetail"
    @cancel="detailDialogOpen = false"
    @print="printDetail"
    @open-photo="openPhotoDataFromDetail"
  />

  <PhotoDataDialog v-model:open="photoDialogOpen" v-model:note="newDiagnosisForm.note" />
  <SimpleNoticeDataDialog v-model:open="simpleNoticeDialogOpen" :diagnosis="selectedRow" />
  <DiagnosisHistoryDialog v-model:open="diagnosisHistoryDialogOpen" :diagnosis="selectedRow" :rows="historyRows" />
  <KeepResultDialog v-model:open="keepResultDialogOpen" :diagnosis="selectedRow" />
  <CpoResultDialog
    v-model:open="cpoResultDialogOpen"
    :diagnosis="selectedRow"
    :rows="rows"
    :form="newDiagnosisForm"
    :assessment="assessmentValues"
    :total-score="totalScore"
    @open-simple-notice="openSimpleNoticeData"
    @open-history="openDiagnosisHistory"
  />
  <MailNoticeDialog
    v-model:open="mailNoticeDialogOpen"
    :diagnosis="selectedRow"
    :note="newDiagnosisForm.note"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'

import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { Button } from '@/components/custom/button'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import NewDiagnosisDialog from './components/NewDiagnosisDialog.vue'
import DiagnosisDetailDialog from './components/DiagnosisDetailDialog.vue'
import PhotoDataDialog from './components/PhotoDataDialog.vue'
import SimpleNoticeDataDialog from './components/SimpleNoticeDataDialog.vue'
import DiagnosisHistoryDialog from './components/DiagnosisHistoryDialog.vue'
import KeepResultDialog from './components/KeepResultDialog.vue'
import CpoResultDialog from './components/CpoResultDialog.vue'
import MailNoticeDialog from './components/MailNoticeDialog.vue'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'

import {
  useCpoList,
  sortOptions,
  typeOptions,
  yesNoAllOptions,
  cashOptions,
  reasonOptions,
  type CpoDiagnosisRow,
  type CpoHistoryRow,
} from './composable/PM-PUB-0103'
import styles from './style/PM-PUB-0103.module.css'

// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!)
defineOptions({
  name: 'PmPub0103',
})

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '범죄예방진단' },
  { label: 'CPO 입력 · 관리' },
]

const {
  advancedSearchOpen,
  searchForm,
  rows,
  selectedRow,
  historyRows,
  selectRow,
  search,
  newDiagnosisDialogOpen,
  newHistoryDialogOpen,
  detailDialogOpen,
  photoDialogOpen,
  simpleNoticeDialogOpen,
  diagnosisHistoryDialogOpen,
  keepResultDialogOpen,
  cpoResultDialogOpen,
  mailNoticeDialogOpen,
  newDiagnosisForm,
  assessmentValues,
  totalScore,
  openNewDiagnosis,
  cancelNewDiagnosis,
  saveNewDiagnosis,
  openNewHistory,
  saveNewHistory,
  openDetail,
  saveDetail,
  openPhotoData,
  openPhotoDataFromDetail,
  openSimpleNoticeData,
  openDiagnosisHistory,
  printKeep,
  printCpoConfirm,
  sendNotice,
} = useCpoList()

const listGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const historyGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

/**
 * 좌측 현황 그리드 컬럼.
 * 번호/총점처럼 짧은 값은 layout="fitColumns" 가 남는 폭을 나눠 갖게 그대로 둔다.
 * 주소는 다른 값보다 길어, widthGrow(비례 배분) 대신 widthShrink:0 을 줘서 폭이 부족해도
 * 이 컬럼만은 줄어들지 않고 항상 전체 텍스트가 보이게 한다(대신 공간이 부족하면 그리드에
 * 가로 스크롤이 생긴다).
 */
const listColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  { title: '부서', field: 'dept', hozAlign: 'center' },
  { title: '유형', field: 'type', hozAlign: 'center' },
  { title: '상호명', field: 'bizName', hozAlign: 'center' },
  { title: '총점', field: 'score', width: 70, hozAlign: 'center' },
  { title: '진단자', field: 'diagnoser', hozAlign: 'center' },
  { title: '기본주소', field: 'baseAddress', widthGrow: 2, hozAlign: 'left' },
  { title: '상세주소', field: 'detailAddress', widthGrow: 2, hozAlign: 'left' },
  { title: '현금다액업소', field: 'cashIntensive', width: 110, hozAlign: 'center' },
]

const historyColumns: TabulatorGridColumn[] = [
  { title: '진단일자', field: 'diagnosedAt', hozAlign: 'center' },
  {
    title: '상호명',
    field: 'bizName',
    hozAlign: 'center',
    cellType: 'button',
    buttonVariant: 'link',
    buttonSize: 'xxs',
    buttonLabel: (row) => String((row as CpoHistoryRow).bizName),
    onButtonClick: () => openDetail(selectedRow.value),
  },
  { title: '주소', field: 'address', widthGrow: 2, hozAlign: 'left' },
  { title: '우편희망', field: 'mailRequested', hozAlign: 'center' },
  { title: '우편상태', field: 'mailStatus', hozAlign: 'center' },
  { title: '진단자', field: 'diagnoser', hozAlign: 'center' },
]

/**
 * select-mode="single" 이라 선택 행은 0건 아니면 1건이다.
 *
 * TabulatorGrid(공용 컴포넌트)는 이 이벤트에 실제 행 데이터가 아니라 Tabulator 의
 * RowComponent 인스턴스를 그대로 내보낸다(TabulatorGrid.vue 의 rowSelectionChanged
 * 핸들러가 (data, rows) 중 rows 를 emit). 공용 컴포넌트를 고치는 대신, 여기서
 * RowComponent.getData() 로 실제 데이터만 꺼내 쓴다 — 나중에 공용 컴포넌트가 데이터를
 * 직접 내보내도록 바뀌어도(getData 가 없는 일반 객체가 와도) 그대로 동작한다.
 */
function onRowSelectionChanged(selected: any[]) {
  const first = selected[0]
  const row: CpoDiagnosisRow | undefined =
    first && typeof first.getData === 'function' ? first.getData() : first
  selectRow(row ?? null)
}

function getRowData(row: any): CpoDiagnosisRow | undefined {
  return row && typeof row.getData === 'function' ? row.getData() : row
}

function onDiagnosisRowClick(_event: Event, row: any) {
  const data = getRowData(row)
  if (data) selectRow(data)
}

function onDiagnosisRowDoubleClick(_event: Event, row: any) {
  openDetail(getRowData(row))
}

function printDetail() {
  window.print()
}

function onDeleteSelectedHistory() {
  historyGridRef.value?.deleteSelected()
}

function onDownloadExcel(withHeader: boolean) {
  const today = new Date().toISOString().slice(0, 10)
  const suffix = withHeader ? '헤더값' : '값'
  listGridRef.value?.download('csv', `CPO입력관리_${suffix}_${today}.csv`)
}

/**
 * 기획서 화면ID ↔ 목록 위에 열리는 각 팝업 상태를 양방향으로 동기화한다.
 * URL로 직접 진입해도 해당 팝업이 열리고, 화면 버튼으로 단독 팝업을 열면 같은 화면ID로 바뀐다.
 * 긴 폼에서 사진/이력 같은 하위 팝업을 겹쳐 여는 동안에는 부모 화면ID를 유지한다.
 */
const dialogStates = {
  keep: keepResultDialogOpen,
  cpo: cpoResultDialogOpen,
  historyNew: newHistoryDialogOpen,
  detail: detailDialogOpen,
  photo: photoDialogOpen,
  noticeData: simpleNoticeDialogOpen,
  history: diagnosisHistoryDialogOpen,
  newDiagnosis: newDiagnosisDialogOpen,
  mail: mailNoticeDialogOpen,
}

function screenState(active?: keyof typeof dialogStates) {
  return Object.entries(dialogStates).map(([name, state]) => [state, name === active] as const)
}

const screenTriggers: ScreenTriggerMap = {
  'PM-PUB-0103': screenState(),
  'PM-PUB-0104': screenState('keep'),
  'PM-PUB-0105': screenState('cpo'),
  'PM-PUB-0106': screenState('historyNew'),
  'PM-PUB-0107': screenState('detail'),
  'PM-PUB-0108': screenState('photo'),
  'PM-PUB-0109': screenState('noticeData'),
  'PM-PUB-0110': screenState('history'),
  'PM-PUB-0114': screenState('newDiagnosis'),
  'PM-PUB-0115': screenState('mail'),
}
useAutoTrigger(screenTriggers)

// 사이드메뉴(생활안전 LNB) 설정. 이 화면이 열려 있는 동안은 'CPO 입력 · 관리' 를 활성 표시한다.
useSideMenuSetup({ ...publicSafetyMenu, activeChild: 'CPO 입력 · 관리' })

// 탭 추가 및 활성화
useBottomTabSetup({
  value: 'PM-PUB-0103',
  label: 'CPO 입력 · 관리',
  path: '/views/pub/PM-PUB-0103',
  componentName: 'PmPub0103',
  closable: true,
})
</script>
