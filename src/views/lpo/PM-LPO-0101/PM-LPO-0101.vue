<script setup lang="ts">
import { ref } from 'vue'
import { Star, Share2, Paperclip } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import { Tabs, TabsList, TabsTrigger } from '@/components/custom/tabs'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { Checkbox } from '@/components/custom/checkbox'
import { Switch } from '@/components/custom/switch'
import { Button } from '@/components/custom/button'
import Pagination from '@/components/custom/pagination/Pagination.vue'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import { useMemoList, sortOptions } from './composable/useMemoList'
import type { MemoSort } from './composable/useMemoList'
import styles from './style/PM-LPO-0101.module.css'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'

useSideMenuSetup({ ...localPoliceMenu, openIndex: 0, activeChild: '메모' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '개인수첩' },
  { label: '메모' },
]

const {
  activeTab,
  sort,
  importantOnly,
  searchDateFrom,
  searchDateTo,
  searchKeyword,
  pagedMemos,
  selectedIds,
  isAllSelected,
  itemsPerPage,
  currentPage,
  totalPages,
  totalElements,
  search,
  toggleSelectAll,
  toggleSelect,
  toggleImportant,
  deleteSelected,
  changePageSize,
} = useMemoList()

const shareOpen = ref(false)
function openShare() {
  shareOpen.value = true
}
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="메모" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <Tabs v-model="activeTab">
    <TabsList variant="fill" :grow="true">
      <TabsTrigger value="mine">내 메모</TabsTrigger>
      <TabsTrigger value="received">받은 메모</TabsTrigger>
      <TabsTrigger value="sent">보낸 메모</TabsTrigger>
    </TabsList>
  </Tabs>

  <SearchWrapper class="mt-4">
    <template #form>
      <div :class="styles.searchRow">
        <div :class="styles.dateRange" role="group" aria-label="검색기간">
          <DatePicker v-model="searchDateFrom" size="sm" placeholder="시작일" />
          <span :class="styles.dateSeparator" aria-hidden="true">~</span>
          <DatePicker v-model="searchDateTo" size="sm" placeholder="종료일" />
        </div>
        <InputField2
          v-model="searchKeyword"
          size="sm"
          :class="styles.keyword"
          placeholder="검색어를 입력해주세요."
          @keyup.enter="search"
        />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm" @click="search">조회</Button>
    </template>
  </SearchWrapper>

  <div :class="styles.listToolbar">
    <div :class="styles.toolbarLeft">
      <Checkbox
        :model-value="isAllSelected"
        label="전체 선택"
        @update:model-value="(checked) => toggleSelectAll(!!checked)"
      />
      <Button type="button" variant="tertiary2" size="xs" :disabled="!selectedIds.size" @click="deleteSelected">
        선택 삭제
      </Button>
    </div>
    <div :class="styles.toolbarRight">
      <SelectField
        :model-value="sort"
        :options="sortOptions"
        size="sm"
        :trigger-class="styles.sortSelect"
        class="!space-y-0"
        @update:model-value="(v) => (sort = v as MemoSort)"
      />
      <Switch v-model="importantOnly" label="중요 메모만 보기" />
    </div>
  </div>

  <div :class="styles.candidateWrap">
    <span :class="styles.candidateTag">컴포넌트 제작 필요 후보: 메모 카드</span>

    <div :class="styles.grid">
      <article
        v-for="memo in pagedMemos"
        :key="memo.id"
        :class="[styles.card, selectedIds.has(memo.id) && styles.cardSelected]"
      >
        <div :class="styles.cardHead">
          <Checkbox
            :model-value="selectedIds.has(memo.id)"
            :aria-label="`${memo.title} 선택`"
            @update:model-value="(checked) => toggleSelect(memo.id, !!checked)"
          />
          <button type="button" :class="styles.cardTitleLink">{{ memo.title }}</button>
          <div :class="styles.cardActions">
            <button
              type="button"
              :class="[styles.iconButton, memo.important && styles.iconButtonActive]"
              :aria-pressed="memo.important"
              :aria-label="memo.important ? '중요 메모 해제' : '중요 메모로 등록'"
              @click="toggleImportant(memo.id)"
            >
              <Star :size="18" :fill="memo.important ? 'currentColor' : 'none'" />
            </button>
            <button type="button" :class="styles.iconButton" aria-label="메모 공유" @click="openShare">
              <Share2 :size="16" />
            </button>
          </div>
        </div>

        <p :class="styles.cardPreview">{{ memo.preview }}</p>

        <div :class="styles.cardFooter">
          <span>{{ memo.date }} {{ memo.time }}</span>
          <Paperclip v-if="memo.hasAttachment" :size="14" aria-label="첨부파일 있음" />
        </div>
      </article>

      <p v-if="!pagedMemos.length" :class="styles.emptyState">조회된 메모가 없습니다.</p>
    </div>
  </div>

  <div :class="styles.bottomRow">
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :items-per-page="itemsPerPage"
      :total-elements="totalElements"
      @update:page="(page) => (currentPage = page)"
      @update:items-per-page="changePageSize"
    />
  </div>

  <div :class="styles.newMemoRow">
    <Button type="button" variant="primary" size="md">새 메모</Button>
  </div>

  <EmptyStubDialog v-model:open="shareOpen" title="메모 공유" description="메모를 공유할 대상을 선택합니다." />
</template>
