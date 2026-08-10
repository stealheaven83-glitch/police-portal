<script lang="ts" setup>
import { ref } from 'vue'

import { VisuallyHidden } from 'reka-ui'
import {
  AlertDialog,
  AlertDialogAction,
  // AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import closeIcon from '@/assets/icon/icon_popup_x.svg'
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
      class="px-6 pt-6 pb-[3.4rem] gap-0"
      :style="{ width: 'calc(100% - 20px)', maxWidth: '400px' }"
    >
      <AlertDialogHeader class="flex justify-end flex-row">
        <button>
          <img :src="closeIcon" alt="닫기 버튼" />
        </button>
      </AlertDialogHeader>
        <AlertDialogTitle v-if="description" class="relative">
            {{ title ?? '알림' }}
        </AlertDialogTitle>
        <div class="flex items-center max-h-[120px] min-h-[84px] overflow-y-auto">
          <AlertDialogDescription v-if="description" class="text-[1.7rem]/[150%]">
            {{ description }}
          </AlertDialogDescription>
        </div>

      <AlertDialogFooter class="justify-center sm:justify-center mt-6">
        <Button variant="primary" class="w-25" @click="handleCancel">
          {{ btnCancel ?? '확인2' }}
        </Button>
        <!-- <AlertDialogAction @click="handleCancel" class="w-25" variant="primary">
          {{ btnCancel ?? '확인' }}
        </AlertDialogAction> -->
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<style scoped></style>
