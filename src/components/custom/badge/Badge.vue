<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { badgeVariants, type BadgeVariants } from "."

interface Props {
  color?: BadgeVariants["color"]
  variant?: BadgeVariants["variant"]
  size?: BadgeVariants["size"]
  shape?: BadgeVariants["shape"]
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  color: "primary",
  variant: "solid",
  size: "md",
  shape: "full",
  class: undefined,
})
</script>

<template>
  <span
    data-slot="badge"
    :data-color="color"
    :data-size="size"
    :data-shape="shape"
    :class="cn(badgeVariants({ color: props.color, variant: props.variant, size: props.size, shape: props.shape }), props.class)"
  >
    <slot />
  </span>
</template>
