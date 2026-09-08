<template>
  <PageHeader>
    <template #left>
      <PageTitle title="근무지정표작성" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div class="lp-row-between">
    <span class="group-gap2">
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </span>
    <span class="group-gap2">
      <Button type="button" variant="tertiary2" size="sm" @click="bulkPrintOpen = true">甲지 일괄 출력</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="onPrint">인쇄</Button>
    </span>
  </div>

  <div class="lp-row-between lp-table-gap">
    <span class="lp-field-row">
      <span class="group-gap2">
        <span class="lp-label-text">근무일</span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="이전 근무일" @click="shiftWorkDate(-1)">
          <Icon name="arrowLeft" :size="18" />
        </Button>
        <span class="lp-heading-md">{{ workDate }}</span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="다음 근무일" @click="shiftWorkDate(1)">
          <Icon name="arrowNext" :size="18" />
        </Button>
      </span>
      <span class="lp-heading-md">{{ weekdayLabel }}</span>
      <RadioGroup v-model="shift" class="lp-icon-row">
        <RadioGroupItem value="day" label="주" />
        <RadioGroupItem value="night" label="야" />
      </RadioGroup>
    </span>

    <span class="group-gap2">
      <Button type="button" variant="tertiary2" size="sm" @click="resetScheduleGrid">甲지 초기화</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="patrolAreaOpen = true">순찰구역</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="scheduleCopyOpen = true">교대복구</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="timeManageOpen = true">시간관리</Button>
      <Button type="button" variant="tertiary" size="sm" @click="workManageOpen = true">근무관리</Button>
      <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
    </span>
  </div>

  <LayoutSplite class="lp-table-gap" :count="2" :widths="[30, 70]" :min-widths="[22, 40]">
    <template #layout-1>
      <LayoutPanel title="근무자">
        <Tabs v-model="workerTab">
          <TabsList variant="fill" tone="primary" size="sm">
            <TabsTrigger value="regular">일반근무자</TabsTrigger>
            <TabsTrigger value="volunteer">자원근무자</TabsTrigger>
            <TabsTrigger value="incident">사고자</TabsTrigger>
          </TabsList>

          <!-- 일반근무자 — 조(순번)만 화면에서 고칠 수 있고 나머지는 인사정보 그대로다 -->
          <TabsContent value="regular">
            <div class="lp-roster-toolbar">
              <SelectField v-model="regularTeam" :options="teamOptions" size="sm" trigger-class="w-25" aria-label="팀 선택" />
              <span class="group-gap2">
                <Button type="button" variant="secondary" size="xs" @click="openWorkerAddDialog('regular')">추가</Button>
                <Button type="button" variant="primary" size="xs" @click="onSave">저장</Button>
              </span>
            </div>
            <table class="lp-roster-table">
              <caption class="sr-only">일반근무자 목록 — 조, 계급, 성명, 배정횟수</caption>
              <colgroup>
                <col class="lp-roster-col-check">
                <col class="lp-roster-col-order">
                <col>
                <col>
                <col>
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">
                    <Checkbox
                      :model-value="allRegularChecked"
                      aria-label="일반근무자 전체 선택"
                      @update:model-value="(checked) => toggleAllRegular(!!checked)"
                    />
                  </th>
                  <th scope="col">조</th>
                  <th scope="col">계급</th>
                  <th scope="col">성명</th>
                  <th scope="col">배정횟수</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="worker in regularWorkers" :key="worker.id">
                  <td>
                    <Checkbox
                      :model-value="regularSelection.has(worker.id)"
                      :aria-label="`${worker.name} 선택`"
                      @update:model-value="(checked) => toggleSelection('regular', worker.id, !!checked)"
                    />
                  </td>
                  <td><InputField2 v-model="worker.group" size="sm" input-class="text-center" :aria-label="`${worker.name} 조`" /></td>
                  <td>{{ worker.rank }}</td>
                  <td>{{ worker.name }}</td>
                  <td>{{ worker.assignCount }}</td>
                </tr>
                <tr v-if="!regularWorkers.length">
                  <td class="lp-roster-empty" colspan="5">등록된 일반근무자가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </TabsContent>

          <!-- 자원근무자 -->
          <TabsContent value="volunteer">
            <div class="lp-roster-toolbar">
              <h3 class="lp-roster-title">자원근무자</h3>
              <span class="group-gap2">
                <Button type="button" variant="tertiary2" size="xs" @click="removeSelectedVolunteers">삭제</Button>
                <Button type="button" variant="secondary" size="xs" @click="volunteerAddOpen = true">추가</Button>
              </span>
            </div>
            <table class="lp-roster-table">
              <caption class="sr-only">자원근무자 목록 — 계급, 성명, 시작시간, 종료시간</caption>
              <colgroup>
                <col class="lp-roster-col-check">
                <col>
                <col>
                <col>
                <col>
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">
                    <Checkbox
                      :model-value="allVolunteerChecked"
                      aria-label="자원근무자 전체 선택"
                      @update:model-value="(checked) => toggleAllVolunteer(!!checked)"
                    />
                  </th>
                  <th scope="col">계급</th>
                  <th scope="col">성명</th>
                  <th scope="col">시작<br>시간</th>
                  <th scope="col">종료<br>시간</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="worker in volunteerWorkers" :key="worker.id">
                  <td>
                    <Checkbox
                      :model-value="volunteerSelection.has(worker.id)"
                      :aria-label="`${worker.name} 선택`"
                      @update:model-value="(checked) => toggleSelection('volunteer', worker.id, !!checked)"
                    />
                  </td>
                  <td>{{ worker.rank }}</td>
                  <td>{{ worker.name }}</td>
                  <td>{{ worker.startTime }}</td>
                  <td>{{ worker.endTime }}</td>
                </tr>
                <tr v-if="!volunteerWorkers.length">
                  <td class="lp-roster-empty" colspan="5">등록된 자원근무자가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </TabsContent>

          <!-- 사고자 -->
          <TabsContent value="incident">
            <div class="lp-roster-toolbar">
              <h3 class="lp-roster-title">사고자</h3>
              <span class="group-gap2">
                <Button type="button" variant="tertiary2" size="xs" @click="removeSelectedIncidents">삭제</Button>
                <Button type="button" variant="secondary" size="xs" @click="incidentAddOpen = true">추가</Button>
              </span>
            </div>
            <table class="lp-roster-table">
              <caption class="sr-only">사고자 목록 — 계급, 성명, 사유, 시작시간, 종료시간</caption>
              <colgroup>
                <col class="lp-roster-col-check">
                <col>
                <col>
                <col>
                <col>
                <col>
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">
                    <Checkbox
                      :model-value="allIncidentChecked"
                      aria-label="사고자 전체 선택"
                      @update:model-value="(checked) => toggleAllIncident(!!checked)"
                    />
                  </th>
                  <th scope="col">계급</th>
                  <th scope="col">성명</th>
                  <th scope="col">사유</th>
                  <th scope="col">시작<br>시간</th>
                  <th scope="col">종료<br>시간</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="worker in incidentWorkers" :key="worker.id">
                  <td>
                    <Checkbox
                      :model-value="incidentSelection.has(worker.id)"
                      :aria-label="`${worker.name} 선택`"
                      @update:model-value="(checked) => toggleSelection('incident', worker.id, !!checked)"
                    />
                  </td>
                  <td>{{ worker.rank }}</td>
                  <td>{{ worker.name }}</td>
                  <td>{{ worker.reason }}</td>
                  <td>{{ worker.startTime }}</td>
                  <td>{{ worker.endTime }}</td>
                </tr>
                <tr v-if="!incidentWorkers.length">
                  <td class="lp-roster-empty" colspan="6">등록된 사고자가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </TabsContent>
        </Tabs>
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="근무지정표">
        <template #actions>
          <Button type="button" variant="tertiary" size="sm" @click="onLoadSchedule">근무지정표 불러오기</Button>
          <Button type="button" variant="tertiary" size="sm" @click="onLoadWorkType">근무형태 불러오기</Button>
        </template>

        <!-- 시간대가 12칸이라 좁은 화면에서는 가로 스크롤로 본다 -->
        <div class="lp-schedule-scroll">
          <table class="lp-schedule-table">
            <caption class="sr-only">근무지정표 — 근무 구분별 시간대 배정 현황</caption>
            <thead>
              <tr>
                <th scope="col">근무</th>
                <th v-for="slot in timeSlots" :key="slot" scope="col">
                  <span class="lp-nowrap">{{ slot.split('~')[0] }}~</span>
                  <span class="lp-nowrap">{{ slot.split('~')[1] }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in scheduleRows" :key="row.id">
                <th scope="row">{{ row.label }}</th>
                <td v-for="(cell, idx) in row.cells" :key="idx" class="lp-schedule-cell">
                  <button
                    type="button"
                    class="lp-schedule-cell-btn"
                    :aria-label="`${row.label} ${timeSlots[idx]} 배정`"
                    @click="openAssignCell(row)"
                  >
                    <span
                      v-for="(name, ni) in cell"
                      :key="ni"
                      :class="row.type === 'fixed' ? 'lp-schedule-name' : undefined"
                    >{{ name }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="lp-notes-row">
          <span id="important-notes-label" class="lp-notes-label">중요지시사항</span>
          <div class="lp-notes-body">
            <TextareaField
              v-model="importantNotes"
              :height="72"
              aria-labelledby="important-notes-label"
            />
          </div>
        </div>
      </LayoutPanel>
    </template>
  </LayoutSplite>

  <WorkerAddDialog />
  <WorkManageDialog />
  <TimeManageDialog />
  <PatrolAreaDialog />
  <BulkPrintDialog />
  <WorkUserPickDialog />
  <KeyNoteDialog />
  <VolunteerAddDialog />
  <IncidentAddDialog />
  <ScheduleCopyDialog />
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import Icon from '@/components/custom/icon/Icon.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/custom/tabs'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import WorkerAddDialog from './components/WorkerAddDialog.vue'
import WorkManageDialog from './components/WorkManageDialog.vue'
import TimeManageDialog from './components/TimeManageDialog.vue'
import PatrolAreaDialog from './components/PatrolAreaDialog.vue'
import BulkPrintDialog from './components/BulkPrintDialog.vue'
import WorkUserPickDialog from './components/WorkUserPickDialog.vue'
import KeyNoteDialog from './components/KeyNoteDialog.vue'
import VolunteerAddDialog from './components/VolunteerAddDialog.vue'
import IncidentAddDialog from './components/IncidentAddDialog.vue'
import ScheduleCopyDialog from './components/ScheduleCopyDialog.vue'
import {
  useWorkSchedule,
  WorkScheduleKey,
  timeSlots,
  teamOptions,
  type ScheduleRow,
} from './composable/useWorkSchedule'

defineOptions({
  name: 'PcLpo0202',
})

// LNB: 근무일지 > 근무일지(甲) (프리셋은 2뎁스까지라 '근무지정표작성'이 아직 없다)
useSideMenuSetup({ ...localPoliceMenu, openIndex: 1, activeChild: '근무일지(甲)' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '근무일지' },
  { label: '근무일지(甲)' },
  { label: '근무지정표작성' },
]

const workSchedule = useWorkSchedule()
provide(WorkScheduleKey, workSchedule)

const {
  workDate,
  shift,
  regularWorkers,
  regularTeam,
  volunteerWorkers,
  incidentWorkers,
  scheduleRows,
  importantNotes,
  removeVolunteerWorkers,
  removeIncidentWorkers,
  shiftWorkDate,
  openWorkerAddDialog,

  // 팝업 열림 상태(PC-LPO-0205~0213) — useWorkScheduleDialogs 에서 온다
  workManageOpen,
  timeManageOpen,
  patrolAreaOpen,
  bulkPrintOpen,
  workUserPickOpen,
  keyNoteOpen,
  volunteerAddOpen,
  incidentAddOpen,
  scheduleCopyOpen,
} = workSchedule

const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })

/** 근무자 패널 탭 — 일반근무자 / 자원근무자(PC-LPO-0205) / 사고자(PC-LPO-0206) */
const workerTab = ref<'regular' | 'volunteer' | 'incident'>('regular')

/** 근무일의 요일 표시. 목업 날짜 문자열(2026.08.11.)에서 계산한다 */
const weekdayLabel = computed(() => {
  const [y, m, d] = workDate.value.replace(/\.$/, '').split('.').map(Number)
  if (!y || !m || !d) return ''
  return `${['일', '월', '화', '수', '목', '금', '토'][new Date(y, m - 1, d).getDay()]}요일`
})

const regularSelection = ref<Set<number>>(new Set())
const volunteerSelection = ref<Set<number>>(new Set())
const incidentSelection = ref<Set<number>>(new Set())

/** 템플릿에서 ref 를 그대로 넘기면 자동 언랩돼 Set 만 들어오므로 목록 종류로 받는다 */
function toggleSelection(kind: 'regular' | 'volunteer' | 'incident', id: number, checked: boolean) {
  const selection =
    kind === 'regular' ? regularSelection : kind === 'volunteer' ? volunteerSelection : incidentSelection
  // Set 은 제자리 수정이라 재할당해야 화면이 다시 그려진다
  const next = new Set(selection.value)
  if (checked) next.add(id)
  else next.delete(id)
  selection.value = next
}

const allRegularChecked = computed(
  () => regularWorkers.value.length > 0 && regularSelection.value.size === regularWorkers.value.length,
)
const allVolunteerChecked = computed(
  () => volunteerWorkers.value.length > 0 && volunteerSelection.value.size === volunteerWorkers.value.length,
)
const allIncidentChecked = computed(
  () => incidentWorkers.value.length > 0 && incidentSelection.value.size === incidentWorkers.value.length,
)

function toggleAllRegular(checked: boolean) {
  regularSelection.value = checked ? new Set(regularWorkers.value.map((w) => w.id)) : new Set()
}
function toggleAllVolunteer(checked: boolean) {
  volunteerSelection.value = checked ? new Set(volunteerWorkers.value.map((w) => w.id)) : new Set()
}
function toggleAllIncident(checked: boolean) {
  incidentSelection.value = checked ? new Set(incidentWorkers.value.map((w) => w.id)) : new Set()
}

function removeSelectedVolunteers() {
  if (!volunteerSelection.value.size) {
    toast.warning('삭제할 자원근무자를 선택해 주세요.')
    return
  }
  removeVolunteerWorkers(volunteerSelection.value)
  volunteerSelection.value = new Set()
  toast.success('삭제되었습니다.')
}

function removeSelectedIncidents() {
  if (!incidentSelection.value.size) {
    toast.warning('삭제할 사고자를 선택해 주세요.')
    return
  }
  removeIncidentWorkers(incidentSelection.value)
  incidentSelection.value = new Set()
  toast.success('삭제되었습니다.')
}

function resetScheduleGrid() {
  scheduleRows.value = scheduleRows.value.map((row) =>
    row.type === 'variable' ? { ...row, cells: row.cells.map((): string[] => []) } : row,
  )
  toast.success('甲지가 초기화되었습니다.')
}

function onLoadSchedule() {
  toast.success('근무지정표를 불러왔습니다.')
}

function onLoadWorkType() {
  toast.success('근무형태를 불러왔습니다.')
}

function onPrint() {
  window.print()
}

function onSave() {
  toast.success('저장되었습니다.')
}

/**
 * 근무지정표 셀 클릭 시 배정.
 * - 중점사항 행(variable)은 중점사항 입력 팝업(PC-LPO-0213)
 * - 그 외 근무 행(fixed)은 근무 사용자 선택 팝업(PC-LPO-0212)
 * Figma 에 어느 셀이 어느 팝업을 여는지는 그려져 있지 않아 행 유형으로 갈랐다.
 */
function openAssignCell(row: ScheduleRow) {
  if (row.type === 'variable') {
    keyNoteOpen.value = true
    return
  }
  workUserPickOpen.value = true
}

/**
 * 화면ID ↔ 팝업 상태 동기화(docs/create/tab-popup.md §4).
 * 화면ID 매핑(근무일지 화면정의서 기준):
 *   0202 근무지정표작성 · 0205 자원근무자 · 0206 사고자 · 0207 근무관리 ·
 *   0208 시간관리 · 0209 순찰구역 · 0211 甲지 일괄출력
 *
 * 뺀 화면ID — 특정 행/칸을 골라야만 열리는 팝업이라 URL 만으로는 무엇을 띄울지 모른다
 * (순방향·역방향이 조건을 공유하는 이 유틸로는 표현할 수 없다):
 *   0204 근무자 추가관리(어느 목록에 추가할지 target 이 필요) ·
 *   0210 순찰구역 상세(순찰구역 행) · 0212 근무 사용자 선택 · 0213 중점사항 입력(지정표 칸)
 * 라우트는 등록돼 있으므로 그 주소로 들어오면 팝업 없이 0202 화면이 뜬다.
 */
const screenTriggers: ScreenTriggerMap = {
  'PC-LPO-0202': [],
  'PC-LPO-0205': [[volunteerAddOpen, true]],
  'PC-LPO-0206': [[incidentAddOpen, true]],
  'PC-LPO-0207': [[workManageOpen, true]],
  'PC-LPO-0208': [[timeManageOpen, true]],
  'PC-LPO-0209': [[patrolAreaOpen, true]],
  'PC-LPO-0211': [[bulkPrintOpen, true]],
}
useAutoTrigger(screenTriggers)

useBottomTabSetup({
  value: 'PC-LPO-0202',
  label: '근무지정표작성',
  path: '/views/lpo/PC-LPO-0202',
  componentName: 'PcLpo0202',
  closable: true,
})
</script>
