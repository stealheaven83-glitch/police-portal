<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { Check } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { chipCheckIconSize, chipVariants, type ChipVariants } from "."

interface Props {
  size?: ChipVariants["size"]
  /** 선택 여부 */
  checked?: boolean
  disabled?: boolean
  label?: string
  /** 다중 선택 그룹이면 checkbox, 단일이면 radio로 읽힌다 */
  multiple?: boolean
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  size: "large",
  checked: false,
  disabled: false,
  label: undefined,
  multiple: false,
  class: undefined,
})

const emit = defineEmits<{ (e: "update:checked", value: boolean): void }>()

const state = computed<ChipVariants["state"]>(() =>
  props.disabled ? "disabled" : props.checked ? "checked" : "unchecked",
)
const iconPx = computed(() => chipCheckIconSize[props.size ?? "large"])
</script>

<template>
  <button
    type="button"
    :role="multiple ? 'checkbox' : 'radio'"
    :aria-checked="checked"
    :disabled="disabled"
    :class="cn(chipVariants({ size, state }), props.class)"
    @click="emit('update:checked', !checked)"
  >
    <Check
      v-if="checked"
      class="shrink-0"
      :style="{ width: `${iconPx}px`, height: `${iconPx}px` }"
    />
    <span class="whitespace-nowrap">
      <slot>{{ label }}</slot>
    </span>
    <slot name="icon" />
  </button>
</template>
