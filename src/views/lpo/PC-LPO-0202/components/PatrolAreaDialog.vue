<template>
  <GenericDialog2 v-model:open="patrolAreaOpen" title="순찰구역" :size="1000">
    <TabulatorGrid
      ref="gridRef"
      :columns="columns"
      :data="patrolAreaRows"
      height="380px"
      placeholder="등록된 순찰구역이 없습니다"
      @table-built="onTableBuilt"
    />

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="patrolAreaOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>

  <PatrolAreaDetailDialog />
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { WorkScheduleKey } from '../composable/useWorkSchedule'
import type { PatrolAreaRow } from '../composable/useWorkScheduleDialogs'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'
import PatrolAreaDetailDialog from './PatrolAreaDetailDialog.vue'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/**
 * 순찰구역 팝업(PC-LPO-0209).
 * '순찰구역상세' 칸의 돋보기를 누르면 상세 팝업(PC-LPO-0210)이 열린다.
 */
const store = inject(WorkScheduleKey)!
const { patrolAreaOpen, patrolAreaRows, openPatrolDetail } = store

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const { onTableBuilt } = useDialogGridRedraw(gridRef)

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', hozAlign: 'center', width: 60 },
  { title: '순찰구역명', field: 'name', cellType: 'input', width: 180 },
  {
    title: '순찰구역상세',
    field: 'detail',
    hozAlign: 'left',
    minWidth: 260,
    // 시안은 입력창이 아니라 평문 + 칸 오른쪽 끝 원형 돋보기다.
    // 공용 button 셀은 buttonVisible 이 false 인 행을 라벨 <span> 텍스트로만 그리므로
    // (버튼 테두리 없음, 클릭은 살아있음) 아이콘은 .lp-grid-search-cell 이 가상요소로
    // 얹는다 — PC-COM-2204 '비고' 열과 같은 방식이다.
    cellType: 'button',
    cssClass: 'lp-grid-search-cell lp-grid-search-end',
    buttonVisible: () => false,
    buttonLabel: (row: PatrolAreaRow) => row.detail,
    onButtonClick: (row: PatrolAreaRow) => openPatrolDetail(row),
  },
  { title: '순찰차', field: 'car', hozAlign: 'center', width: 140 },
  {
    title: '지도',
    field: 'map',
    hozAlign: 'center',
    width: 140,
    cellType: 'button',
    buttonVariant: 'tertiary',
    buttonSize: 'xs',
    buttonLabel: '위치보기',
    buttonClass: 'lp-grid-btn-compact',
    onButtonClick: () => dialog.alert({ title: '지도 위치보기는 개발 연동 예정입니다.', btnCancel: '확인' }),
  },
]

async function onSave() {
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  patrolAreaOpen.value = false
}
</script>
