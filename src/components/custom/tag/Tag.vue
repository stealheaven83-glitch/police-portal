<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { X } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { tagVariants, type TagVariants } from "."

interface Props {
  /** sorting=라벨+삭제버튼, button=링크형(#태그) (Figma: Type) */
  type?: "sorting" | "button"
  size?: TagVariants["size"]
  /** 고정 상태로 보여줄 때만 지정. 보통은 두지 않고 CSS hover/active에 맡긴다 */
  state?: TagVariants["state"]
  /** 표시 문구 */
  label?: string
  /** sorting에서 삭제(x) 버튼 노출 (Figma: Delete) */
  deletable?: boolean
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  type: "sorting",
  size: "large",
  state: undefined,
  label: undefined,
  deletable: false,
  class: undefined,
})

const emit = defineEmits<{
  (e: "delete"): void
  (e: "click"): void
}>()

const isButton = computed(() => props.type === "button")
</script>

<template>
  <component
    :is="isButton ? 'button' : 'span'"
    :type="isButton ? 'button' : undefined"
    :class="cn(
      tagVariants({ size, state: state ?? 'default', interactive: isButton }),
      isButton && 'hover:underline active:underline',
      props.class,
    )"
    @click="isButton && emit('click')"
  >
    <slot>{{ label }}</slot>
    <button
      v-if="deletable && !isButton"
      type="button"
      class="ml-0.5 inline-flex shrink-0 cursor-pointer items-center justify-center"
      :aria-label="`${label ?? ''} 삭제`"
      @click.stop="emit('delete')"
    >
      <img src="/portal/asset/images/icon/ico_clear_16.svg" alt="" class="size-4" />
    </button>
  </component>
</template>
