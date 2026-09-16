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
    <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
  </div>

  <LayoutSplite :count="3" :widths="[24, 52, 24]"  :resizable="false">
    <!-- ── 부서 ─────────────────────────────── -->
    <template #layout-1>
      <LayoutPanel title="부서" no-padding >
        <template #actions>
          <Button type="button" variant="tertiary2" size="sm" @click="onDeptRemove" class="min-w-[40px]">삭제</Button>
          <Button type="button" variant="secondary" size="sm" @click="onDeptAdd" class="min-w-[40px]">추가</Button>
        </template>

        <div class="btn-tree">
          <Button type="button" variant="text" size="sm" @click="treeRef?.openAll()">
            <img src="/portal/asset/images/icon/ico_plus.svg" alt="" aria-hidden="true" />
            모두 확장
          </Button>
          <Button type="button" variant="text" size="sm" @click="treeRef?.closeAll()">
            <img src="/portal/asset/images/icon/ico_minus.svg" alt="" aria-hidden="true" />
            모두 축소
          </Button>
        </div>
        <div class="tree-scroll">
          <TreeView
            ref="treeRef"
            v-model="deptTree"
            :selected="selectedDept"
            show-icon
            :editing-node="editingDept"
            :draggable="false"
            @update:selected="onDeptSelected"
            @node-rename="onDeptRename"
            @node-rename-cancel="onDeptRenameCancel"
          />
        </div>
      </LayoutPanel>
    </template>

    <!-- ── 사용자목록 ───────────────────────── -->
    <template #layout-2>
      <LayoutPanel title="사용자목록" >
        <template #actions>
          <div class="group-gap2">
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
              clearable
            />
          </div>
        </template>

        <TabulatorGrid
          class="flex-1"
          :columns="userColumns"
          :data="users"
          select-mode="single"
          height="100%"
          placeholder="등록된 사용자가 없습니다."
          show-pagination
          :items-per-page="10"
          @row-selection-changed="onUserSelectionChanged"
        />
      </LayoutPanel>
    </template>

    <!-- ── 권한목록 ─────────────────────────── -->
    <template #layout-3>
      <LayoutPanel title="권한목록" >
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
            clearable
          />
        </template>

       
        <!-- 단순 체크 표 — 행 hover·체크 행 강조 없음(lp-grid-no-highlight, police-override.css) -->
        <TabulatorGrid
          ref="authGridRef"
          class="flex-1 lp-grid-no-highlight"
          :columns="authColumns"
          :data="auths"
          select-mode="checkbox"
          height="100%"
          placeholder="등록된 그룹이 없습니다."
          @row-selection-changed="onAuthSelectionChanged"
        />
      </LayoutPanel>
    </template>
  </LayoutSplite>

  <!-- 사용자목록의 아이디를 누르면 열린다(PC-COM-2202) -->
  <UserInfoDialog />
</template>


<script setup lang="ts">
import { nextTick, provide, ref, watch } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
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
  useUserDetail,
  UserManageKey,
  searchFieldOptions,
  type AuthRow,
  type DeptNode,
  type UserRow,
} from './composable/PC-COM-2201'
import UserInfoDialog from './components/UserInfoDialog.vue'


defineOptions({ name: 'PcCom2201' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '시스템관리' },
  { label: '시스템운영관리' },
  { label: '사용자권한관리' },
]

const dialog = useDialog()

/**
 * 패턴 A(CLAUDE.md §3) — 컴포저블을 이 화면에서 한 번만 만들어 provide 한다.
 * 사용자 정보 팝업(PC-COM-2202)은 UserManageKey 로 inject 해 같은 상태를 본다.
 */
const store = { ...useUserAuthManage(), ...useUserDetail() }
provide(UserManageKey, store)

const {
  deptTree,
  selectedDept,
  editingDept,
  createDeptNode,
  beginDeptEdit,
  commitDeptName,
  cancelDeptEdit,
  searchField,
  searchKeyword,
  users,
  selectedUser,
  searchUsers,
  selectUser,
  authKeyword,
  auths,
  checkedAuthCodes,
  openUserDetail,
} = store

const treeRef = ref<InstanceType<typeof TreeView> | null>(null)

/* ── 부서 트리 ────────────────────────────── */
/** TreeView 는 범용 TreeNode 를 넘기므로 이 화면의 DeptNode 로 좁혀 받는다 */
function onDeptSelected(node: TreeNode | null) {
  selectedDept.value = node as DeptNode | null
}

/**
 * 고른 부서 아래(고른 게 없으면 최상위)에 새 노드를 넣고 그 자리에 입력창을 연다.
 * 트리 구조 변경은 TreeView 를 거쳐야 화면에 반영된다(he-tree 가 데이터 배열을
 * deep 없이 감시해서, 배열을 직접 고치면 다시 그리지 않는다).
 */
function onDeptAdd() {
  const node = createDeptNode()
  treeRef.value?.addNode(node, selectedDept.value)
  beginDeptEdit(node)
}

/** 이름을 확정했을 때. 이름을 안 적고 빠져나가면 방금 만든 빈 노드를 도로 뺀다 */
function onDeptRename(node: TreeNode, name: string) {
  if (!commitDeptName(node as DeptNode, name)) treeRef.value?.removeNode(node)
}

function onDeptRenameCancel(node: TreeNode) {
  if (cancelDeptEdit(node as DeptNode)) treeRef.value?.removeNode(node)
}

async function onDeptRemove() {
  if (!selectedDept.value) {
    await dialog.alert({ title: '삭제할 부서를 선택해 주세요.', btnCancel: '확인' })
    return
  }

  const result = await dialog.confirm({
    title: `'${selectedDept.value.name}' 부서를 삭제하시겠습니까?`,
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  treeRef.value?.removeNode(selectedDept.value)
  selectedDept.value = null
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

/* ── 사용자목록 ───────────────────────────── */
const userColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  {
    title: '사용자ID',
    field: 'userId',
    hozAlign: 'center',
    // 버튼 텍스트가 곧 셀 값이다 — 눌러서 그 사용자의 정보 팝업(PC-COM-2202)을 연다.
    // 권한 목록은 행을 골랐을 때 채워진다(select-mode="single").
    cellType: 'button',
    buttonVariant: 'link',
    buttonSize: 'xxs',
    buttonClass: 'underline',
    buttonLabel: (row) => String((row as UserRow).userId),
    onButtonClick: (row) => openUserDetail(row as UserRow),
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

/**
 * 고른 사용자가 이미 가진 권한을 그리드 체크로 보여준다.
 * 그리드가 다시 그려진 뒤에 맞춰야 해서 nextTick 을 기다리고,
 * 권한 조회어로 목록이 좁혀질 때도 체크가 남도록 auths 변화에도 다시 맞춘다.
 */
async function syncAuthChecks() {
  await nextTick()
  authGridRef.value?.selectWhere((row) => checkedAuthCodes.value.includes((row as AuthRow).code))
}

watch([selectedUser, auths], syncAuthChecks)

/* ── 저장 ─────────────────────────────────── */
async function onSave() {
  const result = await dialog.confirm({
    title: '저장하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  // TODO: API 연동 (선택 사용자 + checkedAuthCodes 전송)
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
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
