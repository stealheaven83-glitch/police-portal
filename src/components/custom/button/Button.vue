<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "."
import { computed } from "vue"
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"
import { buttonVariants, buttonMoSizeVariants } from "."

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"]
  /** PC(폭 1600 이상) 크기. `mo-size` 없이 혼자 주면 **모든 폭**에서 이 크기다 */
  size?: ButtonVariants["size"]
  /**
   * 모바일(폭 1600 미만) 크기. 어떻게 동작할지는 **`size` 와 같이 줬는지가 정한다** —
   * 정책 prop(`device`)을 따로 두지 않고 값의 유무가 곧 정책이다.
   *
   * | 준 것 | 결과 |
   * |---|---|
   * | `size` 만 | 모든 폭에서 그 크기 (지금까지의 동작) |
   * | `mo-size` 만 | 모든 폭에서 그 크기 — **모바일 전용 화면**이 쓴다 |
   * | 둘 다 | 반응형 — 1600 미만이면 `mo-size`, 아니면 `size` |
   *
   * 폭 판단은 CSS(`style.css` 의 `mo:` 변형)가 하므로 첫 프레임부터 정확하고 깜빡임이 없다.
   * 단 기준은 **뷰포트 폭**이다 — 좁은 패널(LayoutSplit 안쪽)에 든 버튼도 창이 넓으면 PC 크기다.
   */
  moSize?: ButtonVariants["size"]
  /** 지정하면 min-width 가 0이 되고, 좌우 여백을 이 값으로 잡는다(숫자는 px). */
  padding?: string | number
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
})

/**
 * 기준 크기 — `size` 가 없으면 `mo-size` 가 그 자리를 대신한다(= 모든 폭에서 모바일 크기).
 * 둘 다 없으면 undefined 라 cva 의 defaultVariants 가 그대로 쓰인다.
 */
const baseSize = computed(() => props.size ?? props.moSize)

/** 반응형(둘 다 준 경우)일 때만 mo: 한 벌을 덧붙인다. mo-size 만 준 경우는 baseSize 로 이미 걸렸다 */
const moSizeClass = computed(() =>
  props.size && props.moSize ? buttonMoSizeVariants({ moSize: props.moSize }) : undefined,
)

const pad = computed(() => {
  if (props.padding === undefined) return undefined
  const raw = String(props.padding)
  const v = raw.trim() !== "" && !Number.isNaN(Number(raw)) ? `${raw}px` : raw
  return { paddingLeft: v, paddingRight: v }
})
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="baseSize"
    :data-mo-size="moSize"
    :as="as"
    :as-child="asChild"
    :type="as === 'button' ? 'button' : undefined"
    :style="pad"
    :class="cn(buttonVariants({ variant, size: baseSize }), moSizeClass, pad && 'min-w-0', props.class)"
  >
    <slot />
  </Primitive>
</template>
