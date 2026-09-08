<template>
  <GenericDialog2 v-model:open="fileOpen" title="파일업로드" :size="480">
    <InfoTable :columns="1" popup :size="100">
      <InfoField label="첨부파일">
        <span class="group-gap2">
          <InputField2 :model-value="pickedName" size="sm" inputClass="w-48" readonly aria-label="첨부파일" />
          <Button type="button" variant="secondary" size="sm" @click="pickFile">파일선택</Button>
          <input ref="fileInputRef" type="file" class="lp-hidden-input" @change="onPickFile">
        </span>
        <p class="lp-note-text">* 파일첨부는 10M까지만 가능</p>
      </InfoField>
    </InfoTable>

    <template v-if="files.length">
      <p class="lp-heading-md lp-table-gap">첨부파일 목록</p>
      <ul class="lp-file-boxes">
        <li v-for="file in files" :key="file.id" class="lp-file-box">
          <span class="lp-file-name">{{ file.name }}</span>
          <button type="button" class="lp-file-link" @click="onDownload(file.name)">
            다운로드 <Download :size="16" aria-hidden="true" />
          </button>
          <button type="button" class="lp-file-link" @click="removeFile(file.id)">
            삭제 <X :size="16" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </template>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="fileOpen = false">취소</Button>
      <Button type="button" variant="primary" size="md" @click="onConfirm">확인</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { toast } from 'vue-sonner'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Download, X } from 'lucide-vue-next'
import { WorkLogKey } from '../composable/PM-LPO-0217'

/** 파일업로드 팝업(PM-LPO-0222) */
const store = inject(WorkLogKey)!
const { fileOpen, files, addFile, removeFile } = store

const fileInputRef = ref<HTMLInputElement | null>(null)
const pickedName = ref('')

function pickFile() {
  fileInputRef.value?.click()
}

function onPickFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    pickedName.value = file.name
    addFile(file)
  }
  input.value = ''
}

function onDownload(name: string) {
  toast.success(`${name} 다운로드를 시작합니다.`)
}

function onConfirm() {
  toast.success('저장되었습니다.')
  fileOpen.value = false
}
</script>
