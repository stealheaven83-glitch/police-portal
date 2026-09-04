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

  <Tabs v-model="activeTab">
    <TabsList variant="fill" :grow="true">
      <TabsTrigger value="mine" tone="secondary">내 메모</TabsTrigger>
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
      <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSelected">선택 삭제</Button>
    </div>
    <div class="lp-toolbar-right">
      <Switch
        :model-value="form.importantOnly"
        variant="none"
        label="중요 메모만 보기"
        @update:model-value="onToggleImportantOnly"
      />
      <Button type="button" variant="primary" size="sm" @click="goCreate">작성</Button>
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
                <button type="button" class="lp-memo-card-titlebtn" @click.stop="openDetail(memo)">
                  {{ memo.title }}
                </button>
              </h3>
              <div class="lp-memo-card-actions">
                <button
                  type="button"
                  class="lp-icon-btn lp-icon-btn-24"
                  :aria-label="memo.important ? '중요 해제' : '중요 표시'"
                  @click.stop="toggleImportant(memo.id)"
                >
                  <Icon :name="memo.important ? 'starFill' : 'star'" :size="24" />
                </button>
                <button
                  type="button"
                  class="lp-icon-btn lp-icon-btn-24"
                  aria-label="공유"
                  @click.stop="openShare()"
                >
                  <Icon name="share" :size="24" />
                </button>
              </div>
            </div>
            <p class="lp-memo-card-preview">{{ memo.preview }}</p>
            <div class="lp-memo-card-meta">
              <span v-if="activeTab !== 'mine'">{{ memo.person }}</span>
              <span>{{ memo.date }}</span>
              <span>{{ memo.time }}</span>
              <Icon v-if="memo.hasAttachment" name="attach" :size="16" />
            </div>
          </div>
        </article>
      </li>
    </ul>
    <NoData v-else message="메모가 없습니다" />
  </ScrollWrapper>

  <Pagination
    :current-page="currentPage"
    :total-pages="totalPages"
    :items-per-page="itemsPerPage"
    :total-elements="totalElements"
    @update:page="changePage"
    @update:items-per-page="changePageSize"
  />

  <EmptyStubDialog
    v-model:open="shareOpen"
    title="메모 공유"
    description="공유 대상자를 선택하는 팝업입니다."
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
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
import { useMemoList, type MemoItem } from './composable/PM-LPO-0101'

defineOptions({
  name: 'PmLpo0101',
})

// LNB: 개인수첩 > 메모 (presets.ts 에 path 로 등록돼 있음 — openIndex 0, activeChild '메모')
useSideMenuSetup({ ...localPoliceMenu, openIndex: 0, activeChild: '메모' })

const router = useRouter()
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
} = useMemoList()

const shareOpen = ref(false)

function onToggleImportantOnly(value: boolean) {
  form.importantOnly = value
  search() // 기획서 7: 토글 즉시 목록에 반영
}

/** 기획서 8: 제목/카드 클릭 → 상세 화면(PM-LPO-0102, 아직 미구현 → NotReady) */
function openDetail(memo: MemoItem) {
  router.push({ path: '/views/lpo/PM-LPO-0102', query: { id: memo.id } })
}

/** 기획서 11: 작성 버튼 → 등록 화면(PM-LPO-0104, 아직 미구현 → NotReady) */
function goCreate() {
  router.push('/views/lpo/PM-LPO-0104')
}

/** 기획서 8-1: 공유 아이콘 → 공유 대상자 선택 팝업. Figma 미제공이라 빈 스텁 연결 */
function openShare() {
  shareOpen.value = true
}

/**
 * 기획서 10: 삭제는 되돌릴 수 없어 컨펌창을 띄운다(§7 기본 toast 와 다르지만 기획서 지정).
 * 선택 항목에 중요 메모가 있으면 안내 문구가 달라진다.
 */
async function onDeleteSelected() {
  if (!selectedCount.value) {
    toast.warning('삭제할 메모를 선택해 주세요.')
    return
  }
  const hasImportant = allMemos.value.some((m) => selectedIds.value.has(m.id) && m.important)
  const { confirmed } = await dialog.confirm({
    title: '메모 삭제',
    description: hasImportant
      ? '중요 메모를 선택하였습니다. 선택된 메모를 삭제 하시겠습니까?'
      : '삭제된 메모는 복구할 수 없습니다. 선택된 메모를 삭제 하시겠습니까?',
    btnOk: '삭제',
  })
  if (!confirmed) return
  deleteSelected()
  // 사용자 지정: 삭제 완료를 제목 없는 알림 모달로 안내 — §7 기본(toast)과 다르지만 요청대로 따름
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PM-LPO-0101',
  label: '메모',
  path: '/views/lpo/PM-LPO-0101',
  componentName: 'PmLpo0101',
})
</script>
