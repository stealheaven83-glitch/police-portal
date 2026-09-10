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

  <NoticeForm :form="form" mode="new" @save="onSave" @cancel="goList" />
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import NoticeForm from '../components/NoticeForm.vue'
import { createEmptyNoticeForm, bulletinMenu } from '../composable/notice'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

defineOptions({
  name: 'PmCom1004',
})

// LNB: 게시판 > 공지사항
useSideMenuSetup({ ...bulletinMenu, activeChild: '공지사항' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '공지사항', path: '/views/com/PM-COM-1001' },
]

const router = useRouter()
/** 등록은 매번 빈 폼에서 시작한다(수정 화면과 달리 싱글턴 폼을 쓰지 않는다) */
const form = reactive(createEmptyNoticeForm())

function goList() {
  router.push({ name: 'PM-COM-1001' })
}

async function onSave() {
  if (!form.title.trim() || !form.content.trim()) {
    await dialog.alert({ title: '필수 항목을 입력해 주세요.', btnCancel: '확인' })
    return
  }
  if (form.important && (!form.importantFrom || !form.importantTo)) {
    await dialog.alert({ title: '중요공지기간을 입력해 주세요.', btnCancel: '확인' })
    return
  }
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  goList()
}

useBottomTabSetup({
  value: 'PM-COM-1004',
  label: '공지사항 등록',
  path: '/views/com/PM-COM-1004',
  componentName: 'PmCom1004',
  closable: true,
})
</script>
