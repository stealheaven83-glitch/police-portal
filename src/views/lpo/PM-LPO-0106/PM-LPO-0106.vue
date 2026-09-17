<template>
  <PageHeader>
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

  <div class="list-actions space-between">
    <FilterChipGroup v-model="status" :items="statusItems" />
    <Button
      type="button"
      variant="tertiary2"
      size="sm"
      padding="16"
      @click="onDeleteSelected"
    >
      선택 삭제
    </Button>
  </div>

  <!-- PC(≥768) 는 그리드, 모바일은 카드 — TabulatorGrid 가 폭을 보고 고른다.
       카드 구성(순서·제목)은 columns 의 card* 옵션에 있다.
       긴 알림은 줄바꿈해 전문을 보여주므로 행 높이가 내용만큼 늘어난다(lp-grid-multiline, PM-LPO-0223 과 같은 방식) -->
  <TabulatorGrid
    ref="gridRef"
    class="flex-1 lp-grid-multiline"
    :columns="columns"
    :data="displayRows"
    select-mode="checkbox"
    height="100%"
    min-height="40rem"
    placeholder="알림이 없습니다"
    show-pagination
    :items-per-page="10"
    :row-class="rowClass"
  />

  <!-- 알림메세지 상세 팝업(PM-LPO-0107) 삭제 — 내용 클릭으로 여는 동작이 없어졌다 -->
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDialog } from '@/composable/dialog/dialog'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import { Button } from '@/components/custom/button'
import { FilterChipGroup, type FilterChipItem } from '@/components/custom/filter-chip'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useNotificationList, type NotificationRow } from './composable/PM-LPO-0106'
import HelpButton from '@/components/custom/button/HelpButton.vue'
defineOptions({
  name: 'PmLpo0106',
})

const dialog = useDialog()

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '개인수첩' },
  { label: '알림' },
]

const { status, counts, displayRows, deleteRows } = useNotificationList()

/** 상태별 필터 칩 - 알림 개수 표시 + 선택 시 그 상태값으로 목록을 필터링 */
const statusItems = computed<FilterChipItem[]>(() => [
  { key: 'all', label: '전체', count: counts.value.all },
  { key: 'unread', label: '안읽음', count: counts.value.unread },
  { key: 'read', label: '읽음', count: counts.value.read },
])

const escapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** 셀을 HTML 문자열로 그리므로 알림 문구(꺾쇠 등)를 태그로 읽지 않게 막는다 */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => escapeMap[char])
}

/**
 * 내용은 링크가 아닌 텍스트 — 알림 문구의 줄바꿈을 그대로 살려 전문을 보여준다.
 * 시안 기준 816px 에서 줄을 접어야 해서 .lp-notice-text 로 감싼다(police-common.css).
 */
function contentFormatter(cell: any): string {
  const text = escapeHtml(String(cell.getValue() ?? '')).replace(/\r?\n/g, '<br>')
  return `<span class="lp-notice-text">${text}</span>`
}

const columns: TabulatorGridColumn[] = [
  // card* 옵션은 모바일 카드에서만 쓰인다(표에는 영향 없음)
  { title: '구분', field: 'category', width: 240, hozAlign: 'center', cardHeading: true },
  // 알림메세지 상세 팝업(PM-LPO-0107) 삭제 — 내용은 클릭하는 링크가 아니라 텍스트다.
  // 폭을 주지 않아 남는 폭을 전부 가져가고, 이 칸의 높이가 곧 행 높이가 된다(variableHeight)
  {
    title: '내용',
    field: 'content',
    hozAlign: 'left',
    variableHeight: true,
    formatter: contentFormatter,
    // 카드에서는 상태·일시 다음에 내용 전문이 온다
    cardOrder: 3,
  },
  { title: '상태', field: 'statusLabel', width: 120, hozAlign: 'center', cardOrder: 1 },
  { title: '일시', field: 'date', width: 200, hozAlign: 'center', cardOrder: 2 },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

/**
 * 읽은 알림은 행 배경을 회색(#E6E8EA)으로 — PC 표.
 * PC-LPO-0304 의 "확인이 끝난 행" 과 같은 의도·같은 색이라 공통 .lp-grid-done-row
 * (police-override.css) 를 그대로 쓴다.
 */
function rowClass(row: NotificationRow) {
  return row.read ? 'lp-grid-done-row' : undefined
}

/* 선택 상태는 표/카드 어느 쪽이든 TabulatorGrid 가 들고 있다(getSelectedData) */
async function onDeleteSelected() {
  const ids = ((gridRef.value?.getSelectedData() ?? []) as NotificationRow[]).map((row) => row.id)
  if (!ids.length) return
  const { confirmed } = await dialog.confirm({ title: '삭제 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!confirmed) return
  deleteRows(ids)
}

/* 알림메세지 상세 팝업(PM-LPO-0107) 삭제 — 팝업 열기 트리거와 팝업 안 단건 삭제도 함께 뺐다 */

useBottomTabSetup({
  value: 'PM-LPO-0106',
  label: '알림',
  path: '/views/lpo/PM-LPO-0106',
  componentName: 'PmLpo0106',
})
</script>
