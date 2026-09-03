<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import Button from "./Button.vue"
import { Icon } from "@/components/custom/icon"

/**
 * 화면 우측 상단(브레드크럼 옆)에 놓는 '도움말' 버튼.
 * Figma: 파란 테두리 pill + 말풍선 물음표 아이콘(icon/annotation) + 라벨 (= Button 의 tertiary 변형).
 *
 * 클릭 동작은 화면이 정한다 — emit 을 선언하지 않아 @click 이 그대로 button 엘리먼트로 전달된다.
 * 아이콘은 장식이라 Icon 이 aria-hidden 을 붙이고, 버튼의 접근 가능한 이름은 라벨 텍스트가 된다.
 */
interface Props {
  /** 버튼 라벨. 기본 '도움말' */
  label?: string
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  label: "도움말",
})
</script>

<template>
  <Button variant="tertiary" size="xxs" :class="cn('gap-[4px] rounded-full px-[0.8rem] py-0 help-btn min-w-[75px] ml-[8px]', props.class)">
    <!-- Figma icon/annotation 원본. 말풍선이 currentColor 라 버튼 글자색을 그대로 따라간다 -->
    <Icon name="annotation" :size="16" class="shrink-0" />
    {{ props.label }}
  </Button>
</template>
