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

  <div class="lp-page-scroll">
    <SearchBar
      v-model="keyword"
      class="lp-search-center"
      label="사건대응 시나리오 검색어"
      status="검색 원활"
      @search="onSearch"
    />

    <!-- 검색 전: 최근검색어 · 추천검색어 (시안은 반반이 아니라 795:356 + 세로 구분선) -->
    <SearchKeywordPanel
      v-if="!searched"
      class="lp-content-panel lp-keyword-split"
      :recent="recentKeywords"
      :recommended="recommendedKeywords"
      @select="onSelectKeyword"
      @remove="removeRecent"
      @clear="clearRecent"
    />

    <!-- 검색 후: AI 생성 답변 -->
    <section v-else class="lp-ai-answer" aria-labelledby="irc-answer-title">
      <h2 id="irc-answer-title" class="lp-ai-answer-head">
        <Sparkles class="lp-ai-answer-icon" aria-hidden="true" />
        AI 생성 답변
      </h2>

      <div class="lp-ai-answer-body">
        <div class="lp-answer-main">
          <p class="lp-body-text">{{ answer.intro }}</p>

          <div v-for="(block, index) in answer.blocks" :key="index" class="lp-answer-block">
            <h3 v-if="block.heading" class="lp-heading-lg lp-block-title">{{ block.heading }}</h3>
            <p v-for="text in block.paragraphs" :key="text" class="lp-body-text">
              {{ text }}
            </p>
            <ul v-if="block.bullets?.length" class="lp-bullet-list">
              <li v-for="text in block.bullets" :key="text">{{ text }}</li>
            </ul>
          </div>

          <p class="lp-answer-note">※ 본 답변은 AI가 생성한 내용입니다.</p>
        </div>

        <aside class="lp-ref-column" aria-labelledby="irc-ref-title">
          <h3 id="irc-ref-title" class="lp-heading-lg">참고자료</h3>
          <Accordion v-model="openReference" type="single" collapsible class="lp-ref-list">
            <AccordionItem
              v-for="ref in answer.references"
              :key="ref.title"
              :value="ref.title"
              class="lp-ref-item"
            >
              <AccordionTrigger class="lp-ref-trigger">{{ ref.title }}</AccordionTrigger>
              <AccordionContent class="lp-ref-body">
                <p class="lp-ref-desc">{{ ref.description }}</p>
                <!-- 문서 연결은 개발팀이 잇는다 — 시안에 링크 대상이 없다 -->
                <a v-if="ref.link" href="#" class="lp-ref-link">{{ ref.link }}</a>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchBar from '@/components/custom/search/SearchBar.vue'
import SearchKeywordPanel from '@/components/custom/search/SearchKeywordPanel.vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/custom/accordion'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useDialog } from '@/composable/dialog/dialog'
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

const dialog = useDialog()

const {
  keyword,
  searched,
  answer,
  openReference,
  recentKeywords,
  recommendedKeywords,
  removeRecent,
  clearRecent,
  pushRecent,
} = useIncidentScenarioSearch()

/** 검색 실행 → 같은 화면이 'AI 생성 답변' 상태로 바뀐다. 실제 질의는 개발팀이 붙인다 */
async function onSearch(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    // 사용자 지정: toast 대신 alert — CLAUDE.md §4 기본(toast.warning)과 다르지만 요청대로 따름
    await dialog.alert({ title: '검색어를 입력해 주세요.', btnCancel: '확인' })
    return
  }
  pushRecent(trimmed)
  searched.value = true
}

function onSelectKeyword(value: string) {
  keyword.value = value
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
