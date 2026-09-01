import { computed, reactive, ref, type InjectionKey } from 'vue'
import type { TreeNode } from '@/components/custom/tree'

/** 부서 트리 한 노드 */
export interface DeptNode extends TreeNode {
  name: string
  open?: boolean
  children?: DeptNode[]
}

/** 사용자목록 한 행 */
export interface UserRow {
  no: number
  userId: string
  /** 계급 */
  rank: string
  name: string
  /** 소속관서 */
  agency: string
  /** 소속부서 */
  dept: string
  /** '사용' | '사용안함' */
  use: string
}

/** 권한목록 한 행 */
export interface AuthRow {
  code: string
  name: string
}

/** 사용자 조회 기준 */
export const searchFieldOptions = [
  { label: '성명', value: 'name' },
  { label: '사용자ID', value: 'userId' },
  { label: '소속부서', value: 'dept' },
]

function createDeptTree(): DeptNode[] {
  return [
    {
      name: '지역경찰포털',
      open: true,
      children: [
        { name: '본청' },
        {
          name: '경찰대학',
          open: true,
          children: [
            { name: '지역경찰포털' },
            {
              name: '지역경찰포털',
              open: true,
              children: [
                {
                  name: '경찰대학',
                  open: true,
                  children: [
                    { name: '경찰대학 교수부' },
                    { name: '경찰대학 교무처' },
                    { name: '경찰대학 운영지원과' },
                  ],
                },
                { name: '중앙경찰학교', children: [{ name: '교무과' }] },
                { name: '경찰수사연수원', children: [{ name: '교육지원과' }] },
                { name: '지역경찰포털' },
              ],
            },
          ],
        },
        { name: '지역경찰포털' },
        { name: '지역경찰포털' },
      ],
    },
        {
      name: '지역경찰포털',
      open: true,
      children: [
        { name: '본청' },
        {
          name: '경찰대학',
          open: true,
          children: [
            { name: '지역경찰포털' },
            {
              name: '지역경찰포털',
              open: true,
              children: [
                {
                  name: '경찰대학',
                  open: true,
                  children: [
                    { name: '경찰대학 교수부' },
                    { name: '경찰대학 교무처' },
                    { name: '경찰대학 운영지원과' },
                  ],
                },
                { name: '중앙경찰학교', children: [{ name: '교무과' }] },
                { name: '경찰수사연수원', children: [{ name: '교육지원과' }] },
                { name: '지역경찰포털' },
              ],
            },
          ],
        },
        { name: '지역경찰포털' },
        { name: '지역경찰포털' },
      ],
    },
  ]
}

/** TODO: API 연동 전까지 쓰는 사용자 목록 목업 */
function createUserRows(): UserRow[] {
  const ids = [
    'sdfdgdfg',
    'jytdrtg',
    'qweqwr',
    'hjkhgkg',
    'xdvsd',
    'uykghcm11',
    'sgdbg',
    '234drgdfg',
    'ghjfg2',
    'dfgbdcf',
    'qweqwe',
    'zxcvzxc',
  ]
  const ranks = ['경감', '경감', '경감', '경위', '경감', '경감', '해당없음', '경감', '경감', '경위', '경감', '경위']

  return ids.map((userId, index) => ({
    no: index + 1,
    userId,
    rank: ranks[index] ?? '경감',
    name: '홍길동',
    agency: '부산청 부산사상서',
    dept: '청문감사인권관',
    // 4번만 미사용인 시안을 그대로 따른다
    use: index === 3 ? '사용안함' : '사용',
  }))
}

function createAuthRows(): AuthRow[] {
  return [
    { code: 'lpo', name: '지역경찰운영과' },
    { code: 'admin', name: '시스템관리자' },
    { code: 'prevention', name: '범죄예방계' },
  ]
}

export function useUserAuthManage() {
  /* ── 부서 트리 ─────────────────────────── */
  const deptTree = ref<DeptNode[]>(createDeptTree())
  /** 트리에서 고른 부서. 사용자목록 조회 조건이 된다 */
  const selectedDept = ref<DeptNode | null>(null)

  /** 이름을 입력받는 중인 노드. TreeView 가 이 노드만 입력창으로 바꿔 그린다 */
  const editingDept = ref<DeptNode | null>(null)

  /*
   * 트리에 노드를 넣고 빼는 일은 화면이 TreeView 의 addNode/removeNode 로 한다.
   * 여기서 deptTree 배열을 직접 고치면 he-tree 가 화면을 다시 그리지 않는다
   * (트리 데이터를 deep 없이 감시해서 중첩 배열의 제자리 수정은 감지되지 않는다).
   * 이 컴포저블은 "무엇을 넣을지"와 이름 입력 상태만 들고 있는다.
   */

  /** 이름을 아직 안 정한 새 부서 노드 */
  function createDeptNode(): DeptNode {
    return { name: '' }
  }

  /** 이 노드의 입력창을 연다 */
  function beginDeptEdit(node: DeptNode) {
    editingDept.value = node
  }

  /**
   * 입력한 이름을 확정한다. 저장했으면 true.
   * 이름이 비면 false — 방금 만든 빈 노드는 화면이 트리에서 뺀다.
   */
  function commitDeptName(node: DeptNode, name: string): boolean {
    const trimmed = name.trim()
    editingDept.value = null
    if (!trimmed) return false
    node.name = trimmed
    return true
  }

  /** 입력을 취소한다. 아직 이름이 없는 새 노드면 true — 화면이 트리에서 뺀다 */
  function cancelDeptEdit(node: DeptNode): boolean {
    editingDept.value = null
    return !node.name.trim()
  }

  /* ── 사용자목록 ────────────────────────── */
  const searchField = ref('name')
  const searchKeyword = ref('')
  /** 조회 버튼을 눌렀을 때 확정되는 조건 */
  const appliedKeyword = ref('')

  const allUsers = ref<UserRow[]>(createUserRows())
  const selectedUser = ref<UserRow | null>(null)

  /**
   * 부서를 고르기 전에는 비워 둔다(메뉴관리 PC-COM-2203 과 같은 방식).
   * 목업이라 어느 부서를 골라도 같은 목록이 나온다 — 실제로는 부서코드로 조회한다.
   */
  const users = computed(() => {
    if (!selectedDept.value) return []

    const keyword = appliedKeyword.value.trim()
    if (!keyword) return allUsers.value

    const field = searchField.value as keyof UserRow
    return allUsers.value.filter((user) => String(user[field] ?? '').includes(keyword))
  })

  function searchUsers() {
    appliedKeyword.value = searchKeyword.value
  }

  /* ── 권한목록 ──────────────────────────── */
  const authKeyword = ref('')
  const allAuths = ref<AuthRow[]>(createAuthRows())
  /** 선택한 사용자가 가진 권한 코드 */
  const checkedAuthCodes = ref<string[]>([])

  const auths = computed(() => {
    const keyword = authKeyword.value.trim()
    if (!keyword) return allAuths.value
    return allAuths.value.filter((auth) => auth.name.includes(keyword))
  })

  /**
   * 사용자를 고르면 그 사용자의 권한을 불러온다.
   * TODO: 실제로는 사용자ID로 권한을 조회해 와야 한다.
   */
  function selectUser(user: UserRow | null) {
    selectedUser.value = user
    checkedAuthCodes.value = user ? ['admin', 'prevention'] : []
  }

  return {
    deptTree,
    selectedDept,
    editingDept,
    createDeptNode,
    beginDeptEdit,
    commitDeptName,
    cancelDeptEdit,
    searchField,
    searchKeyword,
    users,
    selectedUser,
    searchUsers,
    selectUser,
    authKeyword,
    auths,
    checkedAuthCodes,
  }
}

/* ------------------------------------------------------------------ *
 * 사용자 정보 팝업 (PC-COM-2202)
 * ------------------------------------------------------------------ */

export interface UserDetail {
  /** 사용자 No (시스템 내부 번호) */
  userNo: string
  userId: string
  name: string
  agency: string
  dept: string
  /** 비밀번호 변경일자 */
  pwChangedAt: string
  /** 경비전화 */
  officePhone: string
  mobile: string
  /** 사용여부 — Y | N */
  use: string
}

function createUserDetail(): UserDetail {
  return {
    userNo: '',
    userId: '',
    name: '',
    agency: '',
    dept: '',
    pwChangedAt: '',
    officePhone: '',
    mobile: '',
    use: 'Y',
  }
}

export function useUserDetail() {
  const detailOpen = ref(false)
  const detailForm = reactive<UserDetail>(createUserDetail())

  /**
   * 목록에서 고른 사용자로 팝업을 채운다.
   * TODO: 실제로는 사용자ID로 상세를 조회해 와야 한다. 지금은 목록 값 + 목업으로 채운다.
   */
  function openUserDetail(user: UserRow) {
    Object.assign(detailForm, createUserDetail(), {
      userNo: String(100071757 + user.no),
      userId: user.userId,
      name: user.name,
      agency: user.agency,
      dept: user.dept,
      pwChangedAt: '2026-05-11',
      officePhone: '0600',
      mobile: '01012345678',
      use: user.use === '사용' ? 'Y' : 'N',
    })
    detailOpen.value = true
  }

  function closeUserDetail() {
    detailOpen.value = false
  }

  return {
    detailOpen,
    detailForm,
    openUserDetail,
    closeUserDetail,
  }
}

/**
 * PC-COM-2201.vue 에서 컴포저블을 합쳐 한 번만 만들고 provide 하면,
 * 팝업(components/)은 이 키로 inject 해서 같은 상태를 쓴다.
 */
export type UserManageStore = ReturnType<typeof useUserAuthManage> &
  ReturnType<typeof useUserDetail>
export const UserManageKey: InjectionKey<UserManageStore> = Symbol('PC-COM-2201-user-manage')
