<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ArrowRight, Info, Siren, TriangleAlert } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { criticalAlertBadgeVariants, type CriticalAlertVariants } from "."

/**
 * 긴급 공지(critical_alerts): 페이지 상단에 걸리는 한 줄짜리 중요 공지.
 * Alert/InfoBox와 다르다 — 좌측에 색 배지("긴급"/"안전"/"안내")가 붙고
 * 우측에 "자세히보기" 링크가 있는 공지 전용 띠다.
 * Figma: critical_alerts (Type=[emergency|safety|info], 343:54455)
 */
interface Props {
  /** 공지 성격 (Figma: Type) */
  type?: CriticalAlertVariants["type"]
  /** 공지 본문 */
  text?: string
  /** "자세히보기" 노출 여부 */
  showMore?: boolean
  /** "자세히보기" 문구 */
  moreLabel?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  type: "emergency",
  text: undefined,
  showMore: true,
  moreLabel: "자세히보기",
  class: undefined,
})

const emit = defineEmits<{ (e: "more"): void }>()

const iconMap = { emergency: Siren, safety: TriangleAlert, info: Info } as const
const labelMap = { emergency: "긴급", safety: "안전", info: "안내" } as const
</script>

<template>
  <div
    role="alert"
    :class="cn(
      'flex w-full items-center gap-4 rounded-[1rem] border border-[var(--Border_gray02)] bg-white p-4',
      props.class,
    )"
  >
    <div :class="criticalAlertBadgeVariants({ type })">
      <component :is="iconMap[type ?? 'emergency']" class="size-6 shrink-0" />
      <span class="text-[1.7rem] leading-[1.5] font-bold whitespace-nowrap">
        {{ labelMap[type ?? "emergency"] }}
      </span>
    </div>

    <p class="min-w-0 flex-1 text-[1.7rem] leading-[1.5] font-bold text-[var(--Text-body_0)]">
      <slot>{{ text }}</slot>
    </p>

    <button
      v-if="showMore"
      type="button"
      class="flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-[var(--Radius-small3)] px-0.5 text-[1.7rem] leading-[1.5] text-[var(--Text-body_0)] hover:underline"
      @click="emit('more')"
    >
      {{ moreLabel }}
      <ArrowRight class="size-5 shrink-0" />
    </button>
  </div>
</template>
