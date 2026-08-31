<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import NotificationDetailDialog from './components/NotificationDetailDialog.vue'
import {
  useNotificationList,
  searchConditionOptions,
  statusOptions,
  type NotificationRow,
} from './composable/PM-LPO-0106'
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

const { searchForm, displayRows, search, findRow, markRead, deleteRows } = useNotificationList()

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

function onDeleteSelected() {
  const selected = (gridRef.value?.getSelectedData() ?? []) as NotificationRow[]
  if (!selected.length) {
    toast.warning('삭제할 알림을 선택해 주세요.')
    return
  }
  deleteRows(selected.map((row) => row.id))
  toast.success('삭제되었습니다.')
}

function onDeleteOne(id: number) {
  deleteRows([id])
  toast.success('삭제되었습니다.')
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

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="알림" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <SearchWrapper>
    <template #form>
      <div class="search-area">
        <SelectField
          v-model="searchForm.status"
          label="상태"
          :options="statusOptions"
          size="sm"
          triggerClass="w-35"
        />
        <SelectField
          v-model="searchForm.condition"
          label="검색조건"
          :options="searchConditionOptions"
          size="sm"
          triggerClass="w-35"
        />
        <InputField2
          v-model="searchForm.keyword"
          label="검색어"
          size="sm"
          inputClass="w-100"
          placeholder="검색어를 입력해주세요."
          @keyup.enter="search"
          clearable
        />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm" @click="search">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSelected">선택 삭제</Button>
  </div>

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
  />

  <NotificationDetailDialog v-model:open="detailDialogOpen" :row="detailRow" @delete="onDeleteOne" />
</template>
