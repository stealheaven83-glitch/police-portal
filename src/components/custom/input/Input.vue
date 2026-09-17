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
  <!--
    autocomplete="off" 기본값 — 사파리가 이 칸을 연락처로 추측해 오른쪽 끝에 자동완성 버튼
    (::-webkit-contacts-auto-fill-button)을 그리는 것을 막는다. 그 버튼은 InputField2 가
    같은 자리에 얹는 지우기·달력 아이콘과 겹친다.
    호출부에서 autocomplete 를 넘기면 fallthrough 로 그쪽이 이긴다(로그인 등).
  -->
  <input
    v-model="modelValue"
    data-slot="input"
    autocomplete="off"
    :class="cn(
      'border border-[var(--Border_input01)] font-normal w-full pl-4 bg-white',
      'focus-visible:border-[var(--Border_primary)] focus-visible:border-2 focus-visible:outline-0',
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
