<template>
  <GenericDialog2 v-model:open="open" title="사진자료" :size="1000" show-close-button>
    <!-- 사진 묶음 ↔ 조치사항 표 16px 은 .lp-dialog-body 가 준다(InfoTable popup 의 7px 은 빼고) -->
    <div class="lp-dialog-body">
      <div class="lp-photo-rows">
        <ul v-for="(row, rowIndex) in photoRows" :key="rowIndex" class="lp-photo-grid lp-photo-grid-5">
          <li v-for="photo in row" :key="photo.key" class="lp-photo-item">
            <span class="lp-photo-label">{{ photo.label }}</span>

            <div class="lp-photo-box">
              <img v-if="photo.preview" :src="photo.preview" :alt="photo.label" class="lp-photo-img" />
              <span v-else class="lp-photo-empty" aria-hidden="true">
                <img :src="photoEmptyIcon" alt="" class="lp-photo-empty-icon" />
                <img :src="photoEmptyLabel" alt="" class="lp-photo-empty-label" />
              </span>
            </div>

            <p class="lp-photo-meta" :title="photo.fileName">{{ photo.fileName || '일시' }}</p>

            <div class="lp-photo-actions">
              <Button type="button" variant="tertiary2" size="xs" padding="12" @click="pickPhoto(photo.key)">
                사진변경
              </Button>
              <Button type="button" variant="tertiary2" size="xs" padding="12" @click="removePhoto(photo)">
                삭제
              </Button>
            </div>

            <input
              :ref="(element) => setFileInput(photo.key, element)"
              type="file"
              accept="image/*"
              class="sr-only"
              @change="onFileSelected(photo, $event)"
            />
          </li>
        </ul>
      </div>

      <InfoTable :columns="1">
        <InfoField label="범죄예방진단자 조치사항" full>
          <TextareaField
            v-model="note"
            class="w-full"
            textarea-class="w-full"
            :height="72"
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

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { Button } from '@/components/custom/button'
import { useDialog } from '@/composable/dialog/dialog'
import photoEmptyLabel from '@/assets/images/icons/photoEmptyLabel.svg?url'

const dialog = useDialog()
const photoEmptyIcon = '/portal/asset/images/icon/ico-no-image.svg'

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

async function onFileSelected(photo: PhotoSlot, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    await dialog.alert({ title: '이미지 파일만 등록할 수 있습니다.', btnCancel: '확인' })
    input.value = ''
    return
  }
  if (photo.preview) URL.revokeObjectURL(photo.preview)
  photo.preview = URL.createObjectURL(file)
  photo.fileName = file.name
  input.value = ''
}

/** 등록된 사진을 지운다 — 되돌릴 수 없으므로 확인창(ConfirmDialog2)으로 한 번 막는다 */
async function removePhoto(photo: PhotoSlot) {
  const { confirmed } = await dialog.confirm({
    title: '사진을 삭제하시겠습니까?',
    btnOk: '예',
    btnCancel: '아니오',
  })
  if (!confirmed) return

  if (photo.preview) URL.revokeObjectURL(photo.preview)
  photo.preview = ''
  photo.fileName = ''


}

async function save() {
  await dialog.alert({ title: '등록 되었습니다.' })
  open.value = false
}

onBeforeUnmount(() => photos.value.forEach((photo) => photo.preview && URL.revokeObjectURL(photo.preview)))
</script>
