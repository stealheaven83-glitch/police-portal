<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { CircleAlert, CircleCheck } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import {
  progressBarVariants,
  progressMessageVariants,
  progressTrackVariants,
  type ProgressBarVariants,
} from "."

interface Props {
  /** 진행률 0~100. state가 success/error면 무시하고 100%로 채운다 */
  value?: number
  size?: ProgressBarVariants["size"]
  state?: ProgressBarVariants["state"]
  /** 막대 아래 안내 문구 (Figma: Alert) */
  message?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  size: "large",
  state: "active",
  message: undefined,
  class: undefined,
})

const filled = computed(() =>
  props.state === "active" ? Math.min(100, Math.max(0, props.value)) : 100,
)
</script>

<template>
  <div :class="cn('flex w-full flex-col items-start gap-2', props.class)">
    <div
      role="progressbar"
      :aria-valuenow="filled"
      aria-valuemin="0"
      aria-valuemax="100"
      :class="progressTrackVariants({ size })"
    >
      <div :class="progressBarVariants({ size, state })" :style="{ width: `${filled}%` }" />
    </div>

    <div v-if="message" class="flex w-full items-start gap-1">
      <span v-if="state !== 'active'" class="flex shrink-0 items-center pt-0.5">
        <CircleCheck
          v-if="state === 'success'"
          class="size-4 text-[var(--Alert-success-icon)]"
        />
        <CircleAlert v-else class="size-4 text-[var(--Alert-danger-icon)]" />
      </span>
      <p :class="progressMessageVariants({ state })">{{ message }}</p>
    </div>
  </div>
</template>
