import { reactive, ref } from 'vue'
import type { SideMenuConfig } from '@/composable/menu/sidemenu/types'

/**
 * 게시판(PM-COM-1101~2104) 공통 도메인 상태.
 *
 * 공지사항(PM-COM-1001~1004)은 먼저 만들어진 `notice.ts` 를 그대로 쓴다 —
 * 겹치는 부분이 있어도 합치지 않는다(CLAUDE.md §1). 여기는 나머지 10개 게시판이 쓴다.
 *
 * 목록/상세/수정/등록이 별개 라우트라 Layout.vue 가 화면을 통째로 리마운트한다.
 * setup() 안에서 상태를 만들면 화면을 옮길 때마다 초기화되므로 게시판별 모듈 스코프
 * 싱글턴으로 둔다(docs/create/multi-route.md §2).
 */

/* ── LNB ──────────────────────────────────────────────────────────── */

/** 게시판 LNB 트리.
 *
 * `presets.ts` 에 게시판 메뉴가 아직 없어서 여기 둔다(docs/create.md §3 — presets.ts 는
 * 배치 등록이라 화면 작업에서 건드리지 않는다). 배치 등록 때 이 구성을 그대로 옮기면 된다.
 * 항목 순서 = Figma LNB 순서이며 BoardSpec.openIndex 가 이 순서를 가리킨다.
 */
export const boardMenu: SideMenuConfig = {
  title: '게시판',
  openIndex: 0,
  activeChild: '공지사항',
  items: [
    { name: '공지사항', path: '/views/com/PM-COM-1001' },
    { name: 'Q&A', path: '/views/com/PM-COM-1101' },
    {
      name: '우수사례',
      children: [
        { name: '지역경찰 시책', path: '/views/com/PM-COM-1201' },
        { name: '현장조치', path: '/views/com/PM-COM-1301' },
      ],
    },
    {
      name: '자료실',
      children: [{ name: '범죄예방진단', path: '/views/com/PM-COM-1901' }],
    },
    {
      name: '교육자료 나눔터',
      children: [
        { name: '교육훈련 우수사례', path: '/views/com/PM-COM-0701' },
        { name: '상시학습자료', path: '/views/com/PM-COM-0705' },
        { name: '법령 · 지침 · 매뉴얼', path: '/views/com/PM-COM-0709' },
        { name: '현장대응팁', path: '/views/com/PM-COM-1701' },
      ],
    },
    {
      name: '현장공감 TalkTalk',
      children: [
        { name: '경찰청 주요 정책', path: '/views/com/PM-COM-2001' },
        { name: '정책 제안 및 건의사항', path: '/views/com/PM-COM-2101' },
      ],
    },
  ],
}

/* ── 타입 ─────────────────────────────────────────────────────────── */

/** 첨부파일 */
export interface BoardFile {
  id: number
  name: string
  /** 업로드 진행 중이면 스피너로 표시 */
  uploading: boolean
}

/** 게시글 한 건. 게시판마다 안 쓰는 칸이 있다(BoardSpec 의 has* 로 갈린다) */
export interface BoardPost {
  id: number
  /** 고정(중요) 공지 여부 — 목록 번호 자리에 배지로 나온다 */
  pinned: boolean
  pinnedFrom: string
  pinnedTo: string
  /** 공개 여부 */
  open: boolean
  /** 카테고리(Q&A 등) */
  category: string
  dept: string
  province: string
  week: string
  title: string
  content: string
  writer: string
  createdAt: string
  viewCount: number
  recommendCount: number
  /** 내가 추천을 눌렀는지 */
  recommended: boolean
  /** 내가 쓴 글인지 — 상세 배지로 나온다 */
  mine: boolean
  files: BoardFile[]
}

/** 댓글 한 건. `parentId` 가 있으면 대댓글 */
export interface BoardComment {
  id: number
  parentId: number | null
  writer: string
  createdAt: string
  content: string
}

/** 등록/수정 폼이 다루는 값 */
export interface BoardPostForm {
  pinned: boolean
  pinnedFrom: string
  pinnedTo: string
  open: boolean
  category: string
  dept: string
  province: string
  week: string
  title: string
  content: string
  files: BoardFile[]
}

/** Figma: 내용 글자수 카운터가 '80/100' 으로 그려져 있다 */
export const CONTENT_MAX_LENGTH = 100
export const FILE_ACCEPT = '.jpg,.jpeg,.png,.pdf,.mp4'

/* ── 게시판별 설정 ────────────────────────────────────────────────── */

export type BoardKey =
  | 'qna'
  | 'policyCase'
  | 'fieldCase'
  | 'training'
  | 'study'
  | 'law'
  | 'tip'
  | 'cpted'
  | 'policePlan'
  | 'proposal'

/**
 * 게시판 하나의 구성.
 *
 * `has*` 는 **화면설계서_게시판_V1.1 8장 "메뉴별 유/무가 존재하는 칼럼 정리"** 표를 그대로 옮긴 것이다.
 * 표에 없는 번호·제목·첨부파일·작성자·등록일·조회수는 모든 게시판 공통이라 여기 없다.
 */
export interface BoardSpec {
  key: BoardKey
  /** PageTitle · 하단탭 라벨의 바탕이 되는 게시판 이름 */
  title: string
  /** LNB 활성 표시할 항목 이름 (boardMenu 의 name 과 글자까지 같아야 한다) */
  menuChild: string
  /** LNB 에서 펼쳐둘 1뎁스 인덱스 (boardMenu.items 순서) */
  openIndex: number
  /** 브레드크럼에서 '게시판' 뒤에 붙는 라벨들. 마지막 항목이 이 게시판이다 */
  breadcrumb: string[]
  /** 화면ID 4종 */
  listId: string
  detailId: string
  editId: string
  createId: string
  /** 고정 공지 */
  hasPinned: boolean
  /** 공개 상태 */
  hasOpenState: boolean
  /** 카테고리 */
  hasCategory: boolean
  /** 부서 */
  hasDept: boolean
  /** 지방청 */
  hasProvince: boolean
  /** 주차 */
  hasWeek: boolean
  /** 추천수 */
  hasRecommend: boolean
  /** 카테고리 탭 옵션 (hasCategory 인 게시판만) */
  categories: string[]
  /** 목록이 비었을 때 문구 */
  emptyText: string
}

export const BOARD_SPECS: Record<BoardKey, BoardSpec> = {
  qna: {
    key: 'qna',
    title: 'Q&A',
    menuChild: 'Q&A',
    openIndex: 1,
    breadcrumb: ['Q&A'],
    listId: 'PM-COM-1101',
    detailId: 'PM-COM-1102',
    editId: 'PM-COM-1103',
    createId: 'PM-COM-1104',
    hasPinned: true,
    hasOpenState: true,
    hasCategory: true,
    hasDept: false,
    hasProvince: false,
    hasWeek: false,
    hasRecommend: false,
    categories: ['장애처리', '출동수당', '범죄예방진단', '해바라기 센터'],
    emptyText: '등록된 문의가 없습니다',
  },
  policyCase: {
    key: 'policyCase',
    title: '지역경찰 시책',
    menuChild: '지역경찰 시책',
    openIndex: 2,
    breadcrumb: ['우수사례', '지역경찰 시책'],
    listId: 'PM-COM-1201',
    detailId: 'PM-COM-1202',
    editId: 'PM-COM-1203',
    createId: 'PM-COM-1204',
    hasPinned: false,
    hasOpenState: false,
    hasCategory: false,
    hasDept: true,
    hasProvince: false,
    hasWeek: false,
    hasRecommend: false,
    categories: [],
    emptyText: '등록된 우수사례가 없습니다',
  },
  fieldCase: {
    key: 'fieldCase',
    title: '현장조치',
    menuChild: '현장조치',
    openIndex: 2,
    breadcrumb: ['우수사례', '현장조치'],
    listId: 'PM-COM-1301',
    detailId: 'PM-COM-1302',
    editId: 'PM-COM-1303',
    createId: 'PM-COM-1304',
    hasPinned: false,
    hasOpenState: false,
    hasCategory: false,
    hasDept: false,
    hasProvince: true,
    hasWeek: true,
    hasRecommend: false,
    categories: [],
    emptyText: '등록된 우수사례가 없습니다',
  },
  training: {
    key: 'training',
    title: '교육훈련 우수사례',
    menuChild: '교육훈련 우수사례',
    openIndex: 4,
    breadcrumb: ['교육자료 나눔터', '교육훈련 우수사례'],
    /* 사용자 지정: 화면ID를 기획서(교육훈련 우수사례 V0.5.6)의 07xx 로 쓴다.
       screen-id-map.md(351~354행)와 Figma 시안 프레임 이름은 PM-COM-1401~1404 이라 서로 다르다 —
       어느 쪽이 최신인지 IA 확인이 필요하다(인계 메모). */
    listId: 'PM-COM-0701',
    detailId: 'PM-COM-0702',
    editId: 'PM-COM-0703',
    createId: 'PM-COM-0704',
    hasPinned: true,
    hasOpenState: false,
    hasCategory: false,
    hasDept: true,
    hasProvince: false,
    hasWeek: false,
    hasRecommend: false,
    categories: [],
    emptyText: '등록된 우수사례가 없습니다',
  },
  study: {
    key: 'study',
    title: '상시학습자료',
    menuChild: '상시학습자료',
    openIndex: 4,
    breadcrumb: ['교육자료 나눔터', '상시학습자료'],
    /* 사용자 지정: 교육훈련 우수사례(training)와 같은 이유로 기획서의 07xx 를 쓴다.
       screen-id-map.md 와 Figma 시안 프레임 이름은 PM-COM-1501~1504 라 서로 다르다 — IA 확인 필요. */
    listId: 'PM-COM-0705',
    detailId: 'PM-COM-0706',
    editId: 'PM-COM-0707',
    createId: 'PM-COM-0708',
    hasPinned: true,
    hasOpenState: false,
    hasCategory: false,
    hasDept: true,
    hasProvince: false,
    hasWeek: false,
    hasRecommend: false,
    categories: [],
    emptyText: '등록된 학습자료가 없습니다',
  },
  law: {
    key: 'law',
    title: '법령 · 지침 · 매뉴얼',
    menuChild: '법령 · 지침 · 매뉴얼',
    openIndex: 4,
    breadcrumb: ['교육자료 나눔터', '법령 · 지침 · 매뉴얼'],
    /* 사용자 지정: 교육훈련 우수사례(training)와 같은 이유로 기획서의 07xx 를 쓴다.
       screen-id-map.md 와 Figma 시안 프레임 이름은 PM-COM-1601~1604 라 서로 다르다 — IA 확인 필요. */
    listId: 'PM-COM-0709',
    detailId: 'PM-COM-0710',
    editId: 'PM-COM-0711',
    createId: 'PM-COM-0712',
    hasPinned: true,
    hasOpenState: false,
    hasCategory: false,
    hasDept: false,
    hasProvince: false,
    hasWeek: false,
    hasRecommend: false,
    categories: [],
    emptyText: '등록된 자료가 없습니다',
  },
  tip: {
    key: 'tip',
    title: '현장대응팁',
    menuChild: '현장대응팁',
    openIndex: 4,
    breadcrumb: ['교육자료 나눔터', '현장대응팁'],
    listId: 'PM-COM-1701',
    detailId: 'PM-COM-1702',
    editId: 'PM-COM-1703',
    createId: 'PM-COM-1704',
    hasPinned: false,
    hasOpenState: false,
    hasCategory: false,
    hasDept: false,
    hasProvince: false,
    hasWeek: false,
    hasRecommend: false,
    categories: [],
    emptyText: '등록된 대응팁이 없습니다',
  },
  cpted: {
    key: 'cpted',
    title: '범죄예방진단',
    menuChild: '범죄예방진단',
    openIndex: 3,
    breadcrumb: ['자료실', '범죄예방진단'],
    listId: 'PM-COM-1901',
    detailId: 'PM-COM-1902',
    editId: 'PM-COM-1903',
    createId: 'PM-COM-1904',
    hasPinned: true,
    hasOpenState: false,
    hasCategory: false,
    hasDept: true,
    hasProvince: false,
    hasWeek: false,
    hasRecommend: true,
    categories: [],
    emptyText: '등록된 자료가 없습니다',
  },
  policePlan: {
    key: 'policePlan',
    title: '경찰청 주요 정책',
    menuChild: '경찰청 주요 정책',
    openIndex: 5,
    breadcrumb: ['현장공감 TalkTalk', '경찰청 주요 정책'],
    listId: 'PM-COM-2001',
    detailId: 'PM-COM-2002',
    editId: 'PM-COM-2003',
    createId: 'PM-COM-2004',
    hasPinned: true,
    hasOpenState: false,
    hasCategory: false,
    hasDept: false,
    hasProvince: false,
    hasWeek: false,
    hasRecommend: false,
    categories: [],
    emptyText: '등록된 정책이 없습니다',
  },
  proposal: {
    key: 'proposal',
    title: '정책 제안 및 건의사항',
    menuChild: '정책 제안 및 건의사항',
    openIndex: 5,
    breadcrumb: ['현장공감 TalkTalk', '정책 제안 및 건의사항'],
    listId: 'PM-COM-2101',
    detailId: 'PM-COM-2102',
    editId: 'PM-COM-2103',
    createId: 'PM-COM-2104',
    hasPinned: true,
    hasOpenState: true,
    hasCategory: false,
    hasDept: false,
    hasProvince: false,
    hasWeek: false,
    hasRecommend: false,
    categories: [],
    emptyText: '등록된 제안이 없습니다',
  },
}

/* ── 검색 옵션 ────────────────────────────────────────────────────── */

/** 성명 검색 옵션 — 설계서 10장 1-2 (default 전체) */
export const authorFilterOptions = [
  { label: '전체', value: 'all' },
  { label: '게시글 작성자', value: 'writer' },
  { label: '댓글 작성자', value: 'commenter' },
]

/** 검색어 옵션 — 설계서 10장 1-4 (default 전체) */
export const searchFieldOptions = [
  { label: '전체', value: 'all' },
  { label: '제목', value: 'title' },
  { label: '내용', value: 'content' },
]

/** 공개상태 옵션 — 설계서 21장 2-4 */
export const openStateOptions = [
  { label: '전체', value: 'all' },
  { label: '공개', value: 'open' },
  { label: '비공개', value: 'closed' },
]

/* ── 폼 ───────────────────────────────────────────────────────────── */

export function createEmptyBoardForm(): BoardPostForm {
  return {
    pinned: false,
    pinnedFrom: '',
    pinnedTo: '',
    open: true,
    category: '',
    dept: '',
    province: '',
    week: '',
    title: '',
    content: '',
    files: [],
  }
}

/* ── 목업 ─────────────────────────────────────────────────────────── */

const MOCK_CONTENT =
  '대한민국 디지털정부는 서비스 이용 편의를 위해 다양한 인증 방식을 제공합니다. 이용 목적에 맞는 적절한 인증 방법을 안내할 수 있도록 아래 버튼을 선택해주세요.\n서비스 이용이 처음이라면 로그인 방식에 따라 회원가입이 필요할 수 있습니다.'

const MOCK_FILE_NAME = '전입재등록신고서 (주민등록법 시행령 : 별지서식 15, 15호의2호) [hwp, 17KB]'

function createMockPost(s: BoardSpec): BoardPost {
  return {
    id: 1,
    pinned: s.hasPinned,
    pinnedFrom: '2026.07.01',
    pinnedTo: '2026.07.31',
    open: true,
    category: s.categories[0] ?? '',
    dept: '본청 범죄예방대응 지역경찰운영과 지역경찰기획계',
    province: '대구청',
    week: '3주차',
    title: '타이틀이 노출됩니다.타이틀이 노출됩니다.타이틀이 노출됩니다.타이틀이 노출됩니다.',
    content: MOCK_CONTENT,
    writer: '[경위] 홍길동',
    createdAt: '2026.07.01',
    viewCount: 20,
    recommendCount: 20,
    recommended: false,
    mine: true,
    files: [
      { id: 1, name: MOCK_FILE_NAME, uploading: false },
      { id: 2, name: MOCK_FILE_NAME, uploading: false },
      { id: 3, name: MOCK_FILE_NAME, uploading: false },
    ],
  }
}

const MOCK_COMMENT_BODY =
  '등록된 댓글이 표시됩니다. 등록된 댓글이 표시됩니다.등록된 댓글이 표시됩니다. 등록된 댓글이 표시됩니다.등록된 댓글이 표시됩니다. 등록된 댓글이 표시됩니다.등록된 댓글이 표시됩니다.'

function createMockComments(): BoardComment[] {
  return [
    { id: 1, parentId: null, writer: '한경찰', createdAt: '2026-07-01 10:20', content: MOCK_COMMENT_BODY },
    { id: 2, parentId: 1, writer: '강길동', createdAt: '2026-07-01 10:32', content: MOCK_COMMENT_BODY },
    { id: 3, parentId: null, writer: '김철수', createdAt: '2026-07-02 09:11', content: MOCK_COMMENT_BODY },
    { id: 4, parentId: 3, writer: '김미소', createdAt: '2026-07-02 09:40', content: MOCK_COMMENT_BODY },
  ]
}

/* ── 스토어 ───────────────────────────────────────────────────────── */

function createBoardStore(s: BoardSpec) {
  /** 상세 화면이 보여주는 게시글 — 목록에서 넘어올 때 selectPost 로 바뀐다 */
  const current = ref<BoardPost>(createMockPost(s))
  const comments = ref<BoardComment[]>(createMockComments())

  /** 수정 화면이 쓰는 폼. 등록 화면은 createEmptyBoardForm() 으로 따로 만든다 */
  const editForm = reactive<BoardPostForm>(createEmptyBoardForm())

  function selectPost(id: number) {
    // 목업이라 한 건만 들고 있다. 실제로는 여기서 상세를 조회한다
    current.value = { ...createMockPost(s), id }
  }

  /** 수정 화면 진입 — 지금 보고 있는 글의 값을 폼으로 옮긴다 */
  function loadEditForm() {
    const p = current.value
    editForm.pinned = p.pinned
    editForm.pinnedFrom = p.pinnedFrom
    editForm.pinnedTo = p.pinnedTo
    editForm.open = p.open
    editForm.category = p.category
    editForm.dept = p.dept
    editForm.province = p.province
    editForm.week = p.week
    editForm.title = p.title
    editForm.content = p.content
    editForm.files = p.files.map((f) => ({ ...f }))
  }

  function toggleRecommend() {
    const p = current.value
    current.value = {
      ...p,
      recommended: !p.recommended,
      recommendCount: p.recommendCount + (p.recommended ? -1 : 1),
    }
  }

  function addComment(content: string, parentId: number | null = null) {
    const nextId = comments.value.length ? Math.max(...comments.value.map((c) => c.id)) + 1 : 1
    comments.value = [
      ...comments.value,
      { id: nextId, parentId, writer: '강길동', createdAt: nowText(), content },
    ]
  }

  function updateComment(id: number, content: string) {
    comments.value = comments.value.map((c) => (c.id === id ? { ...c, content } : c))
  }

  /** 대댓글이 달려 있으면 같이 지운다 */
  function removeComment(id: number) {
    comments.value = comments.value.filter((c) => c.id !== id && c.parentId !== id)
  }

  return {
    spec: s,
    current,
    comments,
    editForm,
    selectPost,
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

const singletons = new Map<BoardKey, ReturnType<typeof createBoardStore>>()

/** 게시판별 싱글턴 스토어. 목록/상세/수정/등록 네 화면이 같은 것을 받는다 */
export function useBoardStore(key: BoardKey) {
  let store = singletons.get(key)
  if (!store) {
    store = createBoardStore(BOARD_SPECS[key])
    singletons.set(key, store)
  }
  return store
}
