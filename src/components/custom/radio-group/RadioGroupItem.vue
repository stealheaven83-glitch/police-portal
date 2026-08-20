<script setup lang="ts">
import type { RadioGroupItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Circle } from "lucide-vue-next"
import {
  RadioGroupIndicator,
  RadioGroupItem,
  useForwardProps,
} from "reka-ui"
import { cn } from "@/lib/utils"
import { radioItemVariants, type RadioItemVariants } from "./index"

interface Props extends RadioGroupItemProps {
  class?: HTMLAttributes["class"]
  variant?: RadioItemVariants["variant"]
  size?: RadioItemVariants["size"]
  label?: string
  labelClass?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  size: "default",
  label: undefined,
  labelClass: undefined,
})

const delegatedProps = reactiveOmit(props, "class", "variant", "size", "label", "labelClass")
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
<label
  :class="cn(
    'group inline-flex items-center has-[[disabled]]:cursor-not-allowed',
    label ? 'gap-2' : 'gap-0 align-top'
  )">
  <RadioGroupItem
    data-slot="radio-group-item"
    v-bind="forwardedProps"
    :class="
      cn(radioItemVariants({ variant, size }), props.class)
    "
  >
    <RadioGroupIndicator
      data-slot="radio-group-indicator"
      class="relative flex items-center justify-center"
    >
      <Circle
        :class="cn('fill-current dark:fill-[#0069CB] border-none', 'size-3')"
      />
    </RadioGroupIndicator>
  </RadioGroupItem>
  <span
    v-if="label"
    :class="cn(
      'select-none leading-none text-[#1E2124] group-has-[[disabled]]:text-[#8A949E] group-has-[[disabled]]:cursor-not-allowed',
      props.size === 'lg' ? 'text-[19px]' : 'text-[15px]',
      props.labelClass
    )"
  >
    {{  label }}
  </span>
</label>
</template>
