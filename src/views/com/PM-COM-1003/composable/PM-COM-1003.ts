import { computed, reactive } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { useNoticeStore } from '../../composable/notice'
import { useNoticeFiles } from '../../composable/noticeFiles'

/**
 * 공지사항 수정(PM-COM-1003) 화면 상태.
 * 폼 값은 도메인 스토어(notice.ts)의 editForm 을 그대로 쓴다 — 상세(PM-COM-1002)의 '수정' 버튼이
 * loadEditForm() 으로 채우고 이 화면으로 넘어온다(docs/create/multi-route.md §3).
 */
export function useNoticeEdit() {
  const { current, editForm, loadEditForm } = useNoticeStore()

  // URL 로 바로 들어와 폼이 비어 있으면 지금 보고 있는 공지 값으로 채운다(퍼블 확인용 — 실제로는 개발팀이 id 로 조회)
  if (!editForm.title) loadEditForm()

  /** Figma: 폼 머리에 작성자와 일시가 "강길동 ｜ YYYY-MM-DD (HH:MM)" 로 온다 */
  const writer = computed(() => current.value.writer)
  const writtenAt = 'YYYY-MM-DD (HH:MM)'

  /**
   * 부서명 3단 셀렉트 값. Figma 수정 화면은 셋 다 '전체' placeholder 로 그려져 있어 빈 값으로 시작한다.
   * 공지 mock 의 dept 는 문자열이라 트리 값으로 되돌릴 수 없다 — 실제 매핑은 개발팀 몫.
   */
  const dept = reactive<DepartmentValue>({ level1: '', level2: '', level3: '' })

  const fileCount = computed(() => editForm.files.length)
  const { addFiles, removeFile } = useNoticeFiles(editForm)

  /** 등록 시안(PM-COM-1004)처럼 제목이 비어 있으면 저장 버튼을 비활성으로 둔다 */
  const canSave = computed(() => editForm.title.trim().length > 0)

  return {
    form: editForm,
    writer,
    writtenAt,
    dept,
    fileCount,
    canSave,
    addFiles,
    removeFile,
  }
}
