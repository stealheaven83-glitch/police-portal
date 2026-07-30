<script lang="ts" setup>
  import { ref } from 'vue'

  import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogAction,
    AlertDialogCancel,
  } from '@/components/ui/alert-dialog'

  // Props 정의
  defineProps<{
    title: string
    description: string
    btnOk: string
    btnCancel: string
  }>()

  const open = ref(false)

  let onConfirmCallback: ((value: any) => void) | null = null
  let onCancelCallback: (() => void) | null = null  

  // 부모에게 open 함수를 노출
  defineExpose({
    openDialog: () => {
      open.value = true
      const chainableAPI = {
        onOk(callback: (value: any) => void) {
          onConfirmCallback = callback
          return chainableAPI
        },
        onCancel(callback: () => void) {
          onCancelCallback = callback
          return chainableAPI
        },
      }
      return chainableAPI
    },
    closeDialog: () => {
      onConfirmCallback = null
      onCancelCallback = null
      open.value = false
    },
  })

  function handleConfirm() {
    onConfirmCallback?.(true)
    open.value = false
  }

  function handleCancel() {
    onCancelCallback?.()
    open.value = false
  }
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ description }}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel @click="handleCancel">
          {{ btnCancel }}
        </AlertDialogCancel>
        <AlertDialogAction @click="handleConfirm">
          {{ btnOk }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<style scoped></style>
