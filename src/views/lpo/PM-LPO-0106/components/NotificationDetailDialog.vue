<template>
  <GenericDialog2 :open="open" title="알림 상세" :size="560" @update:open="onUpdateOpen">
    <InfoTable :columns="1" popup>
      <InfoField label="구분">{{ row?.category }}</InfoField>
      <InfoField label="내용">
        <span :class="[infoTableStyles['info-table-txt'], styles.contentText]">{{ contentWithBreak }}</span>
      </InfoField>
      <InfoField label="일시">{{ row?.date }}</InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" class="w-25" variant="tertiary2" size="md" @click="onDelete">삭제</Button>
      <Button type="button" class="w-25" variant="primary" size="md" @click="onConfirm">확인</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import InfoTable from '@/components/custom/info-table/InfoTable.vue'
import InfoField from '@/components/custom/info-table/InfoField.vue'
import { Button } from '@/components/custom/button'
import type { NotificationRow } from '../composable/PM-LPO-0106'
// InfoField 가 자동으로 씌워주는 값 텍스트 스타일(.info-table-txt)을 직접 쓰기 위해 같은
// 원본 모듈을 가져온다 — 줄바꿈이 있는 값은 InfoField 기본 슬롯의 "텍스트 전용" 판별을
// 못 타서(내부에 <span> 엘리먼트가 생기므로) 직접 클래스를 입혀야 한다.
import infoTableStyles from '@/components/custom/info-table/InfoTable.module.css'
import styles from '../style/PM-LPO-0106.module.css'

const props = defineProps<{
  open: boolean
  row: NotificationRow | null
}>()

/** 기획서: "내용"의 날짜/시간 표기(YYYY-MM-DD HH:MM) 다음에서 줄바꿈해서 보여준다 */
const contentWithBreak = computed(() => {
  const content = props.row?.content ?? ''
  return content.replace(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\s+/, '$1\n')
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'delete', id: number): void
}>()

function onUpdateOpen(value: boolean) {
  emit('update:open', value)
}

function onConfirm() {
  emit('update:open', false)
}

/** 삭제 결과 피드백(toast)은 목록 화면이 책임진다 */
function onDelete() {
  if (!props.row) return
  emit('delete', props.row.id)
  emit('update:open', false)
}
</script>
