/**
 * 레이아웃 컴포넌트
 * 라우트의 메타 정보에 따라 MainLayout 또는 DefaultLayout을 동적으로 렌더링합니다.
 */
<template>
    <component :is="components[layout]" :layout-config="mainLayoutConfig">
      <template #main>
        <RouterView/>
      </template>
    </component>
  </template> 
<script setup lang="ts">
import { computed } from 'vue'
import MainLayout from './layouts/MainLayout.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'
import PortalLayout from './layouts/PortalLayout.vue'
import { useRoute } from 'vue-router'
import { getMenuConfig } from '@/composable/menu/menu'

// 현재 라우트 정보 가져오기
const route = useRoute()

// 사용 가능한 레이아웃 타입 정의
type LayoutType = 'DefaultLayout' | 'MainLayout' | 'PortalLayout'

// 레이아웃 컴포넌트 매핑
const components: Record<LayoutType, typeof DefaultLayout | typeof MainLayout | typeof PortalLayout> = {
  DefaultLayout,
  MainLayout,
  PortalLayout
}

// 라우트 메타 정보에 따라 레이아웃 결정
const layout = computed(() => (route.meta.layout as LayoutType) || 'DefaultLayout')

const mainLayoutConfig = computed(() => {
  return getMenuConfig()
})


</script>
