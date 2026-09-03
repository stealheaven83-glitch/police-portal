<template>
  <GenericDialog2 v-model:open="open" title="범죄예방진단결과 (CPO확인용)" :size="1800" show-close-button :show-footer="false">
    <!--
      시안 구조가 Grid(G01 + Grid Handler + G02) 라 화면에서 2분할을 짜지 않고 공용
      LayoutSplite(드래그 리사이즈 포함) + LayoutPanel(Grid Title = 패널 헤더) 을 쓴다.
      폭은 시안 비율 720 : 994 그대로.
    -->
    <LayoutSplite :count="2" :widths="[42, 58]" :class="styles.cpoResultLayout">
      <template #layout-1>
        <LayoutPanel title="범죄예방진단통보 현황" :class="styles.cpoResultList">
        <!--
          기획서의 '그리드 있음' 표기대로 목록은 공용 TabulatorGrid 를 쓴다. 선택 행 강조
          (배경 #f0f7ff · 글자 #0054a6 · 700)는 tabulator-theme.css 가 이미 시안대로 입혀
          주므로 화면에서 따로 스타일링하지 않는다. 하단 건수/페이저/목록표시개수도
          show-pagination 이 그대로 그린다.
        -->
        <TabulatorGrid
          class="flex-1"
          :columns="listColumns"
          :data="rows"
          select-mode="single"
          height="100%"
          min-height="24rem"
          placeholder="조회된 진단통보 내역이 없습니다"
          show-pagination
          :items-per-page="10"
          @row-click="onRowClick"
        />
        </LayoutPanel>
      </template>

      <template #layout-2>
        <!-- 시안: 상세 패널 헤더 오른쪽 끝에 저장 버튼이 붙는다(팝업 하단 버튼 없음) -->
        <LayoutPanel title="범죄예방진단통보 상세" :class="styles.cpoResultDetail">
          <template #actions>
            <Button type="button" variant="primary" size="sm" @click="save">저장</Button>
          </template>

        <!-- 구간 간격은 공통 .pop-title-sub 의 margin-top 16px을 사용한다 -->
        <div class="pop-title-sub"><h2>범죄예방진단 카드</h2></div>
        <InfoTable :columns="2" popup :class="styles.infoTable">
          <!-- 시안: 간이진단통보자료는 셀 오른쪽 끝이 아니라 부서명 바로 뒤(간격 24px)에 붙는다 -->
          <InfoField label="부서" full :class="styles.cpoDeptField">
            <span class="!ml-0 shrink-0" :class="infoTableStyles['info-table-txt']">{{ diagnosis?.dept ?? '부산청 부산중부서 송도지구대' }}</span>
            <Button type="button" variant="secondary" size="sm" @click="emit('open-simple-notice')">간이진단통보자료</Button>
          </InfoField>

          <InfoField label="유형">{{ diagnosis?.type ?? '기타' }}</InfoField>
          <InfoField for="cpo-diagnosis-date" label="진단일자" :class="styles.cpoDateField">
            <DatePicker
              id="cpo-diagnosis-date"
              v-model="form.diagnosisDate"
              size="sm"
              :class="styles.detailControlFill"
              input-class="w-full"
            />
          </InfoField>

          <!-- 시안: 기본/상세주소 두 줄 옆에 이력보기(76×32 = size xs)가 세로 가운데로 붙는다 -->
          <InfoField label="주소" :row-span="2" :class="styles.cpoAddressField">
            <span>{{ baseAddressText }}</span>
            <span>{{ detailAddressText }}</span>
            <Button type="button" variant="tertiary" size="xs" @click="emit('open-history')">이력보기</Button>
          </InfoField>
          <InfoField label="관할동">{{ form.district ? districtText : '' }}</InfoField>
          <InfoField label="관할부서">{{ form.districtOffice }}</InfoField>
        </InfoTable>
        <div class="pop-title-sub"><h2>참고사항 (2023)</h2></div>
        <div class="pop-title-lv2"><h3>1) 범죄 특성</h3></div>
        <InfoTable :columns="2" popup :class="styles.refTables">
          <InfoField v-for="stat in crimeStats" :key="stat.label" :label="stat.label">
            <div :class="styles.referenceValueGrid"><span>{{ stat.grade }}</span><span>{{ stat.value }}</span></div>
          </InfoField>
        </InfoTable>

        <div class="pop-title-lv2"><h3>2) 인구 사회학적 특성</h3></div>
        <InfoTable :columns="2" popup :class="styles.refTables">
          <InfoField v-for="stat in demographicStats" :key="stat.label" :label="stat.label">
            <div :class="styles.referenceValueGrid"><span>{{ stat.grade }}</span><span>{{ stat.value }}</span></div>
          </InfoField>
        </InfoTable>
        <!--
          시안(11174-134849)의 일반현황은 표 하나가 아니라 세 덩어리다 — 대상 정보 / 사람
          / 건물·피해. 사이 간격 8px 은 0114 와 같은 .generalSplitTables 로 처리한다.
        -->
        <div class="pop-title-sub"><h2>일반현황</h2></div>
        <InfoTable :columns="2" popup :class="styles.infoTable">
          <InfoField label="진단사유">{{ reasonText }}</InfoField>
          <InfoField label="상호명">{{ diagnosis?.bizName ?? '가나다라' }}</InfoField>
        </InfoTable>

        <InfoTable :columns="2" popup :class="styles.infoTable">
          <InfoField for="cpo-owner" label="가옥주">
            <InputField2 id="cpo-owner" v-model="form.houseOwner" size="sm" class="!space-y-0 flex-1" />
          </InfoField>
          <InfoField for="cpo-applicant" label="신청자">
            <InputField2 id="cpo-applicant" v-model="form.applicant" size="sm" class="!space-y-0 flex-1" />
          </InfoField>

          <InfoField for="cpo-contact" label="연락처">
            <InputField2 id="cpo-contact" v-model="form.contact" size="sm" class="!space-y-0 flex-1" />
          </InfoField>
          <!-- 시안: 연락처 오른쪽 칸은 비어 있다(표 골격만 유지) -->
          <InfoField>
            <template #label><span class="sr-only">추가 정보</span></template>
            <span class="sr-only">입력 항목 없음</span>
          </InfoField>
        </InfoTable>

        <InfoTable :columns="2" popup :class="styles.infoTable">
          <InfoField label="직원수"><Stepper v-model="form.employeeCount" :min="0" label="직원수" /></InfoField>
          <InfoField label="업소층수"><Stepper v-model="form.floorCount" :min="0" label="업소층수" /></InfoField>

          <InfoField label="입주년도"><Stepper v-model="form.moveInYear" :min="0" label="입주년도" /></InfoField>
          <InfoField label="방범진단">
            <RadioGroup v-model="form.crimePreventionStatus" :class="infoTableStyles['info-table-radio']">
              <RadioGroupItem v-for="opt in crimePreventionStatusOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
            </RadioGroup>
          </InfoField>

          <InfoField label="이전 범죄피해">
            <RadioGroup v-model="form.previousCrimeDamage" :class="infoTableStyles['info-table-radio']">
              <RadioGroupItem v-for="opt in previousCrimeDamageOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
            </RadioGroup>
          </InfoField>
          <InfoField label="피해 횟수"><Stepper v-model="form.damageCount" :min="0" label="피해 횟수" /></InfoField>
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
            <template v-else>
              <Stepper v-model="assessment[row.key]" :min="0" :class="styles.detailStepper" :label="row.label" />
              <span :class="styles.assessmentUnit">{{ row.unit }}</span>
            </template>
          </InfoField>
        </InfoTable>

        <div class="pop-title-lv2"><h3>2) 추가 항목</h3></div>
        <InfoTable :columns="1" popup :class="styles.wideTables">
          <InfoField v-for="row in extraAssessmentRows" :key="row.key" :label="row.label" full>
            <Stepper v-model="assessment[row.key]" :min="0" :class="styles.detailStepper" :label="row.label" />
            <span :class="styles.assessmentUnit">{{ row.unit }}</span>
          </InfoField>
        </InfoTable>

        <div class="pop-title-lv2"><h3>3) 기타</h3></div>
        <InfoTable :columns="1" popup :class="styles.wideTables">
          <InfoField for="cpo-etc-label" full :class="styles.etcLabelField">
            <template #label>
              <Input id="cpo-etc-label" v-model="form.etcLabel" size="sm" :class="styles.detailEtcInput" aria-label="기타 항목" />
            </template>
            <Stepper v-model="form.etcCount" :min="0" :class="styles.detailStepper" label="기타 수량" />
          </InfoField>
        </InfoTable>

        <div :class="styles.totalScoreRow">
          <span :class="styles.totalScoreLabel">총점</span>
          <strong :class="styles.totalScoreValue">{{ totalScore }}</strong>
          <span :class="styles.totalScoreUnit">점</span>
        </div>
        <div class="pop-title-sub"><h2>시설개선(예정) 일정</h2></div>
        <InfoTable :columns="1" popup :class="styles.scheduleTable">
          <InfoField for="cpo-improvement-date" label="시설개선(예정) 일자" full>
            <DatePicker
              id="cpo-improvement-date"
              v-model="form.improvementDate"
              size="sm"
              :class="styles.detailImprovementDate"
              input-class="w-full"
              placeholder="YYYY.MM.DD"
            />
            <SelectField
              v-model="form.improvementStatus"
              :options="improvementDoneOptions"
              size="sm"
              trigger-class="w-full"
              :class="styles.detailStepper"
              placeholder="선택"
              aria-label="시설개선 상태"
            />
          </InfoField>
        </InfoTable>
        <!-- 착안사항 묶음은 상세(PM-PUB-0107)와 같은 마크업을 그대로 쓴다 -->
        <div class="pop-title-sub mb-2"><h2>착안사항</h2></div>
          <TextareaField
            v-model="form.note"
            :class="styles.detailTextarea"
            textarea-class="w-full"
            :height="80"
            aria-label="착안사항"
          />
          <div :class="styles.detailNoteMeta">
            <Checkbox v-model="form.emailNotify" label="범죄예방진단 결과 우편 통보" />
          </div>
        </LayoutPanel>
      </template>
    </LayoutSplite>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDialog } from '@/composable/dialog/dialog'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import Input from '@/components/custom/input/Input.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import Stepper from '@/components/custom/input/Stepper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import {
  buildingAssessmentRows,
  extraAssessmentRows,
  crimeStats,
  demographicStats,
  districtOptions,
  diagnosisReasonOptions,
  crimePreventionStatusOptions,
  previousCrimeDamageOptions,
  improvementDoneOptions,
  type CpoDiagnosisRow,
  type NewDiagnosisForm,
} from '../composable/PM-PUB-0103'
import styles from '../style/PM-PUB-0103.module.css'
/** RadioGroup 정렬(.info-table-radio) 같은 InfoTable 관련 공통 클래스는 공용 파일에서 그대로 가져온다 */
import infoTableStyles from '@/components/custom/info-table/InfoTable.module.css'

const props = defineProps<{
  diagnosis?: CpoDiagnosisRow | null
  rows: CpoDiagnosisRow[]
  form: NewDiagnosisForm
  assessment: Record<string, number>
  totalScore: number
}>()
const emit = defineEmits<{
  (e: 'open-simple-notice'): void
  (e: 'open-history'): void
  /** 팝업 안 목록에서 다른 건을 고르면 부모가 상세를 다시 채운다 */
  (e: 'select-row', row: CpoDiagnosisRow): void
}>()
const open = defineModel<boolean>('open', { default: false })
const dialog = useDialog()

/* 시안: 번호 / 진단일자 / 부서명 / 주소. 주소만 길어 남는 폭을 가져간다. */
const listColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  { title: '진단일자', field: 'diagnosedAt', width: 110, hozAlign: 'center' },
  { title: '부서명', field: 'dept', width: 110, hozAlign: 'center' },
  { title: '주소', field: 'baseAddress', widthGrow: 2, hozAlign: 'left' },
]

/**
 * TabulatorGrid 는 이 이벤트에 행 데이터가 아니라 RowComponent 를 넘긴다(공용 컴포넌트 규약).
 * 이미 데이터인 경우까지 방어적으로 언랩한다.
 */
function onRowClick(_event: Event, row: unknown) {
  const data = (row && typeof (row as { getData?: unknown }).getData === 'function'
    ? (row as { getData: () => CpoDiagnosisRow }).getData()
    : (row as CpoDiagnosisRow)) as CpoDiagnosisRow | undefined
  if (data) emit('select-row', data)
}

/* CPO 확인용이라 대상 정보는 읽기 전용이다 — 코드가 아니라 사람이 읽는 라벨로 바꾼다 */
const baseAddressText = computed(() => props.diagnosis?.baseAddress || props.form.address || '-')
const detailAddressText = computed(() => props.diagnosis?.detailAddress || props.form.detailAddress || '-')
const districtText = computed(
  () => districtOptions.find((o) => o.value === props.form.district)?.label ?? '-',
)
const reasonText = computed(
  () => diagnosisReasonOptions.find((o) => o.value === props.form.reason)?.label ?? '-',
)

async function save() {
  await dialog.alert({ title: '등록 되었습니다.' })
  open.value = false
}
</script>
