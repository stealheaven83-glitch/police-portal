<template>
  <PageHeader>
    <template #left>
      <PageTitle title="탄력순찰 이행현황" />
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
        <div class="group-gap2">
          <DatePicker v-model="dateFrom" label="탄력순찰일" size="sm" inputClass="w-40" />
          <span aria-hidden="true">~</span>
          <DatePicker v-model="dateTo" size="sm" inputClass="w-40" />
        </div>
        <SelectField
          v-model="compliance"
          label="이행여부"
          :options="complianceOptions"
          size="sm"
          triggerClass="w-37"
        />
      </div>
    </template>
    <template #btns>
      <!-- 목록은 입력값 변화에 바로 반응한다(composable 의 rows computed) -->
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
      <Download :size="16" aria-hidden="true" />
      엑셀다운로드
    </Button>
  </div>

  <TabulatorGrid
    ref="gridRef"
    class="flex-1"
    :columns="columns"
    :data="rows"
    height="100%"
    placeholder="조회된 내역이 없습니다"
    show-pagination
    :items-per-page="10"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { usePatrolCompliance, complianceOptions } from './composable/PM-FLP-0301'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { flexiblePatrolMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(CLAUDE.md §3)
defineOptions({ name: 'PmFlp0301' })

/**
 * LNB. 문자열 키(useSideMenuSetup('flexiblePatrol'))는 프리셋 기본 activeChild 가 '요청관리'라
 * 이 화면에 쓰면 엉뚱한 메뉴가 활성으로 표시된다. 프리셋을 인라인으로 펼쳐 동기 경로로 준다.
 * 탄력순찰 프리셋은 4개 항목이 모두 하위 없는 1뎁스라, 항목 자신의 인덱스와 이름을 준다(items[2]).
 */
useSideMenuSetup({ ...flexiblePatrolMenu, openIndex: 2, activeChild: '탄력순찰 이행현황' })

// 브레드크럼: 실제 라우트가 있는 항목만 path 를 준다. '/flp' 는 라우터에 없어 라벨만 둔다.
const navItems = [
  { label: '홈', path: '/' },
  { label: '탄력순찰' },
  { label: '탄력순찰이행현황' },
]

const { department, advancedSearchOpen, dateFrom, dateTo, compliance, rows } = usePatrolCompliance()

const columns: TabulatorGridColumn[] = [
  { title: '부서', field: 'dept', width: 180, hozAlign: 'center' },
  { title: '탄력순찰일', field: 'patrolPeriod', hozAlign: 'center' },
  { title: '이행여부', field: 'compliance', width: 120, hozAlign: 'center' },
  { title: '주소(지번)', field: 'addressLot', hozAlign: 'center' },
  { title: '주소(도로명)', field: 'addressRoad', hozAlign: 'center' },
  { title: '순찰요청사항', field: 'request', hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `탄력순찰이행현황_${today}.csv`)
}

useBottomTabSetup({
  value: 'PM-FLP-0301',
  label: '탄력순찰 이행현황',
  path: '/views/flp/PM-FLP-0301',
  componentName: 'PmFlp0301',
  closable: true,
})
</script>
