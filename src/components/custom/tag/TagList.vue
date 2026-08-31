<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

/** 태그 목록(tag__list): 태그를 가로로 나열하고 넘치면 줄바꿈한다 */
interface Props {
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), { class: undefined })
</script>

<template>
  <div :class="cn('flex flex-wrap items-center gap-2', props.class)">
    <slot />
  </div>
</template>
