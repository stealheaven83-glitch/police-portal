<template>
  <PageHeader>
    <template #left>
      <PageTitle title="Q&A" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div class="lp-page-scroll">
    <!-- Figma 11220:71119 "list": 블록 사이 20 균일(.lp-narrow-form gap) / 라벨→입력 8(.lp-field gap) -->
    <div class="lp-narrow-form">
      <!-- 머리줄: 왼쪽 작성자·일시, 오른쪽 공지·비밀글 체크(간격 16, 체크박스 24 + 글자 19) -->
      <div class="lp-row-between">
        <p class="lp-writer-line">
          <b class="lp-writer-line-name">{{ writer }}</b>
          <span class="lp-writer-line-date">{{ writtenAt }}</span>
        </p>
        <span class="lp-radio-inline">
          <Checkbox v-model="form.pinned" size="lg" label="공지" />
          <Checkbox v-model="form.secret" size="lg" label="비밀글" />
        </span>
      </div>

      <div class="lp-field">
        <span class="lp-label-text">카테고리</span>
        <!-- 사용자 지정: 카테고리 칩(Figma chip 11220:71184)은 custom/tabs 의 chip 변형. Tabs 루트의 mb-16 은 여기선 폼 gap 이 대신하므로 뺀다 -->
        <Tabs v-model="form.category" class="mb-0">
          <TabsList variant="chip" aria-label="카테고리">
            <TabsTrigger v-for="opt in qnaCategoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <InputField2
        id="qna-title"
        v-model="form.title"
        label="제목"
        label-position="top"
        size="md"
        placeholder="제목을 입력해주세요."
        :clearable="false"
      />

      <!-- Figma: 등록 화면은 내용 칸 아래 글자수 카운터(0/100)가 있다 — 수정 화면(0403)과 다름 -->
      <TextareaField
        id="qna-content"
        v-model="form.content"
        label="내용"
        placeholder="내용을 입력해주세요."
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
          <!-- 드롭존→개수 20(= field gap 8 + 12), 개수→목록 8, 파일 사이 12 -->
          <p class="lp-file-count lp-file-count-below"><b>{{ fileCount }}개</b></p>
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

      <!-- Figma: 버튼 높이 48(md)·폭 120·사이 12, 폼과 40 -->
      <div class="lp-board-form-actions">
        <Button type="button" variant="tertiary2" size="md" class="w-30" @click="onCancel">취소</Button>
        <Button type="button" variant="primary" size="md" class="w-30" :disabled="!canSave" @click="onSave">저장</Button>
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
import { Checkbox } from '@/components/custom/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/custom/tabs'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { Button } from '@/components/custom/button'
import { FileUpload } from '@/components/custom/file-upload'
import { useDialog } from '@/composable/dialog/dialog'
import { bulletinMenu, CONTENT_MAX_LENGTH, FILE_ACCEPT } from '../composable/notice'
import { qnaCategoryOptions } from '../composable/qna'
import { useQnaCreate } from './composable/PM-COM-0404'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({
  name: 'PmCom0404',
})

// LNB: 게시판 > Q&A
useSideMenuSetup({ ...bulletinMenu, activeChild: 'Q&A' })

const router = useRouter()
const dialog = useDialog()

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: 'Q&A', path: '/views/com/PM-COM-1101' },
]

const { form, writer, writtenAt, fileCount, canSave, addFiles, removeFile } = useQnaCreate()

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
  router.push({ name: 'PM-COM-1101' })
}

/**
 * 사용자 지정(화면 정의서 2-②·③, 공지사항 등록과 같은 흐름): 컨펌 "입력된 내용을 저장 하시겠습니까?"
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
  router.push({ name: 'PM-COM-1101' })
}

useBottomTabSetup({
  value: 'PM-COM-0404',
  label: 'Q&A 등록',
  path: '/views/com/PM-COM-0404',
  componentName: 'PmCom0404',
  closable: true,
})
</script>
