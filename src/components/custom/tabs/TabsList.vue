<script setup lang="ts">
import { type HTMLAttributes, computed, provide, toRefs } from "vue"
import { TabsList, type TabsListProps } from "reka-ui"
import { cn } from "@/lib/utils"
import { tabsListVariants } from "./index"

interface CustomProps extends TabsListProps {
  class?: HTMLAttributes["class"]
  variant?: "fill" | "line"
  scrollable?: boolean
  grow?: boolean
  size?: "default" | "sm" | "lg"
}

const props = withDefaults(defineProps<CustomProps>(), {
  variant: "fill",
  scrollable: false,
  grow: true, // 디폴트 true
  size: "default",
})

const delegatedProps = computed(() => {
  const { class: _, variant: __, scrollable: ___, grow: ____, size: _____, ...delegated } = props
  return delegated
})

const { variant, grow, size } = toRefs(props)
provide("tabsContext", { variant, grow, size })
</script>

<template>
  <TabsList
    v-bind="delegatedProps"
    :class="cn(tabsListVariants({ variant, scrollable }), props.class)"
  >
    <slot />
  </TabsList>
</template>