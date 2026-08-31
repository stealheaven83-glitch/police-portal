<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useSlots } from "vue"
import { Info } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import {
  infoBoxBodyVariants,
  infoBoxTitleVariants,
  infoBoxVariants,
  type InfoBoxVariants,
} from "."

interface Props {
  /** 색상 계열 (Figma: Type) */
  type?: InfoBoxVariants["type"]
  /** Default=제목+본문+목록, slim=한 줄 (Figma: Size) */
  size?: InfoBoxVariants["size"]
  /** 제목. size="default"에서만 표시된다 */
  title?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  type: "primary",
  size: "default",
  title: undefined,
  class: undefined,
})

const slots = useSlots()
</script>

<template>
  <div :class="cn(infoBoxVariants({ type, size }), props.class)">
    <!-- slim: 아이콘 + 본문 한 줄 -->
    <template v-if="size === 'slim'">
      <Info class="size-5 shrink-0 text-[var(--Base-secondary)]" />
      <p :class="infoBoxBodyVariants({ type, size })">
        <slot />
      </p>
    </template>

    <!-- default: 아이콘+제목 / 본문 / 구분선 / 목록 -->
    <template v-else>
      <div class="flex w-full items-center gap-2">
        <Info class="size-5 shrink-0 text-[var(--Base-secondary)]" />
        <p v-if="title" :class="infoBoxTitleVariants({ type })">{{ title }}</p>
      </div>

      <div class="flex w-full flex-col items-start gap-3 pl-[2.8rem]">
        <p class="w-full text-[1.5rem] leading-[1.5] text-[var(--Text-body_1)]">
          <slot />
        </p>
        <template v-if="slots.list">
          <div class="h-0 w-full border-t border-dotted border-[var(--Border_gray02)]" />
          <div class="flex w-full flex-col items-start gap-2">
            <slot name="list" />
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
