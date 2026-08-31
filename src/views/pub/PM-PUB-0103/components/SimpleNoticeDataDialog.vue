<script setup lang="ts">
import { ImageIcon } from 'lucide-vue-next'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import type { CpoDiagnosisRow } from '../composable/PM-PUB-0103'
import styles from '../style/PM-PUB-0103.module.css'

defineProps<{ diagnosis?: CpoDiagnosisRow | null }>()
const open = defineModel<boolean>('open', { default: false })

const photoLabels = ['취약상황사진 1', '취약상황사진 2', '개선상황사진 1', '개선상황사진 2']
</script>

<template>
  <GenericDialog2 v-model:open="open" title="간이진단통보자료" :size="800" show-close-button>
    <div class="pop-title-sub"><h2>112사건</h2></div>
    <div :class="styles.tableScroll">
      <table :class="styles.dataTable">
        <thead><tr><th>사건번호</th><th>신고내용</th><th>접수번호</th><th>종결내용</th><th>접수일시</th></tr></thead>
        <tbody>
          <tr>
            <td>13</td>
            <td>{{ diagnosis ? `${diagnosis.bizName} 주변 방범 취약 관련 신고` : '방범 취약 관련 신고내용' }}</td>
            <td>202606120013</td>
            <td>현장 확인 및 순찰 강화</td>
            <td>2026-06-12 14:30</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div :class="styles.noticePhotoGrid">
      <article v-for="label in photoLabels" :key="label" :class="styles.noticePhotoCard">
        <h3>{{ label }}</h3>
        <div :class="styles.noticePhotoPlaceholder"><ImageIcon :size="36" aria-hidden="true" /><span>No Image</span></div>
        <p>일시 2026-06-12</p>
      </article>
    </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">닫기</Button>
    </template>
  </GenericDialog2>
</template>
