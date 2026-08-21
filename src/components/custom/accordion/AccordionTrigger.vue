<script setup lang="ts">
import type { AccordionTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ChevronDown } from "lucide-vue-next"
import { AccordionHeader, AccordionTrigger } from "reka-ui"
import { cn } from "@/lib/utils"
import { accordionTriggerVariants, type AccordionTriggerVariants } from "."

interface Props extends AccordionTriggerProps {
  class?: HTMLAttributes["class"]
  type?: AccordionTriggerVariants["type"]
  size?: AccordionTriggerVariants["size"]
}

const props = withDefaults(defineProps<Props>(), {
  type: "line",
  size: "large",
})

const delegatedProps = reactiveOmit(props, "class", "type", "size")
</script>

<template>
  <AccordionHeader class="flex">
    <AccordionTrigger
      data-slot="accordion-trigger"
      v-bind="delegatedProps"
      :class="cn(accordionTriggerVariants({ type, size }), props.class)"
    >
      <slot />
      <ChevronDown
        class="text-[var(--icon-gray)] pointer-events-none size-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
      />
    </AccordionTrigger>
  </AccordionHeader>
</template>
