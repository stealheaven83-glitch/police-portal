<template>
  <!-- 시안 13724:123136 — 팝업 800, 표 720(200/260/260), 하단 닫기 버튼 100×48 -->
  <GenericDialog2 v-model:open="open" title="물리력 사용 보고서 작성 요건" :size="800" :show-footer="false">
    <TableWrapper
      :columns="columns"
      :items="rows"
      :selectable="false"
      caption="물리력 유형별 사용 보고서 작성 요건"
    >
      <template #cell-requirement="{ item }">
        <div class="lp-cell-lines">
          <span v-if="item.requirementStrong" class="lp-em-danger lp-em-strong">{{ item.requirementStrong }}</span>
          <span v-if="item.requirement">{{ item.requirement }}</span>
        </div>
      </template>

      <template #cell-note="{ item }">
        <!-- 첫 줄(권총 등)은 '-' 한 글자라 가운데 정렬 그대로 둔다 -->
        <span v-if="!item.noteTitle">{{ item.noteText }}</span>
        <div v-else class="lp-cell-lines">
          <span class="lp-em-strong">{{ item.noteTitle }}</span>
          <ul v-if="item.noteList.length" class="lp-dot-list">
            <li v-for="(line, i) in item.noteList" :key="i">{{ line }}</li>
          </ul>
          <span v-else>{{ item.noteText }}</span>
        </div>
      </template>
    </TableWrapper>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">닫기</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'

/** 작성 요건 안내 팝업 — 목록 위 '[필수] 보고서 작성 요건 확인' 링크에서 연다 */
const open = defineModel<boolean>('open', { default: false })

const columns = [
  { key: 'type', label: '물리력 유형', width: '200px' },
  { key: 'requirement', label: '사용보고서 작성요건', width: '260px' },
  { key: 'note', label: '비고', width: '260px' },
]

/**
 * 시안의 표 내용을 그대로 옮긴 상수다 — 화면에 고정으로 붙는 안내라 목업이 아니다.
 * requirementStrong 은 붉은 강조줄, requirement 는 그 아래 보조 한 줄이다.
 */
const rows = [
  {
    type: '권총 · 분사기 · 전자충격기',
    requirementStrong: '',
    requirement: '사용 시 전부 작성',
    noteTitle: '',
    noteText: '-',
    noteList: [] as string[],
  },
  {
    type: '경찰봉 · 방패',
    requirementStrong: '중위험 이상 물리력 사용시 작성',
    requirement: '',
    noteTitle: '중위험 이상 물리력이란?',
    noteText: '',
    noteList: [
      '경찰봉: 중요 부위가 아닌 신체 부위를 찌르거나 가격하는 행위',
      '방패: 강하게 압박하거나 세게 미는 행위',
    ],
  },
  {
    type: '수갑 · 신체적 물리력',
    requirementStrong: '부상 발생 시 작성',
    requirement: '* 부상 없는 수갑 사용은 근무일지, 수사보고서에 기재',
    noteTitle: '부상이란?',
    noteText:
      '수갑 사용 시 통상적으로 수반되는 일시적 통증·찰과상 등은 아니며, 병원 후송·진료가 필요한 상황같이 신체적 부상이 발생한 경우를 의미',
    noteList: [] as string[],
  },
]
</script>
