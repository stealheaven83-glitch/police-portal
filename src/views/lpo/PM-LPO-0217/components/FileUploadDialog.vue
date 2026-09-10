<template>
  <GenericDialog2 v-model:open="fileOpen" title="파일업로드" :size="560">
    <InfoTable :columns="1" popup :size="140">
      <InfoField label="첨부파일">
        <!-- 시안(13437:135520): 입력 200×40, 파일선택 84×40, 사이 12 -->
        <span class="group-gap3">
          <InputField2 :model-value="pickedName" size="sm" inputClass="w-50" readonly aria-label="첨부파일" />
          <Button type="button" variant="secondary" size="sm" class="w-21" @click="pickFile">파일선택</Button>
          <input ref="fileInputRef" type="file" class="lp-hidden-input" @change="onPickFile">
        </span>
        <ul class="lp-dot-list">
          <li>파일첨부는 10M까지만 가능</li>
        </ul>
      </InfoField>
    </InfoTable>

    <template v-if="files.length">
      <div class="pop-title-sub mb-2"><h2>첨부파일 목록</h2></div>
      <ul class="lp-file-boxes">
        <li v-for="file in files" :key="file.id" class="lp-file-box">
          <span class="lp-file-name">{{ file.name }}</span>
          <!-- 시안(13437:135687): 다운로드·삭제 앞에 세로 구분선 -->
          <span class="lp-divider-v" aria-hidden="true"></span>
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
      <!-- 기획서 1: '저장' 이 먼저, 그 다음 '닫기' -->
      <Button type="button" variant="primary" size="md" @click="onConfirm">저장</Button>
      <Button type="button" variant="tertiary2" size="md" @click="fileOpen = false">닫기</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { toast } from 'vue-sonner'
import { useDialog } from '@/composable/dialog/dialog'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Download, X } from 'lucide-vue-next'
import { WorkLogKey } from '../composable/PM-LPO-0217'

const dialog = useDialog()

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

/** 설계서 A01 */
async function onConfirm() {
  const { confirmed } = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!confirmed) return
  fileOpen.value = false
}
</script>
