<template>
  <PageHeader>
    <template #left>
      <PageTitle title="알림" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <div :class="styles.listToolbar">
    <FilterChipGroup v-model="status" :items="statusItems" />
    <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSelected">
      선택 삭제
    </Button>
  </div>

  <TabulatorGrid
    ref="gridRef"
    class="mt-5 flex-1"
    :columns="columns"
    :data="displayRows"
    select-mode="checkbox"
    height="100%"
    min-height="40rem"
    placeholder="알림이 없습니다"
    show-pagination
    :items-per-page="10"
  />

  <NotificationDetailDialog v-model:open="detailDialogOpen" :row="detailRow" @delete="onDeleteOne" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import { Button } from '@/components/custom/button'
import { FilterChipGroup, type FilterChipItem } from '@/components/custom/filter-chip'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useDialog } from '@/composable/dialog/dialog'
import NotificationDetailDialog from './components/NotificationDetailDialog.vue'
import { useNotificationList, type NotificationRow } from './composable/PM-LPO-0106'
import styles from './style/PM-LPO-0106.module.css'

defineOptions({
  name: 'PmLpo0106',
})

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰', path: '/lpo' },
  { label: '개인수첩', path: '/lpo' },
  { label: '알림' },
]

const { status, counts, displayRows, findRow, markRead, deleteRows } = useNotificationList()
const dialog = useDialog()

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
  { title: '구분', field: 'category', width: 240, hozAlign: 'center' },
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
  },
  { title: '상태', field: 'statusLabel', width: 120, hozAlign: 'center' },
  { title: '일시', field: 'date', width: 200, hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

const detailDialogOpen = ref(false)
const detailRow = ref<NotificationRow | null>(null)

async function onDeleteSelected() {
  const selected = (gridRef.value?.getSelectedData() ?? []) as NotificationRow[]
  if (!selected.length) {
    await dialog.alert({ title: '안내', description: '삭제할 항목을 선택해주세요.' })
    return
  }
  const { confirmed } = await dialog.confirm({
    title: '알림 삭제',
    description: '선택한 알림을 삭제하시겠습니까?',
  })
  if (!confirmed) return
  deleteRows(selected.map((row) => row.id))
}

function onDeleteOne(id: number) {
  deleteRows([id])
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
