<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "@/lib/utils"

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes["class"]
  size?: 'lg' | 'md' | 'sm'
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const setSizeClass = (size:string = 'lg') => {
  let sizeClass = `h-14 text-[1.9rem] px-4 rounded-md pr-4`;
  if(size === 'md'){
    sizeClass = `h-12 text-[1.5rem] pl-4 pr-3 rounded-sm pr-3`;
  }else if(size === 'sm'){
    sizeClass = `h-10 text-[1.5rem] pl-4 pr-3 rounded-sm pr-3`;
  }
  return sizeClass; 
}
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :class="cn(
      'border border-[var(--Border_input01)] font-normal w-full pl-4 bg-white',
      'focus-visible:border-[var(--Border_primary)] focus-visible:border-2',
      'placeholder:text-[var(--Text-body_disable)]',
      'disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[var(--disabled-input-border)] disabled:bg-[var(--disabled-input-bg)] disabled:text-[var(--disabled-input-text-color)]',
      // 'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      // 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      setSizeClass(size),
      props.class,
    )"
  >
</template>
