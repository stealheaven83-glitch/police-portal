<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { DialogContentEmits, DialogContentProps } from "reka-ui"
import { useForwardPropsEmits } from "reka-ui"
import { DrawerContent } from "vaul-vue"
import { reactiveOmit } from "@vueuse/core"
import { cn } from "@/lib/utils"
import DrawerPortal from "./DrawerPortal.vue"
import DrawerOverlay from "./DrawerOverlay.vue"

const props = withDefaults(
  defineProps<DialogContentProps & { class?: HTMLAttributes["class"], showHandle?: boolean }>(),
  { showHandle: true },
)
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, "class", "showHandle")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerContent
      data-slot="drawer-content"
      v-bind="forwarded"
      :class="cn(
        'bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border',
        props.class,
      )"
    >
      <div v-if="showHandle" class="bg-muted mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full" />
      <slot />
    </DrawerContent>
  </DrawerPortal>
</template>
