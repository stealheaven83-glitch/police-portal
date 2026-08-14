<script setup lang="ts">
import { ref } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/Bread-crumb/Breadcrumb.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import { useWorkSchedule, timeSlots, teamOptions } from './work-schedule/useWorkSchedule'
import styles from './work-schedule/workSchedule.module.css'

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

const headquarters = ref('hq')
const division = ref('central-report')
const unit = ref('all')

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

  <div :class="styles.toolbar">
    <div :class="styles.deptGroup" role="group" aria-label="부서 선택">
      <span :class="styles.deptLabel">부서</span>
      <SelectField
        :model-value="headquarters"
        :options="[{ label: '본청', value: 'hq' }]"
        size="sm"
        :trigger-class="styles.select"
        class="!space-y-0"
      />
      <SelectField
        :model-value="division"
        :options="[{ label: '중앙보고', value: 'central-report' }]"
        size="sm"
        :trigger-class="styles.select"
        class="!space-y-0"
      />
      <SelectField
        :model-value="unit"
        :options="[{ label: '전체', value: 'all' }]"
        size="sm"
        :trigger-class="styles.select"
        class="!space-y-0"
      />
    </div>
    <div :class="styles.actionButtons">
      <Button type="button" variant="tertiary2" size="sm" @click="openManageDialog('甲지 일괄 출력')">甲지 일괄 출력</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="onPrint">인쇄</Button>
    </div>
  </div>

  <div :class="styles.dateNavRow">
    <div :class="styles.dateNav">
      <span :class="styles.dateNavLabel">근무일</span>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="이전 근무일" @click="shiftWorkDate(-1)">
        <ChevronLeft :size="18" />
      </Button>
      <DatePicker :model-value="workDate" size="sm" input-class="w-[16rem]" />
      <Button type="button" variant="ghost" size="icon-sm" aria-label="다음 근무일" @click="shiftWorkDate(1)">
        <ChevronRight :size="18" />
      </Button>
      <span :class="styles.weekday">월요일</span>
      <RadioGroup v-model="shift" class="flex gap-4">
        <RadioGroupItem value="day" label="주" />
        <RadioGroupItem value="night" label="야" />
      </RadioGroup>
    </div>

    <div :class="styles.actionButtons">
      <Button type="button" variant="tertiary2" size="sm" @click="resetScheduleGrid">甲지 초기화</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="openManageDialog('순찰구역 관리')">순찰구역</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="openManageDialog('교대복구')">교대복구</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="openManageDialog('근무관리')">근무관리</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="openManageDialog('시간관리')">시간관리</Button>
      <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
    </div>
  </div>

  <div :class="styles.columns">
    <!-- 근무자 -->
    <section :class="styles.panel" aria-labelledby="workers-heading">
      <div :class="styles.panelHead">
        <h3 id="workers-heading" :class="styles.panelTitle">근무자</h3>
      </div>
      <div :class="styles.panelBody">
        <!-- 일반근무자 -->
        <div :class="styles.subsection">
          <div :class="styles.subsectionHead">
            <h4 :class="styles.subsectionTitle">일반근무자</h4>
          </div>
          <div :class="styles.subsectionActions">
            <SelectField v-model="regularTeam" :options="teamOptions" size="sm" :trigger-class="styles.select" class="!space-y-0" />
            <Button type="button" variant="tertiary2" size="xs" @click="addRegularWorker">추가</Button>
            <Button type="button" variant="primary" size="xs" @click="onSave">저장</Button>
          </div>
          <div :class="styles.miniTableWrap">
            <table :class="styles.miniTable">
              <caption class="sr-only">일반근무자 목록 — 조, 계급, 성명, 배정횟수</caption>
              <thead>
                <tr>
                  <th scope="col"><span class="sr-only">선택</span></th>
                  <th scope="col">조</th>
                  <th scope="col">계급</th>
                  <th scope="col">성명</th>
                  <th scope="col">배정횟수</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="worker in regularWorkers" :key="worker.id">
                  <td><Checkbox :aria-label="`${worker.name} 선택`" /></td>
                  <td><InputField2 v-model="worker.group" size="sm" :class="styles.miniInput" input-class="text-center" /></td>
                  <td>{{ worker.rank }}</td>
                  <td>{{ worker.name }}</td>
                  <td>{{ worker.assignCount }}</td>
                </tr>
                <tr v-if="!regularWorkers.length">
                  <td colspan="5" :class="styles.miniEmpty">등록된 일반근무자가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 자원근무자 -->
        <div :class="styles.subsection">
          <div :class="styles.subsectionHead">
            <h4 :class="styles.subsectionTitle">자원근무자</h4>
            <div :class="styles.subsectionActions">
              <Button type="button" variant="tertiary2" size="xs" :disabled="!volunteerSelection.size" @click="removeSelectedVolunteers">삭제</Button>
              <Button type="button" variant="primary" size="xs" @click="addVolunteerWorker">추가</Button>
            </div>
          </div>
          <div :class="styles.miniTableWrap">
            <table :class="styles.miniTable">
              <caption class="sr-only">자원근무자 목록 — 계급, 성명, 자원구분, 시작시간, 종료시간</caption>
              <thead>
                <tr>
                  <th scope="col"><span class="sr-only">선택</span></th>
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
                  <td><InputField2 v-model="worker.rank" size="sm" :class="styles.miniInput" input-class="text-center" /></td>
                  <td><InputField2 v-model="worker.name" size="sm" :class="styles.miniInput" input-class="text-center" /></td>
                  <td><InputField2 v-model="worker.volunteerType" size="sm" :class="styles.miniInput" input-class="text-center" /></td>
                  <td><InputField2 v-model="worker.startTime" size="sm" :class="styles.miniInput" input-class="text-center" /></td>
                  <td><InputField2 v-model="worker.endTime" size="sm" :class="styles.miniInput" input-class="text-center" /></td>
                </tr>
                <tr v-if="!volunteerWorkers.length">
                  <td colspan="6" :class="styles.miniEmpty">등록된 자원근무자가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 사고자 -->
        <div :class="styles.subsection">
          <div :class="styles.subsectionHead">
            <h4 :class="styles.subsectionTitle">사고자</h4>
            <div :class="styles.subsectionActions">
              <Button type="button" variant="tertiary2" size="xs" :disabled="!incidentSelection.size" @click="removeSelectedIncidents">삭제</Button>
              <Button type="button" variant="primary" size="xs" @click="addIncidentWorker">추가</Button>
            </div>
          </div>
          <div :class="styles.miniTableWrap">
            <table :class="styles.miniTable">
              <caption class="sr-only">사고자 목록 — 계급, 성명, 사유, 시작시간, 종료시간</caption>
              <thead>
                <tr>
                  <th scope="col"><span class="sr-only">선택</span></th>
                  <th scope="col">계급</th>
                  <th scope="col">성명</th>
                  <th scope="col">사유</th>
                  <th scope="col">시작시간</th>
                  <th scope="col">종료시간</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="worker in incidentWorkers" :key="worker.id">
                  <td>
                    <Checkbox
                      :model-value="incidentSelection.has(worker.id)"
                      :aria-label="`${worker.name} 선택`"
                      @update:model-value="(checked) => toggleIncidentSelection(worker.id, !!checked)"
                    />
                  </td>
                  <td><InputField2 v-model="worker.rank" size="sm" :class="styles.miniInput" input-class="text-center" /></td>
                  <td><InputField2 v-model="worker.name" size="sm" :class="styles.miniInput" input-class="text-center" /></td>
                  <td><InputField2 v-model="worker.reason" size="sm" :class="styles.miniInput" input-class="text-center" /></td>
                  <td><InputField2 v-model="worker.startTime" size="sm" :class="styles.miniInput" input-class="text-center" /></td>
                  <td><InputField2 v-model="worker.endTime" size="sm" :class="styles.miniInput" input-class="text-center" /></td>
                </tr>
                <tr v-if="!incidentWorkers.length">
                  <td colspan="6" :class="styles.miniEmpty">등록된 사고자가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- 근무지정표 -->
    <section :class="styles.panel" aria-labelledby="schedule-heading">
      <div :class="styles.panelHead">
        <h3 id="schedule-heading" :class="styles.panelTitle">근무지정표</h3>
      </div>
      <div :class="styles.panelBody">
        <div :class="styles.scheduleHead">
          <span :class="styles.targetDateLabel">대상일자</span>
          <DatePicker v-model="targetDate" size="sm" input-class="w-[16rem]" />
          <Button type="button" variant="tertiary2" size="sm" @click="openManageDialog('근무지정표 불러오기')">근무지정표 불러오기</Button>
          <Button type="button" variant="tertiary2" size="sm" @click="openManageDialog('근무형태 불러오기')">근무형태 불러오기</Button>
        </div>

        <div :class="styles.candidateWrap">
          <span :class="styles.candidateTag">컴포넌트 제작 필요 후보: 근무지정표 배정 그리드</span>

          <div :class="styles.gridTableWrap">
            <table :class="styles.gridTable">
              <caption class="sr-only">근무지정표 — 근무 구분별 시간대 배정 현황</caption>
              <thead>
                <tr>
                  <th scope="col">근무</th>
                  <th v-for="slot in timeSlots" :key="slot" scope="col">{{ slot }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in scheduleRows" :key="row.id">
                  <th scope="row" :class="styles.rowLabelCell">{{ row.label }}</th>
                  <td
                    v-for="(cell, idx) in row.cells"
                    :key="idx"
                    :class="[styles.assignCell, row.type === 'fixed' && styles.assignCellFixed]"
                    role="button"
                    tabindex="0"
                    @click="openAssignCell(row.label, timeSlots[idx])"
                    @keydown.enter="openAssignCell(row.label, timeSlots[idx])"
                  >
                    <span v-for="(name, ni) in cell" :key="ni" :class="styles.assignName">{{ name }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div :class="styles.notesRow">
          <span :class="styles.notesLabel">중요지시사항</span>
          <TextareaField v-model="importantNotes" :class="styles.notesTextarea" textarea-class="w-full border-0 rounded-none" :height="100" />
        </div>
      </div>
    </section>
  </div>

  <EmptyStubDialog v-model:open="manageDialogOpen" :title="manageDialogTitle" description="아직 준비 중인 관리 화면입니다." />
  <EmptyStubDialog v-model:open="assignDialogOpen" :title="assignDialogTitle" description="근무자를 선택해 배정합니다." />
</template>
