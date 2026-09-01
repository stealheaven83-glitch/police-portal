<script setup lang="ts">
import { computed } from 'vue'
import { useDialog } from '@/composable/dialog/dialog'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import type { CpoDiagnosisRow } from '../composable/PM-PUB-0103'
import styles from '../style/PM-PUB-0103.module.css'

const props = defineProps<{ diagnosis?: CpoDiagnosisRow | null; note?: string }>()
const open = defineModel<boolean>('open', { default: false })
const dialog = useDialog()

const score = computed(() => props.diagnosis?.score ?? 42)
const resultRows = [
  ['종업원수', '양호(3)'],
  ['경찰순찰활동', '양호(3)'],
  ['주간 주변 통행인 및 고객수', '보통(2)'],
  ['야간 주변 통행인 및 고객수', '보통(2)'],
  ['비상벨, 보안업체 계약 등', '양호(3)'],
  ['상가 내부 CCTV 및 반사경', '양호(3)'],
]

async function send() {
  await dialog.alert({ title: '등록 되었습니다.' })
  open.value = false
}
</script>

<template>
  <GenericDialog2 v-model:open="open" title="진단통보(우편 발송)" :size="800" show-close-button>
    <div class="pop-title-sub"><h2>범죄예방진단 결과 (교부용)</h2></div>
    <h3 :class="styles.sectionCaption">범죄예방진단 경찰관</h3>
    <table :class="styles.summaryTable">
      <tbody><tr><th>부서</th><td>경남청 거창서</td><th>계급</th><td>경감</td></tr><tr><th>성명</th><td>홍길동</td><th>일시</th><td>2026-08-19</td></tr></tbody>
    </table>
    <div :class="styles.mailSummary">
      <strong>총평</strong>
      <p>범죄예방진단에 응해주셔서 감사합니다. 귀하의 건물에 대한 범죄예방진단 결과는 아래와 같습니다.<br />귀하 건물의 위험도 진단점수는 <b>{{ score }}점</b>이며, 주변 동종건물의 평균 위험도 진단점수 0점에 비해 높습니다.</p>
    </div>
    <p :class="styles.resultGuide">* &lt;개별항목&gt; 위험하다고 판단된 세부 내용들입니다.</p>
    <table :class="styles.dataTable">
      <thead><tr><th>번호</th><th>평가항목</th><th>결과</th></tr></thead>
      <tbody><tr v-for="(row, index) in resultRows" :key="row[0]"><td>{{ index + 1 }}</td><td>{{ row[0] }}</td><td>{{ row[1] }}</td></tr></tbody>
    </table>
    <div :class="styles.mailNote"><strong>착안사항</strong><p>{{ note || '시골 농촌지역으로 파출소 근처에 있어 대체로 위험성이 없는 편임.' }}</p></div>
    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">취소</Button>
      <Button type="button" variant="primary" size="md" @click="send">우편발송</Button>
    </template>
  </GenericDialog2>
</template>
