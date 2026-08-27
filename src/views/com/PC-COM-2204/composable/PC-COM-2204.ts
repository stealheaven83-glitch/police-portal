import { computed, ref, type InjectionKey } from 'vue'

export interface PermissionRow {
  /**
   * 행 고유키. TabulatorGrid는 :data 를 JSON으로 복제해서 넘기므로(TabulatorGrid.vue 주석 참고)
   * 셀 버튼 핸들러에서 받는 rowData 는 permissions.value 의 객체와 참조가 다르다 — id 는
   * 여러 행이 공유(PA00002 반복)하니 그걸로 못 찾고, 이 rowKey 로 찾는다.
   */
  rowKey: number
  id: string
  name: string
  /** 부서조회 팝업에서 지정한 담당자 요약. 없으면 빈 문자열(= "부서 조회" 버튼만 표시) */
  deptNote: string
}

export interface MenuPermissionRow {
  menuId: string
  level1: string
  level2: string
  level3: string
  all: boolean
  read: boolean
  edit: boolean
  print: boolean
  excel: boolean
}

export interface DeptNode {
  station: string
  dept: string
}

export interface UserRow {
  userId: string
  rank: string
  name: string
  station: string
  dept: string
}

function createMockPermissions(): PermissionRow[] {
  return [
    { rowKey: 1, id: 'PA00001', name: '', deptNote: '' },
    { rowKey: 2, id: 'PA00002', name: '범죄예방대응국', deptNote: '' },
    { rowKey: 3, id: 'PA00002', name: '지역경찰운영과', deptNote: '' },
    { rowKey: 4, id: 'PA00002', name: '여성청소년범죄수사', deptNote: '홍길동 외 10' },
    { rowKey: 5, id: 'PA00002', name: '범죄예방기획계', deptNote: '' },
    { rowKey: 6, id: 'PA00002', name: '지역경찰운영과', deptNote: '' },
  ]
}

function createMockMenuPermissions(): MenuPermissionRow[] {
  const rows: Array<[string, string, string, string]> = [
    ['MP00004', '1. 지역경찰', '', ''],
    ['MP00003', '', '개인수첩', ''],
    ['MP00002', '', '', '메모'],
    ['MP00001', '', '', '근무일정조회'],
    ['MP00002', '', '', '사고/자원근무신청'],
    ['MP00001', '', '', '출동수당'],
    ['MP00001', '', '', '알림메시지'],
    ['MP00003', '', '근무일지', ''],
    ['MP00002', '', '', '근무일지(甲)'],
    ['MP00001', '', '', '근무일지(乙)'],
    ['MP00003', '', '인수인계', ''],
    ['MP00002', '', '', '인수인계작성'],
    ['MP00002', '', '', '인수인계현황'],
  ]
  return rows.map(([menuId, level1, level2, level3]) => ({
    menuId,
    level1,
    level2,
    level3,
    all: false,
    read: true,
    edit: true,
    print: false,
    excel: false,
  }))
}

export const deptList: DeptNode[] = [
  { station: '경찰대학', dept: '교무처' },
  { station: '경찰대학', dept: '교수부' },
  { station: '경찰대학', dept: '운영지원과' },
  { station: '경찰대학', dept: '학생지도부' },
  { station: '경찰대학', dept: '도서관' },
]

function createMockUsers(): UserRow[] {
  return [
    { userId: 'sdfdgdfg', rank: '경감', name: '홍길동', station: '경찰대학', dept: '교수부' },
    { userId: 'jytdrtg', rank: '경감', name: '홍길동', station: '경찰대학', dept: '교수부' },
    { userId: 'qweqwr', rank: '경정', name: '김길동', station: '경찰대학', dept: '교수부' },
    { userId: 'hjkhgkg', rank: '경위', name: '박길동', station: '경찰대학', dept: '교수부' },
    { userId: 'xdvsd', rank: '경감', name: '홍길동', station: '경찰대학', dept: '교수부' },
    { userId: 'uykghcm11', rank: '경감', name: '홍길동', station: '경찰대학', dept: '교수부' },
    { userId: 'sdfdgdfg2', rank: '경감', name: '홍길동', station: '부산청', dept: '청문감사인권관' },
    { userId: 'jytdrtg2', rank: '경감', name: '홍길동', station: '부산청', dept: '청문감사인권관' },
  ]
}

export function usePermissionManagement() {
  const permissions = ref<PermissionRow[]>(createMockPermissions())
  const activePermissionKey = ref(2)
  const activePermission = computed(() => permissions.value.find((p) => p.rowKey === activePermissionKey.value))

  const menuPermissions = ref<MenuPermissionRow[]>(createMockMenuPermissions())

  const allUsers = ref<UserRow[]>(createMockUsers())
  const activeDept = ref<DeptNode>(deptList[1])
  const usersInActiveDept = computed(() =>
    allUsers.value.filter((u) => u.station === activeDept.value.station && u.dept === activeDept.value.dept),
  )

  /** 부서조회 팝업의 "선택 사용자" 칩 목록 — 대상 권한 행이 바뀌면 그 행의 deptNote 로 초기화한다 */
  const selectedUsers = ref<UserRow[]>([allUsers.value[0], allUsers.value[2], allUsers.value[3]])

  const deptSearchOpen = ref(false)
  const allUsersOpen = ref(false)
  const deptSearchTargetKey = ref<number | null>(null)
  let nextRowKey = permissions.value.length + 1

  function selectPermission(rowKey: number) {
    activePermissionKey.value = rowKey
  }

  function addPermission() {
    permissions.value = [...permissions.value, { rowKey: nextRowKey++, id: 'PA00003', name: '', deptNote: '' }]
  }

  function openDeptSearch(rowKey: number) {
    deptSearchTargetKey.value = rowKey
    deptSearchOpen.value = true
  }

  function removeSelectedUser(userId: string) {
    selectedUsers.value = selectedUsers.value.filter((u) => u.userId !== userId)
  }

  /** 부서조회 팝업의 "권한적용" — 대상 권한 행의 비고에 선택 인원 요약을 반영한다 */
  function applyDeptSearch() {
    const key = deptSearchTargetKey.value
    if (key !== null) {
      const [first, ...rest] = selectedUsers.value
      const note = first ? (rest.length ? `${first.name} 외 ${rest.length}` : first.name) : ''
      permissions.value = permissions.value.map((row) => (row.rowKey === key ? { ...row, deptNote: note } : row))
    }
    deptSearchOpen.value = false
  }

  return {
    permissions,
    activePermissionKey,
    activePermission,
    menuPermissions,
    allUsers,
    deptList,
    activeDept,
    usersInActiveDept,
    selectedUsers,
    deptSearchOpen,
    allUsersOpen,
    selectPermission,
    addPermission,
    openDeptSearch,
    removeSelectedUser,
    applyDeptSearch,
  }
}

/**
 * 부서조회/전체사용자 팝업(components/)이 페이지와 같은 인스턴스를 쓰도록 provide/inject 로 공유한다.
 * PC-LPO-0701 의 EquipmentListKey 와 같은 패턴 — 팝업들이 usePermissionManagement() 를 다시
 * 부르지 않고 이 키로 inject 한다.
 */
export type PermissionManagementStore = ReturnType<typeof usePermissionManagement>
export const PermissionManagementKey: InjectionKey<PermissionManagementStore> = Symbol('PC-COM-2204-permission-management')
