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

          key 는 기본적으로 route.fullPath 라 URL이 바뀔 때마다 새 인스턴스를 만든다(의도된
          동작 — 별개 화면은 상태도 별개여야 함). 다만 한 컴포넌트가 여러 화면ID 라우트에
          걸쳐 있으면서(useAutoTrigger 로 URL↔내부 탭/팝업 상태를 동기화하는 화면, 예:
          PC-LPO-0701~0714) 그 화면ID 이동이 "새 화면"이 아니라 "같은 화면의 다른 상태"인
          경우엔 route.meta.screenGroup 을 공통으로 줘서 그 화면군 안에서는 key 가 안 바뀌게
          한다 — 그래야 화면ID가 바뀔 때마다 리마운트되어 팝업/입력 상태가 날아가지 않는다.
        -->
        <RouterView v-slot="{ Component }">
          <KeepAlive :include="bottomTabStore.cachedTabNames">
            <component :is="Component" :key="(route.meta.screenGroup as string | undefined) ?? route.fullPath" />
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
