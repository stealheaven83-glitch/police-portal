<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
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
    /**
     * 팝업 높이 고정(숫자면 px). 시안이 높이까지 정한 팝업에 쓴다.
     * 주지 않으면 지금까지처럼 내용 높이만큼 늘어난다.
     * 지정해도 max-h-[85dvh] 는 그대로 걸리므로 화면보다 커지지 않는다.
     */
    height?: DialogSize
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
 * 결과는 본문 div 의 `data-scrollable` 속성에만 반영한다 — 안에서만 쓰고 밖으로 보내지 않는다.
 *
 * DOM 구조는 바꾸지 않는다(31개 화면이 이 팝업을 쓴다 — 슬롯을 래퍼로 감싸면
 * 안에서 height:100% 같은 걸 쓰던 화면이 깨진다). 그래서 감시자를 두 개 쓴다:
 *   · ResizeObserver   — 팝업/뷰포트가 줄어 컨테이너가 작아지는 경우
 *   · MutationObserver — 슬롯 내용이 늘거나 줄어드는 경우(조회 결과, 탭 전환 등)
 */
const bodyRef = ref<HTMLElement | null>(null)
const isScrollable = ref(false)

/** 스크롤이 생겼을 때만 스크롤바 폭만큼 본문을 넓혀 팝업 좌우 여백 안으로 밀어넣는다 */
const scrollStyle = computed(() =>
  isScrollable.value
    ? { width: 'calc(100% + 30px)', paddingRight: '15px' }
    : undefined,
)


let resizeObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null
let rafId = 0

function measure() {
  const el = bodyRef.value
  if (!el) return
  // 소수점 반올림 오차로 1px 차이가 나는 경우가 있어 여유를 둔다
  const next = el.scrollHeight - el.clientHeight > 1
  isScrollable.value = next
}

/** 레이아웃이 확정된 뒤에 한 번만 재도록 프레임 단위로 묶는다 */
function scheduleMeasure() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = 0
    measure()
  })
}

function observe(el: HTMLElement | null) {
  disconnect()
  if (!el) return
  resizeObserver = new ResizeObserver(scheduleMeasure)
  resizeObserver.observe(el)
  mutationObserver = new MutationObserver(scheduleMeasure)
  mutationObserver.observe(el, { childList: true, subtree: true, characterData: true })
  scheduleMeasure()
}

function disconnect() {
  resizeObserver?.disconnect()
  resizeObserver = null
  mutationObserver?.disconnect()
  mutationObserver = null
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

// 팝업이 닫히면 DialogContent 가 언마운트돼 ref 가 null 이 된다 — 열릴 때 다시 붙인다.
watch(bodyRef, (el) => observe(el))
onBeforeUnmount(disconnect)

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
      class="dialog-wrap px-[3.9rem] py-6 gap-0 flex flex-col max-h-[85dvh]"
      :class="sizeClass"
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
        <DialogClose
          v-if="showCloseButton"
          data-slot="dialog-close"
          class="focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <img :src="closeIcon" alt="Close">
            <span class="sr-only">Close</span>
          </DialogClose>
      </DialogHeader>

      <!-- 본문: 내용이 많으면 내부 스크롤. 스크롤이 생기면 data-scrollable="true" -->
      <div ref="bodyRef" class="flex-1 min-h-0 overflow-y-auto" :style="scrollStyle" :data-scrollable="isScrollable">
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
