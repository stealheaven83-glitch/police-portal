<template>
  <PageHeader>
    <template #left>
      <PageTitle title="CPO 입력 · 관리" />
    </template>
    <template #right>
      <div class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </div>
    </template>
  </PageHeader>

  <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="searchForm.department" size="sm" />
    </template>
    <template #form>
      <div class="search-area">
        <InputField2 v-model="searchForm.detailAddress" label="상세주소" size="sm" inputClass="w-40" />
        <SelectField
          v-model="searchForm.sortBy"
          label="정렬기준"
          :options="sortOptions"
          label-position="left"
          size="sm"
          triggerClass="w-30"
        />
        <InputField2 v-model="searchForm.managementNo" label="관리번호" size="sm" inputClass="w-32" />
        <InputField2 v-model="searchForm.bizName" label="상호명" size="sm" inputClass="w-32" />
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
        <div class="group-gap2">
          <DatePicker label="진단일자" labelPosition="left" size="sm" inputClass="w-40" />
          <span aria-hidden="true">~</span>
          <DatePicker size="sm" inputClass="w-40" label="진단일자 종료일" labelClass="sr-only" />
        </div>

        <SelectField
          v-model="searchForm.reason"
          label="진단사유"
          :options="reasonOptions"
          label-position="left"
          size="sm"
          triggerClass="w-50"
        />
        <InputField2 v-model="searchForm.diagnoser" label="진단자" size="sm" inputClass="w-30" />
      </div>
    </template>
    <template #btns>
      <Button variant="secondary" size="sm">조회</Button>
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
        <!--
          @table-built: URL 로 팝업 화면ID에 직접 들어오면 마운트 도중 이 그리드의 데이터가
          바뀌는데, Tabulator 가 아직 build 중이면 setData 가 터진다. build 완료를 알려주면
          composable 이 그때까지 초기 로드를 미뤄준다.
        -->
        <TabulatorGrid
          ref="historyGridRef"
          class="flex-1 lp-grid-multiline"
          :columns="historyColumns"
          v-model:data="historyRows"
          select-mode="checkbox"
          height="100%"
          min-height="40rem"
          placeholder="좌측 목록에서 진단 건을 선택해 주세요"
          @table-built="markHistoryGridReady"
          @row-click="onHistoryRowClick"
        />
      </LayoutPanel>
    </template>
  </LayoutSplite>

  <NewDiagnosisDialog
    v-model:open="newDiagnosisDialogOpen"
    title="범죄예방진단 현황 신규"
    :size="1000"
    :form="newDiagnosisForm"
    :assessment="assessmentValues"
    :total-score="totalScore"
    @save="saveNewDiagnosis"
    @cancel="cancelNewDiagnosis"
    @open-simple-notice="openSimpleNoticeData"
    @open-photo="openPhotoData"
    @open-history="openDiagnosisHistory"
  />

  <!-- PM-PUB-0106 진단 추가 — 같은 진단 폼을 'add' 모드로 재사용한다(대상 정보는 읽기 전용) -->
  <NewDiagnosisDialog
    v-model:open="newHistoryDialogOpen"
    title="범죄예방진단 추가"
    mode="add"
    diagnoser="[경사] 홍길동"
    :size="1000"
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
    @select-row="onCpoResultRowSelect"
  />
  <MailNoticeDialog
    v-model:open="mailNoticeDialogOpen"
    :diagnosis="selectedRow"
    :note="newDiagnosisForm.note"
    :mail-requested="newDiagnosisForm.emailNotify"
  />

  <!--
    ⚠ 아래 세 팝업(사진자료 0108 · 간이진단통보자료 0109 · 이력보기 0110)은 위 팝업들 위에
    겹쳐 여는 하위 팝업이라 반드시 '맨 마지막' 에 선언한다.
    GenericDialog2 는 모두 body 로 포털되고 z-index 가 z-50 으로 같아서, 겹칠 때는 DOM 에
    나중에 온 쪽이 위에 그려진다 — 앞에 두면 부모 팝업 뒤에 깔려 "배경만 어두워지고 아무
    반응이 없는" 것처럼 보인다(0105 에서 간이진단통보자료를 열었을 때 실제로 겪음).
    새 하위 팝업을 추가할 때도 이 아래에 붙인다.
  -->
  <PhotoDataDialog v-model:open="photoDialogOpen" v-model:note="newDiagnosisForm.note" />
  <SimpleNoticeDataDialog v-model:open="simpleNoticeDialogOpen" :diagnosis="selectedRow" />
  <DiagnosisHistoryDialog v-model:open="diagnosisHistoryDialogOpen" :diagnosis="selectedRow" :rows="historyRows" />
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
import { Button, HelpButton } from '@/components/custom/button'
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
  markHistoryGridReady,
  selectRow,
  loadDiagnosis,
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

/** 좌측 범죄예방진단 현황 그리드 컬럼 */
const listColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  { title: '부서', field: 'dept', hozAlign: 'center' },
  { title: '상호명', field: 'bizName', hozAlign: 'center' },
  { title: '기본주소', field: 'baseAddress', widthGrow: 2, hozAlign: 'left' },
  { title: '상세주소', field: 'detailAddress', widthGrow: 2, hozAlign: 'left' },
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
  { title: '주소', field: 'address', width: 180, hozAlign: 'left', variableHeight: true },
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

/**
 * PC-PUB-0105 팝업 안 목록에서 다른 건을 고르면 좌측 선택 상태와 상세 폼을 함께 바꾼다.
 * (selectRow 는 선택행/이력만 갱신하므로 폼 재적재는 loadDiagnosis 가 맡는다)
 */
function onCpoResultRowSelect(row: CpoDiagnosisRow) {
  selectRow(row)
  loadDiagnosis(row)
}

function onDiagnosisRowDoubleClick(_event: Event, row: any) {
  openDetail(getRowData(row))
}

/**
 * 사용자 지정: 이력 행의 어느 셀을 눌러도 범죄예방진단 상세 팝업(PM-PUB-0107)이 열린다.
 * 이력은 좌측에서 고른 건의 것이라 상호명 링크와 같이 그 건(selectedRow)으로 연다.
 * 체크박스 칸은 그리드가 클릭 전파를 막아 여기 안 오고, 상호명 링크 버튼은 자기 핸들러가 열므로 건너뛴다.
 */
function onHistoryRowClick(event: Event, _row: any) {
  if ((event.target as HTMLElement | null)?.closest('button, a, input')) return
  openDetail(selectedRow.value)
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

/*
 * ⚠ 키는 '화면ID' 가 아니라 라우터에 등록된 route.name 이어야 한다(useAutoTrigger 가
 *   route.name 으로 매칭하고, 역방향에서 router.replace({ name }) 를 호출한다).
 *   0104/0105 는 라우터 name 이 PM- 이고 PC- 는 alias 라, 여기서도 PM- 을 쓴다.
 *   PC- 로 적어두면 팝업을 열 때 "No match for PC-PUB-0105" 로 watcher 가 터져서
 *   URL 진입은 물론 버튼으로도 팝업이 열리지 않는다.
 */
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
