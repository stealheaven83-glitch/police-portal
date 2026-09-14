<template>
  <PageHeader>
    <template #left>
      <PageTitle title="인수인계 작성" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div class="dept-area">
    <span class="dept-name">부서</span>
    <DepartmentCascadeSelect v-model="department" size="sm" />
  </div>

  <div class="list-actions lp-date-actions">
    <div class="lp-workday-row">
      <div class="group-gap3">
        <span class="lp-label-text">근무일</span>
        <div class="calendar-area-date">
          <Button variant="icon" aria-label="이전 근무일" @click="shiftWorkDate(-1)">
            <Icon name="arrowLeft" :size="24" />
          </Button>
          <DatePicker
            v-model="workDate"
            label="근무일 선택"
            label-class="sr-only"
            size="sm"
            format="yyyy.MM.dd."
            value-format="yyyy.MM.dd."
            input-class="lp-heading-lg w-40"
          />
          <Button variant="icon" aria-label="다음 근무일" @click="shiftWorkDate(1)">
            <Icon name="arrowRight" :size="24" />
          </Button>
        </div>
      </div>
      <span class="lp-heading-md">{{ weekdayLabel }}</span>
      <RadioGroup v-model="shift" class="calendar-area-options">
        <RadioGroupItem value="day" label="주" />
        <RadioGroupItem value="night" label="야" />
      </RadioGroup>
    </div>

    <Button type="button" variant="tertiary2" size="sm" @click="onPrint">인쇄</Button>
    <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
  </div>

  <ScrollWrapper>
    <!-- ── 인계인수 ─────────────────────────────────────────── -->
    <section class="lp-section" aria-labelledby="handover-approval-heading">
      <div class="lp-row-between lp-row-bottom lp-section-title">
        <h2 id="handover-approval-heading" class="lp-heading-md">인계인수</h2>
        <div class="group-gap3">
          <p class="lp-mark-note lp-mark-note-sm">
            <span aria-hidden="true">＊</span>
            <span>결재선 선택 버튼을 클릭하여 결재자를 선택합니다.</span>
          </p>
          <Button type="button" variant="tertiary2" size="sm" @click="onSelectApprovalLine">결재선 선택</Button>
        </div>
      </div>

      <TableWrapper
        v-for="(line, lineIndex) in approvalLines"
        :key="line.id"
        class="lp-approval-table"
        :class="{ 'lp-table-gap': lineIndex > 0 }"
        :columns="approvalColumns"
        :items="approvalItems"
        :selectable="false"
        :show-pagination="false"
        caption="인계인수 결재선 — 인계관·인수관·확인관·점검관"
      >
        <template #cell-label>
          <div class="lp-approval-cell">
            <span class="lp-approval-person lp-approval-label">직급 / 성명</span>
            <span class="lp-approval-status lp-approval-label">보고일 / 승인일시</span>
          </div>
        </template>

        <template v-for="step in line.steps" :key="step.role" #[`cell-${step.role}`]>
          <div class="lp-approval-cell">
            <span class="lp-approval-person">{{ step.person }}</span>

            <div class="lp-approval-status">
              <span v-if="step.reportedAt">{{ step.reportedAt }}</span>

              <Button
                v-if="step.action === 'cancel'"
                type="button"
                variant="tertiary"
                size="xs"
                padding="12"
                @click="onCancelHandover(line, step)"
              >
                인수인계 취소
              </Button>

              <template v-else-if="step.action === 'decide'">
                <Button type="button" variant="tertiary2" size="xs" padding="12" @click="onReject(line, step)">
                  반려
                </Button>
                <Button type="button" variant="tertiary" size="xs" padding="12" @click="onApprove(line, step)">
                  {{ step.decideLabel }}
                </Button>
              </template>
            </div>
          </div>
        </template>
      </TableWrapper>

      <TextareaField
        v-model="handoverNote"
        class="lp-table-gap"
        label="인수인계사항"
        :height="102"
      />
    </section>

    <!-- ── 주요 장비 현황 ───────────────────────────────────── -->
    <section class="lp-section" aria-labelledby="handover-equipment-heading">
      <h2 id="handover-equipment-heading" class="lp-heading-md lp-section-title">주요 장비 현황</h2>

      <ul class="lp-equip-grid">
        <li v-for="item in equipmentItems" :key="`${item.category}-${item.name}`" class="lp-equip-card">
          <p class="lp-equip-card-head">{{ item.category }}</p>
          <div class="lp-equip-card-body">
            <span class="lp-equip-name">{{ item.name }}</span>
            <span class="lp-equip-count">{{ item.count }}</span>
          </div>
        </li>
      </ul>

      <div class="lp-table-gap">
        <h3 class="lp-heading-sm lp-block-title">1) 주요범죄 발생 및 검거 실적</h3>
        <InfoTable :columns="2" size="200">
          <InfoField v-for="row in crimeStatRows" :key="row.fields[0].key" :label="row.label">
            <span class="lp-unit-row">
              <template v-for="field in row.fields" :key="field.key">
                <InputField2
                  :id="field.key"
                  v-model="stats[field.key]"
                  :label="`${row.label} ${field.unit}`"
                  label-class="sr-only"
                  size="sm"
                  input-class="w-[11rem]"
                />
                <span class="lp-unit-text">{{ field.unit }}</span>
              </template>
            </span>
          </InfoField>
        </InfoTable>
      </div>

      <div class="lp-table-gap">
        <h3 class="lp-heading-sm lp-block-title">2) 기소중지 검거 및 경범처리</h3>
        <InfoTable :columns="2" size="200">
          <InfoField v-for="row in minorCaseRows" :key="row.fields[0].key" :label="row.label">
            <span class="lp-unit-row">
              <template v-for="field in row.fields" :key="field.key">
                <InputField2
                  :id="field.key"
                  v-model="stats[field.key]"
                  :label="`${row.label} ${field.unit}`"
                  label-class="sr-only"
                  size="sm"
                  input-class="w-[11rem]"
                />
                <span class="lp-unit-text">{{ field.unit }}</span>
              </template>
            </span>
          </InfoField>
        </InfoTable>
      </div>

      <div class="lp-table-gap">
        <h3 class="lp-heading-sm lp-block-title">3) 112 신고건수</h3>
        <InfoTable :columns="2" size="200">
          <InfoField v-for="row in reportRows" :key="row.fields[0].key" :label="row.label">
            <span class="lp-unit-row">
              <InputField2
                :id="row.fields[0].key"
                v-model="stats[row.fields[0].key]"
                :label="`${row.label} ${row.fields[0].unit}`"
                label-class="sr-only"
                size="sm"
                input-class="w-[11rem]"
              />
              <span class="lp-unit-text">{{ row.fields[0].unit }}</span>
            </span>
          </InfoField>
        </InfoTable>

        <InfoTable class="lp-table-gap" :columns="3" size="200">
          <InfoField v-for="row in reportDetailRows" :key="row.fields[0].key" :label="row.label">
            <span class="lp-unit-row">
              <InputField2
                :id="row.fields[0].key"
                v-model="stats[row.fields[0].key]"
                :label="`${row.label} ${row.fields[0].unit}`"
                label-class="sr-only"
                size="sm"
                input-class="w-[11rem]"
              />
              <span class="lp-unit-text">{{ row.fields[0].unit }}</span>
            </span>
          </InfoField>
        </InfoTable>
      </div>
    </section>

    <!-- ── 주요취급사항 ─────────────────────────────────────── -->
    <section class="lp-section" aria-labelledby="handover-handling-heading">
      <h2 id="handover-handling-heading" class="lp-heading-md lp-section-title">주요취급사항</h2>

      <TableWrapper
        :columns="handlingColumns"
        :items="handlingRows"
        :selectable="false"
        :show-pagination="false"
        caption="주요취급사항"
        empty-title="주요취급사항이 없습니다"
        empty-description="등록된 주요취급사항이 없습니다."
      />
    </section>

    <!-- ── 순찰차 현황 ──────────────────────────────────────── -->
    <section class="lp-section" aria-labelledby="handover-patrol-heading">
      <h2 id="handover-patrol-heading" class="lp-heading-md lp-section-title">순찰차 현황</h2>

      <TableWrapper
        :columns="patrolCarColumns"
        :items="patrolCarRows"
        :selectable="false"
        :show-pagination="false"
        caption="순찰차 현황"
        empty-title="순찰차가 없습니다"
        empty-description="등록된 순찰차가 없습니다."
      >
        <template #cell-checked="{ item }">
          <Button
            v-if="item.checked"
            type="button"
            variant="tertiary2"
            size="xs"
            padding="12"
            @click="onToggleCarCheck(item)"
          >
            <Icon name="check" :size="16" />
            점검 완료
          </Button>
          <Button v-else type="button" variant="tertiary" size="xs" padding="12" @click="onToggleCarCheck(item)">
            미점검
          </Button>
        </template>
      </TableWrapper>
    </section>
  </ScrollWrapper>
</template>

<script setup lang="ts">
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import ScrollWrapper from '@/components/custom/ScrollWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import InfoTable from '@/components/custom/info-table/InfoTable.vue'
import InfoField from '@/components/custom/info-table/InfoField.vue'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Button } from '@/components/custom/button'
import { Icon } from '@/components/custom/icon'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  useHandoverWrite,
  approvalColumns,
  crimeStatRows,
  minorCaseRows,
  reportRows,
  reportDetailRows,
  type ApprovalLine,
  type ApprovalStep,
  type PatrolCarRow,
} from './composable/PC-LPO-0301'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

defineOptions({
  name: 'PcLpo0301',
})

// LNB: 인수인계 > 인수인계 작성
useSideMenuSetup({ ...localPoliceMenu, openIndex: 2, activeChild: '인수인계 작성' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '인수인계' },
  { label: '인수인계 작성' },
]

const {
  department,
  workDate,
  weekdayLabel,
  shift,
  shiftWorkDate,
  approvalLines,
  handoverNote,
  equipmentItems,
  stats,
  handlingRows,
  patrolCarRows,
} = useHandoverWrite()

/** 결재 표 본문은 한 줄뿐이고, 그 안에서 사람·보고일이 세로로 쌓인다(PM-PUB-0702 와 같은 구조) */
const approvalItems = [{ kind: 'line' }]

const handlingColumns = [
  { key: 'no', label: '번호', width: '60px' },
  { key: 'category', label: '구분', width: '240px' },
  { key: 'content', label: '내용', cellClass: 'lp-cell-note' },
  { key: 'writtenAt', label: '작성일시', width: '200px' },
]

const patrolCarColumns = [
  { key: 'no', label: '번호', width: '60px' },
  { key: 'dept', label: '부서명', width: '240px' },
  { key: 'manageName', label: '관리명' },
  { key: 'carNo', label: '차량번호' },
  { key: 'carName', label: '차량명' },
  { key: 'maker', label: '제조사' },
  { key: 'modelYear', label: '연식' },
  { key: 'checked', label: '점검여부' },
]

async function onSave() {
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
}

async function onPrint() {
  await dialog.alert({ title: '인쇄를 시작합니다.', btnCancel: '확인' })
}

/** 결재선 선택 팝업은 Figma 에 없어 비워 둔다 — 개발 인계 대상 */
function onSelectApprovalLine() {}

/** 인수인계 취소는 되돌릴 수 없어 컨펌창을 붙인다(CLAUDE.md §4) */
async function onCancelHandover(line: ApprovalLine, step: ApprovalStep) {
  const result = await dialog.confirm({
    title: '인수인계를 취소하시겠습니까?',
    description: '취소하면 결재선의 이후 단계가 모두 되돌아갑니다.',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return
  updateStep(line, step.role, { reportedAt: '', action: 'none' })
}

async function onReject(line: ApprovalLine, step: ApprovalStep) {
  updateStep(line, step.role, { action: 'none' })
  await dialog.alert({ title: '반려되었습니다.', btnCancel: '확인' })
}

async function onApprove(line: ApprovalLine, step: ApprovalStep) {
  updateStep(line, step.role, { reportedAt: today(), action: 'none' })
  await dialog.alert({ title: `${step.decideLabel} 처리되었습니다.`, btnCancel: '확인' })
}

/** 배열 상태는 제자리 수정하지 않고 재할당한다(CLAUDE.md §5) */
function updateStep(line: ApprovalLine, role: ApprovalStep['role'], patch: Partial<ApprovalStep>) {
  approvalLines.value = approvalLines.value.map((item) =>
    item.id !== line.id
      ? item
      : { ...item, steps: item.steps.map((step) => (step.role === role ? { ...step, ...patch } : step)) },
  )
}

function onToggleCarCheck(row: PatrolCarRow) {
  patrolCarRows.value = patrolCarRows.value.map((item) =>
    item.no === row.no ? { ...item, checked: !item.checked } : item,
  )
}

function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

useBottomTabSetup({
  value: 'PC-LPO-0301',
  label: '인수인계작성',
  path: '/views/lpo/PC-LPO-0301',
  componentName: 'PcLpo0301',
  closable: true,
})
</script>
