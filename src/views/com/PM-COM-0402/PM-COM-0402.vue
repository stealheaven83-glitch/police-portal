<template>
  <PageHeader>
    <template #left>
      <PageTitle title="Q&A" />
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
      <!-- 시안: 공지(고정) · 카테고리 · 내가 쓴 글 · 공개상태 배지가 한 줄. 공지사항(PM-COM-1002)과 달리 부서는 없다 -->
      <p class="lp-notice-badges">
        <Badge v-if="qna.pinned" color="primary" variant="solid" size="lg" shape="sm">공지</Badge>
        <Badge color="tertiary" variant="outline" size="lg" shape="sm">{{ qnaCategoryLabels[qna.category] }}</Badge>
        <Badge v-if="qna.mine" color="tertiary" variant="outline" size="lg" shape="sm">내가 쓴 글</Badge>
        <Badge color="tertiary" variant="outline" size="lg" shape="sm">{{ qna.open ? '공개' : '비공개' }}</Badge>
      </p>

      <h2 class="lp-notice-title">{{ qna.title }}</h2>

      <!-- 공지사항과 달리 추천수 버튼이 없다 -->
      <div class="lp-notice-meta">
        <span class="lp-meta-nowrap">
          {{ qna.writer }} ｜ {{ qna.createdAt }} ｜ 조회수 {{ qna.viewCount }}
        </span>
      </div>

      <!-- 본문 대표 이미지 자리 — Figma 는 회색 박스로만 그려져 있다 -->
      <div class="lp-notice-thumb" aria-hidden="true"><img src="" :alt="qna.title"></div>

      <div class="lp-notice-body">
        <p v-for="(line, i) in contentLines" :key="i" class="lp-body-text">{{ line }}</p>
      </div>

      <div v-if="qna.files.length" class="lp-file-boxes">
        <FileUpload
          v-for="file in qna.files"
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
import { bulletinMenu } from '../composable/notice'
import { useQnaStore, qnaCategoryLabels } from '../composable/qna'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useWorkLayoutSetup } from '@/composable/layout/useWorkLayoutSetup'

defineOptions({
  name: 'PmCom0402',
})

// LNB: 게시판 > Q&A
useSideMenuSetup({ ...bulletinMenu, activeChild: 'Q&A' })

// 상세는 본문이 하나의 흐름이라 work-body 째로 스크롤돼야 한다(PM-COM-1002 와 같음)
useWorkLayoutSetup({ scrollable: true })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: 'Q&A', path: '/views/com/PM-COM-1101' },
]

const router = useRouter()
const dialog = useDialog()

const {
  current: qna,
  comments,
  loadEditForm,
  addComment,
  updateComment,
  removeComment,
} = useQnaStore()

const contentLines = computed(() => qna.value.content.split('\n'))

async function onDownload(name: string) {
  await dialog.alert({ title: `${name} 다운로드를 시작합니다.`, btnCancel: '확인' })
}

function goList() {
  router.push({ name: 'PM-COM-1101' })
}

/** 수정 화면은 사용자 지정으로 PM-COM-0403 폴더에 있다(Figma 는 PM-COM-1103) */
function goEdit() {
  loadEditForm()
  router.push({ name: 'PM-COM-0403' })
}

/** 되돌릴 수 없는 삭제라 컨펌창(CLAUDE.md §4 예외) — 공지사항 상세(PM-COM-1002)와 같은 흐름 */
async function onDelete() {
  const { confirmed } = await dialog.confirm({
    title: 'Q&A 삭제',
    description: '삭제한 게시글은 복구할 수 없습니다. 삭제 하시겠습니까?',
    btnOk: '삭제',
  })
  if (!confirmed) return
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
  goList()
}

useBottomTabSetup({
  value: 'PM-COM-0402',
  label: 'Q&A 상세',
  path: '/views/com/PM-COM-0402',
  componentName: 'PmCom0402',
  closable: true,
})
</script>
