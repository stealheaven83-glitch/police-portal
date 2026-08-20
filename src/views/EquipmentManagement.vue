<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { Tabs, TabsList, TabsTrigger } from '@/components/custom/tabs'
import { Button } from '@/components/custom/button'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
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
} from './equipment-management/useEquipmentList'
import type { EquipmentListRow } from './equipment-management/useEquipmentList'
import styles from './equipment-management/equipment.module.css'

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰', path: '/lpo' },
  { label: '장비관리' },
]

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

const listColumns = [
  { key: 'id', label: '번호', width: '7rem' },
  { key: 'typeLabel', label: '장비구분', width: '10rem' },
  { key: 'managementName', label: '장비관리명', width: '12rem' },
  { key: 'manufacturer', label: '차량제조사', width: '10rem' },
  { key: 'model', label: '차종명' },
  { key: 'plateNumber', label: '차량번호', width: '12rem' },
  { key: 'location', label: '배치장소', width: '12rem' },
  { key: 'note', label: '비고', width: '12rem' },
  { key: 'maintenance', label: '유지보수이력', width: '11rem' },
  { key: 'inUse', label: '사용여부', width: '9rem' },
  { key: 'updater', label: '수정자', width: '9rem' },
  { key: 'updatedAt', label: '수정일자', width: '11rem' },
]

/** 순찰차 외(오토바이/자전거)에는 없는 차량 전용 항목들 */
const isVehicleRestricted = computed(() => detail.vehicleType !== 'patrol')
const isPlateNumberDisabled = computed(() => isVehicleRestricted.value || detail.isSaved)

function onOpenRow(row: EquipmentListRow) {
  openDetail(row)
}

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
    <div :class="styles.deptGroup">
      <span class="text-[1.5rem] font-semibold text-[var(--Text-body_0)]">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </div>
    <button
      type="button"
      :class="styles.toggleButton"
      :aria-expanded="showAdvancedSearch"
      @click="showAdvancedSearch = !showAdvancedSearch"
    >
      상세조회 {{ showAdvancedSearch ? '닫기' : '열기' }}
      <ChevronDown :size="14" />
    </button>
  </div>

  <Tabs v-model="activeCategory" class="mt-4">
    <TabsList variant="fill" :grow="true">
      <TabsTrigger v-for="tab in categoryTabs" :key="tab.value" :value="tab.value">{{ tab.label }}</TabsTrigger>
    </TabsList>
  </Tabs>

  <div :class="styles.listActions">
    <Button type="button" variant="tertiary2" size="sm" @click="onPrint">인쇄</Button>
    <Button type="button" variant="primary" size="sm" @click="openNewDetail">신규</Button>
  </div>

  <div :class="styles.tableSection">
    <TableWrapper
      :columns="listColumns"
      :items="rowsByCategory"
      :show-pagination="false"
      empty-title="등록된 장비가 없습니다"
      empty-description="신규 버튼을 눌러 장비를 등록해 주세요."
    >
      <template #cell-managementName="{ item }">
        <button type="button" class="text-[var(--Base-primary)] hover:underline" @click="onOpenRow(item)">
          {{ item.managementName }}
        </button>
      </template>
      <template #cell-maintenance>
        <Button type="button" variant="tertiary2" size="xxs">보기</Button>
      </template>
      <template #cell-inUse="{ item }">
        {{ item.inUse ? '사용중' : '미사용' }}
      </template>
    </TableWrapper>
  </div>

  <!-- 기동장비 상세 -->
  <GenericDialog2 v-model:open="detailDialogOpen" title="기동장비 상세" :size="860" :show-close-button="false">
    <p :class="styles.legend">• 필수 입력 항목</p>

    <InfoTable :columns="1">
      <InfoField full>
        <template #label>기동장비 구분<span :class="styles.requiredDot" /></template>
        <RadioGroup v-model="detail.vehicleType" class="flex gap-6">
          <RadioGroupItem v-for="(label, value) in vehicleTypeLabel" :key="value" :value="value" :label="label" />
        </RadioGroup>
      </InfoField>

      <InfoField for="equip-plate-number">
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

      <InfoField full>
        <div class="grid w-full grid-cols-2 gap-x-6">
          <div class="flex items-center gap-3">
            <label class="w-[10rem] shrink-0 text-[1.5rem] font-semibold text-[var(--Text-body_0)]" for="equip-management-name">
              장비관리명<span :class="styles.requiredDot" />
            </label>
            <InputField2 id="equip-management-name" v-model="detail.managementName" size="sm" class="!space-y-0 flex-1" />
          </div>
          <div class="flex items-center gap-3">
            <label class="w-[10rem] shrink-0 text-[1.5rem] font-semibold text-[var(--Text-body_0)]" for="equip-car-type">
              차량유형<span :class="styles.requiredDot" />
            </label>
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
          </div>
        </div>
      </InfoField>

      <InfoField full>
        <div class="grid w-full grid-cols-2 gap-x-6">
          <div class="flex items-center gap-3">
            <label class="w-[10rem] shrink-0 text-[1.5rem] font-semibold text-[var(--Text-body_0)]" for="equip-location">
              배치장소<span :class="styles.requiredDot" />
            </label>
            <SelectField
              id="equip-location"
              v-model="detail.location"
              :options="locationOptions"
              size="sm"
              trigger-class="w-full"
              class="!space-y-0 flex-1"
              placeholder="선택"
            />
          </div>
          <div class="flex items-center gap-3">
            <label class="w-[10rem] shrink-0 text-[1.5rem] font-semibold text-[var(--Text-body_0)]" for="equip-manufacturer">
              차량제조사<span :class="styles.requiredDot" />
            </label>
            <InputField2
              id="equip-manufacturer"
              v-model="detail.manufacturer"
              size="sm"
              class="!space-y-0 flex-1"
              :disabled="isVehicleRestricted"
            />
          </div>
        </div>
      </InfoField>

      <InfoField full>
        <div class="grid w-full grid-cols-2 gap-x-6">
          <div class="flex items-center gap-3">
            <label class="w-[10rem] shrink-0 text-[1.5rem] font-semibold text-[var(--Text-body_0)]" for="equip-model">
              차종명<span :class="styles.requiredDot" />
            </label>
            <InputField2 id="equip-model" v-model="detail.model" size="sm" class="!space-y-0 flex-1" />
          </div>
          <div class="flex items-center gap-3">
            <label class="w-[10rem] shrink-0 text-[1.5rem] font-semibold text-[var(--Text-body_0)]" for="equip-year">
              차량연식<span :class="styles.requiredDot" />
            </label>
            <InputField2
              id="equip-year"
              v-model="detail.year"
              size="sm"
              class="!space-y-0 flex-1"
              :disabled="isVehicleRestricted"
            />
          </div>
        </div>
      </InfoField>

      <InfoField for="equip-info112" label="112차량정보">
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

      <InfoField label="임시차량">
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
      <Button type="button" variant="tertiary2" size="md" @click="detailDialogOpen = false">닫기</Button>
      <Button type="button" variant="tertiary2" size="md" :disabled="detail.id == null" @click="deleteDetail">삭제</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
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
