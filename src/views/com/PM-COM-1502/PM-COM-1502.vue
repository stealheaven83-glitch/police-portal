<template>
  <PageHeader>
    <template #left>
      <PageTitle title="상시학습자료" />
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
      <!-- 시안: 공지 배지 + 부서만 온다. 이 게시판은 공개상태·카테고리 칸이 없다 -->
      <p class="lp-notice-badges">
        <Badge v-if="notice.pinned" color="primary" variant="solid" size="lg" shape="sm">공지</Badge>
        <span class="lp-notice-dept">{{ notice.dept }}</span>
      </p>

      <h2 class="lp-notice-title">{{ notice.title }}</h2>

      <div class="lp-notice-meta lp-row-between">
        <span class="lp-meta-nowrap">
          {{ notice.writer }} ｜ {{ notice.createdAt }} ｜ 조회수 {{ notice.viewCount }}
        </span>
      </div>

      <!-- 본문 대표 이미지 자리 — Figma 는 회색 박스로만 그려져 있다 -->
      <div class="lp-notice-thumb" aria-hidden="true"><img src="/portal/asset/images/img/img_temp.jpg" :alt="notice.title"></div>

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
import { boardMenu, useBoardStore } from '../composable/board'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({
  name: 'PmCom1502',
})

// LNB: 게시판 > 교육자료 나눔터 > 상시학습자료
useSideMenuSetup({ ...boardMenu, openIndex: 4, activeChild: '상시학습자료' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '교육자료 나눔터' },
  { label: '상시학습자료', path: '/views/com/PM-COM-1501' },
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
} = useBoardStore('study')

const contentLines = computed(() => notice.value.content.split('\n'))


async function onDownload(name: string) {
  await dialog.alert({ title: `${name} 다운로드를 시작합니다.`, btnCancel: '확인' })
}

function goList() {
  router.push({ name: 'PM-COM-1501' })
}

function goEdit() {
  loadEditForm()
  router.push({ name: 'PM-COM-1503' })
}


async function onDelete() {
  const { confirmed } = await dialog.confirm({
    title: '상시학습자료 삭제',
    description: '삭제한 게시글은 복구할 수 없습니다. 삭제 하시겠습니까?',
    btnOk: '삭제',
  })
  if (!confirmed) return
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
  goList()
}

useBottomTabSetup({
  value: 'PM-COM-1502',
  label: '상시학습자료 상세',
  path: '/views/com/PM-COM-1502',
  componentName: 'PmCom1502',
  closable: true,
})
</script>
