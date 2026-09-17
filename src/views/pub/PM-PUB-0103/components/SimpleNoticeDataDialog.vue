<template>
  <GenericDialog2 v-model:open="open" title="간이진단통보자료" :size="800" show-close-button>
    <div class="pop-title-sub mb-2"><h2>112사건</h2></div>
    <TableWrapper :columns="incidentColumns" :items="incidentItems" :show-pagination="false" />

    <!-- 시안(11174-137412)은 사진 칸 위아래로 12px 이 잡혀 있지만, 영역 여백 없음으로 확정(사용자 지정) -->
    <ul class="lp-photo-grid lp-photo-grid-spread">
      <li v-for="photo in photos" :key="photo.label" class="lp-photo-item">
        <span class="lp-photo-label">{{ photo.label }}</span>

        <div class="lp-photo-box">
          <img v-if="photo.src" :src="photo.src" :alt="photo.label" class="lp-photo-img" />
          <span v-else class="lp-photo-empty" aria-hidden="true">
            <img :src="photoEmptyIcon" alt="" class="lp-photo-empty-icon" />
            <img :src="photoEmptyLabel" alt="" class="lp-photo-empty-label" />
          </span>
        </div>

        <p class="lp-photo-meta">일시 {{ photo.takenAt }}</p>
      </li>
    </ul>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">닫기</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { Button } from '@/components/custom/button'
import photoEmptyLabel from '@/assets/images/icons/photoEmptyLabel.svg?url'
import type { CpoDiagnosisRow } from '../composable/PM-PUB-0103'

const props = defineProps<{ diagnosis?: CpoDiagnosisRow | null }>()
const open = defineModel<boolean>('open', { default: false })
const photoEmptyIcon = '/portal/asset/images/icon/ico-no-image.svg'

/*
 * 112사건 표는 기획서(PM-PUB-0109) 기준 5칸이다 — 시안(11174-137412)은 사건번호·신고내용만
 * 그려져 있지만, 표 구성은 기획서를 따른다. 신고내용이 가장 길어 폭을 제일 넓게 잡는다.
 */
const incidentColumns = [
  { key: 'caseNo', label: '사건번호', width: '10%' },
  { key: 'content', label: '신고내용', width: '32%', cellClass: 'lp-cell-multiline' },
  { key: 'receiptNo', label: '접수번호', width: '17%' },
  { key: 'closing', label: '종결내용', width: '22%', cellClass: 'lp-cell-multiline' },
  /* 마지막 칸은 폭을 비워 남는 폭을 흡수시킨다 — % 를 합이 100 이 되게 줘도 반올림으로 1px 이 넘쳐 잘린다 */
  { key: 'receivedAt', label: '접수일시' },
]

const incidentItems = computed(() => [
  {
    caseNo: 13,
    /* TODO: API 연동 전 목업. 시안처럼 여러 줄로 길게 들어오는 신고내용이다. */
    content: [
      `${props.diagnosis?.bizName ?? '대상 업소'} 주변 방범 취약 관련 신고 접수`,
      '야간 시간대 조도가 낮고 CCTV 사각지대가 있어 순찰 강화 요청이 반복 접수되었습니다.',
      '후문 출입 통제가 되지 않아 외부인 출입이 자유로운 상태입니다.',
    ].join('\n'),
    receiptNo: '202606120013',
    closing: '현장 확인 후 순찰 강화 및 시설 보강 안내',
    receivedAt: '2026-06-12 14:30',
  },
])

/* 시안: 취약상황 2장 · 개선상황 2장. 각 슬롯은 사진이 있으면 사진을, 없으면 No Image 를 보여준다 */
const photos = [
  { label: '취약상황사진 1', src: '/portal/asset/images/img/img_main_card.png', takenAt: '2026-06-12' },
  { label: '취약상황사진 2', src: '', takenAt: '2026-06-12' },
  { label: '개선상황사진 1', src: '/portal/asset/images/img/img_main_card.png', takenAt: '2026-06-12' },
  { label: '개선상황사진 2', src: '', takenAt: '2026-06-12' },
]
</script>
