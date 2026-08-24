/**
 * 레이아웃 컴포넌트
 * 라우트의 메타 정보에 따라 MainLayout 또는 DefaultLayout을 동적으로 렌더링합니다.
 */
<template>
    <component :is="components[layout]" :layout-config="mainLayoutConfig">
      <template #main>
        <!--
          하단 탭에 열려 있는 화면은 KeepAlive 로 상태를 붙들어 둔다.
          :include 는 컴포넌트 name 으로 걸리므로 화면의 defineOptions({ name }) 과
          BottomTabItem.componentName 이 일치해야 한다. (menu-tab-guide.md 5.2)
          탭을 닫으면 이름이 목록에서 빠지면서 인스턴스도 함께 해제된다.
        -->
        <RouterView v-slot="{ Component }">
          <KeepAlive :include="bottomTabStore.cachedTabNames">
            <component :is="Component" :key="route.fullPath" />
          </KeepAlive>
        </RouterView>
      </template>
    </component>
  </template> 
<script setup lang="ts">
import { computed } from 'vue'
import MainLayout from './layouts/MainLayout.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'
import PortalLayout from './layouts/PortalLayout.vue'
import WorkLayout from './layouts/WorkLayout.vue'
import { useRoute } from 'vue-router'
import { getMenuConfig } from '@/composable/menu/menu'
import { useBottomTabStore } from '@/stores/tab/useBottomTab'

// 현재 라우트 정보 가져오기
const route = useRoute()
const bottomTabStore = useBottomTabStore()

// 사용 가능한 레이아웃 타입 정의
type LayoutType = 'DefaultLayout' | 'MainLayout' | 'PortalLayout' | 'WorkLayout'

// 레이아웃 컴포넌트 매핑
const components: Record<LayoutType, typeof DefaultLayout | typeof MainLayout | typeof WorkLayout | typeof PortalLayout> = {
  DefaultLayout,
  MainLayout,
  PortalLayout,
  WorkLayout
}

// 라우트 메타 정보에 따라 레이아웃 결정
const layout = computed(() => (route.meta.layout as LayoutType) || 'DefaultLayout')

const mainLayoutConfig = computed(() => {
  return getMenuConfig()
})


</script>
