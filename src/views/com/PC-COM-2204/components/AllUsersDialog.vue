<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { toast } from 'vue-sonner'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { PermissionManagementKey } from '../composable/PC-COM-2204'

/**
 * "전체 사용자" 팝업 — 부서조회 팝업의 부서 필터 없이 전체 사용자를 검색/삭제하는
 * 시스템 운영 관리용 보조 화면. 시안 버튼 라벨이 "삭제"라 부서조회로 선택값을 되돌리는
 * 용도가 아니라 사용자 자체를 관리하는 화면으로 보고 그렇게 구현했다(가정).
 */
const store = inject(PermissionManagementKey)!
const { activePermission, allUsers, allUsersOpen } = store

const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'
const keyword = ref('')

const filteredUsers = computed(() => {
  if (!keyword.value) return allUsers.value
  return allUsers.value.filter((u) => u.userId.includes(keyword.value) || u.name.includes(keyword.value))
})

const columns: TabulatorGridColumn[] = [
  { title: '사용자ID', field: 'userId', hozAlign: 'center' },
  { title: '계급', field: 'rank', width: 90, hozAlign: 'center' },
  { title: '성명', field: 'name', width: 90, hozAlign: 'center' },
  { title: '소속관서', field: 'station', hozAlign: 'center' },
  { title: '소속부서', field: 'dept', hozAlign: 'center' },
]

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

function onDeleteSelected() {
  if (!selectedCount.value) {
    toast.warning('삭제할 사용자를 선택해 주세요.')
    return
  }
  const selectedIds = new Set(
    (gridRef.value?.getSelectedRows() ?? []).map((r: any) => (r.getData ? r.getData().userId : r.userId)),
  )
  allUsers.value = allUsers.value.filter((u) => !selectedIds.has(u.userId))
  toast.success('삭제되었습니다.')
}
</script>

<template>
  <GenericDialog2
    :open="allUsersOpen"
    title="전체 사용자"
    :size="760"
    show-close-button
    :show-footer="false"
    @update:open="allUsersOpen = $event"
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

    <div class="group-gap2 mb-2 justify-between rounded-t-[0.8rem] bg-[var(--Background-gray01)] px-4 py-2">
      <span class="dept-name">사용자 정보</span>
      <span class="text-[1.4rem]">총 <strong class="text-[var(--Base--point)]">{{ filteredUsers.length }}</strong>명</span>
    </div>

    <TabulatorGrid
      ref="gridRef"
      :columns="columns"
      :data="filteredUsers"
      select-mode="checkbox"
      min-height="30rem"
      placeholder="사용자가 없습니다"
      show-pagination
      :items-per-page="10"
      @row-selection-changed="selectedCount = $event.length"
    />

    <div class="list-actions">
      <Button type="button" variant="tertiary2" size="md" @click="allUsersOpen = false">닫기</Button>
      <Button type="button" variant="tertiary2" size="md" @click="onDeleteSelected">삭제</Button>
    </div>
  </GenericDialog2>
</template>
