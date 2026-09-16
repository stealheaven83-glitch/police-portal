<template>
  <PageHeader>
    <template #left>
      <PageTitle title="예약불가 관리" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <!-- 시안에 검색영역이 없다("상세조회 열림" 프레임은 hidden) — SearchWrapper 를 두지 않는다 -->
  <div class="list-actions">
    <Button type="button" variant="primary" size="sm" @click="openCreate">신규</Button>
  </div>

  <TabulatorGrid
    class="flex-1"
    :columns="columns"
    :data="rows"
    height="100%"
    placeholder="조회된 내역이 없습니다"
    show-pagination
    :items-per-page="10"
  />

  <UnavailableFormDialog />
</template>

<script setup lang="ts">
import { provide } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import UnavailableFormDialog from './components/UnavailableFormDialog.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
import {
  useUnavailableReservation,
  UnavailableReservationKey,
  type UnavailableReservationRow,
} from './composable/PC-PUB-0419'
defineOptions({ name: 'PcPub0419' })

/*
 * LNB: publicSafetyMenu items[3] = '해바라기센터'. '예약불가 관리' 는 프리셋에 아직 없어
 * 시안 LNB 라벨을 그대로 준다 — 배치 등록 전까지 활성표시가 안 뜨는 건 정상(docs/create.md §3).
 */
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 3, activeChild: '예약불가 관리' })

// 브레드크럼: 실제 라우트가 있는 항목만 path 를 준다. '/pub' 은 라우터에 없다.
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '해바라기센터' },
]

/* 팝업 2개(상세/수정 PC-PUB-0420 · 등록 PC-PUB-0421)가 같은 상태를 쓰도록 여기서 한 번만 만든다 */
const store = useUnavailableReservation()
provide(UnavailableReservationKey, store)
const { rows, createDialogOpen, openCreate, openDetail } = store

/**
 * 화면ID ↔ 팝업 상태 동기화(docs/create/tab-popup.md §4).
 *   PC-PUB-0419 : 목록만
 *   PC-PUB-0421 : 목록 + 등록 팝업 열림
 * 상세/수정(PC-PUB-0420)은 사유 셀의 행을 골라야 열려 URL 만으로 어느 행인지 알 수 없다(비대칭) —
 * 라우트만 등록하고 여기서는 뺐다. 그 주소로 들어오면 팝업 없이 목록이 뜬다.
 */
const screenTriggers: ScreenTriggerMap = {
  'PC-PUB-0419': [],
  'PC-PUB-0421': [[createDialogOpen, true]],
}
useAutoTrigger(screenTriggers)

/** 사용자 지정: 사유 셀을 클릭하면 상세/수정 팝업. cellClick 은 Tabulator CellComponent 를 넘긴다 */
function onReasonCellClick(_e: UIEvent, cell: any) {
  const data = cell.getData() as UnavailableReservationRow
  openDetail(data.rowKey)
}

// 시안: 번호 60 고정, 나머지 8개 컬럼은 같은 폭(188) — fitColumns 가 남는 폭을 균등 분배한다
const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '상태', field: 'status', hozAlign: 'center' },
  { title: '센터명', field: 'centerName', hozAlign: 'center' },
  { title: '시작일', field: 'startDate', hozAlign: 'center' },
  { title: '시작시간', field: 'startTime', hozAlign: 'center' },
  { title: '종료일', field: 'endDate', hozAlign: 'center' },
  { title: '종료시간', field: 'endTime', hozAlign: 'center' },
  { title: '사유', field: 'reason', hozAlign: 'center', cellClick: onReasonCellClick },
  { title: '등록일', field: 'registeredDate', hozAlign: 'center' },
]

useBottomTabSetup({
  value: 'PC-PUB-0419',
  label: '예약불가 관리',
  path: '/views/pub/PC-PUB-0419',
  componentName: 'PcPub0419',
  closable: true,
})
</script>
