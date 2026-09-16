import { computed, reactive } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { useBoardStore, type BoardFile, type BoardPostForm } from '../../composable/board'

/**
 * 교육훈련 우수사례 수정(PM-COM-1403) 화면 상태.
 * 폼 값은 도메인 스토어(board.ts)의 editForm 을 그대로 쓴다 — 상세(PM-COM-1402)의 '수정' 버튼이
 * loadEditForm() 으로 채우고 이 화면으로 넘어온다(docs/create/multi-route.md §3).
 *
 * 첨부파일 처리는 공지사항의 noticeFiles.ts 와 같은 모양이지만, 그쪽은 NoticeForm 을 받고
 * 이 게시판은 BoardPostForm(공지 필드 이름이 pinned* 로 다르다) 이라 타입이 안 맞는다 —
 * 합치지 않고 여기에 둔다(CLAUDE.md §1).
 */
function useBoardFiles(form: BoardPostForm) {
  function addFiles(files: FileList | File[]) {
    const added: BoardFile[] = Array.from(files).map((file, i) => ({
      id: Date.now() + i,
      name: `${file.name} [${Math.ceil(file.size / 1024)}KB]`,
      uploading: true,
    }))
    form.files = [...form.files, ...added]

    // 업로드 진행 표시는 화면용이다 — 실제 업로드는 개발팀이 붙인다
    const ids = new Set(added.map((f) => f.id))
    window.setTimeout(() => {
      form.files = form.files.map((f) => (ids.has(f.id) ? { ...f, uploading: false } : f))
    }, 800)
  }

  function removeFile(id: number) {
    form.files = form.files.filter((f) => f.id !== id)
  }

  return { addFiles, removeFile }
}

export function useTrainingEdit() {
  const { current, editForm, loadEditForm } = useBoardStore('training')

  // URL 로 바로 들어와 폼이 비어 있으면 지금 보고 있는 글 값으로 채운다(퍼블 확인용 — 실제로는 개발팀이 id 로 조회)
  if (!editForm.title) loadEditForm()

  /** Figma: 폼 머리에 작성자와 일시가 "강길동 ｜ YYYY-MM-DD (HH:MM)" 로 온다 */
  const writer = computed(() => current.value.writer)
  const writtenAt = 'YYYY-MM-DD (HH:MM)'

  /**
   * 부서명 3단 셀렉트 값. Figma 수정 화면은 셋 다 '전체' placeholder 로 그려져 있어 빈 값으로 시작한다.
   * mock 의 dept 는 문자열이라 트리 값으로 되돌릴 수 없다 — 실제 매핑은 개발팀 몫.
   */
  const dept = reactive<DepartmentValue>({ level1: '', level2: '', level3: '' })

  const fileCount = computed(() => editForm.files.length)
  const { addFiles, removeFile } = useBoardFiles(editForm)

  /** 등록 시안(PM-COM-1404)처럼 제목이 비어 있으면 저장 버튼을 비활성으로 둔다 */
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
