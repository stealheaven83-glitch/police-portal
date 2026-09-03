<template>
  <GenericDialog2
    v-model:open="open"
    title="부서 조회"
    :size="800"
    :show-close-button="true"
  >
    <!-- 검색줄 — 시안 입력 608px + 조회 버튼 100px -->
    <div class="pc-lpo-0801-dept-search">
      <InputField2
        v-model="keyword"
        size="sm"
        class="!space-y-0 pc-lpo-0801-dept-keyword"
        input-class="w-full"
        label="부서 조회어"
        label-class="sr-only"
        placeholder="부서 조회"
      />
      <Button type="button" variant="secondary" size="sm" class="w-25" @click="onSearch">조회</Button>
    </div>

    <!-- 부서(트리) / 부서 정보(표) 2분할 — 시안 300 : 414 -->
    <div class="pc-lpo-0801-dept-panes">
      <section class="pc-lpo-0801-dept-pane pc-lpo-0801-dept-pane-tree" aria-labelledby="dept-tree-heading">
        <h3 id="dept-tree-heading" class="pc-lpo-0801-dept-pane-title">부서</h3>
        <div class="pc-lpo-0801-dept-tree">
          <TreeView
            v-model="deptTree"
            :selected="selectedNode"
            show-icon
            tree-line
            :draggable="false"
            @update:selected="onNodeSelected"
          />
        </div>
      </section>

      <section class="pc-lpo-0801-dept-pane" aria-labelledby="dept-info-heading">
        <h3 id="dept-info-heading" class="pc-lpo-0801-dept-pane-title">부서 정보</h3>
        <TabulatorGrid
          v-model:data="infoRows"
          :columns="infoColumns"
          height="27.5rem"
          :row-class="(row: any) => (isActiveRow(row) ? 'pc-lpo-0801-dept-active-row' : undefined)"
          placeholder="부서 정보가 없습니다"
          @row-click="onInfoRowClick"
        />
      </section>
    </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="open = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onConfirm">확인</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Button } from '@/components/custom/button'
import { TreeView, type TreeNode } from '@/components/custom/tree'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useDialog } from '@/composable/dialog/dialog'
import {
  createDeptTree,
  createDeptInfoRows,
  type DeptInfoRow,
} from '../composable/PC-LPO-0801'

defineOptions({ name: 'DeptSearchDialog' })

/**
 * 부서 조회 팝업 (PC-LPO-0802).
 * 인사관리(PC-LPO-0801)의 전입 전출 현황에서 전부서/전출부서를 고를 때 열린다.
 * 부모가 여닫고 고른 값만 받아가도록, 상태를 provide 하지 않고 v-model + emit 으로만 주고받는다.
 */
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  /** '확인' 으로 고른 부서 (관서 + 부서) */
  (e: 'select', value: DeptInfoRow): void
}>()

const dialog = useDialog()

const keyword = ref('')
const deptTree = ref<TreeNode[]>(createDeptTree() as TreeNode[])
const infoRows = ref<DeptInfoRow[]>(createDeptInfoRows())

/** 좌측 트리에서 고른 노드 */
const selectedNode = ref<TreeNode | null>(null)
/** 우측 표에서 고른 행 — '확인' 이 넘기는 값 */
const activeRow = ref<DeptInfoRow | null>(infoRows.value[1] ?? null)

const infoColumns: TabulatorGridColumn[] = [
  { title: '소속관서', field: 'station', hozAlign: 'center' },
  { title: '소속부서', field: 'dept', hozAlign: 'center' },
]

function isActiveRow(row: DeptInfoRow) {
  return (
    !!activeRow.value &&
    row.station === activeRow.value.station &&
    row.dept === activeRow.value.dept
  )
}

/** 목업이라 트리 선택은 표시만 바꾼다 — 실제로는 그 부서의 하위 목록을 조회해 온다 */
function onNodeSelected(node: TreeNode | null) {
  selectedNode.value = node
}

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onInfoRowClick(_e: Event, row: any) {
  activeRow.value = (typeof row?.getData === 'function' ? row.getData() : row) as DeptInfoRow
}

function onSearch() {
  // TODO: API 연동. 지금은 목업이라 조회 결과가 바뀌지 않는다
}

async function onConfirm() {
  if (!activeRow.value) {
    await dialog.alert({ title: '부서를 선택해 주세요.', btnCancel: '확인' })
    return
  }
  emit('select', { ...activeRow.value })
  open.value = false
}
</script>
