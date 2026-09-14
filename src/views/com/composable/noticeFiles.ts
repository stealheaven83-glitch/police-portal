import type { NoticeFile, NoticeForm } from './notice'

/**
 * 공지사항 등록/수정 폼의 첨부파일 목업 동작 — PM-COM-1003·1004 가 같이 쓴다.
 * 고른 파일을 업로드 중(스피너) 상태로 목록에 넣고 잠시 뒤 완료('삭제 ⨯')로 바꾼다.
 * 실제 업로드·완료 시점은 개발팀 몫 — PM-LPO-0101 memoForm.addFiles 와 같은 형태.
 * 배열은 항상 재할당한다(CLAUDE.md §5).
 */
export function useNoticeFiles(form: NoticeForm) {
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
