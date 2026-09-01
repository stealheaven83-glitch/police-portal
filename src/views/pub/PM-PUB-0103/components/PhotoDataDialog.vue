<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { toast } from 'vue-sonner'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { Button } from '@/components/custom/button'
import { useDialog } from '@/composable/dialog/dialog'
import noImageIcon from '@/assets/icon/img_no_image.svg?url'
import styles from '../style/PM-PUB-0103.module.css'

const dialog = useDialog()

const open = defineModel<boolean>('open', { default: false })
const note = defineModel<string>('note', { default: '' })

interface PhotoSlot {
  key: string
  label: string
  preview: string
  fileName: string
}

function makeSlots(prefix: string, label: string) {
  return Array.from({ length: 5 }, (_, index) => ({
    key: `${prefix}-${index}`,
    label: `${label} ${index + 1}`,
    preview: '',
    fileName: '',
  }))
}

const photos = ref<PhotoSlot[]>([
  ...makeSlots('before', '취약상황사진'),
  ...makeSlots('after', '개선상황사진'),
])
const photoRows = computed(() => [photos.value.slice(0, 5), photos.value.slice(5)])
const fileInputs = ref<Record<string, HTMLInputElement | null>>({})

function setFileInput(key: string, element: unknown) {
  fileInputs.value[key] = (element as HTMLInputElement | null) ?? null
}

function pickPhoto(key: string) {
  fileInputs.value[key]?.click()
}

function onFileSelected(photo: PhotoSlot, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.warning('이미지 파일만 등록할 수 있습니다.')
    input.value = ''
    return
  }
  if (photo.preview) URL.revokeObjectURL(photo.preview)
  photo.preview = URL.createObjectURL(file)
  photo.fileName = file.name
  input.value = ''
}

async function save() {
  await dialog.alert({ title: '등록 되었습니다.' })
  open.value = false
}

onBeforeUnmount(() => photos.value.forEach((photo) => photo.preview && URL.revokeObjectURL(photo.preview)))
</script>

<template>
  <GenericDialog2 v-model:open="open" title="사진자료" :size="800" show-close-button>
    <div :class="styles.photoArea">
      <div v-for="(row, rowIndex) in photoRows" :key="rowIndex" :class="styles.photoRow">
        <article v-for="photo in row" :key="photo.key" :class="styles.photoCard">
          <h3>{{ photo.label }}</h3>
          <div :class="styles.photoPreview">
            <img v-if="photo.preview" :class="styles.photoImg" :src="photo.preview" :alt="photo.label" />
            <img v-else :class="styles.noImage" :src="noImageIcon" alt="No Image" />
          </div>
          <p :title="photo.fileName">{{ photo.fileName || '일시' }}</p>
          <input
            :ref="(element) => setFileInput(photo.key, element)"
            type="file"
            accept="image/*"
            class="sr-only"
            @change="onFileSelected(photo, $event)"
          />
          <Button type="button" variant="tertiary2" size="xs" class="w-full" @click="pickPhoto(photo.key)">
            사진변경
          </Button>
        </article>
      </div>
    </div>

    <div :class="styles.photoNote">
      <InfoTable :columns="1" popup>
        <InfoField label="범죄예방진단자 조치사항" full>
          <TextareaField
            v-model="note"
            class="w-full !space-y-0"
            textarea-class="w-full"
            :height="80"
            aria-label="범죄예방진단자 조치사항"
          />
        </InfoField>
      </InfoTable>
    </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">취소</Button>
      <Button type="button" variant="primary" size="md" @click="save">저장</Button>
    </template>
  </GenericDialog2>
</template>
