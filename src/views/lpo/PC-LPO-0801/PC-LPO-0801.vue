<template>
  <PageHeader>
    <template #left>
      <PageTitle title="인사관리" />
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
        <SelectField
          v-model="searchStatus"
          label="직급"
          :options="statusOptions"
          size="sm"
          trigger-class="w-30"
        />
        <InputField2 v-model="searchEquipmentName" label="이름" size="sm" input-class="w-50" />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <PrivacyNoticeBar>
    <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
  </PrivacyNoticeBar>

  <LayoutSplit :count="2" :widths="[50, 50]" :min-widths="[35, 30]">
    <template #layout-1>
      <LayoutPanel title="인사 현황">
        <TabulatorGrid
          v-model:data="listRows"
          :columns="listColumns"
          class="flex-1"
          height="100%"
          :row-class="(row: any) => (row.rowKey === activeRowKey ? 'lp-grid-active-row' : undefined)"
          placeholder="조회된 인사 정보가 없습니다"
          @row-click="onListRowClick"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="인사 상세">
        <div class="detail-layout">
          <div class="photo-box">
            <div class="photo-frame">
              <!-- 사진이 없으면 시안의 기본 프로필 이미지를 원본 크기로 가운데 둔다 -->
              <img
                :src="detail.photoUrl ?? defaultPhoto"
                :class="detail.photoUrl ? undefined : 'photo-empty'"
                :alt="detail.photoUrl ? '등록된 증명사진' : '등록된 증명사진 없음'"
              >
            </div>
            <Button type="button" variant="tertiary" size="xs" @click="openPhotoPicker">사진 등록</Button>
            <input ref="fileInputRef" type="file" accept="image/*" hidden @change="onPhotoChange">
          </div>

          <div class="detail-fields">
            <InfoTable :columns="2" size="100">
              <InfoField label="성명">
                <span>홍길동</span>
              </InfoField>
              <InfoField label="성별">
                <RadioGroup v-model="detail.gender" :class="infoStyles['info-table-radio']">
                  <RadioGroupItem value="male" label="남" />
                  <RadioGroupItem value="female" label="여" />
                </RadioGroup>
              </InfoField>

              <InfoField label="동명여부">
                <RadioGroup v-model="detail.duplicateName" :class="infoStyles['info-table-radio']">
                  <RadioGroupItem value="none" label="없음" />
                  <RadioGroupItem value="exists" label="있음" />
                </RadioGroup>
              </InfoField>
              <InfoField label="동명구분" for="personnel-duplicate-type">
                <SelectField
                  id="personnel-duplicate-type"
                  v-model="detail.duplicateType"
                  :options="duplicateTypeOptions"
                  size="sm"
                  trigger-class="w-full"
                  class="!space-y-0 flex-1"
                  placeholder="선택"
                  :disabled="detail.duplicateName === 'none'"
                />
              </InfoField>
            </InfoTable>

            <!-- 나머지는 전체폭 1단. 시안 라벨 148px / 값 384px -->
            <InfoTable :columns="1" size="148" class="form-rest">
              <InfoField label="경찰관 배명 일자" for="personnel-officer-assigned">
                <DatePicker id="personnel-officer-assigned" v-model="detail.officerAssignedDate" size="sm" class="flex-1" input-class="w-full" />
              </InfoField>
              <InfoField label="현계급 배명 일자" for="personnel-rank-assigned">
                <DatePicker id="personnel-rank-assigned" v-model="detail.currentRankAssignedDate" size="sm" class="flex-1" input-class="w-full" />
              </InfoField>
              <InfoField label="현부서 전입 일자" for="personnel-dept-transfer">
                <DatePicker id="personnel-dept-transfer" v-model="detail.currentDeptTransferDate" size="sm" class="flex-1" input-class="w-full" />
              </InfoField>

              <!-- 시안은 라디오 6개 + 체크박스 2개가 폭에 맞춰 3줄로 흐른다 -->
              <InfoField label="근무구분"> 
                <RadioGroup v-model="detail.position" :class="infoStyles['info-table-radio']" class="flex-wrap">
                  <RadioGroupItem
                    v-for="opt in positionOptions"
                    :key="opt.value"
                    :value="opt.value"
                    :label="opt.label"
                  />
                </RadioGroup>
                <Checkbox v-model="detail.actingChief" label="관서장대리" />
                <Checkbox v-model="detail.actingTeamLead" label="팀장대리" />
              </InfoField>

              <!-- 시안: 셀렉트 120px + 직접입력 228px -->
              <InfoField label="소속팀" for="personnel-team">
                <SelectField
                  id="personnel-team"
                  v-model="detail.team"
                  :options="teamOptions"
                  size="sm"
                  trigger-class="w-full"
                  class="!space-y-0 w-30"
                  placeholder="선택"
                />
                <InputField2
                  v-model="detail.teamNote"
                  size="sm"
                  input-class="w-57"
                  class="!space-y-0"
                  label="소속팀 직접입력"
                  label-class="sr-only"
                  :disabled="detail.team !== 'etc'"
                />
              </InfoField>

              <!-- 시안: 라디오 4개가 세로로, 고른 항목의 입력만 살아난다 -->
              <InfoField label="기타근무" layout="column">
                <RadioGroup v-model="detail.etcWork" :class="infoStyles['info-table-radio']">
                  <RadioGroupItem value="center" label="치안센터 전담근무자" />
                </RadioGroup>
                <span class="group-gap2">
                  <RadioGroup v-model="detail.etcWork" :class="infoStyles['info-table-radio']">
                    <RadioGroupItem value="partTime" label="시간선택근무" />
                  </RadioGroup>
                  <DatePicker
                    v-model="detail.partTimeDate"
                    size="sm"
                    class="w-37"
                    input-class="w-full"
                    label="시간선택근무 일자"
                    label-class="sr-only"
                    :disabled="detail.etcWork !== 'partTime'"
                  />
                </span>
                <span class="group-gap2">
                  <RadioGroup v-model="detail.etcWork" :class="infoStyles['info-table-radio']">
                    <RadioGroupItem value="pregnancy" label="임신특례" />
                  </RadioGroup>
                  <DatePicker
                    v-model="detail.pregnancyDate"
                    size="sm"
                    class="w-37"
                    input-class="w-full"
                    label="임신특례 일자"
                    label-class="sr-only"
                    :disabled="detail.etcWork !== 'pregnancy'"
                  />
                </span>
                <span class="group-gap2">
                  <RadioGroup v-model="detail.etcWork" :class="infoStyles['info-table-radio']">
                    <RadioGroupItem value="etc" label="기타" />
                  </RadioGroup>
                  <InputField2
                    v-model="detail.etcWorkNote"
                    size="sm"
                    input-class="w-60"
                    class="!space-y-0"
                    label="기타근무 직접입력"
                    label-class="sr-only"
                    :disabled="detail.etcWork !== 'etc'"
                  />
                </span>
              </InfoField>

              <!-- 시안: 체크박스 + 사유 셀렉트 + 일자. 체크해야 둘 다 살아난다 -->
              <InfoField label="정기사고자">
                <Checkbox v-model="detail.isPeriodicAccident" />
                <SelectField
                  v-model="detail.periodicAccidentReason"
                  :options="periodicAccidentReasonOptions"
                  size="sm"
                  trigger-class="w-full"
                  class="!space-y-0 w-32"
                  placeholder="선택"
                  label="정기사고 사유"
                  label-class="sr-only"
                  :disabled="!detail.isPeriodicAccident"
                />
                <DatePicker
                  v-model="detail.periodicAccidentDate"
                  size="sm"
                  class="w-37"
                  input-class="w-full"
                  label="정기사고 일자"
                  label-class="sr-only"
                  :disabled="!detail.isPeriodicAccident"
                />
              </InfoField>

              <InfoField label="팀장교육수료일자" for="personnel-team-lead-training">
                <DatePicker id="personnel-team-lead-training" v-model="detail.teamLeadTrainingDate" size="sm" class="flex-1" input-class="w-full" />
              </InfoField>
              <InfoField label="팀장자격획득일자" for="personnel-team-lead-cert">
                <DatePicker id="personnel-team-lead-cert" v-model="detail.teamLeadCertDate" size="sm" class="flex-1" input-class="w-full" />
              </InfoField>

              <InfoField label="휴대전화" for="personnel-mobile">
                <InputField2 id="personnel-mobile" v-model="detail.mobilePhone" size="sm" class="!space-y-0 flex-1" input-class="w-full" />
              </InfoField>

              <!-- 시안: 주소검색(돋보기) 위, 상세주소 아래 2줄 -->
              <InfoField label="주소" layout="column">
                <InputField2
                  v-model="detail.addressRoad"
                  size="sm"
                  class="!space-y-0 w-full"
                  input-class="w-full"
                  label="주소검색"
                  label-class="sr-only"
                  placeholder="주소검색"
                  :icon="searchIcon"
                  icon-class="size-5"
                  icon-label="주소 검색"
                  search
                />
                <InputField2
                  v-model="detail.addressDetail"
                  size="sm"
                  class="!space-y-0 w-full"
                  input-class="w-full"
                  label="상세주소"
                  label-class="sr-only"
                  placeholder="상세주소"
                />
              </InfoField>

              <InfoField label="특이사항" for="personnel-note" layout="column">
                <TextareaField id="personnel-note" v-model="detail.note" class="w-full !space-y-0" textarea-class="w-full" :height="44" />
              </InfoField>
            </InfoTable>
          </div>
        </div>

        <section class="transfer-section" aria-labelledby="transfer-heading">
          <div class="transfer-head">
            <h3 id="transfer-heading" class="transfer-title">전입 전출 현황</h3>
            <div class="btn-wrap-group">
              <Button type="button" variant="tertiary2" size="xs" padding="12" @click="onDeleteSelectedTransfers">선택삭제</Button>
              <Button type="button" variant="secondary" size="xs" padding="12" @click="onAddTransfer">추가</Button>
              <Button type="button" variant="primary" size="xs" padding="12" @click="onSaveTransfers">저장</Button>
            </div>
          </div>

          <TabulatorGrid
            ref="transferGridRef"
            v-model:data="transfers"
            :columns="transferColumns"
            select-mode="checkbox"
            :table-options="selectByCheckboxOnly"
            height=""
            placeholder="전입 전출 내역이 없습니다"
            @row-selection-changed="selectedTransferCount = $event.length"
          />
        </section>
      </LayoutPanel>
    </template>
  </LayoutSplit>

  <DeptSearchDialog v-model:open="deptSearchOpen" @select="onDeptSelected" />

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDialog } from '@/composable/dialog/dialog'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import { PrivacyNoticeBar } from '@/components/custom/notice'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import LayoutSplit from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import DeptSearchDialog from './components/DeptSearchDialog.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  usePersonnelManage,
  statusOptions,
  duplicateTypeOptions,
  positionOptions,
  teamOptions,
  periodicAccidentReasonOptions,
  type PersonnelListRow,
} from './composable/PC-LPO-0801'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'
// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(§5)
defineOptions({ name: 'PcLpo0801' })

// presets.ts localPoliceMenu items[6] = '인사관리'
useSideMenuSetup({ ...localPoliceMenu, openIndex: 6, activeChild: '인사관리' })

// '/lpo' 는 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '인사관리' },
]

const {
  advancedSearchOpen,
  searchStatus,
  searchEquipmentName,
  listRows,
  activeRowKey,
  detail,
  transfers,
  selectRow,
  createTransferRow,
} = usePersonnelManage()

const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
/*
 * 성공·경고 피드백은 toast 가 아니라 알림창(AlertDialog2)으로 낸다.
 * CLAUDE.md §7 의 기본값은 toast 지만 사용자 지정이다.
 */
const dialog = useDialog()

const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'
/** 증명사진 미등록 시 보여줄 기본 이미지 */
const defaultPhoto = '/portal/asset/images/img/img_profile.svg'

/* ------------------------------------------------------------------ *
 * 인사 현황 목록
 * ------------------------------------------------------------------ */
const listColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  { title: '성명', field: 'name', width: 90, hozAlign: 'center' },
  { title: '계급', field: 'rank', width: 90, hozAlign: 'center' },
  { title: '직책', field: 'position', width: 90, hozAlign: 'center' },
  { title: '소속팀', field: 'team', width: 90, hozAlign: 'center' },
  { title: '전화번호', field: 'phone', hozAlign: 'center' },
  { title: '수정자', field: 'updater', width: 90, hozAlign: 'center' },
  { title: '수정일자', field: 'updatedAt', width: 120, hozAlign: 'center' },
]

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onListRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as PersonnelListRow
  selectRow(data.rowKey)
}

async function onSave() {
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
}

/* ------------------------------------------------------------------ *
 * 사진 등록 — 파일 선택만 화면단에서 처리하고 실제 업로드는 개발팀 몫이다
 * ------------------------------------------------------------------ */
const fileInputRef = ref<HTMLInputElement | null>(null)
function openPhotoPicker() {
  fileInputRef.value?.click()
}
function onPhotoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  detail.photoUrl = URL.createObjectURL(file)
}

/* ------------------------------------------------------------------ *
 * 전입 전출 현황
 * ------------------------------------------------------------------ */
/**
 * "선택은 체크박스로만" — Tabulator 는 selectableRows 가 true 면 행 아무 데나 클릭해도
 * 선택이 토글돼서, 체크를 안 했는데도 선택삭제가 그 행을 지운다.
 * 'highlight' 로 두면 그 클릭 리스너만 안 걸리고 체크박스·getSelectedRows 는 그대로 동작한다.
 */
const selectByCheckboxOnly = { selectableRows: 'highlight' }

const transferGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedTransferCount = ref(0)

/**
 * 부서 조회 팝업(PC-LPO-0802). 어느 행의 어느 칸을 채울지 기억해 뒀다가 고른 값을 되돌려 넣는다.
 * 시안(전입 전출 표)에는 팝업을 여는 트리거가 안 그려져 있어 입력 오른쪽 돋보기로 열게 했다.
 */
const deptSearchOpen = ref(false)
const deptSearchTarget = ref<{ rowKey: number; field: 'fromDept' | 'toDept' } | null>(null)

function openDeptSearch(row: any, field: 'fromDept' | 'toDept') {
  deptSearchTarget.value = { rowKey: row.rowKey, field }
  deptSearchOpen.value = true
}

function onDeptSelected(dept: { station: string; dept: string }) {
  const target = deptSearchTarget.value
  if (!target) return
  // 배열은 제자리 수정하지 않고 재할당한다(CLAUDE.md §3)
  transfers.value = transfers.value.map((row) =>
    row.rowKey === target.rowKey ? { ...row, [target.field]: `${dept.station} ${dept.dept}` } : row,
  )
}

const transferColumns: TabulatorGridColumn[] = [
  // 시안(11542:121631)은 버튼이 아니라 입력창이다 — 비어 있으면 '부서조회' 가 회색 안내문으로 깔린다
  {
    title: '전부서',
    field: 'fromDept',
    hozAlign: 'center',
    cellType: 'input',
    cellPlaceholder: '부서조회',
    cellClearable: true,
    cellIcon: searchIcon,
    cellIconLabel: '전부서 조회',
    onCellIconClick: (row: any) => openDeptSearch(row, 'fromDept'),
  },
  { title: '전입일자', field: 'transferInDate', cellType: 'date', hozAlign: 'center' },
  {
    title: '전출부서',
    field: 'toDept',
    hozAlign: 'center',
    cellType: 'input',
    cellPlaceholder: '부서조회',
    cellClearable: true,
    cellIcon: searchIcon,
    cellIconLabel: '전출부서 조회',
    onCellIconClick: (row: any) => openDeptSearch(row, 'toDept'),
  },
  { title: '전출일자', field: 'transferOutDate', cellType: 'date', hozAlign: 'center' },
]

function onAddTransfer() {
  transferGridRef.value?.addRow(createTransferRow(), true)
}

async function onDeleteSelectedTransfers() {
  if (!selectedTransferCount.value) {
    await dialog.alert({ title: '삭제할 전입 전출 내역을 선택해 주세요.', btnCancel: '확인' })
    return
  }
  transferGridRef.value?.deleteSelected()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

async function onSaveTransfers() {
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PC-LPO-0801',
  label: '인사관리',
  path: '/views/lpo/PC-LPO-0801',
  componentName: 'PcLpo0801',
  closable: true,
})

</script>


