<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { computed, useId } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Check, Minus } from "lucide-vue-next"
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "@/lib/utils"
import { checkboxVariants, type CheckboxVariants } from "./index"

interface Props extends CheckboxRootProps {
  class?: HTMLAttributes["class"]
  value?: string
  variant?: CheckboxVariants["variant"]
  size?: CheckboxVariants["size"]
  label?: string
  labelClass?: HTMLAttributes["class"]
  /** 라벨 아래 도움말 문구 (Figma: Help text) */
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  value: undefined,
  size: "default",
  label: undefined,
  labelClass: undefined,
  description: undefined,
})

const emits = defineEmits<CheckboxRootEmits>()

const delegatedProps = reactiveOmit(props, "class", "variant", "size", "label", "labelClass", "description")
const forwarded = useForwardPropsEmits(delegatedProps, emits)

const uid = useId()
const descId = computed(() => props.description ? `checkbox-desc-${uid}` : undefined)
</script>

<template>
<label class="group inline-flex items-start gap-2 has-[[disabled]]:cursor-not-allowed">
  <CheckboxRoot
      v-slot="slotProps"
      data-slot="checkbox"
      v-bind="forwarded"
      :aria-describedby="descId"
      :class="cn(checkboxVariants({ variant, size }), props.class)"
    >
      <CheckboxIndicator
        data-slot="checkbox-indicator"
        class="grid place-content-center text-current transition-none"
      >
        <slot v-bind="slotProps">
          <Minus v-if="variant === 'minus'" class="size-3.5 stroke-[3]" />
          <Check v-else class="size-3.5  stroke-[3]" />
        </slot>
      </CheckboxIndicator>
    </CheckboxRoot>
    <span v-if="label || description" class="flex flex-col">
      <span
        v-if="label"
        :class="cn(
          'select-none leading-none text-[#1E2124] group-has-[[disabled]]:text-[#8A949E] group-has-[[disabled]]:cursor-not-allowed',
            props.size === 'lg' ? 'text-[19px]' : 'text-[15px]',
            props.labelClass
        )"
      >
        {{ label }}
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
