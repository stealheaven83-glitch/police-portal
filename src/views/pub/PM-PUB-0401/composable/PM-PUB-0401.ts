import { computed, ref, type InjectionKey } from 'vue'

/**
 * 해바라기센터 관리 (PM-PUB-0401)
 *
 * 목록 화면 하나에 상세(PC-PUB-0402) · 등록(PC-PUB-0403) 팝업이 붙는 화면군이라
 * 상태를 여기서 한 번만 만들고 화면에서 provide 한다 — CLAUDE.md §3 패턴A.
 * 실제 조회/저장/삭제는 개발팀 몫이고 여기서는 목업 배열만 다룬다.
 */

/** 목록 한 행 */
export interface SunflowerCenterRow {
  /** 행을 특정하는 키. 화면에서 지운/고친 행을 찾을 때 no 대신 이걸 쓴다(CLAUDE.md §8) */
  rowKey: string
  no: number
  /** 마스킹된 성명 */
  name: string
  gender: string
  ageGroup: string
  symptom: string
  /** '112신고 (접수번호 : …)' 처럼 두 줄로 들어온다 */
  route: string
  region: string
  centerName: string
  updatedAt: string
  /** 아직 퇴소하지 않았으면 빈 문자열 */
  leftAt: string
}

/** 상세 · 등록 팝업이 쓰는 입력 폼 */
export interface SunflowerCenterForm {
  /** null 이면 신규 등록 */
  rowKey: string | null
  centerName: string
  address: string
  addressDetail: string
  office: string
  hospitalName: string
  phone: string
  note: string
}

/** 관할청 — 실제 코드값은 개발팀이 채운다 */
export const officeOptions = [
  { label: '서울청', value: 'seoul' },
  { label: '부산청', value: 'busan' },
  { label: '광주청', value: 'gwangju' },
  { label: '경기남부청', value: 'gyeonggi-south' },
]

/** 센터명 — 검색 조건용 */
export const centerNameOptions = [
  { label: '서울', value: 'seoul' },
  { label: '부산', value: 'busan' },
  { label: '광주', value: 'gwangju' },
]

function createEmptyForm(): SunflowerCenterForm {
  return {
    rowKey: null,
    centerName: '',
    address: '',
    addressDetail: '',
    office: '',
    hospitalName: '',
    phone: '',
    note: '',
  }
}

function createMockRows(): SunflowerCenterRow[] {
  return [
    {
      rowKey: 'center-2',
      no: 2,
      name: '김**',
      gender: '남',
      ageGroup: '30대',
      symptom: '경증',
      route: '112신고\n(접수번호 : 11112222333344)',
      region: '서울',
      centerName: '주취자응급의료센터(서울동부병원)',
      updatedAt: '2026-07-22 12:30',
      leftAt: '',
    },
    {
      rowKey: 'center-1',
      no: 1,
      name: '이**',
      gender: '여',
      ageGroup: '50대',
      symptom: '경증',
      route: '소방',
      region: '부산',
      centerName: '주취해소센터(부산의료원)',
      updatedAt: '2026-07-21 16:20',
      leftAt: '2026-07-23 11:30',
    },
  ]
}

function createSunflowerCenterList() {
  /* 검색 조건 — 시안에 조회 버튼이 없어서 값이 바뀌면 바로 걸러진다 */
  const searchOffice = ref('')
  const searchCenterName = ref('')

  const allRows = ref<SunflowerCenterRow[]>(createMockRows())

  const rows = computed(() =>
    allRows.value.filter((row) => {
      if (searchCenterName.value) {
        const label = centerNameOptions.find((o) => o.value === searchCenterName.value)?.label
        if (label && !row.centerName.includes(label) && row.region !== label) return false
      }
      return true
    }),
  )

  /** 지금 오른쪽 팝업에 떠 있는 행 — 목록에서 배경으로 표시한다 */
  const activeRowKey = ref<string | null>(null)

  /* 상세(PC-PUB-0402) · 등록(PC-PUB-0403) 팝업 */
  const formDialogOpen = ref(false)
  /** 'detail' 이면 제목이 '해바라기센터 상세', 'create' 면 '해바라기센터 등록' */
  const formMode = ref<'detail' | 'create'>('create')
  const form = ref<SunflowerCenterForm>(createEmptyForm())

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
    /*
     * 목록 행에는 상세 팝업이 요구하는 주소·관할청·전화번호가 없다(시안 그리드가
     * 그 항목들을 보여주지 않는다). 연동 전까지는 센터명만 옮기고 나머지는 비워 둔다.
     */
    form.value = {
      ...createEmptyForm(),
      rowKey: row.rowKey,
      centerName: row.centerName,
    }
    formDialogOpen.value = true
  }

  /** 화면단 필수값 확인만 한다 — 서버 검증은 개발팀 몫 */
  function validateForm(): string | null {
    if (!form.value.centerName.trim()) return '센터명을 입력해 주세요.'
    if (!form.value.office) return '관할청을 선택해 주세요.'
    return null
  }

  /** 목업 저장. 배열은 재할당한다 — splice 제자리 수정은 그리드가 못 잡는다(CLAUDE.md §3) */
  function commitForm() {
    if (form.value.rowKey) {
      allRows.value = allRows.value.map((row) =>
        row.rowKey === form.value.rowKey ? { ...row, centerName: form.value.centerName } : row,
      )
    } else {
      const nextNo = allRows.value.reduce((max, row) => Math.max(max, row.no), 0) + 1
      allRows.value = [
        {
          rowKey: `center-${nextNo}`,
          no: nextNo,
          name: '',
          gender: '',
          ageGroup: '',
          symptom: '',
          route: '',
          region: '',
          centerName: form.value.centerName,
          updatedAt: '',
          leftAt: '',
        },
        ...allRows.value,
      ]
    }
    formDialogOpen.value = false
  }

  function removeActiveRow() {
    allRows.value = allRows.value.filter((row) => row.rowKey !== activeRowKey.value)
    activeRowKey.value = null
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
    removeActiveRow,
  }
}

export type SunflowerCenterStore = ReturnType<typeof createSunflowerCenterList>

/**
 * PM-PUB-0401.vue 에서 한 번만 만들어 provide 하고, 상세·등록 팝업이 inject 로 같은 상태를 쓴다.
 * 팝업이 각자 useSunflowerCenterList() 를 부르면 상태가 갈라진다(CLAUDE.md §3 패턴A).
 */
export const SunflowerCenterKey: InjectionKey<SunflowerCenterStore> =
  Symbol('PM-PUB-0401-sunflower-center-list')

export function useSunflowerCenterList() {
  return createSunflowerCenterList()
}
