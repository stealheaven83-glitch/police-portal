<template>
  <PageHeader>
    <template #left>
      <PageTitle title="지역경찰 시책" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div class="lp-notice-scroll">
    <!-- Figma 11220:91899: 머리(Detail_title) → 이미지 32 → 본문 32 → 파일 32 → 댓글 32 → 버튼줄 32 -->
    <article class="lp-notice-detail">
      <!-- 시안(11694:40952): 배지 없이 부서명만 온다(19px bold 회색) -->
      <p class="lp-notice-badges">
        <span class="lp-notice-dept">{{ item.dept }}</span>
      </p>

      <h2 class="lp-notice-title">{{ item.title }}</h2>

      <div class="lp-notice-meta">
        <span class="lp-meta-nowrap">
          {{ item.writer }} ｜ {{ item.createdAt }} ｜ 조회수 {{ item.viewCount }}
        </span>
      </div>

      <!-- 본문 대표 이미지 자리 — Figma 는 회색 박스로만 그려져 있다 -->
      <div class="lp-notice-thumb" aria-hidden="true"><img src="/portal/asset/images/img/img_temp.jpg" :alt="item.title"></div>

      <div class="lp-notice-body">
        <p v-for="(line, i) in contentLines" :key="i" class="lp-body-text">{{ line }}</p>
      </div>

      <div v-if="item.files.length" class="lp-file-boxes">
        <FileUpload
          v-for="file in item.files"
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

      <!-- Figma: 버튼 100×40 = sm, 사이 12 -->
      <div class="lp-row-between lp-notice-detail-actions">
        <Button type="button" variant="tertiary2" size="sm" @click="goList">목록</Button>
        <span class="group-gap3">
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
import { Button } from '@/components/custom/button'
import { FileUpload } from '@/components/custom/file-upload'
import { useDialog } from '@/composable/dialog/dialog'
import CommentThread from '../components/CommentThread.vue'
import { bulletinMenu } from '../composable/notice'
import { usePolicyCaseStore } from '../composable/policyCase'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useWorkLayoutSetup } from '@/composable/layout/useWorkLayoutSetup'

defineOptions({
  name: 'PmCom0502',
})

// LNB: 게시판 > 우수사례(items[2]) > 지역경찰 시책
useSideMenuSetup({ ...bulletinMenu, openIndex: 2, activeChild: '지역경찰 시책' })

// 상세는 본문이 하나의 흐름이라 work-body 째로 스크롤돼야 한다(PM-COM-0302 와 같음)
useWorkLayoutSetup({ scrollable: true })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '우수사례' },
  { label: '지역경찰 시책', path: '/views/com/PM-COM-0501' },
]

const router = useRouter()
const dialog = useDialog()

const {
  current: item,
  comments,
  loadEditForm,
  addComment,
  updateComment,
  removeComment,
} = usePolicyCaseStore()

const contentLines = computed(() => item.value.content.split('\n'))

async function onDownload(name: string) {
  await dialog.alert({ title: `${name} 다운로드를 시작합니다.`, btnCancel: '확인' })
}

function goList() {
  router.push({ name: 'PM-COM-0501' })
}

function goEdit() {
  loadEditForm()
  router.push({ name: 'PM-COM-0503' })
}

/** 되돌릴 수 없는 삭제라 컨펌창(CLAUDE.md §4 예외) — 공지사항 상세(PM-COM-0302)와 같은 흐름 */
async function onDelete() {
  const { confirmed } = await dialog.confirm({
    title: '게시글 삭제',
    description: '삭제한 게시글은 복구할 수 없습니다. 삭제 하시겠습니까?',
    btnOk: '삭제',
  })
  if (!confirmed) return
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
  goList()
}

useBottomTabSetup({
  value: 'PM-COM-0502',
  label: '우수사례 상세',
  path: '/views/com/PM-COM-0502',
  componentName: 'PmCom0502',
  closable: true,
})
</script>
