<template>
  <PageHeader>
    <template #left>
      <PageTitle title="정신응급대응팀" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <SearchWrapper no-background>
    <template #form>
      <div class="search-area">
        <SelectField
          v-model="regionFilter"
          label="지역"
          :options="regionFilterOptions"
          placeholder="선택"
          size="sm"
          trigger-class="w-40"
        />
        <SelectField
          v-model="centerFilter"
          label="센터명"
          :options="centerFilterOptions"
          placeholder="선택"
          size="sm"
          trigger-class="w-50"
        />
      </div>
    </template>
  </SearchWrapper>

  <LayoutSplite :count="2" :widths="[55, 45]">
    <template #layout-1>
      <!-- 기획서 [2-1] 저장 결과가 반영되는 목록 -->
      <LayoutPanel title="정신응급대응팀">
        <template #actions>
          <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSelected">선택삭제</Button>
          <Button type="button" variant="primary" size="sm" @click="onNew">신규</Button>
        </template>
        <!--
          체크박스 다중선택(선택삭제)과 행 클릭(우측 상세)이 따로 논다 — PM-PUB-0414 와 같은 형태.
          지금 상세에 떠 있는 행은 lp-grid-active-row 로 강조한다(체크 여부와 별개).
        -->
        <TabulatorGrid
          ref="gridRef"
          class="flex-1"
          :columns="columns"
          :data="rows"
          select-mode="checkbox"
          height="100%"
          min-height="40rem"
          :row-class="(row: any) => (row.id === activeId ? 'lp-grid-active-row' : undefined)"
          placeholder="등록된 정신응급대응팀 센터가 없습니다"
          show-pagination
          :items-per-page="10"
          @row-click="onRowClick"
          @row-selection-changed="selectedCount = $event.length"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="상세정보">
        <template #actions>
          <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
        </template>
        <!-- 기획서 [1] 지역 선택범위: 18개 지역 (폼 컴포넌트 안) -->
        <MentalCenterDetailForm :form="form" id-prefix="mental-new" />
      </LayoutPanel>
    </template>
  </LayoutSplite>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { Button } from '@/components/custom/button'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import MentalCenterDetailForm from '../components/MentalCenterDetailForm.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import {
  useMentalCenterStore,
  createEmptyCenterForm,
  regionFilterOptions,
  regionLabel,
  formatPhone,
  isValidCenterName,
  type MentalCenterRow,
} from '../composable/mentalEmergency'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!) — useBottomTabSetup 의 componentName 과 일치해야 한다.
defineOptions({ name: 'PcPub0415' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '보호조치대응팀' },
  { label: '정신응급대응팀' },
]

const store = useMentalCenterStore()

/* ── 검색 (좌측 목록은 PM-PUB-0414 와 같은 목록이다) ───────────────────── */
const regionFilter = ref('all')
const centerFilter = ref('all')

/** 선택된 지역의 센터목록만 노출 */
const centerFilterOptions = computed(() => [
  { label: '전체', value: 'all' },
  ...store.centers.value
    .filter((center) => regionFilter.value === 'all' || center.region === regionFilter.value)
    .map((center) => ({ label: center.name, value: String(center.id) })),
])

watch(regionFilter, () => {
  centerFilter.value = 'all'
})

const rows = computed(() =>
  store.centers.value.filter((center) => {
    if (regionFilter.value !== 'all' && center.region !== regionFilter.value) return false
    if (centerFilter.value !== 'all' && String(center.id) !== centerFilter.value) return false
    return true
  }),
)

/* ── 목록 ─────────────────────────────────────────────────────────────── */
const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
/** 체크된 행 수 — 선택삭제 전에 0건이면 막는다 */
const selectedCount = ref(0)
/** 지금 우측 상세에 떠 있는 행의 id(없으면 null) */
const activeId = ref<number | null>(null)

const columns: TabulatorGridColumn[] = [
  { title: 'NO', field: 'id', width: 70, hozAlign: 'center' },
  { title: '지역', field: 'region', width: 100, hozAlign: 'center', formatter: (cell: any) => regionLabel(cell.getValue()) },
  { title: '센터명', field: 'name', widthGrow: 2, hozAlign: 'left' },
  { title: '연락처', field: 'phone1', hozAlign: 'center', formatter: (cell: any) => formatPhone(cell.getRow().getData()) },
  { title: '병상수', field: 'bedTotal', width: 90, hozAlign: 'center' },
]

/* ── 상세 / 등록 ──────────────────────────────────────────────────────── */
const form = reactive(createEmptyCenterForm())

function fillForm(row: MentalCenterRow | null) {
  Object.assign(form, row ? { ...row } : createEmptyCenterForm())
  activeId.value = row?.id ?? null
}

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §5) */
function onRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as MentalCenterRow
  fillForm(data)
}

/** 신규 — 별도 화면으로 가지 않고 우측 상세정보를 빈 폼으로 비운다(PM-PUB-0414 와 같은 방식) */
function onNew() {
  fillForm(null)
}

/** 기획서 [2] 저장하면 좌측 목록(2-1)에 바로 반영된다(도메인 싱글턴 스토어를 두 화면이 공유) */
async function onSave() {
  if (!form.region || !form.name.trim()) {
    await dialog.alert({ title: '필수 항목을 입력해 주세요.', btnCancel: '확인' })
    return
  }
  // 기획서 "※ 센터명에 언더바를 제외한 특수문자 사용은 불가합니다"
  if (!isValidCenterName(form.name)) {
    await dialog.alert({ title: '센터명에 언더바(_)를 제외한 특수문자는 사용할 수 없습니다.', btnCancel: '확인' })
    return
  }
  // id 가 없으면 신규, 있으면 수정. 저장된 건이 그대로 상세에 남는다
  const id = store.saveCenter(form)
  form.id = id
  activeId.value = id
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
}

/** 선택삭제 — 체크된 행을 스토어에서 지운다. 상세에 떠 있던 행이 지워지면 폼도 비운다 */
async function onDeleteSelected() {
  if (!selectedCount.value) {
    await dialog.alert({ title: '삭제할 센터를 선택해 주세요.', btnCancel: '확인' })
    return
  }
  const selected = (gridRef.value?.getSelectedData() ?? []) as MentalCenterRow[]
  selected.forEach((row) => store.deleteCenter(row.id))
  if (activeId.value != null && selected.some((row) => row.id === activeId.value)) fillForm(null)
  selectedCount.value = 0
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

// items[4] = '보호조치 대응팀' > '정신 응급 대응팀' (등록은 LNB 항목이 따로 없다)
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 4, activeChild: '정신 응급 대응팀' })

useBottomTabSetup({
  value: 'PC-PUB-0415',
  label: '정신응급대응팀 등록',
  path: '/views/pub/PC-PUB-0415',
  componentName: 'PcPub0415',
  closable: true,
})
</script>
