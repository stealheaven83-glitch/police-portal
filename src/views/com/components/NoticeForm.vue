<template>
  <div class="lp-page-scroll">
    <div class="lp-notice-form">
      <p class="lp-row-between">
        <b class="lp-heading-md">{{ writer }}</b>
        <span class="lp-meta-nowrap">{{ writtenAt }}</span>
      </p>

      <div class="lp-field">
        <label class="lp-label-text" for="notice-dept">부서명</label>
        <span class="lp-field-inline">
          <InputField2
            id="notice-dept"
            v-model="form.dept"
            size="md"
            placeholder="부서명"
            class="lp-flex-fill"
            inputClass="w-full"
          />
          <Button type="button" variant="secondary" size="md" @click="deptSearchOpen = true">부서 검색</Button>
        </span>
      </div>

      <div class="lp-field-row">
        <div class="lp-field">
          <span class="lp-label-text">중요공지</span>
          <Switch v-model="form.important" variant="none" aria-label="중요공지" />
        </div>
        <div class="lp-field lp-flex-fill">
          <span class="lp-label-text">중요공지기간</span>
          <DateRangePicker
            v-model:from="form.importantFrom"
            v-model:to="form.importantTo"
            from-label="중요공지 시작일"
            to-label="중요공지 종료일"
            size="md"
            :disabled="!form.important"
          />
        </div>
      </div>

      <InputField2
        id="notice-title"
        v-model="form.title"
        label="제목"
        size="md"
        placeholder="제목을 입력해주세요."
      />

      <TextareaField
        id="notice-content"
        v-model="form.content"
        label="내용"
        placeholder="내용을 입력하세요"
        :maxlength="CONTENT_MAX_LENGTH"
        show-count
        :height="120"
      />

      <div class="lp-field">
        <span class="lp-label-text">첨부파일</span>
        <div class="lp-dropzone" @dragover.prevent @drop.prevent="onDrop">
          <div class="lp-dropzone-txt">
            <p>{{ dropzoneText }}</p>
            <p class="lp-dropzone-sub">{{ dropzoneHint }}</p>
          </div>
          <Button type="button" variant="secondary" size="sm" padding="12" @click="pickFile">파일선택</Button>
          <input
            ref="fileInputRef"
            type="file"
            class="lp-hidden-input"
            :accept="FILE_ACCEPT"
            @change="onPickFile"
          >
        </div>

        <div v-if="form.files.length" class="lp-file-list">
          <p class="lp-file-count"><b>{{ form.files.length }}개</b></p>
          <div class="lp-file-boxes">
            <FileUpload
              v-for="file in form.files"
              :key="file.id"
              :file-name="file.name"
              :uploading="file.uploading"
              @remove="removeFile(file.id)"
            />
          </div>
        </div>
      </div>

      <div class="lp-notice-form-actions">
        <Button type="button" variant="tertiary2" size="md" @click="emit('cancel')">취소</Button>
        <Button type="button" variant="primary" size="md" :disabled="!canSave" @click="emit('save')">저장</Button>
      </div>
    </div>
  </div>

  <EmptyStubDialog
    v-model:open="deptSearchOpen"
    title="부서 검색"
    description="부서를 찾아 선택하는 팝업입니다."
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import { Switch } from '@/components/custom/switch'
import { Button } from '@/components/custom/button'
import { FileUpload } from '@/components/custom/file-upload'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import { CONTENT_MAX_LENGTH, FILE_ACCEPT, type NoticeForm } from '../composable/notice'

/**
 * 공지사항 등록(PM-CO M-1004) · 수정(PM-COM-1003) 공용 폼.
 * Figma 상 두 화면의 폼이 같고 채워진 값만 다르다 — mode 로 안내 문구만 가른다.
 */
const props = withDefaults(
  defineProps<{
    form: NoticeForm
    /** new: 등록 / edit: 수정 */
    mode?: 'new' | 'edit'
    writer?: string
    writtenAt?: string
  }>(),
  {
    mode: 'new',
    writer: '강길동',
    writtenAt: 'YYYY-MM-DD (HH:MM)',
  },
)

const emit = defineEmits<{ (e: 'save'): void; (e: 'cancel'): void }>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const deptSearchOpen = ref(false)

/** Figma: 등록은 빈 상태 안내, 수정은 이미 붙은 파일이 있어 문구가 조금 다르다 */
const dropzoneText = computed(() =>
  props.mode === 'new'
    ? '파일을 끌어놓거나 파일선택을 눌러 첨부하세요'
    : '첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 직접 선택해주세요.',
)
const dropzoneHint = computed(() =>
  props.mode === 'new'
    ? 'jpg, jpeg, png, pdf, txt 등 영상 음성을 제외한 파일'
    : '업로드 가능 파일 (jpg, jpeg, png, pdf, mp4) | 파일용량이 클 경우 시간이 오래 걸릴 수 있습니다.',
)

/** Figma: 등록 화면은 값이 비어 있으면 저장 버튼이 비활성으로 그려져 있다 */
const canSave = computed(() => !!props.form.title.trim() && !!props.form.content.trim())

function pickFile() {
  fileInputRef.value?.click()
}

function addFile(file: File) {
  const nextId = props.form.files.length ? Math.max(...props.form.files.map((f) => f.id)) + 1 : 1
  props.form.files.push({
    id: nextId,
    name: `${file.name} [${Math.ceil(file.size / 1024)}KB]`,
    uploading: false,
  })
}

function onPickFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) addFile(file)
  input.value = ''
}

function onDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) addFile(file)
}

function removeFile(id: number) {
  props.form.files = props.form.files.filter((f) => f.id !== id)
}
</script>
