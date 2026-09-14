<template>
  <PageHeader>
    <template #left>
      <PageTitle title="해바라기센터 관리" />
    </template>
    <template #right>
      <div class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </div>
    </template>
  </PageHeader>

  <!-- 시안에 조회 버튼·상세조회가 없어서 #form 만 쓰고 회색 배경을 뺀다(/component/search-area 4번) -->
  <SearchWrapper no-background class="lp-search-flush">
    <template #form>
      <div class="search-area">
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
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <Button type="button" variant="tertiary" size="sm" @click="onDelete">삭제</Button>
    <Button type="button" variant="primary" size="sm" @click="openCreate">신규</Button>
  </div>

  <TabulatorGrid
    :columns="columns"
    :data="rows"
    class="flex-1"
    height="100%"
    :row-class="rowClass"
    placeholder="조회된 해바라기센터가 없습니다"
    show-pagination
    :items-per-page="10"
    @row-click="onRowClick"
  />

  <CenterFormDialog />
</template>

<script setup lang="ts">
import { provide } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import CenterFormDialog from './components/CenterFormDialog.vue'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  useSunflowerCenterList,
  SunflowerCenterKey,
  officeOptions,
  centerNameOptions,
  type SunflowerCenterRow,
} from './composable/PM-PUB-0401'
// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(§5)
defineOptions({ name: 'PmPub0401' })

/* LNB: publicSafetyMenu items[3] = '해바라기센터' → '해바라기센터 관리' */
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 3, activeChild: '해바라기센터 관리' })

// '/pub' 은 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '해바라기센터' },
  { label: '해바라기센터관리' },
]

/* 팝업 2개(상세 PC-PUB-0402 / 등록 PC-PUB-0403)가 같은 상태를 쓰도록 여기서 한 번만 만든다 */
const store = useSunflowerCenterList()
provide(SunflowerCenterKey, store)
const {
  searchOffice,
  searchCenterName,
  rows,
  activeRowKey,
  openCreate,
  openDetail,
  removeActiveRow,
} = store

const dialog = useDialog()

/*
 * 시안 그리드 컬럼이 '주취자 센터 병상 현황'(PM-PUB-0409) 것과 같고, 상세 팝업 항목
 * (센터명·주소·관할청·병원명·전화번호·비고)과 맞지 않는다. 시안을 그대로 옮기되
 * 첫 칸은 시안의 '성별' 중복 표기 대신 실제 값(마스킹 성명)에 맞춰 '성명'으로 뒀다.
 */
const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  { title: '성명', field: 'name', width: 110, hozAlign: 'center' },
  { title: '성별', field: 'gender', width: 90, hozAlign: 'center' },
  { title: '연령대', field: 'ageGroup', width: 100, hozAlign: 'center' },
  { title: '증상', field: 'symptom', width: 100, hozAlign: 'center' },
  { title: '접수경로', field: 'route', hozAlign: 'center', formatter: 'textarea' },
  { title: '지역', field: 'region', width: 100, hozAlign: 'center' },
  { title: '센터명', field: 'centerName', hozAlign: 'center' },
  { title: '수정일자', field: 'updatedAt', width: 150, hozAlign: 'center' },
  { title: '퇴소일시', field: 'leftAt', width: 150, hozAlign: 'center' },
]

/** 지금 상세 팝업에 떠 있는 행만 배경으로 표시한다 */
function rowClass(row: SunflowerCenterRow) {
  return row.rowKey === activeRowKey.value ? 'lp-grid-active-row' : undefined
}

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as SunflowerCenterRow
  openDetail(data.rowKey)
}

/**
 * 시안에 체크박스 열이 없어서 '삭제'는 지금 목록에서 고른(상세를 연) 행을 지운다.
 * 되돌릴 수 없으므로 컨펌을 먼저 띄운다.
 */
async function onDelete() {
  if (!activeRowKey.value) {
    await dialog.alert({ title: '삭제할 해바라기센터를 선택해 주세요.', btnCancel: '확인' })
    return
  }
  const result = await dialog.confirm({ title: '삭제하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  removeActiveRow()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PM-PUB-0401',
  label: '해바라기센터관리',
  path: '/views/pub/PM-PUB-0401',
  componentName: 'PmPub0401',
  closable: true,
})
</script>
