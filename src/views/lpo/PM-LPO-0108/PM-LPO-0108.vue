<template>
  <PageHeader>
    <template #left>
      <PageTitle title="근무일정조회" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <MonthScheduleCalendar
    v-model:year="year"
    v-model:month="month"
    :days="days"
    :year-from="2020"
    :year-to="2030"
  >
    <template #day-detail="{ date, close }">
      <div class="lp-cal-popover-head">
        <span>{{ formatDay(date) }}</span>
        <!-- 2026-09-11 컴포넌트로 교체: button.lp-icon-btn -> Button variant="icon" -->
        <!-- 클릭 영역만 24 로 키운다. 아이콘 크기는 <Icon :size> 가 정한다 -->
        <Button variant="icon" size="24" aria-label="닫기" @click="close">
          <Icon name="closePop" :size="20" />
        </Button>
      </div>

      <ul v-if="dutiesOn(date).length" class="lp-cal-popover-list">
        <li v-for="(duty, i) in dutiesOn(date)" :key="i" class="lp-cal-popover-row">
          <Badge :color="KIND_COLOR[duty.kind]" variant="solid" size="md" shape="sm">{{ duty.kind }}</Badge>
          <span v-if="duty.time" class="lp-nowrap">{{ duty.time }}</span>
          <span v-if="duty.name" class="lp-nowrap">{{ duty.name }}</span>
          <!-- 기획서 2: 사고 건은 시간과 사유를 출력한다 (사유는 point 색) -->
          <span v-if="duty.reason" class="lp-cal-popover-reason">{{ duty.reason }}</span>
          <!-- 기획서 3: 자원근무 건은 근무자 뒤에 (자원) 을 붙인다 -->
          <span v-if="duty.members?.length" class="lp-flex-fill">
            {{ membersText(duty) }}<em v-if="duty.volunteer" class="lp-cal-popover-volunteer">(자원)</em>
          </span>
        </li>
      </ul>
      <p v-else class="lp-note-text">등록된 근무가 없습니다.</p>

      <div class="lp-cal-popover-foot">
        <Button type="button" variant="tertiary2" size="xs" padding="12" @click="close">닫기</Button>
      </div>
    </template>
  </MonthScheduleCalendar>
</template>

<script setup lang="ts">
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import MonthScheduleCalendar from '@/components/custom/calendar/MonthScheduleCalendar.vue'
import { Badge } from '@/components/custom/badge'
import Icon from '@/components/custom/icon/Icon.vue'
import { Button } from '@/components/custom/button'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useDutySchedule } from './composable/PM-LPO-0108'

defineOptions({
  name: 'PmLpo0108',
})

// LNB: 개인수첩 > 근무일정 조회
useSideMenuSetup({ ...localPoliceMenu, openIndex: 0, activeChild: '근무일정 조회' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '개인수첩' },
  { label: '근무일정조회' },
]

const { year, month, days, dutiesOn, formatDay, membersText, KIND_COLOR } = useDutySchedule()

useBottomTabSetup({
  value: 'PM-LPO-0108',
  label: '근무일정조회',
  path: '/views/lpo/PM-LPO-0108',
  componentName: 'PmLpo0108',
})
</script>
