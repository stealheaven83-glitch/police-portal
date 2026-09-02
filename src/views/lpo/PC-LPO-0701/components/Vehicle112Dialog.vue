<script setup lang="ts">
import { computed, inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { EquipmentListKey, type Vehicle112Row } from '../composable/PC-LPO-0701'
import styles from '@/components/custom/info-table/InfoTable.module.css'

const store = inject(EquipmentListKey)!
const {
  vehicle112DialogOpen,
  vehicle112Keyword,
  vehicle112Rows,
  selectedVehicle112Id,
  searchVehicle112,
  assignVehicle112,
} = store

const vehicle112Columns = [
  { key: 'id', label: '번호', width: '8rem' },
  { key: 'deptName', label: '부서명' },
  { key: 'patrolName', label: '순마명' },
]

/**
 * 조회 결과가 바뀌면 TableWrapper 를 다시 마운트한다.
 * TableWrapper 는 선택 행을 **인덱스**로 들고 있어서(외부에서 지정할 수 없다), 목록이 바뀌면
 * 엉뚱한 행이 선택된 채로 남는다. 결과 집합이 바뀔 때만 키가 바뀌므로 행 클릭에는 영향이 없다.
 */
const resultKey = computed(() => vehicle112Rows.value.map((r) => r.id).join('-'))

/** TableWrapper 는 같은 행을 다시 누르면 선택이 풀린다 — 그 토글을 그대로 따라간다 */
function onSelectRow({ item }: { index: number; item: Vehicle112Row }) {
  selectedVehicle112Id.value = selectedVehicle112Id.value === item.id ? null : item.id
}
</script>

<template>
  <GenericDialog2 v-model:open="vehicle112DialogOpen" title="112차량 조회" :size="560" :show-close-button="false">
    <div :class="styles.searchRow">
      <label class="vehicle-112-popup-input-title" for="vehicle112-keyword">출동요소명</label>
      <InputField2
        id="vehicle112-keyword"
        v-model="vehicle112Keyword"
        size="sm"
        :class="styles.searchInput"
        @keyup.enter="searchVehicle112"
      />
      <Button type="button" variant="secondary" size="sm" @click="searchVehicle112">조회</Button>
    </div>
    <TableWrapper
      :key="resultKey"
      :columns="vehicle112Columns"
      :items="vehicle112Rows"
      :show-pagination="false"
      selectable
      empty-title="검색 결과가 없습니다"
      empty-description="다른 출동요소명으로 다시 조회해 주세요."
      @select-row="onSelectRow"
    />
    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="vehicle112DialogOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" :disabled="selectedVehicle112Id == null" @click="assignVehicle112">
        차량지정
      </Button>
    </template>
  </GenericDialog2>
</template>
