import { computed, ref } from 'vue'
import type { TreeNode } from '@/components/custom/tree'

/** 메뉴 트리 한 노드 */
export interface MenuNode extends TreeNode {
  name: string
  open?: boolean
  children?: MenuNode[]
}

/** 메뉴 편집 그리드 한 행 */
export interface MenuRow {
  /** 상위메뉴명 — 트리에서 고른 메뉴 */
  parent: string
  /** 메뉴ID (M00001 형식) */
  menuId: string
  /** 메뉴명 (셀에서 바로 편집) */
  name: string
  /** 채널구분 — pc-mo | pc | mo */
  channel: string
  /** 정렬 순번 */
  sort: string
  /** 사용 여부 */
  use: boolean
  /** 연결 경로 */
  path: string
}

/** 채널구분 옵션 (시안의 PC/MO · PC · MO) */
export const channelOptions = [
  { label: 'PC/ MO', value: 'pc-mo' },
  { label: 'PC', value: 'pc' },
  { label: 'MO', value: 'mo' },
]

/** TODO: API 연동 전까지 쓰는 메뉴 트리 목업 (포털 GNB 기준) */
function createMenuTree(): MenuNode[] {
  return [
    {
      name: '지역경찰포털',
      open: true,
      children: [
        { name: '지역경찰', children: [{ name: '개인수첩' }, { name: '근무일지' }] },
        {
          name: '생활안전',
          open: true,
          children: [
            { name: '범죄예방진단' },
            { name: '여성청소년' },
            { name: '방범협력단체' },
          ],
        },
        { name: '탄력순찰', children: [{ name: '순찰노선' }] },
        { name: '사건대응 시나리오' },
        { name: '통계', children: [{ name: '인사관리현황' }] },
        { name: '게시판', children: [{ name: '공지사항' }, { name: '자료실' }] },
        {
          name: '시스템관리',
          children: [
            { name: '시스템 운영 관리' },
            { name: '시스템 모니터링' },
            { name: '홈페이지 관리' },
            { name: '앱 관리' },
          ],
        },
      ],
    },
  ]
}

/** TODO: API 연동 전까지 쓰는 메뉴 목업. parent 는 트리 노드명과 맞춘다. */
function createMenuRows(): MenuRow[] {
  const seed: Array<Pick<MenuRow, 'parent' | 'name' | 'channel' | 'use' | 'path'>> = [
    { parent: '생활안전', name: '간소화 입력관리', channel: 'pc-mo', use: true, path: '/pcm/pub/physicalUsageReport.do' },
    { parent: '생활안전', name: 'CPO 입력관리', channel: 'pc', use: true, path: '/pcm/pub/physicalUsageReport.do' },
    { parent: '생활안전', name: '참고사항', channel: 'mo', use: false, path: '' },
    { parent: '생활안전', name: '간소화 입력관리', channel: 'pc-mo', use: true, path: '/pcm/pub/physicalUsageReport.do' },
    { parent: '생활안전', name: '진단인증', channel: 'pc-mo', use: true, path: '' },
    { parent: '생활안전', name: '간소화 입력관리', channel: 'pc-mo', use: false, path: '/pcm/pub/physicalUsageReport.do' },
    { parent: '범죄예방진단', name: '간이 범죄예방진단', channel: 'pc-mo', use: true, path: '/views/pub/PM-PUB-0101' },
    { parent: '범죄예방진단', name: 'CPO 입력·관리', channel: 'pc', use: true, path: '' },
    { parent: '시스템관리', name: '사용자 관리', channel: 'pc', use: true, path: '/views/com/PC-COM-2201' },
    { parent: '시스템관리', name: '메뉴 관리', channel: 'pc', use: true, path: '/views/com/PC-COM-2203' },
  ]

  return seed.map((item, index) => ({
    menuId: `M${String(index + 1).padStart(5, '0')}`,
    sort: String(index + 1),
    ...item,
  }))
}

export function useMenuManage() {
  /* ── 메뉴 트리 ─────────────────────────── */
  const menuTree = ref<MenuNode[]>(createMenuTree())
  /** 트리에서 고른 메뉴. 편집 그리드의 조회 조건이 된다 */
  const selectedMenu = ref<MenuNode | null>(null)

  let menuSeq = 1

  /** 고른 메뉴 아래에 새 하위 메뉴를 넣는다(선택이 없으면 최상위) */
  function addMenuNode() {
    const parent = selectedMenu.value
    if (parent) {
      if (!parent.children) parent.children = []
      parent.children.push({ name: `새 메뉴 ${menuSeq++}` })
      parent.open = true
      return
    }
    menuTree.value.push({ name: `새 메뉴 ${menuSeq++}` })
  }

  /** 트리에서 노드를 찾아 지운다(하위 포함) */
  function removeMenuNode(target: MenuNode, nodes: MenuNode[] = menuTree.value): boolean {
    const index = nodes.indexOf(target)
    if (index > -1) {
      nodes.splice(index, 1)
      return true
    }
    return nodes.some((node) => node.children && removeMenuNode(target, node.children))
  }

  /* ── 메뉴 편집 ─────────────────────────── */
  const allRows = ref<MenuRow[]>(createMenuRows())

  /**
   * 트리에서 고른 메뉴의 하위 메뉴만 보여준다.
   * 아무것도 안 고른 상태(진입 직후)에는 비어 있다.
   */
  const rows = computed(() => {
    if (!selectedMenu.value) return []
    return allRows.value.filter((row) => row.parent === selectedMenu.value!.name)
  })

  function selectMenu(node: MenuNode | null) {
    selectedMenu.value = node
  }

  /** 새 행은 지금 고른 메뉴의 하위로 붙는다 */
  function createEmptyRow(): MenuRow {
    const nextNo = allRows.value.length + 1
    return {
      parent: selectedMenu.value?.name ?? '',
      menuId: `M${String(nextNo).padStart(5, '0')}`,
      name: '',
      channel: 'pc-mo',
      sort: String(rows.value.length + 1),
      use: false,
      path: '',
    }
  }

  return {
    menuTree,
    selectedMenu,
    selectMenu,
    addMenuNode,
    removeMenuNode,
    rows,
    createEmptyRow,
  }
}
