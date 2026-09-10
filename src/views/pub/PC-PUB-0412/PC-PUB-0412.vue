<template>
  <PageHeader>
    <template #left>
      <PageTitle title="주취자센터관리" />
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
          trigger-class="w-70"
        />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <LayoutSplite :count="2" :widths="[55, 45]">
    <template #layout-1>
      <LayoutPanel title="주취자센터관리">
        <template #actions>
          <Button type="button" variant="primary" size="sm" @click="onNew">등록</Button>
        </template>
        <TabulatorGrid
          ref="gridRef"
          class="flex-1"
          :columns="columns"
          :data="rows"
          select-mode="single"
          height="100%"
          min-height="40rem"
          placeholder="등록된 주취자센터가 없습니다"
          show-pagination
          :items-per-page="10"
          @row-selection-changed="onRowSelectionChanged"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="주취자센터관리 등록">
        <template #actions>
          <!-- 삭제는 목록에서 고른 기존 건(id 있음)에만 보인다. '등록'으로 비운 신규 폼에는 없다 -->
          <Button v-if="form.id != null" type="button" variant="tertiary2" size="sm">삭제</Button>
          <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
        </template>
        <DrunkCenterDetailForm :form="form" id-prefix="center-new" />

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
import DrunkCenterDetailForm from '../components/DrunkCenterDetailForm.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
<<<<<<< Updated upstream
=======
import { useDialog } from '@/composable/dialog/dialog'
>>>>>>> Stashed changes
import {
  useDrunkCenterStore,
  createEmptyCenterForm,
  regionFilterOptions,
  regionLabel,
  formatPhone,
  type DrunkCenterRow,
} from '../composable/drunkCenter'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

const dialog = useDialog()

// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!) — useBottomTabSetup 의 componentName 과 일치해야 한다.
defineOptions({ name: 'PcPub0412' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '보호조치대응팀' },
  { label: '주취자센터관리' },
]

const store = useDrunkCenterStore()

/* ── 검색 (좌측 목록은 PM-PUB-0411 과 같은 목록이다) ───────────────────── */
const regionFilter = ref('all')
const centerFilter = ref('all')

/** 기획서 [1] 선택된 지역의 센터목록만 노출 */
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

const columns: TabulatorGridColumn[] = [
  { title: 'NO', field: 'id', width: 70, hozAlign: 'center' },
  { title: '지역', field: 'region', width: 100, hozAlign: 'center', formatter: (cell: any) => regionLabel(cell.getValue()) },
  { title: '센터명', field: 'name', widthGrow: 2, hozAlign: 'left' },
  { title: '연락처', field: 'phone1', hozAlign: 'center', formatter: (cell: any) => formatPhone(cell.getRow().getData()) },
  { title: '총 병상 수', field: 'bedTotal', width: 110, hozAlign: 'center' },
]

/* ── 등록 ─────────────────────────────────────────────────────────────── */
const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const form = reactive(createEmptyCenterForm())

function fillForm(row: DrunkCenterRow | null) {
  Object.assign(form, row ? { ...row } : createEmptyCenterForm())
}

/**
 * 목록 행을 클릭하면 우측 등록 폼에 그 행을 싣는다(id 가 실리므로 저장은 수정으로 동작).
 * select-mode="single" 이라 선택 행은 0건 아니면 1건이고, 이벤트는 데이터가 아니라
 * Tabulator RowComponent 를 넘기므로 getData() 로 꺼낸다 — CLAUDE.md §5.
 */
function onRowSelectionChanged(selected: any[]) {
  const first = selected[0]
  const row: DrunkCenterRow | undefined =
    first && typeof first.getData === 'function' ? first.getData() : first
  fillForm(row ?? null)
}

/** 폼을 비울 때 목록의 선택 표시도 같이 지운다 — 빈 폼인데 행만 강조돼 있으면 어긋나 보인다 */
function resetForm() {
  gridRef.value?.deselectAll()
  fillForm(null)
}

/** 기획서 [2] 저장하면 좌측 목록에 바로 반영된다(도메인 싱글턴 스토어를 두 화면이 공유) */
async function onSave() {
  if (!form.region || !form.name.trim()) {
    await dialog.alert({ title: '필수 항목을 입력해 주세요.', btnCancel: '확인' })
    return
  }
  store.saveCenter(form)
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  // 연속 등록을 위해 폼을 비운다
  resetForm()
}

/**
 * 목록 패널의 '등록' — PM-PUB-0411 에서 넘어와도 같은 자리에 버튼이 그대로 보이게 둔다.
 * 이 화면이 이미 등록 화면이라 이동 대신 우측 폼만 새로 비운다.
 */
function onNew() {
  resetForm()
}

// items[4] = '보호조치 대응팀' > '주취자 센터관리' (등록은 LNB 항목이 따로 없다)
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 4, activeChild: '주취자 센터관리' })

useBottomTabSetup({
  value: 'PC-PUB-0412',
  label: '주취자센터 등록',
  path: '/views/pub/PC-PUB-0412',
  componentName: 'PcPub0412',
  closable: true,
})
</script>
