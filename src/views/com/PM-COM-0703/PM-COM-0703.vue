<template>
  <PageHeader>
    <template #left>
      <PageTitle title="교육훈련 우수사례" />
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

      <div class="lp-field">
        <span class="lp-label-text">부서명</span>
        <!-- Figma selectbox ×3(전체/전체/전체) = 상위 → 하위 → 세부 3단 부서 셀렉트.
             컴포넌트가 항상 유효한 값으로 보정해서 첫 칸은 placeholder 대신 첫 옵션(본청)이 보인다 -->
        <DepartmentCascadeSelect v-model="dept" size="md" class="lp-dept-fill" />
      </div>

      <InputField2
        id="training-title"
        v-model="form.title"
        label="제목"
        label-position="top"
        size="md"
        placeholder="제목을 입력해주세요."
        :clearable="false"
      />

      <TextareaField
        id="training-content"
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
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import { FileUpload } from '@/components/custom/file-upload'
import { useDialog } from '@/composable/dialog/dialog'
import { boardMenu, CONTENT_MAX_LENGTH, FILE_ACCEPT } from '../composable/board'
import { useTrainingEdit } from './composable/PM-COM-0703'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({
  name: 'PmCom0703',
})

// LNB: 게시판 > 교육자료 나눔터 > 교육훈련 우수사례
useSideMenuSetup({ ...boardMenu, openIndex: 4, activeChild: '교육훈련 우수사례' })

const router = useRouter()
const dialog = useDialog()

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '교육자료 나눔터' },
  { label: '교육훈련 우수사례', path: '/views/com/PM-COM-0701' },
]

const { form, writer, writtenAt, dept, fileCount, canSave, addFiles, removeFile } = useTrainingEdit()

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

function onCancel() {
  router.push({ name: 'PM-COM-0702' })
}

/**
 * 사용자 지정(화면 정의서 2-①·③): 제목이 있으면 컨펌 "수정된 내용을 저장 하시겠습니까?"
 *  - 취소: 컨펌만 닫고 화면 변동 없음
 *  - 확인: 저장 후 목록으로 이동(목록은 라우트 이동으로 다시 그려진다 = 새로고침)
 * 제목이 없는 경우는 버튼 자체가 비활성(등록 시안 PM-COM-0704 와 같은 규칙)이라 여기까지 오지 않는다.
 * CLAUDE.md §4 기본(알림창)과 다르지만 요청대로 완료 알림은 띄우지 않는다.
 */
async function onSave() {
  if (!canSave.value) return
  const { confirmed } = await dialog.confirm({
    title: '수정된 내용을 저장 하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!confirmed) return
  router.push({ name: 'PM-COM-0701' })
}

useBottomTabSetup({
  value: 'PM-COM-0703',
  label: '교육훈련 우수사례 수정',
  path: '/views/com/PM-COM-0703',
  componentName: 'PmCom0703',
  closable: true,
})
</script>
