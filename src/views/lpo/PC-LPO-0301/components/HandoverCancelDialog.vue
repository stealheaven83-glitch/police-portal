<template>
  <GenericDialog2 v-model:open="open" title="인수인계 회수" :size="560">
    <!-- 라벨 폭 160: "인수인계 회수사유" 가 안쪽 여백 포함 한 줄에 들어가는 폭(정의서 그림은 한 줄) -->
    <InfoTable :columns="1" popup :size="160">
      <InfoField label="근무일자">
        <span class="readonly-text">{{ workDate }}</span>
      </InfoField>
      <InfoField label="인수인계 회수사유" for="handover-cancel-reason">
        <TextareaField
          id="handover-cancel-reason"
          v-model="reason"
          placeholder="회수 사유를 입력해 주세요."
          :height="104"
          class="w-full"
        />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">취소</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { useDialog } from '@/composable/dialog/dialog'

/**
 * 인수인계 회수(취소) 팝업 — PC-LPO-0302 (화면 정의서 2-4).
 * 인수인계 화면(PC-LPO-0301)의 '인수인계 취소' 버튼이 연다. 근무일자는 화면의 근무일을 그대로 보여주고,
 * 회수사유를 받아 저장하면 부모가 그 결재 칸을 되돌린다(실제 저장은 개발팀 몫).
 */
defineProps<{
  /** 팝업 머리의 근무일자 — 화면의 근무일(yyyy.MM.dd.) */
  workDate: string
}>()

const emit = defineEmits<{
  (e: 'save', reason: string): void
}>()

const open = defineModel<boolean>('open', { default: false })
const dialog = useDialog()

const reason = ref('')

/** 열 때마다 사유를 비운다 — 이전에 쓰던 글이 남지 않게 */
watch(open, (isOpen) => {
  if (isOpen) reason.value = ''
})

/** 사용자 지정(저장 흐름 기본): 필수값 알림 → 「저장 하시겠습니까?」 컨펌 → 「저장 되었습니다.」 알림 → 닫기 */
async function onSave() {
  if (!reason.value.trim()) {
    await dialog.alert({ title: '인수인계 회수사유를 입력해 주세요.', btnCancel: '확인' })
    return
  }
  const { confirmed } = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!confirmed) return
  emit('save', reason.value.trim())
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
  open.value = false
}
</script>
