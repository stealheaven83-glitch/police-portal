import { computed, ref, type InjectionKey } from 'vue'

/**
 * 해바라기센터 사용자 (PM-PUB-0404)
 *
 * 목록 화면 하나에 사용자 상세(PC-PUB-0417) · 사용자 등록(PC-PUB-0418) 팝업이 붙는
 * 화면군이라 상태를 여기서 한 번만 만들고 화면에서 provide 한다 — CLAUDE.md §3 패턴A.
 */

/** 목록 한 행. 마스터/센터 수사관/일반 사용자 세 칸 중 자기 권한 칸에만 이름이 찍힌다 */
export interface CenterUserRow {
  rowKey: string
  no: number
  office: string
  centerName: string
  hospitalName: string
  /** 권한 코드 — 어느 칸에 이름을 넣을지 정한다 */
  role: CenterUserRole
  /** '홍길동 경감' 처럼 이름 + 직위 */
  userLabel: string
}

export type CenterUserRole = 'master' | 'investigator' | 'general'

/** 사용자 상세 · 등록 팝업이 쓰는 입력 폼 */
export interface CenterUserForm {
  /** null 이면 신규 등록 */
  rowKey: string | null
  office: string
  centerName: string
  hospitalName: string
  name: string
  position: string
  joinedDate: string
  role: string
}

export const officeOptions = [
  { label: '서울청', value: 'seoul' },
  { label: '부산청', value: 'busan' },
  { label: '광주청', value: 'gwangju' },
]

export const centerNameOptions = [
  { label: '서울', value: 'seoul' },
  { label: '부산', value: 'busan' },
  { label: '광주', value: 'gwangju' },
]

export const hospitalOptions = [
  { label: '서울대병원', value: 'snuh' },
  { label: '부산의료원', value: 'busan-mc' },
  { label: '조선대병원', value: 'chosun' },
]

/** 권한 — 목록의 '구분' 세 칸과 같은 값이다 */
export const roleOptions = [
  { label: '마스터', value: 'master' },
  { label: '센터 수사관', value: 'investigator' },
  { label: '일반 사용자', value: 'general' },
]

function createEmptyForm(): CenterUserForm {
  return {
    rowKey: null,
    office: '',
    centerName: '',
    hospitalName: '',
    name: '',
    position: '',
    joinedDate: '',
    role: '',
  }
}

function createMockRows(): CenterUserRow[] {
  return [
    {
      rowKey: 'user-3',
      no: 3,
      office: '서울청',
      centerName: '서울',
      hospitalName: '서울대병원',
      role: 'investigator',
      userLabel: '홍길동 경감',
    },
    {
      rowKey: 'user-1',
      no: 1,
      office: '서울청',
      centerName: '서울',
      hospitalName: '서울대병원',
      role: 'master',
      userLabel: '김두한 경감',
    },
    {
      rowKey: 'user-2',
      no: 1,
      office: '서울청',
      centerName: '서울',
      hospitalName: '서울대병원',
      role: 'general',
      userLabel: '이순자 경사',
    },
  ]
}

function createCenterUserList() {
  /* 검색 조건 — 시안에 조회 버튼이 없어서 값이 바뀌면 바로 걸러진다 */
  const searchOffice = ref('')
  const searchCenterName = ref('')

  const allRows = ref<CenterUserRow[]>(createMockRows())

  const rows = computed(() =>
    allRows.value.filter((row) => {
      if (searchOffice.value) {
        const label = officeOptions.find((o) => o.value === searchOffice.value)?.label
        if (label && row.office !== label) return false
      }
      if (searchCenterName.value) {
        const label = centerNameOptions.find((o) => o.value === searchCenterName.value)?.label
        if (label && row.centerName !== label) return false
      }
      return true
    }),
  )

  const activeRowKey = ref<string | null>(null)

  /* 사용자 상세(PC-PUB-0417) · 사용자 등록(PC-PUB-0418) 팝업 */
  const formDialogOpen = ref(false)
  const formMode = ref<'detail' | 'create'>('create')
  const form = ref<CenterUserForm>(createEmptyForm())

  function openCreate() {
    activeRowKey.value = null
    formMode.value = 'create'
    form.value = createEmptyForm()
    formDialogOpen.value = true
  }

  function openDetail(rowKey: string) {
    const row = allRows.value.find((r) => r.rowKey === rowKey)
    if (!row) return
    activeRowKey.value = rowKey
    formMode.value = 'detail'
    // '홍길동 경감' → 이름 / 직위. 시안 상세는 이 둘을 따로 보여준다
    const [name = '', position = ''] = row.userLabel.split(' ')
    form.value = {
      rowKey: row.rowKey,
      office: row.office,
      centerName: row.centerName,
      hospitalName: row.hospitalName,
      name,
      position,
      // 시안 상세의 '센터 전입일' 은 목록에 없는 값이라 연동 전까지 고정 목업이다
      joinedDate: '2026.01.02',
      role: row.role,
    }
    formDialogOpen.value = true
  }

  function validateForm(): string | null {
    if (!form.value.name.trim()) return '성명을 입력해 주세요.'
    if (!form.value.role) return '권한을 선택해 주세요.'
    return null
  }

  /** 배열은 재할당한다 — splice 제자리 수정은 그리드가 못 잡는다(CLAUDE.md §3) */
  function commitForm() {
    const label = [form.value.name, form.value.position].filter(Boolean).join(' ')
    if (form.value.rowKey) {
      allRows.value = allRows.value.map((row) =>
        row.rowKey === form.value.rowKey
          ? { ...row, role: form.value.role as CenterUserRole, userLabel: label }
          : row,
      )
    } else {
      const nextNo = allRows.value.reduce((max, row) => Math.max(max, row.no), 0) + 1
      allRows.value = [
        {
          rowKey: `user-${Date.now()}`,
          no: nextNo,
          office: officeOptions.find((o) => o.value === form.value.office)?.label ?? '',
          centerName: centerNameOptions.find((o) => o.value === form.value.centerName)?.label ?? '',
          hospitalName: hospitalOptions.find((o) => o.value === form.value.hospitalName)?.label ?? '',
          role: form.value.role as CenterUserRole,
          userLabel: label,
        },
        ...allRows.value,
      ]
    }
    formDialogOpen.value = false
  }

  function removeForm() {
    allRows.value = allRows.value.filter((row) => row.rowKey !== form.value.rowKey)
    activeRowKey.value = null
    formDialogOpen.value = false
  }

  return {
    searchOffice,
    searchCenterName,
    rows,
    activeRowKey,
    formDialogOpen,
    formMode,
    form,
    openCreate,
    openDetail,
    validateForm,
    commitForm,
    removeForm,
  }
}

export type CenterUserStore = ReturnType<typeof createCenterUserList>

export const CenterUserKey: InjectionKey<CenterUserStore> = Symbol('PM-PUB-0404-center-user-list')

export function useCenterUserList() {
  return createCenterUserList()
}
