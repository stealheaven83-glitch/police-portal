<template>
  <PageHeader>
    <template #left>
      <PageTitle title="간소화 입력 · 관리" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <div :class="styles.toolbar">
    <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
    <template #department>
      <span class="text-sm font-semibold">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </template>
    <template #form>
      <div class="search-area">
        <SelectField
            label="상태구분"
            :options="selectItem"
            label-position="left"
            size="sm"
            triggerClass="w-30"
          />
          <InputField2 label="통신장비 관리명" size="sm" inputClass="w-40" />
      </div>
    </template>
    <template #btns>
      <Button variant="secondary" size="sm" class="w-25">조회</Button>
    </template>
  </SearchWrapper>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
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


// 1. KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!)
defineOptions({
  name: 'PcCom2301'
})

// 2. 입력 폼 상태 (KeepAlive 캐시 동작 확인용)
const searchText = ref('')

// 3. 사이드메뉴 설정 (미리 정의된 키 지정 또는 Custom Config)
useSideMenuSetup('menuTabSample')

</script>