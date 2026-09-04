<template>
  <PageHeader>
    <template #left>
      <PageTitle title="해바라기센터 사용자" />
    </template>
    <template #right>
      <div class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </div>
    </template>
  </PageHeader>

  <!-- 시안에 조회 버튼·상세조회가 없어서 SearchWrapper 가 아니라 부서줄 하나다 -->
  <div class="dept-area">
    <SelectField
      v-model="searchOffice"
      label="관할청"
      :options="officeOptions"
      size="sm"
      trigger-class="w-37"
      placeholder="선택"
    />
    <SelectField
      v-model="searchCenterName"
      label="센터명"
      :options="centerNameOptions"
      size="sm"
      trigger-class="w-37"
      placeholder="선택"
    />
  </div>

  <!-- 시안에는 버튼줄이 없지만 등록 팝업(PC-PUB-0418)으로 들어갈 길이 필요해 신규를 뒀다 -->
  <div class="list-actions">
    <Button type="button" variant="primary" size="sm" @click="openCreate">신규</Button>
  </div>

  <TabulatorGrid
    :columns="columns"
    :data="rows"
    class="flex-1"
    height="100%"
    :row-class="rowClass"
    placeholder="조회된 사용자가 없습니다"
    show-pagination
    :items-per-page="10"
    @row-click="onRowClick"
  />

  <CenterUserFormDialog />
</template>

<script setup lang="ts">
import { provide } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import CenterUserFormDialog from './components/CenterUserFormDialog.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  useCenterUserList,
  CenterUserKey,
  officeOptions,
  centerNameOptions,
  type CenterUserRow,
} from './composable/PM-PUB-0404'
// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(§5)
defineOptions({ name: 'PmPub0404' })

/*
 * LNB: publicSafetyMenu items[3] = '해바라기센터'.
 * ⚠ 프리셋 children 에 '해바라기센터 사용자' 가 아직 없다 — 시안 라벨을 그대로 넣어 뒀고
 *   프리셋 배치 등록 시 확인이 필요하다(CLAUDE.md §5 ③).
 */
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 3, activeChild: '해바라기센터 사용자' })

// '/pub' 은 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '해바라기센터' },
  { label: '해바라기센터관리' },
]

/* 팝업 2개(상세 PC-PUB-0417 / 등록 PC-PUB-0418)가 같은 상태를 쓰도록 여기서 한 번만 만든다 */
const store = useCenterUserList()
provide(CenterUserKey, store)
const { searchOffice, searchCenterName, rows, activeRowKey, openCreate, openDetail } = store

/**
 * '구분' 아래 마스터 / 센터 수사관 / 일반 사용자 세 칸으로 갈린다(시안 그룹 헤더).
 * 한 사용자는 자기 권한 칸에만 이름이 찍히므로 셀 값은 role 로 갈라 만든다.
 */
function roleCell(role: CenterUserRow['role']) {
  return (cell: any) => {
    const data = cell.getData() as CenterUserRow
    return data.role === role ? data.userLabel : ''
  }
}

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  { title: '관할청', field: 'office', hozAlign: 'center' },
  { title: '센터명', field: 'centerName', hozAlign: 'center' },
  { title: '병원명', field: 'hospitalName', hozAlign: 'center' },
  {
    title: '구분',
    hozAlign: 'center',
    columns: [
      { title: '마스터', field: 'roleMaster', hozAlign: 'center', formatter: roleCell('master') },
      {
        title: '센터 수사관',
        field: 'roleInvestigator',
        hozAlign: 'center',
        formatter: roleCell('investigator'),
      },
      { title: '일반 사용자', field: 'roleGeneral', hozAlign: 'center', formatter: roleCell('general') },
    ],
  },
]

/** 지금 상세 팝업에 떠 있는 행만 배경으로 표시한다 */
function rowClass(row: CenterUserRow) {
  return row.rowKey === activeRowKey.value ? 'lp-grid-active-row' : undefined
}

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as CenterUserRow
  openDetail(data.rowKey)
}

useBottomTabSetup({
  value: 'PM-PUB-0404',
  label: '해바라기센터 사용자',
  path: '/views/pub/PM-PUB-0404',
  componentName: 'PmPub0404',
  closable: true,
})
</script>
