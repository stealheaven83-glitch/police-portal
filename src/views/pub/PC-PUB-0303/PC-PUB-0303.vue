<template>
  <PageHeader>
    <template #left>
      <PageTitle title="단체정보등록" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>
  <SearchWrapper>
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department4Search" size="sm" />
    </template>
    <template #topRightSection>
      <div class="group-gap3">
        <Button type="button" variant="tertiary2" size="sm" @click="goList">목록</Button>
        <Button type="button" variant="tertiary2" size="sm" @click="onDelete">삭제</Button>
        <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
      </div>
    </template>
  </SearchWrapper>
  <ScrollWrapper>
    <GroupDetailForm :form="form" mode="edit" /> 
  </ScrollWrapper>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import { Button } from '@/components/custom/button'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useDialog } from '@/composable/dialog/dialog'
import GroupDetailForm from '../components/GroupDetailForm.vue'
import { usePublicSafetyStore, createEmptyGroupForm } from '../composable/publicSafety'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import ScrollWrapper from '@/components/custom/ScrollWrapper.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
defineOptions({ name: 'PcPub0303' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '방범협력단체' },
  { label: '단체정보리스트' },
]

const router = useRouter()
const store = usePublicSafetyStore()
const dialog = useDialog()
const form = reactive(createEmptyGroupForm())

/* ── 상단 SearchWrapper (PC-LPO-0601 과 같은 구성) ─────────────── */
/** 부서 선택 — 조회 조건이라 폼과는 별개다 */
const department4Search = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })

function goList() {
  router.push({ name: 'PC-PUB-0301' })
}

/**
 * 등록 화면이라 아직 저장 전이면 지울 대상이 없다(id 가 없다).
 * 저장 뒤 같은 화면에 남아 있는 상태에서만 실제로 지운다 — PC-PUB-0302 의 삭제와 같은 조건.
 */
async function onDelete() {
  if (form.id == null) {
    await dialog.alert({ title: '삭제할 항목을 선택해 주세요.', btnCancel: '확인' })
    return
  }

  const result = await dialog.confirm({
    title: '삭제하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  store.deleteGroup(form.id)
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
  goList()
}

async function onSave() {
  if (!form.groupName.trim() || !form.groupType) {
    await dialog.alert({ title: '필수 항목을 입력해 주세요.', btnCancel: '확인' })
    return
  }

  // 사용자 지정: 저장 전 컨펌창 + 완료 알림창 (CLAUDE.md 4장 기본은 컨펌 없이 toast)
  const result = await dialog.confirm({
    title: '저장 하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  store.saveGroup(form)
  await dialog.alert({ title: '등록 되었습니다.', btnCancel: '확인' })
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
