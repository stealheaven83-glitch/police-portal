<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, ref, watch } from "vue"
import { ChevronDown, ChevronUp } from "lucide-vue-next"
import { cn } from "@/lib/utils"

/**
 * 디스클로저(Disclosure): 화살표+라벨을 눌러 아래 내용을 펼치는 최소 단위 토글.
 * Accordion과 다르다 — Accordion은 테두리를 갖춘 여러 항목의 묶음이고,
 * Disclosure는 테두리 없이 한 덩어리만 여닫는다("더보기" 성격).
 * Figma: disclosure (State=[default|open], 343:42471)
 */
interface Props {
  /** 라벨 */
  title?: string
  /** 펼침 상태 (v-model:open 으로 제어 가능) */
  open?: boolean
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  open: undefined,
  class: undefined,
})

const emit = defineEmits<{ (e: "update:open", value: boolean): void }>()

const internalOpen = ref(props.open ?? false)
watch(
  () => props.open,
  (v) => {
    if (v !== undefined) internalOpen.value = v
  },
)

const isOpen = computed(() => props.open ?? internalOpen.value)

function toggle() {
  const next = !isOpen.value
  internalOpen.value = next
  emit("update:open", next)
}
</script>

<template>
  <div :class="cn('flex gap-1', isOpen ? 'flex-col items-start justify-center' : 'items-center', props.class)">
    <button
      type="button"
      class="flex shrink-0 cursor-pointer items-center gap-1"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <component
        :is="isOpen ? ChevronUp : ChevronDown"
        class="size-5 shrink-0 text-[var(--Text-body_0)]"
      />
      <span class="text-[1.7rem] leading-[1.5] whitespace-nowrap text-[var(--Text-body_0)]">
        <slot name="title">{{ title }}</slot>
      </span>
    </button>

    <div
      v-if="isOpen"
      class="flex shrink-0 flex-col items-start rounded-[var(--Radius-xlarge2)] bg-[var(--Border_gray03)] p-6"
    >
      <slot />
    </div>
  </div>
</template>
