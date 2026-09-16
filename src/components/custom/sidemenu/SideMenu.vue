<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSideMenuStore } from '@/stores/menu/useSideMenu'
import type { SideMenuItem } from '@/composable/menu/sidemenu/types'

/**
 * 사이드메뉴(LNB).
 * 표시할 내용은 화면(View)이 useSideMenuSetup 으로 등록한 스토어 상태를 그대로 그린다.
 * (예전에는 items 를 props 로 받았지만, 화면마다 메뉴가 달라져 스토어로 옮겼다)
 */
const router = useRouter()
const sideMenuStore = useSideMenuStore()
const openDepth2 = ref('')

function containsActive(item: SideMenuItem): boolean {
  return item.name === sideMenuStore.activeChild
    || item.children?.some(containsActive) === true
}

watch(
  () => [sideMenuStore.items, sideMenuStore.activeChild] as const,
  () => {
    for (const item of sideMenuStore.items) {
      const activeBranch = item.children?.find((child) => child.children?.some(containsActive))
      if (activeBranch) {
        openDepth2.value = activeBranch.name
        return
      }
    }
  },
  { immediate: true, deep: true },
)

/**
 * 메뉴 항목 클릭.
 * 외부 링크는 기본 동작(새 창)에 맡긴다 — 가운데 클릭·새 탭으로 열기 같은 브라우저 기능을
 * 그대로 쓸 수 있어야 하기 때문이다. 내부 경로만 라우터로 넘긴다.
 */
function selectChild(event: MouseEvent, child: SideMenuItem) {
  sideMenuStore.setActiveChild(child.name)

  if (child.href) return

  event.preventDefault()
  if (child.path) router.push(child.path)
}

function toggleDepth2(name: string) {
  openDepth2.value = openDepth2.value === name ? '' : name
}
</script>

<template>
  <div class="left-menu">
    <nav class="lnb">
      <h3 class="title">{{ sideMenuStore.title }}</h3>
      <ul class="depth1">
        <li
          v-for="(item, index) in sideMenuStore.items"
          :key="item.name"
          class="depth1-item"
        >
          <button
            class="depth1-btn"
            :class="{ 'is-open': sideMenuStore.openIndex === index, 'no-child': !item.children }"
            type="button"
            :aria-expanded="item.children ? sideMenuStore.openIndex === index : undefined"
            @click="item.children ? sideMenuStore.toggleDepth1(index) : selectChild($event, item)"
          >
            {{ item.name }}
          </button>
          <ul class="depth2">
            <li
              v-for="child in item.children"
              :key="child.name"
              class="depth2-item"
              :class="{
                active: sideMenuStore.activeChild === child.name,
                'has-child': child.children,
                'is-open': child.children && openDepth2 === child.name,
              }"
            >
              <button
                v-if="child.children"
                type="button"
                class="depth2-btn"
                :aria-expanded="openDepth2 === child.name"
                @click="toggleDepth2(child.name)"
              >
                <span>{{ child.name }}</span>
              </button>
              <a
                v-else
                :href="child.href ?? '#'"
                :target="child.href ? '_blank' : undefined"
                :rel="child.href ? 'noopener noreferrer' : undefined"
                :aria-current="sideMenuStore.activeChild === child.name ? 'page' : undefined"
                @click="selectChild($event, child)"
              >
                <span>{{ child.name }}</span>
                <span v-if="child.href" class="external" aria-label="새 창으로 열림"></span>
              </a>
              <ul v-if="child.children" class="depth3">
                <li
                  v-for="grandchild in child.children"
                  :key="grandchild.name"
                  class="depth3-item"
                  :class="{ active: sideMenuStore.activeChild === grandchild.name }"
                >
                  <a
                    :href="grandchild.href ?? '#'"
                    :target="grandchild.href ? '_blank' : undefined"
                    :rel="grandchild.href ? 'noopener noreferrer' : undefined"
                    :aria-current="sideMenuStore.activeChild === grandchild.name ? 'page' : undefined"
                    @click="selectChild($event, grandchild)"
                  >
                    <span>{{ grandchild.name }}</span>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
/*
 * .work-main 이 height:100vh 로 잠긴 flex 컨테이너라, 이 메뉴는 화면 높이만큼만
 * 늘어난다. 메뉴 항목이 그보다 길면(뎁스를 펼친 경우 등) 넘치는 부분이 화면 밖으로
 * 잘려 나가고 문서 스크롤도 없어서 볼 방법이 없다. 그래서 메뉴가 스스로 스크롤한다.
 */
.left-menu {
  padding: 2.4rem 0 2.4rem 4rem;
  width: 29.5rem;
  flex-shrink: 0;
  overflow-y: auto;
  /* 스크롤바가 나타났다 사라져도 메뉴 폭이 흔들리지 않게 자리를 미리 잡아둔다 */
  scrollbar-gutter: stable;
  /* 메뉴 끝까지 내렸을 때 본문이 따라 스크롤되지 않도록 */
  overscroll-behavior: contain;
}

/* 사이드바 폭(31.6rem) 확보가 어려운 좁은 화면에서는 본문 폭을 우선한다. */
@media (max-width: 1599.98px) {
  .left-menu {
    display: none;
  }
}
.left-menu .lnb {
  overflow: hidden;
}
.left-menu .lnb .title {
  border-radius: 2rem 2rem 0 0;
  height: 7.8rem;
  color: #fff;
  font-weight: 700;
  font-size: 2rem;
  background: var(--Base-secondary);
  text-align: center;
  align-content: center;
}
.left-menu .lnb .depth1 {
  padding: 1.2rem 2.4rem;
  border-radius: 0 0 1.2rem 1.2rem;
  border: 1px solid var(--Border_gray0);
}
.left-menu .lnb .depth1 .depth1-item {
  border-bottom: 1px solid var(--Border_gray03);
}

.left-menu .lnb .depth1 .depth1-item:last-child{
  border-bottom:0;
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn.is-open {
  border-bottom: 2px solid var(--Border_primary);
  font-weight: 700;
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn {
  position: relative;
  text-align: left;
  font-weight: 600;
  font-size: 1.7rem;
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn.no-child:after, .left-menu .lnb .depth1 .depth1-item .depth1-btn.no-child::before {
  display: none;
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn::after, .left-menu .lnb .depth1 .depth1-item .depth1-btn::before {
  content: "";
  display: block;
  position: absolute;
  background: #33363d;
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn::after {
  top: 27px;
  right: 0;
  width: 12px;
  height: 2px;
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn::before {
  top: 22px;
  right: 5px;
  width: 2px;
  height: 12px;
  transition: all 0.5s;
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn.is-open {
  color: var(--Base-primary);
  border-bottom: 2px solid var(--Border_primary);
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn.is-open + .depth2 {
  max-height: none;
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn.is-open::before {
  transform: rotate(-90deg);
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn {
  padding: 1.6rem 3.2rem 1.6rem 0;
  width: 100%;
}
.left-menu .lnb .depth1 .depth2 {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s ease;
}
.left-menu .lnb .depth1 .depth2 .depth2-item:first-child {
  padding-top: 1.2rem;
}
.left-menu .lnb .depth1 .depth2 .depth2-item:last-child {
  margin-bottom: 1.2rem;
}
.left-menu .lnb .depth1 .depth2 .depth2-item > a,
.left-menu .lnb .depth1 .depth2 .depth2-btn {
  position: relative;
  display: block;
  width: 100%;
  text-align: left;
  padding: 1.2rem 1.6rem;
  font-weight: 600;
  font-size: 1.5rem;
}
.left-menu .lnb .depth1 .depth2 .depth2-item.active a {
  background: var(--Surface-primary);
  color: var(--Base-primary);
  font-weight: 700;
  border-radius: 0.8rem;
}
.left-menu .lnb .depth1 .depth2 .depth2-item a:hover {
  background: var(--Surface-primary);
  color: var(--Base-primary);
  font-weight: 700;
  border-radius: 0.8rem;
}
.left-menu .lnb .depth1 .depth2 .depth2-item.has-child > .depth2-btn::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 1.6rem;
  width: 1.2rem;
  height: 0.2rem;
  background: currentColor;
}
.left-menu .lnb .depth1 .depth3 {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.left-menu .lnb .depth1 .depth2-item.is-open > .depth3 {
  max-height: 30rem;
}
.left-menu .lnb .depth1 .depth3-item a {
  position: relative;
  display: block;
  padding: 1rem 2.8rem;
  font-size: 1.5rem;
  font-weight: 400;
}
.left-menu .lnb .depth1 .depth3-item a::before {
  content: "·";
  margin-right: 0.8rem;
}
.left-menu .lnb .depth1 .depth3-item.active a,
.left-menu .lnb .depth1 .depth3-item a:hover {
  background: var(--Surface-primary);
  color: var(--Base-primary);
  font-weight: 700;
  border-radius: 0.8rem;
}
.left-menu .lnb .depth1 .depth3-item.active a::after,
.left-menu .lnb .depth1 .depth3-item a:hover::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 2rem;
  width: 0.8rem;
  height: 0.8rem;
  border-top: 2px solid var(--Border_primary);
  border-right: 2px solid var(--Border_primary);
  transform: translateY(-50%) rotate(45deg);
}
.left-menu .lnb .depth1 .depth2 .depth2-item a:hover:after,.left-menu .lnb .depth1 .depth2 .depth2-item.active a:after {
  content: "";
  display: block;
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 8px;
  height: 8px;
  border-right: 2px solid var(--Border_primary);
  border-top: 2px solid var(--Border_primary);
  transform: rotate(45deg);
}
/* 외부 시스템으로 나가는 항목(Pre-CAS 등)에 붙는 표시 */
.left-menu .lnb .depth2-item .external {
  display: inline-block;
  margin-left: 0.6rem;
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid currentColor;
  border-radius: 0.2rem;
  opacity: 0.6;
  vertical-align: middle;
}

.left-menu .lnb .depth1-item .depth1-btn,
.left-menu .lnb .depth2-item a,
.left-menu .lnb .depth2-btn,
.left-menu .lnb .depth3-item a {
  outline: none;
}
.left-menu .lnb .depth1-item .depth1-btn:focus-visible,
.left-menu .lnb .depth2-item a:focus-visible,
.left-menu .lnb .depth2-btn:focus-visible,
.left-menu .lnb .depth3-item a:focus-visible {
  outline: 2px solid var(--Border_primary);
  outline-offset: -2px;
}
</style>
