<template>
  <PageHeader>
    <template #left>
      <PageTitle title="메모" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <!-- ── PM-LPO-0101 목록 ─────────────────────────────── -->
  <template v-if="view === 'list'">
    <Tabs v-model="activeTab">
      <TabsList variant="fill" :grow="true">
        <TabsTrigger value="mine" tone="secondary">내 메모</TabsTrigger>
        <!-- <TabsTrigger value="mine" tone="secondary">{{isMobile ? '모바일' : '아님'}}</TabsTrigger> -->
        <TabsTrigger value="received" tone="secondary">받은 메모</TabsTrigger>
        <TabsTrigger value="sent" tone="secondary">보낸 메모</TabsTrigger>
      </TabsList>
    </Tabs>

    <SearchWrapper>
      <template #form>
        <div class="search-area">
          <DateRangePicker
            v-model:from="form.dateFrom"
            v-model:to="form.dateTo"
            label="검색기간"
            size="sm"
          />
          <InputField2
            v-model="form.keyword"
            size="sm"
            aria-label="검색어"
            placeholder="검색어를 입력해주세요."
            inputClass="w-60"
            clearable
            @keyup.enter="search"
          />
        </div>
      </template>
      <template #btns>
        <Button type="button" variant="secondary" size="sm" @click="search">조회</Button>
      </template>
    </SearchWrapper>

    <div class="list-actions space-between">
      <div class="lp-toolbar-left">
        <Checkbox
          :model-value="isAllSelected"
          label="전체 선택"
          @update:model-value="(checked) => toggleSelectAll(!!checked)"
        />
        <!-- 기획서 10-1: 선택된 게시물이 없으면 삭제 버튼 비활성화 -->
        <Button
          type="button"
          variant="tertiary2"
          size="sm"
          :disabled="!selectedCount"
          @click="onDeleteSelected"
          v-if="!isMobile"
        >
          선택 삭제
        </Button>
      </div>
      <div class="lp-toolbar-right">
        <Switch
          :model-value="form.importantOnly"
          variant="none"
          label="중요 메모만 보기"
          @update:model-value="onToggleImportantOnly"
        />
        <Button type="button" variant="primary" size="sm" @click="openWrite" v-if="!isMobile">작성</Button>
      </div>
    </div>

    <ScrollWrapper>
      <ul v-if="pagedMemos.length" class="lp-card-grid">
        <li v-for="memo in pagedMemos" :key="memo.id">
          <article
            class="lp-memo-card"
            :class="{ 'lp-memo-card-selected': selectedIds.has(memo.id) }"
            @click="openDetail(memo)"
          >
            <div class="lp-memo-card-check">
              <Checkbox
                :model-value="selectedIds.has(memo.id)"
                aria-label="메모 선택"
                @update:model-value="() => toggleSelect(memo.id)"
                @click.stop
              />
            </div>
            <div class="lp-memo-card-body">
              <div class="lp-memo-card-titlerow">
                <h3 class="lp-memo-card-title">
                  <!-- 기획서 8: 제목 선택 시 상세 화면(PM-LPO-0102)으로 이동 -->
                  <button type="button" class="lp-memo-card-titlebtn" @click.stop="openDetail(memo)">
                    {{ memo.title }}
                  </button>
                </h3>
                <div class="lp-memo-card-actions">
                  <!-- 2026-09-11 컴포넌트로 교체: button.lp-icon-btn -> Button variant="icon" -->
                  <Button
                    variant="icon"
                    :aria-label="memo.important ? '중요 해제' : '중요 표시'"
                    @click.stop="toggleImportant(memo.id)"
                  >
                    <Icon :name="memo.important ? 'starFill' : 'star'" :size="24" />
                  </Button>
                  <Button
                    variant="icon"
                    aria-label="공유"
                    @click.stop="openShare()"
                  >
                    <Icon name="share" :size="24" />
                  </Button>
                </div>
              </div>
              <p class="lp-memo-card-preview">{{ memo.content }}</p>
              <div class="lp-memo-card-meta">
                <span v-if="activeTab !== 'mine'">{{ memo.person }}</span>
                <span>{{ memo.date }}</span>
                <span>{{ memo.time }}</span>
                <Icon v-if="memo.files.length" name="attach" :size="16" />
              </div>
            </div>
          </article>
        </li>
      </ul>
      <!-- 기획서 5: 검색 결과가 없을 때 목록 영역에 안내 문구 (공통 NoData — 회색 ! 아이콘 포함) -->
      <NoData
        v-else
        class="lp-nodata-fill"
        message="검색된 결과가 없습니다. 다시 검색하시기 바랍니다."
      />
    </ScrollWrapper>

    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :items-per-page="itemsPerPage"
      :total-elements="totalElements"
      @update:page="changePage"
      @update:items-per-page="changePageSize"
    />
  </template>

  <!-- ── PM-LPO-0102 상세/수정 · PM-LPO-0104 등록 ──────── -->
  <ScrollWrapper v-else>
    <!-- PM-LPO-0102 는 화면 하나에 상태가 둘이다(기획서 "상세 내용 확인 및 수정 가능 /
         받은 메모, 보낸 메모의 경우 전체 입력란 비활성화").
           내 메모   → MemoForm 수정 폼 (취소·삭제·저장, 기획서 1·10·11·12)
           받은/보낸 → 읽기 전용 뷰 (삭제만, Figma 10523:43293 `02_받은메모_상세`)
         Figma 는 "입력란 비활성화"를 비활성 폼이 아니라 텍스트 뷰로 구현했다. -->
    <MemoReadonlyView
      v-if="view === 'detail' && currentMemo && currentMemo.box !== 'mine'"
      :key="`view-${currentMemo.id}`"
      :memo="currentMemo"
      @delete="onFormDelete"
      @share="openShare"
      @toggle-important="toggleImportant(currentMemo.id)"
    />
    <MemoForm
      v-else
      :key="view === 'write' ? 'write' : `detail-${currentMemo?.id ?? 'none'}`"
      :mode="view === 'write' ? 'write' : 'detail'"
      :memo="currentMemo"
      @cancel="backToList"
      @save="onFormSave"
      @delete="onFormDelete"
      @share="openShare"
    />
  </ScrollWrapper>

  <EmptyStubDialog
    v-model:open="shareOpen"
    title="메모 공유"
    description="공유 대상자를 선택하는 팝업입니다."
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import { Tabs, TabsList, TabsTrigger } from '@/components/custom/tabs'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { Button } from '@/components/custom/button'
import ScrollWrapper from '@/components/custom/ScrollWrapper.vue'
import { Checkbox } from '@/components/custom/checkbox'
import { Switch } from '@/components/custom/switch'
import Icon from '@/components/custom/icon/Icon.vue'
import { Pagination } from '@/components/custom/pagination'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import { NoData } from '@/components/custom/empty'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useAutoTrigger, type ScreenTriggerMap } from '@/composables/useAutoTrigger'
import MemoForm from './components/MemoForm.vue'
import MemoReadonlyView from './components/MemoReadonlyView.vue'
import { useMemoList, type MemoFormPayload } from './composable/PM-LPO-0101'
import { useBreakpoint } from '@/composable/responsive/useResponsive.ts'

defineOptions({
  name: 'PmLpo0101',
})

// LNB: 개인수첩 > 메모 (presets.ts 에 path 로 등록돼 있음 — openIndex 0, activeChild '메모')
useSideMenuSetup({ ...localPoliceMenu, openIndex: 0, activeChild: '메모' })

const dialog = useDialog()

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '개인수첩' },
  { label: '메모' },
]

const {
  activeTab,
  form,
  allMemos,
  pagedMemos,
  selectedIds,
  isAllSelected,
  selectedCount,
  itemsPerPage,
  currentPage,
  totalElements,
  totalPages,
  search,
  toggleSelect,
  toggleSelectAll,
  toggleImportant,
  deleteSelected,
  changePage,
  changePageSize,
  view,
  currentMemo,
  openDetail,
  openWrite,
  backToList,
  ensureCurrentMemo,
  createMemo,
  updateMemo,
  deleteMemo,
} = useMemoList()

const shareOpen = ref(false)

/**
 * 화면ID ↔ 이 페이지의 화면 상태 동기화 (PC-LPO-0701 과 같은 방식).
 * 메모는 목록/상세/등록이 기획서상 화면ID 3개지만 폼과 목록이 같은 데이터를 물고 있어서
 * 페이지를 쪼개지 않고 view ref 하나로 갈라 놓고, 그 값을 화면ID에 대응시킨다.
 *   PM-LPO-0101 목록 · PM-LPO-0102 상세/수정 · PM-LPO-0104 등록
 * (라우트 3개는 전부 이 파일을 컴포넌트로 쓰고 meta.screenGroup 이 같아야 한다 — router/index.ts)
 */
const screenTriggers: ScreenTriggerMap = {
  'PM-LPO-0101': [[view, 'list']],
  'PM-LPO-0102': [[view, 'detail']],
  'PM-LPO-0104': [[view, 'write']],
}
useAutoTrigger(screenTriggers)

// URL 로 바로 PM-LPO-0102 에 들어오면 어떤 메모인지 알 수 없다 → 목록 첫 항목을 보여준다
watch(view, (v) => {
  if (v === 'detail') ensureCurrentMemo()
}, { immediate: true })

function onToggleImportantOnly(value: boolean) {
  form.importantOnly = value
  search() // 기획서 7: 토글 즉시 목록에 반영
}

/** 기획서 8-1: 공유 아이콘 → 공유 대상자 선택 팝업. Figma 미제공이라 빈 스텁 연결 */
function openShare() {
  shareOpen.value = true
}

/** 등록(0104)이면 새로 만들고, 상세(0102)면 그 메모를 고친 뒤 목록으로 돌아간다 */
function onFormSave(payload: MemoFormPayload) {
  if (view.value === 'write') createMemo(payload)
  else if (currentMemo.value) updateMemo(currentMemo.value.id, payload)
  backToList()
}

/** 상세에서 삭제(컨펌 확인까지 끝난 뒤) — 목록으로 돌아가고 완료를 모달로 알린다 */
async function onFormDelete() {
  if (currentMemo.value) deleteMemo(currentMemo.value.id)
  backToList()
}

/**
 * 기획서 10: 삭제는 되돌릴 수 없어 컨펌창을 띄운다(§7 기본 toast 와 다르지만 기획서 지정).
 * 선택 항목에 중요 메모가 있으면 안내 문구가 달라진다.
 * 선택이 0건이면 버튼 자체가 비활성이라 여기로 들어오지 않는다(기획서 10-1).
 */
async function onDeleteSelected() {
  const hasImportant = allMemos.value.some((m) => selectedIds.value.has(m.id) && m.important)
  const { confirmed } = await dialog.confirm({
    title: hasImportant
      ? '중요 메모를 선택하였습니다. 선택된 메모를 삭제 하시겠습니까?'
      : '삭제된 메모는 복구할 수 없습니다. 선택된 메모를 삭제 하시겠습니까?',
    btnOk: '확인',
  })
  if (!confirmed) return
  deleteSelected()
}

const isMobile = useBreakpoint('<=');
useBottomTabSetup({
  value: 'PM-LPO-0101',
  label: '메모',
  path: '/views/lpo/PM-LPO-0101',
  componentName: 'PmLpo0101',
})
</script>
