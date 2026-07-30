<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * UI/UX 공통 가이드 4.3.4 바텀 시트(Bottom Sheet) 컴포넌트
 *
 * - shadcn-vue 의 Drawer(vaul-vue) 를 감싼 슬롯 기반 범용 바텀 시트입니다.
 * - 모바일 화면 하단 가장자리에 고정되어 모달 형태로 표현됩니다.
 * - 구조: ① 오버레이 ② 헤더 ③ 본문(default 슬롯) ④ 푸터(footer 슬롯) ⑤ 닫기 버튼
 * - `trigger` 슬롯으로 시트를 여는 버튼을 지정하거나, `v-model:open` 으로 직접 제어합니다.
 * - 본문은 내용이 많을 경우 내부 스크롤됩니다.
 */

type SheetSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    /** 시트 타이틀 (② 헤더) */
    title?: string
    /** 타이틀 하단 보조 설명 (② 헤더) */
    description?: string
    /** 본문 영역의 최대 너비 (소/중/대) */
    size?: SheetSize
    /** 우측 상단 닫기(X) 버튼 노출 여부 (⑤ 닫기 버튼) */
    showCloseButton?: boolean
    /** 상단 드래그 핸들 노출 여부 */
    showHandle?: boolean
    /** 하단 버튼 영역 노출 여부 (④ 푸터) */
    showFooter?: boolean
    /** 취소 버튼 노출 여부 */
    showCancel?: boolean
    /** 확인 버튼 라벨 */
    confirmText?: string
    /** 취소 버튼 라벨 */
    cancelText?: string
    /** 드래그/오버레이 클릭/ESC 로 닫기 방지 */
    persistent?: boolean
  }>(),
  {
    title: '',
    description: '',
    size: 'md',
    showCloseButton: true,
    showHandle: true,
    showFooter: true,
    showCancel: true,
    confirmText: '확인',
    cancelText: '취소',
    persistent: false,
  },
)

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

/**
 * v-model:open 으로 표시 여부를 제어합니다.
 * 부모가 v-model 을 바인딩하지 않아도 내부 지역 상태로 동작하므로,
 * `trigger` 슬롯만으로도 열고 닫을 수 있습니다.
 */
const open = defineModel<boolean>('open', { default: false })

// 본문 최대 너비 (소/중/대)
const sizeClass = computed(
  () =>
    ({
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-2xl',
    })[props.size],
)

function handleOpenChange(value: boolean) {
  open.value = value
  if (!value) emit('cancel')
}

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  open.value = false
  emit('cancel')
}
</script>

<template>
  <!-- ① 오버레이 / 시트 컨테이너 (persistent 시 dismissible=false) -->
  <Drawer :open="open" :dismissible="!persistent" @update:open="handleOpenChange">
    <DrawerTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DrawerTrigger>

    <DrawerContent :show-handle="showHandle">
      <div :class="cn('mx-auto flex max-h-[85vh] w-full flex-col', sizeClass)">
        <!-- ② 헤더 + ⑤ 닫기 버튼 -->
        <DrawerHeader class="relative border-b text-left">
          <DrawerTitle>{{ title }}</DrawerTitle>
          <DrawerDescription v-if="description">
            {{ description }}
          </DrawerDescription>
          <slot name="header" />
          <DrawerClose
            v-if="showCloseButton"
            class="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <X class="size-5" />
            <span class="sr-only">닫기</span>
          </DrawerClose>
        </DrawerHeader>

        <!-- ③ 본문: 내용이 많으면 내부 스크롤 -->
        <div class="flex-1 overflow-y-auto p-4">
          <slot />
        </div>

        <!-- ④ 푸터 -->
        <DrawerFooter v-if="showFooter" class="flex-row gap-2 border-t">
          <slot name="footer" :confirm="handleConfirm" :cancel="handleCancel">
            <Button
              v-if="showCancel"
              variant="outline"
              class="flex-1"
              @click="handleCancel"
            >
              {{ cancelText }}
            </Button>
            <Button class="flex-1" @click="handleConfirm">
              {{ confirmText }}
            </Button>
          </slot>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
