<script setup lang="ts">
import { DrawerPortal, type DrawerPortalProps } from "vaul-vue"

const props = defineProps<DrawerPortalProps>()
</script>

<template>
  <DrawerPortal data-slot="drawer-portal" v-bind="props">
    <slot />
  </DrawerPortal>
</template>
