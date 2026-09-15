<template>
  <PageHeader>
    <template #left>
      <PageTitle title="중요정보 변경이력 조회" />
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
          v-model="userKeyword"
          size="sm"
          aria-label="사용자 조회"
          placeholder="사용자 조회"
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
import { useImportantChangeHistory } from './composable/PC-STT-0403'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { statisticsMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(CLAUDE.md §3)
defineOptions({ name: 'PcStt0403' })

/**
 * LNB. 문자열 키(useSideMenuSetup('statistics'))는 비동기 로딩이라 화면마다 위치가 다를 때
 * 값이 늦게 덮어써진다. 프리셋을 인라인으로 펼쳐 동기 경로로 준다 — docs/create.md §3.
 * 이 화면은 items[4] '사용이력통계' > '중요정보 변경이력 조회'.
 */
useSideMenuSetup({ ...statisticsMenu, openIndex: 4, activeChild: '중요정보 변경이력 조회' })

// 브레드크럼: 실제 라우트가 있는 항목만 path 를 준다. 없는 경로(/stt 등)를 넣으면 죽은 링크가 된다.
const navItems = [
  { label: '홈', path: '/' },
  { label: '통계' },
  { label: '사용이력통계' },
  { label: '중요정보 변경이력 조회' },
]

const { dateFrom, dateTo, userKeyword, rows, search } = useImportantChangeHistory()

/*
 * 시안 폭: 번호 60 · 사용자 160 · 부서 320 · 변경구분 148 은 고정이고,
 * 메뉴명 · 설명 · 접속IP · 변경일시는 남은 폭을 똑같이 나눠 가진다(시안 219씩).
 */
const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '사용자', field: 'user', width: 160, hozAlign: 'center' },
  { title: '부서', field: 'dept', width: 320, hozAlign: 'center' },
  { title: '메뉴명', field: 'menuName', hozAlign: 'center' },
  { title: '변경구분', field: 'changeType', width: 148, hozAlign: 'center' },
  { title: '설명', field: 'description', hozAlign: 'center' },
  { title: '접속IP', field: 'ip', hozAlign: 'center' },
  { title: '변경일시', field: 'changedAt', hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `중요정보_변경이력_${today}.csv`)
}

useBottomTabSetup({
  value: 'PC-STT-0403',
  label: '중요정보 변경이력 조회',
  path: '/views/stt/PC-STT-0403',
  componentName: 'PcStt0403',
  closable: true,
})
</script>
