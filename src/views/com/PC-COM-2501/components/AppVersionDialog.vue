<template>
  <GenericDialog2
    v-model:open="detailOpen"
    title="앱관리 등록"
    :size="800"
    :show-close-button="true"
  >
    <InfoTable :columns="1">
      <InfoField>
        <template #label>공개기간<span :class="infoStyles.requiredDot" /></template>
        <DateRangePicker
          v-model:from="detailForm.openFrom"
          v-model:to="detailForm.openTo"
          from-label="공개 시작일"
          to-label="공개 종료일"
          size="sm"
          input-class="w-40"
        />
      </InfoField>

      <InfoField for="app-version">
        <template #label>앱버전<span :class="infoStyles.requiredDot" /></template>
        <span aria-hidden="true">Ver.</span>
        <InputField2
          id="app-version"
          v-model="detailForm.version"
          size="sm"
          input-class="w-37"
          class="!space-y-0"
        />
      </InfoField>

      <InfoField for="app-title">
        <template #label>제목<span :class="infoStyles.requiredDot" /></template>
        <InputField2
          id="app-title"
          v-model="detailForm.title"
          size="sm"
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </InfoField>
    </InfoTable>

    <!-- 본문은 라벨 칸 없이 표 폭을 통째로 쓴다(시안의 에디터 영역, 높이 240px) -->
    <div class="pop-editor">
      <Editor v-model="detailForm.content" height="24rem"  placeholder="내용을 입력해 주세요" />
    </div>

    <InfoTable :columns="1">
      <!-- 등록자/등록일시는 서버가 채우는 값이라 읽기 전용 텍스트로만 보여준다 -->
      <InfoField label="등록자/등록일시">
        {{ detailForm.writer }} {{ detailForm.createdAt }}
      </InfoField>

      <InfoField>
        <template #label>사용여부<span :class="infoStyles.requiredDot" /></template>
        <RadioGroup v-model="detailForm.use" :class="infoStyles['info-table-radio']">
          <RadioGroupItem value="Y" label="사용" />
          <RadioGroupItem value="N" label="사용안함" />
        </RadioGroup>
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="closeDetail">닫기</Button>
      <!-- 시안(12342:88261)에 신규 팝업에도 삭제 버튼이 있어 그대로 뒀다 -->
      <Button type="button" variant="tertiary2" size="md" @click="onDelete">삭제</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>
<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Editor } from '@/components/custom/editor'
import { useDialog } from '@/composable/dialog/dialog'
import { AppVersionKey } from '../composable/PC-COM-2501'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'

defineOptions({ name: 'AppVersionDialog' })

/** 앱관리 등록 팝업 (PC-COM-2502). 목록의 '신규' 버튼에서 열린다. */
const store = inject(AppVersionKey)!
const { detailOpen, detailForm, closeDetail, findMissingField } = store

const dialog = useDialog()

async function onSave() {
  const missing = findMissingField()
  if (missing) {
    await dialog.alert({ title: `${missing} 항목은 필수입니다.`, btnCancel: '확인' })
    return
  }

  const result = await dialog.confirm({ title: '저장하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return

  // TODO: API 연동
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  closeDetail()
}

async function onDelete() {
  const result = await dialog.confirm({
    title: '삭제하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!result.confirmed) return

  // TODO: API 연동
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
  closeDetail()
}
</script>
