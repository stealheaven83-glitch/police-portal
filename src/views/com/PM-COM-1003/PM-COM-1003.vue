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

  <NoticeForm :form="form" mode="edit" @save="onSave" @cancel="goBack" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import NoticeForm from '../components/NoticeForm.vue'
import { useNoticeStore, bulletinMenu } from '../composable/notice'

defineOptions({
  name: 'PmCom1003',
})

// LNB: 게시판 > 공지사항
useSideMenuSetup({ ...bulletinMenu, activeChild: '공지사항' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '공지사항', path: '/views/com/PM-COM-1001' },
]

const router = useRouter()
/** 상세(PM-COM-1002)에서 '수정'을 누르면 loadEditForm() 으로 값이 채워져 넘어온다 */
const { editForm: form } = useNoticeStore()

function goBack() {
  router.push({ name: 'PM-COM-1002' })
}

function onSave() {
  if (!form.title.trim() || !form.content.trim()) {
    toast.warning('필수 항목을 입력해 주세요.')
    return
  }
  if (form.important && (!form.importantFrom || !form.importantTo)) {
    toast.warning('중요공지기간을 입력해 주세요.')
    return
  }
  toast.success('저장되었습니다.')
  goBack()
}

useBottomTabSetup({
  value: 'PM-COM-1003',
  label: '공지사항 수정',
  path: '/views/com/PM-COM-1003',
  componentName: 'PmCom1003',
  closable: true,
})
</script>
