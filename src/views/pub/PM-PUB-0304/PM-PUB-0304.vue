<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import Stepper from '@/components/custom/input/Stepper.vue'
import { Button } from '@/components/custom/button'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import AddressSearchDialog from '../components/AddressSearchDialog.vue'
import {
  usePublicSafetyStore,
  createEmptyActivityForm,
  groupTypeOptions,
  activityTypeOptions,
  activityTimeOptions,
  type ActivityListRow,
} from '../composable/publicSafety'
import styles from './style/PM-PUB-0304.module.css'

defineOptions({ name: 'PmPub0304' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '방범협력단체' },
  { label: '단체활동기록' },
]

const store = usePublicSafetyStore()

const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
const groupTypeFilter = ref('all')
const groupFilter = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const advancedSearchOpen = ref(false)

const groupTypeFilterOptions = [{ label: '전체', value: 'all' }, ...groupTypeOptions]
const groupFilterOptions = computed(() => [{ label: '전체', value: 'all' }, ...store.groupOptions.value])

const rows = computed(() => {
  return store.activities.value.filter((a) => {
    if (groupTypeFilter.value !== 'all' && a.groupType !== groupTypeFilter.value) return false
    if (groupFilter.value !== 'all' && String(a.groupId) !== groupFilter.value) return false
    if (dateFrom.value && a.date < dateFrom.value) return false
    if (dateTo.value && a.date > dateTo.value) return false
    return true
  })
})

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 60, hozAlign: 'center' },
  { title: '활동일자', field: 'date', hozAlign: 'center' },
  { title: '관서', field: 'dept', hozAlign: 'center' },
  { title: '단체명', field: 'groupName', hozAlign: 'center' },
  { title: '단체종류', field: 'groupType', hozAlign: 'center', formatter: (cell: any) => groupTypeLabel(cell.getRow().getData()) },
  { title: '활동종류', field: 'activityType', hozAlign: 'center', formatter: (cell: any) => activityTypeLabel(cell.getRow().getData()) },
  { title: '참여자수', field: 'participantCount', hozAlign: 'center' },
]

function groupTypeLabel(row: ActivityListRow) {
  return groupTypeOptions.find((o) => o.value === row.groupType)?.label ?? row.groupType
}
function activityTypeLabel(row: ActivityListRow) {
  return activityTypeOptions.find((o) => o.value === row.activityType)?.label ?? row.activityType
}

const form = reactive(createEmptyActivityForm())
const addressSearchOpen = ref(false)

/** SelectField 는 문자열 value 를 쓰는데 groupId 는 number|null 이라 폼-셀렉트 사이에서 문자열로 변환해준다 */
const groupIdOption = computed<string>({
  get: () => (form.groupId != null ? String(form.groupId) : ''),
  set: (value) => {
    form.groupId = value ? Number(value) : null
  },
})

/**
 * TabulatorGrid 의 row-selection-changed 는 데이터가 아니라 Tabulator RowComponent 를
 * 그대로 내보낸다(래퍼 자체 특성 — PM-PUB-0101 도 동일). 그래서 실제 필드 값은
 * row.getData() 로 꺼내야 하고, 혹시 순수 데이터가 오는 경우까지 함께 방어한다.
 */
function selectRow(rowsSelected: any[]) {
  const row = rowsSelected[0]
  const data = row && typeof row.getData === 'function' ? row.getData() : row
  Object.assign(form, data ? { ...data } : createEmptyActivityForm())
}

function openNew() {
  Object.assign(form, createEmptyActivityForm())
}

function onSave() {
  if (form.groupId == null || !form.date) {
    toast.warning('필수 항목을 입력해 주세요.')
    return
  }
  const saved = store.saveActivity(form)
  Object.assign(form, saved)
  toast.success('저장되었습니다.')
}

function onDelete() {
  if (form.id == null) return
  store.deleteActivity(form.id)
  toast.success('삭제되었습니다.')
  openNew()
}

function onSelectAddress(address: string) {
  form.address = address
}

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `단체활동기록_${today}.csv`)
}

useSideMenuSetup({ ...publicSafetyMenu, activeChild: '단체활동기록', openIndex: 2 })

useBottomTabSetup({
  value: 'PM-PUB-0304',
  label: '단체활동기록',
  path: '/views/pub/PM-PUB-0304',
  componentName: 'PmPub0304',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="단체활동기록" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <div :class="styles.searchArea">
    <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
      <template #department>
        <span class="dept-name">부서</span>
        <DepartmentCascadeSelect v-model="department" size="sm" />
      </template>
      <template #form>
        <div class="search-area">
          <SelectField v-model="groupTypeFilter" label="단체종류" :options="groupTypeFilterOptions" label-position="left" size="sm" triggerClass="w-32" />
          <SelectField v-model="groupFilter" label="단체명" :options="groupFilterOptions" label-position="left" size="sm" triggerClass="w-40" />
          <DatePicker v-model="dateFrom" label="활동일자" size="sm" inputClass="w-40" />
          <span aria-hidden="true">~</span>
          <DatePicker v-model="dateTo" size="sm" inputClass="w-40" />
        </div>
      </template>
      <template #btns>
        <Button variant="secondary" size="sm" class="w-25">조회</Button>
      </template>
    </SearchWrapper>
  </div>

  <LayoutSplite :count="2" :widths="[45, 55]">
    <template #layout-1>
      <LayoutPanel title="단체활동기록 목록">
        <template #actions>
          <Button type="button" variant="tertiary2" size="sm" @click="onDownloadExcel">
            <Download :size="16" aria-hidden="true" />
            엑셀다운로드
          </Button>
          <Button type="button" variant="primary" size="sm" class="w-20" @click="openNew">신규</Button>
        </template>
        <TabulatorGrid
          ref="gridRef"
          :class="styles.panelGrid"
          :columns="columns"
          :data="rows"
          select-mode="single"
          height="100%"
          min-height="40rem"
          placeholder="조회된 활동기록이 없습니다"
          show-pagination
          :items-per-page="10"
          @row-selection-changed="selectRow"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="단체활동기록 상세">
        <template #actions>
          <Button type="button" variant="tertiary2" size="sm" :disabled="form.id == null" @click="onDelete">삭제</Button>
          <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
        </template>

        <InfoTable :columns="2">
          <InfoField for="activity-group">
            <template #label>단체명<span :class="styles.requiredDot" /></template>
            <SelectField
              id="activity-group"
              v-model="groupIdOption"
              :options="store.groupOptions.value"
              size="sm"
              trigger-class="w-full"
              class="!space-y-0 flex-1"
              placeholder="선택"
            />
          </InfoField>
          <InfoField for="activity-date">
            <template #label>활동일자<span :class="styles.requiredDot" /></template>
            <DatePicker id="activity-date" v-model="form.date" size="sm" class="!space-y-0 flex-1" />
          </InfoField>

          <InfoField>
            <template #label>참여자수<span :class="styles.requiredDot" /></template>
            <Stepper v-model="form.participantCount" :min="0" label="참여자수" />
          </InfoField>
          <InfoField for="activity-type">
            <template #label>활동종류<span :class="styles.requiredDot" /></template>
            <SelectField
              id="activity-type"
              v-model="form.activityType"
              :options="activityTypeOptions"
              size="sm"
              trigger-class="w-full"
              class="!space-y-0 flex-1"
              placeholder="선택"
            />
          </InfoField>

          <InfoField full>
            <template #label>활동시간<span :class="styles.requiredDot" /></template>
            <div :class="styles.row">
              <SelectField v-model="form.timeFrom" :options="activityTimeOptions" size="sm" trigger-class="w-32" placeholder="시작" />
              <span aria-hidden="true">~</span>
              <SelectField v-model="form.timeTo" :options="activityTimeOptions" size="sm" trigger-class="w-32" placeholder="종료" />
            </div>
          </InfoField>

          <InfoField label="비고" full layout="column">
            <TextareaField v-model="form.note" class="w-full !space-y-0" textarea-class="w-full" :height="90" />
          </InfoField>

          <InfoField label="활동지역" full layout="column">
            <div :class="styles.row">
              <InputField2 v-model="form.address" size="sm" placeholder="주소검색" readonly class="!space-y-0 flex-1" />
              <Button type="button" variant="secondary" size="sm" @click="addressSearchOpen = true">주소검색</Button>
            </div>
            <InputField2 v-model="form.addressDetail" size="sm" placeholder="상세주소" class="!space-y-0 mt-2" />
          </InfoField>

          <InfoField label="합동검거">
            <InputField2 v-model="form.jointArrest" size="sm" class="!space-y-0 flex-1" />
          </InfoField>
          <InfoField label="범죄신고">
            <InputField2 v-model="form.crimeReport" size="sm" class="!space-y-0 flex-1" />
          </InfoField>

          <InfoField label="주취자보호">
            <InputField2 v-model="form.drunkProtection" size="sm" class="!space-y-0 flex-1" />
          </InfoField>
          <InfoField label="노약자보호">
            <InputField2 v-model="form.elderlyProtection" size="sm" class="!space-y-0 flex-1" />
          </InfoField>

          <InfoField label="안심귀가">
            <InputField2 v-model="form.safeReturn" size="sm" class="!space-y-0 flex-1" />
          </InfoField>
          <InfoField label="기타">
            <InputField2 v-model="form.etcActivity" size="sm" class="!space-y-0 flex-1" />
          </InfoField>
        </InfoTable>
      </LayoutPanel>
    </template>
  </LayoutSplite>

  <AddressSearchDialog v-model:open="addressSearchOpen" @select="onSelectAddress" />
</template>
