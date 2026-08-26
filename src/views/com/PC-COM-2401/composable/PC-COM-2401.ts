import { ref } from 'vue'

/** 게시판 관리 한 행. 조회 API 연동 전까지는 목업 데이터를 그대로 쓴다 */
export interface BoardRow {
  no: number
  /** 게시판 코드 */
  code: string
  /** 게시판명 (셀에서 바로 편집) */
  name: string
  use: boolean
  /** 공지글 사용 */
  notice: boolean
  /** 목록 노출 */
  listExpose: boolean
  reply: boolean
  comment: boolean
  /** 공감(좋아요) */
  like: boolean
  fileUpload: boolean
  /** 첨부 가능 개수 */
  maxUploadCount: number | null
  /** 첨부 용량 제한(MB) */
  maxFileSize: number | null
  /** 한 페이지에 보여줄 글 수 */
  listCount: string
  /** 페이저에 보여줄 페이지 번호 수 */
  pageCount: string
  updatedAt: string
}

/** 목록수 · 페이지수 공통 옵션 */
export const countOptions = [
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '30', value: '30' },
  { label: '50', value: '50' },
]

const TODAY = '2026-04-24'

function createMockRows(): BoardRow[] {
  const base = [
    { code: '1', name: '공지사항', notice: true, reply: false, comment: false, like: false, fileUpload: true },
    { code: '2', name: '현장대응팁', notice: true, reply: true, comment: true, like: true, fileUpload: false },
    { code: '3', name: '인수인계', notice: true, reply: false, comment: false, like: false, fileUpload: true },
    { code: '4', name: '업무노하우', notice: true, reply: false, comment: false, like: false, fileUpload: true },
    { code: '5', name: '중요사건', notice: true, reply: false, comment: false, like: false, fileUpload: true },
    { code: '6', name: '중요사건', notice: true, reply: false, comment: false, like: false, fileUpload: true },
    { code: '7', name: '중요사건', notice: true, reply: false, comment: false, like: false, fileUpload: true },
    { code: '8', name: '중요사건', notice: true, reply: false, comment: false, like: false, fileUpload: true },
    { code: '9', name: '중요사건', notice: true, reply: false, comment: false, like: false, fileUpload: true },
    { code: '10', name: '중요사건', notice: true, reply: false, comment: false, like: false, fileUpload: true },
    { code: '11', name: '중요사건', notice: true, reply: false, comment: false, like: false, fileUpload: true },
    { code: '12', name: '중요사건', notice: true, reply: false, comment: false, like: false, fileUpload: true },
  ]

  return base.map((item, index) => ({
    no: index + 1,
    code: item.code,
    name: item.name,
    use: true,
    notice: item.notice,
    listExpose: false,
    reply: item.reply,
    comment: item.comment,
    like: item.like,
    fileUpload: item.fileUpload,
    maxUploadCount: 5,
    maxFileSize: 10,
    listCount: '10',
    pageCount: '10',
    updatedAt: TODAY,
  }))
}

export function useBoardManage() {
  const rows = ref<BoardRow[]>(createMockRows())

  /** 새 행은 맨 아래에 붙고 번호·코드는 현재 최대값 +1 */
  function createEmptyRow(): BoardRow {
    const nextNo = rows.value.reduce((max, row) => Math.max(max, row.no), 0) + 1
    return {
      no: nextNo,
      code: String(nextNo),
      name: '',
      use: false,
      notice: false,
      listExpose: false,
      reply: false,
      comment: false,
      like: false,
      fileUpload: false,
      maxUploadCount: null,
      maxFileSize: null,
      listCount: '10',
      pageCount: '10',
      updatedAt: TODAY,
    }
  }

  return {
    rows,
    createEmptyRow,
  }
}
