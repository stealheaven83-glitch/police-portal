<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useId } from "vue"
import { Info } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import Icon from "@/components/custom/icon/Icon.vue"
import { searchBarStatusVariants, searchBarVariants, type SearchBarStatusVariants } from "."

/**
 * 통합검색 대형 검색바. 자세한 설명과 형제 컴포넌트 구분은 ./index.ts 주석 참고.
 * Figma: Form (13315:97548) — 높이 80, 테두리 2px primary, 우측 원형 버튼 64.
 */
interface Props {
  /** 검색어 */
  modelValue?: string
  placeholder?: string
  /** 왼쪽 상태 뱃지 문구. 없으면 뱃지를 그리지 않는다(통합검색 화면이 그렇다) */
  status?: string
  statusTone?: SearchBarStatusVariants["tone"]
  /** 스크린리더용 입력 이름 */
  label?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "검색어를 입력해주세요.",
  status: undefined,
  statusTone: "success",
  label: "검색어",
  class: undefined,
})

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
  (e: "search", value: string): void
}>()

const inputId = useId()

function onSubmit() {
  emit("search", props.modelValue)
}
</script>

<template>
  <form
    role="search"
    :class="cn(searchBarVariants(), props.class)"
    @submit.prevent="onSubmit"
  >
    <span v-if="status" :class="searchBarStatusVariants({ tone: statusTone })">
      <Info class="size-[1.6rem] shrink-0" aria-hidden="true" />
      {{ status }}
    </span>

    <label :for="inputId" class="blind">{{ label }}</label>
    <input
      :id="inputId"
      type="search"
      class="h-full min-w-0 flex-1 bg-transparent text-[1.7rem] text-[var(--Text-body_0)] outline-none placeholder:text-[var(--Text-body_disable)]"
      :placeholder="placeholder"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <button
      type="submit"
      class="flex size-[6.4rem] shrink-0 items-center justify-center rounded-full bg-[var(--Base-secondary)] text-white transition-colors hover:bg-[var(--Base-primary)]"
    >
      <span class="blind">검색</span>
      <Icon name="search" :size="24" />
    </button>
  </form>
</template>
