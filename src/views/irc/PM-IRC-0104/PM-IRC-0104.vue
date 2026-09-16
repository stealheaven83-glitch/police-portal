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
      ref="searchBarRef"
      v-model="keyword"
      class="scenario-search-center"
      label="사건대응 시나리오 검색어"
      status="검색 원활"
      @search="onSearch"
      @voice="onVoiceSearch"
    />

    <section class="lp-ai-answer" aria-labelledby="irc-answer-title">
      <h2 id="irc-answer-title" class="lp-ai-answer-head">
        <span class="lp-ai-answer-icon" aria-hidden="true">
          <img src="/portal/asset/images/icon/ico_ai_sparkle.svg" alt="" />
        </span>
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

  <VoiceSearchDialog v-model:open="voiceDialogOpen" @search="onVoiceConfirm" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchBar from '@/components/custom/search/SearchBar.vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/custom/accordion'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useDialog } from '@/composable/dialog/dialog'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import VoiceSearchDialog from '../components/VoiceSearchDialog.vue'
import { useIncidentScenarioStore } from '../composable/incidentScenario'
defineOptions({ name: 'PmIrc0104' })

/** LNB 는 검색화면(PM-IRC-0101)과 같은 항목을 켠다 — 메뉴가 하나뿐이다 */
useSideMenuSetup({
  title: '사건대응 시나리오',
  openIndex: 0,
  activeChild: '사건대응 시나리오',
  items: [{ name: '사건대응 시나리오', path: '/views/irc/PM-IRC-0101' }],
})

// '사건대응 시나리오'는 LNB 에 있어 path 없이도 검색화면으로 링크된다(docs/create.md §3)
const navItems = [
  { label: '홈', path: '/' },
  { label: '사건대응 시나리오' },
  { label: '검색결과' },
]

const dialog = useDialog()
const router = useRouter()
const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null)

// 음성인식 팝업(PM-IRC-0102 진행중 / PM-IRC-0103 결과) 열림 여부 — 검색화면과 같은 팝업이다
const voiceDialogOpen = ref(false)

const { keyword, answer, openReference, pushRecent } = useIncidentScenarioStore()

/**
 * 주소로 곧장 들어왔는데 검색어가 없으면 보여 줄 결과가 없다 — 검색화면으로 돌려보낸다.
 * (Figma 에 이 경우가 없어 추론했다)
 */
onMounted(() => {
  if (!keyword.value.trim()) {
    router.replace({ name: 'PM-IRC-0101' })
  }
})

/** 알림창이 닫히며 되돌아가는 포커스보다 뒤에 실행돼야 커서가 입력창에 남는다(PM-IRC-0101 과 같다) */
function focusSearchBar() {
  setTimeout(() => searchBarRef.value?.focus(), 0)
}

/** 결과화면에서 다시 검색 — 화면 이동 없이 이 자리에서 답변만 바뀐다 */
async function onSearch(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    await dialog.alert({ title: '검색 내용이 입력되지 않았습니다.', btnCancel: '확인' })
    focusSearchBar()
    return
  }
  keyword.value = trimmed
  pushRecent(trimmed)
  // 실제 재질의는 개발팀이 붙인다 — 목업이라 answer 는 그대로다
}

/** 음성검색 버튼 → 음성인식 팝업. 검색화면(PM-IRC-0101)과 같다 */
function onVoiceSearch() {
  voiceDialogOpen.value = true
}

/** 음성인식 결과의 [검색] — 이 자리에서 다시 검색한다 */
function onVoiceConfirm(value: string) {
  void onSearch(value)
}

useBottomTabSetup({
  value: 'PM-IRC-0104',
  label: '사건대응 시나리오 결과',
  path: '/views/irc/PM-IRC-0104',
  componentName: 'PmIrc0104',
  closable: true,
})
</script>
