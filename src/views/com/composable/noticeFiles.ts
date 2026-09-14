import type { NoticeFile } from './notice'

/**
 * 게시판 등록/수정 폼의 첨부파일 목업 동작 — 공지(PM-COM-1003·1004)·Q&A(0403) 폼이 같이 쓴다.
 * files 배열만 있으면 어느 폼이든 받는다.
 * 고른 파일을 업로드 중(스피너) 상태로 목록에 넣고 잠시 뒤 완료('삭제 ⨯')로 바꾼다.
 * 실제 업로드·완료 시점은 개발팀 몫 — PM-LPO-0101 memoForm.addFiles 와 같은 형태.
 * 배열은 항상 재할당한다(CLAUDE.md §5).
 */
export function useNoticeFiles(form: { files: NoticeFile[] }) {
  function addFiles(files: FileList | File[]) {
    const added: NoticeFile[] = Array.from(files).map((file, i) => ({
      id: Date.now() + i,
      name: `${file.name} [${Math.ceil(file.size / 1024)}KB]`,
      uploading: true,
    }))
    form.files = [...form.files, ...added]
    const ids = new Set(added.map((f) => f.id))
    window.setTimeout(() => {
      form.files = form.files.map((f) => (ids.has(f.id) ? { ...f, uploading: false } : f))
    }, 1200)
  }

  function removeFile(id: number) {
    form.files = form.files.filter((f) => f.id !== id)
  }

  return { addFiles, removeFile }
}
