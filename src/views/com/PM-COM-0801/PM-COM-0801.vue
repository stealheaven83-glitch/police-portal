<template>
  <div class="lp-page-scroll">
    <SearchBar
      v-model="keyword"
      class="lp-search-hero"
      label="통합검색어"
      @search="onSearch"
    />

    <SearchKeywordPanel
      class="lp-content-panel"
      :recent="recentKeywords"
      :recommended="recommendedKeywords"
      @select="onSelectKeyword"
      @remove="removeRecent"
      @clear="clearRecent"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import SearchBar from '@/components/custom/search/SearchBar.vue'
import SearchKeywordPanel from '@/components/custom/search/SearchKeywordPanel.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useDialog } from '@/composable/dialog/dialog'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useIntegratedSearch } from './composable/PM-COM-0801'
defineOptions({ name: 'PmCom0801' })

/**
 * LNB. '통합검색'은 presets.ts 에 아직 없는 메뉴라 인라인으로 구성한다(CLAUDE.md §4·§5).
 * 하위가 없는 1뎁스 항목 하나뿐이라 openIndex 는 자기 자신인 0 이다.
 */
useSideMenuSetup({
  title: '통합검색',
  openIndex: 0,
  activeChild: '통합검색',
  items: [{ name: '통합검색', path: '/views/com/PM-COM-0801' }],
})

const router = useRouter()

const dialog = useDialog()
const { keyword, recentKeywords, recommendedKeywords, removeRecent, clearRecent } =
  useIntegratedSearch()

/** 검색 실행 → 결과 화면(PM-COM-0802)으로 이동. 실제 조회는 개발팀이 붙인다 */
async function goToResult(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    // 사용자 지정: toast 대신 alert — CLAUDE.md §4 기본(toast.warning)과 다르지만 요청대로 따름
    await dialog.alert({ title: '검색어를 입력해 주세요.', btnCancel: '확인' })
    return
  }
  router.push({ name: 'PM-COM-0802', query: { q: trimmed } })
}

function onSearch(value: string) {
  void goToResult(value)
}

function onSelectKeyword(value: string) {
  keyword.value = value
  void goToResult(value)
}

useBottomTabSetup({
  value: 'PM-COM-0801',
  label: '통합검색',
  path: '/views/com/PM-COM-0801',
  componentName: 'PmCom0801',
  closable: true,
})
</script>
