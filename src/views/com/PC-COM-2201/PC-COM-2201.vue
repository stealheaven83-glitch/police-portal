<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import styles from './style/PC-COM-2201.module.css'

// 1. KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!)
//    BottomTabItem.componentName 과 일치해야 하고, 다른 화면과 겹치면 캐시가 뒤섞인다.
defineOptions({
  name: 'PcCom2201',
})

const navItems = [
  { label: '홈', path: '/' },
  { label: '시스템관리' },
  { label: '간소화 입력 · 관리' },
]

const statusOptions = [
  { label: '전체', value: 'all' },
  { label: '사용', value: 'use' },
  { label: '미사용', value: 'unused' },
]

const advancedSearchOpen = ref(true)
const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
const status = ref('all')
const equipmentName = ref('')

function onSearch() {
  // TODO: API 연동. 지금은 조회 조건만 잡아둔 상태다.
  toast.success('조회되었습니다.')
}

// 2. 사이드메뉴 설정 (미리 정의된 키 지정 또는 Custom Config)
useSideMenuSetup('menuTabSample')

// 3. 탭 추가 및 활성화
useBottomTabSetup({
  value: 'PC-COM-2201',
  label: '사용자 권한관리',
  path: '/views/com/PC-COM-2201',
  componentName: 'PcCom2201',
  closable: true,
})
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

  <div :class="styles.searchArea">
    <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
      <template #department>
        <span class="text-sm font-semibold">부서</span>
        <DepartmentCascadeSelect v-model="department" size="sm" />
      </template>
      <template #form>
        <div class="search-area">
          <SelectField
            v-model="status"
            label="상태구분"
            :options="statusOptions"
            label-position="left"
            size="sm"
            triggerClass="w-30"
          />
          <InputField2 v-model="equipmentName" label="통신장비 관리명" size="sm" inputClass="w-40" />
        </div>
      </template>
      <template #btns>
        <Button variant="secondary" size="sm" class="w-25" @click="onSearch">조회</Button>
      </template>
    </SearchWrapper>
  </div>
</template>
