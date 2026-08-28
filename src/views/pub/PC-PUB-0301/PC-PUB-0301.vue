<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { usePublicSafetyStore, groupTypeOptions } from '../composable/publicSafety'
import type { GroupListRow } from '../composable/publicSafety'
import styles from './style/PC-PUB-0301.module.css'

defineOptions({ name: 'PcPub0301' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '방범협력단체' },
  { label: '단체정보리스트' },
]

const router = useRouter()
const store = usePublicSafetyStore()

const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
const groupTypeFilter = ref('all')
const groupTypeFilterOptions = [{ label: '전체', value: 'all' }, ...groupTypeOptions]
const advancedSearchOpen = ref(false)

const rows = computed(() => {
  if (groupTypeFilter.value === 'all') return store.groups.value
  return store.groups.value.filter((g) => g.groupType === groupTypeFilter.value)
})

const groupTypeLabel = (row: GroupListRow) =>
  row.groupType === 'etc' ? row.groupTypeEtc || '기타' : groupTypeOptions.find((o) => o.value === row.groupType)?.label ?? row.groupType

const managementNameColumn: TabulatorGridColumn = {
  title: '단체명',
  field: 'groupName',
  hozAlign: 'center',
  cellType: 'button',
  buttonVariant: 'link',
  buttonSize: 'xxs',
  buttonLabel: (row) => String((row as GroupListRow).groupName),
  onButtonClick: (row) => openDetail(row as GroupListRow),
}

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '부서', field: 'dept', hozAlign: 'center' },
  { title: '단체종류', field: 'groupType', hozAlign: 'center', formatter: (cell: any) => groupTypeLabel(cell.getRow().getData()) },
  managementNameColumn,
  { title: '설립일', field: 'foundedDate', hozAlign: 'center' },
  { title: '대표자명', field: 'leaderName', hozAlign: 'center' },
  { title: '구성인원', field: 'memberCount', hozAlign: 'center' },
  { title: '전화번호', field: 'phone', hozAlign: 'center' },
]

function openDetail(row: GroupListRow) {
  router.push({ name: 'PC-PUB-0302', query: { id: row.id } })
}

function openNew() {
  router.push({ name: 'PC-PUB-0303' })
}

// preset 키 문자열을 넘기면 비동기로 로드돼서, 같은 tick 에 activeChild 를 덮어쓰려 하면
// 프리셋 적용이 늦게 끝나 방금 지정한 값이 되돌아가는 경합이 생긴다 — 그래서 이미 로드된
// publicSafetyMenu 를 인라인 config 로 넘겨 동기 경로(apply)를 그대로 탄다.
useSideMenuSetup({ ...publicSafetyMenu, activeChild: '단체정보리스트', openIndex: 2 })

useBottomTabSetup({
  value: 'PC-PUB-0301',
  label: '단체정보리스트',
  path: '/views/pub/PC-PUB-0301',
  componentName: 'PcPub0301',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="단체정보목록" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <div :class="styles.toolbar">
    <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
      <template #department>
        <span class="dept-name">부서</span>
        <DepartmentCascadeSelect v-model="department" size="sm" />
      </template>
      <template #form>
        <div class="search-area">
          <SelectField
            v-model="groupTypeFilter"
            label="단체종류"
            :options="groupTypeFilterOptions"
            label-position="left"
            size="sm"
            triggerClass="w-32"
          />
        </div>
      </template>
      <template #btns>
        <Button variant="secondary" size="sm" class="w-25">조회</Button>
      </template>
    </SearchWrapper>
  </div>

  <div :class="styles.listActions">
    <Button type="button" variant="primary" size="sm" class="w-25" @click="openNew">신규</Button>
  </div>

  <TabulatorGrid
    class="mt-[1.2rem] flex-1"
    :columns="columns"
    :data="rows"
    height="100%"
    min-height="40rem"
    placeholder="등록된 단체가 없습니다"
    show-pagination
    :items-per-page="10"
  />
</template>
