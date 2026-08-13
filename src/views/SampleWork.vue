<script setup lang="ts">
import {
  Layout,
  Database,
  Zap,
  Files,
  Cpu,
  Package
} from 'lucide-vue-next'

import '@vuepic/vue-datepicker/dist/main.css'
// import '../DatePicker.css'

import SearchWrapper from '@/components/custom/search/searchWrapper.vue'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/inputField2.vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue';
import Breadcrumb from '@/components/custom/Bread-crumb/Breadcrumb.vue';
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'

const techStack = [
  { name: 'Vue 3', version: '^3.5.24', category: 'Framework' },
  { name: 'TypeScript', version: '~5.9.3', category: 'Language' },
  { name: 'Vite', version: '^7.2.4', category: 'Build Tool' },
  { name: 'Tailwind CSS', version: '^4.1.18', category: 'Styling' },
  { name: 'Pinia', version: '^3.0.4', category: 'State' },
  { name: 'shadcn-vue', version: '-', category: 'UI' },
]

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

const features = [
  {
    title: 'State Management',
    description: 'Pinia 기반 글로벌 상태 및 데이터 영속화',
    icon: Database
  },
  {
    title: 'UI Components',
    description: 'shadcn-vue 기반의 일관된 UI 구성 요소',
    icon: Layout
  },
  {
    title: 'API Integration',
    description: 'Axios Helper를 통한 표준화된 통신 구조',
    icon: Zap
  }
]


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
  <div class="flex justify-start">
    <select></select>
    <select></select>
    <select></select>
    <buton>자세히보기</buton>
  </div>
  <SearchWrapper>
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
        <section>
          <div class="w-[160px] box date-calendar">
            <DatePicker></DatePicker>
          </div>
          <p v-if="fullDate" class="text-sm text-muted-foreground">
            선택된 날짜: {{ formatDate(fullDate) }}
          </p>
        </section>
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
  <LayoutSplite />
</template>

<style scoped>
/* 담백함을 유지하기 위해 추가 스타일 최소화 */
</style>
