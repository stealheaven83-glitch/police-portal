<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AutoForm } from '@/components/ui/auto-form'

const props = defineProps<{
  title?: string
  description?: string
  submitText?: string
  cancelText?: string

  schema: any
  fieldConfig?: any
  initialValues?: Record<string, any>  
}>()

const emit = defineEmits<{
  (e: 'submit', payload: any): void
  (e: 'cancel'): void
}>()

const open = ref(false)

const form = useForm({
  validationSchema: toTypedSchema(props.schema),
  validateOnMount: false,
  initialValues: props.initialValues ?? {},
})

defineExpose({
  openDialog: () => {
    form.resetForm({ values: props.initialValues ?? {} })
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

function handleOpenChange(v: boolean) {
  if (!v && open.value) handleCancel()
  open.value = v
}

const triggerSubmit = async () => {
  await form.handleSubmit((values) => {
    emit('submit', values)
    open.value = false
  })()
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent :show-close-button="false" class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ props.title ?? '입력' }}</DialogTitle>
        <DialogDescription v-if="props.description">
          {{ props.description }}
        </DialogDescription>
      </DialogHeader>

      <AutoForm
        class="space-y-6"
        :schema="props.schema"
        :field-config="props.fieldConfig"
        :form="form"
        @submit="triggerSubmit"
      />

      <DialogFooter>
        <Button type="button" variant="outline" @click="handleCancel">
          {{ props.cancelText ?? '취소' }}
        </Button>
        <Button type="button" @click="triggerSubmit">
          {{ props.submitText ?? '확인' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
