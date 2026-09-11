<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { useBreakpoint } from '@/composable/responsive/useResponsive.ts'


interface Props {
  title?: string
  as?: "h1" | "h2" | "h3"
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  as: "h1",
})

const isMobile = useBreakpoint('<=');
</script>

<template>
  <component :is="as" :class="cn(
    'leading-[1.5] text-[2.4rem] text-[var(--Text-body_0)] font-bold',
    isMobile? 'text-[1.7rem]' : '',
    props.class)">
    <slot>{{ title }}</slot>
  </component>
</template>
