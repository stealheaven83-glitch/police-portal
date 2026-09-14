<script setup lang="ts">
import { type HTMLAttributes, computed, provide, toRefs } from "vue"
import { TabsList, type TabsListProps } from "reka-ui"
import { cn } from "@/lib/utils"
import { tabsListVariants } from "./index"

interface CustomProps extends TabsListProps {
  class?: HTMLAttributes["class"]
  variant?: "fill" | "line" | "chip" | "category"
  /** Figma: tab > Type. 활성 탭의 파랑 계열. inherit면 기존 동작 그대로 */
  tone?: "inherit" | "primary" | "secondary"
  scrollable?: boolean
  grow?: boolean
  size?: "default" | "sm" | "lg"
}

const props = withDefaults(defineProps<CustomProps>(), {
  variant: "fill",
  tone: "inherit",
  scrollable: false,
  grow: true, // 디폴트 true
  size: "default",
})

const delegatedProps = computed(() => {
  const { class: _, variant: __, scrollable: ___, grow: ____, size: _____, tone: ______, ...delegated } = props
  return delegated
})

const { variant, tone, grow, size } = toRefs(props)
provide("tabsContext", { variant, tone, grow, size })
</script>

<template>
  <TabsList
    v-bind="delegatedProps"
    :class="cn(tabsListVariants({ variant, scrollable }), props.class)"
  >
    <slot />
  </TabsList>
</template>