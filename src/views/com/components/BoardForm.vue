<template>
  <div class="lp-page-scroll">
    <div class="board-form">
      <p class="lp-row-between">
        <b class="lp-heading-md">{{ writer }}</b>
        <span class="lp-meta-nowrap">{{ writtenAt }}</span>
      </p>

      <SelectField
        v-if="spec.hasCategory"
        v-model="form.category"
        label="카테고리"
        :options="categoryOptions"
        size="md"
        placeholder="카테고리를 선택해주세요."
        triggerClass="w-full"
      />

      <div v-if="spec.hasDept" class="lp-field">
        <label class="lp-label-text" :for="`${spec.key}-dept`">부서명</label>
        <span class="lp-field-inline">
          <InputField2
            :id="`${spec.key}-dept`"
            v-model="form.dept"
            size="md"
            placeholder="부서명"
            class="lp-flex-fill"
            inputClass="w-full"
          />
          <Button type="button" variant="secondary" size="md" @click="deptSearchOpen = true">부서 검색</Button>
        </span>
      </div>

      <div v-if="spec.hasProvince || spec.hasWeek" class="board-form-row">
        <div v-if="spec.hasProvince" class="lp-field board-form-grow">
          <label class="lp-label-text" :for="`${spec.key}-province`">지방청</label>
          <InputField2
            :id="`${spec.key}-province`"
            v-model="form.province"
            size="md"
            placeholder="지방청"
            inputClass="w-full"
          />
        </div>
        <div v-if="spec.hasWeek" class="lp-field board-form-grow">
          <label class="lp-label-text" :for="`${spec.key}-week`">주차</label>
          <InputField2
            :id="`${spec.key}-week`"
            v-model="form.week"
            size="md"
            placeholder="주차"
            inputClass="w-full"
          />
        </div>
      </div>

      <div v-if="spec.hasOpenState" class="lp-field">
        <span class="lp-label-text">공개여부</span>
        <Switch v-model="form.open" variant="none" aria-label="공개여부" />
      </div>

      <div v-if="spec.hasPinned" class="lp-field-row">
        <div class="lp-field">
          <span class="lp-label-text">고정공지</span>
          <Switch v-model="form.pinned" variant="none" aria-label="고정공지" />
        </div>
        <div class="lp-field lp-flex-fill">
          <span class="lp-label-text">고정공지기간</span>
          <DateRangePicker
            v-model:from="form.pinnedFrom"
            v-model:to="form.pinnedTo"
            from-label="고정공지 시작일"
            to-label="고정공지 종료일"
            size="md"
            :disabled="!form.pinned"
          />
        </div>
      </div>

      <InputField2
        :id="`${spec.key}-title`"
        v-model="form.title"
        label="제목"
        size="md"
        placeholder="제목을 입력해주세요."
      />

      <TextareaField
        :id="`${spec.key}-content`"
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
            <p>첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 직접 선택해주세요.</p>
            <p class="lp-dropzone-sub">
              업로드 가능 파일 (jpg, jpeg, png, pdf, mp4) | 파일용량이 클 경우 시간이 오래 걸릴 수 있습니다.
            </p>
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

      <div class="board-form-actions">
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
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import { Switch } from '@/components/custom/switch'
import { Button } from '@/components/custom/button'
import { FileUpload } from '@/components/custom/file-upload'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import {
  CONTENT_MAX_LENGTH,
  FILE_ACCEPT,
  type BoardPostForm,
  type BoardSpec,
} from '../composable/board'

/**
 * 게시판 글 등록·수정 공용 폼(PM-COM-1103/1104 ~ 2103/2104).
 * Figma 상 등록과 수정의 폼이 같고 채워진 값만 다르다.
 * 게시판마다 있고 없는 칸은 BoardSpec 의 has* 로 가른다.
 */
const props = withDefaults(
  defineProps<{
    spec: BoardSpec
    form: BoardPostForm
    writer?: string
    writtenAt?: string
  }>(),
  {
    writer: '강길동',
    writtenAt: 'YYYY-MM-DD (HH:MM)',
  },
)

const emit = defineEmits<{ (e: 'save'): void; (e: 'cancel'): void }>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const deptSearchOpen = ref(false)

const categoryOptions = computed(() =>
  props.spec.categories.map((name) => ({ label: name, value: name })),
)

/** Figma: 값이 비어 있으면 저장 버튼이 비활성으로 그려져 있다 */
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
