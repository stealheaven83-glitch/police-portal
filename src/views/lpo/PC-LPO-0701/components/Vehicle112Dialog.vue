<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { EquipmentListKey } from '../composable/PC-LPO-0701'
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
</script>

<template>
  <GenericDialog2 v-model:open="vehicle112DialogOpen" title="112차량 조회" :size="560" :show-close-button="false">
    <div :class="styles.searchRow">
      <label class="shrink-0 text-[1.4rem] text-[var(--Text-body_1)]" for="vehicle112-keyword">출동요소명</label>
      <InputField2
        id="vehicle112-keyword"
        v-model="vehicle112Keyword"
        size="sm"
        :class="styles.searchInput"
        @keyup.enter="searchVehicle112"
      />
      <Button type="button" variant="secondary" size="sm" @click="searchVehicle112">조회</Button>
    </div>

    <div :class="styles.vehicleTableWrap">
      <table :class="styles.vehicleTable">
        <caption class="sr-only">112차량 조회 결과 — 번호, 부서명, 순마명</caption>
        <thead>
          <tr>
            <th scope="col">번호</th>
            <th scope="col">부서명</th>
            <th scope="col">순마명</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in vehicle112Rows"
            :key="row.id"
            :class="[styles.vehicleRow, selectedVehicle112Id === row.id && styles.vehicleRowSelected]"
            tabindex="0"
            role="button"
            :aria-pressed="selectedVehicle112Id === row.id"
            @click="selectedVehicle112Id = row.id"
            @keydown.enter="selectedVehicle112Id = row.id"
          >
            <td>{{ row.id }}</td>
            <td>{{ row.deptName }}</td>
            <td>{{ row.patrolName }}</td>
          </tr>
          <tr v-if="!vehicle112Rows.length">
            <td colspan="3" class="py-10 text-center text-[var(--Text-body_disable)]">검색 결과가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="vehicle112DialogOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" :disabled="selectedVehicle112Id == null" @click="assignVehicle112">
        차량지정
      </Button>
    </template>
  </GenericDialog2>
</template>
