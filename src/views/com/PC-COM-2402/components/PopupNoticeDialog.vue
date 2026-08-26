<script setup lang="ts">
import { inject, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Editor } from '@/components/custom/editor'
import { useDialog } from '@/composable/dialog/dialog'
import { PopupNoticeKey, targetOptions, MAX_FILE_SIZE_MB } from '../composable/PC-COM-2402'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'
import styles from '../style/PC-COM-2402.module.css'

defineOptions({ name: 'PopupNoticeDialog' })

/** 공지팝업 등록/상세. 목록의 신규 버튼에서 열린다. */
const store = inject(PopupNoticeKey)!
const { detailOpen, detailForm, editingNo, closeDetail, findMissingField } = store

const dialog = useDialog()

/** '파일선택' 버튼이 대신 여는 숨긴 file input */
const fileInputEl = ref<HTMLInputElement | null>(null)

function pickFile() {
  fileInputEl.value?.click()
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // 같은 파일을 다시 골라도 change 이벤트가 나도록 비워둔다
  if (!file) return

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    await dialog.alert({
      title: `파일첨부는 ${MAX_FILE_SIZE_MB}M까지만 가능합니다.`,
      btnCancel: '확인',
    })
    return
  }
  detailForm.file = file
}

async function onSave() {
  const missing = findMissingField()
  if (missing) {
    await dialog.alert({ title: `${missing} 항목은 필수입니다.`, btnCancel: '확인' })
    return
  }

  const result = await dialog.confirm({
    title: '저장하시겠습니까?',
    description: '작성한 공지팝업을 저장합니다.',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  // TODO: API 연동
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  closeDetail()
}

async function onDelete() {
  const result = await dialog.confirm({
    title: '삭제하시겠습니까?',
    description: '삭제한 공지팝업은 되돌릴 수 없습니다.',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  // TODO: API 연동
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
  closeDetail()
}
</script>

<template>
  <GenericDialog2
    v-model:open="detailOpen"
    title="공지팝업"
    :size="900"
    :show-close-button="true"
  >
    <p :class="infoStyles.legend">• 필수 입력 항목</p>

    <InfoTable :columns="1">
      <InfoField>
        <template #label>공개기간<span :class="infoStyles.requiredDot" /></template>
        <div :class="styles.inlineGroup">
          <DatePicker
            v-model="detailForm.openFrom"
            size="sm"
            inputClass="w-40"
            label="공개 시작일"
            label-class="sr-only"
          />
          <span aria-hidden="true">~</span>
          <DatePicker
            v-model="detailForm.openTo"
            size="sm"
            inputClass="w-40"
            label="공개 종료일"
            label-class="sr-only"
          />
        </div>
      </InfoField>

      <InfoField>
        <template #label>공지대상<span :class="infoStyles.requiredDot" /></template>
        <RadioGroup v-model="detailForm.target" class="flex items-center gap-6">
          <RadioGroupItem
            v-for="option in targetOptions"
            :key="option.value"
            :value="option.value"
            :label="option.label"
          />
        </RadioGroup>
      </InfoField>

      <InfoField for="notice-title">
        <template #label>제목<span :class="infoStyles.requiredDot" /></template>
        <InputField2
          id="notice-title"
          v-model="detailForm.title"
          size="sm"
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </InfoField>
    </InfoTable>

    <!-- 본문은 라벨 없이 폭을 통째로 쓴다(시안의 회색 에디터 영역) -->
    <div :class="styles.editorArea">
      <Editor v-model="detailForm.content" height="40rem" placeholder="내용을 입력해 주세요" />
    </div>

    <InfoTable :columns="1">
      <InfoField label="첨부파일">
        <InputField2
          :model-value="detailForm.file?.name ?? ''"
          readonly
          size="sm"
          class="!space-y-0 flex-1"
          input-class="w-full"
          label="첨부파일명"
          label-class="sr-only"
        />
        <Button type="button" variant="secondary" size="sm" @click="pickFile">파일선택</Button>
        <span :class="styles.fileHint">* 파일첨부는 {{ MAX_FILE_SIZE_MB }}M까지만 가능</span>
        <input
          ref="fileInputEl"
          type="file"
          :class="styles.fileInput"
          aria-label="첨부파일 선택"
          @change="onFileSelected"
        />
      </InfoField>

      <InfoField>
        <template #label>창사이즈<span :class="infoStyles.requiredDot" /></template>
        <div :class="styles.unitField">
          <InputField2
            v-model="detailForm.windowWidth"
            size="sm"
            input-class="w-25"
            label="가로"
            label-position="left"
            class="!space-y-0"
          />
          <span>px</span>
        </div>
        <div :class="styles.unitField">
          <InputField2
            v-model="detailForm.windowHeight"
            size="sm"
            input-class="w-25"
            label="세로"
            label-position="left"
            class="!space-y-0"
          />
          <span>px</span>
        </div>
      </InfoField>

      <InfoField>
        <template #label>창위치<span :class="infoStyles.requiredDot" /></template>
        <div :class="styles.unitField">
          <InputField2
            v-model="detailForm.windowLeft"
            size="sm"
            input-class="w-25"
            label="왼쪽"
            label-position="left"
            class="!space-y-0"
          />
          <span>px</span>
        </div>
        <div :class="styles.unitField">
          <InputField2
            v-model="detailForm.windowTop"
            size="sm"
            input-class="w-25"
            label="위로"
            label-position="left"
            class="!space-y-0"
          />
          <span>px</span>
        </div>
      </InfoField>

      <InfoField>
        <template #label>사용여부<span :class="infoStyles.requiredDot" /></template>
        <RadioGroup v-model="detailForm.use" class="flex items-center gap-6">
          <RadioGroupItem value="Y" label="사용" />
          <RadioGroupItem value="N" label="사용안함" />
        </RadioGroup>
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" class="w-25" @click="closeDetail">
        닫기
      </Button>
      <!-- 신규 등록 중에는 지울 대상이 없다 -->
      <Button
        v-if="editingNo !== null"
        type="button"
        variant="tertiary2"
        size="md"
        class="w-25"
        @click="onDelete"
      >
        삭제
      </Button>
      <Button type="button" variant="primary" size="md" class="w-25" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>
