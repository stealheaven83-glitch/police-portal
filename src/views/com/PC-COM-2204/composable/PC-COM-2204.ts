import { computed, ref, type InjectionKey } from 'vue'

/**
 * 권한관리(PC-COM-2204) 화면 상태.
 *
 * 퍼블리싱 범위라 데이터는 전부 목업이고, 실제 조회/저장은 개발팀이 잇는다.
 * Figma: 8mQz91txveSEKO0ky7Ck6V / 10428:27097 (PC_시스템관리_01_사스템운영관리_04_권한관리)
 */

/** 좌측 "권한설정" 목록 한 행 */
export interface PermissionRow {
  /**
   * 행 고유키. TabulatorGrid 는 :data 를 복제해서 넘기므로 셀 버튼 핸들러가 받는 rowData 는
   * permissions.value 의 객체와 참조가 다르다 — id 는 여러 행이 공유(PA00002 반복)하니
   * 그걸로 못 찾고 이 rowKey 로 찾는다.
   */
  rowKey: number
  id: string
  /** 권한명 — 인라인 입력 */
  name: string
  /** 비고. 비어 있으면 '부서 조회' 버튼, 값이 있으면 그 요약 텍스트가 보인다 */
  deptNote: string
}

/** 우측 "메뉴별 권한설정" 한 행. 메뉴명은 depth 3단이 각각 별도 컬럼이다 */
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

export function usePermissionManagement() {
  const permissions = ref<PermissionRow[]>(createMockPermissions())
  /** 시안은 PA00002(범죄예방대응국) 행이 선택된 상태다 */
  const activePermissionKey = ref(2)
  const activePermission = computed(() =>
    permissions.value.find((p) => p.rowKey === activePermissionKey.value),
  )

  const menuPermissions = ref<MenuPermissionRow[]>(createMockMenuPermissions())

  /** 표 위 우측 '권한 조회' 입력 */
  const keyword = ref('')

  /* 부서조회 팝업(PC-COM-2205) / 전체 사용자 팝업(PC-COM-2207) 열림 상태 */
  const deptSearchOpen = ref(false)
  const allUsersOpen = ref(false)
  /** 어느 권한 행의 비고를 채우려고 부서조회를 열었는지 */
  const deptSearchTargetKey = ref<number | null>(null)

  let nextRowKey = permissions.value.length + 1

  function selectPermission(rowKey: number) {
    activePermissionKey.value = rowKey
  }

  function createPermissionRow(): PermissionRow {
    return { rowKey: nextRowKey++, id: 'PA00003', name: '', deptNote: '' }
  }

  function openDeptSearch(rowKey: number) {
    deptSearchTargetKey.value = rowKey
    deptSearchOpen.value = true
  }

  return {
    permissions,
    activePermissionKey,
    activePermission,
    menuPermissions,
    keyword,
    deptSearchOpen,
    allUsersOpen,
    deptSearchTargetKey,
    selectPermission,
    createPermissionRow,
    openDeptSearch,
  }
}

/**
 * 팝업(components/)이 페이지와 같은 인스턴스를 쓰도록 provide/inject 로 공유한다
 * (CLAUDE.md §3 패턴A — 팝업이 usePermissionManagement() 를 다시 부르면 상태가 갈라진다).
 */
export type PermissionManagementStore = ReturnType<typeof usePermissionManagement>
export const PermissionManagementKey: InjectionKey<PermissionManagementStore> =
  Symbol('PC-COM-2204-permission-management')
