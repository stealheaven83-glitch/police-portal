<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { Tabs, TabsList, TabsTrigger } from '@/components/custom/tabs'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import EquipmentDetailDialog from './components/EquipmentDetailDialog.vue'
import Vehicle112Dialog from './components/Vehicle112Dialog.vue'
import CommDetailDialog from './components/CommDetailDialog.vue'
import WeaponDetailDialog from './components/WeaponDetailDialog.vue'
import AmmoDetailDialog from './components/AmmoDetailDialog.vue'
import CuffsDetailDialog from './components/CuffsDetailDialog.vue'
import EtcDetailDialog from './components/EtcDetailDialog.vue'
import MaintenanceHistoryDialog from './components/MaintenanceHistoryDialog.vue'
import { useEquipmentList, categoryTabs, EquipmentListKey } from './composable/PC-LPO-0701'
import type { EquipmentListRow } from './composable/PC-LPO-0701'
import styles from './style/PC-LPO-0701.module.css'

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰', path: '/lpo' },
  { label: '장비관리' },
]

const selectItem = [
  { label: '전체', value: 'all' },
  { label: 'select1', value: 'select1' },
  { label: 'select2', value: 'select2' },
  { label: 'select3', value: 'select3' },
]

const advancedSearchOpen = ref(true);

const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })

/**
 * 팝업 4개(components/)가 props/emit 없이 같은 상태를 쓸 수 있도록 여기서 한 번만 생성해 provide 한다.
 * 팝업들은 useEquipmentList() 를 다시 부르지 않고 EquipmentListKey 로 inject 해서 이 인스턴스를 공유한다.
 */
const store = useEquipmentList()
provide(EquipmentListKey, store)

const {
  activeCategory,
  rowsByCategory,
  openNewDetail,
  openDetail,
  openNewCommDetail,
  openCommDetail,
  openNewWeaponDetail,
  openWeaponDetail,
  openNewAmmoDetail,
  openAmmoDetail,
  openNewCuffsDetail,
  openCuffsDetail,
  openNewEtcDetail,
  openEtcDetail,
  openMaintenanceHistory,
} = store

/** 목록 행 클릭/상세보기 — 지금 활성 탭이 어떤 카테고리인지에 따라 필드 구성이 다른 모달로 나뉜다 */
function onOpenRow(row: EquipmentListRow) {
  if (activeCategory.value === 'comm') openCommDetail(row)
  else if (activeCategory.value === 'weapon') openWeaponDetail(row)
  else if (activeCategory.value === 'ammo') openAmmoDetail(row)
  else if (activeCategory.value === 'cuffs') openCuffsDetail(row)
  else if (activeCategory.value === 'etc') openEtcDetail(row)
  else openDetail(row)
}

function onNew() {
  if (activeCategory.value === 'comm') openNewCommDetail()
  else if (activeCategory.value === 'weapon') openNewWeaponDetail()
  else if (activeCategory.value === 'ammo') openNewAmmoDetail()
  else if (activeCategory.value === 'cuffs') openNewCuffsDetail()
  else if (activeCategory.value === 'etc') openNewEtcDetail()
  else openNewDetail()
}

/**
 * 장비 목록 그리드 — 공용 custom/tabulator 의 TabulatorGrid 사용.
 *
 * 셀 안의 버튼은 cellType: 'button' 이 custom/button 의 Button 컴포넌트를 직접 마운트해준다.
 * (그리드 인스턴스 생성/파기, 셀 컴포넌트 언마운트, 데이터 갱신은 컴포넌트가 처리)
 *
 * 컬럼 폭: 시안(1564px 기준)은 번호만 60px 고정이고 나머지 11개가 136.72px 씩 균등하다.
 * layout="fitColumns" 는 width 를 준 컬럼을 고정으로 빼고 나머지가 남는 폭을 나눠 가지므로,
 * 균등 배분할 컬럼에는 width 를 주지 않는다. 좁은 화면용 최소 폭은 columnMinWidth(기본 90px).
 *
 * 카테고리(탭)마다 실제 항목이 달라(기동장비=차량 속성, 통신장비=종류/제조번호 등) 컬럼 구성도
 * 갈라진다 — activeCategory 로 분기하는 computed 로 둬서 탭 전환 시 TabulatorGrid 가 자동으로
 * 컬럼을 다시 그리게 한다.
 */
const maintenanceColumn: TabulatorGridColumn = {
  title: '유지보수이력',
  field: 'id',
  hozAlign: 'center',
  cellType: 'button',
  buttonVariant: 'tertiary',
  buttonSize: 'xs',
  buttonClass: 'h-9 w-12.5',
  buttonLabel: '보기',
  onButtonClick: (row) => openMaintenanceHistory(row as EquipmentListRow),
}

const inUseColumn: TabulatorGridColumn = {
  title: '사용여부',
  field: 'inUse',
  hozAlign: 'center',
  formatter: (cell: any) => (cell.getValue() ? '사용중' : '미사용'),
}

const managementNameColumn: TabulatorGridColumn = {
  title: '장비관리명',
  field: 'managementName',
  hozAlign: 'center',
  cellType: 'button',
  buttonVariant: 'link',
  buttonSize: 'xxs',
  // 버튼 텍스트가 곧 셀 값이다
  buttonLabel: (row) => String((row as EquipmentListRow).managementName),
  onButtonClick: (row) => onOpenRow(row as EquipmentListRow),
}

const mobileGridColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '장비구분', field: 'typeLabel', hozAlign: 'center' },
  managementNameColumn,
  { title: '차량제조사', field: 'manufacturer', hozAlign: 'center' },
  { title: '차종명', field: 'model', hozAlign: 'center' },
  { title: '차량번호', field: 'plateNumber', hozAlign: 'center' },
  { title: '배치장소', field: 'location', hozAlign: 'center' },
  { title: '비고', field: 'note', hozAlign: 'center' },
  maintenanceColumn,
  inUseColumn,
  { title: '수정자', field: 'updater', hozAlign: 'center' },
  { title: '수정일자', field: 'updatedAt', hozAlign: 'center' },
]

const commGridColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '통신장비 종류', field: 'typeLabel', hozAlign: 'center' },
  managementNameColumn,
  { title: '배치장소', field: 'location', hozAlign: 'center' },
  { title: '비고', field: 'note', hozAlign: 'center' },
  maintenanceColumn,
  inUseColumn,
  { title: '수정자', field: 'updater', hozAlign: 'center' },
  { title: '수정일자', field: 'updatedAt', hozAlign: 'center' },
]

const weaponGridColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '무기종류', field: 'typeLabel', hozAlign: 'center' },
  managementNameColumn,
  { title: '총번', field: 'serialNumber', hozAlign: 'center' },
  { title: '배치장소', field: 'location', hozAlign: 'center' },
  { title: '휴대자', field: 'holder', hozAlign: 'center' },
  { title: '비고', field: 'note', hozAlign: 'center' },
  maintenanceColumn,
  inUseColumn,
  { title: '수정자', field: 'updater', hozAlign: 'center' },
  { title: '수정일자', field: 'updatedAt', hozAlign: 'center' },
]

const ammoGridColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  managementNameColumn,
  { title: '단위', field: 'unit', hozAlign: 'center' },
  { title: '결수량', field: 'stock', hozAlign: 'center' },
  { title: '청수량', field: 'current', hozAlign: 'center' },
  { title: '비고', field: 'note', hozAlign: 'center' },
  maintenanceColumn,
  inUseColumn,
  { title: '수정자', field: 'updater', hozAlign: 'center' },
  { title: '수정일자', field: 'updatedAt', hozAlign: 'center' },
]

const cuffsGridColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '수갑종류', field: 'typeLabel', hozAlign: 'center' },
  managementNameColumn,
  { title: '관리번호', field: 'managementNumber', hozAlign: 'center' },
  { title: '지급일자', field: 'issuedDate', hozAlign: 'center' },
  { title: '만료일자', field: 'expiryDate', hozAlign: 'center' },
  { title: '비고', field: 'note', hozAlign: 'center' },
  maintenanceColumn,
  inUseColumn,
  { title: '수정자', field: 'updater', hozAlign: 'center' },
  { title: '수정일자', field: 'updatedAt', hozAlign: 'center' },
]

const etcGridColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '장비유형', field: 'typeLabel', hozAlign: 'center' },
  managementNameColumn,
  { title: '보유수량', field: 'stock', hozAlign: 'center' },
  { title: '비고', field: 'note', hozAlign: 'center' },
  maintenanceColumn,
  inUseColumn,
  { title: '수정자', field: 'updater', hozAlign: 'center' },
  { title: '수정일자', field: 'updatedAt', hozAlign: 'center' },
]

const gridColumns = computed(() => {
  if (activeCategory.value === 'comm') return commGridColumns
  if (activeCategory.value === 'weapon') return weaponGridColumns
  if (activeCategory.value === 'ammo') return ammoGridColumns
  if (activeCategory.value === 'cuffs') return cuffsGridColumns
  if (activeCategory.value === 'etc') return etcGridColumns
  return mobileGridColumns
})

function onPrint() {
  window.print()
}
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="장비관리" />
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

  <Tabs v-model="activeCategory" class="mt-4">
    <TabsList variant="fill" :grow="true">
      <TabsTrigger v-for="tab in categoryTabs" :key="tab.value" :value="tab.value">{{ tab.label }}</TabsTrigger>
    </TabsList>
  </Tabs>

  <div :class="styles.listActions">
    <Button type="button" variant="tertiary2" size="sm" class="w-25" @click="onPrint">인쇄</Button>
    <Button type="button" variant="primary" size="sm" class="w-25" @click="onNew">신규</Button>
  </div>

  <!--
    그리드가 직접 flex 아이템이라 남은 높이를 채운다(flex-1 + height="100%").
    min-height 는 좁은 화면에서 위쪽 툴바·탭이 접혀 남는 높이가 사라졌을 때의 바닥이다.
    (min-h-0 을 주면 min-height 가 무시되므로 주지 않는다)
  -->
  <TabulatorGrid
    class="mt-[1.2rem] flex-1"
    :columns="gridColumns"
    :data="rowsByCategory"
    height="100%"
    min-height="40rem"
    placeholder="등록된 장비가 없습니다"
    show-pagination
    :items-per-page="10"
  />

  <EquipmentDetailDialog />
  <Vehicle112Dialog />
  <CommDetailDialog />
  <WeaponDetailDialog />
  <AmmoDetailDialog />
  <CuffsDetailDialog />
  <EtcDetailDialog />
  <MaintenanceHistoryDialog />
</template>
