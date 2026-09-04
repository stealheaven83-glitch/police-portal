import { computed, ref } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/**
 * 우수시설인증 (PM-PUB-0113)
 *
 * 좌측 인증 목록에서 한 건을 고르면 우측 체크리스트가 그 건으로 바뀐다.
 * 조회/저장은 개발팀 몫이라 여기서는 목업 배열만 다룬다.
 */

/** 인증 목록 한 행 */
export interface CertificationRow {
  rowKey: string
  no: number
  dept: string
  /** 시설 유형 */
  facilityType: string
  address: string
  /** 진단일시 */
  diagnosedAt: string
  /** 인증구분 */
  certificationType: string
  /** 인증일자 */
  certifiedAt: string
}

/** 우측 체크리스트 */
export interface CertificationChecklist {
  address: string
  facilityName: string
  usageScale: string
  checklistType: string
  approvalDate: string
  ownerName: string
  ownerPhone: string
  /** 'yes' | 'no' */
  damaged: string
  damageCount: number
}

/** 인증구분 — sentinel 은 '' 가 아니라 'all'(CLAUDE.md §8) */
export const certificationTypeOptions = [
  { label: '전체', value: 'all' },
  { label: '신규인증', value: 'new' },
  { label: '재인증', value: 'renew' },
]

/** 체크리스트 형태 */
export const checklistTypeOptions = [
  { label: '전체', value: 'all' },
  { label: '공동주택', value: 'apartment' },
  { label: '다중이용시설', value: 'public' },
  { label: '주차장', value: 'parking' },
]

function createMockRows(): CertificationRow[] {
  return [
    {
      rowKey: 'cert-195',
      no: 195,
      dept: '서울청 서울종로서',
      facilityType: '초대형쇼핑센터 주차장',
      address: '서울특별시 종로구 종로3길 17',
      diagnosedAt: '2026-06-01 00:00',
      certificationType: '신규인증',
      certifiedAt: '2026-06-05',
    },
    {
      rowKey: 'cert-194',
      no: 194,
      dept: '서울청 서울종로서',
      facilityType: '초대형쇼핑센터 주차장',
      address: '서울특별시 종로구 종로3길 17',
      diagnosedAt: '2026-06-01 00:00',
      certificationType: '신규인증',
      certifiedAt: '2026-06-05',
    },
    {
      rowKey: 'cert-193',
      no: 193,
      dept: '서울청 서울종로서',
      facilityType: '초대형쇼핑센터 주차장',
      address: '서울특별시 종로구 종로3길 17',
      diagnosedAt: '2026-06-01 00:00',
      certificationType: '재인증',
      certifiedAt: '2026-06-07',
    },
    {
      rowKey: 'cert-192',
      no: 195,
      dept: '서울청 서울종로서',
      facilityType: '초대형쇼핑센터 주차장',
      address: '서울특별시 종로구 종로3길 17',
      diagnosedAt: '2026-06-01 00:00',
      certificationType: '신규인증',
      certifiedAt: '2026-06-09',
    },
  ]
}

function createChecklist(row?: CertificationRow): CertificationChecklist {
  return {
    address: row ? `${row.address} 하나투어빌딩` : '',
    facilityName: '',
    usageScale: '',
    checklistType: 'all',
    approvalDate: '',
    ownerName: '',
    ownerPhone: '',
    damaged: 'no',
    damageCount: 4,
  }
}

export function useExcellentFacilityCertification() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const advancedSearchOpen = ref(true)

  const registeredFrom = ref('2026-07-16')
  const registeredTo = ref('2026-07-16')
  const certificationType = ref('all')

  const allRows = ref<CertificationRow[]>(createMockRows())

  const rows = computed(() =>
    allRows.value.filter((row) => {
      if (certificationType.value !== 'all') {
        const label = certificationTypeOptions.find((o) => o.value === certificationType.value)?.label
        if (label && row.certificationType !== label) return false
      }
      return true
    }),
  )

  /** 지금 우측 체크리스트에 떠 있는 행 */
  const activeRowKey = ref<string | null>(rows.value[1]?.rowKey ?? null)
  const checklist = ref<CertificationChecklist>(
    createChecklist(allRows.value.find((r) => r.rowKey === activeRowKey.value)),
  )

  /** 체크리스트는 '수정'을 눌러야 고칠 수 있다(시안의 기본 상태는 조회) */
  const editing = ref(false)

  function selectRow(rowKey: string) {
    const row = allRows.value.find((r) => r.rowKey === rowKey)
    if (!row) return
    activeRowKey.value = rowKey
    checklist.value = createChecklist(row)
    editing.value = false
  }

  /** 새 인증 건 — 목록에 먼저 넣고 체크리스트를 비운다 */
  function createRow() {
    const nextNo = allRows.value.reduce((max, row) => Math.max(max, row.no), 0) + 1
    const row: CertificationRow = {
      rowKey: `cert-${Date.now()}`,
      no: nextNo,
      dept: '',
      facilityType: '',
      address: '',
      diagnosedAt: '',
      certificationType: '신규인증',
      certifiedAt: '',
    }
    // 배열은 재할당한다 — splice 제자리 수정은 그리드가 못 잡는다(CLAUDE.md §3)
    allRows.value = [row, ...allRows.value]
    activeRowKey.value = row.rowKey
    checklist.value = createChecklist()
    editing.value = true
  }

  return {
    department,
    advancedSearchOpen,
    registeredFrom,
    registeredTo,
    certificationType,
    rows,
    activeRowKey,
    checklist,
    editing,
    selectRow,
    createRow,
  }
}
