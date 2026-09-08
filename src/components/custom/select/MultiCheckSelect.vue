<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, ref, watch } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'

/**
 * 체크박스 목록 + 확인 버튼으로 구성된 다중 선택 드롭다운.
 * - "확인" 을 눌러야 선택이 확정되며(v-model 갱신), 그 전까지는 팝오버 내부에서만 임시 선택 상태를 갖는다.
 * - 팝오버를 닫지 않고 취소하려면 바깥 영역을 클릭하거나 Esc 를 누르면 이전 확정값으로 되돌아간다.
 */
defineOptions({ inheritAttrs: false })

interface Option {
  label: string
  value: string
}

interface Props {
  modelValue?: string[]
  options?: Option[]
  placeholder?: string
  disabled?: boolean
  size?: 'lg' | 'md' | 'sm' | 'xs'
  triggerClass?: HTMLAttributes['class']
  /** 팝오버 상단에 노출할 그룹 제목 (스크린리더용 legend 를 겸함) */
  groupLabel?: string
  confirmText?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  options: () => [],
  placeholder: '선택',
  disabled: false,
  size: 'sm',
  groupLabel: '항목 선택',
  confirmText: '확인',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const open = ref(false)
const draft = ref<string[]>([...props.modelValue])

watch(open, (isOpen) => {
  if (isOpen) draft.value = [...props.modelValue]
})

function toggleDraft(value: string, checked: boolean) {
  draft.value = checked
    ? [...draft.value, value]
    : draft.value.filter((v) => v !== value)
}

function apply() {
  emit('update:modelValue', draft.value)
  open.value = false
}

const previewText = computed(() =>
  props.modelValue.length
    ? props.options
        .filter((opt) => props.modelValue.includes(opt.value))
        .map((opt) => opt.label)
        .join(', ')
    : props.placeholder,
)

const sizeClass = computed(() => {
  if (props.size === 'md') return 'h-12 text-[1.5rem] px-4 rounded-sm'
  if (props.size === 'sm') return 'h-10 text-[1.5rem] px-4 rounded-sm'
  if (props.size === 'xs') return 'h-9 text-[1.3rem] px-3 rounded-sm'
  return 'h-14 text-[1.9rem] px-4 rounded-md'
})
</script>


<template>
  <PopoverRoot v-model:open="open">
    <!-- relative: 팝오버(absolute)의 containing block 을 여기로 잡아야 스크롤 컨테이너 overflow 에 잘린다 -->
    <div class="relative">
      <PopoverTrigger as-child :disabled="disabled">
        <button
          type="button"
          :class="cn(
            'group flex w-full items-center justify-between gap-2 border bg-white font-normal outline-none text-left',
            'border-[var(--Border_input01)]',
            !modelValue.length && 'text-[var(--Text-body_disable)]',
            'focus-visible:border-[var(--Border_primary)] focus-visible:border-2',
            'data-[state=open]:border-[var(--Border_primary)] data-[state=open]:border-2',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[var(--disabled-input-border)] disabled:bg-[var(--disabled-input-bg)] disabled:text-[var(--disabled-input-text-color)]',
            sizeClass,
            triggerClass,
          )"
          :disabled="disabled"
          v-bind="$attrs"
        >
          <span class="truncate">{{ previewText }}</span>
          <ChevronDown class="size-5 shrink-0 text-[var(--icon-gray)] transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </PopoverTrigger>

      <!-- portal disabled + absolute: 트리거 옆에 제자리 렌더 → 스크롤 컨테이너 overflow 에 잘린다 -->
      <PopoverPortal disabled>
        <PopoverContent
          class="z-50 w-64 rounded-md border border-[var(--Border_input01)] bg-white shadow-md outline-none"
          align="start"
          :side-offset="4"
          :avoid-collisions="false"
          position-strategy="absolute"
        >
          <fieldset class="p-3">
            <legend class="px-1 pb-2 text-[1.4rem] font-semibold text-[var(--Text-body_0)]">
              {{ groupLabel }}
            </legend>
            <ul class="max-h-60 space-y-0.5 overflow-y-auto">
              <li v-for="opt in options" :key="opt.value">
                <Checkbox
                  :model-value="draft.includes(opt.value)"
                  :label="opt.label"
                  class="w-full px-2 py-1.5"
                  @update:model-value="(checked) => toggleDraft(opt.value, !!checked)"
                />
              </li>
            </ul>
          </fieldset>
          <div class="flex justify-end border-t p-2">
            <Button type="button" variant="primary" size="xs" @click="apply">
              {{ confirmText }}
            </Button>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </div>
  </PopoverRoot>
</template>
