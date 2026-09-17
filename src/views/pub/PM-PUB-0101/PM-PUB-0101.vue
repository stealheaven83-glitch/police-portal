<template>
  <PageHeader>
    <template #left>
      <PageTitle title="간이 범죄예방진단" />
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
        <DepartmentCascadeSelect v-model="searchForm.department" size="sm" />
      </template>
      <template #form>
        <!-- 시안 1행: 관리번호 · 상호명 · 유형 · 통보유무 · 현금다액업소 -->
        <div class="search-area">
          <InputField2 v-model="searchForm.managementNo" label="관리번호" size="sm" input-class="w-40" />
          <InputField2 v-model="searchForm.bizName" label="상호명" size="sm" input-class="w-40" />
          <SelectField
            v-model="searchForm.type"
            label="유형"
            :options="typeOptions"
            size="sm"
            trigger-class="w-40"
          />
          <SelectField
            v-model="searchForm.notified"
            label="통보유무"
            :options="notifiedOptions"
            size="sm"
            trigger-class="w-40"
          />
          <SelectField
            v-model="searchForm.cashIntensive"
            label="현금다액업소"
            :options="cashIntensiveOptions"
            size="sm"
            trigger-class="w-40"
          />

        <div class="group-gap2">
          <DatePicker
            v-model="searchForm.diagnosedFrom"
            label="진단일자"
            size="sm"
            input-class="w-40"
            placeholder="YYYY-MM-DD"
          />
          <span aria-hidden="true">~</span>
          <DatePicker
            v-model="searchForm.diagnosedTo"
            size="sm"
            input-class="w-40"
            placeholder="YYYY-MM-DD"
            label="진단일자 종료일"
            label-class="sr-only"
          />
        </div>
        <SelectField
          v-model="searchForm.reason"
          label="진단사유"
          :options="reasonOptions"
          size="sm"
          trigger-class="w-40"
        />
        <InputField2 v-model="searchForm.diagnoser" label="진단자" size="sm" input-class="w-40" />
        </div>
      </template>
      <template #btns>
        <Button variant="secondary" size="sm" @click="search">조회</Button>
      </template>
    </SearchWrapper>

  <div class="list-actions">
    <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
      <Download :size="16" aria-hidden="true" />
      엑셀다운로드
    </Button>
    <Button type="button" variant="primary" size="sm" @click="openNew">신규</Button>
  </div>

  <!--
    좌측에서 고른 한 건이 우측 이력의 조회 조건이라, 두 그리드를 나란히 두고 폭만 조절하게 한다.
    좁은 화면에서는 LayoutSplite 가 알아서 위아래로 쌓는다.
  -->
  <LayoutSplite :count="2" :widths="[55, 45]" >
    <template #layout-1>
      <LayoutPanel title="간이 범죄예방진단 현황">
        <TabulatorGrid
          ref="gridRef"
          class="flex-1"
          :columns="listColumns"
          :data="rows"
          select-mode="single"
          height="100%"
          placeholder="조회된 진단 내역이 없습니다"
          show-pagination
          :items-per-page="10"
          @row-selection-changed="onRowSelectionChanged"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="간이 범죄예방진단 이력">
        <TabulatorGrid
          class="flex-1"
          :columns="historyColumns"
          :data="historyRows"
          select-mode="single"
          height="100%"
          placeholder="좌측 목록에서 진단 건을 선택해 주세요"
        />
      </LayoutPanel>
    </template>
  </LayoutSplite>

  <DiagnosisDetailDialog />
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
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
import DiagnosisDetailDialog from './components/DiagnosisDetailDialog.vue'
import { useDiagnosisDetail } from './composable/PM-PUB-0102'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
import {
  useDiagnosisList,
  typeOptions,
  reasonOptions,
  notifiedOptions,
  cashIntensiveOptions,
  DiagnosisListKey,
  type DiagnosisRow,
  type DiagnosisHistoryRow,
} from './composable/PM-PUB-0101'
import HelpButton from '@/components/custom/button/HelpButton.vue'

// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!)
defineOptions({
  name: 'PmPub0101',
})

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '범죄예방진단' },
  { label: '간이 범죄예방진단' },
]

/**
 * 팝업(components/)이 props/emit 없이 같은 상태를 쓰도록 여기서 한 번만 만들어 provide 한다.
 * 팝업은 DiagnosisListKey 로 inject 해서 이 인스턴스를 공유한다.
 */
const store = { ...useDiagnosisList(), ...useDiagnosisDetail() }
provide(DiagnosisListKey, store)

const { advancedSearchOpen, searchForm, rows, historyRows, selectRow, search, openNew, openDetail, detailOpen, closeDetail } =
  store

/**
 * 화면ID ↔ 상세 팝업 동기화(docs/create/tab-popup.md §4).
 *   PM-PUB-0101 : 목록만
 *   PM-PUB-0102 : 목록 + 간이 범죄예방진단 상세 팝업 열림
 * 상세는 이력 행을 골라야 여는 팝업이라 URL 만으로는 어느 건인지 알 수 없다 — 주소로 들어오면
 * 첫 건을 골라 그 이력 첫 줄로 연다(검수용, PC-COM-2205 와 같은 처리). 버튼으로 열면 주소만 0102 로 바뀐다.
 */
const detailDialogOpen = computed({
  get: () => detailOpen.value,
  set: (open: boolean) => {
    if (!open) {
      closeDetail()
      return
    }
    if (detailOpen.value) return
    if (!historyRows.value.length) selectRow(rows.value[0] ?? null)
    const first = historyRows.value[0]
    if (first) openDetail(first)
  },
})
const screenTriggers: ScreenTriggerMap = {
  'PM-PUB-0101': [],
  'PM-PUB-0102': [[detailDialogOpen, true]],
}
useAutoTrigger(screenTriggers)

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

/**
 * 현황 그리드 컬럼.
 * 번호만 폭을 고정하고 나머지는 layout="fitColumns" 가 남는 폭을 나눠 갖는다.
 * 주소는 다른 값보다 훨씬 길어 widthGrow 로 더 넓게 잡고 좌측 정렬한다.
 */
const listColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 80, hozAlign: 'center' },
  { title: '부서', field: 'dept', hozAlign: 'center' },
  { title: '유형', field: 'type', hozAlign: 'center' },
  { title: '상호명', field: 'bizName', hozAlign: 'center' },
  { title: '진단자', field: 'diagnoser', hozAlign: 'center' },
  { title: '주소', field: 'address', widthGrow: 3, hozAlign: 'left' },
  {
    title: '현금다액업소',
    field: 'cashIntensive',
    hozAlign: 'center',
    // 체크 표시 대신 글자로 둬야 스크린리더가 읽고, 흑백 인쇄에서도 구분된다
    formatter: (cell: any) => (cell.getValue() ? '해당' : '해당없음'),
  },
]

const historyColumns: TabulatorGridColumn[] = [
  { title: '진단일자', field: 'diagnosedAt', hozAlign: 'center' },
  {
    title: '상호명',
    field: 'bizName',
    hozAlign: 'center',
    // 버튼 텍스트가 곧 셀 값이다 — 눌러서 간소화 상세 팝업을 연다
    cellType: 'button',
    buttonVariant: 'link',
    buttonSize: 'xxs',
    buttonLabel: (row) => String((row as DiagnosisHistoryRow).bizName),
    onButtonClick: (row) => openDetail(row as DiagnosisHistoryRow),
  },
  { title: '진단사유', field: 'reason', hozAlign: 'center' },
  { title: '주소', field: 'address', widthGrow: 2, },
  { title: '진단자', field: 'diagnoser', hozAlign: 'left' },
]

/**
 * select-mode="single" 이라 선택 행은 0건 아니면 1건이다.
 * @row-selection-changed 는 데이터가 아니라 Tabulator RowComponent 를 넘긴다 —
 * getData() 로 꺼내지 않으면 우측 이력이 전부 undefined 가 된다(CLAUDE.md §5).
 */
function onRowSelectionChanged(rows: any[]) {
  const row = rows[0]
  if (!row) {
    selectRow(null)
    return
  }
  selectRow((typeof row.getData === 'function' ? row.getData() : row) as DiagnosisRow)
}

function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `간이범죄예방진단_${today}.csv`)
}

// 사이드메뉴(생활안전 LNB) 설정
useSideMenuSetup('publicSafety')

// 탭 추가 및 활성화
useBottomTabSetup({
  value: 'PM-PUB-0101',
  label: '간이 범죄예방진단',
  path: '/views/pub/PM-PUB-0101',
  componentName: 'PmPub0101',
  closable: true,
})
</script>
