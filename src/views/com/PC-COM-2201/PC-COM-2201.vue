<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import { TreeView, type TreeNode } from '@/components/custom/tree'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  useUserAuthManage,
  searchFieldOptions,
  type AuthRow,
  type DeptNode,
  type UserRow,
} from './composable/PC-COM-2201'
import styles from './style/PC-COM-2201.module.css'

// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!)
// BottomTabItem.componentName 과 일치해야 하고, 다른 화면과 겹치면 캐시가 뒤섞인다.
defineOptions({ name: 'PcCom2201' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '시스템관리' },
  { label: '시스템운영관리' },
  { label: '사용자권한관리' },
]

const dialog = useDialog()
const {
  deptTree,
  selectedDept,
  addDept,
  removeDept,
  searchField,
  searchKeyword,
  users,
  searchUsers,
  selectUser,
  authKeyword,
  auths,
  checkedAuthCodes,
} = useUserAuthManage()

const treeRef = ref<InstanceType<typeof TreeView> | null>(null)

/* ── 부서 트리 ────────────────────────────── */
/** TreeView 는 범용 TreeNode 를 넘기므로 이 화면의 DeptNode 로 좁혀 받는다 */
function onDeptClick(node: TreeNode) {
  selectedDept.value = node as DeptNode
}

async function onDeptRemove() {
  if (!selectedDept.value) {
    await dialog.alert({ title: '삭제할 부서를 선택해 주세요.', btnCancel: '확인' })
    return
  }

  const result = await dialog.confirm({
    title: `'${selectedDept.value.name}' 부서를 삭제하시겠습니까?`,
    description: '하위 부서도 함께 삭제됩니다.',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  removeDept(selectedDept.value)
  selectedDept.value = null
}

/* ── 사용자목록 ───────────────────────────── */
const userColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  {
    title: '사용자ID',
    field: 'userId',
    hozAlign: 'center',
    // 버튼 텍스트가 곧 셀 값이다 — 눌러서 그 사용자의 권한을 불러온다
    cellType: 'button',
    buttonVariant: 'link',
    buttonSize: 'xxs',
    buttonLabel: (row) => String((row as UserRow).userId),
    onButtonClick: (row) => selectUser(row as UserRow),
  },
  { title: '계급', field: 'rank', hozAlign: 'center' },
  { title: '성명', field: 'name', hozAlign: 'center' },
  { title: '소속관서', field: 'agency', hozAlign: 'center', widthGrow: 2 },
  { title: '소속부서', field: 'dept', hozAlign: 'center', widthGrow: 2 },
  { title: '사용여부', field: 'use', hozAlign: 'center' },
]

/**
 * select-mode="single" 이라 선택 행은 0건 아니면 1건이다.
 * @row-selection-changed 는 데이터가 아니라 Tabulator RowComponent 배열을 넘긴다(CLAUDE.md §6) —
 * row.getData() 로 꺼낸다.
 */
function onUserSelectionChanged(selected: any[]) {
  const row = selected[0]
  const data = row ? ((typeof row.getData === 'function' ? row.getData() : row) as UserRow) : null
  selectUser(data)
}

/* ── 권한목록 ─────────────────────────────── */
const authColumns: TabulatorGridColumn[] = [{ title: '권한명', field: 'name' }]
const authGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

/** @row-selection-changed 는 데이터가 아니라 Tabulator RowComponent 배열을 넘긴다(CLAUDE.md §6) */
function onAuthSelectionChanged(selected: any[]) {
  checkedAuthCodes.value = selected.map((row) => (typeof row.getData === 'function' ? row.getData() : row) as AuthRow).map((auth) => auth.code)
}

/* ── 저장 ─────────────────────────────────── */
function onSave() {
  // TODO: API 연동 (선택 사용자 + checkedAuthCodes 전송)
  toast.success('저장되었습니다.')
}

// 사이드메뉴(시스템 관리 LNB) 설정 — 활성 항목은 라우트 경로로 자동 매칭된다
useSideMenuSetup('systemAdmin')

// 탭 추가 및 활성화
useBottomTabSetup({
  value: 'PC-COM-2201',
  label: '사용자 권한관리',
  path: '/views/com/PC-COM-2201',
  componentName: 'PcCom2201',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="사용자 권한관리" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <div class="list-actions">
    <Button type="button" variant="primary" size="sm" class="w-25" @click="onSave">저장</Button>
  </div>

  <LayoutSplite :count="3" :widths="[24, 52, 24]" :class="styles.split">
    <!-- ── 부서 ─────────────────────────────── -->
    <template #layout-1>
      <LayoutPanel title="부서">
        <template #actions>
          <Button type="button" variant="tertiary2" size="sm" @click="onDeptRemove">삭제</Button>
          <Button type="button" variant="secondary" size="sm" @click="addDept">추가</Button>
        </template>

        <div class="btn-tree">
          <Button type="button" variant="text" size="sm" @click="treeRef?.openAll()">
            모두 확장
          </Button>
          <Button type="button" variant="text" size="sm" @click="treeRef?.closeAll()">
            모두 축소
          </Button>
        </div>
          <TreeView
            ref="treeRef"
            v-model="deptTree"
            :class="styles.tree"
            :draggable="false"
            @node-click="onDeptClick"
          />
      </LayoutPanel>
    </template>

    <!-- ── 사용자목록 ───────────────────────── -->
    <template #layout-2>
      <LayoutPanel title="사용자목록">
        <template #actions>
          <div :class="styles.panelSearch">
            <SelectField
              v-model="searchField"
              :options="searchFieldOptions"
              size="sm"
              trigger-class="w-30"
              class="!space-y-0"
              label="사용자 조회 기준"
              label-position="top"
              label-class="sr-only"
            />
            <InputField2
              v-model="searchKeyword"
              size="sm"
              input-class="w-50"
              class="!space-y-0"
              placeholder="사용자 조회"
              label="사용자 조회어"
              label-class="sr-only"
              :icon="'/portal/asset/images/icon/ico_seach_black_20.svg'"
              icon-class="size-6"
              icon-label="사용자 조회"
              search
              @icon-click="searchUsers"
              @keyup.enter="searchUsers"
            />
          </div>
        </template>

        <TabulatorGrid
          class="flex-1"
          :columns="userColumns"
          :data="users"
          select-mode="single"
          height="100%"
          placeholder="등록된 사용자가 없습니다"
          show-pagination
          :items-per-page="10"
          @row-selection-changed="onUserSelectionChanged"
        />
      </LayoutPanel>
    </template>

    <!-- ── 권한목록 ─────────────────────────── -->
    <template #layout-3>
      <LayoutPanel title="권한목록">
        <template #actions>
          <InputField2
            v-model="authKeyword"
            size="sm"
            input-class="w-40"
            class="!space-y-0"
            placeholder="권한 조회"
            label="권한 조회어"
            label-class="sr-only"
            :icon="'/portal/asset/images/icon/ico_seach_black_20.svg'"
            icon-class="size-6"
            icon-label="권한 조회"
            search
          />
        </template>

        <!-- 맨 앞 체크박스 열과 전체선택 헤더는 select-mode="checkbox" 가 만들어준다 -->
        <TabulatorGrid
          ref="authGridRef"
          class="flex-1"
          :columns="authColumns"
          :data="auths"
          select-mode="checkbox"
          height="100%"
          placeholder="조회된 권한이 없습니다"
          @row-selection-changed="onAuthSelectionChanged"
        />
      </LayoutPanel>
    </template>
  </LayoutSplite>
</template>
