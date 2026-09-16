<template>
  <PageHeader>
    <template #left>
      <PageTitle title="법령 · 지침 · 매뉴얼" />
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
      <!-- 시안: 작성자 줄 오른쪽 끝에 '공지' 체크박스가 온다 -->
      <div class="lp-row-between">
        <p class="lp-writer-line">
          <b class="lp-writer-line-name">{{ writer }}</b>
          <span class="lp-writer-line-date">{{ writtenAt }}</span>
        </p>
        <span class="lp-radio-inline">
          <Checkbox v-model="form.pinned" size="lg" label="공지" />
        </span>
      </div>

      <InputField2
        id="law-title"
        v-model="form.title"
        label="제목"
        label-position="top"
        size="md"
        placeholder="제목을 입력해주세요."
        :clearable="false"
      />

      <TextareaField
        id="law-content"
        v-model="form.content"
        label="내용"
        placeholder="내용을 입력하세요"
        :maxlength="CONTENT_MAX_LENGTH"
        show-count
        :height="144"
      />

      <div class="lp-field">
        <span class="lp-label-text">첨부파일</span>

        <div class="lp-dropzone" @dragover.prevent @drop.prevent="onDrop">
          <div class="lp-dropzone-txt">
            <p>첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 직접 선택해주세요.</p>
            <p class="lp-dropzone-sub">
              <span>업로드 가능 파일 (jpg, jpeg, png, pdf, mp4)</span>
              <span>파일용량이 클 경우 시간이 오래 걸릴 수 있습니다.</span>
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" padding="16" @click="pickFile">파일선택</Button>
          <input
            ref="fileInputRef"
            type="file"
            multiple
            :accept="FILE_ACCEPT"
            hidden
            @change="onFilePick"
          >
        </div>

        <template v-if="fileCount">
          <p class="lp-file-count lp-file-count-below"><b>{{ fileCount }}개</b></p>
          <!-- 파일 한 줄 = 공통 FileUpload(Figma file_upload__atomic__pc): 업로드 중이면 스피너, 끝나면 '삭제 ⨯' -->
          <div class="lp-file-list">
            <FileUpload
              v-for="file in form.files"
              :key="file.id"
              :file-name="file.name"
              :uploading="file.uploading"
              variant="circle"
              @remove="removeFile(file.id)"
            />
          </div>
        </template>
      </div>

      <div class="lp-board-form-actions">
        <!-- 제목이 비면 저장은 비활성 -->
        <Button type="button" variant="tertiary2" size="md" @click="onCancel">취소</Button>
        <Button type="button" variant="primary" size="md" :disabled="!canSave" @click="onSave">저장</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import { FileUpload } from '@/components/custom/file-upload'
import { useDialog } from '@/composable/dialog/dialog'
import { boardMenu, CONTENT_MAX_LENGTH, FILE_ACCEPT } from '../composable/board'
import { useLawCreate } from './composable/PM-COM-0712'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({
  name: 'PmCom0712',
})

// LNB: 게시판 > 교육자료 나눔터 > 법령 · 지침 · 매뉴얼
useSideMenuSetup({ ...boardMenu, openIndex: 4, activeChild: '법령 · 지침 · 매뉴얼' })

const router = useRouter()
const dialog = useDialog()

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '교육자료 나눔터' },
  { label: '법령 · 지침 · 매뉴얼', path: '/views/com/PM-COM-0709' },
]

const { form, writer, writtenAt, fileCount, canSave, addFiles, removeFile } = useLawCreate()

const fileInputRef = ref<HTMLInputElement | null>(null)

function pickFile() {
  fileInputRef.value?.click()
}

function onFilePick(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) addFiles(input.files)
  input.value = ''
}

function onDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (files?.length) addFiles(files)
}

/** 등록은 목록의 '작성' 버튼에서 들어오므로 취소하면 목록으로 돌아간다 */
function onCancel() {
  router.push({ name: 'PM-COM-0709' })
}

/**
 * 사용자 지정(화면 정의서 2-②·③): 컨펌 "입력된 내용을 저장 하시겠습니까?"
 *  - 취소: 컨펌만 닫고 화면 변동 없음
 *  - 확인: 저장 후 목록으로 이동(목록은 라우트 이동으로 다시 그려진다 = 새로고침)
 * 제목이 없는 경우는 버튼 자체가 비활성(Figma)이라 여기까지 오지 않는다.
 * CLAUDE.md §4 기본(알림창)과 다르지만 요청대로 완료 알림은 띄우지 않는다.
 */
async function onSave() {
  if (!canSave.value) return
  const { confirmed } = await dialog.confirm({
    title: '입력된 내용을 저장 하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!confirmed) return
  router.push({ name: 'PM-COM-0709' })
}

useBottomTabSetup({
  value: 'PM-COM-0712',
  label: '법령 · 지침 · 매뉴얼 등록',
  path: '/views/com/PM-COM-0712',
  componentName: 'PmCom0712',
  closable: true,
})
</script>
