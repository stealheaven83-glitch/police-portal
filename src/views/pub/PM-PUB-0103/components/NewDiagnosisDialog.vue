<template>
  <GenericDialog2 v-model:open="open" :title="title" :size="size" show-close-button>
    <!--
      진단 추가(PM-PUB-0106)는 이미 등록된 진단 대상에 회차를 더하는 화면이라, 대상 정보
      (부서·관리번호·유형)는 읽기 전용으로 보여주고 주소/관할은 일반현황으로 내려간다.
      나머지 섹션(참고사항·진단결과·시설개선·착안사항)은 신규(0114)와 완전히 같아 공유한다.
    -->
    <template v-if="mode === 'add'">
      <div class="pop-title-sub"><h2>범죄예방진단 카드</h2></div>
      <InfoTable :columns="2" popup size="120">
        <InfoField label="부서">{{ departmentText }}</InfoField>
        <InfoField label="관리번호">
          {{ form.managementNo }}
          <Button type="button" variant="secondary" size="sm" @click="onOpenSimpleNoticeData">
            간이진단통보자료
          </Button>
        </InfoField>

        <!--
          대상 정보라 수정할 수 없다. 시안(11172:133356)에서 이 칸들은 입력박스가 아니라
          값만 있는 표 셀(table_2)이라 disabled 인풋 대신 텍스트로 둔다.
        -->
        <InfoField label="유형">{{ typeText }}</InfoField>
        <InfoField for="add-diagnosis-date" label="진단일자">
          <!-- 달력과 사진자료가 좁아져도 한 줄에 남도록 줄바꿈 없는 group-gap3(간격 12px)으로 묶는다 -->
          <div class="group-gap3">
            <DatePicker
              id="add-diagnosis-date"
              v-model="form.diagnosisDate"
              size="sm"
              class="!space-y-0"
              placeholder="YYYY.MM.DD"
            />
            <Button type="button" variant="secondary" size="sm" @click="onOpenPhotoData">사진자료</Button>
          </div>
        </InfoField>

        <InfoField label="현금다액업소 여부" full>
          <RadioGroup v-model="form.cashIntensive" :class="infoTableStyles['info-table-radio']">
            <RadioGroupItem v-for="opt in cashIntensiveOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
          </RadioGroup>
        </InfoField>
      </InfoTable>
    </template>

    <template v-else>
      <div class="pop-title-sub"><h2>범죄예방진단 카드</h2></div>
      <InfoTable :columns="2" popup size="120">
        <InfoField label="부서" full :class="styles.fieldInline">
          <DepartmentCascadeSelect
            v-model="form.department"
            size="sm"
            select-class="w-full"
            :class="styles.departmentSelectGroup"
          />
          <Button type="button" variant="secondary" size="sm" @click="onOpenSimpleNoticeData">
            간이진단통보자료
          </Button>
        </InfoField>

        <InfoField for="new-diagnosis-type" label="유형">
          <SelectField
            id="new-diagnosis-type"
            v-model="form.type"
            :options="typeSelectOptions"
            size="sm"
            trigger-class="w-full"
            class="!space-y-0 flex-1"
            placeholder="선택"
          />
        </InfoField>
        <InfoField for="new-diagnosis-date" label="진단일자" :class="`${styles.fieldInline} ${styles.dateFieldWidth}`">
          <DatePicker
            id="new-diagnosis-date"
            v-model="form.diagnosisDate"
            size="sm"
            class="!space-y-0 flex-1 min-w-0"
            placeholder="YYYY.MM.DD"
          />
          <Button type="button" variant="secondary" size="sm" @click="onOpenPhotoData">사진자료</Button>
        </InfoField>

        <InfoField label="현금다액업소 여부" full>
          <RadioGroup v-model="form.cashIntensive" :class="infoTableStyles['info-table-radio']">
            <RadioGroupItem v-for="opt in cashIntensiveOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
          </RadioGroup>
        </InfoField>

        <InfoField
          for="new-diagnosis-address"
          label="주소"
          layout="column"
          :row-span="2"
          :class="styles.addressField"
        >
            <InputField2
              id="new-diagnosis-address"
              v-model="form.address"
              size="sm"
              class="!space-y-0 w-full"
              :icon="searchIcon"
              icon-class="size-5"
              icon-label="주소 검색"
              search
              @icon-click="onSearchAddress"
            />
            <div class="group-gap3" :class="styles.detailAddressRow">
              <InputField2
                id="new-diagnosis-detail-address"
                v-model="form.detailAddress"
                size="sm"
                class="!space-y-0 flex-1 min-w-0"
                input-class="w-full"
                aria-label="상세주소"
              />
              <Button type="button" variant="secondary" size="sm" @click="onOpenHistory">이력보기</Button>
            </div>
        </InfoField>

        <InfoField for="new-diagnosis-district" label="관할동">
            <SelectField
              id="new-diagnosis-district"
              v-model="form.district"
              :options="districtOptions"
              size="sm"
              trigger-class="w-full"
              class="!space-y-0 flex-1"
              placeholder="선택"
            />
        </InfoField>
        <InfoField for="new-diagnosis-office" label="관할부서">
            <InputField2
              id="new-diagnosis-office"
              v-model="form.districtOffice"
              size="sm"
              class="!space-y-0 flex-1"
            />
        </InfoField>
      </InfoTable>
    </template>

    <!--
      진단 추가(PM-PUB-0106)는 시안상 일반현황이 참고사항보다 먼저 온다(신규 0114 는 반대).
      대상 정보(주소·관할)는 읽기 전용이고, 관할부서까지가 한 덩어리·관리자부터가 다른
      덩어리라 표를 둘로 나눠 8px 띄운다.
    -->
    <template v-if="mode === 'add'">
      <div class="pop-title-sub"><h2>일반현황</h2></div>
      <InfoTable :columns="2" popup size="120">
        <InfoField for="add-diagnosis-reason" label="진단사유">
          <SelectField
            id="add-diagnosis-reason"
            v-model="form.reason"
            :options="diagnosisReasonOptions"
            size="sm"
            trigger-class="w-full"
            class="!space-y-0 flex-1"
            placeholder="선택"
          />
        </InfoField>
        <!-- 시안: 기본주소 / 상세주소도 입력박스가 아니라 값 두 줄이다 -->
        <InfoField label="주소" layout="column" :row-span="2" :class="styles.addressReadonlyField">
          <span :class="styles.cellText">{{ form.address }}</span>
          <span :class="styles.cellText">{{ form.detailAddress }}</span>
        </InfoField>

        <InfoField for="add-diagnosis-biz-name" label="상호명">
          <InputField2 id="add-diagnosis-biz-name" v-model="form.bizName" size="sm" class="!space-y-0 flex-1" />
        </InfoField>

        <!-- 시안: 관할동 / 관할부서도 값만 있는 표 셀이다 -->
        <InfoField label="관할동">{{ districtText }}</InfoField>
        <InfoField label="관할부서">{{ form.districtOffice }}</InfoField>
      </InfoTable>

      <InfoTable :columns="2" popup size="120">
        <InfoField for="add-diagnosis-manager" label="관리자">
          <InputField2 id="add-diagnosis-manager" v-model="form.manager" size="sm" class="!space-y-0 flex-1" />
        </InfoField>
        <InfoField for="add-diagnosis-contact" label="연락처">
          <InputField2 id="add-diagnosis-contact" v-model="form.contact" size="sm" class="!space-y-0 flex-1" />
        </InfoField>

        <InfoField label="직원수">
          <Stepper v-model="form.employeeCount" :min="0" label="직원수" />
        </InfoField>
        <InfoField label="업소층수">
          <Stepper v-model="form.floorCount" :min="0" label="업소층수" />
        </InfoField>

        <InfoField label="입주년도">
          <Stepper v-model="form.moveInYear" :min="0" label="입주년도" />
        </InfoField>
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
        <InfoField label="피해 횟수">
          <Stepper v-model="form.damageCount" :min="0" label="피해 횟수" />
        </InfoField>
      </InfoTable>
    </template>

    <div class="pop-title-sub"><h2>참고사항 (2023)</h2></div>
      <div class="pop-title-lv2"><h3>1) 범죄 특성</h3></div>
      <InfoTable :columns="2" popup size="148">
        <InfoField v-for="stat in crimeStats" :key="stat.label" :label="stat.label">
          <div class="lp-field-split">
            <span>{{ mode === 'add' ? stat.grade : '-' }}</span>
            <span>{{ mode === 'add' ? stat.value : '-' }}</span>
          </div>
        </InfoField>
      </InfoTable>

      <div class="pop-title-lv2"><h3>2) 인구 사회학적 특성</h3></div>
      <InfoTable :columns="2" popup size="148">
        <InfoField v-for="stat in demographicStats" :key="stat.label" :label="stat.label">
          <div class="lp-field-split">
            <span>{{ mode === 'add' ? stat.grade : '-' }}</span>
            <span>{{ mode === 'add' ? stat.value : '-' }}</span>
          </div>
        </InfoField>
      </InfoTable>
    <template v-if="mode !== 'add'">
      <div class="pop-title-sub"><h2>일반현황</h2></div>
      <InfoTable :columns="2" popup size="120">
        <InfoField for="new-diagnosis-reason" label="진단사유">
          <SelectField
            id="new-diagnosis-reason"
            v-model="form.reason"
            :options="diagnosisReasonOptions"
            size="sm"
            trigger-class="w-full"
            class="!space-y-0 flex-1"
            placeholder="선택"
          />
        </InfoField>
        <InfoField for="new-diagnosis-biz-name" label="상호명">
            <InputField2 id="new-diagnosis-biz-name" v-model="form.bizName" size="sm" class="!space-y-0 flex-1" />
        </InfoField>

        <InfoField for="new-diagnosis-owner" label="가옥주">
            <InputField2 id="new-diagnosis-owner" v-model="form.houseOwner" size="sm" class="!space-y-0 flex-1" />
        </InfoField>
        <InfoField for="new-diagnosis-applicant" label="신청자">
            <InputField2 id="new-diagnosis-applicant" v-model="form.applicant" size="sm" class="!space-y-0 flex-1" />
        </InfoField>

        <InfoField for="new-diagnosis-contact" label="연락처">
            <InputField2 id="new-diagnosis-contact" v-model="form.contact" size="sm" class="!space-y-0 flex-1" />
        </InfoField>
        <InfoField label="거주 가구수">
            <Stepper v-model="form.householdCount" :min="0" label="거주 가구수" />
        </InfoField>

        <InfoField label="층수">
            <Stepper v-model="form.floorCount" :min="0" label="층수" />
        </InfoField>
        <InfoField label="입주년도">
            <Stepper v-model="form.moveInYear" :min="0" label="입주년도" />
        </InfoField>

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

        <InfoField label="피해 횟수">
            <Stepper v-model="form.damageCount" :min="0" label="피해 횟수" />
        </InfoField>
        <InfoField>
            <template #label><span class="sr-only">추가 정보</span></template>
            <span class="sr-only">입력 항목 없음</span>
        </InfoField>
      </InfoTable>
    </template>

    <div class="pop-title-sub"><h2>범죄예방진단 항목 및 진단결과</h2></div>
      <div class="pop-title-lv2"><h3>1) 건물특성</h3></div>
      <InfoTable :columns="1" popup size="220">
          <InfoField v-for="row in buildingAssessmentRows" :key="row.key" :label="row.label" full>
            <RadioGroup v-if="row.type === 'radio'" :model-value="assessment[row.key]" :class="infoTableStyles['info-table-radio']" @update:model-value="(v: unknown) => (assessment[row.key] = Number(v))">
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
      <InfoTable :columns="1" popup size="300">
        <InfoField v-for="row in extraAssessmentRows" :key="row.key" :label="row.label" full>
          <Stepper v-model="assessment[row.key]" :min="0" :class="styles.detailStepper" :label="row.label" />
          <span :class="styles.assessmentUnit">{{ row.unit }}</span>
        </InfoField>
      </InfoTable>

      <div class="pop-title-lv2"><h3>3) 기타</h3></div>
      <InfoTable :columns="1" popup size="300">
        <InfoField for="new-diagnosis-etc-label" full :class="styles.etcLabelField">
          <template #label>
            <Input
              id="new-diagnosis-etc-label"
              v-model="form.etcLabel"
              size="sm"
              aria-label="기타 항목"
            />
          </template>
          <Stepper v-model="form.etcCount" :min="0" :class="styles.detailStepper" label="기타 수량" />
        </InfoField>
      </InfoTable>

      <div class="lp-score-row">
        <span class="lp-score-label">총점</span>
        <strong class="lp-score-value">{{ totalScore }}</strong>
        <span class="lp-score-unit">점</span>
      </div>
    <div class="pop-title-sub"><h2>시설개선(예정) 일정</h2></div>
      <InfoTable :columns="1" popup size="160">
        <InfoField for="new-diagnosis-improvement-date" label="시설개선(예정) 일자" full>
            <DatePicker
              id="new-diagnosis-improvement-date"
              v-model="form.improvementDate"
              size="sm"
              :class="styles.detailImprovementDate"
              input-class="w-full"
              placeholder="YYYY.MM.DD"
            />
            <SelectField
              v-model="form.improvementStatus"
              :options="improvementOptions"
              size="sm"
              trigger-class="w-full"
              :class="styles.detailStepper"
              placeholder="선택"
              aria-label="시설개선 상태"
            />
        </InfoField>
      </InfoTable>
    <!--
      시안(11167:128695)의 '착안사항' 프레임은 제목 + text_area + checkbox 를 함께 담는다.
      상세(0107)·CPO확인용(0105)과 같은 마크업(.detailNoteMeta)으로 맞춘다.
    -->
    <div class="pop-title-sub mb-2"><h2>착안사항</h2></div>
      <TextareaField v-model="form.note" class="w-full" textarea-class="w-full" :height="72" aria-label="착안사항" />
      <div :class="styles.detailNoteMeta">
        <Checkbox v-model="form.emailNotify" label="범죄예방진단 결과 우편 통보" />
        <!-- 진단 추가(PM-PUB-0106)는 시안대로 같은 줄 오른쪽에 담당 진단자를 표기한다(상세 0107 과 같은 마크업) -->
        <p v-if="mode === 'add'"><span>범죄예방진단자 :</span> {{ diagnoser }}</p>
      </div>

    <template #footer>
      <Button v-if="showPrint" type="button" :class="styles.detailPrintButton" variant="tertiary2" size="md" @click="emit('print')">인쇄</Button>
      <Button type="button" variant="tertiary2" size="md" @click="onCancel">취소</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">{{ saveText }}</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import Input from '@/components/custom/input/Input.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import Stepper from '@/components/custom/input/Stepper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { useDialog } from '@/composable/dialog/dialog'
import {
  typeOptions,
  diagnosisReasonOptions,
  districtOptions,
  cashIntensiveOptions,
  crimePreventionStatusOptions,
  previousCrimeDamageOptions,
  improvementStatusOptions,
  improvementDoneOptions,
  buildingAssessmentRows,
  extraAssessmentRows,
  crimeStats,
  demographicStats,
  type NewDiagnosisForm,
} from '../composable/PM-PUB-0103'
import styles from '../style/PM-PUB-0103.module.css'
/** RadioGroup 정렬(.info-table-radio) 같은 InfoTable 관련 공통 클래스는 공용 파일에서 그대로 가져온다 */
import infoTableStyles from '@/components/custom/info-table/InfoTable.module.css'

interface Props {
  form: NewDiagnosisForm
  assessment: Record<string, number>
  totalScore: number
  title?: string
  saveText?: string
  showPrint?: boolean
  /**
   * 'new'  = 신규 등록(PM-PUB-0114) — 대상 정보를 처음부터 입력한다.
   * 'add'  = 진단 추가(PM-PUB-0106) — 이미 등록된 대상에 회차를 더한다.
   *          대상 정보(부서·관리번호·유형·주소·관할)는 읽기 전용이고 관리번호/관리자/직원수/
   *          업소층수처럼 이 화면에만 있는 항목이 추가된다.
   */
  mode?: 'new' | 'add'
  /** mode='add' 에서 하단에 표기할 담당 진단자 */
  diagnoser?: string
  /** 팝업 가로 폭(px). 화면마다 시안 폭이 달라 호출부에서 정한다 */
  size?: number
}

const {
  form,
  title = '범죄예방진단 신규',
  saveText = '저장',
  showPrint = false,
  mode = 'new',
  diagnoser = '',
  size = 800,
} = defineProps<Props>()

const open = defineModel<boolean>('open', { default: false })
const dialog = useDialog()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'cancel'): void
  (e: 'print'): void
  (e: 'open-simple-notice'): void
  (e: 'open-photo'): void
  (e: 'open-history'): void
}>()

/** 검색조건의 '전체' 옵션은 신규 등록 폼에는 맞지 않는다 */
const typeSelectOptions = typeOptions.filter((o) => o.value !== 'all')

/* 진단 추가(mode='add')에서 읽기 전용으로 보여줄 값들 — 코드가 아니라 사람이 읽는 라벨로 바꾼다 */
const typeText = computed(() => typeOptions.find((o) => o.value === form.type)?.label ?? '-')
const districtText = computed(() => districtOptions.find((o) => o.value === form.district)?.label ?? '-')
/* 시안처럼 상위 조직까지 붙여 보여준다(목업 — 실제로는 진단 건의 소속 부서 경로가 온다) */
const departmentText = computed(() =>
  form.districtOffice ? `부산청 부산중부서 ${form.districtOffice}` : '-',
)

/** 시설개선 상태 — 진단 추가는 기획서상 완료/미완료 두 가지만 쓴다 */
const improvementOptions = computed(() =>
  mode === 'add' ? improvementDoneOptions : improvementStatusOptions,
)
const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'

/**
 * 주소검색은 별도 화면(PC-COM-0401 주소검색 › 도로명 찾기) 팝업으로 여는 자리다.
 * 아직 그 화면이 없어서, 눌러도 아무 일이 없으면 고장난 것처럼 보이므로 안내만 띄운다.
 * TODO: PC-COM-0401 이 만들어지면 이 알림 대신 그 팝업을 열고 선택값을 form.address 에 넣는다.
 */
async function onSearchAddress() {
  await dialog.alert({ title: '주소검색 기능은 준비 중입니다.' })
}

function onOpenSimpleNoticeData() {
  emit('open-simple-notice')
}

function onOpenPhotoData() {
  emit('open-photo')
}

function onOpenHistory() {
  emit('open-history')
}

function onCancel() {
  emit('cancel')
}

function onSave() {
  emit('save')
}
</script>
