<template>
  <PageHeader>
    <template #left>
      <PageTitle title="출동수당 취합(월별)" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div>
    <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
      <template #department>
        <span class="dept-name">부서</span>
        <DepartmentCascadeSelect v-model="department" size="sm" />
      </template>
      <template #form>
        <div class="search-area">
          <!-- 연·월 셀렉트 사이만 12(시안 14071:97951) — 조회조건 사이 36 과 다르다 -->
          <span class="group-gap3">
            <SelectField label="근무월" v-model="workYearStr" :options="yearOptions" size="sm" trigger-class="w-30" />
            <SelectField v-model="workMonthStr" :options="monthOptions" size="sm" trigger-class="w-25" aria-label="근무월의 월" />
          </span>
          <SelectField label="신청자" v-model="applicant" :options="applicantOptions" size="sm" trigger-class="w-30" />
          <SelectField label="신청구분" v-model="applyType" :options="applyTypeOptions" size="sm" trigger-class="w-30" />
        </div>
      </template>
      <template #btns>
        <Button variant="secondary" size="sm">조회</Button>
      </template>
    </SearchWrapper>
  </div>

  <div class="list-actions space-between">
    <div class="lp-count-row">
      <p>요청갯수 : <b class="lp-hit lp-em-strong">{{ requestCount }}</b></p>
      <Button type="button" variant="tertiary2" size="sm" @click="otherApplyOpen = true">타직원 출동수당 신청목록</Button>
    </div>
    <div class="group-gap3">
      <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
        <Download :size="16" aria-hidden="true" />
        엑셀다운로드
      </Button>
      <Button type="button" variant="tertiary2" size="sm" padding="16" @click="approveOpen = true">승인관리</Button>
    </div>
  </div>

  <!--
    출동수당 승인자 — 시안 13092:99695, 케이스는 13092:100022(샘플: /component/search-area).
    이름 뒤 상태는 승인일 → 미승인 → 승인 버튼 순으로 하나만. '출동수당 승인' 은 onApprove(컨펌 → 알림)
  -->
  <!-- ⚠ 임시: 케이스 A~D 를 한꺼번에 보는 v-for 래퍼. 확인 후 래퍼를 지우고 approverCase.approvers → approvers,
       제목은 '출동수당 승인자' 로 되돌린다(composable 의 approverCases 도 같이 삭제) -->
  <template v-for="approverCase in approverCases" :key="approverCase.title">
    <!-- 결재자가 지정돼야 노출된다(기획) — 목업은 지정된 상태로 시작한다(시안 13092:99695) -->
    <div v-if="approverCase.approvers.length" class="approver-bar">
      <h2 class="approver-bar-title">출동수당 승인자 ({{ approverCase.title }})</h2>
      <div class="approver-bar-list">
        <template v-for="(approver, i) in approverCase.approvers" :key="approver.label">
          <span v-if="i > 0" class="lp-divider-v approver-bar-divider" aria-hidden="true"></span>
          <div class="approver-bar-item">
            <span>{{ approver.label }}</span>
            <b class="approver-bar-name">{{ approver.name }}</b>
            <span v-if="approver.approvedAt" class="approver-bar-done">{{ approver.approvedAt }} 승인</span>
            <span v-else-if="approver.unapproved" class="approver-bar-status">미승인</span>
            <Button v-else-if="approver.canApprove" type="button" variant="secondary" size="xs" padding="12" @click="onApprove(approverCase.approvers, i)">출동수당 승인</Button>
          </div>
        </template>
      </div>
    </div>
  </template>

  <TabulatorGrid
    ref="gridRef"
    class="flex-1"
    :columns="columns"
    :data="gridRows"
    height="100%"
    min-height="40rem"
    placeholder="조회된 출동수당 취합 내역이 없습니다"
    :items-per-page="10"
  />

  <ApproveManageDialog @saved="onApproversSaved" />
  <ApproveCancelDialog />
  <OtherApplyDialog />
  <DispatchInfoDialog />
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  useDispatchSummaryMonthly,
  yearOptions,
  monthOptions,
  applicantOptions,
  applyTypeOptions,
  type Approver,
} from './composable/PC-LPO-0505'
import { useDialog } from '@/composable/dialog/dialog'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import ApproveManageDialog from './components/ApproveManageDialog.vue'
import ApproveCancelDialog from './components/ApproveCancelDialog.vue'
import OtherApplyDialog from './components/OtherApplyDialog.vue'
import DispatchInfoDialog from './components/DispatchInfoDialog.vue'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
import { useDispatchSummaryDialogs, DispatchSummaryDialogKey } from './composable/dialogs'
defineOptions({ name: 'PcLpo0505' })

useSideMenuSetup({ ...localPoliceMenu, openIndex: 3, activeChild: '승인관리' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '출동수당' },
  { label: '출동수당 취합(월별)' },
]

/** 이 화면에서 열리는 팝업(PC-LPO-0506~0510)들의 상태 — 팝업 컴포넌트가 inject 한다 */
const dialogs = useDispatchSummaryDialogs()
provide(DispatchSummaryDialogKey, dialogs)
const { approveOpen, cancelOpen, otherApplyOpen, dispatchInfoOpen } = dialogs

const {
  department,
  advancedSearchOpen,
  workYear,
  workMonth,
  applicant,
  applyType,
  days,
  rows,
  requestCount,
  approverCases, // ⚠ 임시 — 케이스 확인 후 approvers 로 되돌린다
  assignApprovers,
  approveDispatchAllowance,
} = useDispatchSummaryMonthly()

/** 승인관리 팝업에서 결재자를 저장하면 승인자 줄이 그 사람들로 바뀐다(기획 1번) */
function onApproversSaved({ teamLeader, chief }: { teamLeader: string; chief: string }) {
  assignApprovers(teamLeader, chief)
}

const workYearStr = computed({
  get: () => String(workYear.value),
  set: (v: string) => (workYear.value = Number(v)),
})
const workMonthStr = computed({
  get: () => String(workMonth.value),
  set: (v: string) => (workMonth.value = Number(v)),
})

/** 근무월이 바뀌면 그 달의 일수만큼 컬럼도 다시 생성된다(28~31일 가변). 폭은 시안 12795:88774 */
const columns = computed<TabulatorGridColumn[]>(() => [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '부서', field: 'dept', width: 280, hozAlign: 'center' },
  { title: '팀', field: 'team', width: 60, hozAlign: 'center', headerSort: true },
  { title: '직급성명', field: 'rankName', width: 100, hozAlign: 'center' },
  { title: '생년월일', field: 'birthDate', width: 110, hozAlign: 'center' },
  { title: '총 출동건수', field: 'totalCount', width: 80, hozAlign: 'center' },
  {
    title: '계',
    columns: [
      { title: '범죄명', field: 'category', width: 90, hozAlign: 'center' },
      { title: '건수', field: 'count', width: 70, hozAlign: 'center' },
    ],
  },
  {
    title: '근무일자',
    columns: Array.from({ length: days.value }, (_, i) => ({
      title: String(i + 1),
      field: `day${i + 1}`,
      width: 60,
      hozAlign: 'center' as const,
    })),
  },
])

/** days 배열(월별 일수만큼)을 day1, day2 ... 필드로 펼쳐야 그리드 컬럼과 매칭된다 */
const gridRows = computed(() =>
  rows.value.map((row) => {
    const dayFields: Record<string, number> = {}
    row.days.forEach((value, i) => (dayFields[`day${i + 1}`] = value))
    return { ...row, ...dayFields }
  }),
)

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `출동수당취합_월별_${today}.csv`)
}

const dialog = useDialog()

/**
 * 승인자 줄의 '출동수당 승인' — 컨펌 뒤 버튼 자리가 'YYYY-MM-DD HH:mm 승인' 으로 바뀌고(케이스 B → C),
 * 1차(지구대/파출소)가 끝나면 2차(경찰서 과장)의 '미승인' 이 승인 버튼으로 바뀐다(기획 4·5번, 상태 전이는 composable).
 */
async function onApprove(list: Approver[], index: number) {
  // 사용자 지정: 승인 컨펌창[A13] — CLAUDE.md §4 기본(alert 만)과 다르지만 요청대로 따름
  const { confirmed } = await dialog.confirm({
    title: '출동수당 승인 처리를 하겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!confirmed) return
  approveDispatchAllowance(list, index)
  await dialog.alert({ title: '승인 되었습니다.', btnCancel: '확인' })
}

const screenTriggers: ScreenTriggerMap = {
  'PC-LPO-0505': [],
  'PC-LPO-0506': [[approveOpen, true]],
  'PC-LPO-0508': [[cancelOpen, true]],
  'PC-LPO-0509': [[otherApplyOpen, true]],
  'PC-LPO-0510': [[dispatchInfoOpen, true]],
}
useAutoTrigger(screenTriggers);

useBottomTabSetup({
  value: 'PC-LPO-0505',
  label: '출동수당취합(월별)',
  path: '/views/lpo/PC-LPO-0505',
  componentName: 'PcLpo0505',
  closable: true,
})
</script>
