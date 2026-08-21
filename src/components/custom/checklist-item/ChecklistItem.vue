<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

/**
 * Figma: check list (Property 1=[강조|체크|라디오|2줄])
 * 번호 매겨진 점검 항목 한 줄 + 우측 응답 영역(체크박스/라디오 등은 슬롯으로 구성).
 * 강조/체크/라디오는 우측에 무엇을 넣느냐의 차이일 뿐이라 이 컴포넌트는 레이아웃만 담당합니다.
 */
interface Props {
  /** 항목 번호 (1. 2. 3. ...) */
  number: number | string
  /** 항목 본문 */
  text: string
  /** 보조 설명. layout="inline" 이면 "(subText)" 형태로 이어붙고, "stacked" 면 다음 줄에 표시 */
  subText?: string
  layout?: "inline" | "stacked"
  /** true 면 본문을 굵게 표시 (Figma: 강조) */
  emphasis?: boolean
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  subText: undefined,
  layout: "inline",
  emphasis: false,
  class: undefined,
})
</script>

<template>
  <div
    :class="cn(
      'flex items-start justify-between gap-4 py-3 border-b border-[var(--Border_gray03)] last:border-b-0',
      props.class,
    )"
  >
    <div class="flex-1 min-w-0 text-[1.5rem] leading-[1.5] text-[var(--Text-body_0)]">
      <span :class="emphasis ? 'font-bold' : ''">{{ number }}. {{ text }}</span>
      <template v-if="subText">
        <span v-if="layout === 'inline'" class="text-[var(--Text-body_2)]"> ({{ subText }})</span>
        <div v-else class="pl-[1.8rem] text-[var(--Text-body_2)]">({{ subText }})</div>
      </template>
    </div>
    <div v-if="$slots.default" class="flex items-center gap-3 shrink-0">
      <slot />
    </div>
  </div>
</template>
