<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { cn } from "@/lib/utils"
import { badgeNumberVariants, type BadgeNumberVariants } from "."

interface Props {
  type?: BadgeNumberVariants["type"]
  value: number
  max?: number
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  type: "primary",
  max: 999,
  class: undefined,
})

const display = computed(() => (props.value > props.max ? `+${props.max}` : String(props.value)))
</script>

<template>
  <span
    data-slot="badge-number"
    :data-type="type"
    :class="cn(badgeNumberVariants({ type: type }), props.class)"
  >
    {{ display }}
  </span>
</template>
