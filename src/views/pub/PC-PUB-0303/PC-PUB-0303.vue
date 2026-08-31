<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import { Button } from '@/components/custom/button'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import GroupDetailForm from '../components/GroupDetailForm.vue'
import { usePublicSafetyStore, createEmptyGroupForm } from '../composable/publicSafety'
import styles from '../style/pageActions.module.css'

defineOptions({ name: 'PcPub0303' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '방범협력단체' },
  { label: '단체정보리스트' },
]

const router = useRouter()
const store = usePublicSafetyStore()
const form = reactive(createEmptyGroupForm())

function goList() {
  router.push({ name: 'PC-PUB-0301' })
}

function onSave() {
  if (!form.groupName.trim() || !form.groupType) {
    toast.warning('필수 항목을 입력해 주세요.')
    return
  }
  store.saveGroup(form)
  toast.success('등록되었습니다.')
  goList()
}

useSideMenuSetup({ ...publicSafetyMenu, activeChild: '단체정보리스트', openIndex: 2 })

useBottomTabSetup({
  value: 'PC-PUB-0303',
  label: '단체정보등록',
  path: '/views/pub/PC-PUB-0303',
  componentName: 'PcPub0303',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="단체정보등록" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <div :class="styles.pageActions">
    <div :class="styles.pageActionButtons">
      <Button type="button" variant="tertiary2" size="sm" @click="goList">목록</Button>
      <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
    </div>
  </div>

  <GroupDetailForm :form="form" mode="new" />
</template>
