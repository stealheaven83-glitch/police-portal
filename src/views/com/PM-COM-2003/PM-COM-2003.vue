<template>
  <PageHeader>
    <template #left>
      <PageTitle title="경찰청 주요 정책" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <BoardForm :spec="spec" :form="form" @save="onSave" @cancel="goBack" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import BoardForm from '../components/BoardForm.vue'
import { useBoardStore, boardMenu } from '../composable/board'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({
  name: 'PmCom2003',
})

/** 상세(PM-COM-2002)에서 '수정'을 누르면 loadEditForm() 으로 값이 채워져 넘어온다 */
const { spec, editForm: form } = useBoardStore('policePlan')

// LNB: 게시판 > 현장공감 TalkTalk > 경찰청 주요 정책
useSideMenuSetup({ ...boardMenu, openIndex: spec.openIndex, activeChild: spec.menuChild })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '현장공감 TalkTalk' },
  { label: '경찰청 주요 정책', path: '/views/com/PM-COM-2001' },
]

const router = useRouter()

function goBack() {
  router.push({ name: 'PM-COM-2002' })
}

function onSave() {
  if (!form.title.trim() || !form.content.trim()) {
    toast.warning('필수 항목을 입력해 주세요.')
    return
  }
  if (spec.hasPinned && form.pinned && (!form.pinnedFrom || !form.pinnedTo)) {
    toast.warning('고정공지기간을 입력해 주세요.')
    return
  }
  toast.success('저장되었습니다.')
  goBack()
}

useBottomTabSetup({
  value: 'PM-COM-2003',
  label: '경찰청 주요 정책 수정',
  path: '/views/com/PM-COM-2003',
  componentName: 'PmCom2003',
  closable: true,
})
</script>
