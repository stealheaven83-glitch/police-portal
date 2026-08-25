<template>
  <PageHeader>
    <template #left>
      <PageTitle title="인사관리" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>
  <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
    <template #department>
      <span class="text-sm font-semibold">부서</span>
      <SelectField
          :options="[{ label: '본청', value: 'hq' }]"
          model-value="hq"
          size="sm"
          triggerClass="w-40"
        />
      <SelectField
          :options="selectItem"
          model-value="all"
          size="sm"
          triggerClass="w-40"
        />
      <SelectField
          :options="selectItem"
          model-value="all"
          size="sm"
          triggerClass="w-40"
        />
    </template>
    <template #form>
      <div class="search-area">
        <SelectField
            label="직급"
            :options="selectItem"
            label-position="left"
            size="sm"
            triggerClass="w-40"
         />
        <InputField2 label="이름" size="sm" label-position="left" inputClass="w-40"></InputField2>
      </div>
    </template>
    <template #btns>
      <Button variant="secondary" size="sm" class="w-25">조회</Button>
    </template>
  </SearchWrapper>
  <LayoutSplite :count="2" :widths="[50, 50 ]"  :resizable="false">
    <template #layout-1>
      <LayoutHeader title="인사 현황" >
      </LayoutHeader>
      <!-- 헤더(60px)를 제외한 나머지 영역을 그리드가 채우고, 넘치면 세로 스크롤 -->
      <div class="h-[calc(100%-60px)] overflow-auto p-[2rem]">
        <TableWrapper
          :columns="listColumns"
          :items="pagedListRows"
          :items-per-page="itemsPerPage"
          :total-elements="listRows.length"
          :total-pages="totalPages"
          :current-page="currentPage"
          selectable
          empty-title="조회된 인사 정보가 없습니다"
          empty-description="검색 조건을 변경해 다시 조회해 주세요."
          @page-change="(page: number) => (currentPage = page)"
          @update:items-per-page="(size: number) => { itemsPerPage = size; currentPage = 1 }"
          @select-row="onSelectRow"
        />
      </div>
    </template>
    <template #layout-2>
      <LayoutHeader title="인사 상세" />
    </template>
  </LayoutSplite>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
// import {
//   Layout,
//   Database,
//   Zap,
//   Files,
//   Cpu,
//   Package
// } from 'lucide-vue-next'

import '@vuepic/vue-datepicker/dist/main.css'
// import '../DatePicker.css'

import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue';
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue';
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutHeader from '@/components/custom/content-layout/layoutHeader.vue'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'

// const techStack = [
//   { name: 'Vue 3', version: '^3.5.24', category: 'Framework' },
//   { name: 'TypeScript', version: '~5.9.3', category: 'Language' },
//   { name: 'Vite', version: '^7.2.4', category: 'Build Tool' },
//   { name: 'Tailwind CSS', version: '^4.1.18', category: 'Styling' },
//   { name: 'Pinia', version: '^3.0.4', category: 'State' },
//   { name: 'shadcn-vue', version: '-', category: 'UI' },
// ]

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전', path: '/safety' },
  { label: '범죄예방진단', path: '/safety/crime' }
];


const selectItem = [
  { label: '전체', value: 'all' },
  { label: 'select1', value: 'select1' },
  { label: 'select2', value: 'select2' },
  { label: 'select3', value: 'select3' },
]

/* ── 인사 현황 그리드 ───────────────────────────────────────── */

interface PersonnelRow {
  no: number
  name: string
  rank: string
  position: string
  team: string
  phone: string
  updater: string
  updatedAt: string
}

const listColumns = [
  { key: 'no', label: '번호', width: '7rem' },
  { key: 'name', label: '성명', width: '10rem' },
  { key: 'rank', label: '계급', width: '8rem' },
  { key: 'position', label: '직책', width: '8rem' },
  { key: 'team', label: '소속팀', width: '8rem' },
  { key: 'phone', label: '전화번호' },
  { key: 'updater', label: '수정자', width: '8rem' },
  { key: 'updatedAt', label: '수정일자', width: '11rem' },
]

const listRows = ref<PersonnelRow[]>(
  ['경감', '경감', '경감', '경위', '경감', '경감', '총경', '경감'].map((rank, i) => ({
    no: i + 1,
    name: '홍길동',
    rank,
    position: '관리',
    team: '1팀',
    phone: '010-1234-5678',
    updater: '홍길동',
    updatedAt: '2015-11-00',
  })),
)

const itemsPerPage = ref(10)
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(listRows.value.length / itemsPerPage.value)))
const pagedListRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return listRows.value.slice(start, start + itemsPerPage.value)
})

const selectedRow = ref<PersonnelRow | null>(null)
function onSelectRow(payload: { index: number; item: PersonnelRow }) {
  selectedRow.value = payload.item
}

// const features = [
//   {
//     title: 'State Management',
//     description: 'Pinia 기반 글로벌 상태 및 데이터 영속화',
//     icon: Database
//   },
//   {
//     title: 'UI Components',
//     description: 'shadcn-vue 기반의 일관된 UI 구성 요소',
//     icon: Layout
//   },
//   {
//     title: 'API Integration',
//     description: 'Axios Helper를 통한 표준화된 통신 구조',
//     icon: Zap
//   }
// ]

const vIf = ref(false);
const advancedSearchOpen = ref(true);

</script>


<style scoped>
/* 담백함을 유지하기 위해 추가 스타일 최소화 */

/*
 * TableWrapper 는 선택 행에 .bg-muted(회색)를 붙인다.
 * 퍼블 시안은 선택 행이 hover 와 같은 파란 강조라서 여기서만 덮어쓴다.
 */
:deep(tbody tr.bg-muted) {
  background-color: #f0f7ff !important;
  color: #0054a6;
  font-weight: 700;
}
</style>
