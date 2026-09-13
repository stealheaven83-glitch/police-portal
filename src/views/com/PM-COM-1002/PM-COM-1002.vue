<template>
  <PageHeader>
    <template #left>
      <PageTitle title="공지사항" />
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
      <!-- 시안: 중요 배지 + 부서만 온다. 공지사항은 공개상태 칸이 없다(설계서 8장 표) -->
      <p class="lp-notice-badges">
        <Badge v-if="notice.important" color="point" variant="solid" size="md" shape="sm">중요</Badge>
        <span class="lp-notice-dept">{{ notice.dept }}</span>
      </p>

      <h2 class="lp-notice-title">{{ notice.title }}</h2>

      <div class="lp-notice-meta lp-row-between">
        <span class="lp-meta-nowrap">
          {{ notice.writer }} ｜ {{ notice.createdAt }} ｜ 조회수 {{ notice.viewCount }}
        </span>
        <Button type="button" variant="tertiary2" size="sm" @click="toggleRecommend">
          <ThumbsUp :size="16" aria-hidden="true" />
          추천수 <b>{{ notice.recommendCount }}</b>
        </Button>
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
        <Button type="button" variant="tertiary2" size="md" @click="goList">목록</Button>
        <span class="group-gap2">
          <Button type="button" variant="tertiary2" size="md" @click="onDelete">삭제</Button>
          <Button type="button" variant="primary" size="md" @click="goEdit">수정</Button>
        </span>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ThumbsUp } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import { Badge } from '@/components/custom/badge'
import { Button } from '@/components/custom/button'
import { FileUpload } from '@/components/custom/file-upload'
import { useDialog } from '@/composable/dialog/dialog'
import CommentThread from '../components/CommentThread.vue'
import { useNoticeStore, bulletinMenu } from '../composable/notice'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useWorkLayoutSetup } from '@/composable/layout/useWorkLayoutSetup'

defineOptions({
  name: 'PmCom1002',
})

// LNB: 게시판 > 공지사항
useSideMenuSetup({ ...bulletinMenu, activeChild: '공지사항' })

// 공지 상세는 본문이 하나의 흐름이라 work-body 째로 스크롤돼야 한다
useWorkLayoutSetup({ scrollable: true })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '공지사항', path: '/views/com/PM-COM-1001' },
]

const router = useRouter()
const dialog = useDialog()

const {
  current: notice,
  comments,
  loadEditForm,
  toggleRecommend,
  addComment,
  updateComment,
  removeComment,
} = useNoticeStore()

const contentLines = computed(() => notice.value.content.split('\n'))


async function onDownload(name: string) {
  await dialog.alert({ title: `${name} 다운로드를 시작합니다.`, btnCancel: '확인' })
}

function goList() {
  router.push({ name: 'PM-COM-1001' })
}

function goEdit() {
  loadEditForm()
  router.push({ name: 'PM-COM-1003' })
}


async function onDelete() {
  const { confirmed } = await dialog.confirm({
    title: '공지사항 삭제',
    description: '삭제한 게시글은 복구할 수 없습니다. 삭제 하시겠습니까?',
    btnOk: '삭제',
  })
  if (!confirmed) return
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
  goList()
}

useBottomTabSetup({
  value: 'PM-COM-1002',
  label: '공지사항 상세',
  path: '/views/com/PM-COM-1002',
  componentName: 'PmCom1002',
  closable: true,
})
</script>
