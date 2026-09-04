<template>
  <GenericDialog2
    v-model:open="report112DialogOpen"
    title="112신고 조회"
    :size="800"
    :height="560"
    :show-close-button="true"
  >
    <div class="pop-body">
      <div class="pop-search-area">
        <InputField2
          v-model="report112Keyword"
          size="sm"
          class="!space-y-0"
          input-class="w-full"
          label="접수번호"
          label-class="sr-only"
          placeholder="접수번호"
        />
        <Button type="button" variant="secondary" size="sm">조회</Button>
      </div>

      <div class="lp-dialog-head lp-row-between">
        <p class="form-note">조회할 신고를 고르면 접수번호와 신고일시가 채워집니다.</p>
        <Button type="button" variant="tertiary" size="sm" @click="openPending">
          미도착 · 미종결 목록
        </Button>
      </div>

      <TabulatorGrid
        :columns="columns"
        :data="filtered112Rows"
        class="flex-1"
        height="100%"
        placeholder="조회된 신고가 없습니다"
        @row-click="onRowClick"
      />
    </div>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { JudgementSurveyKey, type Report112Row } from '../composable/PM-PUB-0201'

const store = inject(JudgementSurveyKey)!
const {
  report112DialogOpen,
  report112Keyword,
  filtered112Rows,
  applyReport112,
  openPending,
} = store

const columns: TabulatorGridColumn[] = [
  { title: '접수번호', field: 'receiptNo', width: 170, hozAlign: 'center' },
  { title: '접수일시', field: 'receivedAt', width: 160, hozAlign: 'center' },
  { title: '진행상태', field: 'progress', width: 100, hozAlign: 'center' },
  { title: '장소', field: 'place', hozAlign: 'center' },
  { title: '신고내용', field: 'content', hozAlign: 'center' },
]

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as Report112Row
  applyReport112(data)
}
</script>
