<template>
  <PageHeader>
    <template #left>
      <PageTitle title="권한 관리" />
    </template>      
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <LayoutSplit :count="2" :widths="[33, 67]" :min-widths="[25, 40]">
    <template #layout-1>
      <LayoutPanel title="권한설정">
        <template #actions>
          <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSelectedPermissions">선택삭제</Button>
          <Button type="button" variant="secondary" size="sm" @click="onAddPermission">추가</Button>
          <Button type="button" variant="primary" size="sm" @click="onSavePermissions">저장</Button>
        </template>

        <!-- 검색 입력은 표 위 우측에 붙는다(시안 10894:35797, 240px) -->
        <div class="list-actions">
          <InputField2
            v-model="keyword"
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
          :table-options="selectByCheckboxOnly"
          class="flex-1"
          height="100%"
          :row-class="(row: any) => (row.rowKey === activePermissionKey ? 'lp-grid-active-row' : undefined)"
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
            <span class="lp-panel-head-em">{{ activePermission?.id }}</span>
            <span class="dept-name">권한명</span>
            <span class="lp-panel-head-em">{{ activePermission?.name }}</span>
          </span>
        </template>
        <template #actions>
          <Button type="button" variant="primary" size="sm" @click="onSaveMenuPermissions">저장</Button>
        </template>

        <TabulatorGrid
          v-model:data="menuPermissions"
          :columns="menuColumns"
          class="flex-1"
          height="100%"
          placeholder="메뉴 정보가 없습니다"
        />
      </LayoutPanel>
    </template>
  </LayoutSplit>

  <DepartmentSearchDialog />
  <AllUsersDialog />
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
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
import DepartmentSearchDialog from './components/DepartmentSearchDialog.vue'
import AllUsersDialog from './components/AllUsersDialog.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { systemAdminMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  usePermissionManagement,
  PermissionManagementKey,
  type PermissionRow,
} from './composable/PC-COM-2204'

defineOptions({ name: 'PcCom2204' })

// presets.ts systemAdminMenu items[0] = '시스템 운영 관리', 그 children 의 '권한관리'
useSideMenuSetup({ ...systemAdminMenu, openIndex: 0, activeChild: '권한관리' })

// '/com' 은 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '시스템관리' },
  { label: '시스템운영관리' },
  { label: '권한관리' },
]

// 팝업이 같은 상태를 쓰도록 여기서 한 번만 만들어 provide 한다(CLAUDE.md §3 패턴A)
const store = usePermissionManagement()
provide(PermissionManagementKey, store)

const {
  permissions,
  activePermission,
  activePermissionKey,
  menuPermissions,
  keyword,
  selectPermission,
  createPermissionRow,
  openDeptSearch,
} = store

/*
 * 성공·경고 피드백은 toast 가 아니라 알림창(AlertDialog2)으로 낸다.
 * CLAUDE.md §7 의 기본값은 toast 지만 사용자 지정이고, 같은 시스템관리 메뉴의
 * PC-COM-2201·PC-COM-2203·PC-COM-2206 도 같은 문구를 dialog.alert 로 낸다.
 */
const dialog = useDialog()

const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'

/**
 * "선택은 체크박스로만" — Tabulator 는 selectableRows 가 true 면 행 아무 데나 클릭해도
 * 선택이 토글된다. 이 화면은 행 클릭이 "이 권한의 메뉴설정을 오른쪽에 띄운다"는 뜻이라,
 * 클릭만으로 체크가 들어가면 선택삭제가 방금 본 행을 지운다.
 */
const selectByCheckboxOnly = { selectableRows: 'highlight' }

/* ------------------------------------------------------------------ *
 * 권한설정 목록
 * ------------------------------------------------------------------ */
/*
 * 폭을 모든 컬럼에 주면 안 된다 — layout="fitColumns" 는 width 가 없는 컬럼만 늘려서
 * 남는 폭을 채우므로, 전부 고정이면 그 차이가 오른쪽 빈칸으로 남는다.
 * 권한명만 폭을 비우고 minWidth 로 시안 폭(188)을 바닥에 깐다.
 */
const permissionColumns: TabulatorGridColumn[] = [
  { title: '권한ID', field: 'id', width: 100, hozAlign: 'center' },
  { title: '권한명', field: 'name', minWidth: 188, cellType: 'input', hozAlign: 'center' },
  {
    title: '비고',
    field: 'deptNote',
    width: 140,
    hozAlign: 'center',
    cellType: 'button',
    buttonVariant: 'tertiary',
    buttonSize: 'xs',
    // 비어있으면 "부서 조회" 버튼, 이미 지정돼있으면 그 요약 텍스트 + 돋보기 아이콘.
    // 아이콘은 styles.css 의 .lp-grid-search-cell 이 붙인다 — 공용 button 셀이 라벨을
    // textContent 로 넣어서 <span class="grid-icon-search"> 를 라벨에 못 실어 보내기 때문.
    cssClass: 'lp-grid-search-cell',
    buttonVisible: (row) => !(row as PermissionRow).deptNote,
    buttonLabel: (row) => (row as PermissionRow).deptNote || '부서 조회',
    onButtonClick: (row) => openDeptSearch((row as PermissionRow).rowKey),
  },
]

const permissionGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedPermissionCount = ref(0)

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onPermissionRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as PermissionRow
  selectPermission(data.rowKey)
}

function onAddPermission() {
  permissionGridRef.value?.addRow(createPermissionRow(), false)
}

async function onDeleteSelectedPermissions() {
  if (!selectedPermissionCount.value) {
    await dialog.alert({ title: '삭제할 권한을 선택해 주세요.', btnCancel: '확인' })
    return
  }
  // 사용자 지정: 삭제 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 삭제)
  const result = await dialog.confirm({ title: '삭제하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  permissionGridRef.value?.deleteSelected()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

async function onSavePermissions() {
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
}

/* ------------------------------------------------------------------ *
 * 메뉴별 권한설정
 * ------------------------------------------------------------------ */
/**
 * 메뉴명은 depth 3단이 각각 컬럼인데 헤더는 "메뉴명" 하나로 묶인다.
 * Tabulator 6.x 는 데이터 셀 병합이 없어 헤더 그룹(columns 중첩)이 유일한 수단이고,
 * 자식 컬럼의 빈 title 줄은 CSS(.lp-perm-menu-grid)로 접어서 한 줄처럼 보이게 한다.
 */
const menuColumns: TabulatorGridColumn[] = [
  { title: '메뉴ID', field: 'menuId', width: 140, hozAlign: 'center' },
  {
    title: '메뉴명',
    columns: [
      { title: '', field: 'level1', width: 160, hozAlign: 'center' },
      {
        title: '',
        field: 'level2',
        width: 145,
        hozAlign: 'center',
        // 시안에서 2depth 칸만 회색으로 칠해져 있다 — 값이 있는 셀에만 표시 클래스를 붙인다
        formatter: (cell: any) => {
          const value = cell.getValue()
          if (value) cell.getElement().classList.add('lp-grid-depth-cell')
          return value
        },
      },
      { title: '', field: 'level3', minWidth: 145, hozAlign: 'center' },
    ],
  },
  { title: '전체', field: 'all', width: 80, hozAlign: 'center', cellType: 'checkbox' },
  { title: '읽기', field: 'read', width: 80, hozAlign: 'center', cellType: 'checkbox' },
  { title: '편집', field: 'edit', width: 80, hozAlign: 'center', cellType: 'checkbox' },
  { title: '출력', field: 'print', width: 80, hozAlign: 'center', cellType: 'checkbox' },
  { title: '엑셀', field: 'excel', width: 80, hozAlign: 'center', cellType: 'checkbox' },
]

async function onSaveMenuPermissions() {
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PC-COM-2204',
  label: '권한관리',
  path: '/views/com/PC-COM-2204',
  componentName: 'PcCom2204',
  closable: true,
})
</script>
