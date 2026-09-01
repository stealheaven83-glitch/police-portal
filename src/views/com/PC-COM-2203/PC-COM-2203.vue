<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import { Button } from '@/components/custom/button'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import { TreeView, type TreeNode } from '@/components/custom/tree'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { systemAdminMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useMenuManage, channelOptions, type MenuNode, type MenuRow } from './composable/PC-COM-2203'

// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!)
// BottomTabItem.componentName 과 일치해야 하고, 다른 화면과 겹치면 캐시가 뒤섞인다.
defineOptions({ name: 'PcCom2203' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '시스템관리' },
  { label: '시스템운영관리' },
  { label: '메뉴관리' },
]

const dialog = useDialog()
const { menuTree, selectedMenu, selectMenu, addMenuNode, removeMenuNode, rows, createEmptyRow } =
  useMenuManage()

const treeRef = ref<InstanceType<typeof TreeView> | null>(null)
const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

/* ── 메뉴 트리 ────────────────────────────── */
/** TreeView 는 범용 TreeNode 를 넘기므로 이 화면의 MenuNode 로 좁혀 받는다 */
function onMenuSelected(node: TreeNode | null) {
  selectMenu(node as MenuNode | null)
}

/* ── 메뉴 편집 ────────────────────────────── */
/**
 * 메뉴 속성은 별도 상세 화면 없이 셀에서 바로 편집한다.
 * cellType 이 custom/ 공용 컴포넌트(Input · SelectField · Switch)를 셀에 그대로 마운트해준다.
 *
 * 상위메뉴·메뉴ID 는 시스템이 정하는 값이라 읽기 전용 텍스트로 둔다.
 */
const columns: TabulatorGridColumn[] = [
  { title: '상위메뉴', field: 'parent', hozAlign: 'center' },
  { title: '메뉴ID', field: 'menuId', hozAlign: 'center' },
  { title: '메뉴명', field: 'name', cellType: 'input', widthGrow: 2 },
  {
    title: '채널구분',
    field: 'channel',
    cellType: 'select',
    selectOptions: channelOptions,
    hozAlign: 'center',
  },
  { title: '순번', field: 'sort', cellType: 'input', hozAlign: 'center', width: 100 },
  { title: '사용', field: 'use', cellType: 'switch', hozAlign: 'center', width: 90 },
  { title: '경로', field: 'path', cellType: 'input', widthGrow: 2 },
]

async function onAdd() {
  if (!selectedMenu.value) {
    await dialog.alert({ title: '상위 메뉴를 먼저 선택해 주세요.', btnCancel: '확인' })
    return
  }
  gridRef.value?.addRow(createEmptyRow(), false)
}

async function onDeleteSelected() {
  if (!selectedCount.value) {
    await dialog.alert({ title: '삭제할 메뉴를 선택해 주세요.', btnCancel: '확인' })
    return
  }

  // 되돌릴 수 없는 동작이라 지우기 전에 한 번 묻는다
  const result = await dialog.confirm({
    title: '선택한 메뉴를 삭제하시겠습니까?',
    description: '삭제한 메뉴는 되돌릴 수 없습니다.',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  gridRef.value?.deleteSelected()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

async function onSave() {
  const result = await dialog.confirm({
    title: '저장하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  // TODO: API 연동. 변경된 행만 보내려면 gridRef.getDirtyRows() 를 쓴다.
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
}

// 사이드메뉴(시스템 관리 LNB) 설정 — 활성 항목은 라우트 경로로 자동 매칭된다
useSideMenuSetup({ ...systemAdminMenu, openIndex: 0, activeChild: '메뉴관리' })

// 탭 추가 및 활성화
useBottomTabSetup({
  value: 'PC-COM-2203',
  label: '메뉴관리',
  path: '/views/com/PC-COM-2203',
  componentName: 'PcCom2203',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="메뉴 관리" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <LayoutSplite :count="2" :widths="[24, 76]" >
    <!-- ── 메뉴 트리 ────────────────────────── -->
    <template #layout-1>
      <LayoutPanel title="메뉴" no-padding>
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

        <!-- 메뉴가 깊고 이름이 길어 이 패널 안에서만 스크롤한다 -->
        <div class="tree-scroll">
          <TreeView
            ref="treeRef"
            v-model="menuTree"
            :selected="selectedMenu"
            :draggable="false"
            show-icon
            @update:selected="onMenuSelected"
          />
        </div>
      </LayoutPanel>
    </template>

    <!-- ── 메뉴 편집 ────────────────────────── -->
    <template #layout-2>
      <LayoutPanel title="메뉴 편집">
        <template #actions>
          <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSelected">
            선택삭제
          </Button>
          <Button type="button" variant="secondary" size="sm" @click="onAdd">추가</Button>
          <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
        </template>

        <!--
          좌측 트리에서 메뉴를 골라야 목록이 채워진다(진입 직후에는 비어 있다).
          맨 앞 체크박스 열과 전체선택 헤더는 select-mode="checkbox" 가 만들어준다.
        -->
        <TabulatorGrid
          ref="gridRef"
          class="flex-1"
          :columns="columns"
          :data="rows"
          select-mode="checkbox"
          height="100%"
          placeholder="좌측에서 메뉴를 선택해 주세요"
          @row-selection-changed="selectedCount = $event.length"
        />
      </LayoutPanel>
    </template>
  </LayoutSplite>
</template>
