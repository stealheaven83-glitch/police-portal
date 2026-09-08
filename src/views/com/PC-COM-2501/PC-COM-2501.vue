<template>
  <PageHeader>
    <template #left>
      <PageTitle title="앱관리" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>
  <SearchWrapper  v-model:expanded="advancedSearchOpen">
    <template #form>
      <div class="search-area">
        <div class="group-gap3">
        <SelectField v-model="searchCondition" label="검색조건" :options="searchConditionOptions" size="sm" triggerClass="w-35" />
        <InputField2 v-model="keyword" size="sm" inputClass="w-100" placeholder="검색어를 입력해주세요." />
      </div>
      </div>
    </template>
    <template #btns>
      <Button variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <Button type="button" variant="primary" size="sm" @click="openNewDetail">신규</Button>
  </div>

  <TabulatorGrid
    class="flex-1"
    :columns="columns"
    :data="rows"
    height="100%"
    min-height="40rem"
    placeholder="등록된 앱 버전이 없습니다"
    show-pagination
    :items-per-page="10"
  />

  <AppVersionDialog />
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { systemAdminMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useAppVersionList, AppVersionKey, searchConditionOptions } from './composable/PC-COM-2501'
import AppVersionDialog from './components/AppVersionDialog.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
defineOptions({ name: 'PcCom2501' })

useSideMenuSetup({ ...systemAdminMenu, openIndex: 3, activeChild: '앱관리' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '시스템관리' },
  { label: '앱관리' },
]

// 팝업(AppVersionDialog)이 같은 상태를 쓰도록 여기서 한 번만 만들어 provide 한다(CLAUDE.md §3 패턴A)
const store = useAppVersionList()
provide(AppVersionKey, store)

const { searchCondition, keyword, rows, openNewDetail } = store

/* SearchWrapper 는 collapsible 일 때만 form·btns 슬롯을 그린다. 접는 UI 는 없고 항상 펼친 채 쓴다 */
const advancedSearchOpen = ref(true)

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  { title: '버전', field: 'version', width: 120, hozAlign: 'center' },
  { title: '제목', field: 'title', hozAlign: 'center' },
  {
    title: '사용여부',
    field: 'inUse',
    width: 120,
    hozAlign: 'center',
    formatter: (cell: any) => (cell.getValue() ? '사용' : '미사용'),
  },
  { title: '등록자', field: 'writer', width: 160, hozAlign: 'center' },
  { title: '등록일시', field: 'createdAt', width: 180, hozAlign: 'center' },
]

useBottomTabSetup({
  value: 'PC-COM-2501',
  label: '앱관리',
  path: '/views/com/PC-COM-2501',
  componentName: 'PcCom2501',
  closable: true,
})
</script>