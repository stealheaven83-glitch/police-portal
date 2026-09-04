<template>
  <PageHeader>
    <template #left>
      <PageTitle title="조사예약" />
    </template>
    <template #right>
      <div class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </div>
    </template>
  </PageHeader>

  <!--
    시안은 이 줄이 달력 툴바(연/월 이동·월간/주간·범례) 오른쪽에 같이 놓여 있다.
    Calendar 가 자기 툴바를 통째로 갖고 있고 JS 컴포넌트라 슬롯에 타입이 잡히지 않아,
    같은 항목을 달력 바로 위 줄로 뺐다.
  -->
  <div class="list-actions">
    <SelectField
      v-model="searchOffice"
      label="관할청"
      label-class="sr-only"
      :options="officeOptions"
      size="sm"
      trigger-class="w-37"
      placeholder="관할청 선택"
    />
    <SelectField
      v-model="searchCenter"
      label="센터"
      label-class="sr-only"
      :options="centerOptions"
      size="sm"
      trigger-class="w-37"
      placeholder="센터 선택"
    />
    <Button type="button" variant="primary" size="sm" @click="openCreate">조사예약하기</Button>
  </div>

  <!--
    월간(PM-PUB-0405) · 주간(PC-PUB-0406) 은 달력 안의 토글이라 화면이 하나다.
    연/월 이동·보기 전환·예약처리상황 범례는 Calendar 가 이미 갖고 있다.
  -->
  <Calendar class="lp-page-scroll" @event-click="openDetail" />

  <ReservationCreateDialog />
  <ReservationDetailDialog />
</template>

<script setup lang="ts">
import { provide } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { Button } from '@/components/custom/button'
import Calendar from '@/components/custom/calendar/calendar.vue'
import ReservationCreateDialog from './components/ReservationCreateDialog.vue'
import ReservationDetailDialog from './components/ReservationDetailDialog.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  useReservationCalendar,
  ReservationCalendarKey,
  officeOptions,
  centerOptions,
} from './composable/PM-PUB-0405'
// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(§5)
defineOptions({ name: 'PmPub0405' })

/*
 * LNB: publicSafetyMenu items[3] = '해바라기센터'.
 * ⚠ 프리셋 children 에 '조사예약' 이 아직 없다 — 시안 라벨을 그대로 넣어 뒀고
 *   프리셋 배치 등록 시 확인이 필요하다(CLAUDE.md §5 ③).
 */
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 3, activeChild: '조사예약' })

// '/pub' 은 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '해바라기센터' },
  { label: '조사예약' },
]

/* 팝업 2개(등록 PC-PUB-0408 / 상세 PC-PUB-0407)가 같은 상태를 쓰도록 여기서 한 번만 만든다 */
const store = useReservationCalendar()
provide(ReservationCalendarKey, store)
const { searchOffice, searchCenter, openCreate, openDetail } = store

useBottomTabSetup({
  value: 'PM-PUB-0405',
  label: '조사예약',
  path: '/views/pub/PM-PUB-0405',
  componentName: 'PmPub0405',
  closable: true,
})
</script>
