<script setup lang="ts">
import type { SwitchRootEmits, SwitchRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Check, X } from "lucide-vue-next"
import {
  SwitchRoot,
  SwitchThumb,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "@/lib/utils"
import { switchVariants, switchThumbVariants, switchIconVariants,  type SwitchVariants } from "./index"

interface Props extends SwitchRootProps {
  class?: HTMLAttributes["class"]
  variant?: SwitchVariants["variant"]
  size?: SwitchVariants["size"]
  label?: string
  labelClass?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  size: "default",
  label: undefined,
  labelClass: undefined,
})

const emits = defineEmits<SwitchRootEmits>()
const delegatedProps = reactiveOmit(props, "class", "variant", "size", "label", "labelClass")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
<label class="group inline-flex items-center gap-2 has-[[disabled]]:cursor-not-allowed">
  <SwitchRoot
    v-slot="{ modelValue }"
    data-slot="switch"
    v-bind="forwarded"
    :class="cn(switchVariants({ variant, size }), props.class)"
  >
    <SwitchThumb
      data-slot="switch-thumb"
      :class="cn(switchThumbVariants({ size }))"
    >
      <slot name="thumb" :checked="modelValue">
        <!-- 기본 아이콘(Check/X) -->
        <template v-if="variant === 'default'">
          <Check
          v-if="modelValue"
          :class="cn(switchIconVariants({ size }), 'text-[#0054A6]')"
          />
          <!-- X 아이콘 -->
          <X
            v-else
            :class="cn(switchIconVariants({ size }), 'text-[#B1B8BE]')"
            />
          </template>
          <!-- // 기본 아이콘(Check/X) -->
         <!-- variant: none 일 시 아이콘X -->
      </slot>
    </SwitchThumb>
  </SwitchRoot>
  <!-- label prop이 있을 때만 텍스트 표시 -->
  <span
    v-if="label"
    :class="cn(
      'select-none text-[#1E2124] peer-disabled:text-[#8A949E] peer-disabled:cursor-not-allowed', 
      props.size === 'lg' ? 'text-[17px]' : 'text-[15px]',
      props.labelClass
    )"
  >
    {{ label }}
  </span>
</label>
</template>
