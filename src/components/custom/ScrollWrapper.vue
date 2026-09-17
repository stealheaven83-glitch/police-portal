<template>
  <!--
    has-scroll — 스크롤이 실제로 생겼을 때만 붙는다. 없을 때도 폭을 넓히면
    스크롤바 자리가 비어 있을 뿐이라 내용이 그만큼 삐져나간다.

    스크롤바 모양(색·모서리·여백)은 police-override.css 가 전역으로 갖는다 — 여기 없다.
    스크롤 주체가 이 컴포넌트가 아닌 화면도 많아서(LayoutPanel 본문 등) 전역이어야 한다.
  -->
  <div
    ref="rootRef"
    class="scroll-wrapper"
    :class="[{ 'has-scroll': isScrollable }, props.class]"
    :data-scrollable="isScrollable"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ref } from "vue"
import { useIsScrollable } from "@/composable/scroll/useIsScrollable"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const rootRef = ref<HTMLElement | null>(null)

/**
 * 지금 세로 스크롤이 생겼나.
 * 감지 로직은 composable 에 둔다 — 스크롤하는 엘리먼트가 화면마다 다르기 때문이다
 * (.scroll-wrapper · .layoutPanelBody · .lp-page-scroll …). 그쪽들도 같은 함수를 쓴다.
 */
const isScrollable = useIsScrollable(rootRef)

defineExpose({ isScrollable })
</script>

<style scoped>
/*
 * 폭만 여기 있다. 스크롤바 모양은 전역(police-override.css) — CLAUDE.md §2.
 * 넓히는 값은 자리마다 달라서 공통으로 못 뺀다(페이지 본문 · 패널 본문 · 팝업 본문).
 */
.scroll-wrapper {
  width: 100%;
  height: 100%;
  flex: 1;
  overflow-y: auto;
}

/* 넓힌 만큼 padding 으로 도로 밀어 넣는다 — 본문 폭은 그대로 두고 스크롤바만 바깥으로 */
.scroll-wrapper.has-scroll {
  width: calc(100% + 3.6rem);
  padding-right: 3.6rem;
}
</style>
