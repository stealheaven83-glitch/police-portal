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
        <!--
          패널 모양은 Figma 10724:83254(open) — 흰 배경 · #CDD1D5 1px · radius 8 · 안쪽 8 · 그림자 2단.
          폭은 트리거(--reka-popover-trigger-width)에 맞추되 라벨이 더 길면 늘어난다.
        -->
        <PopoverContent
          class="z-50 min-w-[var(--reka-popover-trigger-width)] rounded-[var(--Radius-medium3)] border border-[var(--Border_gray02)] bg-white p-2 shadow-[0_0_2px_rgba(0,0,0,0.05),0_4px_8px_rgba(0,0,0,0.08)] outline-none"
          align="start"
          :side-offset="4"
          :avoid-collisions="false"
          position-strategy="absolute"
        >
          <fieldset class="min-w-0 p-0">
            <!-- 시안에는 제목 줄이 없다 — 스크린리더용으로만 남긴다 -->
            <legend class="sr-only">{{ groupLabel }}</legend>
            <!-- 행: 안쪽 8/10 · radius 6 · 행 사이 10, 고른 행은 연한 파랑(#EEF2F7).
                 Checkbox 의 class 는 라벨이 아니라 박스에 붙으므로 행 스타일은 li 가 맡는다 -->
            <ul class="max-h-60 space-y-[10px] overflow-y-auto">
              <li
                v-for="opt in options"
                :key="opt.value"
                :class="cn(
                  'flex items-center rounded-[var(--Radius-medium2)] px-2 py-[10px]',
                  draft.includes(opt.value) && 'bg-[var(--Base-secondary-lighter)]',
                )"
              >
                <Checkbox
                  :model-value="draft.includes(opt.value)"
                  :label="opt.label"
                  @update:model-value="(checked) => toggleDraft(opt.value, !!checked)"
                />
              </li>
            </ul>
          </fieldset>
          <!-- 확인 버튼 줄: 가운데, 위 행과 10 띄우고 안쪽 8/10 (시안 button: secondary-fill · 32px · 좌우 12 = size xs 기본) -->
          <div class="mt-[10px] flex justify-center px-2 py-[10px]">
            <Button type="button" variant="secondary" size="xs" @click="apply" padding="12">
              {{ confirmText }}
            </Button>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </div>
  </PopoverRoot>
</template>
