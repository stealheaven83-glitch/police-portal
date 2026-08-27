<script lang="ts" setup>
import { ref } from 'vue'

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

// Props 정의
defineProps<{
  title?: string
  description?: string
  btnCancel?: string
}>()

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
      :class="description ? 'pb-[3.2rem]' : 'pb-[3.4rem]'"
      :style="{ width: 'calc(100% - 20px)', maxWidth: '400px' }"
    >
      <AlertDialogHeader class="flex justify-end flex-row">
        <button type="button" @click="handleCancel">
          <img :src="closeIcon" alt="닫기 버튼" />
        </button>
      </AlertDialogHeader>
      <div class="min-h-[84px] text-center flex flex-col justify-center">
        <AlertDialogTitle class="text-[2.4rem] font-[700]">
            {{ title ?? '알림' }}
        </AlertDialogTitle>
        <div v-if="description" class="max-h-[120px] min-h-[84px] overflow-y-auto bg-[#F4F5F6] mt-4 mb-2 rounded-[8px]">
          <AlertDialogDescription class="flex items-center justify-center text-[1.7rem]/[150%] p-4 min-h-[84px] text-[var(--Text-body_0)]">
            {{ description }}
          </AlertDialogDescription>
        </div>
      </div>

      <AlertDialogFooter class="justify-center sm:justify-center mt-4">
        <Button variant="primary" size="md" class="w-25" @click="handleCancel">
          {{ btnCancel ?? '확인' }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<style scoped></style>
