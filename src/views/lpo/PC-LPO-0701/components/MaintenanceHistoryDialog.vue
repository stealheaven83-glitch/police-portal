<template>
  <GenericDialog2
    v-model:open="maintenanceDialogOpen"
    :title="`장비유지보수 이력(${maintenanceTitle})`"
    :size="800"
    :show-close-button="true"
  >
    <TabulatorGrid
      ref="gridRef"
      :columns="maintenanceGridColumns"
      v-model:data="maintenanceRows"
      height="320px"
      placeholder="등록된 유지보수 이력이 없습니다"
      @table-built="onTableBuilt"
    />

    <template #footer>
      <div class="btn-wrap">
        <Button type="button" variant="tertiary2" size="md" @click="onPrint">인쇄</Button>
        <div class="btn-wrap-group">
          <Button type="button" variant="tertiary2" size="md" @click="maintenanceDialogOpen = false">닫기</Button>
          <Button type="button" variant="tertiary2" size="md" @click="maintenanceDialogOpen = false">삭제</Button>
          <Button type="button" variant="secondary" size="md" @click="addMaintenanceRow">신규</Button>
          <Button type="button" variant="primary" size="md" @click="saveMaintenanceHistory">저장</Button>
        </div>
      </div>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { EquipmentListKey } from '../composable/PC-LPO-0701'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'

const store = inject(EquipmentListKey)!
const { maintenanceDialogOpen, maintenanceTitle, maintenanceRows, addMaintenanceRow, saveMaintenanceHistory } = store

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

// 팝업 등장 애니메이션(scale) 중에 컬럼 폭이 계산돼 오른쪽에 빈 칸이 남는 것을 막는다
const { onTableBuilt } = useDialogGridRedraw(gridRef)

function onPrint() {
  window.print()
}

/** 원본 raw table 의 "번호"는 저장된 필드가 아니라 배열 위치 기반 역순 번호였다 —
 *  formatter 로 같은 값을 계산한다. */
const maintenanceGridColumns: TabulatorGridColumn[] = [
  {
    title: '번호',
    width: 70,
    hozAlign: 'center',
    formatter: (cell: any) => {
      const total = cell.getRow().getTable().getDataCount()
      const position = cell.getRow().getPosition(true)
      return String(total - position + 1)
    },
  },
  { title: '유지보수', width: 130,field: 'type', cellType: 'input', hozAlign: 'center' },
  { title: '유지보수내용', field: 'content', cellType: 'input', hozAlign: 'center' },
  { title: '유지보수일자', width: 180,field: 'date', cellType: 'date', hozAlign: 'center' },
]
</script>
