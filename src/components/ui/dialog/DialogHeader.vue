<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { deviceStyle } from "@/lib/deviceStyle"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="dialog-header"
    :class="cn(
      deviceStyle({
        pc: 'flex flex-col gap-2 text-center sm:text-left',
        mobile: ''
      }),
      props.class)"
  >
    <slot />
  </div>
</template>
