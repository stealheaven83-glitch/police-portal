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

  <!-- 부서줄은 공통 SearchWrapper 의 #department 슬롯(검색 폼 없이 부서줄만 — 아래 여백 20 은 컴포넌트가 준다) -->
  <SearchWrapper>
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </template>
  </SearchWrapper>

  <div class="list-actions lp-date-actions">
    <!-- 근무일 줄은 근무일지(PC-LPO-0202)와 같은 형태: .calendar-area + .lp-daynav(테두리 없는 날짜 + 앞뒤 화살표) + 세로선 -->
    <div class="calendar-area">
      <span class="lp-label-text">근무일</span>
      <div class="calendar-area-date lp-daynav">
        <Button variant="icon" aria-label="이전 근무일" @click="shiftWorkDate(-1)">
          <Icon name="arrowDropDown" :size="20" class="lp-icon-prev" />
        </Button>
        <DatePicker
          v-model="workDate"
          label="근무일 선택"
          label-class="sr-only"
          size="sm"
          format="yyyy.MM.dd."
          value-format="yyyy.MM.dd."
          input-class="lp-date-borderless lp-heading-lg w-40"
        />
        <Button variant="icon" aria-label="다음 근무일" @click="shiftWorkDate(1)">
          <Icon name="arrowDropDown" :size="20" class="lp-icon-next" />
        </Button>
      </div>
      <span class="calendar-area-divider" aria-hidden="true" />
      <span class="lp-heading-md">{{ weekdayLabel }}</span>
      <span class="calendar-area-divider" aria-hidden="true" />
      <RadioGroup v-model="shift" class="calendar-area-options" aria-label="교대">
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
              <span v-if="step.rejected">반려</span>
              <span v-else-if="step.reportedAt">{{ step.reportedAt }}</span>

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
          <!-- 미점검 → 차량 일일점검 팝업(PC-LPO-0303). 저장하면 '점검 완료' 로 바뀐다 -->
          <Button v-else type="button" variant="tertiary" size="xs" padding="12" @click="onInspectCar(item)">
            미점검
          </Button>
        </template>
      </TableWrapper>
    </section>
  </ScrollWrapper>

  <!-- 인수인계 회수 팝업(PC-LPO-0302) — 결재 칸의 '인수인계 취소' 버튼이 연다 -->
  <HandoverCancelDialog v-model:open="cancelDialogOpen" :work-date="workDate" @save="onCancelSaved" />
  <!-- 차량 일일점검 팝업(PC-LPO-0303) — 순찰차 표의 '미점검' 버튼이 연다 -->
  <VehicleInspectionDialog v-model:open="inspectDialogOpen" @save="onInspectSaved" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import ScrollWrapper from '@/components/custom/ScrollWrapper.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
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
import HandoverCancelDialog from './components/HandoverCancelDialog.vue'
import VehicleInspectionDialog from './components/VehicleInspectionDialog.vue'
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

/** '인수인계 취소' → 회수 팝업(PC-LPO-0302, 정의서 2-4). 어느 결재 칸에서 열렸는지 기억해 두었다가 저장 때 되돌린다 */
const cancelDialogOpen = ref(false)
const cancelTarget = ref<{ line: ApprovalLine; step: ApprovalStep } | null>(null)

function onCancelHandover(line: ApprovalLine, step: ApprovalStep) {
  cancelTarget.value = { line, step }
  cancelDialogOpen.value = true
}

/** 팝업에서 저장 — 그 칸의 보고일을 지우고 버튼을 걷어 인수인계 전 상태로 되돌린다. 회수사유 저장은 개발팀 몫 */
function onCancelSaved(_reason: string) {
  const target = cancelTarget.value
  if (!target) return
  updateStep(target.line, target.step.role, { reportedAt: '', rejected: false, action: 'none' })
  cancelTarget.value = null
}

/**
 * 사용자 지정(화면 정의서 "검토, 반려 버튼 표시" 2): 반려 → Confirm 「인수인계를 반려하시겠습니까?」
 *  - 취소: 컨펌만 닫고 화면 변동 없음
 *  - 확인: 닫고 그 칸을 인수인계 반려 상태로 바꾼다(실제 새로고침·저장은 개발팀 몫)
 * CLAUDE.md §4 기본(알림창)과 다르지만 정의서대로 완료 알림은 띄우지 않는다.
 */
async function onReject(line: ApprovalLine, step: ApprovalStep) {
  const { confirmed } = await dialog.confirm({
    title: '인수인계를 반려하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!confirmed) return
  updateStep(line, step.role, { reportedAt: '', rejected: true, action: 'none' })
}

/**
 * 사용자 지정(화면 정의서 1): 검토 → Confirm 「인수인계 검토를 완료하시겠습니까?」
 *  - 취소: 컨펌만 닫고 화면 변동 없음
 *  - 확인: 닫고 검토 완료 상태(보고일 찍힘, 버튼 사라짐)로 바꾼다. 점검관의 '승인' 도 같은 흐름
 */
async function onApprove(line: ApprovalLine, step: ApprovalStep) {
  const label = step.decideLabel ?? '결재'
  const { confirmed } = await dialog.confirm({
    title: label === '검토' ? '인수인계 검토를 완료하시겠습니까?' : `인수인계 ${label}을 완료하시겠습니까?`,
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!confirmed) return
  updateStep(line, step.role, { reportedAt: today(), rejected: false, action: 'none' })
}

/** 배열 상태는 제자리 수정하지 않고 재할당한다(CLAUDE.md §5) */
function updateStep(line: ApprovalLine, role: ApprovalStep['role'], patch: Partial<ApprovalStep>) {
  approvalLines.value = approvalLines.value.map((item) =>
    item.id !== line.id
      ? item
      : { ...item, steps: item.steps.map((step) => (step.role === role ? { ...step, ...patch } : step)) },
  )
}

/** '미점검' → 차량 일일점검 팝업. 어느 차량인지 기억해 두었다가 저장 때 점검 완료로 바꾼다 */
const inspectDialogOpen = ref(false)
const inspectTarget = ref<PatrolCarRow | null>(null)

function onInspectCar(row: PatrolCarRow) {
  inspectTarget.value = row
  inspectDialogOpen.value = true
}

/** 팝업 저장 — 점검 결과 저장은 개발팀 몫, 화면은 그 차량을 '점검 완료' 로만 바꾼다 */
function onInspectSaved() {
  const target = inspectTarget.value
  if (!target) return
  patrolCarRows.value = patrolCarRows.value.map((item) => (item.no === target.no ? { ...item, checked: true } : item))
  inspectTarget.value = null
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
