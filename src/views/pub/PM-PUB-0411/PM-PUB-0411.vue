<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { Button } from '@/components/custom/button'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import DrunkCenterDetailForm from '../components/DrunkCenterDetailForm.vue'
import {
  useDrunkCenterStore,
  createEmptyCenterForm,
  regionFilterOptions,
  regionLabel,
  formatPhone,
  type DrunkCenterRow,
} from '../composable/drunkCenter'

// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!) — useBottomTabSetup 의 componentName 과 일치해야 한다.
defineOptions({ name: 'PmPub0411' })

// 브레드크럼: 실제 라우트가 있는 항목만 path 를 준다. '/pub' 같은 도메인 경로는 라우트가 아니다.
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '보호조치대응팀' },
  { label: '주취자센터관리' },
]

const router = useRouter()
const dialog = useDialog()
const store = useDrunkCenterStore()

/* ── 검색 ─────────────────────────────────────────────────────────────── */
const regionFilter = ref('all')
const centerFilter = ref('all')

/** 기획서 [2] 선택된 지역의 센터목록만 노출. 지역이 '전체'면 등록된 센터 전부 */
const centerFilterOptions = computed(() => [
  { label: '전체', value: 'all' },
  ...store.centers.value
    .filter((center) => regionFilter.value === 'all' || center.region === regionFilter.value)
    .map((center) => ({ label: center.name, value: String(center.id) })),
])

// 지역을 바꾸면 직전에 고른 센터가 목록에 없을 수 있어 '전체'로 되돌린다.
watch(regionFilter, () => {
  centerFilter.value = 'all'
})

/** 기획서 [공통] 조회 전에도 목록이 기본 노출되므로 입력값이 바뀌면 바로 걸러진다 */
const rows = computed(() =>
  store.centers.value.filter((center) => {
    if (regionFilter.value !== 'all' && center.region !== regionFilter.value) return false
    if (centerFilter.value !== 'all' && String(center.id) !== centerFilter.value) return false
    return true
  }),
)

/* ── 목록 ─────────────────────────────────────────────────────────────── */
const columns: TabulatorGridColumn[] = [
  { title: 'NO', field: 'id', width: 70, hozAlign: 'center' },
  { title: '지역', field: 'region', width: 100, hozAlign: 'center', formatter: (cell: any) => regionLabel(cell.getValue()) },
  { title: '센터명', field: 'name', widthGrow: 2, hozAlign: 'left' },
  { title: '연락처', field: 'phone1', hozAlign: 'center', formatter: (cell: any) => formatPhone(cell.getRow().getData()) },
  { title: '총 병상 수', field: 'bedTotal', width: 110, hozAlign: 'center' },
]

/* ── 상세 ─────────────────────────────────────────────────────────────── */
const form = reactive(createEmptyCenterForm())

function fillForm(row: DrunkCenterRow | null) {
  Object.assign(form, row ? { ...row } : createEmptyCenterForm())
}

/**
 * select-mode="single" 이라 선택 행은 0건 아니면 1건이다.
 * TabulatorGrid 는 이 이벤트에 데이터가 아니라 Tabulator RowComponent 를 넘기므로
 * getData() 로 실제 데이터를 꺼낸다(이미 데이터인 경우까지 방어적으로) — CLAUDE.md §6.
 */
function onRowSelectionChanged(selected: any[]) {
  const first = selected[0]
  const row: DrunkCenterRow | undefined =
    first && typeof first.getData === 'function' ? first.getData() : first
  fillForm(row ?? null)
}

function goRegister() {
  router.push({ name: 'PC-PUB-0412' })
}

function onSave() {
  if (!form.region || !form.name.trim()) {
    toast.warning('필수 항목을 입력해 주세요.')
    return
  }
  store.saveCenter(form)
  toast.success('저장되었습니다.')
}

async function onDelete() {
  if (form.id == null) {
    toast.warning('삭제할 센터를 선택해 주세요.')
    return
  }
  /*
   * 기획서 [4-1]/[4-2] 확인 알림창 — §7 기본(toast)과 다르지만 기획서에 명시된 지정을 따른다.
   * 병상 사용중이면 삭제를 막고, 아니면 삭제한 뒤 알린다.
   */
  if (store.hasBedInUse(form.id)) {
    await dialog.alert({
      title: '사용 중인 병상이 있을 경우 삭제 할 수 없습니다.',
      description: '사용이 종료된 후 다시 시도해 주세요.',
      btnCancel: '확인',
    })
    return
  }
  store.deleteCenter(form.id)
  fillForm(null)
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

/*
 * 프리셋 문자열 키를 넘기면 비동기 로드라 같은 tick 에 activeChild 를 덮어쓸 때 경합이 난다.
 * 이미 로드된 publicSafetyMenu 를 인라인으로 펼쳐 동기 경로를 탄다 — CLAUDE.md §5.
 * items[4] = '보호조치 대응팀' > '주취자센터관리'.
 */
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 4, activeChild: '주취자센터관리' })

useBottomTabSetup({
  value: 'PM-PUB-0411',
  label: '주취자센터관리',
  path: '/views/pub/PM-PUB-0411',
  componentName: 'PmPub0411',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="주취자센터관리" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <SearchWrapper>
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
          <Button type="button" variant="primary" size="sm" @click="goRegister">등록</Button>
        </template>
        <TabulatorGrid
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
      <LayoutPanel title="주취자센터관리 상세">
        <template #actions>
          <Button type="button" variant="tertiary2" size="sm" @click="onDelete">삭제</Button>
        </template>
        <DrunkCenterDetailForm :form="form" id-prefix="center-detail" />
        <div class="form-actions">
          <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
        </div>
      </LayoutPanel>
    </template>
  </LayoutSplite>
</template>
