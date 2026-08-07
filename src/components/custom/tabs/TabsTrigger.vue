<script setup lang="ts">
import { type HTMLAttributes, computed, inject, unref, type Ref } from "vue"
import { TabsTrigger, type TabsTriggerProps, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"
import { tabsTriggerVariants } from "./index"

interface CustomProps extends TabsTriggerProps {
  class?: HTMLAttributes["class"]
  variant?: "fill" | "line"
  grow?: boolean | null
  size?: "default" | "sm" | "lg"
}

const props = withDefaults(defineProps<CustomProps>(), {
  variant: undefined,
  grow: undefined,
  size: undefined,
})

const delegatedProps = computed(() => {
  const { class: _, variant: __, grow: ___, size: ____, ...delegated } = props
  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)

// 부모 TabList의 Context 주입
const parentContext = inject<{
  variant: Ref<"fill" | "line">
  grow: Ref<boolean>
  size: Ref<"default" | "sm" | "lg">
}>("tabsContext", {
  variant: computed(() => "fill"),
  grow: computed(() => true),
  size: computed(() => "default"),
})
const activeVariant = computed(() => props.variant ?? unref(parentContext.variant))
const activeGrow = computed(() => typeof props.grow === "boolean" ? props.grow : unref(parentContext.grow))
const activeSize = computed(() => props.size ?? unref(parentContext.size))
</script>

<template>
  <TabsTrigger
    v-bind="forwardedProps"
    :class="cn(tabsTriggerVariants({
      variant: activeVariant,
      grow: activeGrow,
      size: activeSize 
    }), props.class)"
  >
    <span class="truncate">
      <slot />
    </span>
  </TabsTrigger>
</template>
