<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { badgeDotVariants, type BadgeDotVariants } from "."

interface Props {
  type?: BadgeDotVariants["type"]
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  type: "primary",
  class: undefined,
})
</script>

<template>
  <span
    data-slot="badge-dot"
    :data-type="type"
    :class="cn(badgeDotVariants({ type: props.type }), props.class)"
  />
</template>
