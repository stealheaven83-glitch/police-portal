<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent
      class="px-6 pt-6 pb-[3.2rem] gap-0"
      :style="{ width: 'calc(100% - 20px)', maxWidth: '520px' }"
    >
      <AlertDialogHeader class="flex justify-end flex-row">
        <button type="button" @click="handleCancel">
          <img :src="closeIcon" alt="닫기 버튼" />
        </button>
      </AlertDialogHeader>
      <div class="text-center mb-4">
        <AlertDialogTitle class="text-[2.4rem] font-[700]">{{ title }}</AlertDialogTitle>
        <p v-if="subtitle" class="mt-2 text-[1.5rem] text-[var(--Text-body_2)]">
          {{ subtitle }}
        </p>
      </div>
      <div ref="leftTableEl" class="tabulator-host" />
      <AlertDialogFooter class="justify-center sm:justify-center mt-4">
        <Button variant="tertiary2" size="md" class="w-25" @click="handleCancel">
          {{ btnCancel ?? '닫기' }}
        </Button>
        <Button variant="primary" size="md" class="w-25" @click="handleConfirm">
          {{ btnOk ?? '저장' }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick, onBeforeUnmount, createApp, h, type App, type Ref } from 'vue'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator.min.css'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import closeIcon from '@/assets/icon/icon_popup_x.svg?url'
import { Button } from '@/components/custom/button'
import { Checkbox as CustomCheckbox } from '@/components/custom/checkbox'

defineProps<{
  title: string
  subtitle?: string
  btnOk?: string
  btnCancel?: string
}>()

const open = ref(false)
const leftTableEl = ref<HTMLElement | null>(null)
let table: any = null

let onConfirmCallback: ((value: any) => void) | null = null
let onCancelCallback: (() => void) | null = null

// TODO: API 연동 전까지 사용하는 더미 데이터
const dummyWorkers = [
  { id: 1, name: '김철수', dept: '경비과', position: '경위' },
  { id: 2, name: '이영희', dept: '수사과', position: '경사' },
  { id: 3, name: '박민수', dept: '교통과', position: '순경' },
  { id: 4, name: '정지훈', dept: '경비과', position: '경장' },
  { id: 5, name: '최유리', dept: '생활안전과', position: '경위' },
]

// '추가여부' 컬럼: custom/checkbox(Checkbox.vue)를 각 행 셀에 실제로 마운트해
// Tabulator의 행 선택 상태와 양방향으로 동기화한다.
const rowCheckboxRegistry = new Map<any, { app: App; state: Ref<boolean> }>()

function rowCheckboxFormatter(cell: any) {
  const row = cell.getRow()
  const container = document.createElement('div')
  container.classList.add('grid-checkbox-cell')
  container.addEventListener('click', (e) => e.stopPropagation())

  const state = ref(row.isSelected())

  const app = createApp({
    render: () =>
      h(CustomCheckbox, {
        modelValue: state.value,
        'onUpdate:modelValue': (val: boolean | 'indeterminate') => {
          const next = val === true
          state.value = next
          next ? row.select() : row.deselect()
        },
      }),
  })
  app.mount(container)
  rowCheckboxRegistry.set(row, { app, state })

  return container
}

// 행 클릭 등 체크박스 외의 경로로 선택 상태가 바뀔 때도 체크박스 표시를 맞춰준다
function syncRowCheckboxes() {
  rowCheckboxRegistry.forEach((entry, row) => {
    entry.state.value = row.isSelected()
  })
}

function unmountRowCheckbox(row: any) {
  const entry = rowCheckboxRegistry.get(row)
  if (entry) {
    entry.app.unmount()
    rowCheckboxRegistry.delete(row)
  }
}

// AlertDialogContent는 Portal 기반이라 open이 true가 되기 전에는
// leftTableEl이 DOM에 존재하지 않는다. 그래서 onMounted가 아니라
// open이 true로 바뀐 뒤(nextTick으로 DOM 렌더를 기다린 다음) 초기화한다.
watch(open, async (isOpen) => {
  if (!isOpen || table) return

  await nextTick()
  if (!leftTableEl.value) return

  table = new Tabulator(leftTableEl.value, {
    data: dummyWorkers,
    layout: 'fitColumns',
    height: '260px',
    selectableRows: true,
    columnDefaults: { headerSort: false },
    columns: [
      {
        title: '추가여부',
        formatter: rowCheckboxFormatter,
        hozAlign: 'center',
        headerSort: false,
        width: 80,
        frozen: true,
      },
      { title: '계급', field: 'position', minWidth: 100 },
      { title: '성명', field: 'name', minWidth: 120 },
      { title: '관서장', hozAlign: 'center', minWidth: 90 },
    ],
  })

  // 체크박스가 아닌 경로(행 클릭 등)로 선택이 바뀌어도 표시를 동기화
  table.on('rowSelectionChanged', () => {
    syncRowCheckboxes()
  })
  // 행이 없어질 때 마운트해둔 체크박스 Vue 앱 정리
  table.on('rowDeleted', (row: any) => {
    unmountRowCheckbox(row)
  })
})

onBeforeUnmount(() => {
  table?.destroy()
  rowCheckboxRegistry.forEach((entry) => entry.app.unmount())
  rowCheckboxRegistry.clear()
})

defineExpose({
  openDialog: () => {
    open.value = true
    const chainableAPI = {
      onOk(callback: (value: any) => void) {
        onConfirmCallback = callback
        return chainableAPI
      },
      onCancel(callback: () => void) {
        onCancelCallback = callback
        return chainableAPI
      },
    }
    return chainableAPI
  },
  closeDialog: () => {
    onConfirmCallback = null
    onCancelCallback = null
    open.value = false
  },
})

function handleConfirm() {
  const selected = table?.getSelectedData() ?? []
  onConfirmCallback?.(selected)
  open.value = false
}

function handleCancel() {
  onCancelCallback?.()
  open.value = false
}
</script>

<style scoped>
:deep(.grid-checkbox-cell) {
  display: flex;
  justify-content: center;
}
</style>
