import { computed, reactive } from 'vue'
import { createEmptyBoardForm, type BoardFile, type BoardPostForm } from '../../composable/board'

/**
 * 법령 · 지침 · 매뉴얼 등록(PM-COM-0712) 화면 상태.
 * 새 글이라 스토어의 editForm 이 아니라 빈 폼을 화면 안에서 새로 만든다 — 화면을 떠났다 오면 비어 있는 게 맞다.
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

export function useLawCreate() {
  const form = reactive(createEmptyBoardForm())

  /** Figma: 폼 머리 "강길동 ｜ YYYY-MM-DD (HH:MM)" — 작성자는 로그인 사용자, 일시는 저장 시점에 서버가 찍는다 */
  const writer = '강길동'
  const writtenAt = 'YYYY-MM-DD (HH:MM)'

  const fileCount = computed(() => form.files.length)
  const { addFiles, removeFile } = useBoardFiles(form)

  /** Figma: 제목이 비어 있으면 저장 버튼이 비활성(disabled) 상태로 그려져 있다 */
  const canSave = computed(() => form.title.trim().length > 0)

  return {
    form,
    writer,
    writtenAt,
    fileCount,
    canSave,
    addFiles,
    removeFile,
  }
}
