<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { CircleHelp } from "lucide-vue-next"
import { cn } from "@/lib/utils"

/**
 * 도움말 열기 버튼(contextual_help_trigger).
 * 화면 우상단 "? 도움말"이 이것이다(예: PC_지역경찰_06_장비관리).
 * Figma: contextual_help_trigger (Type=[...3], State=[...3], 1249:53394)
 * ⚠ Type 3종의 정확한 구분은 확인하지 못해 label 유무로 갈음했다 — 디자인 확인 필요.
 */
interface Props {
  /** 버튼 옆 문구. 생략하면 아이콘만 */
  label?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  class: undefined,
})
</script>

<template>
  <button
    type="button"
    :aria-label="label ?? '도움말'"
    :class="cn(
      'inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-[var(--Border_gray02)] bg-white px-3 py-1',
      'text-[1.3rem] leading-[1.5] text-[var(--Base-primary)] hover:bg-[var(--Surface-primary)]',
      !label && 'size-6 justify-center border-0 bg-transparent p-0 hover:bg-transparent',
      props.class,
    )"
  >
    <CircleHelp class="size-4 shrink-0" />
    <span v-if="label" class="whitespace-nowrap">{{ label }}</span>
  </button>
</template>
