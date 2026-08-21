<script setup lang="ts">
import { computed, createApp, h, onBeforeUnmount, onMounted, ref, watch, type App } from 'vue'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator.min.css'
import '@/assets/css/tabulator-theme.css'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { Tabs, TabsList, TabsTrigger } from '@/components/custom/tabs'
import { Button } from '@/components/custom/button'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
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
} from './PC-LPO-0701'
import type { EquipmentListRow } from './PC-LPO-0701'
import styles from './PC-LPO-0701.module.css'

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

/** 장비 목록 그리드 — TableWrapper 대신 tabulator-tables 라이브러리를 직접 사용 */
const gridEl = ref<HTMLElement | null>(null)
let table: any = null

/**
 * Tabulator 포맷터는 Vue 렌더 트리 밖에서 DOM 을 직접 만들어야 해서, 버튼처럼 보이는
 * <button> 을 새로 그리는 대신 실제 custom/button Button 컴포넌트를 셀마다 별도 Vue 앱으로
 * 마운트한다 (WorkerSelectDialog.vue 의 체크박스 셀과 같은 방식).
 */
const mountedCellApps: App[] = []

function unmountCellApps() {
  mountedCellApps.forEach((app) => app.unmount())
  mountedCellApps.length = 0
}

function mountCellComponent(component: unknown, props: Record<string, unknown>, slot?: () => unknown) {
  const container = document.createElement('div')
  const app = createApp({
    render: () => h(component as any, props, slot),
  })
  app.mount(container)
  mountedCellApps.push(app)
  return container
}

function mountCellButton(props: Record<string, unknown>, label: string) {
  return mountCellComponent(Button, props, () => label)
}

const gridColumns: any[] = [
  { title: '번호', field: 'id', width: 70, hozAlign: 'center', headerSort: false },
  { title: '장비구분', field: 'typeLabel', width: 100, hozAlign: 'center', headerSort: false },
  {
    title: '장비관리명',
    field: 'managementName',
    width: 130,
    hozAlign: 'center',
    headerSort: false,
    formatter(cell: any) {
      const row = cell.getRow().getData() as EquipmentListRow
      return mountCellButton(
        { type: 'button', variant: 'link', size: 'xxs', onClick: () => onOpenRow(row) },
        String(cell.getValue()),
      )
    },
  },
  { title: '차량제조사', field: 'manufacturer', width: 100, hozAlign: 'center', headerSort: false },
  { title: '차종명', field: 'model', minWidth: 120, hozAlign: 'center', headerSort: false },
  { title: '차량번호', field: 'plateNumber', width: 130, hozAlign: 'center', headerSort: false },
  { title: '배치장소', field: 'location', width: 130, hozAlign: 'center', headerSort: false },
  { title: '비고', field: 'note', width: 130, hozAlign: 'center', headerSort: false },
  {
    title: '유지보수이력',
    field: 'id',
    width: 110,
    hozAlign: 'center',
    headerSort: false,
    formatter() {
      return mountCellButton({ type: 'button', variant: 'tertiary', size: 'xs', class: 'h-9 w-12.5' }, '보기')
    },
  },
  {
    title: '사용여부',
    field: 'inUse',
    width: 90,
    hozAlign: 'center',
    headerSort: false,
    formatter: (cell: any) => (cell.getValue() ? '사용중' : '미사용'),
  },
  { title: '수정자', field: 'updater', width: 90, hozAlign: 'center', headerSort: false },
  { title: '수정일자', field: 'updatedAt', width: 120, hozAlign: 'center', headerSort: false },
  // {
  //   // 디자인엔 없는 실험용 컬럼 — DatePicker 도 h()+createApp() 으로 진짜 컴포넌트를 마운트할 수
  //   // 있는지 확인하는 용도. DatePicker 는 modelValue 바인딩이 실제로 안 이어져 있는 기존 버그가
  //   // 있어서(내부 pickerValue 가 로컬 상태), 여기 넣어도 행 데이터 값은 표시/반영되지 않는다.
  //   title: '날짜테스트',
  //   field: 'updatedAt',
  //   width: 170,
  //   hozAlign: 'center',
  //   headerSort: false,
  //   formatter(cell: any) {
  //     return mountCellComponent(DatePicker, { modelValue: cell.getValue(), size: 'sm' })
  //   },
  // },
]

onMounted(() => {
  if (!gridEl.value) return
  table = new Tabulator(gridEl.value, {
    data: rowsByCategory.value,
    columns: gridColumns,
    layout: 'fitColumns',
    height: 'auto',
    placeholder: '등록된 장비가 없습니다',
  })
})

watch(rowsByCategory, (rows) => {
  unmountCellApps()
  table?.setData(rows)
})

onBeforeUnmount(() => {
  unmountCellApps()
  table?.destroy()
  table = null
})

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

  <div :class="styles.tableSection">
    <div ref="gridEl" class="tabulator-host" />
  </div>

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
