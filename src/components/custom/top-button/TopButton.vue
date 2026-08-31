<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { onMounted, onUnmounted, ref } from "vue"
import { ArrowUp } from "lucide-vue-next"
import { cn } from "@/lib/utils"

/**
 * 맨 위로(top_button): 스크롤을 페이지 최상단으로 되돌리는 떠 있는 버튼.
 * Figma: top_button (Type=[basic|label], 4171:163147) — basic 56px / label 64px + "위로"
 */
interface Props {
  /** basic=아이콘만, label=아이콘+"위로" (Figma: Type) */
  type?: "basic" | "label"
  /** 이 스크롤 위치(px)를 넘으면 나타난다. 0이면 항상 보인다 */
  showAfter?: number
  /** 스크롤 대상. 지정하지 않으면 window */
  target?: HTMLElement | null
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  type: "basic",
  showAfter: 200,
  target: null,
  class: undefined,
})

const visible = ref(props.showAfter === 0)

function scrollTarget(): HTMLElement | Window {
  return props.target ?? window
}

function onScroll() {
  if (props.showAfter === 0) return
  const top = props.target ? props.target.scrollTop : window.scrollY
  visible.value = top > props.showAfter
}

function toTop() {
  scrollTarget().scrollTo({ top: 0, behavior: "smooth" })
}

onMounted(() => {
  scrollTarget().addEventListener("scroll", onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => scrollTarget().removeEventListener("scroll", onScroll))
</script>

<template>
  <button
    v-show="visible"
    type="button"
    aria-label="맨 위로"
    :class="cn(
      'flex cursor-pointer items-center justify-center rounded-[var(--Radius-medium3)] border border-[var(--Border_gray02)] bg-white',
      'shadow-[0px_0px_1px_rgba(0,0,0,0.05),0px_4px_4px_rgba(0,0,0,0.08)]',
      type === 'label' ? 'size-16 flex-col' : 'size-14',
      props.class,
    )"
    @click="toTop"
  >
    <ArrowUp class="size-6 shrink-0 text-[var(--Text-body_0)]" />
    <span
      v-if="type === 'label'"
      class="text-center text-[1.5rem] leading-[1.5] whitespace-nowrap text-[var(--Text-body_0)]"
    >
      위로
    </span>
  </button>
</template>
