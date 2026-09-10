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
  <SearchWrapper>
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department4Search" size="sm" />
    </template>
    <template #topRightSection>
      <div class="search-btns">
        <div class="group-gap2">
          <Button type="button" variant="tertiary2" size="sm" @click="bulkPrintOpen = true">甲지 일괄 출력</Button>
          <Button type="button" variant="tertiary2" size="sm" @click="onPrint">인쇄</Button>
        </div>
      </div>
    </template>
  </SearchWrapper>


  <div class="list-actions">
    <div class="calendar-area">
      <span class="lp-label-text">근무일</span>
      <div class="calendar-area-date">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="이전 근무일" @click="shiftWorkDate(-1)">
          <Icon name="arrowLeft" :size="18" />
        </Button>
        <span class="calendar-area-date-value">
          {{ workDate }}
          <Icon name="calendar" :size="24" aria-hidden="true" />
        </span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="다음 근무일" @click="shiftWorkDate(1)">
          <Icon name="arrowNext" :size="18" />
        </Button>
      </div>
      <span class="calendar-area-divider" aria-hidden="true" />
      <span class="lp-heading-md">{{ weekdayLabel }}</span>
      <span class="calendar-area-divider" aria-hidden="true" />
      <RadioGroup v-model="shift" class="calendar-area-options">
        <RadioGroupItem value="day" label="주" />
        <RadioGroupItem value="night" label="야" />
      </RadioGroup>
    </div>

    <!-- 오른쪽 버튼은 .list-actions 직속이다 — 래퍼의 gap 이 .list-actions 와 같아 겉포장이 필요 없다 -->
    <Button type="button" variant="tertiary2" size="sm" @click="resetScheduleGrid">甲지 초기화</Button>
    <Button type="button" variant="tertiary2" size="sm" @click="patrolAreaOpen = true">순찰구역</Button>
    <Button type="button" variant="tertiary2" size="sm" @click="scheduleCopyOpen = true">교대복구</Button>
    <Button type="button" variant="tertiary2" size="sm" @click="timeManageOpen = true">시간관리</Button>
    <Button type="button" variant="secondary" size="sm" @click="workManageOpen = true">근무관리</Button>
    <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
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
                <Button type="button" variant="secondary" size="xs" padding="19" @click="openWorkerAddDialog('regular')">추가</Button>
                <Button type="button" variant="primary" size="xs" padding="19" @click="onSave">저장</Button>
              </span>
            </div>

            <TabulatorGrid
              ref="regularGridRef"
              class="flex-1"
              :columns="regularColumns"
              :data="regularWorkers"
              height="100%"
              min-height="30rem"
              placeholder="등록된 일반근무자가 없습니다."
            />
          </TabsContent>

          <!-- 자원근무자 -->
          <TabsContent value="volunteer">
            <div class="lp-roster-toolbar">
              <h3 class="lp-roster-title">자원근무자</h3>
              <span class="group-gap2">
                <Button type="button" variant="tertiary2" size="xs" padding="19" @click="removeSelectedVolunteers">삭제</Button>
                <Button type="button" variant="secondary" size="xs" padding="19" @click="volunteerAddOpen = true">추가</Button>
              </span>
            </div>
             <TabulatorGrid
              ref="volunteerGridRef"
              class="flex-1"
              :columns="volunteerColumns"
              :data="volunteerWorkers"
              height="100%"
              min-height="30rem"
              placeholder="등록된 자원근무자가 없습니다."
            />
          </TabsContent>

          <!-- 사고자 -->
          <TabsContent value="incident">
            <div class="lp-roster-toolbar">
              <h3 class="lp-roster-title">사고자</h3>
              <span class="group-gap2">
                <Button type="button" variant="tertiary2" size="xs" padding="19" @click="removeSelectedIncidents">삭제</Button>
                <Button type="button" variant="secondary" size="xs" padding="19" @click="incidentAddOpen = true">추가</Button>
              </span>
            </div>
    
             <TabulatorGrid
              ref="incidentGridRef"
              class="flex-1"
              :columns="incidentColumns"
              :data="incidentWorkers"
              height="100%"
              min-height="30rem"
              placeholder="등록된 사고자가 없습니다."
            />
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

        <TabulatorGrid
          ref="incidentGridRef"
          class="flex-1"
          :columns="scheduleColumns"
          :data="scheduleRows"
          height="100%"
          min-height="30rem"
          placeholder="등록된 근무지정표가 없습니다."
          @row-click="onScheduleCellClick"
        />

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
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import ScrollWrapper from '@/components/custom/ScrollWrapper.vue'
import {
  TabulatorGrid,
} from "@/components/custom/tabulator";
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
  teamOptions,
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
  regularColumns,
  regularWorkers,
  regularTeam,
  volunteerColumns,
  volunteerWorkers,
  incidentColumns,
  incidentWorkers,
  scheduleColumns,
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
  volunteerAddOpen,
  incidentAddOpen,
  scheduleCopyOpen,
} = workSchedule

const department4Search = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })

/** 검색줄 우측 수정 이력 표시 — 목업 */
const modifiedInfo = '수정일 : 2024-09-01 [홍길동]'

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

function onScheduleCellClick() {
  workUserPickOpen.value = true
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
