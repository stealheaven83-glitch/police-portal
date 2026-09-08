<template>
  <GenericDialog2 v-model:open="open" title="진단통보(우편 발송)" :size="800" show-close-button>
    <div class="pop-title-sub"><h2>범죄예방진단 결과 (교부용)</h2></div>
    <div class="pop-title-lv2"><h3>범죄예방진단 경찰관</h3></div>
    <InfoTable :columns="2" popup size="120">
      <InfoField label="부서">경남청 거창서</InfoField>
      <InfoField label="계급">경감</InfoField>
      <InfoField label="성명">홍길동</InfoField>
      <InfoField label="일시">2026-08-19</InfoField>
    </InfoTable>
    <div :class="styles.mailSummary">
      <strong>총평</strong>
      <p>범죄예방진단에 응해주셔서 감사합니다. 귀하의 건물에 대한 범죄예방진단 결과는 아래와 같습니다.<br />귀하 건물의 위험도 진단점수는 <strong :class="styles.mailScore">{{ score }}점</strong>이며, 주변 동종건물의 평균 위험도 진단점수 <strong>0점</strong>에 비해 높습니다.</p>
    </div>
    <p :class="styles.resultGuide">* &lt;개별항목&gt; 위험하다고 판단된 세부 내용들입니다.</p>
    <TableWrapper :class="styles.figmaTable" :columns="resultColumns" :items="resultItems" :show-pagination="false" />
    <InfoTable :columns="1" popup size="120" :class="styles.mailNoteTable">
      <InfoField label="착안사항" full>
        {{ note || '시골 농촌지역으로 파출소 근처에 있어 대체로 위험성이 없는 편임.' }}
      </InfoField>
    </InfoTable>
    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">취소</Button>
      <Button type="button" variant="primary" size="md" @click="send">우편발송</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDialog } from '@/composable/dialog/dialog'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { Button } from '@/components/custom/button'
import type { CpoDiagnosisRow } from '../composable/PM-PUB-0103'
import styles from '../style/PM-PUB-0103.module.css'

const props = defineProps<{
  diagnosis?: CpoDiagnosisRow | null
  note?: string
  mailRequested?: boolean
}>()
const open = defineModel<boolean>('open', { default: false })
const dialog = useDialog()

const score = computed(() => props.diagnosis?.score ?? 42)

/*
 * 개별항목 표 — 시안(720px 기준 60 / 420 / 240) 비율을 퍼센트로 준다.
 * px 로 고정하면 합이 컨테이너 폭과 1~2px 어긋나는 순간 Table 컨테이너(overflow:auto)에
 * 가로 스크롤이 생긴다.
 */
const resultColumns = [
  { key: 'no', label: '번호', width: '8.34%' },
  { key: 'item', label: '평가항목', width: '58.33%' },
  { key: 'result', label: '결과', width: '33.33%' },
]

const resultItems = [
  { no: 1, item: '종업원수', result: '양호(3)' },
  { no: 2, item: '경찰순찰활동', result: '양호(3)' },
  { no: 3, item: '주간 주변 통행인 및 고객수', result: '보통(2)' },
  { no: 4, item: '야간 주변 통행인 및 고객수', result: '보통(2)' },
  { no: 5, item: '비상벨, 보안업체 계약 등', result: '양호(3)' },
  { no: 6, item: '상가 내부 CCTV 및 반사경', result: '양호(3)' },
]

async function send() {
  await dialog.alert({
    title: props.mailRequested
      ? '우편발송이 신청되었습니다.'
      : '우편통보를 희망하지 않았습니다.',
    btnCancel: '확인',
  })
  open.value = false
}
</script>
