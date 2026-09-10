<template>
  <PageHeader>
    <template #left>
      <PageTitle title="범죄예방진단" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <BoardForm :spec="spec" :form="form" @save="onSave" @cancel="goList" />
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import BoardForm from '../components/BoardForm.vue'
import { BOARD_SPECS, createEmptyBoardForm, boardMenu } from '../composable/board'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({
  name: 'PmCom1904',
})

const spec = BOARD_SPECS.cpted

// LNB: 게시판 > 자료실 > 범죄예방진단
useSideMenuSetup({ ...boardMenu, openIndex: spec.openIndex, activeChild: spec.menuChild })

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '자료실' },
  { label: '범죄예방진단', path: '/views/com/PM-COM-1901' },
]

const router = useRouter()
/** 등록은 매번 빈 폼에서 시작한다(수정 화면과 달리 싱글턴 폼을 쓰지 않는다) */
const form = reactive(createEmptyBoardForm())

function goList() {
  router.push({ name: 'PM-COM-1901' })
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
  goList()
}

useBottomTabSetup({
  value: 'PM-COM-1904',
  label: '범죄예방진단 등록',
  path: '/views/com/PM-COM-1904',
  componentName: 'PmCom1904',
  closable: true,
})
</script>
