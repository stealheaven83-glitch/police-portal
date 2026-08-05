<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
 } from '@/components/ui/select';

defineProps<{
  modelValue: string | null
  options: { label: string; value: any }[]
  placeholder?: string
  widthClass?: string
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits(['update:modelValue'])

</script>

<template>
  <Select :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <SelectTrigger :class="cn(widthClass ?? 'w-[auto]', $props.class)">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>