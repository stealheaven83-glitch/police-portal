<template>
  <GenericDialog2
    v-model:open="deptSearchOpen"
    title="부서조회"
    :size="800"
    :show-close-button="true"
  >
    <!-- 권한명 ↔ 부서조회 검색 -->
    <div class="lp-row-between lp-dialog-head">
      <span class="group-gap3">
        <span class="lp-dialog-head-label">권한명:</span>
        <span class="lp-dialog-head-title">{{ activePermission?.name }}</span>
      </span>
      <InputField2
        v-model="keyword" 
        size="sm"
        input-class="w-60"
        class="!space-y-0"
        placeholder="부서조회"
        label="부서 조회어"
        label-class="sr-only"
        :icon="searchIcon"
        icon-class="size-5"
        icon-label="검색"
        search
      />
    </div>

    <!-- 선택 사용자 칩 줄 -->
    <div class="lp-selected-bar">
      <span class="dept-name">선택 사용자</span>
      <TagList class="lp-flex-fill">
        <Tag
          v-for="user in selectedUsers"
          :key="user.userId"
          size="medium"
          :label="`${user.name} ${user.rank}`"
          deletable
          @delete="removeSelectedUser(user.userId)"
        />
      </TagList>
      <Button type="button" variant="secondary" size="xs" @click="allUsersOpen = true">전체 사용자</Button>
    </div>

    <!-- 부서 정보 / 사용자 정보 2분할 -->
    <div class="lp-pane-box">
      <section class="lp-pane lp-pane-fixed" aria-labelledby="dept-info-heading">
        <h3 id="dept-info-heading" class="lp-pane-title">부서 정보</h3>
        <div class="lp-pane-wrap">
          <TabulatorGrid
            v-model:data="deptRows"
            :columns="deptColumns"
            height="32rem"
            :row-class="(row: any) => (isActiveDept(row) ? 'lp-grid-active-row' : undefined)"
            placeholder="부서가 없습니다"
            @row-click="onDeptRowClick"
          />
        </div>

      </section>

      <section class="lp-pane" aria-labelledby="user-info-heading">
        <h3 id="user-info-heading" class="lp-pane-title">사용자 정보</h3>
        <div class="lp-pane-wrap">
          <TabulatorGrid
            ref="userGridRef"
            :data="usersInActiveDept"
            :columns="userColumns"
            select-mode="checkbox"
            height="32rem"
            placeholder="사용자가 없습니다"
            @table-built="syncSelectedUsers"
            @row-selection-changed="onUserSelectionChanged"
          />
        </div>
      </section>
    </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="deptSearchOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onApply">권한적용</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Button } from '@/components/custom/button'
import { Tag, TagList } from '@/components/custom/tag'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { PermissionManagementKey, type DeptNode, type UserRow } from '../composable/PC-COM-2204'

defineOptions({ name: 'DepartmentSearchDialog' })

/** 부서조회 팝업 (PC-COM-2205). 권한설정 목록의 '부서 조회' 버튼에서 열린다. */
const store = inject(PermissionManagementKey)!
const {
  activePermission,
  deptSearchOpen,
  allUsersOpen,
  deptList,
  activeDept,
  usersInActiveDept,
  selectedUsers,
  selectDept,
  removeSelectedUser,
  applyDeptSearch,
} = store

const keyword = ref('')
const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'

/* ------------------------------------------------------------------ *
 * 부서 정보 (좌)
 * ------------------------------------------------------------------ */
/** 부서 목록은 고정 목업이라 그대로 넘긴다(그리드가 복제해 쓰므로 원본은 안 바뀐다) */
const deptRows = ref<DeptNode[]>([...deptList])

const deptColumns: TabulatorGridColumn[] = [
  { title: '소속관서', field: 'station', hozAlign: 'center' },
  { title: '소속부서', field: 'dept', hozAlign: 'center' },
]

function isActiveDept(row: DeptNode) {
  return row.station === activeDept.value.station && row.dept === activeDept.value.dept
}

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onDeptRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as DeptNode
  selectDept(data)
}

/* ------------------------------------------------------------------ *
 * 사용자 정보 (우)
 * ------------------------------------------------------------------ */
const userGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

const userColumns: TabulatorGridColumn[] = [
  // 시안에서 사용자ID 만 밑줄(링크처럼) — 밑줄은 styles.css 가 이 클래스로 붙인다
  { title: '사용자ID', field: 'userId', hozAlign: 'center', cssClass: 'lp-grid-link-cell' },
  { title: '계급', field: 'rank', width: 90, hozAlign: 'center' },
  { title: '성명', field: 'name', width: 90, hozAlign: 'center' },
]

const selectedUserIds = computed(() => new Set(selectedUsers.value.map((u) => u.userId)))

/** 팝업이 열릴 때 이미 고른 사용자에 체크를 맞춘다 */
function syncSelectedUsers() {
  userGridRef.value?.selectWhere((row: any) => selectedUserIds.value.has((row as UserRow).userId))
}

function onUserSelectionChanged(rows: any[]) {
  selectedUsers.value = rows.map(
    (r) => (typeof r.getData === 'function' ? r.getData() : r) as UserRow,
  )
}

function onApply() {
  applyDeptSearch()
}
</script>
