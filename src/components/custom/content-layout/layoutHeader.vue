<template>
  <div :class="cn(defaultClass, props.class)">
    <component :is="props.as" :id="props.titleId" :class="titleClass">
      <slot name="title">{{ title }}</slot>
    </component>
    <div>
      <slot name="center"/>
    </div>
    <div class="flex items-center gap-2">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  /** 좌측 타이틀 텍스트 (title 슬롯을 쓰면 무시됩니다) */
  title?: string
  /**
   * 타이틀을 그릴 태그. 화면 제목(PageTitle)이 h1 이므로 그 아래 영역 제목은 h2 가 기본이다.
   * 문서 구조상 더 깊은 위치면 h3/h4 로 낮춰 쓴다.
   */
  as?: 'h2' | 'h3' | 'h4'
  /** 타이틀 엘리먼트의 id. 바깥 section 이 aria-labelledby 로 가리킬 때 쓴다 */
  titleId?: string
  /** 래퍼 전체에 적용할 클래스 (기본 스타일을 덮어쓰고 싶을 때) */
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'h2',
})

const defaultClass = 'bg-[var(--Background-gray01)] flex items-center justify-between gap-4 py-[1rem] px-[2.4rem] border-b border-solid h-[60px] border-[var(--Border_gray02)]'
const titleClass = 'text-[var(--Text-body_0)] text-[1.9rem] font-semibold leading-normal shrink-0'
</script>
