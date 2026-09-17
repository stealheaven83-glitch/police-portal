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

      <!-- 첨부파일 — 공통 AttachmentField(드롭존 + 파일선택 + 건수 + 목록). 파일 추가/삭제는 composable 의 addFiles/removeFile 이 맡는다 -->
      <AttachmentField :files="form.files" :accept="FILE_ACCEPT" @select="addFiles" @remove="removeFile" />

      <div class="lp-board-form-actions">
        <!-- 제목이 비면 저장은 비활성 -->
        <Button type="button" variant="tertiary2" size="md" @click="onCancel">취소</Button>
        <Button type="button" variant="primary" size="md" :disabled="!canSave" @click="onSave">저장</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
import { AttachmentField } from '@/components/custom/common'
import { useDialog } from '@/composable/dialog/dialog'
import { boardMenu, CONTENT_MAX_LENGTH, FILE_ACCEPT } from '../composable/board'
import { useTrainingEdit } from './composable/PM-COM-1403'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({
  name: 'PmCom1403',
})

// LNB: 게시판 > 교육자료 나눔터 > 교육훈련 우수사례
useSideMenuSetup({ ...boardMenu, openIndex: 4, activeChild: '교육훈련 우수사례' })

const router = useRouter()
const dialog = useDialog()

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '교육자료 나눔터' },
  { label: '교육훈련 우수사례', path: '/views/com/PM-COM-1401' },
]

const { form, writer, writtenAt, dept, canSave, addFiles, removeFile } = useTrainingEdit()

function onCancel() {
  router.push({ name: 'PM-COM-1402' })
}

/**
 * 사용자 지정(화면 정의서 2-①·③): 제목이 있으면 컨펌 "수정된 내용을 저장 하시겠습니까?"
 *  - 취소: 컨펌만 닫고 화면 변동 없음
 *  - 확인: 저장 후 목록으로 이동(목록은 라우트 이동으로 다시 그려진다 = 새로고침)
 * 제목이 없는 경우는 버튼 자체가 비활성(등록 시안 PM-COM-1404 와 같은 규칙)이라 여기까지 오지 않는다.
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
  router.push({ name: 'PM-COM-1401' })
}

useBottomTabSetup({
  value: 'PM-COM-1403',
  label: '교육훈련 우수사례 수정',
  path: '/views/com/PM-COM-1403',
  componentName: 'PmCom1403',
  closable: true,
})
</script>
