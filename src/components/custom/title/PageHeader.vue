<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import Icon from "@/components/custom/icon/Icon.vue"
import { Button } from "@/components/custom/button"
import { useBreakpoint } from '@/composable/responsive/useResponsive.ts'

interface Props {
  class?: HTMLAttributes["class"]
  leftClass?: HTMLAttributes["class"]
  rightClass?: HTMLAttributes["class"]
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
})

const isMobile = useBreakpoint('<=');
</script>

<template>
  <!-- <div
    :class="cn(
      'flex items-center justify-between gap-5 py-[20px] px-0 max-[768px]:flex-col-reverse max-[768px]:items-start',
      props.class
    )"
  > -->
  <div
    :class="cn(
      'flex items-center justify-between gap-5 py-5 px-0',
      isMobile ? 'py-[1.5rem] mb-5' : '',
      props.class
    )"
  >
  <div :class="cn(
    isMobile ? 'flex items-center gap-2' : '',
    props.leftClass)">
      <Button variant="icon" aria-label="뒤로가기" v-if="isMobile">
        <Icon name="arrowLeft" :size="24" />
      </Button>
      <slot name="left" />
    </div>
    <!-- 2026-09-11 컴포넌트로 교체: button.lp-icon-btn -> Button variant="icon" -->
    <Button variant="icon" aria-label="메뉴" v-if="isMobile">
      <Icon name="menu" :size="20" />
    </Button>
    <div :class="cn(props.rightClass)" v-if="!isMobile">
      <slot name="right" />
    </div>
  </div>
</template>
