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

/**
 * 제목 크기 — 시안 PC 24 / 모바일 17, 줄간격 1.5.
 *
 * 줄간격은 `text-[...]/[1.5]` 로 글자크기와 **한 덩어리로** 적는다. 따로 `leading-[1.5]` 를
 * 쓰면 tailwind-merge 가 `text-*`(font-size)와 충돌 그룹으로 보고 **뒤에 오는 쪽만 남겨서**
 * 조용히 지워진다(`text-*` 가 `text-lg/7` 처럼 줄간격도 정할 수 있기 때문이다).
 * 실제로 이 파일에서 `leading-[1.5]` 가 계속 지워지고 있었고, body 상속값 1.5 와 같아
 * 화면이 안 바뀌는 바람에 드러나지 않았다(2026-09-16).
 */
const titleClass = computed(() =>
  deviceStyle(
    {
      pc: "text-[2.4rem]/[1.5] text-[var(--Text-body_0)] font-bold",
      mobile: "text-[1.7rem]/[1.5]",
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
