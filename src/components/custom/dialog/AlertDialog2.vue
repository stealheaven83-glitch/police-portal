<script lang="ts" setup>
import { computed, ref } from 'vue'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import closeIcon from '@/assets/icon/icon_popup_x.svg?url'
import { Button } from '@/components/custom/button'
import { dialogDeviceClass, type DialogDevice } from './dialogDevice'

// Props 정의
const props = defineProps<{
  /** **HTML 태그를 넣을 수 있다**(v-html) — 아이콘은 `<img src="/portal/asset/images/icon/...">` */
  title?: string
  description?: string
  btnCancel?: string
  /** 어느 화면 기준으로 그리나. 기본 'responsive' — dialogDevice.ts 참고 */
  device?: DialogDevice
}>()

/** 기기별 치수는 police-override.css 의 .lp-dialog-* 가 CSS 변수로 들고 있다 */
const deviceClass = computed(() => dialogDeviceClass(props.device))

const emit = defineEmits<{
  (e: 'cancel'): void
  // (e: 'confirm'): void  // 필요하면 추후 확장
}>()

const open = ref(false)

defineExpose({
  openDialog: () => {
    open.value = true
  },
  closeDialog: () => {
    open.value = false
  },
})

function handleCancel() {
  emit('cancel')
  open.value = false
}

</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent
      class="px-6 pt-6 gap-0"
      :class="[description ? 'pb-[3.2rem]' : 'pb-[3.4rem]', deviceClass]"
      :style="{ width: 'calc(100% - 2rem)' }"
    >
      <AlertDialogHeader class="lp-dialog-head flex justify-end flex-row">
        <!-- <button type="button" @click="handleCancel">
          <img :src="closeIcon" alt="닫기 버튼" />
        </button> -->
      </AlertDialogHeader>
      <div class="min-h-21 text-center flex flex-col justify-center">
        <!-- title 은 태그를 받는다(아이콘용) — 문구는 우리가 넣는 상수라 v-html 이다 -->
        <AlertDialogTitle class="lp-dialog-title text-[2.4rem] font-[700]">
          <span v-html="title ?? '알림'"></span>
        </AlertDialogTitle>
        <div v-if="description" class="lp-dialog-desc-box max-h-30 overflow-y-auto bg-[#F4F5F6] mt-4 mb-2 rounded-[8px]">
          <AlertDialogDescription class="lp-dialog-desc flex items-center justify-center text-[1.7rem]/[150%] p-4 text-[var(--Text-body_0)]">
            {{ description }}
          </AlertDialogDescription>
        </div>
      </div>

      <AlertDialogFooter class="lp-dialog-footer justify-center sm:justify-center mt-4">
        <Button variant="primary" size="md" @click="handleCancel">
          {{ btnCancel ?? '확인' }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<style scoped></style>
