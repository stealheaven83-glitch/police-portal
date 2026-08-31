<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import {
  listBulletBoxVariants,
  listBulletVariants,
  listVariants,
  type ListVariants,
} from "."

interface Props {
  /** 목록 깊이 (Figma: Level) — 불릿 모양이 바뀐다 */
  level?: ListVariants["level"]
  /** 번호 목록일 때 표시할 순번. 지정하면 불릿 대신 번호가 나온다 */
  order?: number
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
  order: undefined,
  class: undefined,
})
</script>

<template>
  <li :class="cn(listVariants({ level }), 'list-none', props.class)">
    <span v-if="order !== undefined" :class="listBulletBoxVariants({ level })">
      <span class="text-[1.5rem] leading-[1.5] text-[var(--Text-body_1)] tabular-nums">
        {{ order }}.
      </span>
    </span>
    <span v-else :class="listBulletBoxVariants({ level })" aria-hidden="true">
      <span :class="listBulletVariants({ level })" />
    </span>
    <span class="min-w-0 flex-1 text-[1.5rem] leading-[1.5] break-words text-[var(--Text-body_1)]">
      <slot />
    </span>
  </li>
</template>
