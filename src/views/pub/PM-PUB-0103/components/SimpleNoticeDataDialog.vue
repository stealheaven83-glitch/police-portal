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

    <div :class="styles.noticePhotoGrid">
      <article v-for="photo in photos" :key="photo.label" :class="styles.noticePhotoCard">
        <h3>{{ photo.label }}</h3>
        <div :class="styles.noticePhotoPlaceholder">
          <img v-if="photo.src" :class="styles.photoImg" :src="photo.src" :alt="photo.label" />
          <img v-else :class="styles.noImage" :src="noImageIcon" alt="No Image" />
        </div>
        <p>일시 {{ photo.takenAt }}</p>
      </article>
    </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">닫기</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { Button } from '@/components/custom/button'
import noImageIcon from '@/assets/icon/img_no_image.svg?url'
import type { CpoDiagnosisRow } from '../composable/PM-PUB-0103'
import styles from '../style/PM-PUB-0103.module.css'

defineProps<{ diagnosis?: CpoDiagnosisRow | null }>()
const open = defineModel<boolean>('open', { default: false })

/* 시안: 취약상황 2장 · 개선상황 2장. 각 슬롯은 사진이 있으면 사진을, 없으면 No Image 를 보여준다 */
const photos = [
  { label: '취약상황사진 1', src: '/portal/asset/images/img/img_main_card.png', takenAt: '2026-06-12' },
  { label: '취약상황사진 2', src: '', takenAt: '2026-06-12' },
  { label: '개선상황사진 1', src: '/portal/asset/images/img/img_main_card.png', takenAt: '2026-06-12' },
  { label: '개선상황사진 2', src: '', takenAt: '2026-06-12' },
]
</script>
