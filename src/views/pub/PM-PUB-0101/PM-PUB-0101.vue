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
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useDiagnosisList, typeOptions, type DiagnosisRow } from './composable/PM-PUB-0101'
import styles from './style/PM-PUB-0101.module.css'

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

const { advancedSearchOpen, searchForm, rows, historyRows, selectRow, search, openNew } =
  useDiagnosisList()

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
    // 체크 표시 대신 글자로 둬야 스크린리더가 읽고, 흑백 인쇄에서도 구분된다
    formatter: (cell: any) => (cell.getValue() ? '해당' : '해당없음'),
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
    검색영역이 남는 높이를 다 먹는다. 블록 래퍼로 한 겹 감싸 높이를 auto 로 묶어둔다.
  -->
  <div :class="styles.searchArea">
    <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
      <template #department>
        <span class="text-sm font-semibold">부서</span>
        <DepartmentCascadeSelect v-model="searchForm.department" size="sm" />
      </template>
      <template #form>
        <div class="search-area">
          <DatePicker
            v-model="searchForm.diagnosedFrom"
            label="진단일자"
            size="sm"
            inputClass="w-40"
            placeholder="YYYY.MM.DD"
          />
          <span aria-hidden="true">~</span>
          <DatePicker
            v-model="searchForm.diagnosedTo"
            size="sm"
            inputClass="w-40"
            placeholder="YYYY.MM.DD"
          />
          <SelectField
            v-model="searchForm.type"
            label="유형"
            :options="typeOptions"
            label-position="left"
            size="sm"
            triggerClass="w-30"
          />
          <InputField2 v-model="searchForm.bizNameKeyword" label="상호명" size="sm" inputClass="w-40" />
          <InputField2 v-model="searchForm.diagnoserKeyword" label="진단자" size="sm" inputClass="w-40" />
        </div>
      </template>
      <template #btns>
        <Button variant="secondary" size="sm" class="w-25" @click="search">조회</Button>
      </template>
    </SearchWrapper>
  </div>

  <div class="listActions">
    <Button type="button" variant="tertiary2" size="sm" @click="onDownloadExcel">
      <Download :size="16" aria-hidden="true" />
      엑셀다운로드
    </Button>
    <Button type="button" variant="primary" size="sm" class="w-25" @click="openNew">신규</Button>
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
          :class="styles.panelGrid"
          :columns="listColumns"
          :data="rows"
          select-mode="single"
          height="100%"
          placeholder="조회된 진단 내역이 없습니다"
          show-pagination
          :items-per-page="10"
          min-height="40rem"
          @row-selection-changed="onRowSelectionChanged"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="간이 범죄예방진단 이력">
        <TabulatorGrid
          :class="styles.panelGrid"
          :columns="historyColumns"
          :data="historyRows"
          select-mode="single"
          height="100%"
          placeholder="좌측 목록에서 진단 건을 선택해 주세요"
        />
      </LayoutPanel>
    </template>
  </LayoutSplite>
</template>
