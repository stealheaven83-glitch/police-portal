<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "@/lib/utils"

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes["class"]
  /** PC(폭 1600 이상) 크기. `moSize` 없이 혼자 주면 모든 폭에서 이 크기다 */
  size?: 'lg' | 'md' | 'sm'
  /** 모바일(폭 1600 미만) 크기. 동작 규칙은 Button 과 같다 — InputField2 의 `mo-size` 가 넘겨준다 */
  moSize?: 'lg' | 'md' | 'sm'
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

/**
 * 모바일(폭 1600 미만) 크기 — 위와 **같은 값을 `mo:` 변형으로 한 벌 더** 갖고 있는 것뿐이다.
 *
 * ⚠ **`mo:` 를 런타임에 이어 붙이면 안 된다.** Tailwind 는 소스를 글자로 훑어 거기 있는
 * 클래스만 CSS 로 만든다 — 붙여 만든 조합은 규칙이 생성되지 않아 **조용히 아무 일도 안 한다**
 * (`lib/deviceStyle.ts` 주석의 실제 사고). 그래서 전부 박아서 적는다. 줄이려 하지 말 것.
 */
const setMoSizeClass = (moSize:string) => {
  if(moSize === 'md') return `mo:h-12 mo:text-[1.5rem] mo:pl-4 mo:pr-3 mo:rounded-sm`;
  if(moSize === 'sm') return `mo:h-10 mo:text-[1.5rem] mo:pl-4 mo:pr-3 mo:rounded-sm`;
  return `mo:h-14 mo:text-[1.9rem] mo:px-4 mo:pr-4 mo:rounded-md`;
}

/** size 가 없으면 moSize 가 그 자리를 대신한다(= 모든 폭에서 모바일 크기) */
const baseSize = computed(() => props.size ?? props.moSize)

/** 반응형(둘 다 준 경우)일 때만 mo: 한 벌을 덧붙인다 */
const moSizeClass = computed(() =>
  props.size && props.moSize ? setMoSizeClass(props.moSize) : undefined,
)
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
      setSizeClass(baseSize),
      moSizeClass,
      props.class,
    )"
  >
</template>
