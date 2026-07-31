<template>
  <TooltipProvider :delay-duration="delayDuration">
    <Tooltip>
      <!-- ① 활성화 버튼: 슬롯으로 트리거 지정. 미지정 시 기본 도움말(?) 아이콘 버튼 -->
      <TooltipTrigger as-child :disabled="disabled">
        <slot>
          <button
            type="button"
            :aria-label="triggerLabel"
            class="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CircleHelpIcon class="size-4" />
          </button>
        </slot>
      </TooltipTrigger>

      <!-- ② 컨테이너 + ③ 아이콘[선택] + ④ 본문 -->
      <TooltipContent
        :side="side"
        :align="align"
        :side-offset="sideOffset"
        :collision-padding="collisionPadding"
        :class="cn('max-w-[280px]', contentClass)"
      >
        <div class="flex items-start gap-1.5">
          <component
            :is="resolvedIcon"
            v-if="resolvedIcon"
            class="mt-px size-3.5 shrink-0"
          />
          <p class="text-xs leading-relaxed whitespace-pre-line">
            <slot name="content">{{ content }}</slot>
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { computed, watchEffect } from 'vue'
import {
  CircleHelpIcon,
  InfoIcon,
  CircleCheckIcon,
  TriangleAlertIcon,
  CircleAlertIcon,
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * shadcn-vue Tooltip 프리미티브를 감싼 커스텀 툴팁 컴포넌트.
 *
 * 툴팁 사용 가이드(디자인 원칙)를 컴포넌트에 반영합니다.
 * - 본문은 150자 이내의 "텍스트 전용" 콘텐츠만 제공합니다. (닫기 버튼 등 인터랙티브 요소 사용 금지)
 * - variant 로 상태 아이콘(정보/성공/경고/오류)을 간편하게 표시할 수 있습니다.
 * - collisionPadding 으로 팝오버가 화면 밖으로 벗어나지 않도록 합니다.
 * - Provider 를 내장하여 어디서든 단독으로 사용할 수 있습니다.
 *
 * @example 기본 사용 (기본 ? 아이콘 트리거)
 * <AppTooltip content="추가 설명 텍스트입니다." />
 *
 * @example 커스텀 트리거 + 상태 아이콘
 * <AppTooltip content="필수 입력 항목입니다." variant="warning" side="right">
 *   <Button variant="outline">도움말</Button>
 * </AppTooltip>
 */

type TooltipVariant = 'default' | 'info' | 'success' | 'warning' | 'error'

interface Props {
  /** ④ 본문 텍스트 (150자 이내 권장, 텍스트 전용) */
  content?: string
  /** ③ 상태 아이콘 유형 */
  variant?: TooltipVariant
  /** 상태 아이콘을 직접 지정 (variant 보다 우선) */
  icon?: Component | null
  /** 표시 방향 */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** 정렬 */
  align?: 'start' | 'center' | 'end'
  /** 트리거와의 간격(px) */
  sideOffset?: number
  /** 뷰포트 가장자리와의 최소 여백(px) — 화면 밖 이탈 방지 */
  collisionPadding?: number
  /** 표시 지연(ms) */
  delayDuration?: number
  /** 비활성화 */
  disabled?: boolean
  /** 본문 최대 글자수(가이드) — 초과 시 개발 콘솔 경고 */
  maxLength?: number
  /** 기본 트리거 버튼의 aria-label */
  triggerLabel?: string
  /** 툴팁 컨테이너(본문 영역)에 적용할 클래스 */
  contentClass?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  side: 'top',
  align: 'center',
  sideOffset: 6,
  collisionPadding: 8,
  delayDuration: 200,
  disabled: false,
  maxLength: 150,
  triggerLabel: '도움말 보기',
})

/** variant → 상태 아이콘 매핑 (default 는 아이콘 없음) */
const variantIcon: Record<TooltipVariant, Component | null> = {
  default: null,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  error: CircleAlertIcon,
}

/** icon prop 이 있으면 우선, 없으면 variant 기준 아이콘 */
const resolvedIcon = computed<Component | null>(() =>
  props.icon !== undefined ? props.icon : variantIcon[props.variant],
)

/** 본문 글자수 가이드(150자) 초과 시 개발용 경고 */
watchEffect(() => {
  if (
    import.meta.env.DEV &&
    props.content &&
    props.maxLength > 0 &&
    props.content.length > props.maxLength
  ) {
    console.warn(
      `[AppTooltip] 툴팁 본문은 ${props.maxLength}자 이내를 권장합니다. (현재 ${props.content.length}자)`,
    )
  }
})
</script>
