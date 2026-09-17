<template>
  <PageHeader>
    <template #left>
      <PageTitle title="지역경찰 시책" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div class="lp-page-scroll">
    <!-- Figma 11220:93526 "list": 블록 사이 20 균일(.lp-narrow-form gap) / 라벨→입력 8(.lp-field gap) -->
    <div class="lp-narrow-form">
      <p class="lp-writer-line">
        <b class="lp-writer-line-name">{{ writer }}</b>
        <span class="lp-writer-line-date">{{ writtenAt }}</span>
      </p>

      <div class="lp-field">
        <span class="lp-label-text">부서명</span>
        <!-- Figma selectbox ×3(전체/전체/전체) = 상위 → 하위 → 세부 3단 부서 셀렉트.
             컴포넌트가 항상 유효한 값으로 보정해서 첫 칸은 placeholder 대신 첫 옵션(본청)이 보인다 -->
        <DepartmentCascadeSelect v-model="form.dept" size="md" class="lp-dept-fill" />
      </div>

      <InputField2
        id="case-title"
        v-model="form.title"
        label="제목"
        label-position="top"
        size="md"
        placeholder="제목을 입력해주세요."
        :clearable="false"
      />

      <!-- Figma: 수정 화면의 내용 칸에는 글자수 카운터가 없다(등록 화면 0504 와 다름) -->
      <TextareaField
        id="case-content"
        v-model="form.content"
        label="내용"
        placeholder="내용을 입력하세요"
        :height="144"
      />

      <!-- 첨부파일 — 공통 AttachmentField(드롭존 + 파일선택 + 건수 + 목록). 파일 추가/삭제는 composable 의 addFiles/removeFile 이 맡는다 -->
      <AttachmentField :files="form.files" :accept="FILE_ACCEPT" @select="addFiles" @remove="removeFile" />

      <!-- Figma: 버튼 높이 48(md)·폭 120·사이 12, 폼과 40 -->
      <div class="lp-board-form-actions">
        <Button type="button" variant="tertiary2" size="md" class="w-30" @click="onCancel">취소</Button>
        <Button type="button" variant="primary" size="md" class="w-30" :disabled="!canSave" @click="onSave">저장</Button>
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
import { Button } from '@/components/custom/button'
import { AttachmentField } from '@/components/custom/common'
import { useDialog } from '@/composable/dialog/dialog'
import { bulletinMenu, FILE_ACCEPT } from '../composable/notice'
import { usePolicyCaseEdit } from './composable/PM-COM-0503'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({
  name: 'PmCom0503',
})

// LNB: 게시판 > 우수사례(items[2]) > 지역경찰 시책
useSideMenuSetup({ ...bulletinMenu, openIndex: 2, activeChild: '지역경찰 시책' })

const router = useRouter()
const dialog = useDialog()

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '우수사례' },
  { label: '지역경찰 시책', path: '/views/com/PM-COM-0501' },
]

const { form, writer, writtenAt, canSave, addFiles, removeFile } = usePolicyCaseEdit()

/** 수정은 상세에서 들어오므로 취소하면 상세(PM-COM-0502)로 돌아간다 */
function onCancel() {
  router.push({ name: 'PM-COM-0502' })
}

/**
 * 사용자 지정(화면 정의서 2-①·③, 공지사항 수정과 같은 흐름): 제목이 있으면 컨펌 "수정된 내용을 저장 하시겠습니까?"
 *  - 취소: 컨펌만 닫고 화면 변동 없음
 *  - 확인: 저장 후 목록으로 이동(목록은 라우트 이동으로 다시 그려진다 = 새로고침)
 * 제목이 없는 경우는 버튼 자체가 비활성이라 여기까지 오지 않는다.
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
  router.push({ name: 'PM-COM-0501' })
}

useBottomTabSetup({
  value: 'PM-COM-0503',
  label: '우수사례 수정',
  path: '/views/com/PM-COM-0503',
  componentName: 'PmCom0503',
  closable: true,
})
</script>
