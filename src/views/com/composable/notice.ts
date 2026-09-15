import { reactive, ref } from 'vue'
import type { SideMenuConfig } from '@/composable/menu/sidemenu/types'

/**
 * 공지사항(PM-COM-1001~1004) 도메인 상태.
 *
 * 목록/상세/수정/등록이 별개 라우트라 Layout.vue 가 화면을 통째로 리마운트한다.
 * setup() 안에서 상태를 만들면 화면을 옮길 때마다 초기화되므로 모듈 스코프
 * 싱글턴으로 둔다(CLAUDE.md §3 패턴B — PC-PUB-0301/0302/0303 과 같은 방식).
 */

/** 게시판 LNB.
 *
 * `presets.ts` 에 게시판 메뉴가 아직 없어서 여기 둔다(§4 — presets.ts 는 배치 등록이라
 * 화면 작업에서 건드리지 않는다). 배치 등록 때 이 구성을 그대로 옮기면 된다.
 */
export const bulletinMenu: SideMenuConfig = {
  title: '게시판',
  openIndex: 0,
  activeChild: '공지사항',
  items: [
    { name: '공지사항', path: '/views/com/PM-COM-0301' },
    { name: 'Q&A' },
    // Figma LNB(11015:105117) 기준 하위 3개. 지역경찰 시책 목록은 사용자 지정 ID PM-COM-0501
    {
      name: '우수사례',
      children: [
        { name: '지역경찰 시책', path: '/views/com/PM-COM-0501' },
        { name: '현장조치', path: '/views/com/PM-COM-0601' },
        { name: '범죄예방진단' },
      ],
    },
    { name: '자료실', children: [{ name: '자료실' }] },
    { name: '교육자료 나눔터', children: [{ name: '교육자료 나눔터' }] },
    { name: '현장공감 TalkTalk', children: [{ name: '현장공감 TalkTalk' }] },
  ],
}

/** 공지사항 첨부파일 */
export interface NoticeFile {
  id: number
  name: string
  /** 업로드 진행 중이면 스피너로 표시 */
  uploading: boolean
}

/** 공지사항 한 건 */
export interface Notice {
  id: number
  /** 중요 공지 여부 — 목록에서 번호 자리에 '중요' 배지로 나온다 */
  important: boolean
  /** 중요 공지로 띄울 기간 */
  importantFrom: string
  importantTo: string
  /** 공개 여부 */
  open: boolean
  dept: string
  title: string
  content: string
  writer: string
  createdAt: string
  viewCount: number
  recommendCount: number
  /** 내가 추천을 눌렀는지 */
  recommended: boolean
  files: NoticeFile[]
}

/** 댓글 한 건. `parentId` 가 있으면 대댓글 */
export interface NoticeComment {
  id: number
  parentId: number | null
  writer: string
  createdAt: string
  content: string
  /** 답글이 지목한 사람 이름(@ 없이). 본문 앞에 "@이름" 으로 표시된다 — 답글에만 있다 */
  mention?: string
}

/** 등록/수정 폼이 다루는 값 */
export interface NoticeForm {
  dept: string
  important: boolean
  importantFrom: string
  importantTo: string
  title: string
  content: string
  files: NoticeFile[]
}

/** Figma: 내용 글자수 카운터가 '80/100' 으로 그려져 있다 */
export const CONTENT_MAX_LENGTH = 100
export const FILE_ACCEPT = '.jpg,.jpeg,.png,.pdf,.mp4'

export function createEmptyNoticeForm(): NoticeForm {
  return {
    dept: '',
    important: false,
    importantFrom: '',
    importantTo: '',
    title: '',
    content: '',
    files: [],
  }
}

function createMockNotice(): Notice {
  return {
    id: 1,
    important: true,
    // DatePicker 가 읽는 형식(yyyy-MM-dd) — '2026.07.01' 은 파싱이 안 돼 수정 폼에 빈 칸으로 떴다
    importantFrom: '2026-07-01',
    importantTo: '2026-07-31',
    open: true,
    dept: '본청 범죄예방대응 지역경찰운영과 지역경찰기획계',
    title: '타이틀이 노출됩니다.타이틀이 노출됩니다.타이틀이 노출됩니다.타이틀이 노출됩니다.',
    content:
      '대한민국 디지털정부는 서비스 이용 편의를 위해 다양한 인증 방식을 제공합니다. 이용 목적에 맞는 적절한 인증 방법을 안내할 수 있도록 아래 버튼을 선택해주세요.\n서비스 이용이 처음이라면 로그인 방식에 따라 회원가입이 필요할 수 있습니다.',
    writer: '[경위] 홍길동',
    createdAt: '2026.07.01',
    viewCount: 20,
    recommendCount: 20,
    recommended: false,
    files: [
      { id: 1, name: '전입재등록신고서 (주민등록법 시행령 : 별지서식 15, 15호의2호) [hwp, 17KB]', uploading: false },
      { id: 2, name: '전입재등록신고서 (주민등록법 시행령 : 별지서식 15, 15호의2호) [hwp, 17KB]', uploading: false },
      { id: 3, name: '전입재등록신고서 (주민등록법 시행령 : 별지서식 15, 15호의2호) [hwp, 17KB]', uploading: false },
    ],
  }
}

const MOCK_COMMENT_BODY =
  '등록된 댓글이 표시됩니다. 등록된 댓글이 표시됩니다.등록된 댓글이 표시됩니다. 등록된 댓글이 표시됩니다.등록된 댓글이 표시됩니다. 등록된 댓글이 표시됩니다.등록된 댓글이 표시됩니다.'

function createMockComments(): NoticeComment[] {
  return [
    { id: 1, parentId: null, writer: '강길동', createdAt: '2026-07-01 10:20', content: MOCK_COMMENT_BODY },
    { id: 2, parentId: 1, writer: '강길동', createdAt: '2026-07-01 10:32', content: MOCK_COMMENT_BODY },
    { id: 5, parentId: 1, writer: '김미소', createdAt: '2026-07-01 11:05', content: MOCK_COMMENT_BODY, mention: '강길동' },
    { id: 3, parentId: null, writer: '강길동', createdAt: '2026-07-02 09:11', content: MOCK_COMMENT_BODY },
    { id: 4, parentId: 3, writer: '강길동', createdAt: '2026-07-02 09:40', content: MOCK_COMMENT_BODY },
  ]
}

function createNoticeStore() {
  /** 상세 화면이 보여주는 공지 — 목록에서 넘어올 때 selectNotice 로 바뀐다 */
  const current = ref<Notice>(createMockNotice())
  const comments = ref<NoticeComment[]>(createMockComments())

  /** 수정 화면이 쓰는 폼. 등록 화면은 createEmptyNoticeForm() 으로 따로 만든다 */
  const editForm = reactive<NoticeForm>(createEmptyNoticeForm())

  function selectNotice(id: number) {
    // 목업이라 한 건만 들고 있다. 실제로는 여기서 상세를 조회한다
    current.value = { ...createMockNotice(), id }
  }

  /** 수정 화면 진입 — 지금 보고 있는 공지 값을 폼으로 옮긴다 */
  function loadEditForm() {
    const n = current.value
    editForm.dept = n.dept
    editForm.important = n.important
    editForm.importantFrom = n.importantFrom
    editForm.importantTo = n.importantTo
    editForm.title = n.title
    editForm.content = n.content
    editForm.files = n.files.map((f) => ({ ...f }))
  }

  function toggleRecommend() {
    const n = current.value
    current.value = {
      ...n,
      recommended: !n.recommended,
      recommendCount: n.recommendCount + (n.recommended ? -1 : 1),
    }
  }

  /** 새 댓글(parentId 없음)은 목록 최상단에 표시한다 — 화면 요구사항. 답글은 기존대로 등록 순 */
  function addComment(content: string, parentId: number | null = null, mention?: string) {
    const nextId = comments.value.length ? Math.max(...comments.value.map((c) => c.id)) + 1 : 1
    const created: NoticeComment = { id: nextId, parentId, writer: '강길동', createdAt: nowText(), content, mention }
    comments.value = parentId === null
      ? [created, ...comments.value]
      : [...comments.value, created]
  }

  function updateComment(id: number, content: string) {
    comments.value = comments.value.map((c) => (c.id === id ? { ...c, content } : c))
  }

  /** 대댓글이 달려 있으면 같이 지운다 */
  function removeComment(id: number) {
    comments.value = comments.value.filter((c) => c.id !== id && c.parentId !== id)
  }

  return {
    current,
    comments,
    editForm,
    selectNotice,
    loadEditForm,
    toggleRecommend,
    addComment,
    updateComment,
    removeComment,
  }
}

function nowText() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

let singleton: ReturnType<typeof createNoticeStore> | null = null

export function useNoticeStore() {
  if (!singleton) singleton = createNoticeStore()
  return singleton
}
