<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

interface Props {
  /** 번호 목록이면 <ol>로 렌더 (Figma: Type=ordered) */
  ordered?: boolean
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  ordered: false,
  class: undefined,
})
</script>

<template>
  <component
    :is="ordered ? 'ol' : 'ul'"
    :class="cn('flex w-full flex-col items-start gap-2', props.class)"
  >
    <slot />
  </component>
</template>
