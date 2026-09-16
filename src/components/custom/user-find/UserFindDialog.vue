<template>
  <GenericDialog2
    :open="props.open"
    title="사용자 찾기"
    :size="1000"
    :height="680"
    :show-close-button="true"
    @update:open="emit('update:open', $event)"
  >
    <!--
      팝업 높이를 시안대로 고정(680)하고 .pop-body 로 세로 배치한다 — 검색줄은 제 높이만 쓰고
      두 칸 상자(.lp-pane-box-fill)가 남는 높이를 다 가져가므로 스크롤은 각 칸 안에서만 생긴다.
      (PC-LPO-0802 부서 조회 팝업과 같은 구조)
    -->
    <div class="pop-body">
      <!-- 검색줄 — 시안 입력 808 + 조회 100 -->
      <div class="pop-search-area">
        <InputField2
          v-model="keyword"
          size="sm"
          class="!space-y-0"
          input-class="w-full"
          label="사용자 검색어"
          label-class="sr-only"
          placeholder="사용자 검색"
          @keyup.enter="onSearch"
        />
        <Button type="button" variant="secondary" size="sm" @click="onSearch">조회</Button>
      </div>

      <!-- 부서(트리) / 사용자 정보(표) 2분할 — 시안 920x452, 좌 300 : 우 나머지 -->
      <div class="lp-pane-box lp-pane-box-fill">
        <section class="lp-pane lp-pane-fixed" :aria-labelledby="deptHeadingId">
          <h3 :id="deptHeadingId" class="lp-pane-title">부서</h3>
          <div class="detail-scroll">
            <TreeView
              v-model="deptTree"
              :selected="selectedDept"
              show-icon
              tree-line
              :draggable="false"
              @update:selected="onDeptSelected"
            />
          </div>
        </section>

        <section class="lp-pane" :aria-labelledby="userHeadingId">
          <!-- 제목 오른쪽에 건수 — 숫자만 포인트색(시안 12896:105124) -->
          <h3 class="lp-pane-title lp-row-between">
            <span :id="userHeadingId" class="lp-pane-title-text">사용자 정보</span>
            <span class="lp-pane-title-count">총 <span class="lp-em-primary">{{ rows.length }}</span>건</span>
          </h3>
          <div class="lp-pane-fill">
            <TabulatorGrid
              ref="gridRef"
              :data="rows"
              :columns="columns"
              height="100%"
              class="flex-1"
              :row-class="rowClass"
              placeholder="조회된 사용자가 없습니다"
              @row-click="onRowClick"
              @table-built="onTableBuilt"
            />
          </div>
        </section>
      </div>
    </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="close">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { TreeView, type TreeNode } from '@/components/custom/tree'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { useDialog } from '@/composable/dialog/dialog'

/**
 * 사용자 찾기 팝업 — 전 화면 공용. 왼쪽 부서 트리에서 부서를 고르고 오른쪽 목록에서 사람을 고른다.
 * Figma: 8mQz91txveSEKO0ky7Ck6V / 12875:101668 (공통 > 사용자 찾기, PC-COM-0701)
 * 쓰는 곳: PC-LPO-0505 승인관리(PC-LPO-0506)의 경찰서(과장) '조회' → PC-LPO-0507
 *
 * 실제 사용자 조회 API 연동 전까지는 목업 목록에서 고르는 식으로 동작한다.
 * 고른 사용자는 '저장'에서 `@select` 로 한 명 넘기고 닫는다.
 */

/** 부서 트리 한 마디 */
export interface UserFindDeptNode {
  id: number
  name: string
  children?: UserFindDeptNode[]
}

/** 사용자 목록 한 줄 */
export interface UserFindUser {
  no: number
  rank: string
  name: string
  office: string
  dept: string
}

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'select', user: UserFindUser): void
}>()

const dialog = useDialog()

/** section 이 제목을 가리키게 할 id. 한 화면에 팝업이 여러 개여도 겹치지 않는다 */
const deptHeadingId = useId()
const userHeadingId = useId()

/* ── 목업 ─────────────────────────────────────────────────────────────── */
/** 시안의 부서 트리 — 실제 조회는 개발팀이 잇는다 */
const MOCK_DEPT_TREE: UserFindDeptNode[] = [
  {
    id: 1,
    name: '부산사상경찰서',
    children: [
      { id: 2, name: '청문감사인권관' },
      { id: 3, name: '경찰대학 운영지원과' },
      { id: 4, name: '경찰대학 학생지도부' },
      { id: 5, name: '경찰대학 도서관' },
      { id: 6, name: '경찰대학 도서관' },
    ],
  },
]

/** 시안의 사용자 목록(총 12건) — 번호는 아래로 갈수록 작아진다 */
const MOCK_USERS: UserFindUser[] = Array.from({ length: 12 }, (_, index) => ({
  no: 12 - index,
  rank: '경감',
  name: '홍길동',
  office: '부산청 부산사상서',
  dept: '청문감사인권관',
}))

/* ── 검색 ─────────────────────────────────────────────────────────────── */
const keyword = ref('')
/** '조회'로 확정된 검색어 — 입력 중에는 목록이 바뀌지 않는다 */
const appliedKeyword = ref('')

function onSearch() {
  appliedKeyword.value = keyword.value.trim()
}

/* ── 부서 트리 ────────────────────────────────────────────────────────── */
const deptTree = ref<TreeNode[]>(MOCK_DEPT_TREE as TreeNode[])
const selectedDept = ref<TreeNode | null>(null)

/** 목업이라 트리 선택은 표시만 바꾼다 — 실제로는 그 부서의 사용자를 조회해 온다 */
function onDeptSelected(node: TreeNode | null) {
  selectedDept.value = node
}

/* ── 사용자 목록 ──────────────────────────────────────────────────────── */
const rows = computed(() => {
  const word = appliedKeyword.value
  if (!word) return MOCK_USERS
  return MOCK_USERS.filter(
    (user) =>
      user.name.includes(word) ||
      user.rank.includes(word) ||
      user.office.includes(word) ||
      user.dept.includes(word),
  )
})

const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '계급', field: 'rank', width: 100, hozAlign: 'center' },
  { title: '성명', field: 'name', width: 80, hozAlign: 'center' },
  { title: '소속관서', field: 'office', hozAlign: 'center', minWidth: 140, widthGrow: 1 },
  { title: '소속부서', field: 'dept', hozAlign: 'center', minWidth: 140, widthGrow: 1 },
]

/** 목록에서 고른 사람 — '저장'이 넘기는 값 */
const pickedUser = ref<UserFindUser | null>(null)

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §5) */
function onRowClick(_event: Event, row: any) {
  pickedUser.value = (typeof row?.getData === 'function' ? row.getData() : row) as UserFindUser
}

/** :row-class 는 RowComponent 가 아니라 행 데이터를 넘긴다 */
function rowClass(row: UserFindUser) {
  return pickedUser.value?.no === row.no ? 'lp-grid-active-row' : undefined
}

/*
 * 팝업 안 그리드의 "오른쪽 빈칸" 방지 — DialogContent 의 zoom-in-95 애니메이션 중에
 * fitColumns 가 폭을 5% 좁게 재므로, 애니메이션이 끝난 뒤 한 번 더 그린다.
 * (PC-LPO-0505 composable/dialogGridRedraw.ts 와 같은 내용 — 공통 컴포넌트라 화면 파일을 import 하지 않는다)
 */
const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

function onTableBuilt() {
  let done = false
  const redraw = () => {
    if (done) return
    done = true
    gridRef.value?.redraw(true)
  }
  const dialogEl = (gridRef.value?.$el as HTMLElement | undefined)?.closest('[role="dialog"]')
  dialogEl?.addEventListener('animationend', redraw, { once: true })
  setTimeout(redraw, 250)
}

/* ── 확정 ─────────────────────────────────────────────────────────────── */
async function onSave() {
  if (!pickedUser.value) {
    await dialog.alert({ title: '사용자를 선택해 주세요.', btnCancel: '확인' })
    return
  }
  emit('select', { ...pickedUser.value })
  close()
}

function close() {
  emit('update:open', false)
}
</script>
