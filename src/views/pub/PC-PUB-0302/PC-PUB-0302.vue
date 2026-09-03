<template>
  <PageHeader>
    <template #left>
      <PageTitle title="단체정보상세" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <div :class="styles.pageActions">
    <p :class="styles.deptLabel"><span :class="styles.deptLabelPrefix">부서:</span> {{ form.dept }}</p>
    <div :class="styles.pageActionButtons">
      <Button type="button" variant="tertiary2" size="sm" class="w-40" @click="goList">목록</Button>
      <Button type="button" variant="tertiary2" size="sm" class="w-40" :disabled="form.id == null" @click="onDelete">삭제</Button>
      <Button type="button" variant="primary" size="sm" class="w-40" @click="onSave">저장</Button>
    </div>
  </div>

  <GroupDetailForm :form="form" mode="edit" />
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
