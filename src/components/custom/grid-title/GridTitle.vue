<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

/**
 * Figma: Grid Title (Property 1=[Default|Search|BTNs])
 * 그리드/테이블 상단에 얹는 타이틀 바. 우측 영역은 슬롯으로 자유롭게 구성합니다
 * (검색조건 입력, 추가/삭제/저장 버튼 등 화면마다 다른 조합을 그대로 넣으면 됩니다).
 */
interface Props {
  title: string
  class?: HTMLAttributes["class"]
}

const props = defineProps<Props>()
</script>

<template>
  <div
    :class="cn(
      'flex items-center justify-between gap-[2.4rem] h-[6rem] px-[2.4rem]',
      'bg-[var(--Background-gray01)] border-t border-b border-[var(--Border_gray02)]',
      props.class,
    )"
  >
    <h3 class="text-[1.9rem] font-semibold leading-[1.5] text-[var(--Text-body_0)] shrink-0">
      {{ title }}
    </h3>
    <div v-if="$slots.default" class="flex items-center gap-2 min-w-0">
      <slot />
    </div>
  </div>
</template>
