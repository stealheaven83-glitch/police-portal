<template>
  <GenericDialog2 v-model:open="open" title="참고사항 업로드" :size="800">
    <!-- 첨부 영역 — 공통 AttachmentField. 라벨·파일 목록 없이 드롭존만 쓰고, 안내 문구만 이 화면 것(시안 11213:88495)으로 바꾼다 -->
    <AttachmentField label="" :hints="uploadHints" @select="addFiles" />

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
import { AttachmentField } from '@/components/custom/common'
import { UPLOAD_MAX_FILES, uploadFailures } from '../composable/PM-PUB-0111'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/** 참고사항 업로드 팝업 (Figma 11213:88495) */
const open = defineModel<boolean>('open', { default: false })

/** 드롭존 두 번째 줄 — 게시판 기본 문구 대신 이 화면 것(시안 문구 그대로. 개수는 composable 의 UPLOAD_MAX_FILES=3 과 어긋나 있음 — 기획 확인 필요) */
const uploadHints = ['엑셀파일만 가능', '파일 크기: 10MB 이하', '파일 개수: 1개']

/* 시안이 '실패 목록이 있는' 상태로 그려져 있어 목업을 그대로 띄운다. 실제 검증은 개발팀 */
const failures = ref<string[]>([...uploadFailures])

/* 실제 업로드·파싱은 개발팀 연동 대상이라 화면단에서는 개수 제한만 본다 */
async function addFiles(picked: FileList | File[]) {
  const files = Array.from(picked)
  if (files.length > UPLOAD_MAX_FILES) {
    await dialog.alert({ title: `파일은 최대 ${UPLOAD_MAX_FILES}개까지 첨부할 수 있습니다.`, btnCancel: '확인' })
    return
  }
  await dialog.alert({ title: `${files.length}개 파일을 첨부했습니다.`, btnCancel: '확인' })
}
</script>
