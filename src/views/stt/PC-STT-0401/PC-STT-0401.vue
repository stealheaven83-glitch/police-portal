<template>
  <PageHeader>
    <template #left>
      <PageTitle title="메뉴사용통계" />
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
        <DateRangePicker
          v-model:from="dateFrom"
          v-model:to="dateTo"
          label="기간"
          from-label="기간 시작일"
          to-label="기간 종료일"
          size="sm"
        />
        <!-- 시안은 라벨 없이 placeholder 만 있다. 이름이 없으면 스크린리더가 못 읽어 aria-label 로 준다 -->
        <InputField2
          v-model="pageKeyword"
          size="sm"
          aria-label="페이지 조회"
          placeholder="페이지 조회"
          input-class="w-60"
          clearable
          @keyup.enter="search"
        />
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
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useMenuUsageStats } from './composable/PC-STT-0401'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { statisticsMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(CLAUDE.md §3)
defineOptions({ name: 'PcStt0401' })

/**
 * LNB. 문자열 키(useSideMenuSetup('statistics'))는 비동기 로딩이라 화면마다 위치가 다를 때
 * 값이 늦게 덮어써진다. 프리셋을 인라인으로 펼쳐 동기 경로로 준다 — docs/create.md §3.
 * 이 화면은 items[4] '사용이력통계' > '메뉴사용통계'.
 */
useSideMenuSetup({ ...statisticsMenu, openIndex: 4, activeChild: '메뉴사용통계' })

// 브레드크럼: 실제 라우트가 있는 항목만 path 를 준다. 없는 경로(/stt 등)를 넣으면 죽은 링크가 된다.
const navItems = [
  { label: '홈', path: '/' },
  { label: '통계' },
  { label: '사용이력통계' },
  { label: '메뉴사용통계' },
]

const { dateFrom, dateTo, pageKeyword, rows, search } = useMenuUsageStats()

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '메뉴명', field: 'menuName', hozAlign: 'left' },
  { title: '메뉴경로', field: 'menuPath', hozAlign: 'left' },
  { title: '접속수', field: 'visitCount', hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `메뉴사용통계_${today}.csv`)
}

useBottomTabSetup({
  value: 'PC-STT-0401',
  label: '메뉴사용통계',
  path: '/views/stt/PC-STT-0401',
  componentName: 'PcStt0401',
  closable: true,
})
</script>
