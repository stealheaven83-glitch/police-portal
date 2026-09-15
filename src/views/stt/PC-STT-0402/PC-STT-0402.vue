<template>
  <PageHeader>
    <template #left>
      <PageTitle title="접속이력조회" />
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
      <!-- 구성은 /component/search-area 샘플 5번(#form + #btns)을 따른다 -->
      <div class="search-area">
        <div class="group-gap3">
          <SelectField
            v-model="year"
            label="기간"
            :options="yearOptions"
            size="sm"
            trigger-class="w-30"
          />
          <!-- 시안에 라벨이 없다. 이름이 없으면 스크린리더가 못 읽어 라벨은 두고 감춘다 -->
          <SelectField
            v-model="month"
            label="월"
            label-class="sr-only"
            :options="monthOptions"
            size="sm"
            trigger-class="w-25"
          />
        </div>

        <RadioGroup v-model="periodUnit" class="lp-radio-row" aria-label="조회 단위">
          <RadioGroupItem
            v-for="option in periodUnitOptions"
            :key="option.value"
            :value="option.value"
            :label="option.label"
          />
        </RadioGroup>
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm" @click="search">조회</Button>
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
    min-height="30rem"
    placeholder="조회된 내역이 없습니다"
    show-pagination
    :items-per-page="10"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import {
  useVisitLogStats,
  periodUnitOptions,
  yearOptions,
  monthOptions,
  type VisitLogRow,
} from './composable/PC-STT-0402'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { statisticsMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(CLAUDE.md §3)
defineOptions({ name: 'PcStt0402' })

/**
 * LNB. 문자열 키(useSideMenuSetup('statistics'))는 비동기 로딩이라 화면마다 위치가 다를 때
 * 값이 늦게 덮어써진다. 프리셋을 인라인으로 펼쳐 동기 경로로 준다 — docs/create.md §3.
 * 이 화면은 items[4] '사용이력통계' > '접속이력조회'.
 */
useSideMenuSetup({ ...statisticsMenu, openIndex: 4, activeChild: '접속이력조회' })

// 브레드크럼: 실제 라우트가 있는 항목만 path 를 준다. 없는 경로(/stt 등)를 넣으면 죽은 링크가 된다.
const navItems = [
  { label: '홈', path: '/' },
  { label: '통계' },
  { label: '사용이력통계' },
  { label: '접속이력조회' },
]

const { year, month, periodUnit, rows, visitsColumnTitle, search } = useVisitLogStats()

/**
 * 그래프 셀 — 막대 + '10 (50%)'. 포매터는 innerHTML 자리라 Vue 컴포넌트를 못 쓰고
 * DOM 을 만들어 돌려준다(PM-COM-1001 titleFormatter 와 같은 방식).
 * 막대 폭만 인라인 style 이다 — 값마다 달라 클래스로 뺄 수 없다(CLAUDE.md §1).
 */
function graphFormatter(cell: any) {
  const row = cell.getData() as VisitLogRow
  const wrap = document.createElement('div')
  wrap.className = 'lp-visit-graph'

  const bar = document.createElement('span')
  bar.className = 'lp-visit-graph-bar'
  bar.style.width = `${row.ratio}%`

  const value = document.createElement('span')
  value.className = 'lp-visit-graph-value'
  value.textContent = `${row.visits} (${row.ratio}%)`

  wrap.append(bar, value)
  return wrap
}

// 일별/월별에 따라 방문수 컬럼 제목만 바뀐다(사용자 지정). 그리드가 columns 를 참조로 watch 한다
const columns = computed<TabulatorGridColumn[]>(() => [
  { title: '날짜', field: 'label', width: 100, hozAlign: 'center' },
  { title: '누적 방문', field: 'totalVisits', width: 200, hozAlign: 'center' },
  { title: visitsColumnTitle.value, field: 'visits', width: 200, hozAlign: 'center' },
  { title: '그래프', field: 'ratio', hozAlign: 'left', headerSort: false, formatter: graphFormatter },
])

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `접속이력조회_${today}.csv`)
}

useBottomTabSetup({
  value: 'PC-STT-0402',
  label: '접속이력조회',
  path: '/views/stt/PC-STT-0402',
  componentName: 'PcStt0402',
  closable: true,
})
</script>
