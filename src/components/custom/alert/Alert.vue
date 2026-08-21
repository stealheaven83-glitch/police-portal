<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { alertIconVariants, alertTitleVariants, alertVariants, type AlertVariants } from "."

interface Props {
  /** 알림 유형 (Figma: State) */
  state?: AlertVariants["state"]
  /** 제목 (지정하면 "+title" 크기, 지정하지 않으면 "slim" 한 줄 크기로 렌더됨) */
  title?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  state: "info",
  title: undefined,
  class: undefined,
})

const size = computed<AlertVariants["size"]>(() => (props.title ? "title" : "slim"))

const iconMap = {
  danger: XCircle,
  warning: TriangleAlert,
  success: CheckCircle2,
  info: Info,
} as const
</script>

<template>
  <div role="alert" :class="cn(alertVariants({ state, size }), props.class)">
    <component :is="iconMap[state ?? 'info']" :class="alertIconVariants({ state, size })" />
    <div class="flex-1 min-w-0">
      <p v-if="title" :class="alertTitleVariants({ state })">{{ title }}</p>
      <div
        class="text-[var(--Text-body_0)] leading-[1.5]"
        :class="title ? 'mt-1 text-[1.7rem]' : 'text-[1.5rem]'"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
