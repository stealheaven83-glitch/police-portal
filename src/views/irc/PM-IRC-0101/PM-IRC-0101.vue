<template>
  <PageHeader>
    <template #left>
      <PageTitle title="사건대응 시나리오" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <ScrollWrapper>
    <SearchBar
      ref="searchBarRef"
      v-model="keyword"
      class="scenario-search-center"
      label="사건대응 시나리오 검색어"
      status="검색 원활"
      @search="onSearch"
      @voice="onVoiceSearch"
    />
    <!-- 최근검색어 · 추천검색어 (시안은 반반이 아니라 795:356 + 세로 구분선) -->
    <SearchKeywordPanel
      class="lp-content-panel lp-keyword-split"
      :recent="recentKeywords"
      :recommended="recommendedKeywords"
      @select="onSelectKeyword"
      @remove="removeRecent"
      @clear="clearRecent"
    />
  </ScrollWrapper>


  <VoiceSearchDialog v-model:open="voiceDialogOpen" @search="onVoiceConfirm" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchBar from '@/components/custom/search/SearchBar.vue'
import SearchKeywordPanel from '@/components/custom/search/SearchKeywordPanel.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useDialog } from '@/composable/dialog/dialog'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import VoiceSearchDialog from '../components/VoiceSearchDialog.vue'
import { useIncidentScenarioStore } from '../composable/incidentScenario'

import ScrollWrapper from '@/components/custom/ScrollWrapper.vue'

defineOptions({ name: 'PmIrc0101' })

/**
 * LNB. '사건대응 시나리오'는 presets.ts 에 아직 없는 메뉴라 인라인으로 구성한다
 * (CLAUDE.md §4·§5). 하위가 없는 1뎁스 항목 하나뿐이라 openIndex 는 자기 자신인 0 이다.
 */
useSideMenuSetup({
  title: '사건대응 시나리오',
  openIndex: 0,
  activeChild: '사건대응 시나리오',
  items: [{ name: '사건대응 시나리오', path: '/views/irc/PM-IRC-0101' }],
})

// 브레드크럼: 실제 라우트가 있는 항목만 path 를 준다(/irc 는 라우트가 아니다)
const navItems = [{ label: '홈', path: '/' }, { label: '사건대응 시나리오' }]

const dialog = useDialog()
const router = useRouter()
const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null)

// 음성인식 팝업(PM-IRC-0102 진행중 / PM-IRC-0103 결과) 열림 여부
const voiceDialogOpen = ref(false)

const { keyword, recentKeywords, recommendedKeywords, removeRecent, clearRecent, pushRecent } =
  useIncidentScenarioStore()

/**
 * 알럿을 닫으면 다이얼로그(reka-ui FocusScope)가 setTimeout(0) 으로 직전 요소(검색 버튼)에
 * 포커스를 되돌린다. 그 뒤에 실행돼야 커서가 입력창에 남으므로 같은 방식으로 한 틱 미룬다.
 */
function focusSearchBar() {
  setTimeout(() => searchBarRef.value?.focus(), 0)
}

/** 검색 실행 → 결과화면(PM-IRC-0104)으로 이동한다. 실제 질의는 개발팀이 붙인다 */
async function onSearch(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    await dialog.alert({ title: '검색 내용이 입력되지 않았습니다.', btnCancel: '확인' })
    focusSearchBar()
    return
  }
  keyword.value = trimmed
  pushRecent(trimmed)
  router.push({ name: 'PM-IRC-0104' })
}

/**
 * 음성검색 버튼 → 음성인식 팝업(진행중 → 결과). Figma MO 14958:133267 / 14958:133367.
 * 음성검색 버튼 자체는 police-style.css 의 모바일 미디어쿼리에서만 보인다.
 *
 * '대기시간이 초과되었습니다' 확인창(Figma 13323:98207, `voiceWaitTimeoutDialog`)은 실제
 * 대기시간이 넘었을 때 뜨는 것이라 개발팀이 그 시점에 잇는다 — 버튼을 누를 때마다 뜰 자리가 아니다.
 */
function onVoiceSearch() {
  voiceDialogOpen.value = true
}

/** 음성인식 결과의 [검색] — 인식된 말로 결과화면까지 간다 */
function onVoiceConfirm(value: string) {
  void onSearch(value)
}

function onSelectKeyword(value: string) {
  void onSearch(value)
}

useBottomTabSetup({
  value: 'PM-IRC-0101',
  label: '사건대응 시나리오',
  path: '/views/irc/PM-IRC-0101',
  componentName: 'PmIrc0101',
  closable: true,
})
</script>
