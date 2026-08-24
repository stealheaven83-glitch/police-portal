<script setup lang="ts">
import { computed, ref } from 'vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { Tabs, TabsList, TabsTrigger } from '@/components/custom/tabs'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import {
  useEquipmentList,
  categoryTabs,
  vehicleTypeLabel,
  carTypeOptions,
  locationOptions,
  info112Options,
} from './composable/PC-LPO-0701'
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

const {
  activeCategory,
  showAdvancedSearch,
  rowsByCategory,
  detail,
  detailDialogOpen,
  openNewDetail,
  openDetail,
  saveDetail,
  deleteDetail,
  vehicle112DialogOpen,
  vehicle112Keyword,
  vehicle112Rows,
  selectedVehicle112Id,
  openVehicle112Dialog,
  searchVehicle112,
  assignVehicle112,
} = useEquipmentList()

/** 순찰차 외(오토바이/자전거)에는 없는 차량 전용 항목들 */
const isVehicleRestricted = computed(() => detail.vehicleType !== 'patrol')
const isPlateNumberDisabled = computed(() => isVehicleRestricted.value || detail.isSaved)

function onOpenRow(row: EquipmentListRow) {
  openDetail(row)
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
 */
const gridColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '장비구분', field: 'typeLabel', hozAlign: 'center' },
  {
    title: '장비관리명',
    field: 'managementName',
    hozAlign: 'center',
    cellType: 'button',
    buttonVariant: 'link',
    buttonSize: 'xxs',
    // 버튼 텍스트가 곧 셀 값이다
    buttonLabel: (row) => String((row as EquipmentListRow).managementName),
    onButtonClick: (row) => onOpenRow(row as EquipmentListRow),
  },
  { title: '차량제조사', field: 'manufacturer', hozAlign: 'center' },
  { title: '차종명', field: 'model', hozAlign: 'center' },
  { title: '차량번호', field: 'plateNumber', hozAlign: 'center' },
  { title: '배치장소', field: 'location', hozAlign: 'center' },
  { title: '비고', field: 'note', hozAlign: 'center' },
  {
    title: '유지보수이력',
    field: 'id',
    hozAlign: 'center',
    cellType: 'button',
    buttonVariant: 'tertiary',
    buttonSize: 'xs',
    buttonClass: 'h-9 w-12.5',
    buttonLabel: '보기',
  },
  {
    title: '사용여부',
    field: 'inUse',
    hozAlign: 'center',
    formatter: (cell: any) => (cell.getValue() ? '사용중' : '미사용'),
  },
  { title: '수정자', field: 'updater', hozAlign: 'center' },
  { title: '수정일자', field: 'updatedAt', hozAlign: 'center' },
]

function onPrint() {
  window.print()
}

function onSave() {
  saveDetail()
  toast.success('저장되었습니다.')
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
    <Button type="button" variant="primary" size="sm" class="w-25">신규</Button>
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

  <!-- 기동장비 상세 -->
  <GenericDialog2 v-model:open="detailDialogOpen" title="기동장비 상세" :size="800" :show-close-button="true">
    <p :class="styles.legend">• 필수 입력 항목</p>

    <InfoTable :columns="2">
      <InfoField full>
        <template #label>기동장비 구분<span :class="styles.requiredDot" /></template>
        <RadioGroup v-model="detail.vehicleType" class="flex gap-6">
          <RadioGroupItem v-for="(label, value) in vehicleTypeLabel" :key="value" :value="value" :label="label" />
        </RadioGroup>
      </InfoField>

      <InfoField for="equip-plate-number" full>
        <template #label>차량번호<span :class="styles.requiredDot" /></template>
        <InputField2
          id="equip-plate-number"
          v-model="detail.plateNumber"
          size="sm"
          class="!space-y-0 flex-1"
          :disabled="isPlateNumberDisabled"
        />
        <span v-if="!isVehicleRestricted && !detail.isSaved" :class="styles.hint">저장 이후에는 차량번호는 수정할 수 없습니다.</span>
      </InfoField>

      <!-- 아래 3쌍은 InfoTable columns=2 의 2열 자동배치를 그대로 써서 한 행에 라벨+값 두 쌍이 나란히 놓인다 -->
      <InfoField for="equip-management-name">
        <template #label>장비관리명<span :class="styles.requiredDot" /></template>
        <InputField2 id="equip-management-name" v-model="detail.managementName" size="sm" class="!space-y-0 flex-1" />
      </InfoField>
      <InfoField for="equip-car-type">
        <template #label>차량유형<span :class="styles.requiredDot" /></template>
        <SelectField
          id="equip-car-type"
          v-model="detail.carType"
          :options="carTypeOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
          :disabled="isVehicleRestricted"
        />
      </InfoField>

      <InfoField for="equip-location">
        <template #label>배치장소<span :class="styles.requiredDot" /></template>
        <SelectField
          id="equip-location"
          v-model="detail.location"
          :options="locationOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>
      <InfoField for="equip-manufacturer">
        <template #label>차량제조사<span :class="styles.requiredDot" /></template>
        <InputField2
          id="equip-manufacturer"
          v-model="detail.manufacturer"
          size="sm"
          class="!space-y-0 flex-1"
          :disabled="isVehicleRestricted"
        />
      </InfoField>

      <InfoField for="equip-model">
        <template #label>차종명<span :class="styles.requiredDot" /></template>
        <InputField2 id="equip-model" v-model="detail.model" size="sm" class="!space-y-0 flex-1" />
      </InfoField>
      <InfoField for="equip-year">
        <template #label>차량연식<span :class="styles.requiredDot" /></template>
        <InputField2
          id="equip-year"
          v-model="detail.year"
          size="sm"
          class="!space-y-0 flex-1"
          :disabled="isVehicleRestricted"
        />
      </InfoField>

      <InfoField for="equip-info112" label="112차량정보" full>
        <SelectField
          id="equip-info112"
          v-model="detail.info112"
          :options="info112Options"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택하세요"
          :disabled="isVehicleRestricted"
        />
      </InfoField>

      <InfoField label="임시차량" full>
        <div :class="styles.tempVehicleRow">
          <InputField2 v-model="detail.tempVehicle" size="sm" class="!space-y-0 flex-1" readonly :disabled="isVehicleRestricted" />
          <Button type="button" variant="secondary" size="sm" :disabled="isVehicleRestricted" @click="openVehicle112Dialog">
            차량조회
          </Button>
        </div>
      </InfoField>

      <InfoField label="비고" full layout="column">
        <TextareaField v-model="detail.note" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" class="w-25" variant="tertiary2" size="md" @click="detailDialogOpen = false">닫기</Button>
      <Button type="button" class="w-25" variant="tertiary2" size="md" :disabled="detail.id == null" @click="deleteDetail">삭제</Button>
      <Button type="button" class="w-25" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>

  <!-- 112차량 조회 -->
  <GenericDialog2 v-model:open="vehicle112DialogOpen" title="112차량 조회" :size="560" :show-close-button="false">
    <div :class="styles.searchRow">
      <label class="shrink-0 text-[1.4rem] text-[var(--Text-body_1)]" for="vehicle112-keyword">출동요소명</label>
      <InputField2
        id="vehicle112-keyword"
        v-model="vehicle112Keyword"
        size="sm"
        :class="styles.searchInput"
        @keyup.enter="searchVehicle112"
      />
      <Button type="button" variant="secondary" size="sm" @click="searchVehicle112">조회</Button>
    </div>

    <div :class="styles.vehicleTableWrap">
      <table :class="styles.vehicleTable">
        <caption class="sr-only">112차량 조회 결과 — 번호, 부서명, 순마명</caption>
        <thead>
          <tr>
            <th scope="col">번호</th>
            <th scope="col">부서명</th>
            <th scope="col">순마명</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in vehicle112Rows"
            :key="row.id"
            :class="[styles.vehicleRow, selectedVehicle112Id === row.id && styles.vehicleRowSelected]"
            tabindex="0"
            role="button"
            :aria-pressed="selectedVehicle112Id === row.id"
            @click="selectedVehicle112Id = row.id"
            @keydown.enter="selectedVehicle112Id = row.id"
          >
            <td>{{ row.id }}</td>
            <td>{{ row.deptName }}</td>
            <td>{{ row.patrolName }}</td>
          </tr>
          <tr v-if="!vehicle112Rows.length">
            <td colspan="3" class="py-10 text-center text-[var(--Text-body_disable)]">검색 결과가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="vehicle112DialogOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" :disabled="selectedVehicle112Id == null" @click="assignVehicle112">
        차량지정
      </Button>
    </template>
  </GenericDialog2>
</template>
