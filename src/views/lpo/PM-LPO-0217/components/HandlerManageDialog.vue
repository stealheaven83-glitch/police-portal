<template>
  <GenericDialog2 v-model:open="handlerOpen" title="처리자 관리" :size="800">
    <div class="lp-pane-box">
      <section class="lp-pane" aria-labelledby="companion-list-heading">
        <h3 id="companion-list-heading" class="lp-pane-title">동행 근무자 목록</h3>
        <div class="lp-pane-wrap">
          <TabulatorGrid
            :columns="columns"
            :data="companionRows"
            height="32rem"
            placeholder="동행 근무자가 없습니다"
          />
        </div>
      </section>

      <section class="lp-pane" aria-labelledby="worker-list-heading">
        <h3 id="worker-list-heading" class="lp-pane-title">근무자 목록</h3>
        <div class="lp-pane-wrap">
          <TabulatorGrid
            :columns="columns"
            :data="handlerRows"
            height="32rem"
            placeholder="근무자가 없습니다"
          />
        </div>
      </section>
    </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="handlerOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="confirmHandlers">확인</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { WorkLogKey } from '../composable/PM-LPO-0217'

/** 처리자 관리 팝업(PM-LPO-0221) — 근무자 목록에서 고른 사람이 동행 근무자가 된다 */
const store = inject(WorkLogKey)!
const { handlerOpen, companionRows, handlerRows, confirmHandlers } = store

const columns: TabulatorGridColumn[] = [
  { title: '계급', field: 'rank', hozAlign: 'center', minWidth: 70, widthGrow: 1 },
  { title: '성명', field: 'name', hozAlign: 'center', minWidth: 80, widthGrow: 1 },
]
</script>
