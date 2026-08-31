<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ref } from "vue"
import { ArrowRight, X } from "lucide-vue-next"
import { PopoverArrow } from "reka-ui"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/**
 * 맥락 도움말(contextual_help): 특정 요소 옆에서 그 항목의 설명을 띄우는 말풍선.
 * Tooltip과 다르다 — 제목·본문·"바로가기"를 갖고 닫기 버튼으로 닫는 팝오버다.
 * Figma: contextual_help (Direction=[top|bottom], Arrow=[left|center|right], 343:54748)
 * 위치 계산은 프로젝트의 `ui/popover`(reka-ui)에 맡긴다.
 */
interface Props {
  /** 도움말 제목 */
  title?: string
  /** 본문 */
  contents?: string
  /** 말풍선이 뜨는 방향 (Figma: Direction) */
  direction?: "top" | "bottom"
  /** 기준 요소에 대한 정렬 (Figma: Arrow) */
  arrow?: "left" | "center" | "right"
  /** "바로가기" 노출 (Figma: Show button) */
  showButton?: boolean
  /** "바로가기" 문구 */
  buttonLabel?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  contents: undefined,
  direction: "bottom",
  arrow: "left",
  showButton: false,
  buttonLabel: "바로가기",
  class: undefined,
})

const emit = defineEmits<{ (e: "action"): void }>()

const open = ref(false)

const alignMap = { left: "start", center: "center", right: "end" } as const
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverContent
      :side="direction"
      :align="alignMap[arrow]"
      :side-offset="8"
      :class="cn(
        'w-90 rounded-[var(--Radius-xlarge2)] border border-[var(--Border_gray01)] bg-white p-6 shadow-none',
        props.class,
      )"
    >
      <div class="flex w-full flex-col items-start justify-center gap-2">
        <div class="flex w-full flex-col items-start justify-center gap-4">
          <div class="flex w-full items-center gap-4">
            <p class="min-w-0 flex-1 text-[1.7rem] leading-[1.5] font-bold text-[var(--Text-body_0)]">
              <slot name="title">{{ title }}</slot>
            </p>
            <button
              type="button"
              aria-label="도움말 닫기"
              class="shrink-0 cursor-pointer"
              @click="open = false"
            >
              <X class="size-4 text-[var(--Text-body_1)]" />
            </button>
          </div>
          <p class="w-full text-[1.5rem] leading-[1.5] text-[var(--Text-body_0)]">
            <slot>{{ contents }}</slot>
          </p>
        </div>

        <button
          v-if="showButton"
          type="button"
          class="flex h-6 shrink-0 cursor-pointer items-center justify-center gap-0.5 rounded-[var(--Radius-small3)] px-0.5 text-[1.5rem] leading-[1.5] text-[var(--Text-body_0)] hover:underline"
          @click="emit('action')"
        >
          {{ buttonLabel }}
          <ArrowRight class="size-4 shrink-0" />
        </button>
      </div>
      <PopoverArrow :width="22" :height="12" class="fill-white stroke-[var(--Border_gray01)]" />
    </PopoverContent>
  </Popover>
</template>
