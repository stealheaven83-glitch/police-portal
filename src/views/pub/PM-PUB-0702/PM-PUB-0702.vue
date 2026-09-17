<template>
  <PageHeader>
    <template #left>
      <PageTitle title="기타 영상기기 사용 보고서" />
    </template>
    <template #right>
      <div class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </div>
    </template>
  </PageHeader>

  <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </template>
    <template #form>
      <div class="search-area">
        <DateRangePicker
          v-model:from="writtenFrom"
          v-model:to="writtenTo"
          label="작성일"
          from-label="작성일 시작일"
          to-label="작성일 종료일"
          size="sm"
          input-class="w-40"
        />
        <InputField2 v-model="searchUser" label="사용자" size="sm" input-class="w-30" />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <LayoutSplit :count="2" :widths="[48, 52]" :min-widths="[32, 40]">
    <template #layout-1>
      <LayoutPanel title="기타 영상기기 사용 보고서 목록">
        <template #actions>
          <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSelected">선택삭제</Button>
        </template>

        <TabulatorGrid
          ref="gridRef"
          :columns="listColumns"
          :data="rows"
          class="flex-1"
          height="100%"
          layout="fitDataFill"
          select-mode="checkbox"
          :row-class="rowClass"
          placeholder="조회된 보고서가 없습니다"
          show-pagination
          :items-per-page="10"
          @row-click="onListRowClick"
          @row-selection-changed="onSelectionChanged"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="기타 영상기기 사용 보고서">
        <template #actions>
          <Button type="button" variant="secondary" size="sm" @click="createReport">신규</Button>
          <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
        </template>

        <section class="lp-section" aria-labelledby="video-approval-heading">
          <div class="lp-row-between lp-row-bottom lp-section-title">
            <h3 id="video-approval-heading" class="lp-heading-md">결재선</h3>
            <Button type="button" variant="secondary" size="xs" @click="onSaveApprovalLine">결재선 저장</Button>
          </div>

          <TableWrapper
            v-for="(line, lineIndex) in approvalLines"
            :key="lineIndex"
            class="lp-approval-table"
            :class="{ 'lp-table-gap': lineIndex > 0 }"
            :columns="approvalColumns"
            :items="approvalItems"
            :selectable="false"
            :show-pagination="false"
            caption="결재선 — 기안자와 차수별 결재자"
          >
            <template v-for="step in line" :key="step.role" #[`cell-${step.role}`]>
              <div class="lp-approval-cell">
                <div class="lp-approval-person">
                  <SelectField
                    v-if="step.selectable"
                    v-model="nextApprover"
                    :label="step.role"
                    label-class="sr-only"
                    :options="approverOptions"
                    size="sm"
                    trigger-class="w-full"
                    class="!space-y-0 lp-approval-pick"
                    placeholder="선택"
                  />
                  <span v-else>{{ step.person }}</span>
                </div>

                <div class="lp-approval-status">
                  <template v-if="step.action === 'none'">
                    <span :class="statusClass(step.status)">{{ step.status }}</span>
                  </template>
                  <template v-else-if="step.action === 'withdraw'">
                    <span :class="statusClass(step.status)">{{ step.status }}</span>
                    <Button type="button" variant="tertiary" size="xs" padding="8" @click="onWithdraw(lineIndex, step)">
                      결재회수
                    </Button>
                  </template>
                  <template v-else>
                    <span class="lp-approval-decide">
                      <Button type="button" variant="tertiary2" size="xs" padding="8" class="flex-1" @click="onReject(lineIndex, step)">
                        반려
                      </Button>
                      <Button type="button" variant="tertiary" size="xs" padding="8" class="flex-1" @click="onApprove(lineIndex, step)">
                        결재
                      </Button>
                    </span>
                  </template>
                </div>
              </div>
            </template>
          </TableWrapper>
        </section>

        <section class="lp-section" aria-labelledby="video-user-heading">
          <div class="lp-row-between lp-section-title">
            <h3 id="video-user-heading" class="lp-heading-md">사용자 정보</h3>
            <p class="form-note lp-note-dark">＊ 사용자는 1명으로 제한합니다.</p>
          </div>

          <TableWrapper
            :columns="userColumns"
            :items="reportUsers"
            :selectable="false"
            :show-pagination="false"
            caption="보고서를 작성한 사용자"
          >
            <template #cell-manage>
              <Button type="button" variant="tertiary" size="xs" padding="10" @click="onEditUser">수정</Button>
            </template>
          </TableWrapper>
        </section>

        <section class="lp-section" aria-labelledby="video-device-heading">
          <h3 id="video-device-heading" class="lp-heading-md lp-section-title">촬영 장비</h3>
          <div class="lp-form-box lp-form-box-wide">
            <RadioGroup v-model="detail.device" class="lp-choice-row" aria-label="촬영 장비">
              <RadioGroupItem value="work" label="업무용 휴대폰 (PDA, 폴리폰)" />
              <RadioGroupItem value="personal" label="개인 휴대폰" />
            </RadioGroup>
            <div class="lp-choice-input">
              <RadioGroup v-model="detail.device" aria-label="촬영 장비 기타">
                <RadioGroupItem value="etc" label="기타" />
              </RadioGroup>
              <InputField2
                v-model="detail.deviceEtc"
                size="sm"
                aria-label="촬영 장비 기타 입력"
                :disabled="detail.device !== 'etc'"
                class="!space-y-0"
                input-class="w-85"
              />
            </div>
            <TextareaField
              v-model="detail.deviceReason"
              label="사용 사유"
              label-class="lp-text-dark"
              class="w-full !space-y-0"
              textarea-class="w-full"
              :height="80"
              placeholder="예) 바디캠을 등록한 사용자가 아니며(또는 등록前이며), 범죄 진압 및 수사를 위해 증거보전이 필요하다고 판단하여 촬영함"
            />
          </div>
        </section>

        <section class="lp-section" aria-labelledby="video-notice-heading">
          <h3 id="video-notice-heading" class="lp-heading-md lp-section-title">고지 여부</h3>
          <div class="lp-form-box lp-form-box-wide">
            <div class="lp-choice-row">
              <RadioGroup v-model="detail.notice" aria-label="고지 여부">
                <RadioGroupItem value="notified" label="촬영여부 등 표시 (고지)" />
              </RadioGroup>
              <span class="lp-choice-input">
                <RadioGroup v-model="detail.notice" aria-label="미고지 사유">
                  <RadioGroupItem value="not-notified" label="미표시 (미고지) - 사유" />
                </RadioGroup>
                <InputField2
                  v-model="detail.noticeReason"
                  size="sm"
                  aria-label="미고지 사유 입력"
                  :disabled="detail.notice !== 'not-notified'"
                  class="!space-y-0"
                  input-class="w-85"
                />
              </span>
            </div>
          </div>
        </section>

        <section class="lp-section" aria-labelledby="video-outline-heading">
          <h3 id="video-outline-heading" class="lp-heading-md lp-section-title">촬영 개요</h3>

          <div class="lp-subsection">
            <h4 class="lp-heading-sm lp-section-title">1. 촬영 경위</h4>
            <div class="lp-form-box lp-form-box-wide">
              <div class="lp-choice-row">
                <RadioGroup v-model="detail.origin" class="lp-choice-row" aria-label="촬영 경위">
                  <RadioGroupItem value="report112" label="112신고" />
                  <RadioGroupItem value="patrol" label="순찰 중 자체 인지" />
                </RadioGroup>
                <span class="lp-choice-input">
                  <RadioGroup v-model="detail.origin" aria-label="촬영 경위 기타">
                    <RadioGroupItem value="etc" label="기타" />
                  </RadioGroup>
                  <InputField2
                    v-model="detail.originEtc"
                    size="sm"
                    aria-label="촬영 경위 기타 입력"
                    :disabled="detail.origin !== 'etc'"
                    class="!space-y-0"
                    input-class="w-85"
                  />
                </span>
              </div>
            </div>
          </div>

          <div class="lp-subsection">
            <h4 class="lp-heading-sm lp-section-title">2. 촬영 일시</h4>
            <div class="lp-form-box lp-form-box-wide">
              <div class="lp-choice-row">
                <DatePicker
                  v-model="detail.startDate"
                  label="시작일시"
                  size="sm"
                  label-position="left"
                  class="!space-y-0"
                  input-class="w-40"
                />
                <InputField2
                  v-model="detail.startTime"
                  label="시간"
                  size="sm"
                  label-position="left"
                  placeholder="예) 12:00"
                  class="!space-y-0"
                  input-class="w-30"
                />
              </div>
              <div class="lp-choice-row">
                <DatePicker
                  v-model="detail.endDate"
                  label="종료일시"
                  size="sm"
                  label-position="left"
                  class="!space-y-0"
                  input-class="w-40"
                />
                <InputField2
                  v-model="detail.endTime"
                  label="시간"
                  size="sm"
                  label-position="left"
                  placeholder="예) 12:00"
                  class="!space-y-0"
                  input-class="w-30"
                />
              </div>
            </div>
          </div>

          <div class="lp-subsection">
            <h4 class="lp-heading-sm lp-section-title">3. 촬영 장소</h4>
            <div class="lp-form-box lp-form-box-wide">
              <div class="lp-choice-row">
                <span class="lp-paren-group">
                  <Checkbox v-model="detail.indoor" label="실내" />
                  <span class="lp-paren" aria-hidden="true">(</span>
                  <RadioGroup
                    v-model="detail.indoorType"
                    :disabled="!detail.indoor"
                    class="lp-radio-inline"
                    aria-label="실내 세부 장소"
                  >
                    <RadioGroupItem value="home" label="가정내" />
                    <RadioGroupItem value="facility" label="식당 · 백화점 · 역사 · 사무실 등" />
                    <RadioGroupItem value="transport" label="운송수단 내" />
                  </RadioGroup>
                  <span class="lp-paren" aria-hidden="true">)</span>
                </span>
                <Checkbox v-model="detail.outdoor" label="실외" />
              </div>
            </div>
          </div>
        </section>

        <section class="lp-section" aria-labelledby="video-note-heading">
          <h3 id="video-note-heading" class="lp-heading-md lp-section-title">참고사항</h3>
          <TextareaField
            v-model="detail.note"
            aria-label="참고사항"
            class="w-full !space-y-0"
            textarea-class="w-full"
            :height="144"
            :maxlength="NOTE_MAX"
            placeholder="촬영한 영상 등은 '개인영상정보 등록 대장'(양식4)에 등록 등 기재&#10;사건 개요 등은 112신고처리표, 근무일지, 발생보고 참고 등 기재"
          />
          <p class="lp-char-count"><b>{{ detail.note.length }}</b>/{{ NOTE_MAX }}</p>
        </section>
      </LayoutPanel>
    </template>
  </LayoutSplit>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import LayoutSplit from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  useVideoDeviceReport,
  approverOptions,
  type VideoReportRow,
  type ApprovalStep,
} from './composable/PM-PUB-0702'
// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(§5)
defineOptions({ name: 'PmPub0702' })

/*
 * LNB: publicSafetyMenu items[5] = '보고서'.
 * ⚠ 프리셋 children 은 '보고서 목록' 하나뿐인데 시안 LNB 는 '물리력 사용 보고서 /
 *   기타 영상기기 사용 보고서' 두 개다 — 시안 라벨을 그대로 넣어 뒀고
 *   프리셋 배치 등록 시 확인이 필요하다(CLAUDE.md §5 ③).
 */
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 5, activeChild: '기타 영상기기 사용 보고서' })

// '/pub' 은 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '보고서' },
  { label: '기타 영상기기사용보고서' },
]

const {
  department,
  advancedSearchOpen,
  writtenFrom,
  writtenTo,
  searchUser,
  rows,
  activeRowKey,
  approvalLines,
  nextApprover,
  reportUsers,
  detail,
  selectRow,
  createReport,
  validateDetail,
} = useVideoDeviceReport()

const dialog = useDialog()

/** 참고사항 최대 글자수(기획서 22-5) */
const NOTE_MAX = 4000

/* ------------------------------------------------------------------ *
 * 좌측 목록
 * ------------------------------------------------------------------ */
const listColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  { title: '결재', field: 'approval', width: 70, hozAlign: 'center' },
  { title: '결재상태', field: 'approvalStatus', width: 120, hozAlign: 'center' },
  { title: '부서', field: 'dept', width: 220, hozAlign: 'center' },
  { title: '사용자', field: 'user', width: 130, hozAlign: 'center' },
  { title: '대상자', field: 'target', width: 90, hozAlign: 'center' },
  { title: '작성일', field: 'writtenAt', width: 120, hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

/** 지금 우측 보고서에 떠 있는 행만 배경으로 표시한다 */
function rowClass(row: VideoReportRow) {
  return row.rowKey === activeRowKey.value ? 'lp-grid-active-row' : undefined
}

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onListRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as VideoReportRow
  selectRow(data.rowKey)
}

/** @row-selection-changed 는 데이터가 아니라 RowComponent 배열을 넘긴다(CLAUDE.md §6) */
function onSelectionChanged(selected: any[]) {
  selectedCount.value = selected.length
}

async function onDeleteSelected() {
  if (!selectedCount.value) {
    // 사용자 지정: 경고도 toast 가 아니라 알림창으로 낸다 (§7 기본은 toast)
    await dialog.alert({ title: '삭제할 보고서를 선택해 주세요.', btnCancel: '확인' })
    return
  }
  const result = await dialog.confirm({ title: '삭제하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  gridRef.value?.deleteSelected()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

/* ------------------------------------------------------------------ *
 * 결재선 — 역할이 열, 사람/상태가 행인 표라 TabulatorGrid 가 아니라 정적 표다
 * ------------------------------------------------------------------ */
const approvalColumns = computed(() =>
  (approvalLines.value[0] ?? []).map((step) => ({ key: step.role, label: step.role })),
)

/** 본문은 한 줄뿐이고, 그 안에서 사람·상태가 세로로 쌓인다(시안 13724:123521) */
const approvalItems = [{ kind: 'line' }]

/** 결재완료는 초록, 나머지는 기본색(시안) */
function statusClass(status: string) {
  return status === '결재완료' ? 'lp-status-done' : undefined
}

async function onSaveApprovalLine() {
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
}

/* 결재 처리는 서버 몫이라 화면단에서는 상태만 바꿔 보여준다 */
function setStep(lineIndex: number, target: ApprovalStep, status: string, action: ApprovalStep['action']) {
  approvalLines.value = approvalLines.value.map((line, i) =>
    i !== lineIndex ? line : line.map((step) => (step.role === target.role ? { ...step, status, action } : step)),
  )
}
async function onWithdraw(lineIndex: number, step: ApprovalStep) {
  const result = await dialog.confirm({ title: '결재를 회수하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  setStep(lineIndex, step, '결재대기', 'decide')
  await dialog.alert({ title: '회수되었습니다.', btnCancel: '확인' })
}
async function onReject(lineIndex: number, step: ApprovalStep) {
  const result = await dialog.confirm({ title: '반려하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  setStep(lineIndex, step, '반려', 'none')
  await dialog.alert({ title: '반려되었습니다.', btnCancel: '확인' })
}
async function onApprove(lineIndex: number, step: ApprovalStep) {
  const result = await dialog.confirm({ title: '결재하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  setStep(lineIndex, step, '결재완료', 'none')
  await dialog.alert({ title: '결재되었습니다.', btnCancel: '확인' })
}

/* ------------------------------------------------------------------ *
 * 사용자 정보
 * ------------------------------------------------------------------ */
/** 시안(13724:123626) 칸 폭 — 소속은 남는 폭, 계급 100 · 이름 120 · 관리 120 */
const userColumns = [
  { key: 'dept', label: '소속', hozAlign: 'left' },
  { key: 'rank', label: '계급', width: '100px' },
  { key: 'name', label: '이름', width: '120px' },
  { key: 'manage', label: '관리', width: '120px' },
]

/** 사용자 검색 팝업은 시안에 없다 — 개발팀 연동 대상이라 안내만 낸다 */
async function onEditUser() {
  await dialog.alert({ title: '사용자 수정은 연동 후 제공됩니다.', btnCancel: '확인' })
}

async function onSave() {
  const message = validateDetail()
  if (message) {
    await dialog.alert({ title: message, btnCancel: '확인' })
    return
  }
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PM-PUB-0702',
  label: '기타 영상기기사용보고서',
  path: '/views/pub/PM-PUB-0702',
  componentName: 'PmPub0702',
  closable: true,
})
</script>
