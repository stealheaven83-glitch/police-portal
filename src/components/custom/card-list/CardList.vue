<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { cardListVariants } from "."

interface Props {
  /** 0건이면 빈 상태를 대신 그린다. 화면이 `!rows.length` 를 넘긴다 */
  empty?: boolean
  /** 빈 상태 문구. 통째로 바꾸려면 #empty 슬롯 */
  placeholder?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  empty: false,
  placeholder: "데이터가 없습니다",
  class: undefined,
})
</script>

<template>
  <ul :class="cn(cardListVariants(), props.class)">
    <!-- 0건 -->
    <slot v-if="empty" name="empty">
      <li class="py-[4rem] text-center text-[1.5rem] text-[var(--Text-body_2)]">
        {{ placeholder }}
      </li>
    </slot>

    <!--
      카드 목록. 무엇을 넣을지는 화면이 정한다.
      <Card as="li"> 로 공통 카드를 쓰거나, <li> 를 직접 짜도 된다.
    -->
    <slot v-else />
  </ul>
</template>
