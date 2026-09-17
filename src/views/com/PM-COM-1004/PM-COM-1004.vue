<template>
  <PageHeader>
    <template #left>
      <PageTitle title="공지사항" />
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
      <p class="lp-writer-line">
        <b class="lp-writer-line-name">{{ writer }}</b>
        <span class="lp-writer-line-date">{{ writtenAt }}</span>
      </p>

      <div class="lp-field">
        <span class="lp-label-text">부서명</span>
        <!-- Figma selectbox ×3(전체/전체/전체) = 상위 → 하위 → 세부 3단 부서 셀렉트.
             컴포넌트가 항상 유효한 값으로 보정해서 첫 칸은 placeholder 대신 첫 옵션(본청)이 보인다 -->
        <DepartmentCascadeSelect v-model="dept" size="md" class="lp-dept-fill" />
      </div>

      <div class="lp-field-row">
        <div class="lp-field">
          <span class="lp-label-text">중요공지</span>
          <div class="lp-switch-box">
            <Switch v-model="form.important" size="xl" aria-label="중요공지" />
          </div>
        </div>
        <div class="lp-field lp-flex-fill">
          <span class="lp-label-text">중요공지기간</span>
          <!-- 사용자 지정: 기간은 custom/datepicker/DateRangePicker 를 그대로 쓴다(폭만 .lp-date-fill 로 채움) -->
          <DateRangePicker
            v-model:from="form.importantFrom"
            v-model:to="form.importantTo"
            from-label="중요공지 시작일"
            to-label="중요공지 종료일"
            size="md"
            input-class="w-full"
            class="lp-date-fill"
          />
        </div>
      </div>

      <InputField2
        id="notice-title"
        v-model="form.title"
        label="제목"
        label-position="top"
        size="md"
        placeholder="제목을 입력해주세요."
        :clearable="false"
      />

      <TextareaField
        id="notice-content"
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
        <!-- Figma: 버튼 높이 40 = sm (기준 PM-LPO-0102 는 md/48). 제목이 비면 저장은 비활성 -->
        <Button type="button" variant="tertiary2" size="sm" @click="onCancel">취소</Button>
        <Button type="button" variant="primary" size="sm" :disabled="!canSave" @click="onSave">저장</Button>
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
import { Switch } from '@/components/custom/switch'
import { DateRangePicker } from '@/components/custom/datepicker'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { Button } from '@/components/custom/button'
import { AttachmentField } from '@/components/custom/common'
import { useDialog } from '@/composable/dialog/dialog'
import { bulletinMenu, CONTENT_MAX_LENGTH, FILE_ACCEPT } from '../composable/notice'
import { useNoticeCreate } from './composable/PM-COM-0304'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

defineOptions({
  name: 'PmCom0304',
})

// LNB: 게시판 > 공지사항 (PM-COM-0301~1003 과 같은 메뉴 항목)
useSideMenuSetup({ ...bulletinMenu, activeChild: '공지사항' })

const router = useRouter()
const dialog = useDialog()

const navItems = [
  { label: '홈', path: '/' },
  { label: '게시판' },
  { label: '공지사항', path: '/views/com/PM-COM-0301' },
]

const { form, writer, writtenAt, dept, canSave, addFiles, removeFile } = useNoticeCreate()

/** 등록은 목록의 '작성' 버튼에서 들어오므로 취소하면 목록으로 돌아간다 */
function onCancel() {
  router.push({ name: 'PM-COM-0301' })
}

/**
 * 사용자 지정(화면 정의서 2-②·③): 컨펌 "입력된 내용을 저장 하시겠습니까?"
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
  router.push({ name: 'PM-COM-0301' })
}

useBottomTabSetup({
  value: 'PM-COM-0304',
  label: '공지사항 등록',
  path: '/views/com/PM-COM-0304',
  componentName: 'PmCom0304',
  closable: true,
})
</script>
