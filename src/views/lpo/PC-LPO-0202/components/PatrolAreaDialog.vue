<template>
  <GenericDialog2 v-model:open="patrolAreaOpen" title="순찰구역" :size="920">
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
import { toast } from 'vue-sonner'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { WorkScheduleKey } from '../composable/useWorkSchedule'
import type { PatrolAreaRow } from '../composable/useWorkScheduleDialogs'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'
import PatrolAreaDetailDialog from './PatrolAreaDetailDialog.vue'

/**
 * 순찰구역 팝업(PC-LPO-0209).
 * '순찰구역상세' 칸의 돋보기를 누르면 상세 팝업(PC-LPO-0210)이 열린다.
 */
const store = inject(WorkScheduleKey)!
const { patrolAreaOpen, patrolAreaRows, openPatrolDetail } = store

const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const { onTableBuilt } = useDialogGridRedraw(gridRef)

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', hozAlign: 'center', minWidth: 60, widthGrow: 1 },
  { title: '순찰구역명', field: 'name', cellType: 'input', minWidth: 140, widthGrow: 2 },
  {
    title: '순찰구역상세',
    field: 'detail',
    cellType: 'input',
    cellIcon: searchIcon,
    cellIconLabel: '순찰구역 상세 조회',
    minWidth: 260,
    widthGrow: 4,
    onCellIconClick: (row: PatrolAreaRow) => openPatrolDetail(row),
  },
  { title: '순찰차', field: 'car', hozAlign: 'center', minWidth: 90, widthGrow: 1 },
  {
    title: '지도',
    field: 'map',
    hozAlign: 'center',
    minWidth: 100,
    widthGrow: 1,
    cellType: 'button',
    buttonVariant: 'tertiary',
    buttonLabel: '위치보기',
    onButtonClick: () => toast.info('지도 위치보기는 개발 연동 예정입니다.'),
  },
]

function onSave() {
  toast.success('저장되었습니다.')
  patrolAreaOpen.value = false
}
</script>
