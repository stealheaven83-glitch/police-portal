import { reactive, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { NoticeComment, NoticeFile } from './notice'

/**
 * 우수사례 › 지역경찰 시책(PM-COM-0501 목록 / 0502 상세 / 0503 수정 / 0504 등록) 도메인 상태.
 *
 * 목록/상세/수정이 별개 라우트라 Layout.vue 가 화면을 통째로 리마운트한다. setup() 안에서 상태를 만들면
 * 화면을 옮길 때마다 초기화되므로 모듈 스코프 싱글턴으로 둔다(notice.ts·qna.ts 와 같은 방식 —
 * docs/create/multi-route.md §2). 댓글은 공지사항과 형태가 같아 NoticeComment 를 그대로 쓴다.
 */

/** 시책 글 한 건 */
export interface PolicyCase {
  id: number
  /** 상세 머리에 배지 대신 부서명이 온다(Figma 11694:40952) */
  dept: string
  title: string
  content: string
  writer: string
  createdAt: string
  viewCount: number
  files: NoticeFile[]
}

/** 수정/등록 폼이 다루는 값 — 부서는 3단 셀렉트 값 */
export interface PolicyCaseForm {
  dept: DepartmentValue
  title: string
  content: string
  files: NoticeFile[]
}

export function createEmptyPolicyCaseForm(): PolicyCaseForm {
  return { dept: { level1: '', level2: '', level3: '' }, title: '', content: '', files: [] }
}

const MOCK_COMMENT_BODY =
  '등록된 댓글이 표시됩니다. 등록된 댓글이 표시됩니다.등록된 댓글이 표시됩니다. 등록된 댓글이 표시됩니다.등록된 댓글이 표시됩니다. 등록된 댓글이 표시됩니다.등록된 댓글이 표시됩니다.'

function createMockCase(): PolicyCase {
  return {
    id: 1,
    dept: '본청 범죄예방대응 지역경찰운영과 지역경찰기획계',
    title: '타이틀이 노출됩니다.타이틀이 노출됩니다.타이틀이 노출됩니다.타이틀이 노출됩니다.',
    content:
      '대한민국 디지털정부는 서비스 이용 편의를 위해 다양한 인증 방식을 제공합니다. 이용 목적에 맞는 적절한 인증 방법을 안내할 수 있도록 아래 버튼을 선택해주세요.\n서비스 이용이 처음이라면 로그인 방식에 따라 회원가입이 필요할 수 있습니다.',
    writer: '[경위] 홍길동',
    createdAt: '2026.07.01',
    viewCount: 20,
    files: [
      { id: 1, name: '전입재등록신고서 (주민등록법 시행령 : 별지서식 15, 15호의2호) [hwp, 17KB]', uploading: false },
      { id: 2, name: '전입재등록신고서 (주민등록법 시행령 : 별지서식 15, 15호의2호) [hwp, 17KB]', uploading: false },
      { id: 3, name: '전입재등록신고서 (주민등록법 시행령 : 별지서식 15, 15호의2호) [hwp, 17KB]', uploading: false },
    ],
  }
}

/** Figma(11220:91879): 원댓글 2건, 첫 댓글에 답글 2건(둘째는 @강길동 멘션) */
function createMockComments(): NoticeComment[] {
  return [
    { id: 1, parentId: null, writer: '한경찰', createdAt: '2026-07-01 10:20', content: MOCK_COMMENT_BODY },
    { id: 2, parentId: 1, writer: '강길동', createdAt: '2026-07-01 10:32', content: MOCK_COMMENT_BODY },
    { id: 3, parentId: 1, writer: '김미소', createdAt: '2026-07-01 11:05', content: MOCK_COMMENT_BODY, mention: '강길동' },
    { id: 4, parentId: null, writer: '김철수', createdAt: '2026-07-02 09:11', content: MOCK_COMMENT_BODY },
    { id: 5, parentId: 4, writer: '강길동', createdAt: '2026-07-02 09:40', content: MOCK_COMMENT_BODY },
  ]
}

function createPolicyCaseStore() {
  /** 상세 화면이 보여주는 글 — 목록에서 넘어올 때 selectCase 로 바뀐다 */
  const current = ref<PolicyCase>(createMockCase())
  const comments = ref<NoticeComment[]>(createMockComments())

  /** 수정 화면이 쓰는 폼 — 상세의 '수정' 버튼이 loadEditForm() 으로 채우고 넘어온다 */
  const editForm = reactive<PolicyCaseForm>(createEmptyPolicyCaseForm())

  function selectCase(id: number) {
    // 목업이라 한 건만 들고 있다. 실제로는 여기서 상세를 조회한다
    current.value = { ...createMockCase(), id }
  }

  /** 수정 화면 진입 — 지금 보고 있는 글 값을 폼으로 옮긴다.
   *  부서는 mock 이 문자열이라 트리 값으로 되돌릴 수 없어 빈 값(시안도 '전체' placeholder) */
  function loadEditForm() {
    const c = current.value
    editForm.dept = { level1: '', level2: '', level3: '' }
    editForm.title = c.title
    editForm.content = c.content
    editForm.files = c.files.map((f) => ({ ...f }))
  }

  /** 새 댓글(parentId 없음)은 목록 최상단에 표시한다. 답글은 등록 순 */
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
    selectCase,
    loadEditForm,
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

let singleton: ReturnType<typeof createPolicyCaseStore> | null = null

export function usePolicyCaseStore() {
  if (!singleton) singleton = createPolicyCaseStore()
  return singleton
}
