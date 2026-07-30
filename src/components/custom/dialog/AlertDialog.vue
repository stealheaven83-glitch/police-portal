<script lang="ts" setup>
import { ref } from 'vue'

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
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {{ title ?? '알림' }}
        </AlertDialogTitle>

        <AlertDialogDescription v-if="description">
          {{ description }}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogAction @click="handleCancel">
          {{ btnCancel ?? '확인' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<style scoped></style>
