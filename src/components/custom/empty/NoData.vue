<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { CircleAlert } from "lucide-vue-next"
import { cn } from "@/lib/utils"

/**
 * 데이터 없음(No Data): 그리드·목록·검색 결과가 비었을 때 자리에 놓는 안내.
 * Figma: No Data (10373:41131)
 */
interface Props {
  /** 안내 문구 */
  message?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  message: "등록된 내용이 없습니다.",
  class: undefined,
})
</script>

<template>
  <div
    :class="cn('flex flex-col items-center justify-center gap-2 px-6 pt-3 pb-6', props.class)"
  >
    <CircleAlert class="size-10 shrink-0 text-[var(--Border_gray02)]" :stroke-width="1.5" />
    <p class="text-[1.5rem] leading-[1.5] font-medium text-[var(--Text-body_2)]">
      <slot>{{ message }}</slot>
    </p>
  </div>
</template>
