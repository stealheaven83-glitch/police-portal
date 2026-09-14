<script setup lang="ts">
import { type HTMLAttributes, computed, inject, unref, type Ref } from "vue"
import { TabsTrigger, type TabsTriggerProps, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"
import Icon from "@/components/custom/icon/Icon.vue"
import { tabsTriggerVariants } from "./index"

interface CustomProps extends TabsTriggerProps {
  class?: HTMLAttributes["class"]
  variant?: "fill" | "line" | "chip" | "category"
  /** Figma: tab > Type. 활성 탭의 파랑 계열. inherit면 기존 동작 그대로 */
  tone?: "inherit" | "primary" | "secondary"
  grow?: boolean | null
  size?: "default" | "sm" | "lg"
}

const props = withDefaults(defineProps<CustomProps>(), {
  variant: undefined,
  tone: undefined,
  grow: undefined,
  size: undefined,
})

const delegatedProps = computed(() => {
  const { class: _, variant: __, grow: ___, size: ____, tone: _____, ...delegated } = props
  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)

// 부모 TabList의 Context 주입
const parentContext = inject<{
  variant: Ref<"fill" | "line" | "chip" | "category">
  tone: Ref<"inherit" | "primary" | "secondary">
  grow: Ref<boolean>
  size: Ref<"default" | "sm" | "lg">
}>("tabsContext", {
  variant: computed(() => "fill"),
  tone: computed(() => "inherit"),
  grow: computed(() => true),
  size: computed(() => "default"),
})
const activeVariant = computed(() => props.variant ?? unref(parentContext.variant))
const activeTone = computed(() => props.tone ?? unref(parentContext.tone) ?? "inherit")
const activeGrow = computed(() => typeof props.grow === "boolean" ? props.grow : unref(parentContext.grow))
const activeSize = computed(() => props.size ?? unref(parentContext.size))
</script>

<template>
  <TabsTrigger
    v-bind="forwardedProps"
    :class="cn(tabsTriggerVariants({
      variant: activeVariant,
      tone: activeTone,
      grow: activeGrow,
      size: activeSize
    }), props.class)"
  >
    <!-- chip 변형: 활성 탭에만 체크 아이콘(Figma chip__single checked). 상태는 reka-ui 가 트리거에 data-state 로 찍는다 -->
    <Icon
      v-if="activeVariant === 'chip'"
      name="check"
      :size="16"
      class="hidden shrink-0 group-data-[state=active]:block"
      aria-hidden="true"
    />
    <span class="truncate">
      <slot />
    </span>
  </TabsTrigger>
</template>
