<script setup lang="ts">
import { useDialog } from '@/composable/dialog/dialog'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import Stepper from '@/components/custom/input/Stepper.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import {
  buildingAssessmentRows,
  extraAssessmentRows,
  type CpoDiagnosisRow,
  type NewDiagnosisForm,
} from '../composable/PM-PUB-0103'
import styles from '../style/PM-PUB-0103.module.css'
import infoTableStyles from '@/components/custom/info-table/InfoTable.module.css'

const props = defineProps<{
  diagnosis?: CpoDiagnosisRow | null
  rows: CpoDiagnosisRow[]
  form: NewDiagnosisForm
  assessment: Record<string, number>
  totalScore: number
}>()
const emit = defineEmits<{ (e: 'open-simple-notice'): void; (e: 'open-history'): void }>()
const open = defineModel<boolean>('open', { default: false })
const dialog = useDialog()

async function save() {
  await dialog.alert({ title: '등록 되었습니다.' })
  open.value = false
}
</script>

<template>
  <GenericDialog2 v-model:open="open" title="범죄예방진단결과 (CPO확인용)" :size="1200" show-close-button>
    <div :class="styles.cpoResultLayout">
      <aside :class="styles.cpoResultList">
        <div class="pop-title-sub"><h2>범죄예방진단통보 현황</h2></div>
        <div :class="styles.tableScroll">
          <table :class="styles.dataTable">
            <thead><tr><th>번호</th><th>접수일자</th><th>부서명</th><th>주소</th></tr></thead>
            <tbody>
              <tr v-for="row in rows.slice(0, 10)" :key="row.no" :class="{ [styles.activeDataRow]: row.no === diagnosis?.no }">
                <td>{{ row.no }}</td><td>2026-06-24</td><td>{{ row.dept }}</td><td>{{ row.baseAddress }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p :class="styles.resultCount">총 {{ rows.length }}건 / 현재 1-10</p>
      </aside>

      <section :class="styles.cpoResultDetail">
        <div class="pop-title-sub"><h2>범죄예방진단통보 상세</h2></div>
        <div class="pop-title-lv2"><h3>범죄예방진단 카드</h3></div>
        <InfoTable :columns="2" popup :class="styles.cardTable">
          <InfoField label="부서">{{ diagnosis?.dept ?? '부산청 부산중부서 송도지구대' }}</InfoField>
          <InfoField label="관리번호">2026000006</InfoField>
          <InfoField label="유형">{{ diagnosis?.type ?? '기타' }}</InfoField>
          <InfoField label="진단일자"><DatePicker v-model="form.diagnosisDate" size="sm" class="!space-y-0 flex-1" clearable /></InfoField>
          <InfoField label="주소" full :class="styles.inlineActionField">
            <span>{{ diagnosis ? `${diagnosis.baseAddress} ${diagnosis.detailAddress}` : '서울특별시 도봉구 덕릉로 101호' }}</span>
            <Button type="button" variant="secondary" size="sm" @click="emit('open-history')">이력보기</Button>
            <Button type="button" variant="secondary" size="sm" @click="emit('open-simple-notice')">간이진단통보자료</Button>
          </InfoField>
        </InfoTable>

        <div class="pop-title-lv2"><h3>일반현황</h3></div>
        <InfoTable :columns="2" popup>
          <InfoField label="진단사유">{{ form.reason || '기타' }}</InfoField>
          <InfoField label="상호명">{{ diagnosis?.bizName ?? '가나다라' }}</InfoField>
          <InfoField label="가옥주">{{ form.houseOwner || '-' }}</InfoField>
          <InfoField label="신청자">{{ form.applicant || '-' }}</InfoField>
          <InfoField label="연락처">{{ form.contact || '-' }}</InfoField>
          <InfoField label="피해 횟수"><Stepper v-model="form.damageCount" :min="0" /></InfoField>
        </InfoTable>

        <div class="pop-title-sub"><h2>범죄예방진단 항목 및 진단결과</h2></div>
        <div class="pop-title-lv2"><h3>1) 건물특성</h3></div>
        <InfoTable :columns="1" popup :class="styles.buildingTable">
          <InfoField v-for="row in buildingAssessmentRows" :key="row.key" :label="row.label" full>
            <RadioGroup v-if="row.type === 'radio'" :model-value="assessment[row.key]" :class="infoTableStyles['info-table-radio']" @update:model-value="(value) => (assessment[row.key] = Number(value))">
              <RadioGroupItem :value="3" label="양호(3)" />
              <RadioGroupItem :value="2" label="보통(2)" />
              <RadioGroupItem :value="1" label="위험(1)" />
            </RadioGroup>
            <template v-else><Stepper v-model="assessment[row.key]" :min="0" class="w-30 shrink-0" /><span>{{ row.unit }}</span></template>
          </InfoField>
        </InfoTable>
        <div class="pop-title-lv2"><h3>2) 추가 항목</h3></div>
        <InfoTable :columns="1" popup :class="styles.wideTables">
          <InfoField v-for="row in extraAssessmentRows" :key="row.key" :label="row.label" full><Stepper v-model="assessment[row.key]" :min="0" class="w-30 shrink-0" /><span>{{ row.unit }}</span></InfoField>
        </InfoTable>
        <div :class="styles.totalScoreRow">
          <span :class="styles.totalScoreLabel">총점</span>
          <span :class="styles.totalScoreValue">{{ totalScore }}</span>
          <span :class="styles.totalScoreUnit">점</span>
        </div>

        <div class="pop-title-sub"><h2>시설개선(예정) 일정</h2></div>
        <InfoTable :columns="1" popup><InfoField label="시설개선(예정) 일자" full><DatePicker v-model="form.improvementDate" size="sm" class="!space-y-0 w-50" clearable /></InfoField></InfoTable>
        <div class="pop-title-sub"><h2>착안사항</h2></div>
        <TextareaField v-model="form.note" class="w-full !space-y-0" textarea-class="w-full" :height="80" />
        <Checkbox v-model="form.emailNotify" class="mt-3" label="범죄예방진단 결과 이메일 통보" />
      </section>
    </div>
    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">취소</Button>
      <Button type="button" variant="primary" size="md" @click="save">저장</Button>
    </template>
  </GenericDialog2>
</template>
