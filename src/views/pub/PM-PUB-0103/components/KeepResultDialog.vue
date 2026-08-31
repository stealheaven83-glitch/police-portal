<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { Button } from '@/components/custom/button'
import type { CpoDiagnosisRow } from '../composable/PM-PUB-0103'
import styles from '../style/PM-PUB-0103.module.css'

const props = defineProps<{ diagnosis?: CpoDiagnosisRow | null }>()
const open = defineModel<boolean>('open', { default: false })
const result = ref('')
const action = ref('')

watch(open, (value) => {
  if (!value) return
  result.value = props.diagnosis ? `${props.diagnosis.bizName} 건물의 범죄예방진단 결과입니다.` : ''
  action.value = ''
})

function save() {
  open.value = false
  toast.success('보관용 진단결과가 저장되었습니다.')
}
</script>

<template>
  <GenericDialog2 v-model:open="open" title="범죄예방진단결과 (보관용)" :size="800" show-close-button>
    <div class="pop-title-sub"><h2>범죄예방진단 경찰관</h2></div>
    <InfoTable :columns="2" popup :class="styles.keepPersonTable">
      <InfoField label="부서">부산청 부산서부서 경찰서</InfoField><InfoField label="계급">경사</InfoField>
      <InfoField label="성명">홍길동</InfoField><InfoField label="일시">2026-05-01</InfoField>
    </InfoTable>
    <div class="pop-title-sub" :class="styles.keepSectionHeading"><h2>결과(건축물에 대한 위험성 총평)</h2></div>
    <TextareaField v-model="result" class="w-full !space-y-0" textarea-class="w-full" :height="96" />
    <div class="pop-title-sub" :class="styles.keepSectionHeading"><h2>조치내용</h2></div>
    <TextareaField v-model="action" class="w-full !space-y-0" textarea-class="w-full" :height="96" />
    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">취소</Button>
      <Button type="button" variant="primary" size="md" @click="save">저장</Button>
    </template>
  </GenericDialog2>
</template>
