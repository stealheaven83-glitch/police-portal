<template>
  <GenericDialog2 v-model:open="open" title="112신고" :size="800" show-close-button>
    <InfoTable :columns="2" popup size="120">
      <InfoField label="CODE구분">{{ detail.codeType }}</InfoField>
      <InfoField label="사건번호">{{ detail.caseNo }}</InfoField>
      <InfoField label="신고시간">{{ detail.reportedAt }}</InfoField>
      <InfoField label="종결시간">{{ detail.closedAt }}</InfoField>
      <InfoField label="출동자">{{ detail.responders }}</InfoField>
      <InfoField label="종결자">{{ detail.closer }}</InfoField>
      <InfoField label="신고자">{{ detail.reporter }}</InfoField>
      <InfoField label="연락처">{{ detail.contact }}</InfoField>
      <InfoField label="성별">{{ detail.gender }}</InfoField>
      <!-- 성별 옆은 시안에서 빈 칸이다 — 표 테두리만 이어 준다 -->
      <InfoField class="lp-info-blank-cell" aria-hidden="true" />

      <InfoField label="신고위치" full>{{ detail.location }}</InfoField>
      <!-- 신고내용만 시안에서 칸이 높다(120px). 줄바꿈도 그대로 보여야 한다 -->
      <InfoField label="신고내용" full class="lp-info-row-tall lp-pre-line">{{ detail.content }}</InfoField>
      <InfoField label="참고사항" full>{{ detail.note }}</InfoField>
      <InfoField label="처리결과" full>{{ detail.result }}</InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">닫기</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoField, InfoTable } from '@/components/custom/info-table'
import { report112Detail, type Report112Detail } from '../composable/PM-LPO-0223'

/**
 * 112신고 상세 팝업. 근무일지(乙) 조회(PM-LPO-0223) 목록의 '상세 > 보기' 에서 연다.
 * Figma 12664:92634 (프레임 이름은 '장비관리_05_수갑_상세팝업' 이지만 내용은 112신고다).
 *
 * 아직 어느 행을 눌러도 같은 값이 뜬다 — 목록 행에 112신고 상세 필드가 없어서,
 * 시안에 그려진 한 건을 그대로 보여준다.
 */
interface Props {
  detail?: Report112Detail
}

withDefaults(defineProps<Props>(), {
  detail: () => report112Detail,
})

const open = defineModel<boolean>('open', { default: false })
</script>
