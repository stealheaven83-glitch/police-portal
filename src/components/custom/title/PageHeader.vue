<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { cn } from "@/lib/utils"
import { deviceStyle, type DeviceMode } from "@/lib/deviceStyle"
import Icon from "@/components/custom/icon/Icon.vue"
import { Button } from "@/components/custom/button"

interface Props {
  class?: HTMLAttributes["class"]
  leftClass?: HTMLAttributes["class"]
  rightClass?: HTMLAttributes["class"]
  bordered?: boolean
  /**
   * 기기 정책. 'responsive'(기본) 폭 따라 / 'pc' PC 모양 고정 / 'mobile' 모바일 모양 고정.
   * 모바일 전용 화면이나 시안 검수처럼 폭과 무관하게 한쪽으로 고정해야 할 때만 준다.
   */
  device?: DeviceMode
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  device: "responsive",
})

/** 머리줄 — 모바일은 여백이 줄고 아래 간격이 붙는다 */
const rootClass = computed(() =>
  deviceStyle(
    {
      pc: "flex items-center justify-between gap-5 py-[2.2rem] px-0",
      mobile: "py-[1.5rem] mb-5",
    },
    props.device,
  ),
)

/** 왼쪽 묶음 — 모바일에서만 뒤로가기 버튼과 가로로 붙는다 */
const leftGroupClass = computed(() =>
  deviceStyle({ mobile: "flex items-center gap-2" }, props.device),
)

/** 뒤로가기·메뉴 버튼 — 모바일 전용이라 PC 에서는 숨는다 */
const mobileOnlyClass = computed(() =>
  deviceStyle({ pc: "hidden", mobile: "inline-flex" }, props.device),
)

/** 오른쪽 묶음(브레드크럼·도움말) — 모바일 시안에 없어 숨는다 */
const rightGroupClass = computed(() => deviceStyle({ mobile: "hidden" }, props.device))
</script>

<template>
  <!-- <div
    :class="cn(
      'flex items-center justify-between gap-5 py-[20px] px-0 max-[768px]:flex-col-reverse max-[768px]:items-start',
      props.class
    )"
  > -->
  <div :class="cn(rootClass, props.class)">
    <div :class="cn(leftGroupClass, props.leftClass)">
      <Button variant="icon" aria-label="뒤로가기" :class="mobileOnlyClass">
        <Icon name="arrowLeft" :size="24" />
      </Button>
      <slot name="left" />
    </div>
    <!-- 2026-09-11 컴포넌트로 교체: button.lp-icon-btn -> Button variant="icon" -->
    <Button variant="icon" aria-label="메뉴" :class="mobileOnlyClass">
      <Icon name="menu" :size="24" />
    </Button>
    <div :class="cn(rightGroupClass, props.rightClass)">
      <slot name="right" />
    </div>
  </div>
</template>
