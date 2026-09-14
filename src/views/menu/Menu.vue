<template>
  <div class="sitemap">
    <!-- 헤더 — CI + 닫기. PC·모바일 공통 -->
    <header class="sitemap-header">
      <div class="sitemap-header-in">
        <h2 class="sitemap-logo">
          <RouterLink to="/">
            <img src="/portal/asset/images/img/img_logo.svg" alt="지역경찰포털" />
          </RouterLink>
        </h2>
        <Button variant="icon" aria-label="전체메뉴 닫기" @click="onClose">
          <Icon name="closePop" :size="32" />
        </Button>
      </div>
    </header>

    <!-- 모바일 전용 상단 — 프로필 · 메뉴 검색 · 최근 메뉴 -->
    <div v-if="isMobile" class="sitemap-mtop">
      <div class="sitemap-user">
        <span class="sitemap-avatar" aria-hidden="true"></span>
        <p class="sitemap-user-name">
          <span class="sitemap-user-rank">경위</span>홍길동
        </p>
        <div class="sitemap-user-actions">
          <button type="button" class="sitemap-user-btn">설정</button>
          <button type="button" class="sitemap-user-btn">로그아웃</button>
        </div>
      </div>

      <InputField2
        v-model="keyword"
        label="메뉴명 검색"
        label-class="sr-only"
        size="md"
        placeholder="메뉴명을 입력해 주세요"
        :clearable="false"
      />

      <div class="sitemap-recent">
        <span class="sitemap-recent-label">최근 메뉴</span>
        <ul class="sitemap-recent-list">
          <li v-for="menu in recentMenus" :key="menu">
            <button type="button" class="sitemap-recent-chip">{{ menu }}</button>
          </li>
        </ul>
      </div>
    </div>

    <!-- 1뎁스 탭. PC 는 가로, 모바일은 세로(좌측 목록 + 우측 패널).
         TabsContent 가 value 맞는 것만 렌더하므로 filter·v-if 가 필요 없다 -->
    <Tabs
      v-model="activeSection"
      :orientation="isMobile ? 'vertical' : 'horizontal'"
      class="sitemap-tabs-root"
    >
      <!-- 밑줄은 화면 전체 폭, 탭 자체는 본문 폭(1200) — 그래서 한 겹 감싼다 -->
      <div class="sitemap-tabbar">
        <TabsList variant="line" tone="primary" :grow="false" class="sitemap-tabs">
          <TabsTrigger v-for="section in menuSections" :key="section.id" :value="section.id">
            {{ section.label }}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        v-for="section in menuSections"
        :key="section.id"
        :value="section.id"
        class="sitemap-panel"
      >
        <h3 class="sitemap-title">{{ section.label }}</h3>

        <!-- ── 모바일: 2뎁스 아코디언 ─────────────────────────── -->
        <ul v-if="isMobile && section.groups.length" class="sitemap-acc">
          <li v-for="group in section.groups" :key="group.label">
            <button
              v-if="group.items?.length"
              type="button"
              class="sitemap-acc-head"
              :aria-expanded="isOpen(section.id, group.label)"
              @click="toggle(section.id, group.label)"
            >
              {{ group.label }}
              <!-- 펼침 상태는 CSS 가 180도 돌린다(아이콘을 하나만 쓰려고) -->
              <Icon name="arrowDown" :size="20" class="sitemap-acc-arrow" />
            </button>
            <MenuLinkTag v-else :link="group" class="sitemap-acc-head" />

            <ul
              v-if="group.items?.length && isOpen(section.id, group.label)"
              class="sitemap-acc-list"
            >
              <li v-for="item in group.items" :key="item.label">
                <MenuLinkTag :link="item" class="sitemap-acc-link" />
                <ul v-if="item.children?.length" class="sitemap-acc-sub">
                  <li v-for="child in item.children" :key="child.label">
                    <MenuLinkTag :link="child" class="sitemap-acc-link" />
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>

        <!-- ── PC: 2뎁스 4컬럼 그리드 ─────────────────────────── -->
        <ul v-else-if="section.groups.length" class="sitemap-grid">
          <li v-for="group in section.groups" :key="group.label" class="sitemap-group">
            <h4>
              <MenuLinkTag :link="group" class="sitemap-group-link" />
            </h4>

            <ul v-if="group.items?.length" class="sitemap-list">
              <li v-for="item in group.items" :key="item.label">
                <!-- 4뎁스를 가진 항목은 접기/펼치기, 아니면 바로 이동 -->
                <button
                  v-if="item.children?.length"
                  type="button"
                  class="sitemap-link"
                  :class="item.children?.length && isOpen(section.id, group.label, item.label) ? 'open-sub' : ''"
                  :aria-expanded="isOpen(section.id, group.label, item.label)"
                  @click="toggle(section.id, group.label, item.label)"
                >
                  <span class="sitemap-link-label">{{ item.label }}</span>
                  <Icon
                    :name="isOpen(section.id, group.label, item.label) ? 'minus' : 'plus'"
                    :size="16"
                  />
                </button>
                <MenuLinkTag v-else :link="item" class="sitemap-link" />

                <ul
                  v-if="item.children?.length && isOpen(section.id, group.label, item.label)"
                  class="sitemap-sub"
                >
                  <li v-for="child in item.children" :key="child.label">
                    <MenuLinkTag :link="child" class="sitemap-sub-link" />
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/custom/button'
import Icon from '@/components/custom/icon/Icon.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/custom/tabs'
import { menuSections, recentMenus } from './composable/menu'
import { useBreakpoint } from '@/composable/responsive/useResponsive'
import MenuLinkTag from './components/MenuLinkTag.vue'

defineOptions({ name: 'SiteMapMenu' })

const router = useRouter()
const isMobile = useBreakpoint('<=')

const activeSection = ref(menuSections[0].id)

/** 메뉴명 검색어 — 필터링은 개발팀이 붙인다 */
const keyword = ref('')

/**
 * 펼쳐 둔 항목. PC 는 4뎁스(근무일지 甲·乙), 모바일은 2뎁스 아코디언이라
 * 깊이가 다르다 — 경로를 이어 붙인 문자열 하나로 둘 다 다룬다.
 * 라벨은 구역이 달라도 겹치므로(게시판 '범죄예방진단') 구역ID부터 포함한다.
 */
const openKeys = ref<string[]>(['lpo|근무일지|근무일지(甲)', 'lpo|근무일지|근무일지(乙)'])

function keyOf(...parts: string[]) {
  return parts.join('|')
}

function isOpen(...parts: string[]) {
  return openKeys.value.includes(keyOf(...parts))
}

function toggle(...parts: string[]) {
  const key = keyOf(...parts)
  // 배열은 제자리 수정하지 않고 재할당한다(CLAUDE.md §5)
  openKeys.value = openKeys.value.includes(key)
    ? openKeys.value.filter(k => k !== key)
    : [...openKeys.value, key]
}

function onClose() {
  router.back()
}
</script>
