<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

interface Props {
  class?: HTMLAttributes["class"]
  leftClass?: HTMLAttributes["class"]
  rightClass?: HTMLAttributes["class"]
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
})
</script>

<template>
  <div
    :class="cn(
      'flex items-center justify-between gap-5 py-4 max-[768px]:flex-col-reverse max-[768px]:items-start',
      props.class
    )"
  >
    <div :class="cn(props.leftClass)">
      <slot name="left" />
    </div>
    <div :class="cn(props.rightClass)">
      <slot name="right" />
    </div>
  </div>
</template>
