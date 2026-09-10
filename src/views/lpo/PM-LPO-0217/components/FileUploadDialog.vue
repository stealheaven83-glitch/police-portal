<template>
  <GenericDialog2 v-model:open="fileOpen" title="파일업로드" :size="560">
    <InfoTable :columns="1" popup :size="140">
      <InfoField label="첨부파일">
        <!--
          시안(13437:135520): 입력 200×40, 파일선택 84×40, 사이 12. 안내문은 그 아래 8.
          입력줄과 안내문을 lp-field(세로 gap 8)로 묶어야 InfoField 값 칸의 gap(12)이 안 붙는다.
        -->
        <span class="lp-field">
          <span class="group-gap3">
            <InputField2 :model-value="pickedName" size="sm" inputClass="w-50" readonly aria-label="첨부파일" />
            <Button type="button" variant="secondary" size="sm" class="w-21" @click="pickFile">파일선택</Button>
            <input ref="fileInputRef" type="file" class="lp-hidden-input" @change="onPickFile">
          </span>
          <p class="form-note end">＊ 파일용량이 클 경우, 시간이 오래 걸릴 수 있습니다.</p>
        </span>
      </InfoField>
    </InfoTable>

    <template v-if="files.length">
      <div class="pop-title-sub mb-2"><h2>첨부파일 목록</h2></div>
      <ul class="lp-file-boxes">
        <li v-for="file in files" :key="file.id" class="lp-file-box">
          <span class="lp-file-name">{{ file.name }}</span>
          <!-- 시안(13437:135667): 세로 구분선은 '다운로드'가 있을 때만. 삭제만 있으면 없다 -->
          <template v-if="file.downloadable">
            <span class="lp-divider-v" aria-hidden="true"></span>
            <button type="button" class="lp-file-link" @click="onDownload(file.name)">
              다운로드 <Download :size="16" aria-hidden="true" />
            </button>
          </template>
          <!-- 삭제 아이콘은 공용 FileUpload(variant="circle")와 같은 회색 원 x 를 쓴다 -->
          <button type="button" class="lp-file-link" @click="removeFile(file.id)">
            삭제 <Icon name="deleteCircle" :size="16" />
          </button>
        </li>
      </ul>
    </template>

    <template #footer>
      <!-- 시안(13437:135667): 취소 → 확인 순 -->
      <Button type="button" variant="tertiary2" size="md" @click="fileOpen = false">취소</Button>
      <Button type="button" variant="primary" size="md" @click="onConfirm">확인</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { useDialog } from '@/composable/dialog/dialog'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Download } from 'lucide-vue-next'
import Icon from '@/components/custom/icon/Icon.vue'
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

async function onDownload(name: string) {
  await dialog.alert({ title: `${name} 다운로드를 시작합니다.`, btnCancel: '확인' })
}

/** 설계서 A01 */
async function onConfirm() {
  const { confirmed } = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!confirmed) return
  fileOpen.value = false
}
</script>
