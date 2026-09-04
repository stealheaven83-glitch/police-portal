<template>
  <PageHeader>
    <template #left>
      <PageTitle title="인사관리현황" />
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
          label="상태구분"
          :options="statusOptions"
          size="sm"
          trigger-class="w-30"
        />
        <InputField2 v-model="searchEquipmentName" label="기동장비관리명" size="sm" input-class="w-50" />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions space-between">
    <p class="form-note">
      * 개인정보를 공무수행 목적외 사적으로 조회 또는 유출하여 타인의 비밀을 침해하거나 누설할 경우
      <span class="notice-strong">5년이하의 징역 또는 5천만원 이하의 벌금</span>에 처해집니다.
    </p>
    <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
  </div>

  <LayoutSplit :count="2" :widths="[54, 46]" :min-widths="[35, 30]">
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
        <div class="detail-scroll">
          <div class="detail-layout lp-detail-layout-wide">
            <div class="photo-box">
              <div class="photo-frame lp-photo-frame-fill">
                <!-- 사진이 없으면 시안의 기본 프로필 이미지를 원본 크기로 가운데 둔다 -->
                <img
                  :src="detail.photoUrl ?? defaultPhoto"
                  :class="detail.photoUrl ? undefined : 'photo-empty'"
                  :alt="detail.photoUrl ? '등록된 증명사진' : '등록된 증명사진 없음'"
                >
              </div>
              <Button type="button" variant="tertiary2" size="xs" @click="openPhotoPicker">사진 등록</Button>
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
                  <RadioGroup v-model="detail.position" :class="[infoStyles['info-table-radio'], 'flex-wrap']">
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
                    class="w-32"
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
                <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSelectedTransfers">선택삭제</Button>
                <Button type="button" variant="secondary" size="sm" @click="onAddTransfer">추가</Button>
                <Button type="button" variant="primary" size="sm" @click="onSaveTransfers">저장</Button>
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
        </div>
      </LayoutPanel>
    </template>
  </LayoutSplit>

  <EmptyStubDialog v-model:open="deptSearchOpen" title="부서 찾기" />
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
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import LayoutSplit from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  usePersonnelManage,
  statusOptions,
  duplicateTypeOptions,
  positionOptions,
  teamOptions,
  periodicAccidentReasonOptions,
  type PersonnelListRow,
  type TransferRow,
} from './composable/PC-STT-0103'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'

// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(§5)
defineOptions({ name: 'PcStt0103' })

/*
 * LNB: presets.ts 에 통계(기초통계) 프리셋이 아직 없어서 useSideMenuSetup 을 부르지 않는다.
 * 지어내면 메뉴 구조가 틀어지므로(CLAUDE.md §5 ③) 프리셋이 배치 등록될 때 함께 건다.
 */

// '/stt' 는 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '통계' },
  { label: '기초통계' },
  { label: '인사관리현황' },
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
/*
 * 전화번호가 남는 폭을 가져가는 유일한 컬럼이다(width 를 안 준 컬럼만 fitColumns 가 늘린다).
 * 짧은 값만 들어가는 앞쪽 컬럼을 시안보다 조금씩 줄여 그만큼을 전화번호로 몰아주고,
 * minWidth 로 시안 폭(160)을 바닥에 깔아 패널이 좁아져도 번호가 잘리지 않게 한다.
 */
const listColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '성명', field: 'name', width: 80, hozAlign: 'center' },
  { title: '계급', field: 'rank', width: 70, hozAlign: 'center' },
  { title: '직책', field: 'position', width: 70, hozAlign: 'center' },
  { title: '소속팀', field: 'team', width: 70, hozAlign: 'center' },
  { title: '전화번호', field: 'phone', minWidth: 160, hozAlign: 'center' },
  { title: '수정자', field: 'updater', width: 80, hozAlign: 'center' },
  { title: '수정일자', field: 'updatedAt', width: 110, hozAlign: 'center' },
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

/** 부서 찾기 팝업(PC-LPO-0802)은 아직 시안을 받지 못해 빈 모달로 자리만 잡아둔다 */
const deptSearchOpen = ref(false)
function openDeptSearch() {
  deptSearchOpen.value = true
}

const transferColumns: TabulatorGridColumn[] = [
  {
    title: '전부서',
    field: 'fromDept',
    hozAlign: 'center',
    cellType: 'button',
    buttonVariant: 'tertiary2',
    buttonSize: 'xs',
    buttonLabel: (row) => (row as TransferRow).fromDept || '부서조회',
    onButtonClick: () => openDeptSearch(),
  },
  { title: '전입일자', field: 'transferInDate', cellType: 'date', hozAlign: 'center' },
  {
    title: '전출부서',
    field: 'toDept',
    hozAlign: 'center',
    cellType: 'button',
    buttonVariant: 'tertiary2',
    buttonSize: 'xs',
    buttonLabel: (row) => (row as TransferRow).toDept || '부서조회',
    onButtonClick: () => openDeptSearch(),
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
  value: 'PC-STT-0103',
  label: '인사관리현황',
  path: '/views/stt/PC-STT-0103',
  componentName: 'PcStt0103',
  closable: true,
})
</script>


