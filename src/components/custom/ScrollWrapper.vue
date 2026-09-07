<template>
  <div class="h-full flex-1 overflow-y-auto" :class="class">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue"
  const props = defineProps<{
    class?: HTMLAttributes["class"]
  }>()
</script>
