<script setup lang="ts">
import { ref } from 'vue'
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

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="간소화 입력 · 관리" />
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
          triggerClass="w-30"
        />
      <SelectField
          :options="selectItem"
          model-value="all"
          size="sm"
          triggerClass="w-30"
        />
      <SelectField
          :options="selectItem"
          model-value="all"
          size="sm"
          triggerClass="w-30"
        />
    </template>
    <template #form>
      <div class="flex mb-4 gap-9">
        <InputField2 label="관리번호" size="sm" label-position="left" inputClass="w-30"></InputField2>
        <InputField2 label="상호명" size="sm" label-position="left" inputClass="w-30"></InputField2>
        <SelectField
            label="유형"
            :options="selectItem"
            label-position="left"
            size="sm"
            triggerClass="w-50"
          />
        <SelectField
            label="통보유형"
            :options="selectItem"
            label-position="left"
            size="sm"
            triggerClass="w-30"
          />
        <SelectField
            label="현금다액업소"
            :options="selectItem"
            label-position="left"
            size="sm"
            triggerClass="w-30"
          />
      </div>
      <div class="flex gap-9">
        <div class="flex items-center">
          <DatePicker label="조회일자" labelPosition="left" size="sm" inputClass="w-[160px]"></DatePicker>
          <span class="p-[0.8rem]">~</span>
          <DatePicker size="sm" inputClass="w-[160px]"></DatePicker>
        </div>
        <InputField2 label="진단일자" size="sm" label-position="left"></InputField2>
        <SelectField
            label="진단사유"
            :options="selectItem"
            label-position="left"
            size="sm"
            triggerClass="w-30"
          /> 
        <InputField2 label="진단자" size="sm" label-position="left" inputClass="w-30"></InputField2>
      </div>
    </template>
    <template #btns>
      <Button variant="secondary" size="sm" class="w-25">검색</Button>
    </template>
  </SearchWrapper>
  <LayoutSplite :count="3" :widths="[10, 70, 20]">
    <template #layout-1>
      <LayoutHeader title="부서" >
        <template #right>
          <SelectField
            label=""
            :options="selectItem"
            label-position="left"
            size="sm"
            triggerClass="w-30"
          />
        </template>
      </LayoutHeader>
    </template>
    <template #layout-2>
      <LayoutHeader title="사용자목록" />
    </template>
    <template #layout-3>
      <LayoutHeader title="권한목록" />
    </template>
  </LayoutSplite>
</template>

<style scoped>
/* 담백함을 유지하기 위해 추가 스타일 최소화 */
</style>
