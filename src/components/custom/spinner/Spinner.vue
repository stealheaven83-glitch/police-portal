<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { cn } from "@/lib/utils"
import type { SpinnerSize } from "."

/**
 * 스피너(Spinner): 처리 중임을 알리는 회전 링.
 * Figma: spinner (Size=[large|medium|small]) — 48/32/20px.
 * 벡터 경로는 Figma 원본(343:42757) 그대로이고 색만 프로젝트 토큰으로 바꿨다.
 * medium(32px)은 원본이 별도 SVG라 굵기를 3으로 보간했다.
 */
interface Props {
  size?: SpinnerSize
  /** 스크린리더용 문구 */
  label?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  size: "large",
  label: "불러오는 중",
  class: undefined,
})

const dimension = computed(() => ({ large: 48, medium: 32, small: 20 })[props.size])
const strokeWidth = computed(() => ({ large: 4, medium: 3, small: 2 })[props.size])
</script>

<template>
  <span
    role="status"
    :aria-label="label"
    :class="cn('inline-flex shrink-0 items-center justify-center', props.class)"
  >
    <svg
      :width="dimension"
      :height="dimension"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="animate-spin"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="22"
        stroke="var(--Border_gray02)"
        :stroke-width="strokeWidth"
      />
      <path
        d="M27.8203 45.6658C24.4012 46.2686 20.888 46.0538 17.5678 45.0387C14.2477 44.0236 11.2149 42.2372 8.71752 39.8255C6.2201 37.4137 4.32891 34.4452 3.1986 31.1625C2.06828 27.8798 1.73092 24.3762 2.21411 20.9382"
        stroke="var(--Base-primary)"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
    </svg>
  </span>
</template>
