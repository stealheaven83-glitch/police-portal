<template>
  <GenericDialog2
    v-model:open="allUsersOpen"
    title="전체 사용자"
    :size="800"
    :height="660"
    :show-close-button="true"
  >
    <!--
      높이를 고정하고 .pop-body 로 세로 배치한다 — 머리줄·제목바는 제 높이만 쓰고 그리드가
      남는 높이를 다 가져가므로, 창이 낮아도 팝업 바깥쪽에 스크롤이 생기지 않는다.
      (그리드 안쪽 스크롤은 그대로 — PC-LPO-0801 부서조회 팝업과 같은 구조)
    -->
    <div class="pop-body lp-pop-body-pager">
      <!-- 권한명 ↔ 부서조회 검색 (부서조회 팝업과 같은 머리줄) -->
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

      <div class="lp-grid-title">
        <span class="lp-grid-title-label">사용자 정보</span>
        <span class="lp-grid-title-count">
          총 <span class="lp-grid-title-num">{{ checkedUsers.length }}</span>명
        </span>
      </div>

      <TabulatorGrid
        :data="rows"
        :columns="columns"
        select-mode="checkbox"
        class="flex-1"
        height="100%"
        min-height="16rem"
        placeholder="사용자가 없습니다"
        show-pagination
        :items-per-page="10"
        @row-selection-changed="onSelectionChanged"
      />
    </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="allUsersOpen = false">닫기</Button>
      <Button type="button" variant="tertiary2" size="md" @click="onDelete">삭제</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useDialog } from '@/composable/dialog/dialog'
import { PermissionManagementKey, type UserRow } from '../composable/PC-COM-2204'

defineOptions({ name: 'AllUsersDialog' })

/** 전체 사용자 팝업 (PC-COM-2207). 부서조회 팝업의 '전체 사용자' 버튼에서 열린다. */
const store = inject(PermissionManagementKey)!
const { activePermission, allUsersOpen, allUsers, selectedUsers } = store

/*
 * 이 화면은 성공·경고를 toast 가 아니라 알림창으로 낸다 — PC-COM-2204 본문에 적힌 사용자 지정을
 * 그대로 따른다(§7 기본은 toast).
 */
const dialog = useDialog()

const keyword = ref('')
const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'

const checkedUsers = ref<UserRow[]>([])

/**
 * 시안의 번호 칸은 아래로 갈수록 작아진다(최근 등록이 위) — 목록 순서대로 총 인원부터 매긴다.
 * 검색으로 걸러진 뒤에도 번호가 흔들리지 않게 필터 전에 번호를 붙인다.
 */
const numberedUsers = computed(() =>
  allUsers.value.map((user, index) => ({ ...user, no: allUsers.value.length - index })),
)

/** 머리줄 '부서조회' 입력 — 소속관서·소속부서로 거른다 */
const rows = computed(() => {
  const word = keyword.value.trim()
  if (!word) return numberedUsers.value
  return numberedUsers.value.filter(
    (user) => user.station.includes(word) || user.dept.includes(word),
  )
})

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  // 시안에서 사용자ID 만 밑줄(링크처럼) — 부서조회 팝업과 같은 공통 셀 클래스
  { title: '사용자ID', field: 'userId', hozAlign: 'center', cssClass: 'lp-grid-link-cell' },
  { title: '계급', field: 'rank', width: 90, hozAlign: 'center' },
  { title: '성명', field: 'name', width: 90, hozAlign: 'center' },
  { title: '소속관서', field: 'station', hozAlign: 'center' },
  { title: '소속부서', field: 'dept', hozAlign: 'center' },
]

/** @row-selection-changed 는 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onSelectionChanged(selectedRows: any[]) {
  checkedUsers.value = selectedRows.map(
    (row) => (typeof row.getData === 'function' ? row.getData() : row) as UserRow,
  )
}

async function onDelete() {
  if (!checkedUsers.value.length) {
    await dialog.alert({ title: '삭제할 사용자를 선택해 주세요.', btnCancel: '확인' })
    return
  }

  // 사용자 지정: 삭제 전 컨펌창 (PC-COM-2204 의 권한 삭제와 같은 흐름)
  const result = await dialog.confirm({ title: '삭제하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return

  const removed = new Set(checkedUsers.value.map((user) => user.userId))
  // 배열은 제자리 수정하지 않고 재할당한다(CLAUDE.md §3)
  allUsers.value = allUsers.value.filter((user) => !removed.has(user.userId))
  selectedUsers.value = selectedUsers.value.filter((user) => !removed.has(user.userId))
  checkedUsers.value = []
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}
</script>
