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

  <div class="lp-row-between">
    <span class="group-gap2">
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </span>
  </div>

  <div class="lp-row-between lp-table-gap">
    <span class="group-gap2">
      <span class="lp-label-text">근무일</span>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="이전 달" @click="shiftMonth(-1)">
        <Icon name="arrowLeft" :size="18" />
      </Button>
      <span class="lp-heading-md">{{ month }}</span>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="다음 달" @click="shiftMonth(1)">
        <Icon name="arrowNext" :size="18" />
      </Button>
    </span>
    <span class="group-gap2">
      <Button type="button" variant="tertiary2" size="sm" @click="openApply('incident')">사고신청</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="openApply('volunteer')">자원근무신청</Button>
      <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
    </span>
  </div>

  <div class="lp-page-scroll">
    <table v-for="group in groups" :key="group.title" class="lp-duty-table">
      <caption class="sr-only">{{ group.title }} 근무현황</caption>
      <colgroup>
        <col class="lp-duty-col-date">
        <col span="4">
        <col class="lp-duty-col-side">
        <col class="lp-duty-col-side">
      </colgroup>
      <thead>
        <tr>
          <th scope="col" rowspan="2">일자</th>
          <th scope="colgroup" colspan="4">{{ group.title }}</th>
          <th scope="col" rowspan="2">자원근무자</th>
          <th scope="col" rowspan="2">사고자</th>
        </tr>
        <tr>
          <th scope="col">주</th>
          <th scope="col">야</th>
          <th scope="col">휴</th>
          <th scope="col">비</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="day in group.days" :key="day.label">
          <th scope="row">{{ day.label }}</th>
          <td>
            <p v-for="(e, i) in day.day" :key="i" class="lp-duty-line">
              <span class="lp-nowrap">{{ e.time }}</span>
              <b class="lp-em-primary">{{ e.work }}</b>
              <span class="lp-em-primary">{{ e.team }}</span>
              <span>{{ e.names }}</span>
            </p>
          </td>
          <td>
            <p v-for="(e, i) in day.night" :key="i" class="lp-duty-line">
              <span class="lp-nowrap">{{ e.time }}</span>
              <b class="lp-em-danger">{{ e.work }}</b>
              <span class="lp-em-primary">{{ e.team }}</span>
              <span>{{ e.names }}</span>
            </p>
          </td>
          <td>
            <p v-for="(e, i) in day.off" :key="i" class="lp-duty-line">
              <span class="lp-em-primary">{{ e.team }}</span>
              <span>{{ e.name }}</span>
            </p>
          </td>
          <td>
            <p v-for="(e, i) in day.standby" :key="i" class="lp-duty-line">
              <span class="lp-em-primary">{{ e.team }}</span>
              <span>{{ e.name }}</span>
            </p>
          </td>
          <td>
            <p v-for="v in day.volunteers" :key="v.id" class="lp-duty-line">
              <span class="lp-nowrap">{{ v.time }}</span>
              <b class="lp-em-primary">{{ v.type }}</b>
              <span>{{ v.name }}</span>
              <button
                type="button"
                class="lp-duty-remove"
                aria-label="자원근무 취소"
                @click="removeVolunteer(day, v.id)"
              >
                <Icon name="closePop" :size="14" />
              </button>
            </p>
          </td>
          <td>
            <p v-for="inc in day.incidents" :key="inc.id" class="lp-duty-line">
              <span>{{ inc.name }}</span>
              <span class="lp-em-danger">{{ inc.reason }}</span>
              <span v-if="inc.time" class="lp-nowrap">{{ inc.time }}</span>
              <button
                type="button"
                class="lp-duty-remove"
                aria-label="사고 취소"
                @click="removeIncident(day, inc.id)"
              >
                <Icon name="closePop" :size="14" />
              </button>
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <DutyApplyDialog
    v-model:open="applyOpen"
    :title="applyKind === 'incident' ? '사고신청' : '자원근무신청'"
    :form="applyForm"
    @save="onApplySave"
  />
</template>

<script setup lang="ts">
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { Button } from '@/components/custom/button'
import Icon from '@/components/custom/icon/Icon.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import DutyApplyDialog from './components/DutyApplyDialog.vue'
import { useDutyStatus } from './composable/PC-LPO-0216'
import { useDialog } from '@/composable/dialog/dialog'

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
  month,
  groups,
  applyOpen,
  applyKind,
  applyForm,
  openApply,
  shiftMonth,
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

async function onSave() {
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PC-LPO-0216',
  label: '근무현황',
  path: '/views/lpo/PC-LPO-0216',
  componentName: 'PcLpo0216',
  closable: true,
})
</script>
