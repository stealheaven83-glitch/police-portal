<template>
  <header class="site-map-header">
    <div class="container">
      <h2 class="logo">
        <RouterLink to="/">
          <img src="/portal/asset/images/img/img_logo.svg" alt="지역경찰포털" />
        </RouterLink>
      </h2>
      <Button variant="icon">
        <Icon name="closePop" size="32" />
      </Button>
    </div>
  </header>
  <!-- 1뎁스 탭. TabsContent 가 value 맞는 것만 렌더하므로 filter·v-if 가 필요 없다 -->
  <Tabs v-model="activeSection">
    <TabsList variant="line" tone="primary" :grow="false">
      <TabsTrigger v-for="section in menuSections" :key="section.id" :value="section.id">
        {{ section.label }}
      </TabsTrigger>
    </TabsList>

    <TabsContent v-for="section in menuSections" :key="section.id" :value="section.id">
      <h3>{{ section.label }}</h3>
      <ul>
        <li v-for="group in section.groups" :key="group.label">
          <h4>{{ group.label }}</h4>
          <ul>
            <li v-for="item in group.items" :key="item.label">{{ item.label }}</li>
          </ul>
        </li>
      </ul>
    </TabsContent>
  </Tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/custom/button'
import Icon from '@/components/custom/icon/Icon.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/custom/tabs'
import { menuSections } from './composable/menu'

defineOptions({ name: 'SiteMapMenu' })

const router = useRouter()

const activeSection = ref(menuSections[0].id)

/** 펼쳐 둔 4뎁스 항목. Figma 는 근무일지(甲)·(乙) 둘 다 펼친(−) 상태로 그려져 있다 */
const openItems = ref<string[]>(['근무일지|근무일지(甲)', '근무일지|근무일지(乙)'])

// 3뎁스 라벨은 구역이 달라도 겹칠 수 있어(게시판 '범죄예방진단') 2뎁스와 묶어 키로 쓴다
function keyOf(groupLabel: string, itemLabel: string) {
  return `${groupLabel}|${itemLabel}`
}

function isOpen(groupLabel: string, itemLabel: string) {
  return openItems.value.includes(keyOf(groupLabel, itemLabel))
}

function toggle(groupLabel: string, itemLabel: string) {
  const key = keyOf(groupLabel, itemLabel)
  // 배열은 제자리 수정하지 않고 재할당한다(CLAUDE.md §5)
  openItems.value = isOpen(groupLabel, itemLabel)
    ? openItems.value.filter(k => k !== key)
    : [...openItems.value, key]
}

function onClose() {
  router.back()
}
</script>
