<template>
  <!-- path 가 있으면 링크, 없으면 버튼. 96개 메뉴의 경로가 아직 안 정해져
       대부분 버튼으로 떨어진다 — 개발팀이 menu.ts 에 path 를 채우면 링크가 된다 -->
  <RouterLink v-if="link.path" :to="link.path">
    <span class="sitemap-label">{{ link.label }}</span>
    <Icon v-if="link.external" name="openNewWindow" :size="20" class="sitemap-ext" />
  </RouterLink>
  <button v-else type="button">
    <span class="sitemap-label">{{ link.label }}</span>
    <Icon v-if="link.external" name="openNewWindow" :size="20" class="sitemap-ext" />
  </button>
</template>

<script setup lang="ts">
import Icon from '@/components/custom/icon/Icon.vue'
import type { MenuGroup, MenuLink } from '../composable/menu'

defineProps<{ link: MenuGroup | MenuLink }>()
</script>
