<template>
  <GenericDialog2 v-model:open="open" title="간이진단통보자료" :size="800" show-close-button>
    <div class="pop-title-sub mb-2"><h2>112사건</h2></div>
    <InfoTable :columns="2" size="100">
      <InfoField label="사건번호">13</InfoField>
      <InfoField label="접수번호">23445667</InfoField>
      <InfoField label="신고내용" full>
        <span class="readonly-text">[CODE0 선지령]<br />도와주세요 / 101동 204호 / 위치가 / 빨리 와주세요.<br />000000000</span>
      </InfoField>
      <InfoField label="종결내용">잘해결됨</InfoField>
      <InfoField label="접수일시">2026.10.11 12:12</InfoField>
    </InfoTable>

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
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { Button } from '@/components/custom/button'
import photoEmptyLabel from '@/assets/images/icons/photoEmptyLabel.svg?url'
import type { CpoDiagnosisRow } from '../composable/PM-PUB-0103'

defineProps<{ diagnosis?: CpoDiagnosisRow | null }>()
const open = defineModel<boolean>('open', { default: false })
const photoEmptyIcon = '/portal/asset/images/icon/ico-no-image.svg'

/* 시안: 취약상황 2장 · 개선상황 2장. 각 슬롯은 사진이 있으면 사진을, 없으면 No Image 를 보여준다 */
const photos = [
  { label: '취약상황사진 1', src: '/portal/asset/images/img/img_main_card.png', takenAt: '2026-06-12' },
  { label: '취약상황사진 2', src: '', takenAt: '2026-06-12' },
  { label: '개선상황사진 1', src: '/portal/asset/images/img/img_main_card.png', takenAt: '2026-06-12' },
  { label: '개선상황사진 2', src: '', takenAt: '2026-06-12' },
]
</script>
