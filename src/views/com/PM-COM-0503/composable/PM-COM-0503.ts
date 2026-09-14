import { computed } from 'vue'
import { usePolicyCaseStore } from '../../composable/policyCase'
import { useNoticeFiles } from '../../composable/noticeFiles'

/**
 * 우수사례 › 지역경찰 시책 수정(PM-COM-0503) 화면 상태.
 * 폼 값은 도메인 스토어(policyCase.ts)의 editForm 을 그대로 쓴다 — 상세(PM-COM-0502)의 '수정' 버튼이
 * loadEditForm() 으로 채우고 이 화면으로 넘어온다(docs/create/multi-route.md §3).
 */
export function usePolicyCaseEdit() {
  const { current, editForm, loadEditForm } = usePolicyCaseStore()

  // URL 로 바로 들어와 폼이 비어 있으면 지금 보고 있는 글 값으로 채운다(퍼블 확인용 — 실제로는 개발팀이 id 로 조회)
  if (!editForm.title) loadEditForm()

  /** Figma: 폼 머리 "강길동 ｜ YYYY-MM-DD (HH:MM)" */
  const writer = computed(() => current.value.writer)
  const writtenAt = 'YYYY-MM-DD (HH:MM)'

  const fileCount = computed(() => editForm.files.length)
  const { addFiles, removeFile } = useNoticeFiles(editForm)

  /** 등록 시안(PM-COM-0504)처럼 제목이 비어 있으면 저장 버튼을 비활성으로 둔다 */
  const canSave = computed(() => editForm.title.trim().length > 0)

  return {
    form: editForm,
    writer,
    writtenAt,
    fileCount,
    canSave,
    addFiles,
    removeFile,
  }
}
