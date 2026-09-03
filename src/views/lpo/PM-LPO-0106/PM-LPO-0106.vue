<template>
  <!-- 모바일 앱 헤더 (<768) -->
  <header :class="[styles.mHeader, styles.mobileOnly]">
    <button type="button" :class="styles.mHeaderBtn" aria-label="뒤로" @click="goBack">
      <Icon name="arrowLeft" :size="24" />
    </button>
    <h1 :class="styles.mHeaderTitle">알림</h1>
    <button type="button" :class="styles.mHeaderBtn" aria-label="메뉴" @click="onMenu">
      <Icon name="menu" :size="20" />
    </button>
  </header>

  <!-- PC 헤더 (≥768) -->
  <PageHeader :class="styles.pcOnly">
    <template #left>
      <PageTitle title="알림" />
    </template>
    <template #right>
      <span class="group-gap2">
      <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div :class="styles.listToolbar">
    <FilterChipGroup v-model="status" :items="statusItems" />
    <Button
      type="button"
      variant="tertiary2"
      size="sm"
      :class="styles.pcOnly"
      @click="onDeleteSelected"
    >
      선택 삭제
    </Button>
  </div>

  <!-- PC(≥768) 는 그리드, 모바일은 카드 — TabulatorGrid 가 폭을 보고 고른다.
       카드 구성(순서·제목)은 columns 의 card* 옵션에 있다 -->
  <TabulatorGrid
    ref="gridRef"
    class="flex-1"
    :columns="columns"
    :data="displayRows"
    select-mode="checkbox"
    height="100%"
    min-height="40rem"
    placeholder="알림이 없습니다"
    show-pagination
    :items-per-page="10"
    :card-class="cardClass"
    @card-click="onContentClick"
  />

  <!-- 모바일: 하단 고정 삭제 CTA -->
  <div :class="[styles.cta, styles.mobileOnly]">
    <Button type="button" variant="tertiary2" :class="styles.ctaBtn" @click="onDeleteSelected">삭제</Button>
  </div>

  <!-- 모바일: 맨 위로 -->
  <button
    type="button"
    :class="[styles.topBtn, styles.mobileOnly]"
    aria-label="맨 위로"
    @click="scrollTop"
  >
    <Icon name="arrowTop" :size="24" />
  </button>

  <NotificationDetailDialog v-model:open="detailDialogOpen" :row="detailRow" @delete="onDeleteOne" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import { Button } from '@/components/custom/button'
import Icon from '@/components/custom/icon/Icon.vue'
import { FilterChipGroup, type FilterChipItem } from '@/components/custom/filter-chip'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import NotificationDetailDialog from './components/NotificationDetailDialog.vue'
import { useNotificationList, type NotificationRow } from './composable/PM-LPO-0106'
import styles from './style/PM-LPO-0106.module.css'
import HelpButton from '@/components/custom/button/HelpButton.vue'
defineOptions({
  name: 'PmLpo0106',
})

const router = useRouter()

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '개인수첩' },
  { label: '알림' },
]

const { status, counts, displayRows, findRow, markRead, deleteRows } = useNotificationList()

/** 상태별 필터 칩 - 알림 개수 표시 + 선택 시 그 상태값으로 목록을 필터링 */
const statusItems = computed<FilterChipItem[]>(() => [
  { key: 'all', label: '전체', count: counts.value.all },
  { key: 'unread', label: '안읽음', count: counts.value.unread },
  { key: 'read', label: '읽음', count: counts.value.read },
])

/** 기획서: 내용은 첫줄 1줄만 표시, 길면 말줄임(css ellipsis) 처리 */
function contentPreview(row: NotificationRow) {
  return row.content.split(/\r?\n/)[0]
}

/** 내용 클릭 시 읽음 처리 + 상세 팝업 (PC-LPO-0701 의 장비관리명 링크 버튼 셀과 동일한 패턴) */
function onContentClick(row: NotificationRow) {
  markRead(row.id)
  detailRow.value = findRow(row.id)
  detailDialogOpen.value = true
}

const columns: TabulatorGridColumn[] = [
  // card* 옵션은 모바일 카드에서만 쓰인다(표에는 영향 없음)
  { title: '구분', field: 'category', width: 240, hozAlign: 'center', cardHeading: true },
  {
    title: '내용',
    field: 'content',
    hozAlign: 'left',
    cellType: 'button',
    buttonVariant: 'link',
    buttonSize: 'xxs',
    buttonClass: styles.contentBtn,
    buttonLabel: (row) => contentPreview(row as NotificationRow),
    onButtonClick: (row) => onContentClick(row as NotificationRow),
    // 카드에서는 상태·일시 다음에 내용 전문이 온다
    cardOrder: 3,
  },
  { title: '상태', field: 'statusLabel', width: 120, hozAlign: 'center', cardOrder: 1 },
  { title: '일시', field: 'date', width: 200, hozAlign: 'center', cardOrder: 2 },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

const detailDialogOpen = ref(false)
const detailRow = ref<NotificationRow | null>(null)

/** 읽은 알림은 카드만 회색으로 — PC 표의 행에는 적용되지 않아야 해서 row-class 가 아니라 card-class */
function cardClass(row: NotificationRow) {
  return row.read ? styles.cardRead : ''
}

/* 선택 상태는 표/카드 어느 쪽이든 TabulatorGrid 가 들고 있다(getSelectedData) */
function onDeleteSelected() {
  const ids = ((gridRef.value?.getSelectedData() ?? []) as NotificationRow[]).map((row) => row.id)
  if (!ids.length) {
    toast.warning('삭제할 알림을 선택해 주세요.')
    return
  }
  deleteRows(ids)
  toast.success('삭제되었습니다.')
}

function onDeleteOne(id: number) {
  deleteRows([id])
  toast.success('삭제되었습니다.')
}

/** 모바일 앱 헤더 - 뒤로가기 */
function goBack() {
  router.back()
}

/** 모바일 앱 헤더 - 햄버거 메뉴 (Figma 에 동작 미정의) */
function onMenu() {}

/** 모바일 - 맨 위로. WorkLayout 의 본문 스크롤 래퍼(.work-body)를 올린다 */
function scrollTop() {
  document.querySelector('.work-body')?.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * PM-LPO-0106 : 알림 목록만(팝업 닫힘)
 * PM-LPO-0107 : 알림 목록 + 상세 팝업(detailDialogOpen) 열림
 * URL만으로는 어떤 알림을 열지 알 수 없으므로(useAutoTrigger 의 알려진 한계), 직접 진입 시엔
 * 목록의 첫 번째 항목을 상세로 보여준다.
 */
const screenTriggers: ScreenTriggerMap = {
  'PM-LPO-0106': [[detailDialogOpen, false]],
  'PM-LPO-0107': [[detailDialogOpen, true]],
}
useAutoTrigger(screenTriggers)

if (!detailRow.value) detailRow.value = findRow(displayRows.value[0]?.id ?? -1)

useBottomTabSetup({
  value: 'PM-LPO-0106',
  label: '알림',
  path: '/views/lpo/PM-LPO-0106',
  componentName: 'PmLpo0106',
})
</script>
