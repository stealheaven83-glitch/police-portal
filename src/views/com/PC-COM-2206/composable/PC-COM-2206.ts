import { computed, ref } from 'vue'

/**
 * 코드 관리(PC-COM-2206) 화면 상태.
 *
 * 상위코드를 고르면 오른쪽에 그 상위코드의 하위코드 목록이 보인다.
 * 퍼블리싱 범위라 데이터는 전부 목업이고, 실제 조회/저장은 개발팀이 잇는다.
 */

/** 상위코드 목록 한 행 */
export interface CodeParentRow {
  /**
   * 행 고유키. 공통코드는 인라인으로 고칠 수 있어 키로 쓸 수 없고, TabulatorGrid 는
   * :data 를 복제해서 넘기므로 원본 행을 되찾을 식별자가 따로 필요하다
   * (PC-COM-2204 의 rowKey 와 같은 이유).
   */
  rowKey: number
  /** 상위코드명 — 시안에서 읽기 전용 텍스트 */
  name: string
  /** 공통코드 — 시안에서 인라인 입력 */
  code: string
}

/** 하위코드 목록 한 행 */
export interface CodeChildRow {
  rowKey: number
  code: string
  name: string
  description: string
  /** 순번. 그리드 input 셀이 문자열을 커밋하므로 문자열로 둔다 */
  sortOrder: string
  /** 사용 여부(스위치) */
  use: boolean
}

/** 시안의 상위코드 목록 — 5행 모두 같은 이름에 공통코드만 다르다 */
function createMockParents(): CodeParentRow[] {
  return [
    { rowKey: 1, name: '유흥/풍속 업소', code: 'C00001' },
    { rowKey: 2, name: '유흥/풍속 업소', code: 'C00002' },
    { rowKey: 3, name: '유흥/풍속 업소', code: 'C00003' },
    { rowKey: 4, name: '유흥/풍속 업소', code: 'C00004' },
    { rowKey: 5, name: '유흥/풍속 업소', code: 'C00005' },
  ]
}

/**
 * 상위코드 rowKey -> 하위코드 목록.
 * rowKey 3(C00003)이 시안에 그려진 목록이고, 나머지는 상위코드를 바꿨을 때 오른쪽이
 * 실제로 바뀌는 게 보이도록 임의로 채운 목업이다.
 */
function createMockChildren(): Record<number, CodeChildRow[]> {
  return {
    1: [
      { rowKey: 101, code: 'C00001', name: '유흥주점', description: '', sortOrder: '1', use: true },
      { rowKey: 102, code: 'C00002', name: '단란주점', description: '', sortOrder: '2', use: true },
    ],
    2: [
      { rowKey: 201, code: 'C00001', name: '숙박업', description: '', sortOrder: '1', use: true },
    ],
    3: [
      { rowKey: 301, code: 'C00001', name: '일반 음식점', description: '', sortOrder: '1', use: false },
      { rowKey: 302, code: 'C00002', name: '커피숍/다방', description: '', sortOrder: '2', use: true },
      { rowKey: 303, code: 'C00003', name: '노래방', description: '', sortOrder: '3', use: false },
      { rowKey: 304, code: 'C00004', name: '일반간이주점', description: '', sortOrder: '4', use: true },
      { rowKey: 305, code: 'C00005', name: '단란/유흥주점', description: '단란주점코드', sortOrder: '5', use: true },
    ],
    4: [
      { rowKey: 401, code: 'C00001', name: '목욕장업', description: '', sortOrder: '1', use: true },
      { rowKey: 402, code: 'C00002', name: '이용업', description: '', sortOrder: '2', use: false },
    ],
    5: [
      { rowKey: 501, code: 'C00001', name: '게임제공업', description: '', sortOrder: '1', use: true },
    ],
  }
}

export function useCodeManagement() {
  /** 상단 '코드조회' 입력값 */
  const keyword = ref('')
  const parentRows = ref<CodeParentRow[]>(createMockParents())
  const childMap = ref<Record<number, CodeChildRow[]>>(createMockChildren())
  /** 시안은 C00003 행이 선택된 상태다 */
  const activeParentKey = ref<number | null>(3)

  const activeParent = computed(
    () => parentRows.value.find((r) => r.rowKey === activeParentKey.value) ?? null,
  )

  /**
   * 선택한 상위코드의 하위코드 목록.
   * 쓰기 가능한 computed 라 그리드에 v-model:data 로 그대로 물릴 수 있고, 인라인 편집·추가·
   * 삭제 결과가 그 상위코드 것으로 childMap 에 되돌아간다.
   * (set 에서 childMap 을 통째로 재할당하는 건 CLAUDE.md §3 — 제자리 수정은 감지가 안 된다)
   */
  const childRows = computed<CodeChildRow[]>({
    get: () => (activeParentKey.value == null ? [] : childMap.value[activeParentKey.value] ?? []),
    set: (rows) => {
      if (activeParentKey.value == null) return
      childMap.value = { ...childMap.value, [activeParentKey.value]: rows }
    },
  })

  function selectParent(rowKey: number) {
    activeParentKey.value = rowKey
  }

  // 추가로 생긴 행에도 겹치지 않는 rowKey 를 주려고 목업 범위 밖에서 세어 올린다
  let nextParentKey = 1000
  function createParentRow(): CodeParentRow {
    return { rowKey: (nextParentKey += 1), name: '', code: '' }
  }

  let nextChildKey = 2000
  function createChildRow(): CodeChildRow {
    return { rowKey: (nextChildKey += 1), code: '', name: '', description: '', sortOrder: '', use: true }
  }

  return {
    keyword,
    parentRows,
    activeParentKey,
    activeParent,
    childRows,
    selectParent,
    createParentRow,
    createChildRow,
  }
}
