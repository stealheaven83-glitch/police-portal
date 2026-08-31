<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { ChevronDown } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { textSelectIconSize, textSelectVariants, type TextSelectVariants } from "./textSelectVariants"

export interface TextSelectOption {
  label: string
  value: string
  disabled?: boolean
}

/**
 * 텍스트형 셀렉트(select_text). 변형 정의는 `textSelectVariants.ts` 참고.
 * ⚠ `<script setup>`은 런타임 값을 export할 수 없어 cva를 별도 .ts로 뺐다(CLAUDE.md §8).
 */
interface Props {
  options: TextSelectOption[]
  modelValue?: string
  size?: TextSelectVariants["size"]
  /** 값이 선택됐음을 강조할 때 */
  state?: TextSelectVariants["state"]
  placeholder?: string
  disabled?: boolean
  /** 접근성 이름 (라벨이 화면에 없을 때) */
  ariaLabel?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  size: "medium",
  state: "default",
  placeholder: "선택",
  disabled: false,
  ariaLabel: undefined,
  class: undefined,
})

const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>()

const iconClass = computed(() => textSelectIconSize[props.size ?? "medium"])
</script>

<template>
  <Select
    :model-value="modelValue"
    :disabled="disabled"
    @update:model-value="emit('update:modelValue', String($event))"
  >
    <SelectTrigger
      :aria-label="ariaLabel"
      :class="cn(
        textSelectVariants({ size, state }),
        // ui/select 기본 트리거의 테두리·배경·높이를 걷어낸다
        'border-0 bg-transparent shadow-none [&>svg]:hidden',
        size === 'map' && 'border border-[var(--Border_gray02)] bg-white shadow-sm',
        props.class,
      )"
    >
      <SelectValue :placeholder="placeholder" />
      <ChevronDown :class="cn(iconClass, 'shrink-0 opacity-70')" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          :disabled="opt.disabled"
        >
          {{ opt.label }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
