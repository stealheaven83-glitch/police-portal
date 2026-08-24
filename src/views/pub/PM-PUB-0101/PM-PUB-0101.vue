<template>
  <PageHeader>
    <template #left>
      <PageTitle title="간이 범죄예방진단" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <!--
    SearchWrapper 루트에 flex-1 이 걸려 있어 WorkLayout 의 세로 flex 컬럼에 그대로 놓으면
    검색영역이 남는 높이를 다 먹는다. 다른 화면들처럼 블록 래퍼로 한 겹 감싸 높이를 auto 로 둔다.
  -->
  <div>
    <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
      <template #department>
        <span class="text-sm font-semibold">부서</span>
        <DepartmentCascadeSelect v-model="department" size="sm" />
      </template>
      <template #form>
        <div class="search-area">
          <DatePicker v-model="diagnosedFrom" label="진단일자" size="sm" inputClass="w-40" placeholder="YYYY.MM.DD" />
          <span aria-hidden="true">~</span>
          <DatePicker v-model="diagnosedTo" size="sm" inputClass="w-40" placeholder="YYYY.MM.DD" />
          <SelectField
            v-model="type"
            label="유형"
            :options="typeOptions"
            label-position="left"
            size="sm"
            triggerClass="w-30"
          />
          <InputField2 v-model="bizNameKeyword" label="상호명" size="sm" inputClass="w-40" />
          <InputField2 v-model="diagnoserKeyword" label="진단자" size="sm" inputClass="w-40" />
        </div>
      </template>
      <template #btns>
        <Button variant="secondary" size="sm" class="w-25" @click="onSearch">조회</Button>
      </template>
    </SearchWrapper>
  </div>

  <div class="listActions">
    <Button type="button" variant="tertiary2" size="sm" @click="onDownloadExcel">
      <Download :size="16" />
      엑셀다운로드
    </Button>
    <Button type="button" variant="primary" size="sm" class="w-25" @click="onNew">신규</Button>
  </div>

  <!--
    좌측에서 고른 한 건이 우측 이력의 조회 조건이라, 두 그리드를 나란히 두고 폭만 조절하게 한다.
    pane 안쪽은 헤더(60px)를 뺀 나머지를 그리드가 채운다.
  -->
  <LayoutSplite :count="2" :widths="[55, 45]">
    <template #layout-1>
      <LayoutHeader title="간이 범죄예방진단 현황" />
      <div class="flex h-[calc(100%-60px)] flex-col overflow-hidden p-[2rem]">
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
      </div>
    </template>

    <template #layout-2>
      <LayoutHeader title="간이 범죄예방진단 이력" />
      <div class="flex h-[calc(100%-60px)] flex-col overflow-hidden p-[2rem]">
        <TabulatorGrid
          class="flex-1"
          :columns="historyColumns"
          :data="historyRows"
          select-mode="single"
          height="100%"
          placeholder="좌측 목록에서 진단 건을 선택해 주세요"
        />
      </div>
    </template>
  </LayoutSplite>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { Button } from '@/components/custom/button'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutHeader from '@/components/custom/content-layout/layoutHeader.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useDiagnosisList, typeOptions, type DiagnosisRow } from './composable/PM-PUB-0101'

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

/** 시안은 상세조회가 접힌 상태로 열린다 */
const advancedSearchOpen = ref(false)

const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
const diagnosedFrom = ref<string>('')
const diagnosedTo = ref<string>('')
const type = ref('all')
const bizNameKeyword = ref('')
const diagnoserKeyword = ref('')

const { rows, historyRows, selectRow } = useDiagnosisList()

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
  { title: '주소', field: 'address', widthGrow: 3 },
  {
    title: '현금다액업소',
    field: 'cashIntensive',
    hozAlign: 'center',
    formatter: (cell: any) => (cell.getValue() ? 'Y' : ''),
  },
]

const historyColumns: TabulatorGridColumn[] = [
  { title: '진단일자', field: 'diagnosedAt', hozAlign: 'center' },
  { title: '상호명', field: 'bizName', hozAlign: 'center' },
  { title: '진단사유', field: 'reason', hozAlign: 'center' },
  { title: '주소', field: 'address', widthGrow: 2 },
  { title: '진단자', field: 'diagnoser', hozAlign: 'center' },
]

/** select-mode="single" 이라 선택 행은 0건 아니면 1건이다 */
function onRowSelectionChanged(selected: DiagnosisRow[]) {
  selectRow(selected[0] ?? null)
}

function onSearch() {
  // TODO: API 연동. 지금은 더미 목록이라 조회 조건이 결과에 반영되지 않는다.
  toast.success('조회되었습니다.')
}

function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `간이범죄예방진단_${today}.csv`)
}

function onNew() {
  // TODO: 진단신규(등록) 팝업 PM-PUB-0107 연결
  toast.info('신규 등록 화면은 준비 중입니다.')
}

// 탭 추가 및 활성화
useBottomTabSetup({
  value: 'PM-PUB-0101',
  label: '간이 범죄예방진단',
  path: '/views/pub/PM-PUB-0101',
  componentName: 'PmPub0101',
  closable: true,
})
</script>
