<template>
  <div class="lp-narrow-form">
    <div class="lp-form-body">
      <div class="lp-row-between">
        <div class="lp-meta-line">
          <span>{{ createdAt }}</span>
        </div>
        <div class="lp-icon-row">
          <button
            type="button"
            class="lp-icon-btn lp-icon-btn-24"
            :aria-label="important ? '중요 해제' : '중요 표시'"
            @click="important = !important"
          >
            <Icon :name="important ? 'starFill' : 'star'" :size="24" />
          </button>
          <button type="button" class="lp-icon-btn lp-icon-btn-24" aria-label="공유" @click="emit('share')">
            <Icon name="share" :size="24" />
          </button>
        </div>
      </div>

      <InputField2
        v-model="form.title"
        label="제목"
        size="md"
        label-position="top"
        :placeholder="titlePlaceholder"
        :clearable="false"
      />

      <div class="lp-field">
        <TextareaField
          v-model="form.content"
          label="내용"
          :placeholder="contentPlaceholder"
          :maxlength="MAX_CONTENT"
          :height="144"
        />
        <!-- Figma: 13px, 현재 글자수만 primary(#0054A6), 나머지는 body_1(#464C53) -->
        <p class="lp-char-count">
          <b>{{ form.content.length }}</b>/{{ MAX_CONTENT }}
        </p>
      </div>

      <div class="lp-field">
        <span class="lp-label-text">요약</span>

        <div class="lp-summary-box">
          <template v-if="summaryState === 'idle'">
            <p class="lp-summary-guide">요약하기 버튼을 눌러주세요. 입력된 내용을 요약합니다.</p>
            <Button
              type="button"
              variant="tertiary2"
              size="sm"
              padding="16"
              :disabled="!canSummarize"
              @click="runSummary"
            >
              요약하기
            </Button>
          </template>

          <div v-else-if="summaryState === 'loading'" class="lp-summary-loading">
            <Spinner size="medium" />
            <span class="lp-summary-loading-txt">
              메모 내용을 요약하는 중... {{ summaryProgress }}%
            </span>
          </div>

          <p v-else class="lp-summary-text">{{ summaryText }}</p>
        </div>

        <!-- Figma: 완료 상태의 '다시 요약'은 요약 박스 밖 오른쪽 아래 -->
        <div v-if="summaryState === 'done'" class="lp-summary-redo">
          <Button type="button" variant="tertiary2" size="sm" @click="runSummary">
            <RotateCcw :size="16" aria-hidden="true" />
            다시 요약
          </Button>
        </div>
      </div>

      <div class="lp-field">
        <div class="lp-file-head">
          <span class="lp-label-text">첨부파일</span>
          <!-- 더 담을 수 없으면 드롭존이 사라지고 개수가 라벨 옆(20px)으로 붙는다 -->
          <p v-if="!canAddFile" class="lp-file-count">
            <b>{{ attachments.length }}개</b> / {{ MAX_FILES }}개
          </p>
        </div>

        <div
          v-if="canAddFile"
          class="lp-dropzone"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <div class="lp-dropzone-txt">
            <p>첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 직접 선택해주세요.</p>
            <p class="lp-dropzone-sub">
              <span>최대 {{ MAX_FILES }}개 파일 (jpg, jpeg, png, pdf, mp4)</span>
              <span>파일당 최대 000MB</span>
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" padding="16" @click="pickFile">파일선택</Button>
          <input
            ref="fileInputRef"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.mp4"
            hidden
            @change="onFilePick"
          >
        </div>

        <template v-if="attachments.length">
          <p v-if="canAddFile" class="lp-file-count lp-file-count-below">
            <b>{{ attachments.length }}개</b> / {{ MAX_FILES }}개
          </p>
          <!-- 파일 한 줄 = 공통 FileUpload(Figma file_upload__atomic__pc):
               업로드 중이면 오른쪽에 스피너, 끝나면 '삭제 ⨯' -->
          <div class="lp-file-list">
            <FileUpload
              v-for="file in attachments"
              :key="file.id"
              :file-name="file.name"
              :uploading="file.uploading"
              variant="circle"
              @remove="removeFile(file.id)"
            />
          </div>
        </template>
      </div>
    </div>

    <div class="lp-form-actions-center" :class="{ 'lp-form-actions-split': isDetail }">
      <Button type="button" variant="tertiary2" size="md" class="w-30" @click="onCancel">취소</Button>
      <div v-if="isDetail" class="lp-form-actions-right">
        <Button type="button" variant="tertiary2" size="md" class="w-30" @click="onDelete">삭제</Button>
        <Button type="button" variant="primary" size="md" class="w-30" @click="onSave">저장</Button>
      </div>
      <Button v-else type="button" variant="primary" size="md" class="w-30" @click="onSave">저장</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RotateCcw } from 'lucide-vue-next'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { Button } from '@/components/custom/button'
import { FileUpload } from '@/components/custom/file-upload'
import Icon from '@/components/custom/icon/Icon.vue'
import Spinner from '@/components/custom/spinner/Spinner.vue'
import { useDialog } from '@/composable/dialog/dialog'
import { useMemoForm, MAX_CONTENT, MAX_FILES } from '../composable/memoForm'
import { defaultMemoTitle, type MemoFormPayload, type MemoItem } from '../composable/PM-LPO-0101'

/**
 * 메모 등록(PM-LPO-0104) · 내 메모 상세/수정(PM-LPO-0102) 폼.
 * 기획서상 항목별 입력 방법이 같아서 한 컴포넌트로 두고 mode 로만 갈린다.
 * 받은/보낸 메모 상세는 읽기 전용이라 MemoReadonlyView.vue 가 따로 맡는다.
 * (부모 PM-LPO-0101.vue 가 :key 로 메모/모드가 바뀔 때 새로 마운트한다)
 */
interface Props {
  /** write=등록(PM-LPO-0104) / detail=상세·수정(PM-LPO-0102) */
  mode: 'write' | 'detail'
  /** 상세일 때 보고 있는 메모 */
  memo?: MemoItem | null
}

const props = withDefaults(defineProps<Props>(), {
  memo: null,
})

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'save', payload: MemoFormPayload): void
  (e: 'delete'): void
  (e: 'share'): void
}>()

const dialog = useDialog()

const isDetail = computed(() => props.mode === 'detail')

const {
  createdAt,
  form,
  important,
  summaryState,
  summaryText,
  summaryProgress,
  canSummarize,
  runSummary,
  attachments,
  canAddFile,
  addFiles,
  removeFile,
  hasInput,
  toPayload,
} = useMemoForm(props.memo)

/** 기획서 1: 제목은 필수가 아니고, 미입력이면 'YYYY년 MM월 NN일 입력 메모'로 저장된다 */
const titlePlaceholder = computed(() => (isDetail.value ? '제목을 입력해주세요.' : defaultMemoTitle()))

/** 기획서 2: 등록 화면 내용 영역에는 개인정보 주의 문구를 워터마크로 안내 */
const contentPlaceholder = isDetail.value
  ? '내용을 입력해주세요.'
  : '※ 주의\n입력하신 개인정보는 타인에게 발송될 경우 개인정보 유출 사고가 발생할 수 있습니다. 다시 한 번 확인하시기 바랍니다.'

// ── 첨부파일: 선택/드롭 → 목업 목록에 추가 (실제 업로드는 개발팀) ──
const fileInputRef = ref<HTMLInputElement | null>(null)

function pickFile() {
  fileInputRef.value?.click()
}
function onFilePick(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (files.length) addFiles(files.map((f) => f.name))
  if (fileInputRef.value) fileInputRef.value.value = ''
}
function onDrop(e: DragEvent) {
  const files = Array.from(e.dataTransfer?.files ?? [])
  if (files.length) addFiles(files.map((f) => f.name))
}

/**
 * 기획서 4(등록) / 10(상세): 취소 — 입력·수정된 내용이 있을 때만 컨펌.
 * (§7 기본은 toast 지만 기획서가 컨펌창을 지정 — 요청대로 따름)
 */
async function onCancel() {
  if (!isDetail.value && !hasInput.value) {
    emit('cancel')
    return
  }
  const { confirmed } = await dialog.confirm({
    title: isDetail.value
      ? '수정된 내용이 있습니다. 취소하시겠습니까?'
      : '입력된 내용이 있습니다. 취소하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (confirmed) emit('cancel')
}

/**
 * 기획서 5(등록) / 12(상세): 저장 — 등록은 입력 유무에 따라 컨펌 문구가 달라진다.
 * (§7 기본은 toast 지만 기획서가 컨펌창을 지정 — 요청대로 따름)
 */
async function onSave() {
  const { confirmed } = await dialog.confirm({
    title: isDetail.value
      ? '수정된 내용을 저장하시겠습니까?'
      : hasInput.value
        ? '입력된 내용을 저장 하시겠습니까?'
        : '입력된 내용이 없습니다. 메모를 저장 하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!confirmed) return
  emit('save', toPayload())
}

/** 기획서 11: 삭제는 되돌릴 수 없어 컨펌 후 목록으로 */
async function onDelete() {
  const { confirmed } = await dialog.confirm({
    title: '삭제된 메모는 복구할 수 없습니다. 메모를 삭제 하시겠습니까?',
    btnOk: '삭제',
    btnCancel: '취소',
  })
  if (confirmed) emit('delete')
}
</script>
