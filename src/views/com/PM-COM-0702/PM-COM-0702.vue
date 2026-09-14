<template>
  <PageHeader>
    <template #left>
      <PageTitle :title="spec.title" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div class="lp-notice-scroll">
    <article class="lp-notice-detail">
      <!-- 시안: 공지 배지 + 부서만 온다. 이 게시판은 공개상태·카테고리 칸이 없다(board.ts training 스펙) -->
      <p class="lp-notice-badges">
        <Badge v-if="spec.hasPinned && notice.pinned" color="primary" variant="solid" size="lg" shape="sm">공지</Badge>
        <span class="lp-notice-dept">{{ notice.dept }}</span>
      </p>

      <h2 class="lp-notice-title">{{ notice.title }}</h2>

      <div class="lp-notice-meta lp-row-between">
        <span class="lp-meta-nowrap">
          {{ notice.writer }} ｜ {{ notice.createdAt }} ｜ 조회수 {{ notice.viewCount }}
        </span>
      </div>

      <!-- 본문 대표 이미지 자리 — Figma 는 회색 박스로만 그려져 있다 -->
      <div class="lp-notice-thumb" aria-hidden="true"><img src="" :alt="notice.title"></div>

      <div class="lp-notice-body">
        <p v-for="(line, i) in contentLines" :key="i" class="lp-body-text">{{ line }}</p>
      </div>

      <div v-if="notice.files.length" class="lp-file-boxes">
        <FileUpload
          v-for="file in notice.files"
          :key="file.id"
          :file-name="file.name"
          readonly
          :show-preview="false"
          @download="onDownload(file.name)"
        />
      </div>

      <CommentThread
        :comments="comments"
        @add="addComment"
        @update="updateComment"
        @remove="removeComment"
      />

      <div class="lp-row-between lp-notice-detail-actions">
        <Button type="button" variant="tertiary2" size="sm" @click="goList">목록</Button>
        <span class="group-gap2">
          <Button type="button" variant="tertiary2" size="sm" @click="onDelete">삭제</Button>
          <Button type="button" variant="primary" size="sm" @click="goEdit">수정</Button>
        </span>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import { Badge } from '@/components/custom/badge'
import { Button } from '@/components/custom/button'
import { FileUpload } from '@/components/custom/file-upload'
import { useDialog } from '@/composable/dialog/dialog'
import CommentThread from '../components/CommentThread.vue'
import { BOARD_SPECS, boardMenu, useBoardStore } from '../composable/board'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useWorkLayoutSetup } from '@/composable/layout/useWorkLayoutSetup'

defineOptions({
  name: 'PmCom0702',
})

/** 게시판 구성은 board.ts 의 스펙 하나로 정해진다(제목·브레드크럼·LNB·칸 유무) */
const spec = BOARD_SPECS.training

// LNB: 게시판 > 교육자료 나눔터 > 교육훈련 우수사례
useSideMenuSetup({ ...boardMenu, openIndex: spec.openIndex, activeChild: spec.menuChild })

// 상세는 본문이 하나의 흐름이라 work-body 째로 스크롤돼야 한다
useWorkLayoutSetup({ scrollable: true })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  ...spec.breadcrumb.slice(0, -1).map((label) => ({ label })),
  { label: spec.title, path: `/views/com/${spec.listId}` },
]

const router = useRouter()
const dialog = useDialog()

const {
  current: notice,
  comments,
  loadEditForm,
  addComment,
  updateComment,
  removeComment,
} = useBoardStore('training')

const contentLines = computed(() => notice.value.content.split('\n'))


async function onDownload(name: string) {
  await dialog.alert({ title: `${name} 다운로드를 시작합니다.`, btnCancel: '확인' })
}

function goList() {
  router.push({ name: 'PM-COM-0701' })
}

function goEdit() {
  loadEditForm()
  router.push({ name: 'PM-COM-0703' })
}


async function onDelete() {
  const { confirmed } = await dialog.confirm({
    title: `${spec.title} 삭제`,
    description: '삭제한 게시글은 복구할 수 없습니다. 삭제 하시겠습니까?',
    btnOk: '삭제',
  })
  if (!confirmed) return
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
  goList()
}

useBottomTabSetup({
  value: 'PM-COM-0702',
  label: `${spec.title} 상세`,
  path: '/views/com/PM-COM-0702',
  componentName: 'PmCom0702',
  closable: true,
})
</script>
