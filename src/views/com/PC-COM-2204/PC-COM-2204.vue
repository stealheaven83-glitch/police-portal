<script setup lang="ts">
import { provide, ref } from 'vue'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import LayoutSplit from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { usePermissionManagement, PermissionManagementKey, type PermissionRow } from './composable/PC-COM-2204'
import DepartmentSearchDialog from './components/DepartmentSearchDialog.vue'
import AllUsersDialog from './components/AllUsersDialog.vue'
import styles from './style/PC-COM-2204.module.css'

defineOptions({ name: 'PcCom2204' })

useSideMenuSetup('systemAdmin')

const navItems = [
  { label: '홈', path: '/' },
  { label: '시스템관리' },
  { label: '시스템운영관리' },
  { label: '권한관리' },
]

const store = usePermissionManagement()
provide(PermissionManagementKey, store)

const {
  permissions,
  activePermission,
  activePermissionKey,
  menuPermissions,
  selectPermission,
  addPermission,
  openDeptSearch,
  deptSearchOpen,
  allUsersOpen,
} = store

/**
 * PC-COM-2205(부서조회)/2207(전체 사용자)는 특정 권한 행을 선택해야 여는 팝업이라 어느 행인지는
 * URL로 못 담는다(비대칭 팝업, CLAUDE.md §3) — 그래서 행 데이터는 물지 않고 "열림 여부"만
 * 화면ID와 동기화한다. 퍼블리싱 검수 단계에서 화면ID 단위로 바로 열어볼 수 있게 하는 용도.
 */
const screenTriggers: ScreenTriggerMap = {
  'PC-COM-2204': [],
  'PC-COM-2205': [[deptSearchOpen, true]],
  // 전체 사용자(2207)는 부서조회(2205) 안에서 여는 하위 팝업이라 실제로도 deptSearchOpen 이
  // 같이 true 다 — 0703(0701/0702 의 하위팝업)과 같은 패턴으로, 부모 조건을 포함해야
  // "더 구체적인 화면ID"로 인식돼 URL 이 2207까지 따라간다(안 그러면 조건 개수가 같아서 2205 에 묶인다).
  'PC-COM-2207': [[deptSearchOpen, true], [allUsersOpen, true]],
}
useAutoTrigger(screenTriggers)

const permissionKeyword = ref('')
const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'

const permissionColumns: TabulatorGridColumn[] = [
  { title: '권한ID', field: 'id', width: 100, hozAlign: 'center' },
  { title: '권한명', field: 'name', width: 168, cellType: 'input', hozAlign: 'center' },
  {
    title: '비고',
    field: 'deptNote',
    width: 130,
    hozAlign: 'center',
    cellType: 'button',
    buttonVariant: 'tertiary',
    buttonSize: 'xs',
    // 비어있으면 "부서 조회" 버튼, 이미 지정돼있으면 그 요약 텍스트만(버튼 테두리 없이) 보여준다
    buttonVisible: (row) => !(row as PermissionRow).deptNote,
    buttonLabel: (row) => (row as PermissionRow).deptNote || '부서 조회',
    onButtonClick: (row) => openDeptSearch((row as PermissionRow).rowKey),
  },
]

function onPermissionRowClick(_e: Event, row: any) {
  selectPermission((row.getData() as PermissionRow).rowKey)
}

const permissionGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedPermissionCount = ref(0)
function onDeleteSelectedPermissions() {
  if (!selectedPermissionCount.value) {
    toast.warning('삭제할 권한을 선택해 주세요.')
    return
  }
  permissionGridRef.value?.deleteSelected()
  toast.success('삭제되었습니다.')
}

function onSavePermissions() {
  toast.success('저장되었습니다.')
}

const menuColumns: TabulatorGridColumn[] = [
  { title: '메뉴ID', field: 'menuId', width: 100, hozAlign: 'center' },
  {
    title: '메뉴명',
    columns: [
      { title: '', field: 'level1', hozAlign: 'left' },
      { title: '', field: 'level2', hozAlign: 'left' },
      { title: '', field: 'level3', hozAlign: 'left' },
    ],
  },
  { title: '전체', field: 'all', width: 70, hozAlign: 'center', cellType: 'checkbox' },
  { title: '읽기', field: 'read', width: 70, hozAlign: 'center', cellType: 'checkbox' },
  { title: '편집', field: 'edit', width: 70, hozAlign: 'center', cellType: 'checkbox' },
  { title: '출력', field: 'print', width: 70, hozAlign: 'center', cellType: 'checkbox' },
  { title: '엑셀', field: 'excel', width: 70, hozAlign: 'center', cellType: 'checkbox' },
]

function onSaveMenuPermissions() {
  toast.success('저장되었습니다.')
}

useBottomTabSetup({
  value: 'PC-COM-2204',
  label: '권한관리',
  path: '/views/com/PC-COM-2204',
  componentName: 'PcCom2204',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="권한 관리" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <LayoutSplit :count="2" :widths="[42, 62]" :min-widths="[30, 40]" class="!mt-0">
    <template #layout-1>
      <LayoutPanel title="권한설정">
        <template #actions>
          <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSelectedPermissions">선택삭제</Button>
          <Button type="button" variant="secondary" size="sm" @click="addPermission">추가</Button>
          <Button type="button" variant="primary" size="sm" @click="onSavePermissions">저장</Button>
        </template>

        <div class="flex justify-end">
          <InputField2
            v-model="permissionKeyword"
            size="sm"
            input-class="w-60"
            class="!space-y-0"
            placeholder="권한 조회"
            label="권한 조회어"
            label-class="sr-only"
            :icon="searchIcon"
            icon-class="size-5"
            icon-label="검색"
            search
          />
        </div>
        <TabulatorGrid
          ref="permissionGridRef"
          v-model:data="permissions"
          :columns="permissionColumns"
          select-mode="checkbox"
          class="mt-4 flex-1"
          height="100%"
          :row-class="(row: any) => (row.rowKey === activePermissionKey ? styles.activeRow : undefined)"
          placeholder="등록된 권한이 없습니다"
          @row-click="onPermissionRowClick"
          @row-selection-changed="selectedPermissionCount = $event.length"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="메뉴별 권한설정">
        <template #center>
          <span class="group-gap2">
            <span class="dept-name">권한ID</span>
            <span class="text-[var(--Base--point)] font-semibold">{{ activePermission?.id }}</span>
            <span class="dept-name">권한명</span>
            <span>{{ activePermission?.name }}</span>
          </span>
        </template>
        <template #actions>
          <Button type="button" variant="primary" size="sm" @click="onSaveMenuPermissions">저장</Button>
        </template>

        <TabulatorGrid
          :class="[styles.menuGrid, 'flex-1']"
          v-model:data="menuPermissions"
          :columns="menuColumns"
          height="100%"
          placeholder="메뉴 정보가 없습니다"
        />
      </LayoutPanel>
    </template>
  </LayoutSplit>

  <DepartmentSearchDialog />
  <AllUsersDialog />
</template>
