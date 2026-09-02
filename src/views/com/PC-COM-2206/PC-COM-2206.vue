<template>
  <PageHeader>
    <template #left>
      <PageTitle title="코드 관리" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div class="list-actions space-between">
    <InputField2
      v-model="keyword"
      label="코드조회"
      size="sm"
      input-class="w-60"
      class=""
      :icon="searchIcon"
      icon-class="size-5"
      icon-label="검색"
      search
    />
    <Button type="button" variant="primary" size="sm" class="w-25" @click="onSave">저장</Button>
  </div>

  <LayoutSplit :count="2" :widths="[33, 67]" :min-widths="[25, 40]" :resizable="false">
    <template #layout-1>
      <LayoutPanel title="상위코드">
        <template #actions>
          <Button type="button" variant="tertiary2" size="sm" class="w-25" @click="onDeleteSelectedParents">선택삭제</Button>
          <Button type="button" variant="secondary" size="sm" class="w-25" @click="onAddParent">추가</Button>
        </template>

        <TabulatorGrid
          ref="parentGridRef"
          v-model:data="parentRows"
          :columns="parentColumns"
          select-mode="checkbox"
          :table-options="selectByCheckboxOnly"
          class="flex-1"
          height="100%"
          placeholder="등록된 상위코드가 없습니다"
          @row-click="onParentRowClick"
          @row-selection-changed="selectedParentCount = $event.length"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="하위코드">
        <template #actions>
          <Button type="button" variant="tertiary2" size="sm" class="w-25" @click="onDeleteSelectedChildren">선택삭제</Button>
          <Button type="button" variant="secondary" size="sm" class="w-25" @click="onAddChild">추가</Button>
        </template>

        <TabulatorGrid
          ref="childGridRef"
          v-model:data="childRows"
          :columns="childColumns"
          select-mode="checkbox"
          :table-options="selectByCheckboxOnly"
          class="flex-1"
          height="100%"
          placeholder="등록된 하위코드가 없습니다"
          @row-selection-changed="selectedChildCount = $event.length"
        />
      </LayoutPanel>
    </template>
  </LayoutSplit>
</template>


<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDialog } from '@/composable/dialog/dialog'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import LayoutSplit from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { systemAdminMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useCodeManagement, type CodeParentRow } from './composable/PC-COM-2206'


defineOptions({ name: 'PcCom2206' })

// presets.ts items[0] = '시스템 운영 관리', 그 children 의 '코드관리'(104~107행)
useSideMenuSetup({ ...systemAdminMenu, openIndex: 0, activeChild: '코드관리' })

// '/com' 은 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '시스템관리' },
  { label: '시스템운영관리' },
  { label: '코드관리' },
]

const {
  keyword,
  parentRows,
  activeParentKey,
  childRows,
  selectParent,
  createParentRow,
  createChildRow,
} = useCodeManagement()

/*
 * 성공·경고 피드백을 toast 가 아니라 알림창(AlertDialog2)으로 낸다.
 * CLAUDE.md §7 의 기본값은 toast 지만 사용자 지정이고, 같은 시스템관리 메뉴의
 * PC-COM-2201·PC-COM-2203 도 같은 문구를 dialog.alert 로 내고 있어 결이 맞는다.
 */
const dialog = useDialog()

const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'

/*
 * "선택은 체크박스로만" — 행 아무 데나 클릭해도 체크가 들어가는 것을 막는다.
 *
 * Tabulator 는 selectableRows 가 true 면 행 엘리먼트에 클릭 리스너를 걸어 선택을 토글한다
 * (SelectRow.js initializeRow: `selectableRows && != "highlight"` 일 때 addEventListener).
 * 그대로 두면 상위코드 행을 눌러 하위코드를 보기만 해도 그 행이 체크돼서,
 * 체크를 안 했는데도 "삭제할 코드를 선택해 주세요" 가 안 뜨고 방금 본 행이 지워진다.
 *
 * 'highlight' 로 두면 그 클릭 리스너만 안 걸리고, 체크박스가 부르는 row.select()/deselect()
 * 와 getSelectedRows()·rowSelectionChanged 는 그대로 동작한다.
 * (select-mode="checkbox" 의 체크박스 컬럼은 그대로 붙는다 — tableOptions 가 생성자에서
 *  마지막에 병합돼 selectableRows 만 덮어쓴다)
 */
const selectByCheckboxOnly = { selectableRows: 'highlight' }

const parentGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const childGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedParentCount = ref(0)
const selectedChildCount = ref(0)

const parentColumns: TabulatorGridColumn[] = [
  { title: '상위코드', field: 'name', hozAlign: 'center' },
  { title: '공통코드', field: 'code', cellType: 'input', hozAlign: 'center' },
]

const childColumns: TabulatorGridColumn[] = [
  { title: '공통코드', field: 'code', cellType: 'input', hozAlign: 'center' },
  { title: '코드명', field: 'name', cellType: 'input', hozAlign: 'center' },
  { title: '코드설명', field: 'description', cellType: 'input', hozAlign: 'center' },
  { title: '순번', field: 'sortOrder', width: 90, cellType: 'input', hozAlign: 'center' },
  { title: '사용', field: 'use', width: 100, cellType: 'switch', hozAlign: 'center' },
]

/*
 * 코드조회는 목업 배열을 걸러내는 화면단 동작이라 퍼블 범위다(CLAUDE.md 범위표).
 * v-model:data 로 물린 원본 배열을 건드리지 않으려고 그리드의 setFilter 를 쓴다 —
 * 걸러낸 배열을 :data 로 넘기면 인라인 편집 결과를 원본에 되돌릴 수 없다.
 */
watch(keyword, (next) => {
  const grid = parentGridRef.value
  if (!grid) return
  const word = next.trim()
  if (!word) {
    grid.clearFilter()
    return
  }
  grid.setFilter((row: CodeParentRow) => row.code.includes(word) || row.name.includes(word))
})

function onAddParent() {
  parentGridRef.value?.addRow(createParentRow(), true)
}

async function onDeleteSelectedParents() {
  if (!selectedParentCount.value) {
    await dialog.alert({ title: '삭제할 코드를 선택해 주세요.', btnCancel: '확인' })
    return
  }
  // 사용자 지정: 삭제 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 삭제)
  const result = await dialog.confirm({ title: '삭제하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  parentGridRef.value?.deleteSelected()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

async function onAddChild() {
  if (activeParentKey.value == null) {
    await dialog.alert({ title: '상위코드를 먼저 선택해 주세요.', btnCancel: '확인' })
    return
  }
  childGridRef.value?.addRow(createChildRow(), true)
}

async function onDeleteSelectedChildren() {
  if (!selectedChildCount.value) {
    await dialog.alert({ title: '삭제할 코드를 선택해 주세요.', btnCancel: '확인' })
    return
  }
  // 사용자 지정: 삭제 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 삭제)
  const result = await dialog.confirm({ title: '삭제하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  childGridRef.value?.deleteSelected()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

async function onSave() {
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
}

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onParentRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as CodeParentRow
  selectParent(data.rowKey)
}

useBottomTabSetup({
  value: 'PC-COM-2206',
  label: '코드관리',
  path: '/views/com/PC-COM-2206',
  componentName: 'PcCom2206',
  closable: true,
})
</script>
 