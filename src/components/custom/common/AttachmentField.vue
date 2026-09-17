<script setup lang="ts">
/**
 * 첨부파일 필드 — 라벨 + 드롭존(끌어다 놓기 · 파일선택 버튼) + 첨부 건수 + 파일 목록.
 *
 * Figma: 게시판 등록/수정 화면의 첨부파일 영역(예: 공지사항 수정 PM-COM-0303, 12969:xxxx 계열).
 * 게시판 등록·수정 20개 화면이 글자 하나 안 다르게 같은 마크업을 갖고 있어 하나로 뽑았다.
 *
 * 하는 일은 "고르기·떨어뜨리기·지우기 이벤트를 화면에 알리는 것" 까지다 — 파일을 목록에 넣고
 * 업로드 상태를 바꾸는 건 화면 composable(addFiles / removeFile)이 그대로 맡는다.
 *   @select  파일선택 버튼이나 드롭으로 고른 FileList → 화면의 addFiles(files)
 *   @remove  목록의 '삭제' → 화면의 removeFile(id)
 *
 * 파일 한 줄은 공통 FileUpload(Figma file_upload__atomic__pc, variant="circle").
 * 스타일은 전부 police-common.css 의 .lp-field / .lp-dropzone* / .lp-file-* 그대로다.
 *
 * 비슷한 것과의 차이: custom/file-upload/FileUpload 는 "파일 한 줄" 이고, 이건 그 줄들을 담는 필드 전체다.
 */
import { computed, ref } from 'vue'
import { Button } from '@/components/custom/button'
import { FileUpload } from '@/components/custom/file-upload'
import type { AttachedFile } from '.'

interface Props {
  /** 첨부된 파일 목록. 비어 있거나 안 넘기면 건수·목록 영역이 안 그려진다(업로드 팝업처럼 목록이 없는 자리) */
  files?: AttachedFile[]
  /** 라벨 글자. 빈 문자열이면 라벨 줄을 안 그린다 */
  label?: string
  /** input[type=file] 의 accept. 기본 안내 문구의 확장자 목록도 여기서 만든다 */
  accept?: string
  /** 여러 파일을 한 번에 고를 수 있는지 */
  multiple?: boolean
  /**
   * 드롭존 두 번째 줄의 안내 항목. 안 넘기면 "업로드 가능 파일 (…)" · "파일용량이 클 경우 …" 두 개.
   * 문구가 다른 예외 자리(참고사항 업로드: 엑셀파일만 가능 · 파일 크기 · 파일 개수)만 넘긴다.
   */
  hints?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  files: () => [],
  label: '첨부파일',
  // 게시판 composable 의 FILE_ACCEPT 와 같은 값. index.ts 에서 가져오면 순환 import 라 값을 여기 둔다
  accept: '.jpg,.jpeg,.png,.pdf,.mp4',
  multiple: true,
  hints: undefined,
})

const emit = defineEmits<{
  (e: 'select', files: FileList): void
  (e: 'remove', id: AttachedFile['id']): void
}>()

/** '.jpg,.jpeg,.png' → 'jpg, jpeg, png' — 안내 문구가 accept 와 어긋나지 않게 */
const acceptLabel = computed(() =>
  props.accept
    .split(',')
    .map((ext) => ext.trim().replace(/^\./, ''))
    .filter(Boolean)
    .join(', '),
)

/** 두 번째 줄 항목 — hints 를 안 넘기면 accept 기반 기본 문구 */
const hintItems = computed(
  () => props.hints ?? [`업로드 가능 파일 (${acceptLabel.value})`, '파일용량이 클 경우 시간이 오래 걸릴 수 있습니다.'],
)

const fileInputRef = ref<HTMLInputElement | null>(null)

function pickFile() {
  fileInputRef.value?.click()
}

function onFilePick(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) emit('select', input.files)
  // 같은 파일을 다시 골라도 change 가 나게 비운다
  input.value = ''
}

function onDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (files?.length) emit('select', files)
}
</script>

<template>
  <div class="lp-field">
    <span v-if="label" class="lp-label-text">{{ label }}</span>

    <div class="lp-dropzone" @dragover.prevent @drop.prevent="onDrop">
      <div class="lp-dropzone-txt">
        <p>첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 직접 선택해주세요.</p>
        <p class="lp-dropzone-sub">
          <span v-for="hint in hintItems" :key="hint">{{ hint }}</span>
        </p>
      </div>
      <Button type="button" variant="secondary" size="sm" padding="16" @click="pickFile">파일선택</Button>
      <input
        ref="fileInputRef"
        type="file"
        :multiple="multiple"
        :accept="accept"
        hidden
        @change="onFilePick"
      >
    </div>

    <template v-if="files.length">
      <p class="lp-file-count lp-file-count-below"><b>{{ files.length }}개</b></p>
      <!-- 파일 한 줄 = 공통 FileUpload: 업로드 중이면 스피너, 끝나면 '삭제 ⨯' -->
      <div class="lp-file-list">
        <FileUpload
          v-for="file in files"
          :key="file.id"
          :file-name="file.name"
          :uploading="file.uploading"
          variant="circle"
          @remove="emit('remove', file.id)"
        />
      </div>
    </template>
  </div>
</template>
