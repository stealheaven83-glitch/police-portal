<template>
  <GenericDialog2 v-model:open="open" title="참고사항 업로드" :size="800">
    <!-- 첨부 영역 — 공용 .lp-dropzone (PM-LPO-0101 메모 폼과 같은 구성) -->
    <div class="lp-dropzone" @dragover.prevent @drop.prevent="onDrop">
      <div class="lp-dropzone-txt">
        <p>첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 직접 선택해주세요.</p>
        <p class="lp-dropzone-sub">
          <span>엑셀파일만 가능</span>
          <span>파일 크기: 10MB 이하</span>
          <span>파일 개수: 1개</span>
        </p>
      </div>
      <Button type="button" variant="secondary" size="sm" padding="16" @click="pickFile">파일선택</Button>
      <input
        ref="fileInputRef"
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.pdf,.mp4"
        hidden
        @change="onFilePick"
      >
    </div>

    <!-- 업로드 결과 중 실패한 줄만 사유와 함께 나열한다 -->
    <div v-if="failures.length" class="lp-upload-result">
      <p class="lp-rule-title">등록 실패 목록</p>
      <ul class="lp-error-list">
        <li v-for="(reason, index) in failures" :key="index">{{ reason }}</li>
      </ul>
    </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">닫기</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { UPLOAD_MAX_FILES, uploadFailures } from '../composable/PM-PUB-0111'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/** 참고사항 업로드 팝업 (Figma 11213:88495) */
const open = defineModel<boolean>('open', { default: false })

/* 시안이 '실패 목록이 있는' 상태로 그려져 있어 목업을 그대로 띄운다. 실제 검증은 개발팀 */
const failures = ref<string[]>([...uploadFailures])

const fileInputRef = ref<HTMLInputElement | null>(null)

function pickFile() {
  fileInputRef.value?.click()
}

function onFilePick(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (files.length) addFiles(files)
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function onDrop(e: DragEvent) {
  const files = Array.from(e.dataTransfer?.files ?? [])
  if (files.length) addFiles(files)
}

/* 실제 업로드·파싱은 개발팀 연동 대상이라 화면단에서는 개수 제한만 본다 */
async function addFiles(files: File[]) {
  if (files.length > UPLOAD_MAX_FILES) {
    await dialog.alert({ title: `파일은 최대 ${UPLOAD_MAX_FILES}개까지 첨부할 수 있습니다.`, btnCancel: '확인' })
    return
  }
  await dialog.alert({ title: `${files.length}개 파일을 첨부했습니다.`, btnCancel: '확인' })
}
</script>
