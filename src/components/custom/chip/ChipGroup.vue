<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import Chip from "./Chip.vue"
import type { ChipVariants } from "."

export interface ChipItem {
  label: string
  value: string
  disabled?: boolean
}

/**
 * 칩 그룹: 단일(multiple=false, 라디오처럼) / 다중(multiple=true, 체크박스처럼) 선택.
 * v-model은 multiple 여부에 따라 string 또는 string[]이다.
 */
interface Props {
  items: ChipItem[]
  modelValue?: string | string[]
  multiple?: boolean
  size?: ChipVariants["size"]
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  multiple: false,
  size: "large",
  class: undefined,
})

const emit = defineEmits<{ (e: "update:modelValue", value: string | string[]): void }>()

function isChecked(value: string): boolean {
  if (props.multiple) return Array.isArray(props.modelValue) && props.modelValue.includes(value)
  return props.modelValue === value
}

function onToggle(value: string) {
  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? props.modelValue : []
    emit(
      "update:modelValue",
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    )
    return
  }
  emit("update:modelValue", props.modelValue === value ? "" : value)
}
</script>

<template>
  <div
    :role="multiple ? 'group' : 'radiogroup'"
    :class="cn('flex flex-wrap items-center gap-2', props.class)"
  >
    <Chip
      v-for="item in items"
      :key="item.value"
      :size="size"
      :label="item.label"
      :checked="isChecked(item.value)"
      :disabled="item.disabled"
      :multiple="multiple"
      @update:checked="onToggle(item.value)"
    />
  </div>
</template>
