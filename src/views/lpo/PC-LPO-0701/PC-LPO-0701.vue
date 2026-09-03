<template>
  <PageHeader>
    <template #left>
      <PageTitle title="장비관리" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>


    <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
    <template #department>
      <span class="dept-name">부서</span>
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
      <Button variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <Tabs v-model="activeCategory" class="my-5">
    <TabsList variant="fill" :grow="true">
      <TabsTrigger v-for="tab in categoryTabs" :key="tab.value" :value="tab.value">{{ tab.label }}</TabsTrigger>
    </TabsList>
  </Tabs>

  <div class="list-actions">
    <Button type="button" variant="tertiary2" size="sm" @click="onPrint">인쇄</Button>
    <Button type="button" variant="primary" size="sm" @click="onNew">신규</Button>
  </div>

  <!--
    그리드가 직접 flex 아이템이라 남은 높이를 채운다(flex-1 + height="100%").
    min-height 는 좁은 화면에서 위쪽 툴바·탭이 접혀 남는 높이가 사라졌을 때의 바닥이다.
    (min-h-0 을 주면 min-height 가 무시되므로 주지 않는다)
  -->

  <TabulatorGrid
    class="flex-1"
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
<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
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
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import HelpButton from '@/components/custom/button/HelpButton.vue'
// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!) — useBottomTabSetup 의 componentName 과 일치해야 한다.
// 0701~0714 가 이 컴포넌트 하나를 screenGroup 으로 공유하므로(router/index.ts 참고), 탭도
// 어느 화면ID로 들어오든 항상 이 하나의 "장비관리" 탭으로 고정한다.
defineOptions({ name: 'PcLpo0701' })

useSideMenuSetup({ ...localPoliceMenu, openIndex: 5, activeChild: '개인장비' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '장비관리' },
]

const selectItem = [
  { label: '전체', value: 'all' },
  { label: 'select1', value: 'select1' },
  { label: 'select2', value: 'select2' },
  { label: 'select3', value: 'select3' },
]

const advancedSearchOpen = ref(false);

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
  detailDialogOpen,
  openNewDetail,
  openDetail,
  vehicle112DialogOpen,
  commDetailDialogOpen,
  openNewCommDetail,
  openCommDetail,
  weaponDetailDialogOpen,
  openNewWeaponDetail,
  openWeaponDetail,
  ammoDetailDialogOpen,
  openNewAmmoDetail,
  openAmmoDetail,
  cuffsDetailDialogOpen,
  openNewCuffsDetail,
  openCuffsDetail,
  etcDetailDialogOpen,
  openNewEtcDetail,
  openEtcDetail,
  openMaintenanceHistory,
} = store

/**
 * 화면ID(PC-LPO-XXXX) ↔ 이 페이지의 탭/팝업 상태 양방향 동기화.
 *
 * router.ts 에 화면ID별로 라우트를 등록해두고(컴포넌트는 전부 이 파일 재사용), 여기서는
 * "이 화면ID면 이 ref들이 이 값이어야 한다"만 선언한다 — 탭(activeCategory)이든 팝업
 * (xxxDialogOpen)이든 구분 없이 같은 [ref, 값] 쌍으로 나열한다. 0709 처럼 조건이 여러 개면
 * (탭 + 팝업오픈) 그대로 이어붙이면 되고, 팝업 안에서 또 팝업을 여는 중첩 구조도 조건만
 * 더 얹으면 된다 (예: [[activeCategory,'mobile'], [detailDialogOpen,true], [vehicle112DialogOpen,true]]).
 * useAutoTrigger 자체는 이 페이지를 모르는 범용 유틸이라 다른 페이지에도 그대로 쓸 수 있다.
 *
 * 화면ID 매핑(장비관리 화면정의서 기준):
 *   0701 기동장비 목록 · 0702 기동장비 상세팝업 · 0703 112차량조회팝업(0702 안의 하위팝업)
 *   0704 통신장비 목록 · 0705 통신장비 상세팝업
 *   0706 무기 목록   · 0707 무기 상세팝업
 *   0708 탄약 목록   · 0709 탄약 상세팝업
 *   0710 수갑 목록   · 0711 수갑 상세팝업
 *   0712 기타 목록   · 0713 기타 상세팝업
 *
 * PC-LPO-0714(유지보수이력)는 여기서 일부러 뺐다 — 이 팝업은 특정 행(장비)을 골라야
 * 열리는데, [ref,값] 방식은 순방향(URL 진입 시 적용)과 역방향(상태 변화 시 URL 반영)이
 * 같은 조건을 공유해서 "열려 있으면 URL엔 반영하되, URL만으로 직접 열지는 않기"를 표현할
 * 수 없다. 필요해지면 useAutoTrigger 와는 별도로 처리해야 한다.
 */
const screenTriggers: ScreenTriggerMap = {
  'PC-LPO-0701': [[activeCategory, 'mobile']],
  'PC-LPO-0702': [[activeCategory, 'mobile'], [detailDialogOpen, true]],
  'PC-LPO-0703': [[activeCategory, 'mobile'], [detailDialogOpen, true], [vehicle112DialogOpen, true]],
  'PC-LPO-0704': [[activeCategory, 'comm']],
  'PC-LPO-0705': [[activeCategory, 'comm'], [commDetailDialogOpen, true]],
  'PC-LPO-0706': [[activeCategory, 'weapon']],
  'PC-LPO-0707': [[activeCategory, 'weapon'], [weaponDetailDialogOpen, true]],
  'PC-LPO-0708': [[activeCategory, 'ammo']],
  'PC-LPO-0709': [[activeCategory, 'ammo'], [ammoDetailDialogOpen, true]],
  'PC-LPO-0710': [[activeCategory, 'cuffs']],
  'PC-LPO-0711': [[activeCategory, 'cuffs'], [cuffsDetailDialogOpen, true]],
  'PC-LPO-0712': [[activeCategory, 'etc']],
  'PC-LPO-0713': [[activeCategory, 'etc'], [etcDetailDialogOpen, true]],
}

useAutoTrigger(screenTriggers)

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
  { title: '제조회사', field: 'manufacturer', hozAlign: 'center' },
  { title: '상태일자', field: 'statusDate', hozAlign: 'center' },
  { title: '보급일자', field: 'deliveryDate', hozAlign: 'center' },
  { title: '지급일자', field: 'issuedDate', hozAlign: 'center' },
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

useBottomTabSetup({
  value: 'PC-LPO-0701',
  label: '장비관리',
  path: '/views/lpo/PC-LPO-0701',
  componentName: 'PcLpo0701',
  closable: true,
})
</script>