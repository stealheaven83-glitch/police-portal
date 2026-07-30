<template>
  <div class="flex min-h-screen max-h-screen">
    <!-- 좌측 네비게이션 메뉴 -->
    <SidebarProvider>
      <Sidebar side="left" collapsible="none" class="w-64 bg-slate-800 text-white border-r border-slate-700">
        <SidebarHeader class="p-4 border-b border-slate-700">
          <h1 class="text-xl font-bold text-center text-white">{{ config.headerTitle }}</h1>
        </SidebarHeader>
        <SidebarContent class="py-4">
          <SidebarMenu class="px-2">
            <template v-for="(item, index) in config.menuItems" :key="index">
              <!-- Parent menu item with children -->
              <SidebarMenuItem v-if="item.children" class="mb-2 rounded-md overflow-hidden">
                <SidebarMenuButton
                  class="w-full text-slate-200 hover:bg-slate-700 hover:text-white rounded-md bg-transparent flex items-center justify-between"
                  @click="toggleMenu(index)">
                  <div class="flex items-center">
                    <component :is="item.icon" class="mr-2 h-5 w-5" />
                    <span>{{ item.title }}</span>
                  </div>
                  <ChevronDownIcon class="h-4 w-4 transition-transform duration-200"
                    :class="{ 'rotate-180': expandedMenus[index] }" />
                </SidebarMenuButton>
                <!-- Nested menu items -->
                <Transition enter-active-class="transition duration-100 ease-out"
                  enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                  leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
                  leave-to-class="transform scale-95 opacity-0">
                  <SidebarMenu v-show="expandedMenus[index]" class="ml-4 mt-2">
                    <SidebarMenuItem v-for="(child, childIndex) in item.children" :key="`${index}-${childIndex}`"
                      class="mb-2 rounded-md overflow-hidden">
                      <template v-if="child.path">
                        <router-link :to="child.path" class="w-full block">
                          <SidebarMenuButton
                            class="w-full text-slate-200 hover:bg-slate-700 hover:text-white rounded-md bg-transparent">
                            <component :is="child.icon" class="mr-2 h-5 w-5" />
                            <span>{{ child.title }}</span>
                          </SidebarMenuButton>
                        </router-link>
                      </template>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </Transition>
              </SidebarMenuItem>
              <!-- Regular menu item without children -->
              <SidebarMenuItem v-else class="mb-2 rounded-md overflow-hidden">
                <template v-if="item.path">
                  <router-link :to="item.path" class="w-full block">
                    <SidebarMenuButton
                      class="w-full text-slate-200 hover:bg-slate-700 hover:text-white rounded-md bg-transparent">
                      <component :is="item.icon" class="mr-2 h-5 w-5" />
                      <span>{{ item.title }}</span>
                    </SidebarMenuButton>
                  </router-link>
                </template>
              </SidebarMenuItem>
            </template>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <!-- 메인 콘텐츠 영역 -->
      <main class="flex-1 flex flex-col">
        <!-- 상단 페이지 타이틀 -->
        <header class="p-5 bg-gray-100 border-b border-gray-200 bg-white">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-800">{{ pageTitle }}</h1>
            <div v-if="authStore.user" class="flex items-center space-x-4">
              <button class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                <UserCircleIcon class="h-5 w-5" />
                <span>{{ authStore.user.adminNm }}</span>
              </button>
              <button @click="handleLogout"
                class="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors">
                <LogOutIcon class="h-4 w-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </header>

        <!-- 라우터 뷰 (메인 슬롯) -->
        <div class="px-0 py-4 flex-1 overflow-y-auto scrollbar-hide bg-gray-100">
          <router-view />
        </div>
      </main>
    </SidebarProvider>
  </div>
</template>

<script setup lang="ts">
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from '@/components/ui/sidebar'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronDownIcon, UserCircleIcon, LogOutIcon } from 'lucide-vue-next'
// import type { LayoutConfig } from '../../../composable/menu/menu'
// import { useApi } from '@/modules/api'
import { useAuthStore } from '@/stores/auth/useAuth'

// Define LayoutConfig interface locally or use any
interface LayoutConfig {
  headerTitle?: string
  menuItems?: any[]
}

const props = defineProps<{
  layoutConfig?: LayoutConfig
}>()

// const slots = defineSlots<{
//   main: () => any
// }>()

// const dialog = useDialog()
const route = useRoute()
const router = useRouter()
const config = (props.layoutConfig || { menuItems: [], headerTitle: '' }) as LayoutConfig
const pageTitle = ref('페이지 타이틀')
const expandedMenus = ref<Record<string | number, boolean>>({})
// const api = useApi()
const authStore = useAuthStore()

// 메뉴 토글 함수
const toggleMenu = (index: number) => {
  expandedMenus.value[index] = !expandedMenus.value[index]
}

// 현재 라우트에 해당하는 메뉴 자동 확장
watch(() => route.path, (newPath) => {
  if (config.menuItems) {
    config.menuItems.forEach((item: any, index: number) => {
      if (item.children && item.children.some((child: any) => child.path === newPath)) {
        expandedMenus.value[index] = true
      }
    })
  }
}, { immediate: true })

// 라우트가 변경될 때 페이지 타이틀 업데이트
watch(() => route.meta.title, (value) => {
  pageTitle.value = (value as string) || '페이지 타이틀'
}, { immediate: true })

const handleLogout = async () => {
  try {

    if (!window.confirm('로그아웃하시겠습니까?')) {
      return
    }

    //api.authApi.logout()

    router.push('/login')

  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}

</script>

<style scoped>
/* 활성 라우트 스타일링 */
.router-link-active .sidebar-menu-button,
.router-link-exact-active .sidebar-menu-button {
  background-color: var(--colors-slate-700);
  color: white;
  font-weight: 500;
}

/* 아이콘 색상 통일 */
.sidebar-menu-button svg {
  color: var(--colors-slate-400);
}

.router-link-active .sidebar-menu-button svg,
.router-link-exact-active .sidebar-menu-button svg,
.sidebar-menu-button:hover svg {
  color: var(--colors-white);
}
</style>
