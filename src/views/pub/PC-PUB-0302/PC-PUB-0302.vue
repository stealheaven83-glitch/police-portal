<template>
  <PageHeader>
    <template #left>
      <PageTitle title="단체정보상세" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div class="list-actions space-between">
    <p class="list-actions-title"><span class="list-actions-part">부서:</span> {{ form.dept }}</p>
    <div class="group-gap3">
      <Button type="button" variant="tertiary2" size="sm" @click="goList">목록</Button>
      <Button type="button" variant="tertiary2" size="sm" @click="onDelete">삭제</Button>
      <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
    </div>
  </div>
<ScrollWrapper>
  <GroupDetailForm :form="form" mode="edit" /> 
  </ScrollWrapper>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
import HelpButton from '@/components/custom/button/HelpButton.vue'
import ScrollWrapper from '@/components/custom/ScrollWrapper.vue'
defineOptions({ name: 'PcPub0302' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '방범협력단체' },
  { label: '단체정보리스트' },
]

const route = useRoute()
const router = useRouter()
const store = usePublicSafetyStore()
const form = reactive(createEmptyGroupForm())

/** 목록에서 row 클릭으로 들어올 때마다 query.id 가 바뀔 수 있어(다른 행 클릭) route 를 계속 지켜본다 */
function loadFromQuery() {
  const id = Number(route.query.id)
  const group = Number.isFinite(id) ? store.findGroup(id) : undefined
  Object.assign(form, group ? { ...group, equipmentSupport: [...group.equipmentSupport], budgetSupport: [...group.budgetSupport], awards: [...group.awards] } : createEmptyGroupForm())
}

watch(() => route.query.id, loadFromQuery, { immediate: true })

function goList() {
  router.push({ name: 'PC-PUB-0301' })
}

function onSave() {
  if (!form.groupName.trim() || !form.groupType) {
    toast.warning('필수 항목을 입력해 주세요.')
    return
  }
  store.saveGroup(form)
  toast.success('저장되었습니다.')
}

function onDelete() {
  if (form.id == null) return
  store.deleteGroup(form.id)
  toast.success('삭제되었습니다.')
  goList()
}

useSideMenuSetup({ ...publicSafetyMenu, activeChild: '단체정보리스트', openIndex: 2 })

useBottomTabSetup({
  value: 'PC-PUB-0302',
  label: '단체정보상세',
  path: '/views/pub/PC-PUB-0302',
  componentName: 'PcPub0302',
  closable: true,
})
</script>
