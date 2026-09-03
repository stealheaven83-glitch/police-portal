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

  <div class="pm-irc-0101-wrap">
    <SearchBar
      v-model="keyword"
      class="pm-irc-0101-search"
      label="사건대응 시나리오 검색어"
      status="검색 원활"
      @search="onSearch"
    />

    <!-- 검색 전: 최근검색어 · 추천검색어 -->
    <SearchKeywordPanel
      v-if="!searched"
      class="pm-irc-0101-panel"
      :recent="recentKeywords"
      :recommended="recommendedKeywords"
      @select="onSelectKeyword"
      @remove="removeRecent"
      @clear="clearRecent"
    />

    <!-- 검색 후: AI 생성 답변 -->
    <section v-else class="pm-irc-0101-answer" aria-labelledby="irc-answer-title">
      <h2 id="irc-answer-title" class="pm-irc-0101-answer-head">
        <Sparkles class="pm-irc-0101-answer-icon" aria-hidden="true" />
        AI 생성 답변
      </h2>

      <div class="pm-irc-0101-answer-body">
        <div class="pm-irc-0101-answer-main">
          <p class="pm-irc-0101-paragraph">{{ answer.intro }}</p>

          <div v-for="block in answer.blocks" :key="block.heading" class="pm-irc-0101-block">
            <h3 v-if="block.heading" class="pm-irc-0101-block-title">{{ block.heading }}</h3>
            <p v-for="text in block.paragraphs" :key="text" class="pm-irc-0101-paragraph">
              {{ text }}
            </p>
            <ul v-if="block.bullets?.length" class="pm-irc-0101-bullets">
              <li v-for="text in block.bullets" :key="text">{{ text }}</li>
            </ul>
          </div>
        </div>

        <aside class="pm-irc-0101-refs">
          <h3 class="pm-irc-0101-refs-title">참고자료</h3>
          <article v-for="ref in answer.references" :key="ref.title" class="pm-irc-0101-ref-card">
            <h4 class="pm-irc-0101-ref-card-title">{{ ref.title }}</h4>
            <p class="pm-irc-0101-ref-card-desc">{{ ref.description }}</p>
          </article>
        </aside>
      </div>

      <p class="pm-irc-0101-answer-note">※ 본 답변은 AI가 생성한 내용입니다.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchBar from '@/components/custom/search/SearchBar.vue'
import SearchKeywordPanel from '@/components/custom/search/SearchKeywordPanel.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useIncidentScenarioSearch } from './composable/PM-IRC-0101'
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

const {
  keyword,
  searched,
  answer,
  recentKeywords,
  recommendedKeywords,
  removeRecent,
  clearRecent,
  pushRecent,
} = useIncidentScenarioSearch()

/** 검색 실행 → 같은 화면이 'AI 생성 답변' 상태로 바뀐다. 실제 질의는 개발팀이 붙인다 */
function onSearch(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    toast.warning('검색어를 입력해 주세요.')
    return
  }
  pushRecent(trimmed)
  searched.value = true
}

function onSelectKeyword(value: string) {
  keyword.value = value
  onSearch(value)
}

useBottomTabSetup({
  value: 'PM-IRC-0101',
  label: '사건대응 시나리오',
  path: '/views/irc/PM-IRC-0101',
  componentName: 'PmIrc0101',
  closable: true,
})
</script>
