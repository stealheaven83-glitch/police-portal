<template>
  <nav aria-label="Breadcrumb">
    <ol class="breadcrumb">
      <li 
        v-for="(item, index) in visibleItems" 
        :key="index" 
        class="breadcrumb__item"
      >
        <router-link 
          v-if="item.to" 
          :to="item.to"
          class="breadcrumb__link"
        >
        <span v-if="index === 0" class="icon-home" aria-hidden="true"> <img
          v-if="index === 0"
          :src="homeIcon"
          alt=""
          class="w-4 h-4"
        /></span>
          {{ item.label }}
        </router-link>
        <span 
          v-else 
          class="breadcrumb__link"
        >
          <span v-if="index === 0" class="icon-home" aria-hidden="true"> <img
          v-if="index === 0"
          :src="homeIcon"
          alt=""
          class="w-4 h-4"
        /></span>
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useSideMenuStore } from '@/stores/menu/useSideMenu'
import homeIcon from '/portal/asset/images/icon/ico_home.svg'
const props = defineProps({
  items: { type: Array, required: true }
})

const sideMenuStore = useSideMenuStore()

/** 라벨 비교용 — LNB 타이틀은 '시스템 관리', 화면 navItems 는 '시스템관리' 처럼 띄어쓰기가 갈린다 */
function normalize(text) {
  return String(text ?? '').replace(/\s+/g, '')
}

/** 메뉴 노드(또는 그 하위)에서 처음 만나는 내부 라우트. href(외부 링크)는 건너뛴다 */
function firstPath(nodes) {
  for (const node of nodes) {
    if (node.path) return node.path
    if (node.children) {
      const found = firstPath(node.children)
      if (found) return found
    }
  }
  return undefined
}

/** 직계 자식 먼저, 없으면 손자 이하 — '출동수당' 처럼 1뎁스와 2뎁스에 같은 이름이 있을 때 가까운 쪽을 잡는다 */
function findInScope(nodes, label) {
  const direct = nodes.find(node => normalize(node.name) === label)
  if (direct) return direct
  for (const node of nodes) {
    if (node.children) {
      const found = findInScope(node.children, label)
      if (found) return found
    }
  }
  return undefined
}

/**
 * 카테고리 링크 — 화면이 path 를 안 준 항목은 현재 LNB(useSideMenuStore) 에서 같은 이름을 찾아
 * 그 항목의 path, 없으면 그 아래 첫 화면의 path 로 보낸다. LNB 타이틀('지역경찰')은 메뉴 전체의
 * 첫 화면으로. 어디에도 없으면 링크 없이 글자만 둔다(docs/create.md §3 — 죽은 링크를 만들지 않는다).
 * 앞 항목이 찾힌 노드의 children 으로 범위를 좁혀 가며 찾는다(브레드크럼 순서가 곧 메뉴 계층이다).
 * 마지막 항목(현재 페이지명)은 표시하지 않는다 — 화면은 navItems 를 그대로 넘기면 된다.
 */
const visibleItems = computed(() => {
  let scope = sideMenuStore.items
  return props.items.slice(0, -1).map(item => {
    if (item.path) return { label: item.label, to: item.path }
    const label = normalize(item.label)
    if (label === normalize(sideMenuStore.title)) {
      return { label: item.label, to: firstPath(sideMenuStore.items) }
    }
    const node = findInScope(scope, label)
    if (!node) return { label: item.label, to: undefined }
    if (node.children) scope = node.children
    return { label: item.label, to: node.path ?? firstPath(node.children ?? []) }
  })
})
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 13px;
  color: #666;
}
.breadcrumb__item{
  display: flex;
  align-items: center;

}
.breadcrumb__item .breadcrumb__link{
  display: flex;
  align-items: center;
  line-height:1;
}
.breadcrumb__item .breadcrumb__link .icon-home{
  display:flex;
  align-items: center;
  margin-right: 0.5rem;
}
.breadcrumb__item + .breadcrumb__item::before {
  content: "";
  display: inline-block;
  width: 1.2rem;
  height: 1.2rem;
  margin: 0 9px;
  background: url(/portal/asset/images/icon/ico_bread_arrow.svg) no-repeat center / 1.2rem auto;
}

.breadcrumb__link{
  text-decoration: underline;
}

.breadcrumb__current {
  font-weight: 600;
  color: #333;
}
</style>
