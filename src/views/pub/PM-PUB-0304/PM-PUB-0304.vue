<template>
  <PageHeader>
    <template #left>
      <PageTitle title="단체활동기록" />
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
          <SelectField v-model="groupTypeFilter" label="단체종류" :options="groupTypeFilterOptions" label-position="left" size="sm" triggerClass="w-32" />
          <SelectField v-model="groupFilter" label="단체명" :options="groupFilterOptions" label-position="left" size="sm" triggerClass="w-40" />
          <DatePicker v-model="dateFrom" label="활동일자" size="sm" inputClass="w-40" />
          <span aria-hidden="true">~</span>
          <DatePicker v-model="dateTo" size="sm" inputClass="w-40" />
        </div>
      </template>
      <template #btns>
        <Button variant="secondary" size="sm">조회</Button>
      </template>
    </SearchWrapper>


  <LayoutSplite :count="2" :widths="[54, 46]">
    <template #layout-1>
      <LayoutPanel title="단체활동기록 목록">
        <template #actions>
          <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
            <Download :size="16" aria-hidden="true" />
            엑셀다운로드
          </Button>
          <Button type="button" variant="primary" size="sm" class="w-20" @click="openNew">신규</Button>
        </template>
        <TabulatorGrid
          ref="gridRef"
          :columns="columns"
          :data="rows"
          select-mode="single"
          height="100%"
          min-height="40rem"
          placeholder="조회된 활동기록이 없습니다"
          show-pagination
          :items-per-page="10"
          @row-selection-changed="selectRow"
          class="flex-1"

        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="단체활동기록 상세">
        <template #actions>
          <template v-if="mode === 'edit'">
            <Button type="button" variant="tertiary2" size="sm" :disabled="form.id == null" @click="onDelete">삭제</Button>
            <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
          </template>
          <template v-else-if="form.id != null">
            <Button type="button" variant="tertiary2" size="sm" @click="onDelete">선택삭제</Button>
            <Button type="button" variant="primary" size="sm" @click="mode = 'edit'">수정</Button>
          </template>
        </template>
        <ScrollWrapper>
          <InfoTable :columns="2">
            <InfoField :for="mode === 'edit' ? 'activity-group' : undefined">
              <template #label>단체명<span v-if="mode === 'edit'" :class="infoStyles.requiredDot" /></template>
              <span v-if="mode === 'view'" class="readonly-text">{{ form.groupName }}</span>
              <SelectField
                v-else
                id="activity-group"
                v-model="groupIdOption"
                :options="store.groupOptions.value"
                size="sm"
                trigger-class="w-full"
                class=" flex-1"
                placeholder="선택"
              />
            </InfoField>
            <InfoField :for="mode === 'edit' ? 'activity-date' : undefined">
              <template #label>활동일자<span v-if="mode === 'edit'" :class="infoStyles.requiredDot" /></template>
              <span v-if="mode === 'view'" class="readonly-text">{{ form.date }}</span>
              <DatePicker v-else id="activity-date" v-model="form.date" size="sm" class=" flex-1" />
            </InfoField>

            <InfoField>
              <template #label>참여자수<span v-if="mode === 'edit'" :class="infoStyles.requiredDot" /></template>
              <span v-if="mode === 'view'" class="readonly-text">{{ form.participantCount }}</span>
              <Stepper v-else v-model="form.participantCount" :min="0" label="참여자수" />
            </InfoField>
            <InfoField :for="mode === 'edit' ? 'activity-type' : undefined">
              <template #label>활동종류<span v-if="mode === 'edit'" :class="infoStyles.requiredDot" /></template>
              <span v-if="mode === 'view'" class="readonly-text">{{ activityTypeText }}</span>
              <SelectField
                v-else
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
              <template #label>활동시간<span v-if="mode === 'edit'" :class="infoStyles.requiredDot" /></template>
              <span v-if="mode === 'view'" class="readonly-text">{{ form.timeFrom }} ~ {{ form.timeTo }}</span>
              <div v-else class="group-gap2">
                <SelectField v-model="form.timeFrom" :options="activityTimeOptions" size="sm" trigger-class="w-32" placeholder="시작" />
                <span aria-hidden="true">~</span>
                <SelectField v-model="form.timeTo" :options="activityTimeOptions" size="sm" trigger-class="w-32" placeholder="종료" />
              </div>
            </InfoField>

            <InfoField label="비고" full layout="column">
              <p v-if="mode === 'view'" class="lp-view-content">{{ form.note }}</p>
              <TextareaField v-else v-model="form.note" class="w-full " textarea-class="w-full" :height="90" />
            </InfoField>

            <InfoField label="활동지역" full layout="column">
              <span v-if="mode === 'view'" class="readonly-text">{{ fullAddress }}</span>
              <template v-else>
                <div class="group-gap2">
                  <InputField2 v-model="form.address" size="sm" placeholder="주소검색" readonly class=" flex-1" />
                  <Button type="button" variant="secondary" size="sm" @click="addressSearchOpen = true">주소검색</Button>
                </div>
                <InputField2 v-model="form.addressDetail" size="sm" placeholder="상세주소" class=" mt-2" />
              </template>
            </InfoField>

            <InfoField label="합동검거">
              <span v-if="mode === 'view'" class="readonly-text">{{ form.jointArrest }}</span>
              <InputField2 v-else v-model="form.jointArrest" size="sm" class=" flex-1" />
            </InfoField>
            <InfoField label="범죄신고">
              <span v-if="mode === 'view'" class="readonly-text">{{ form.crimeReport }}</span>
              <InputField2 v-else v-model="form.crimeReport" size="sm" class=" flex-1" />
            </InfoField>

            <InfoField label="주취자보호">
              <span v-if="mode === 'view'" class="readonly-text">{{ form.drunkProtection }}</span>
              <InputField2 v-else v-model="form.drunkProtection" size="sm" class=" flex-1" />
            </InfoField>
            <InfoField label="노약자보호">
              <span v-if="mode === 'view'" class="readonly-text">{{ form.elderlyProtection }}</span>
              <InputField2 v-else v-model="form.elderlyProtection" size="sm" class=" flex-1" />
            </InfoField>

            <InfoField label="안심귀가">
              <span v-if="mode === 'view'" class="readonly-text">{{ form.safeReturn }}</span>
              <InputField2 v-else v-model="form.safeReturn" size="sm" class=" flex-1" />
            </InfoField>
            <InfoField label="기타">
              <span v-if="mode === 'view'" class="readonly-text">{{ form.etcActivity }}</span>
              <InputField2 v-else v-model="form.etcActivity" size="sm" class=" flex-1" />
            </InfoField>
          </InfoTable>
        </ScrollWrapper>
      </LayoutPanel>
    </template>
  </LayoutSplite>

  <AddressSearchDialog v-model:open="addressSearchOpen" @select="onSelectAddress" />
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useDialog } from '@/composable/dialog/dialog'
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
import HelpButton from '@/components/custom/button/HelpButton.vue'
import ScrollWrapper from '@/components/custom/ScrollWrapper.vue'

import {
  usePublicSafetyStore,
  createEmptyActivityForm,
  groupTypeOptions,
  activityTypeOptions,
  activityTimeOptions,
  type ActivityListRow,
} from '../composable/publicSafety'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'

defineOptions({ name: 'PmPub0304' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '방범협력단체' },
  { label: '단체활동기록' },
]

const store = usePublicSafetyStore()
const dialog = useDialog()

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
  { title: '관서', field: 'dept', width: 200, hozAlign: 'center' },
  { title: '단체명', field: 'groupName', width: 200, hozAlign: 'center' },
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

/*
 * Figma(단체활동기록 상세, node 11329:138591): 목록에서 행을 클릭하면 값만 보여주는
 * 조회 상태가 먼저 뜨고, "수정" 버튼을 눌러야 지금까지 있던 입력 폼(편집 상태)이 나온다.
 * 지금까지는 입력 폼을 항상 보여주고 있었다 — 사용자 지정으로 조회/편집 모드를 나눈다.
 */
const mode = ref<'view' | 'edit'>('view')

const activityTypeText = computed(
  () => activityTypeOptions.find((o) => o.value === form.activityType)?.label ?? form.activityType,
)
const fullAddress = computed(() => [form.address, form.addressDetail].filter(Boolean).join(' '))

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
  mode.value = 'view'
}

function openNew() {
  Object.assign(form, createEmptyActivityForm())
  mode.value = 'edit'
}

async function onSave() {
  if (form.groupId == null || !form.date) {
    await dialog.alert({ title: '필수 항목을 입력해 주세요.', btnCancel: '확인' })
    return
  }
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return

  const saved = store.saveActivity(form)
  Object.assign(form, saved)
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  mode.value = 'view'
}

async function onDelete() {
  if (form.id == null) {
    await dialog.alert({ title: '삭제할 활동기록을 선택해 주세요.', btnCancel: '확인' })
    return
  }
  // 사용자 지정: 삭제 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 삭제)
  const result = await dialog.confirm({ title: '삭제하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  store.deleteActivity(form.id)
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
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
