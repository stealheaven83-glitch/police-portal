<script setup lang="ts">
import type { AccordionContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { AccordionContent } from "reka-ui"
import { cn } from "@/lib/utils"
import { accordionContentVariants, type AccordionContentVariants } from "."

interface Props extends AccordionContentProps {
  class?: HTMLAttributes["class"]
  type?: AccordionContentVariants["type"]
  size?: AccordionContentVariants["size"]
}

const props = withDefaults(defineProps<Props>(), {
  type: "line",
  size: "large",
})

const delegatedProps = reactiveOmit(props, "class", "type", "size")
</script>

<template>
  <AccordionContent
    data-slot="accordion-content"
    v-bind="delegatedProps"
    class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden"
  >
    <div :class="cn(accordionContentVariants({ type, size }), props.class)">
      <slot />
    </div>
  </AccordionContent>
</template>
