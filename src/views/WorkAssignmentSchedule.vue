<script setup lang="ts">
import { ref } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentNode, DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import { useWorkSchedule, timeSlots, teamOptions } from './work-schedule/useWorkSchedule'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutHeader from '@/components/custom/content-layout/layoutHeader.vue'

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰', path: '/lpo' },
  { label: '근무일지', path: '/lpo' },
  { label: '근무일지(甲)', path: '/lpo' },
  { label: '근무지정표작성' },
]

const {
  workDate,
  shift,
  regularWorkers,
  regularTeam,
  volunteerWorkers,
  incidentWorkers,
  scheduleRows,
  importantNotes,
  targetDate,
  addRegularWorker,
  addVolunteerWorker,
  removeVolunteerWorkers,
  addIncidentWorker,
  removeIncidentWorkers,
  shiftWorkDate,
} = useWorkSchedule()

const departmentTree: DepartmentNode[] = [
  {
    label: '본청',
    value: 'hq',
    children: [
      { label: '중앙보고', value: 'central-report', children: [{ label: '전체', value: 'all' }] },
    ],
  },
]
const department = ref<DepartmentValue>({ level1: 'hq', level2: 'central-report', level3: 'all' })

const volunteerSelection = ref<Set<number>>(new Set())
function toggleVolunteerSelection(id: number, checked: boolean) {
  if (checked) volunteerSelection.value.add(id)
  else volunteerSelection.value.delete(id)
}
function removeSelectedVolunteers() {
  removeVolunteerWorkers(volunteerSelection.value)
  volunteerSelection.value.clear()
}

const incidentSelection = ref<Set<number>>(new Set())
function toggleIncidentSelection(id: number, checked: boolean) {
  if (checked) incidentSelection.value.add(id)
  else incidentSelection.value.delete(id)
}
function removeSelectedIncidents() {
  removeIncidentWorkers(incidentSelection.value)
  incidentSelection.value.clear()
}

/** 순찰구역/교대복구/근무관리/시간관리/불러오기/일괄출력 — 아직 설계되지 않은 하위 화면들의 공통 빈 모달 */
const manageDialogOpen = ref(false)
const manageDialogTitle = ref('')
function openManageDialog(title: string) {
  manageDialogTitle.value = title
  manageDialogOpen.value = true
}

function resetScheduleGrid() {
  for (const row of scheduleRows.value) {
    if (row.type === 'variable') row.cells = row.cells.map((): string[] => [])
  }
  toast.success('甲지가 초기화되었습니다.')
}

function onPrint() {
  window.print()
}

function onSave() {
  toast.success('저장되었습니다.')
}

/** 근무지정표 셀 클릭 시 배정 — 실제 배정 UI는 아직 없어 빈 모달로 대체 */
const assignDialogOpen = ref(false)
const assignDialogTitle = ref('')
function openAssignCell(rowLabel: string, slot: string) {
  assignDialogTitle.value = `${rowLabel} · ${slot} 근무 배정`
  assignDialogOpen.value = true
}
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="근무지정표작성" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <div class="flex items-center justify-between mb-5">
    <div class="flex items-center gap-2">
      <span class="text-[1.5rem] font-semibold text-[var(--Text-body_0)]">부서</span>
      <DepartmentCascadeSelect v-model="department" :tree="departmentTree" size="sm" select-class="w-40" />
    </div>
    <div class="flex gap-3">
      <Button type="button" variant="tertiary2" size="sm" class="w-30" @click="openManageDialog('甲지 일괄 출력')">甲지 일괄 출력</Button>
      <Button type="button" variant="tertiary2" size="sm" class="w-25" @click="onPrint">인쇄</Button>
    </div>
  </div>

  <div class="flex items-center justify-between">
    <div class="flex items-center gap-9">
      <div class="flex items-center">
        <span>근무일</span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="이전 근무일" @click="shiftWorkDate(-1)">
          <ChevronLeft :size="18" />
        </Button>
        <DatePicker :model-value="workDate" size="sm" input-class="w-[16rem]" />
        <Button type="button" variant="ghost" size="icon-sm" aria-label="다음 근무일" @click="shiftWorkDate(1)">
          <ChevronRight :size="18" />
        </Button>
      </div>
      <span>월요일</span>
      <RadioGroup v-model="shift" class="flex gap-4">
        <RadioGroupItem value="day" label="주" />
        <RadioGroupItem value="night" label="야" />
      </RadioGroup>
    </div>

    <div class="flex items-center gap-3">
      <Button type="button" class="w-25" variant="tertiary2" size="sm" @click="resetScheduleGrid">甲지 초기화</Button>
      <Button type="button" class="w-25" variant="secondary" size="sm" @click="openManageDialog('순찰구역 관리')">순찰구역</Button>
      <Button type="button" class="w-25" variant="secondary" size="sm" @click="openManageDialog('교대복구')">교대복구</Button>
      <Button type="button" class="w-25" variant="secondary" size="sm" @click="openManageDialog('근무관리')">근무관리</Button>
      <Button type="button" class="w-25" variant="secondary" size="sm" @click="openManageDialog('시간관리')">시간관리</Button>
      <Button type="button" class="w-25" variant="primary" size="sm" @click="onSave">저장</Button>
    </div>
  </div>

  <LayoutSplite :count="2">
    <template #layout-1>
      <LayoutHeader title="근무자" />
      <div class="px-6 py-5">
        <!-- 일반근무자 -->
        <div class="mb-9">
          <div class="flex items-center justify-between">
            <h4>일반근무자</h4>
          </div>
          <div class="flex items-end justify-between my-2">
            <SelectField v-model="regularTeam" :options="teamOptions" size="sm" trigger-class="w-25" />
            <div class="flex items-center gap-2">
              <Button type="button" variant="secondary" size="xs" @click="addRegularWorker">추가</Button>
              <Button type="button" variant="primary" size="xs" @click="onSave">저장</Button>
            </div>
          </div>
          <table class="table-style1">
            <caption class="sr-only">일반근무자 목록 — 조, 계급, 성명, 배정횟수</caption>
            <colgroup>
              <col width="44" />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th scope="col"><Checkbox aria-label="전체 선택" /></th>
                <th scope="col">조</th>
                <th scope="col">계급</th>
                <th scope="col">성명</th>
                <th scope="col">배정횟수</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="worker in regularWorkers" :key="worker.id">
                <td><Checkbox :aria-label="`${worker.name} 선택`" /></td>
                <td><InputField2 v-model="worker.group" size="sm" input-class="text-center" /></td>
                <td>{{ worker.rank }}</td>
                <td>{{ worker.name }}</td>
                <td>{{ worker.assignCount }}</td>
              </tr>
              <tr v-if="!regularWorkers.length">
                <td colspan="5">등록된 일반근무자가 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 자원근무자 -->
        <div class="mb-9">
          <div class="flex items-end justify-between mb-2">
            <h4>자원근무자</h4>
            <div class="flex items-center gap-2">
              <Button type="button" variant="tertiary2" size="xs" @click="addVolunteerWorker">삭제</Button>
              <Button type="button" variant="secondary" size="xs" @click="onSave">추가</Button>
            </div>
          </div>
          <table class="table-style1">
            <caption class="sr-only">자원근무자 목록 — 계급, 성명, 자원구분, 시작시간, 종료시간</caption>
            <colgroup>
              <col width="44" />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th scope="col"><Checkbox aria-label="전체 선택" /></th>
                <th scope="col">계급</th>
                <th scope="col">성명</th>
                <th scope="col">자원구분</th>
                <th scope="col">시작시간</th>
                <th scope="col">종료시간</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="worker in volunteerWorkers" :key="worker.id">
                <td>
                  <Checkbox
                    :model-value="volunteerSelection.has(worker.id)"
                    :aria-label="`${worker.name} 선택`"
                    @update:model-value="(checked) => toggleVolunteerSelection(worker.id, !!checked)"
                  />
                </td>
                <td>{{ worker.rank }}</td>
                <td>{{ worker.name }}</td>
                <td>{{ worker.volunteerType }}</td>
                <td>{{ worker.startTime }}</td>
                <td>{{ worker.endTime }}</td>
              </tr>
              <tr v-if="!volunteerWorkers.length">
                <td colspan="6">등록된 자원근무자가 없습니다.</td>
              </tr>
            </tbody>
            </table>
        </div>

        <!-- 사고자 -->
        <div>
          <div class="flex items-end justify-between mb-2">
            <h4>사고자</h4>
            <div class="flex items-center gap-2">
              <Button type="button" variant="tertiary2" size="xs" @click="removeSelectedIncidents">삭제</Button>
              <Button type="button" variant="secondary" size="xs" @click="addIncidentWorker">추가</Button>
            </div>
          </div>
          <table class="table-style1">
            <caption class="sr-only">자원근무자 목록 — 계급, 성명, 자원구분, 시작시간, 종료시간</caption>
            <colgroup>
              <col width="44" />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th scope="col"><Checkbox aria-label="전체 선택" /></th>
                <th scope="col">계급</th>
                <th scope="col">성명</th>
                <th scope="col">자원구분</th>
                <th scope="col">시작시간</th>
                <th scope="col">종료시간</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="worker in volunteerWorkers" :key="worker.id">
                <td>
                  <Checkbox
                    :model-value="volunteerSelection.has(worker.id)"
                    :aria-label="`${worker.name} 선택`"
                    @update:model-value="(checked) => toggleVolunteerSelection(worker.id, !!checked)"
                  />
                </td>
                <td>{{ worker.rank }}</td>
                <td>{{ worker.name }}</td>
                <td>{{ worker.volunteerType }}</td>
                <td>{{ worker.startTime }}</td>
                <td>{{ worker.endTime }}</td>
              </tr>
              <tr v-if="!volunteerWorkers.length">
                <td colspan="6">등록된 자원근무자가 없습니다.</td>
              </tr>
            </tbody>
            </table>
        </div>
      </div>
      
    </template>
    <template #layout-2>
      <LayoutHeader title="근무지정표">
        <template #right>
          <div class="flex items-center gap-3">
            <DatePicker label="대상일자" size="sm" inputClass="w-40"/>
            <Button variant="tertiary" size="sm">근무지정표 불러오기</Button>
            <Button variant="tertiary" size="sm">근무형태 불러오기</Button>
          </div>
        </template>
      </LayoutHeader>
      <div>
      <div class="px-6 py-5">
        <div>
          <span>컴포넌트 제작 필요 후보: 근무지정표 배정 그리드</span>
          <div>
            <table class="table-style1 table-font1">
              <caption class="sr-only">근무지정표 — 근무 구분별 시간대 배정 현황</caption>
              <colgroup>
                <col width="148" />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">근무</th>
                  <th v-for="slot in timeSlots" :key="slot" scope="col">{{ slot }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in scheduleRows" :key="row.id">
                  <th scope="row">{{ row.label }}</th>
                  <td
                    v-for="(cell, idx) in row.cells"
                    :key="idx"
                    role="button"
                    tabindex="0"
                    @click="openAssignCell(row.label, timeSlots[idx])"
                    @keydown.enter="openAssignCell(row.label, timeSlots[idx])"
                  >
                    <span v-for="(name, ni) in cell" :key="ni">{{ name }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <span>중요지시사항</span>
          <TextareaField v-model="importantNotes" textarea-class="w-full border-0 rounded-none" :height="100" />
        </div>
      </div>

  </div>
    </template>
  </LayoutSplite>
  

  <EmptyStubDialog v-model:open="manageDialogOpen" :title="manageDialogTitle" description="아직 준비 중인 관리 화면입니다." />
  <EmptyStubDialog v-model:open="assignDialogOpen" :title="assignDialogTitle" description="근무자를 선택해 배정합니다." />
</template>

<style scoped>
.table-style1{
  table-layout: fixed;
  width: 100%;
}
.table-style1 thead{
  border-top: 1px solid #1E2124;
  border-bottom: 1px solid #8A949E;
}
.table-style1 thead th{
  padding: 8px;
  text-align: center;
}
.table-style1 tbody tr{
  border-bottom: 1px solid #E6E8EA;
}
.table-style1 tbody td{
  padding: 8px;
  text-align: center;
}
.table-style1 tbody tr td +  td{
  border-left: 1px solid #E6E8EA;
}

.table-font1 th{
  font-size: 1.5rem;
  font-weight: 700;
  color: #464C53;
}
</style>
