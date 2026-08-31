<script setup lang="ts">
import { computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { DialogClose, DialogTitle } from "reka-ui"
import { Button } from '@/components/ui/button'
// import { cn } from '@/lib/utils'

import closeIcon from '@/assets/icon/icon_popup_x.svg?url'

/**
 * UI/UX 공통 가이드 4.3.2 레이어 팝업(Layer Pop-up) 컴포넌트
 *
 * - 슬롯 기반의 범용 레이어 팝업입니다.
 * - `size` 로 팝업 크기(대/중/소)를 지정합니다.
 * - 본문(default 슬롯)은 내용이 많을 경우 내부 스크롤됩니다.
 * - `footer` 슬롯으로 하단 버튼 영역을 커스터마이징할 수 있습니다.
 */

type DialogSize = 'sm' | 'md' | 'lg' | number;

const props = withDefaults(
  defineProps<{
    /** v-model:open 으로 팝업 표시 여부를 제어합니다. */
    open: boolean
    /** 팝업 타이틀 */
    title?: string
    /** 팝업 크기 (소/중/대) */
    size?: DialogSize
    /** 우측 상단 닫기(X) 버튼 노출 여부 */
    showCloseButton?: boolean
    /** 하단 버튼 영역 노출 여부 */
    showFooter?: boolean
    /** 취소 버튼 노출 여부 */
    showCancel?: boolean
    /** 확인 버튼 라벨 */
    confirmText?: string
    /** 취소 버튼 라벨 */
    cancelText?: string
    /** 오버레이 클릭/ESC 로 닫기 방지 */
    persistent?: boolean
  }>(),
  {
    title: '',
    size: 'md',
    showCloseButton: true,
    showFooter: true,
    showCancel: true,
    confirmText: '확인',
    cancelText: '취소',
    persistent: false,
  },
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

// 가이드 기준 PC SIZE (대/중/소) — 프리셋은 기존 클래스 그대로, 숫자일 때만 style로 max-width 지정
const sizeClass = computed(() => {
  if (typeof props.size === 'number') return undefined
  return {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-3xl',
  }[props.size]
})

const sizeStyle = computed(() => {
  if (typeof props.size !== 'number') return undefined
  return { width: 'calc(100% - 20px)', maxWidth: `${props.size}px` }
})

function handleOpenChange(value: boolean) {
  if (!value && props.persistent) return
  emit('update:open', value)
  if (!value) emit('cancel')
}

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('update:open', false)
  emit('cancel')
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange" class="">
    <DialogContent
      :show-close-button="showCloseButton"
      class="dialog-wrap px-10 py-6 gap-0 flex flex-col max-h-[85dvh]"
      :class="sizeClass"
      :style="sizeStyle"
      @pointer-down-outside="(e: Event) => persistent && e.preventDefault()"
      @escape-key-down="(e: Event) => persistent && e.preventDefault()"
      >

      
      <DialogHeader class="text-left justify-between flex-row items-center mb-4 shrink-0">
        <!--
          퍼블 원본의 팝업 제목 마크업. 스타일은 police-style.css 의 .pop-title h1 이 맡는다.
          ui/dialog 의 DialogTitle 래퍼는 Tailwind 클래스(utilities 레이어)를 붙이는데,
          utilities 가 police 레이어보다 우선이라 퍼블 스타일이 덮여버린다.
          그래서 클래스를 붙이지 않는 reka-ui 원본을 h1 으로 렌더한다.
          (DialogTitle 을 거쳐야 aria-labelledby 연결이 유지된다)
        -->
        <div class="pop-title">
          <DialogTitle as="h1">{{ title }}</DialogTitle>
        </div>
        <DialogClose
          v-if="showCloseButton"
          data-slot="dialog-close"
          class="focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <img :src="closeIcon" alt="Close">
            <span class="sr-only">Close</span>
          </DialogClose>
      </DialogHeader>

      <!-- 본문: 내용이 많으면 내부 스크롤 -->
      <div class="flex-1 min-h-0 overflow-y-auto">
        <slot />
      </div>

      <DialogFooter v-if="showFooter" class="mt-4 gap-2 shrink-0">
        <slot name="footer" :confirm="handleConfirm" :cancel="handleCancel">
          <Button v-if="showCancel" variant="outline" @click="handleCancel">
            {{ cancelText }}
          </Button>
          <Button @click="handleConfirm">
            {{ confirmText }}
          </Button>
        </slot>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
