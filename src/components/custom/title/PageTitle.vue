<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { cn } from "@/lib/utils"
import { deviceStyle, type DeviceMode } from "@/lib/deviceStyle"

interface Props {
  title?: string
  as?: "h1" | "h2" | "h3"
  class?: HTMLAttributes["class"]
  /** 기기 정책. 'responsive'(기본) 폭 따라 / 'pc' 고정 / 'mobile' 고정 */
  device?: DeviceMode
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  as: "h1",
  device: "responsive",
})

/** 제목 크기 — 시안 PC 24 / 모바일 17 */
const titleClass = computed(() =>
  deviceStyle(
    {
      pc: "leading-[1.5] text-[2.4rem] text-[var(--Text-body_0)] font-bold",
      mobile: "text-[1.7rem]",
    },
    props.device,
  ),
)
</script>

<template>
  <component :is="as" :class="cn(titleClass, props.class)">
    <slot>{{ title }}</slot>
  </component>
</template>
