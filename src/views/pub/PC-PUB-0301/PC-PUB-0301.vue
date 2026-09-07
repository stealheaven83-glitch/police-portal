<template>
  <PageHeader>
    <template #left>
      <PageTitle title="단체정보리스트" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <SearchWrapper>
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
      <Download :size="16" aria-hidden="true" />
      엑셀다운로드
    </Button>
    <Button type="button" variant="primary" size="sm" @click="openNew">신규</Button>
  </div>

  <TabulatorGrid
    ref="gridRef"
    class="flex-1"
    :columns="columns"
    :data="rows"
    height="100%"
    min-height="40rem"
    placeholder="등록된 단체가 없습니다"
    show-pagination
    :items-per-page="10"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { usePublicSafetyStore, groupTypeOptions } from '../composable/publicSafety'
import type { GroupListRow } from '../composable/publicSafety'
import HelpButton from '@/components/custom/button/HelpButton.vue'
defineOptions({ name: 'PcPub0301' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '방범협력단체' },
  { label: '단체정보리스트' },
]

const router = useRouter()
const store = usePublicSafetyStore()

// 시안에는 상세조회(검색 폼)가 없고 부서 선택만 있다 — 목록은 부서 조건으로만 좁힌다.
const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
const rows = store.groups

const groupTypeLabel = (row: GroupListRow) =>
  row.groupType === 'etc'
    ? row.groupTypeEtc || '기타'
    : groupTypeOptions.find((o) => o.value === row.groupType)?.label ?? row.groupType

/**
 * 단체명은 시안에서 본문과 같은 검정 텍스트지만, 상세(PC-PUB-0302)로 가는 유일한 진입점이라
 * 키보드로도 열 수 있게 버튼 셀로 둔다. variant 'text' 가 --Text-body_0(#1e2124) 라
 * 평상시 모습은 시안과 같고 hover/focus 에서만 클릭 가능함이 드러난다.
 */
const groupNameColumn: TabulatorGridColumn = {
  title: '단체명',
  field: 'groupName',
  hozAlign: 'center',
  cellType: 'button',
  buttonVariant: 'text',
  buttonSize: 'xxs',
  buttonLabel: (row) => String((row as GroupListRow).groupName),
  onButtonClick: (row) => openDetail(row as GroupListRow),
}

// 폭은 시안 기준(번호 60 / 부서 320 / 대표자명 160 / 구성인원 120, 나머지는 균등 분배)
const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '부서', field: 'dept', width: 320, hozAlign: 'center' },
  {
    title: '단체종류',
    field: 'groupType',
    hozAlign: 'center',
    formatter: (cell: any) => groupTypeLabel(cell.getRow().getData()),
  },
  groupNameColumn,
  { title: '설립일', field: 'foundedDate', hozAlign: 'center' },
  { title: '대표자명', field: 'leaderName', width: 160, hozAlign: 'center' },
  { title: '구성인원', field: 'memberCount', width: 120, hozAlign: 'center' },
  { title: '전화번호', field: 'phone', hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `단체정보리스트_${today}.csv`)
}

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
