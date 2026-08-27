import { computed, ref } from 'vue'
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

  let deptSeq = 1

  function addDept() {
    // 고른 부서가 있으면 그 아래로, 없으면 최상위에 추가한다
    const parent = selectedDept.value
    if (parent) {
      if (!parent.children) parent.children = []
      parent.children.push({ name: `새 부서 ${deptSeq++}` })
      parent.open = true
      return
    }
    deptTree.value.push({ name: `새 부서 ${deptSeq++}` })
  }

  /** 트리에서 노드를 찾아 지운다(하위 포함) */
  function removeDept(target: DeptNode, nodes: DeptNode[] = deptTree.value): boolean {
    const index = nodes.indexOf(target)
    if (index > -1) {
      nodes.splice(index, 1)
      return true
    }
    return nodes.some((node) => node.children && removeDept(target, node.children))
  }

  /* ── 사용자목록 ────────────────────────── */
  const searchField = ref('name')
  const searchKeyword = ref('')
  /** 조회 버튼을 눌렀을 때 확정되는 조건 */
  const appliedKeyword = ref('')

  const allUsers = ref<UserRow[]>(createUserRows())
  const selectedUser = ref<UserRow | null>(null)

  const users = computed(() => {
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
    addDept,
    removeDept,
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
