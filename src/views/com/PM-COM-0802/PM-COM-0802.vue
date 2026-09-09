<template>
  <div class="lp-page-scroll">
    <SearchBar
      v-model="keyword"
      class="lp-search-hero"
      label="통합검색어"
      @search="onSearch"
    />

    <div class="lp-content-panel lp-content-panel-pad">
      <Tabs v-model="activeTab">
        <TabsList variant="fill" tone="secondary" class="lp-segmented-tabs">
          <TabsTrigger v-for="tab in resultTabs" :key="tab.value" :value="tab.value">
            {{ tab.label }}({{ tab.count.toLocaleString() }})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <section v-for="section in visibleSections" :key="section.tab" class="lp-result-section">
        <div class="lp-row-between lp-section-head">
          <h2 class="lp-heading-lg">
            {{ section.title }} <b class="lp-hit">{{ section.total }}건</b>
          </h2>
          <Button type="button" variant="text" size="xs" @click="onMore(section.title)">
            더보기
          </Button>
        </div>

        <!-- 메뉴 구역: 메뉴 경로 링크만 나열된다 -->
        <ul v-if="section.menus?.length" class="lp-link-list">
          <li v-for="menu in section.menus" :key="menu.path">
            <button type="button" class="lp-path-link" @click="onMove(menu.path)">
              {{ menu.path }}
            </button>
          </li>
        </ul>

        <!-- 본문이 있는 구역 -->
        <template v-if="section.contents?.length">
          <article v-for="item in section.contents" :key="item.id" class="lp-result-item">
            <h3 class="lp-heading-lg">{{ item.title }}</h3>
            <p class="lp-result-summary">{{ item.summary }}</p>
            <button type="button" class="lp-path-link" @click="onMove(item.path)">
              {{ item.path }}
            </button>
          </article>
        </template>

        <NoData v-if="section.total === 0" />
      </section>

      <CustomPagination
        class="lp-result-pagination"
        simple
        :current-page="currentPage"
        :total-pages="99"
        :items-per-page="10"
        :total-elements="totalCount"
        @update:page="currentPage = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import SearchBar from '@/components/custom/search/SearchBar.vue'
import { Tabs, TabsList, TabsTrigger } from '@/components/custom/tabs'
import { Button } from '@/components/custom/button'
import NoData from '@/components/custom/empty/NoData.vue'
import CustomPagination from '@/components/custom/pagination/Pagination.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useDialog } from '@/composable/dialog/dialog'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { resultTabs, useIntegratedSearchResult } from './composable/PM-COM-0802'
defineOptions({ name: 'PmCom0802' })

/** LNB — PM-COM-0801 과 같은 '통합검색' 메뉴다(presets.ts 미등록, CLAUDE.md §4·§5) */
useSideMenuSetup({
  title: '통합검색',
  openIndex: 0,
  activeChild: '통합검색',
  items: [{ name: '통합검색', path: '/views/com/PM-COM-0801' }],
})

const route = useRoute()
const dialog = useDialog()
const { keyword, activeTab, currentPage, visibleSections, totalCount } =
  useIntegratedSearchResult()

// 검색창 화면(PM-COM-0801)에서 넘어온 검색어를 입력창에 채운다
onMounted(() => {
  const q = route.query.q
  if (typeof q === 'string') keyword.value = q
})

async function onSearch(value: string) {
  if (!value.trim()) {
    // 사용자 지정: toast 대신 alert — CLAUDE.md §4 기본(toast.warning)과 다르지만 요청대로 따름
    await dialog.alert({ title: '검색어를 입력해 주세요.', btnCancel: '확인' })
    return
  }
  currentPage.value = 1
  // 실제 재조회는 개발팀이 붙인다(퍼블 범위 밖)
}

function onMore(title: string) {
  toast.info(`${title} 검색결과 더보기는 준비 중입니다.`)
}

function onMove(path: string) {
  toast.info(`${path} 이동은 개발 연동 후 동작합니다.`)
}

useBottomTabSetup({
  value: 'PM-COM-0802',
  label: '통합검색 결과',
  path: '/views/com/PM-COM-0802',
  componentName: 'PmCom0802',
  closable: true,
})
</script>
