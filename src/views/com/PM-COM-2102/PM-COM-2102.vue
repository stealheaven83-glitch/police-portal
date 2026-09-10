<template>
  <PageHeader>
    <template #left>
      <PageTitle title="정책 제안 및 건의사항" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <BoardDetail
    :spec="spec"
    :post="post"
    @list="goList"
    @edit="goEdit"
    @remove="onDelete"
    @recommend="toggleRecommend"
  >
    <CommentThread
      :comments="comments"
      @add="addComment"
      @update="updateComment"
      @remove="removeComment"
    />
  </BoardDetail>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import { useDialog } from '@/composable/dialog/dialog'
import BoardDetail from '../components/BoardDetail.vue'
import CommentThread from '../components/CommentThread.vue'
import { useBoardStore, boardMenu } from '../composable/board'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({
  name: 'PmCom2102',
})

const {
  spec,
  current: post,
  comments,
  loadEditForm,
  toggleRecommend,
  addComment,
  updateComment,
  removeComment,
} = useBoardStore('proposal')

// LNB: 게시판 > 현장공감 TalkTalk > 정책 제안 및 건의사항
useSideMenuSetup({ ...boardMenu, openIndex: spec.openIndex, activeChild: spec.menuChild })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '현장공감 TalkTalk' },
  { label: '정책 제안 및 건의사항', path: '/views/com/PM-COM-2101' },
]

const router = useRouter()
const dialog = useDialog()

function goList() {
  router.push({ name: 'PM-COM-2101' })
}

function goEdit() {
  loadEditForm()
  router.push({ name: 'PM-COM-2103' })
}

/** 삭제는 되돌릴 수 없어 컨펌창을 띄운다(CLAUDE.md §4 예외) */
async function onDelete() {
  const { confirmed } = await dialog.confirm({
    title: '정책 제안 및 건의사항 삭제',
    description: '삭제한 게시글은 복구할 수 없습니다. 삭제 하시겠습니까?',
    btnOk: '삭제',
  })
  if (!confirmed) return
  toast.success('삭제되었습니다.')
  goList()
}

useBottomTabSetup({
  value: 'PM-COM-2102',
  label: '정책 제안 및 건의사항 상세',
  path: '/views/com/PM-COM-2102',
  componentName: 'PmCom2102',
  closable: true,
})
</script>
