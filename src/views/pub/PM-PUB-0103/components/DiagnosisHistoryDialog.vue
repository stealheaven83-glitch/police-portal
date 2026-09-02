<script setup lang="ts">
import { computed } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { NoData } from '@/components/custom/empty'
import { Button } from '@/components/custom/button'
import type { CpoDiagnosisRow, CpoHistoryRow } from '../composable/PM-PUB-0103'
import styles from '../style/PM-PUB-0103.module.css'

const props = defineProps<{ diagnosis?: CpoDiagnosisRow | null; rows: CpoHistoryRow[] }>()
const open = defineModel<boolean>('open', { default: false })

/* 시안(11174-138294): 상호명 / 진단일자 / 진단자 / 부서 네 칸을 180px 씩 균등 분할한다.
   마지막 칸만 폭을 비워 남는 폭을 흡수시킨다(% 합을 100 으로 맞추면 반올림으로 1px 이 넘친다) */
const historyColumns = [
  { key: 'bizName', label: '상호명', width: '25%' },
  { key: 'diagnosedAt', label: '진단일자', width: '25%' },
  { key: 'diagnoser', label: '진단자', width: '25%' },
  { key: 'dept', label: '부서' },
]

/** 부서는 이력 행이 아니라 선택된 진단 건에서 온다 */
const historyItems = computed(() =>
  props.rows.map((row) => ({ ...row, dept: props.diagnosis?.dept ?? '-' })),
)
</script>

<template>
  <GenericDialog2 v-model:open="open" title="범죄예방진단 이력보기" :size="800" show-close-button>
    <div :class="styles.historyTableArea">
      <TableWrapper
        :class="styles.figmaTable"
        :columns="historyColumns"
        :items="historyItems"
        :show-pagination="false"
      />
      <!--
        TableWrapper 의 emptyTitle/emptyDescription 은 TableEmpty 가 기본 슬롯만 받는데
        네임드 슬롯(#title/#description)으로 넘기고 있어 화면에 나오지 않는다(공용 컴포넌트 이슈).
        공용 파일을 건드리지 않는 대신, 빈 상태 표시는 공통 NoData 컴포넌트를 그대로 쓴다.
      -->
      <NoData v-if="!historyItems.length" message="조회된 이력이 없습니다." />
    </div>
    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">닫기</Button>
    </template>
  </GenericDialog2>
</template>
