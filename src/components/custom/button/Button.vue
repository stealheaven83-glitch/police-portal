<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "."
import { computed } from "vue"
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"
import { buttonVariants } from "."

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
  /** 지정하면 min-width 가 0이 되고, 좌우 여백을 이 값으로 잡는다(숫자는 px). */
  padding?: string | number
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
})

const pad = computed(() => {
  if (props.padding === undefined) return undefined
  const raw = String(props.padding)
  const v = raw.trim() !== "" && !Number.isNaN(Number(raw)) ? `${raw}px` : raw
  return { paddingLeft: v, paddingRight: v }
})
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :type="as === 'button' ? 'button' : undefined"
    :style="pad"
    :class="cn(buttonVariants({ variant, size }), pad && 'min-w-0', props.class)"
  >
    <slot />
  </Primitive>
</template>
