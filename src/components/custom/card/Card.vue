<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useSlots } from "vue"
import { cn } from "@/lib/utils"
import Checkbox from "@/components/custom/checkbox/Checkbox.vue"
import { cardVariants, type CardVariants } from "."

interface Props {
  /** 세로/가로 배치 (Figma: Type) */
  type?: CardVariants["type"]
  /** 선택 체크박스 노출 (Figma: Check-box) */
  selectable?: boolean
  /** 선택 여부 (v-model:checked) */
  checked?: boolean
  /** 제목 — 슬롯 대신 간단히 넘길 때 */
  title?: string
  /** 설명 — 슬롯 대신 간단히 넘길 때 */
  description?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  type: "vertical",
  selectable: false,
  checked: false,
  title: undefined,
  description: undefined,
  class: undefined,
})

const emit = defineEmits<{ (e: "update:checked", value: boolean): void }>()

const slots = useSlots()
</script>

<template>
  <div :class="cn(cardVariants({ type }), props.class)">
    <Checkbox
      v-if="selectable"
      :model-value="checked"
      class="shrink-0"
      @update:model-value="emit('update:checked', Boolean($event))"
    />

    <div class="flex min-w-0 flex-1 flex-col items-start justify-center gap-4">
      <!-- 상단: 뱃지 / 보조 버튼 -->
      <div v-if="slots.badge || slots.actions" class="flex w-full items-center gap-6">
        <div v-if="slots.badge" class="flex shrink-0 items-center gap-1">
          <slot name="badge" />
        </div>
        <div v-if="slots.actions" class="flex flex-1 items-center justify-end gap-1">
          <slot name="actions" />
        </div>
      </div>

      <p
        v-if="title || slots.title"
        class="w-full text-[1.9rem] leading-[1.5] font-bold text-[var(--Text-body_0)]"
      >
        <slot name="title">{{ title }}</slot>
      </p>

      <p
        v-if="description || slots.default"
        class="w-full text-[1.5rem] leading-[1.5] text-[var(--Text-body_1)]"
      >
        <slot>{{ description }}</slot>
      </p>

      <div v-if="slots.meta" class="flex w-full items-center gap-2 text-[1.3rem] text-[var(--Text-body_2)]">
        <slot name="meta" />
      </div>

      <div v-if="slots.tags" class="flex w-full flex-wrap items-center gap-2">
        <slot name="tags" />
      </div>

      <template v-if="slots.footer">
        <div class="h-0 w-full border-t border-[var(--Border_gray03)]" />
        <div class="flex w-full items-center gap-2">
          <slot name="footer" />
        </div>
      </template>
    </div>

    <div v-if="slots.image" class="shrink-0">
      <slot name="image" />
    </div>
  </div>
</template>
