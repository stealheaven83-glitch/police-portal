<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentNode, DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import {
  usePersonnelForm,
  rankOptions,
  duplicateTypeOptions,
  positionOptions,
  teamOptions,
  periodicAccidentReasonOptions,
} from './PC-LPO-0801'
import type { PersonnelListRow } from './PC-LPO-0801'
import styles from './PC-LPO-0801.module.css'

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰', path: '/lpo' },
  { label: '인사관리' },
]

const departmentTree: DepartmentNode[] = [
  {
    label: '본청',
    value: 'hq',
    children: [
      { label: '중앙보고', value: 'central-report', children: [{ label: '일선부서', value: 'front-line' }] },
    ],
  },
]
const department = ref<DepartmentValue>({ level1: 'hq', level2: 'central-report', level3: 'front-line' })

const listColumns = [
  { key: 'no', label: '번호', width: '7rem' },
  { key: 'name', label: '이름', width: '10rem' },
  { key: 'rank', label: '계급', width: '8rem' },
  { key: 'position', label: '직책', width: '8rem' },
  { key: 'team', label: '소속팀', width: '8rem' },
  { key: 'phone', label: '전화번호' },
  { key: 'updater', label: '수정자', width: '8rem' },
  { key: 'updatedAt', label: '수정일자', width: '10rem' },
] 

const {
  pagedListRows,
  listRows,
  itemsPerPage,
  currentPage,
  totalPages,
  detail,
  transfers,
  searchRank,
  searchName,
  showAdvancedSearch,
  search,
  selectRow,
  addTransferRow,
  removeTransferRows,
} = usePersonnelForm()

function onSelectRow(payload: { index: number; item: PersonnelListRow }) {
  selectRow(payload.index, payload.item)
}

function onSave() {
  toast.success('저장되었습니다.')
}

const addressSearchOpen = ref(false)

const fileInputRef = ref<HTMLInputElement | null>(null)
function openPhotoPicker() {
  fileInputRef.value?.click()
}
function onPhotoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  detail.photoUrl = URL.createObjectURL(file)
}

const transferSelection = ref<Set<number>>(new Set())
function toggleTransferSelection(no: number, checked: boolean) {
  if (checked) transferSelection.value.add(no)
  else transferSelection.value.delete(no)
}
function removeSelectedTransfers() {
  const rows = transfers.value.filter((row) => transferSelection.value.has(row.no))
  removeTransferRows(rows)
  transferSelection.value.clear()
}
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="인사관리" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <div :class="styles.toolbar">
    <div :class="styles.toolbarTop">
      <div :class="styles.searchRow">
        <span :class="styles.searchLabel">부서</span>
        <DepartmentCascadeSelect v-model="department" :tree="departmentTree" size="sm" :select-class="styles.select" />
      </div>
      <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
    </div>

    <div v-if="showAdvancedSearch" :class="styles.advancedSearchRow">
      <div :class="styles.searchField">
        <label :class="styles.searchLabel" for="personnel-search-rank">직급</label>
        <SelectField
          id="personnel-search-rank"
          v-model="searchRank"
          :options="rankOptions"
          size="sm"
          :trigger-class="styles.select"
          class="!space-y-0"
        />
      </div>
      <div :class="styles.searchField">
        <label :class="styles.searchLabel" for="personnel-search-name">이름</label>
        <InputField2 id="personnel-search-name" v-model="searchName" size="sm" input-class="w-40" class="!space-y-0" />
      </div>
      <Button type="button" variant="secondary" size="sm" @click="search">조회</Button>
    </div>

    <div :class="styles.toggleRow">
      <button
        type="button"
        :class="styles.toggleButton"
        :aria-expanded="showAdvancedSearch"
        @click="showAdvancedSearch = !showAdvancedSearch"
      >
        상세조회 {{ showAdvancedSearch ? '닫기' : '열기' }}
        <ChevronDown :size="14" />
      </button>
      <p :class="styles.disclaimer">
        ※ 개인정보를 공무수행 목적이 사적으로 조회 또는 유출하여 타인의 비밀을 침해하거나 누설할 경우
        <strong :class="styles.disclaimerStrong">5년이하의 징역 또는 5천만원 이하의 벌금</strong>에 처해집니다.
      </p>
    </div>
  </div>

  <div :class="styles.columns">
    <section :class="styles.panel" aria-labelledby="personnel-list-heading">
      <div :class="styles.panelHead">
        <h3 id="personnel-list-heading" :class="styles.panelTitle">인사 현황</h3>
      </div>
      <div :class="styles.panelBody">
        <TableWrapper
          :columns="listColumns"
          :items="pagedListRows"
          :items-per-page="itemsPerPage"
          :total-elements="listRows.length"
          :total-pages="totalPages"
          :current-page="currentPage"
          selectable
          empty-title="조회된 인사 정보가 없습니다"
          empty-description="검색 조건을 변경해 다시 조회해 주세요."
          @page-change="(page) => (currentPage = page)"
          @select-row="onSelectRow"
        />
      </div>
    </section>

    <section :class="styles.panel" aria-labelledby="personnel-detail-heading">
      <div :class="styles.panelHead">
        <h3 id="personnel-detail-heading" :class="styles.panelTitle">인사 상세</h3>
      </div>
      <div :class="styles.panelBody">
        <div :class="styles.detailLayout">
          <div :class="styles.photoBox">
            <div :class="styles.photoFrame">
              <img v-if="detail.photoUrl" :src="detail.photoUrl" alt="" />
              <span v-else>No Image</span>
            </div>
            <Button type="button" variant="tertiary2" size="xs" @click="openPhotoPicker">사진 등록</Button>
            <input ref="fileInputRef" type="file" accept="image/*" hidden @change="onPhotoChange" />
          </div>

          <div :class="styles.detailFields">
            <InfoTable :columns="1">
              <InfoField label="성명" for="personnel-name">
                <InputField2 id="personnel-name" v-model="detail.name" size="sm" class="!space-y-0 flex-1" />
              </InfoField>

              <InfoField label="성별">
                <RadioGroup v-model="detail.gender" class="flex gap-4">
                  <RadioGroupItem value="male" label="남" />
                  <RadioGroupItem value="female" label="여" />
                </RadioGroup>
              </InfoField>

              <InfoField label="동명여부">
                <RadioGroup v-model="detail.duplicateName" class="flex gap-4">
                  <RadioGroupItem value="none" label="없음" />
                  <RadioGroupItem value="exists" label="있음" />
                </RadioGroup>
              </InfoField>

              <InfoField label="구분" for="personnel-duplicate-type">
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

              <InfoField label="경찰관 배명일자" for="personnel-officer-assigned">
                <DatePicker id="personnel-officer-assigned" v-model="detail.officerAssignedDate" size="sm" class="flex-1" />
              </InfoField>

              <InfoField label="현계급 배명일자" for="personnel-rank-assigned">
                <DatePicker id="personnel-rank-assigned" v-model="detail.currentRankAssignedDate" size="sm" class="flex-1" />
              </InfoField>

              <InfoField label="현부서 전입일자" for="personnel-dept-transfer">
                <DatePicker id="personnel-dept-transfer" v-model="detail.currentDeptTransferDate" size="sm" class="flex-1" />
              </InfoField>

              <InfoField label="직책" full>
                <RadioGroup v-model="detail.position" class="flex flex-wrap gap-4">
                  <RadioGroupItem
                    v-for="opt in positionOptions"
                    :key="opt.value"
                    :value="opt.value"
                    :label="opt.label"
                  />
                </RadioGroup>
                <span class="mx-2 h-4 w-px bg-[var(--Border_gray03)]" aria-hidden="true" />
                <Checkbox v-model="detail.actingChief" label="관서장대리" />
                <Checkbox v-model="detail.actingTeamLead" label="팀장대리" />
              </InfoField>

              <InfoField label="소속팀" for="personnel-team">
                <SelectField
                  id="personnel-team"
                  v-model="detail.team"
                  :options="teamOptions"
                  size="sm"
                  trigger-class="w-32"
                  class="!space-y-0"
                  placeholder="선택"
                />
                <InputField2
                  v-model="detail.teamNote"
                  size="sm"
                  class="!space-y-0 flex-1"
                  :disabled="detail.team !== 'etc'"
                  placeholder="팀명 직접입력"
                />
              </InfoField>

              <InfoField label="근무">
                <RadioGroup v-model="detail.workType" class="flex flex-wrap gap-4">
                  <RadioGroupItem value="center" label="치안센터 전담근무자" />
                  <RadioGroupItem value="day" label="주간근무자" />
                </RadioGroup>
              </InfoField>

              <InfoField label="정기사고자">
                <Checkbox v-model="detail.isPeriodicAccidentTarget" />
                <SelectField
                  v-model="detail.periodicAccidentReason"
                  :options="periodicAccidentReasonOptions"
                  size="sm"
                  trigger-class="w-40"
                  class="!space-y-0"
                  placeholder="선택"
                  :disabled="!detail.isPeriodicAccidentTarget"
                />
              </InfoField>

              <InfoField label="팀장교육수료일자" for="personnel-team-lead-training">
                <DatePicker id="personnel-team-lead-training" v-model="detail.teamLeadTrainingDate" size="sm" class="flex-1" />
              </InfoField>

              <InfoField label="팀장자격획득일자" for="personnel-team-lead-cert">
                <DatePicker id="personnel-team-lead-cert" v-model="detail.teamLeadCertDate" size="sm" class="flex-1" />
              </InfoField>

              <InfoField label="휴대전화" for="personnel-mobile">
                <InputField2 id="personnel-mobile" v-model="detail.mobilePhone" size="sm" class="!space-y-0 flex-1" placeholder="010-0000-0000" />
              </InfoField>

              <InfoField label="주소" full>
                <InputField2
                  v-model="detail.addressRoad"
                  size="sm"
                  class="!space-y-0 flex-1 min-w-[16rem]"
                  placeholder="도로명주소"
                />
                <Button type="button" variant="tertiary2" size="sm" @click="addressSearchOpen = true">주소검색</Button>
                <InputField2
                  v-model="detail.addressDetail"
                  size="sm"
                  class="!space-y-0 flex-1 min-w-[16rem]"
                  placeholder="상세주소"
                />
              </InfoField>

              <InfoField label="특이사항" for="personnel-note" full layout="column">
                <TextareaField id="personnel-note" v-model="detail.note" class="w-full !space-y-0" textarea-class="w-full" :height="80" />
              </InfoField>
            </InfoTable>
          </div>
        </div>
      </div>
    </section>
  </div>

  <section :class="styles.transferSection" aria-labelledby="transfer-heading">
    <div :class="[styles.panelHead, 'rounded-t-lg border']">
      <h3 id="transfer-heading" :class="styles.panelTitle">전입 전출 현황</h3>
      <div class="flex gap-2">
        <Button type="button" variant="tertiary2" size="xs" @click="removeSelectedTransfers">삭제</Button>
        <Button type="button" variant="primary" size="xs" @click="addTransferRow">신규</Button>
      </div>
    </div>
    <div :class="styles.transferTableWrap">
      <table :class="styles.transferTable">
        <caption class="sr-only">전입 전출 현황 — 번호, 전부서, 전입일자, 전출부서, 전출일자</caption>
        <thead>
          <tr>
            <th scope="col"><span class="sr-only">선택</span></th>
            <th scope="col">번호</th>
            <th scope="col">전부서</th>
            <th scope="col">전입일자</th>
            <th scope="col">전출부서</th>
            <th scope="col">전출일자</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in transfers" :key="row.no">
            <td>
              <Checkbox
                :model-value="transferSelection.has(row.no)"
                :aria-label="`${row.no}번 행 선택`"
                @update:model-value="(checked) => toggleTransferSelection(row.no, !!checked)"
              />
            </td>
            <td>{{ row.no }}</td>
            <td><InputField2 v-model="row.fromDept" size="sm" class="!space-y-0" input-class="text-center" placeholder="부서조회" /></td>
            <td><DatePicker v-model="row.transferInDate" size="sm" /></td>
            <td><InputField2 v-model="row.toDept" size="sm" class="!space-y-0" input-class="text-center" placeholder="부서조회" /></td>
            <td><DatePicker v-model="row.transferOutDate" size="sm" /></td>
          </tr>
          <tr v-if="!transfers.length">
            <td colspan="6" :class="styles.transferEmpty">전입/전출 이력이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <EmptyStubDialog v-model:open="addressSearchOpen" title="주소 검색" description="도로명/지번 주소를 검색해 자동으로 입력합니다." />
</template>
