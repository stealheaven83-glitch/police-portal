<template>
  <PageHeader>
    <template #left>
      <PageTitle title="근무현황" />
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
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </template>
  </SearchWrapper>

  <div class="list-actions space-between">
    <div class="lp-date-select-row">
      <TextSelect v-model="year" :options="yearOptions" size="xlarge" aria-label="근무연도" class="lp-date-select" />
      <TextSelect v-model="month" :options="monthOptions" size="xlarge" aria-label="근무월" class="lp-date-select" />
    </div>
    <div class="group-gap3">
      <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
        <Download :size="16" aria-hidden="true" />
        엑셀다운로드
      </Button>
      <Button type="button" variant="secondary" size="sm" @click="openApply('incident')">사고신청</Button>
      <Button type="button" variant="secondary" size="sm" @click="openApply('volunteer')">자원근무신청</Button>
    </div>
  </div>

  <!-- 한 칸에 여러 줄(사고자·자원근무자)이 들어가 Tabulator 대신 마크업 표.
       lp-duty-scroll 이 남은 높이를 채워 머리글은 고정, 본문만 스크롤 -->
  <div class="lp-duty-scroll">
    <table class="lp-duty-table">
      <caption class="sr-only">{{ year }}년 {{ month }}월 사고자·자원근무자 근무현황</caption>
      <colgroup>
        <col class="lp-duty-col-date">
        <template v-for="shift in shiftColumns" :key="shift.key">
          <col>
          <col class="lp-duty-col-side">
        </template>
      </colgroup>
      <thead>
        <tr>
          <th scope="col" rowspan="2">일자</th>
          <th v-for="shift in shiftColumns" :key="shift.key" scope="colgroup" colspan="2" class="lp-duty-group">
            {{ shift.label }}
          </th>
        </tr>
        <tr>
          <template v-for="shift in shiftColumns" :key="shift.key">
            <th scope="col">사고자</th>
            <th scope="col">자원근무자</th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="day in days" :key="day.label">
          <!-- 토·일만 색이 다르다 — th 자체 색 규칙보다 span 이 이기게 안에 감싼다 -->
          <th scope="row">
            <span :class="{ 'lp-em-primary': day.dow === 6, 'lp-em-point': day.dow === 0 }">{{ day.label }}</span>
          </th>
          <template v-for="shift in shiftColumns" :key="shift.key">
            <td>
              <p v-for="inc in day[shift.key].incidents" :key="inc.id" class="lp-duty-line lp-duty-entry">
                <span class="lp-em-medium" :class="inc.range === '전일' ? 'lp-em-point' : 'lp-em-primary'">{{ inc.range }}</span>
                <span>{{ inc.name }}</span>
                <span class="lp-em-warning">{{ inc.reason }}</span>
                <span v-if="inc.time" class="lp-nowrap">{{ inc.time }}</span>
                <button
                  type="button"
                  class="lp-duty-remove"
                  aria-label="사고 취소"
                  @click="removeIncident(day, shift.key, inc.id)"
                >
                  <Icon name="deleteCircle" :size="20" />
                </button>
              </p>
            </td>
            <td>
              <p v-for="v in day[shift.key].volunteers" :key="v.id" class="lp-duty-line lp-duty-entry">
                <span class="lp-nowrap">{{ v.time }}</span>
                <span>{{ v.name }}</span>
                <button
                  type="button"
                  class="lp-duty-remove"
                  aria-label="자원근무 취소"
                  @click="removeVolunteer(day, shift.key, v.id)"
                >
                  <Icon name="deleteCircle" :size="20" />
                </button>
              </p>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>

  <IncidentApplyDialog
    v-if="applyKind === 'incident'"
    v-model:open="applyOpen"
    @apply="onIncidentApply"
  />
  <DutyApplyDialog
    v-else
    v-model:open="applyOpen"
    title="자원근무신청"
    :form="applyForm"
    @save="onApplySave"
  />
</template>

<script setup lang="ts">
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import TextSelect from '@/components/custom/select/TextSelect.vue'
import { Button } from '@/components/custom/button'
import Icon from '@/components/custom/icon/Icon.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import DutyApplyDialog from './components/DutyApplyDialog.vue'
import IncidentApplyDialog, { type IncidentApplyForm } from './components/IncidentApplyDialog.vue'
import { useDutyStatus, shiftColumns, yearOptions, monthOptions } from './composable/PC-LPO-0216'
import { useDialog } from '@/composable/dialog/dialog'
import type { TabulatorGrid } from '@/components/custom/tabulator/index.ts'
import { Download } from "lucide-vue-next";
import { ref } from 'vue'

const dialog = useDialog()

defineOptions({
  name: 'PcLpo0216',
})

// LNB: 근무일지 > 근무일지(甲) (프리셋은 2뎁스까지라 '근무현황'이 아직 없다 — §5 ③)
useSideMenuSetup({ ...localPoliceMenu, openIndex: 1, activeChild: '근무일지(甲)' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '근무일지' },
  { label: '근무일지(甲)' },
  { label: '근무현황' },
]

const {
  department,
  year,
  month,
  days,
  applyOpen,
  applyKind,
  applyForm,
  openApply,
  removeVolunteer,
  removeIncident,
} = useDutyStatus()

async function onApplySave() {
  if (!applyForm.value.name || !applyForm.value.reason) {
    await dialog.alert({ title: '필수 항목을 입력해 주세요.', btnCancel: '확인' })
    return
  }
  if (applyForm.value.range === 'part' && (!applyForm.value.startTime || !applyForm.value.endTime)) {
    await dialog.alert({ title: '시작·종료 시간을 선택해 주세요.', btnCancel: '확인' })
    return
  }
  await dialog.alert({ title: '신청되었습니다.', btnCancel: '확인' })
  applyOpen.value = false
}

async function onIncidentApply(_form: IncidentApplyForm) {
  await dialog.alert({ title: '신청하였습니다.', btnCancel: '확인' })
  applyOpen.value = false
}



useBottomTabSetup({
  value: 'PC-LPO-0216',
  label: '근무현황',
  path: '/views/lpo/PC-LPO-0216',
  componentName: 'PcLpo0216',
  closable: true,
})

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `출동수당취합_월별_${today}.csv`)
}
</script>
