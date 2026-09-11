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
        <span class="lp-meta-nowrap">{{ writtenAt }}</span>
        <span class="lp-icon-row">
          <!-- 2026-09-11 컴포넌트로 교체: button.lp-icon-btn -> Button variant="icon" -->
          <Button
            variant="icon"
            :aria-label="important ? '중요 해제' : '중요 표시'"
            @click="toggleImportant"
          >
            <Icon :name="important ? 'starFill' : 'star'" :size="24" />
          </Button>
          <Button variant="icon" aria-label="공유" @click="openShare">
            <Icon name="share" :size="24" />
          </Button>
        </span>
      </div>

      <InputField2
        id="memo-title"
        v-model="form.title"
        label="제목"
        size="md"
        placeholder="제목을 입력해주세요."
      />

      <TextareaField
        id="memo-content"
        v-model="form.content"
        label="내용"
        placeholder="내용을 입력해주세요."
        :maxlength="CONTENT_MAX_LENGTH"
        show-count
        :height="120"
      />

      <div class="lp-field">
        <span class="lp-label-text">요약</span>
        <div class="lp-summary-box" :class="{ 'lp-summary-box-filled': summaryState === 'done' }">
          <template v-if="summaryState === 'done'">
            <p class="lp-note-text">{{ summary }}</p>
          </template>
          <div v-else-if="summaryState === 'loading'" class="lp-summary-loading">
            <Spinner size="medium" label="요약 중" />
            <span>메모 내용을 요약하는 중... {{ summaryProgress }}%</span>
          </div>
          <p v-else class="lp-note-text">내용을 입력하면 요약이 생성됩니다.</p>
        </div>
        <div v-if="summaryState === 'done'" class="lp-summary-redo">
          <Button type="button" variant="tertiary2" size="sm" padding="12" @click="requestSummary">
            <RotateCw class="size-4" />
            다시 요약
          </Button>
        </div>
      </div>

      <div class="lp-field">
        <span class="lp-label-text">첨부파일</span>

        <div v-if="canAddAttachment" class="lp-dropzone" @dragover.prevent @drop.prevent="onDrop">
          <div class="lp-dropzone-txt">
            <p>첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 직접 선택해주세요.</p>
            <p class="lp-dropzone-sub">
              최대 {{ MAX_ATTACHMENTS }}개 파일 (jpg, jpeg, png, pdf, mp4) | 파일당 최대 000MB
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" padding="12" @click="pickFile">
            파일선택
          </Button>
          <input
            ref="fileInputRef"
            type="file"
            class="lp-hidden-input"
            :accept="ATTACHMENT_ACCEPT"
            @change="onPickFile"
          >
        </div>

        <div class="lp-file-list">
          <p class="lp-file-count"><b>{{ attachmentCount }}개</b> / {{ MAX_ATTACHMENTS }}개</p>
          <div class="lp-file-boxes">
            <FileUpload
              v-for="file in attachments"
              :key="file.id"
              :file-name="file.name"
              :uploading="file.uploading"
              @remove="removeAttachment(file.id)"
            />
          </div>
        </div>
      </div>

      <div class="lp-form-actions-center">
        <Button type="button" variant="tertiary2" size="md" @click="onCancel">취소</Button>
        <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { RotateCw } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { Button } from '@/components/custom/button'
import { Spinner } from '@/components/custom/spinner'
import { FileUpload } from '@/components/custom/file-upload'
import Icon from '@/components/custom/icon/Icon.vue'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  useMemoWrite,
  MAX_ATTACHMENTS,
  ATTACHMENT_ACCEPT,
  CONTENT_MAX_LENGTH,
} from './composable/PM-LPO-0104'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

defineOptions({
  name: 'PmLpo0104',
})

// LNB: 개인수첩 > 메모 (PM-LPO-0101 과 같은 메뉴 항목)
useSideMenuSetup({ ...localPoliceMenu, openIndex: 0, activeChild: '메모' })

const router = useRouter()

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '개인수첩' },
  { label: '메모', path: '/views/lpo/PM-LPO-0101' },
]

const {
  form,
  writtenAt,
  important,
  summary,
  summaryState,
  summaryProgress,
  attachments,
  attachmentCount,
  canAddAttachment,
  toggleImportant,
  addAttachment,
  removeAttachment,
  requestSummary,
} = useMemoWrite()

const shareOpen = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function openShare() {
  shareOpen.value = true
}

function pickFile() {
  fileInputRef.value?.click()
}

function onPickFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) addAttachment(file)
  input.value = ''
}

function onDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) addAttachment(file)
}

function onCancel() {
  router.push('/views/lpo/PM-LPO-0101')
}

async function onSave() {
  if (!form.title.trim() || !form.content.trim()) {
    await dialog.alert({ title: '필수 항목을 입력해 주세요.', btnCancel: '확인' })
    return
  }
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  router.push('/views/lpo/PM-LPO-0101')
}

useBottomTabSetup({
  value: 'PM-LPO-0104',
  label: '메모 작성',
  path: '/views/lpo/PM-LPO-0104',
  componentName: 'PmLpo0104',
})
</script>
