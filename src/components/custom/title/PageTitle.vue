<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

interface Props {
  title?: string
  as?: "h1" | "h2" | "h3"
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  as: "h1",
})
</script>

<template>
  <component :is="as" :class="cn('leading-[1.5] text-[2.4rem] text-[var(--Text-body_0)] font-bold', props.class)">
    <slot>{{ title }}</slot>
  </component>
</template>
