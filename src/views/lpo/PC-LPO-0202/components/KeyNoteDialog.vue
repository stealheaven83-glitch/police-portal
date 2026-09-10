<template>
  <GenericDialog2 v-model:open="keyNoteOpen" title="중점사항 입력" :size="560">
    <TextareaField
      id="key-note"
      v-model="keyNoteText"
      aria-label="중점사항"
      placeholder="중점사항을 입력해주세요."
      :height="100"
    />

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="keyNoteOpen = false">닫기</Button>
      <Button type="button" variant="secondary" size="md" @click="loadPrevious">이전 중점사항</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { WorkScheduleKey } from '../composable/useWorkSchedule'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/** 중점사항 입력 팝업(PC-LPO-0213) */
const store = inject(WorkScheduleKey)!
const { keyNoteOpen, keyNoteText, importantNotes } = store

/** 이전 근무일의 중점사항을 그대로 끌어온다 — 실제 조회는 개발팀 몫이라 목업 문구를 넣는다 */
async function loadPrevious() {
  keyNoteText.value = '중앙아시아 거리 거점 및 도보순찰, 밀리오레 상가 주변 도보순찰'
  await dialog.alert({ title: '이전 중점사항을 불러왔습니다.', btnCancel: '확인' })
}

async function onSave() {
  if (!keyNoteText.value.trim()) {
    await dialog.alert({ title: '중점사항을 입력해 주세요.', btnCancel: '확인' })
    return
  }
  importantNotes.value = keyNoteText.value
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  keyNoteOpen.value = false
}
</script>
