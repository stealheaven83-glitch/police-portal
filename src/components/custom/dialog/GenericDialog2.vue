<script setup lang="ts">
import { computed, ref } from 'vue'
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
import { dialogShapeClass, type DialogDevice, type DialogShape } from './dialogDevice'
import { useIsScrollable } from '@/composable/scroll/useIsScrollable'
import { deviceStyle } from "@/lib/deviceStyle"

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
    /**
     * 팝업 높이 고정(숫자면 px). 시안이 높이까지 정한 팝업에 쓴다.
     * 주지 않으면 지금까지처럼 내용 높이만큼 늘어난다.
     * 지정해도 max-h-[85dvh] 는 그대로 걸리므로 화면보다 커지지 않는다.
     */
    height?: DialogSize
    /**
     * 모바일에서 **어떤 모양**이 되나 — 'full'(전체화면) / 'bottom'(바텀시트 모양).
     * 안 주면 언제나 가운데 팝업이다(지금까지와 같다). dialogDevice.ts 참고
     */
    type?: DialogShape
    /**
     * 그 모양을 **언제** 쓰나. Alert/Confirm 의 device 와 같은 규칙이다.
     *   'responsive'(기본) PC 는 가운데 팝업, 모바일 폭에서 `type` 모양
     *   'mobile'           폭과 무관하게 **항상** `type` 모양 (PC 에서도)
     *   'pc'               언제나 가운데 팝업
     * `type` 을 안 주면 이 값은 의미가 없다.
     */
    device?: DialogDevice,
    hasList?: boolean
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
    device: 'responsive',
    hasList: false
  },
)

const maxHeight = 800;

/** 모양·범위는 police-override.css 의 .lp-popup-* 가 들고 있다. type 이 없으면 빈 배열 */
const shapeClass = computed(() => dialogShapeClass(props.type, props.device))

/**
 * 닫기(X) 버튼 — 모바일에서 작아진다.
 *
 * 템플릿에 인라인으로 못 쓴다: pc 값 안의 [class*=..] 선택자에 따옴표가 있어서
 * HTML 속성 구분자(") 와 겹쳐 :class 값이 거기서 끊긴다(2026-09-16).
 */
const closeClass = computed(() =>
  deviceStyle(
    {
      pc: `absolute right-[40px] top-[30px] focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
      mobile: 'size-5',
    },
    props.device,
  ),
)

/** height 를 준 팝업만 높이를 고정한다 — 본문(flex-1)이 남은 높이를 가져간다 */
const heightStyle = computed(() => {
  if (props.height === undefined) return undefined
  return { height: typeof props.height === 'number' ? `${props.height}px` : props.height }
})

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



/* ── 본문 스크롤 발생 감지 ──────────────────────────────────────────────
 * 본문(default 슬롯)이 max-h-[85dvh] 를 넘겨 내부 스크롤이 생기는 시점을 잡는다.
 * 생겼을 때만 .has-scroll 이 붙고, 실제 수치(폭·여백)는 police-override.css 가 갖는다
 * (CLAUDE.md §2 — 인라인 style 로 넣지 않는다).
 *
 * DOM 구조는 바꾸지 않는다(31개 화면이 이 팝업을 쓴다 — 슬롯을 래퍼로 감싸면
 * 안에서 height:100% 같은 걸 쓰던 화면이 깨진다). 그래서 ScrollWrapper 를 못 쓰고,
 * 감지 로직만 composable 로 공유한다.
 */
const bodyRef = ref<HTMLElement | null>(null)
const isScrollable = useIsScrollable(bodyRef)

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
      class="dialog-wrap px-[3.9rem] py-6 gap-0 flex flex-col"
      :class="[`max-h-[${maxHeight}px]`, (hasList ? 'h-200' : ''), sizeClass, shapeClass]"
      :style="[sizeStyle, heightStyle]"
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

      </DialogHeader>

      <!-- 본문: 내용이 많으면 내부 스크롤. 스크롤이 생기면 .has-scroll 이 붙는다(수치는 police-override.css) -->
      <div
        ref="bodyRef"
        class="lp-popup-body flex-1 min-h-0 overflow-y-auto"
        :class="{ 'has-scroll': isScrollable, 'fixed-height': hasList }"
        :data-scrollable="isScrollable"
      >
        <slot />
      </div>

      <DialogFooter v-if="showFooter" class="mt-4 gap-2 shrink-0 flex-row">
        <slot name="footer" :confirm="handleConfirm" :cancel="handleCancel">
          <Button v-if="showCancel" variant="outline" @click="handleCancel">
            {{ cancelText }}
          </Button>
          <Button @click="handleConfirm">
            {{ confirmText }}
          </Button>
        </slot>
      </DialogFooter>
      <DialogClose
          v-if="showCloseButton"
          data-slot="dialog-close"
          :class="closeClass"
          >
            <img :src="closeIcon" alt="Close">
            <span class="sr-only">Close</span>
          </DialogClose>
    </DialogContent>
  </Dialog>
</template>
<style scoped>

/* .lp-popup-body.has-scroll {
  width: calc(100% + 30px);
  padding-right: 15px;
} */


.has-scroll{
  padding-right: 1.3rem;
  width: calc(100% + 2.7rem);
}
.fixed-height{
  display: flex;
  flex-direction: column;
  flex: 1;
}
</style>
