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
      <!-- 기획서 [2-1] 저장 결과가 반영되는 목록 -->
      <LayoutPanel title="정신응급대응팀">
        <TabulatorGrid
          class="flex-1"
          :columns="columns"
          :data="rows"
          height="100%"
          min-height="40rem"
          placeholder="등록된 정신응급대응팀 센터가 없습니다"
          show-pagination
          :items-per-page="10"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="정신응급대응팀 등록">
        <!-- 기획서 [1] 지역 선택범위: 18개 지역 (폼 컴포넌트 안) -->
        <MentalCenterDetailForm :form="form" id-prefix="mental-new" />
        <div class="form-actions">
          <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
        </div>
      </LayoutPanel>
    </template>
  </LayoutSplite>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
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
} from '../composable/mentalEmergency'

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

const columns: TabulatorGridColumn[] = [
  { title: 'NO', field: 'id', width: 70, hozAlign: 'center' },
  { title: '지역', field: 'region', width: 100, hozAlign: 'center', formatter: (cell: any) => regionLabel(cell.getValue()) },
  { title: '센터명', field: 'name', widthGrow: 2, hozAlign: 'left' },
  { title: '연락처', field: 'phone1', hozAlign: 'center', formatter: (cell: any) => formatPhone(cell.getRow().getData()) },
  { title: '병상수', field: 'bedTotal', width: 90, hozAlign: 'center' },
]

/* ── 등록 ─────────────────────────────────────────────────────────────── */
const form = reactive(createEmptyCenterForm())

/** 기획서 [2] 저장하면 좌측 목록(2-1)에 바로 반영된다(도메인 싱글턴 스토어를 두 화면이 공유) */
function onSave() {
  if (!form.region || !form.name.trim()) {
    toast.warning('필수 항목을 입력해 주세요.')
    return
  }
  // 기획서 "※ 센터명에 언더바를 제외한 특수문자 사용은 불가합니다"
  if (!isValidCenterName(form.name)) {
    toast.warning('센터명에 언더바(_)를 제외한 특수문자는 사용할 수 없습니다.')
    return
  }
  store.saveCenter(form)
  toast.success('저장되었습니다.')
  // 연속 등록을 위해 폼을 비운다
  Object.assign(form, createEmptyCenterForm())
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
