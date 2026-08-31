<script setup lang="ts">
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import type { CpoDiagnosisRow, CpoHistoryRow } from '../composable/PM-PUB-0103'
import styles from '../style/PM-PUB-0103.module.css'

defineProps<{ diagnosis?: CpoDiagnosisRow | null; rows: CpoHistoryRow[] }>()
const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <GenericDialog2 v-model:open="open" title="범죄예방진단 이력보기" :size="800" show-close-button>
    <div :class="styles.tableScroll">
      <table :class="styles.dataTable">
        <thead><tr><th>상호명</th><th>진단일자</th><th>진단자</th><th>부서</th></tr></thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.bizName }}</td><td>{{ row.diagnosedAt }}</td><td>{{ row.diagnoser }}</td><td>{{ diagnosis?.dept ?? '-' }}</td>
          </tr>
          <tr v-if="!rows.length"><td colspan="4" :class="styles.emptyCell">조회된 이력이 없습니다.</td></tr>
        </tbody>
      </table>
    </div>
    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">닫기</Button>
    </template>
  </GenericDialog2>
</template>
