import { computed, reactive } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { createEmptyNoticeForm } from '../../composable/notice'
import { useNoticeFiles } from '../../composable/noticeFiles'

/**
 * 공지사항 등록(PM-COM-1004) 화면 상태.
 * 새 글이라 스토어의 editForm 이 아니라 빈 폼을 화면 안에서 새로 만든다 — 화면을 떠났다 오면 비어 있는 게 맞다.
 */
export function useNoticeCreate() {
  const form = reactive(createEmptyNoticeForm())

  /** Figma: 폼 머리 "강길동 ｜ YYYY-MM-DD (HH:MM)" — 작성자는 로그인 사용자, 일시는 저장 시점에 서버가 찍는다 */
  const writer = '강길동'
  const writtenAt = 'YYYY-MM-DD (HH:MM)'

  /** 부서명 3단 셀렉트 값 — 시안은 셋 다 '전체' placeholder */
  const dept = reactive<DepartmentValue>({ level1: '', level2: '', level3: '' })

  const fileCount = computed(() => form.files.length)
  const { addFiles, removeFile } = useNoticeFiles(form)

  /** Figma: 제목이 비어 있으면 저장 버튼이 비활성(disabled) 상태로 그려져 있다 */
  const canSave = computed(() => form.title.trim().length > 0)

  return {
    form,
    writer,
    writtenAt,
    dept,
    fileCount,
    canSave,
    addFiles,
    removeFile,
  }
}
