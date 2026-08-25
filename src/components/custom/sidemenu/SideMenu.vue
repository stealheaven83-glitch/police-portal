<script setup lang="ts">
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
              :class="{ active: sideMenuStore.activeChild === child.name }"
            >
              <a
                :href="child.href ?? '#'"
                :target="child.href ? '_blank' : undefined"
                :rel="child.href ? 'noopener noreferrer' : undefined"
                :aria-current="sideMenuStore.activeChild === child.name ? 'page' : undefined"
                @click="selectChild($event, child)"
              >
                <span>{{ child.name }}</span>
                <span v-if="child.href" class="external" aria-label="새 창으로 열림"></span>
              </a>
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
  padding: 2.4rem 0 0 3.6rem;
  width: 28.6rem;
  flex-shrink: 0;
  overflow-y: auto;
  /* 스크롤바가 나타났다 사라져도 메뉴 폭이 흔들리지 않게 자리를 미리 잡아둔다 */
  scrollbar-gutter: stable;
  /* 메뉴 끝까지 내렸을 때 본문이 따라 스크롤되지 않도록 */
  overscroll-behavior: contain;
}

/* 사이드바 폭(31.6rem) 확보가 어려운 좁은 화면에서는 본문 폭을 우선한다. */
@media (max-width: 82rem) {
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
.left-menu .lnb .depth1 .depth1-item .depth1-btn.is-open {
  border-bottom: 2px solid var(--Border_primary);
}
.left-menu .lnb .depth1 .depth1-item .depth1-btn {
  position: relative;
  text-align: left;
  font-weight: 600;
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
  padding: 1.6rem 2.8rem 1.6rem 0;
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
.left-menu .lnb .depth1 .depth2 .depth2-item a {
  position: relative;
  display: block;
  padding: 1.2rem 1.6rem;
  font-weight: 600;
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
.left-menu .lnb .depth1 .depth2 .depth2-item a:hover:after {
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
.left-menu .lnb .depth2-item a {
  outline: none;
}
.left-menu .lnb .depth1-item .depth1-btn:focus-visible,
.left-menu .lnb .depth2-item a:focus-visible {
  outline: 2px solid var(--Border_primary);
  outline-offset: -2px;
}
</style>
