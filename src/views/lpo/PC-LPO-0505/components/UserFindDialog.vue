<template>
  <GenericDialog2 v-model:open="userFindOpen" title="사용자 찾기" :size="720">
    <div class="search-area">
      <InputField2
        v-model="userKeyword"
        size="sm"
        placeholder="사용자 검색"
        class="lp-flex-fill"
        aria-label="사용자 검색"
        @keyup.enter="onSearch"
      />
      <Button type="button" variant="secondary" size="sm" @click="onSearch">조회</Button>
    </div>

    <LayoutSplite :count="2" class="lp-table-gap">
      <template #layout-1>
        <LayoutHeader title="부서" />
        <div class="lp-pane-box">
          <TreeView v-model="tree" v-model:selected="selectedDept" show-icon tree-line />
        </div>
      </template>
      <template #layout-2>
        <LayoutHeader title="사용자 정보">
          <template #right>
            <span class="lp-meta-nowrap">총 <b class="lp-em-primary">{{ userRows.length }}건</b></span>
          </template>
        </LayoutHeader>
        <TabulatorGrid
          ref="gridRef"
          :columns="columns"
          :data="userRows"
          height="300px"
          selectable
          placeholder="조회된 사용자가 없습니다"
          @row-click="onRowClick"
          @table-built="onTableBuilt"
        />
      </template>
    </LayoutSplite>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="userFindOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutHeader from '@/components/custom/content-layout/layoutHeader.vue'
import { TreeView, type TreeNode } from '@/components/custom/tree'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { DispatchSummaryDialogKey, type UserRow } from '../composable/dialogs'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/** 사용자 찾기 팝업(PC-LPO-0507) — 부서 트리에서 고르고 오른쪽 목록에서 사람을 고른다 */
const store = inject(DispatchSummaryDialogKey)!
const { userFindOpen, userKeyword, userDeptTree, userRows, pickedUserNo, approveChief } = store

const tree = ref<TreeNode[]>(userDeptTree as unknown as TreeNode[])
const selectedDept = ref<TreeNode | null>(null)

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const { onTableBuilt } = useDialogGridRedraw(gridRef)

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', hozAlign: 'center', minWidth: 60, widthGrow: 1 },
  { title: '계급', field: 'rank', hozAlign: 'center', minWidth: 70, widthGrow: 1 },
  { title: '성명', field: 'name', hozAlign: 'center', minWidth: 80, widthGrow: 1 },
  { title: '소속관서', field: 'office', hozAlign: 'center', minWidth: 140, widthGrow: 2 },
  { title: '소속부서', field: 'dept', hozAlign: 'center', minWidth: 140, widthGrow: 2 },
]

function onRowClick(_event: unknown, row: { getData: () => UserRow }) {
  pickedUserNo.value = row.getData().no
}

async function onSearch() {
  await dialog.alert({ title: '조회되었습니다.', btnCancel: '확인' })
}

async function onSave() {
  const picked = userRows.value.find((u) => u.no === pickedUserNo.value)
  if (!picked) {
    await dialog.alert({ title: '사용자를 선택해 주세요.', btnCancel: '확인' })
    return
  }
  approveChief.value = `${picked.rank} ${picked.name}`
  userFindOpen.value = false
}
</script>
