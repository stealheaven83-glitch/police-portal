<!--
  하단 동적 탭 바.
  useBottomTabStore 의 탭 목록을 그리고, 클릭/키보드로 탭 전환과 닫기를 처리한다.
  탭 자체를 만들거나 지우는 일은 화면(View)의 useBottomTabSetup 과 이 컴포넌트의
  닫기 버튼에서만 일어난다.
-->
<template>
  <div class="bottom-tab">
    <ul class="flex tab-ul" role="tablist">
      <li
        v-for="tab in bottomTabStore.tabs"
        :key="tab.value"
        role="tab"
        :class="{ active: tab.value === bottomTabStore.activeTab, disabled: tab.disabled }"
        :aria-selected="tab.value === bottomTabStore.activeTab"
        :aria-disabled="tab.disabled || undefined"
        :tabindex="tab.disabled ? -1 : 0"
        @click="selectTab(tab)"
        @keydown.enter.prevent="selectTab(tab)"
        @keydown.space.prevent="selectTab(tab)"
        @keydown.delete.prevent="closeTab(tab)"
      >
        <component :is="tab.icon" v-if="tab.icon" class="tab-icon" />
        <span class="tab-label">{{ tab.label }}</span>
        <button
          v-if="tab.closable !== false"
          class="tab-delete"
          type="button"
          :aria-label="`${tab.label} 닫기`"
          @click.stop="closeTab(tab)"
        ></button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useBottomTabStore } from '@/stores/tab/useBottomTab'
import type { BottomTabItem } from './types'

defineOptions({
  name: 'BottomTab',
})

const router = useRouter()
const bottomTabStore = useBottomTabStore()

/**
 * 탭 이동은 라우팅으로만 한다.
 * 화면이 다시 그려지면서 useBottomTabSetup 이 활성 탭을 맞춰주므로 여기서 활성화를
 * 따로 건드리지 않지만, path 가 없는 탭(라우트 없이 등록된 탭)은 직접 활성화한다.
 */
function selectTab(tab: BottomTabItem) {
  if (tab.disabled || tab.value === bottomTabStore.activeTab) return

  if (tab.path) {
    router.push(tab.path)
    return
  }
  bottomTabStore.setActiveTab(tab.value)
}

/** 활성 탭을 닫으면 스토어가 넘겨준 다음 탭으로 이동한다 */
function closeTab(tab: BottomTabItem) {
  const next = bottomTabStore.closeTab(tab.value)
  if (next?.path) router.push(next.path)
}
</script>

<style scoped>
/*
 * 본문 컬럼(.relative) 바닥에 걸어두고 translateY(100%) 로 회색 바 영역까지 끌어내린다.
 * 컬럼이 스크롤 컨테이너가 되면 탭이 내용을 따라다니므로, 스크롤은 안쪽 래퍼가 맡는다.
 * (WorkLayout.vue 주석 참고)
 */
.bottom-tab {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1;
  transform: translateY(100%);
  /* 탭이 많아져도 본문 폭을 넘어가지 않게 가로 스크롤로 흡수한다 */
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}
.bottom-tab::-webkit-scrollbar {
  display: none;
}
.tab-ul {
  height: 32px;
}
.tab-ul li {
  border: 1px solid #CDD1D5;
  border-top: 0;
  padding: 2px 8px;
  border-radius: 0 0 4px 4px;
  color: var(--Text-body_2);
  line-height: 3rem;
  white-space: nowrap;
  cursor: pointer;
  font-size: 1.5rem;
}
.tab-ul li.active {
  background: #fff;
  border-top: 1px solid #fff;
  box-shadow: 1px 2px 2px 0px #00000014;
  cursor: default;
}
.tab-ul li.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.tab-ul li:focus-visible {
  outline: 2px solid #0054A6;
  outline-offset: -2px;
}
.tab-ul li + li {
  margin-left: 2px;
}
.tab-icon {
  width: 1.6rem;
  height: 1.6rem;
  margin-right: 0.4rem;
}

@media (max-width: 1599.98px) {
  .bottom-tab {
    display: none;
  }
}
</style>
