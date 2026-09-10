<template>
  <PageHeader>
    <template #left>
      <PageTitle title="메모" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div class="lp-page-scroll">
    <div class="lp-narrow-form">
      <div class="lp-row-between">
        <span class="lp-meta-nowrap">
          보낸 사람: {{ memo.sender }} ｜ 받은 일시: {{ memo.receivedAt }}
        </span>
        <span class="lp-icon-row">
          <button
            type="button"
            class="lp-icon-btn lp-icon-btn-24"
            :aria-label="memo.important ? '중요 해제' : '중요 표시'"
            @click="toggleImportant"
          >
            <Icon :name="memo.important ? 'starFill' : 'star'" :size="24" />
          </button>
          <button type="button" class="lp-icon-btn lp-icon-btn-24" aria-label="공유" @click="openShare">
            <Icon name="share" :size="24" />
          </button>
        </span>
      </div>

      <div class="lp-field">
        <span class="lp-label-text">제목</span>
        <h2 class="lp-heading-md">{{ memo.title }}</h2>
      </div>

      <div class="lp-field">
        <span class="lp-label-text">내용</span>
        <div>
          <p v-for="(line, i) in contentLines" :key="i" class="lp-body-text">{{ line }}</p>
        </div>
      </div>

      <div class="lp-field">
        <span class="lp-label-text">요약</span>
        <div class="lp-summary-box lp-summary-box-read">
          <p class="lp-body-text">{{ memo.summary }}</p>
        </div>
      </div>

      <div class="lp-field">
        <p class="lp-file-count">첨부파일 <b>{{ memo.attachments.length }}개</b></p>
        <div class="lp-file-boxes">
          <FileUpload
            v-for="file in memo.attachments"
            :key="file.id"
            :file-name="file.name"
            readonly
            @download="onDownload(file)"
            @preview="onPreview(file)"
          />
        </div>
      </div>

      <div class="lp-form-actions-center">
        <Button type="button" variant="tertiary2" size="md" @click="onDelete">삭제</Button>
      </div>
    </div>
  </div>

  <EmptyStubDialog
    v-model:open="shareOpen"
    title="메모 공유"
    description="공유 대상자를 선택하는 팝업입니다."
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import { Button } from '@/components/custom/button'
import { FileUpload } from '@/components/custom/file-upload'
import Icon from '@/components/custom/icon/Icon.vue'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { useMemoDetail, type MemoDetailAttachment } from './composable/PM-LPO-0102'

defineOptions({
  name: 'PmLpo0102',
})

// LNB: 개인수첩 > 메모 (PM-LPO-0101 과 같은 메뉴 항목)
useSideMenuSetup({ ...localPoliceMenu, openIndex: 0, activeChild: '메모' })

const router = useRouter()
const dialog = useDialog()

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '개인수첩' },
  { label: '메모', path: '/views/lpo/PM-LPO-0101' },
]

const { memo, toggleImportant } = useMemoDetail()

const contentLines = computed(() => memo.value.content.split('\n'))

const shareOpen = ref(false)

function openShare() {
  shareOpen.value = true
}

/** 실제 다운로드/미리보기는 개발팀 몫 — 화면에서는 눌린 것만 알린다 */
async function onDownload(file: MemoDetailAttachment) {
  await dialog.alert({ title: `${file.name} 다운로드를 시작합니다.`, btnCancel: '확인' })
}

async function onPreview(file: MemoDetailAttachment) {
  await dialog.alert({ title: `${file.name} 을(를) 새 창에서 엽니다.`, btnCancel: '확인' })
}

/** 삭제는 되돌릴 수 없어 컨펌창을 띄운다(PM-LPO-0101 목록의 선택 삭제와 같은 문구) */
async function onDelete() {
  const { confirmed } = await dialog.confirm({
    title: '메모 삭제',
    description: '삭제된 메모는 복구할 수 없습니다. 이 메모를 삭제 하시겠습니까?',
    btnOk: '삭제',
  })
  if (!confirmed) return
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
  router.push('/views/lpo/PM-LPO-0101')
}

useBottomTabSetup({
  value: 'PM-LPO-0102',
  label: '메모 상세',
  path: '/views/lpo/PM-LPO-0102',
  componentName: 'PmLpo0102',
})
</script>
