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
        <div class="flex items-center">
          <span class="text-[1.5rem] mr-3">진단일자</span>
          <div :class="styles.dateRange">
            <DatePicker v-model="searchForm.diagnosedFrom" size="sm" inputClass="w-40" placeholder="YYYY.MM.DD" />
            <span aria-hidden="true">~</span>
            <DatePicker v-model="searchForm.diagnosedTo" size="sm" inputClass="w-40" placeholder="YYYY.MM.DD" />
          </div>
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
      <Button variant="secondary" size="sm" @click="search">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions" :class="styles.listActions">
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
    :form="newDiagnosisForm"
    :assessment="assessmentValues"
    :total-score="totalScore"
    @save="saveNewDiagnosis"
    @cancel="cancelNewDiagnosis"
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
  historyRows,
  selectRow,
  search,
  newDiagnosisDialogOpen,
  newDiagnosisForm,
  assessmentValues,
  totalScore,
  openNewDiagnosis,
  cancelNewDiagnosis,
  saveNewDiagnosis,
  openNewHistory,
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
  { title: '상호명', field: 'bizName', hozAlign: 'center' },
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

function onDeleteSelectedHistory() {
  historyGridRef.value?.deleteSelected()
}

function onDownloadExcel(withHeader: boolean) {
  const today = new Date().toISOString().slice(0, 10)
  const suffix = withHeader ? '헤더값' : '값'
  listGridRef.value?.download('csv', `CPO입력관리_${suffix}_${today}.csv`)
}

/**
 * 화면ID(PM-PUB-XXXX) ↔ 신규 등록 팝업 상태 양방향 동기화 (PC-LPO-0701/0702 와 동일 패턴).
 *   PM-PUB-0103 : 목록만(신규 등록 팝업 닫힘)
 *   PM-PUB-0114 : 목록 + 신규 등록 팝업(newDiagnosisDialogOpen) 열림
 * 워크리스트에서 PM-PUB-0114 로 바로 들어오면 팝업이 열린 채로 보이고, "신규" 버튼을 눌러
 * 팝업을 열면 주소창이 자동으로 PM-PUB-0114 로 바뀐다(router.replace, 히스토리는 안 쌓임).
 */
const screenTriggers: ScreenTriggerMap = {
  'PM-PUB-0103': [[newDiagnosisDialogOpen, false]],
  'PM-PUB-0114': [[newDiagnosisDialogOpen, true]],
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
