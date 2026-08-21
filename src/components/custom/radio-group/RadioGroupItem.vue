<script setup lang="ts">
import type { RadioGroupItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { computed, useId } from "vue"
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
  /** 라벨 아래 도움말 문구 (Figma: Help text) */
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  size: "default",
  label: undefined,
  labelClass: undefined,
  description: undefined,
})

const delegatedProps = reactiveOmit(props, "class", "variant", "size", "label", "labelClass", "description")
const forwardedProps = useForwardProps(delegatedProps)

const uid = useId()
const descId = computed(() => props.description ? `radio-desc-${uid}` : undefined)
</script>

<template>
<label
  :class="cn(
    'group inline-flex items-start has-[[disabled]]:cursor-not-allowed',
    label || description ? 'gap-2' : 'gap-0 align-top'
  )">
  <RadioGroupItem
    data-slot="radio-group-item"
    v-bind="forwardedProps"
    :aria-describedby="descId"
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
  <span v-if="label || description" class="flex flex-col">
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
    <span
      v-if="description"
      :id="descId"
      class="mt-1 text-[13px] leading-normal text-[var(--Text-body_2)] group-has-[[disabled]]:text-[var(--Text-body_disable)]"
    >
      {{ description }}
    </span>
  </span>
</label>
</template>
