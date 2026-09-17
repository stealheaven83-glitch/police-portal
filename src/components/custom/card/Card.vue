<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useSlots } from "vue"
import { cn } from "@/lib/utils"
import Checkbox from "@/components/custom/checkbox/Checkbox.vue"
import { cardVariants, type CardVariants } from "."

interface Props {
  /** 바깥 태그. CardList(<ul>) 안에 넣을 때 "li" 를 준다 */
  as?: "div" | "li"
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
  as: "div",
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
  <component :is="as" :class="cn(cardVariants({ type }), props.class)">
    <!--
      #custom — 카드 **외형만** 쓰고 안쪽은 화면이 통째로 짠다(체크박스·이미지까지 화면 몫).
      시안이 정해진 슬롯(title·description·meta·tags·badge·actions·footer·image)으로
      표현이 안 될 때만 쓴다. 되는 카드는 그 슬롯을 쓴다 — 안 그러면 카드가 화면마다 갈린다.
    -->
    <slot v-if="slots.custom" name="custom" />

    <template v-else>
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
    </template>
  </component>
</template>
