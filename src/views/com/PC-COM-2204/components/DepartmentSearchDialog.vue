<script setup lang="ts">
import { inject, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { FlexRow, FlexCol } from '@/components/custom/flex-grid'
import { PermissionManagementKey, type UserRow } from '../composable/PC-COM-2204'
import styles from '../style/PC-COM-2204.module.css'

const store = inject(PermissionManagementKey)!
const {
  activePermission,
  deptList,
  activeDept,
  usersInActiveDept,
  selectedUsers,
  deptSearchOpen,
  allUsersOpen,
  removeSelectedUser,
  applyDeptSearch,
} = store

const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'
const keyword = ref('')

const columns: TabulatorGridColumn[] = [
  { title: '사용자ID', field: 'userId', hozAlign: 'center' },
  { title: '계급', field: 'rank', width: 100, hozAlign: 'center' },
  { title: '성명', field: 'name', width: 100, hozAlign: 'center' },
]

function onSelectionChanged(rows: any[]) {
  selectedUsers.value = rows.map((r) => (typeof r.getData === 'function' ? r.getData() : r) as UserRow)
}
</script>

<template>
  <GenericDialog2
    :open="deptSearchOpen"
    title="부서조회"
    :size="760"
    show-close-button
    :show-footer="false"
    @update:open="deptSearchOpen = $event"
  >
    <div class="group-gap2 mb-3">
      <span class="dept-name">권한명:</span>
      <span class="text-[1.5rem]">{{ activePermission?.name }}</span>
      <InputField2
        v-model="keyword"
        size="sm"
        class="!space-y-0 ml-auto w-60"
        placeholder="부서조회"
        :icon="searchIcon"
        icon-class="size-5"
        icon-label="검색"
        search
      />
    </div>

    <div class="group-gap2 mb-4 rounded-[0.8rem] bg-[var(--Background-gray01)] p-3">
      <span class="dept-name shrink-0">선택 사용자</span>
      <div class="group-gap1 flex-1 flex-wrap">
        <span
          v-for="user in selectedUsers"
          :key="user.userId"
          class="group-gap1 rounded-full bg-white px-3 py-1 text-[1.3rem] text-[var(--Text-body_1)]"
        >
          {{ user.name }} {{ user.rank }}
          <button type="button" aria-label="선택 해제" @click="removeSelectedUser(user.userId)">×</button>
        </span>
      </div>
      <Button type="button" variant="tertiary2" size="xs" @click="allUsersOpen = true">전체 사용자</Button>
    </div>

    <FlexRow class="gap-4">
      <FlexCol :class="['!flex-none !w-[22rem]', styles.narrowCol]">
        <h3 class="mb-2 text-[1.4rem] font-semibold">부서 정보</h3>
        <ul class="max-h-80 overflow-y-auto border-t border-[var(--Text-body_0)]">
          <li v-for="node in deptList" :key="`${node.station}-${node.dept}`">
            <button
              type="button"
              class="group-gap2 w-full border-b border-[var(--Border_gray03)] px-2 py-3 text-left text-[1.4rem]"
              :class="activeDept.station === node.station && activeDept.dept === node.dept
                ? 'bg-[var(--Surface-primary)] text-[var(--Base-primary)] font-semibold'
                : 'text-[var(--Text-body_1)]'"
              @click="activeDept = node"
            >
              {{ node.station }} | {{ node.dept }}
            </button>
          </li>
        </ul>
      </FlexCol>

      <FlexCol :class="styles.narrowCol">
        <h3 class="mb-2 text-[1.4rem] font-semibold">사용자 정보</h3>
        <TabulatorGrid
          :columns="columns"
          :data="usersInActiveDept"
          select-mode="checkbox"
          min-height="30rem"
          placeholder="해당 부서에 사용자가 없습니다"
          @row-selection-changed="onSelectionChanged"
        />
      </FlexCol>
    </FlexRow>

    <div class="list-actions">
      <Button type="button" variant="tertiary2" size="md" @click="deptSearchOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="applyDeptSearch">권한적용</Button>
    </div>
  </GenericDialog2>
</template>
