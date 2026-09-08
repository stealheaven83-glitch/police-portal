import { computed, ref } from 'vue'

export interface SelectOption {
  label: string
  value: string
}

/** 단체종류 — '기타' 선택 시에만 상세 화면에 텍스트입력이 노출된다 */
export const groupTypeOptions: SelectOption[] = [
  { label: '자율방범대', value: 'volunteer-patrol' },
  { label: '생활안전협의회', value: 'safety-council' },
  { label: '기타', value: 'etc' },
]

/** 단체정보 목록 한 행 */
export interface GroupListRow {
  id: number
  dept: string
  groupType: string
  groupTypeEtc: string
  groupName: string
  foundedDate: string
  leaderName: string
  phone: string
  memberCount: number
  memberMale: number
  memberFemale: number
  insuredCount: number
  vehicleCount: number
  address: string
  addressDetail: string
  activityAreaTime: string
  note: string
  equipmentSupport: EquipmentSupportRow[]
  budgetSupport: BudgetSupportRow[]
  awards: AwardRow[]
}

export interface EquipmentSupportRow {
  id: number
  date: string
  vest: number
  baton: number
  flashlight: number
  cap: number
  raincoat: number
  gloves: number
  whistle: number
  jumper: number
  earmuffs: number
  liner: number
  etc: number
  amount: number
  note: string
}

export interface BudgetSupportRow {
  id: number
  date: string
  amount: number
}

export interface AwardRow {
  id: number
  date: string
  policeCommissioner: string
  provincialCommissioner: string
  stationChief: string
  note: string
}

/** 단체정보 상세/수정/등록 폼 — 목록 행과 필드는 같고 id 만 신규 등록을 위해 null 을 허용한다 */
export type GroupDetailForm = Omit<GroupListRow, 'id'> & { id: number | null }

export const activityTypeOptions: SelectOption[] = [
  { label: '순찰', value: 'patrol' },
  { label: '홍보활동', value: 'promotion' },
  { label: '간담회', value: 'meeting' },
  { label: '범죄예방교육', value: 'education' },
  { label: '기타', value: 'etc' },
]

/** 활동시간 select — 00:00~23:45, 15분 단위 */
export const activityTimeOptions: SelectOption[] = Array.from({ length: 96 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, '0')
  const m = String((i % 4) * 15).padStart(2, '0')
  const label = `${h}:${m}`
  return { label, value: label }
})

export interface ActivityListRow {
  id: number
  groupId: number
  date: string
  dept: string
  groupName: string
  groupType: string
  activityType: string
  participantCount: number
  timeFrom: string
  timeTo: string
  note: string
  address: string
  addressDetail: string
  jointArrest: string
  crimeReport: string
  drunkProtection: string
  elderlyProtection: string
  safeReturn: string
  etcActivity: string
}

/** 단체활동기록 상세 폼 — 목록 행과 필드는 같고 id/groupId 만 신규 등록(단체 미선택)을 위해 null 을 허용한다 */
export type ActivityDetailForm = Omit<ActivityListRow, 'id' | 'groupId'> & { id: number | null; groupId: number | null }

function createEmptyGroup(): GroupDetailForm {
  return {
    id: null,
    dept: '',
    groupType: '',
    groupTypeEtc: '',
    groupName: '',
    foundedDate: '',
    leaderName: '',
    phone: '',
    memberCount: 0,
    memberMale: 0,
    memberFemale: 0,
    insuredCount: 0,
    vehicleCount: 0,
    address: '',
    addressDetail: '',
    activityAreaTime: '',
    note: '',
    equipmentSupport: [],
    budgetSupport: [],
    awards: [],
  }
}

function createEmptyActivity(): ActivityDetailForm {
  return {
    id: null,
    groupId: null,
    date: '',
    dept: '',
    groupName: '',
    groupType: '',
    activityType: '',
    participantCount: 0,
    timeFrom: '',
    timeTo: '',
    note: '',
    address: '',
    addressDetail: '',
    jointArrest: '',
    crimeReport: '',
    drunkProtection: '',
    elderlyProtection: '',
    safeReturn: '',
    etcActivity: '',
}
}

function createMockGroups(): GroupListRow[] {
  const base = [
    { name: '신당동자율방범대', dept: '서울청 서울중부서 을지지구대', leader: '홍길동', male: 21, female: 3, phone: '010-1234-5678' },
    { name: '황학동자율방범대', dept: '서울청 서울중부서 광희지구대', leader: '최두식', male: 12, female: 3, phone: '010-5678-1234' },
    { name: '장충동자율방범대', dept: '서울청 서울중부서 을지지구대', leader: '김철수', male: 18, female: 2, phone: '010-2222-3333' },
    { name: '광희동생활안전협의회', dept: '서울청 서울중부서 광희지구대', leader: '이영희', male: 9, female: 6, phone: '010-4444-5555' },
  ]
  return base.map((b, i) => ({
    id: base.length - i,
    dept: b.dept,
    groupType: b.name.includes('협의회') ? 'safety-council' : 'volunteer-patrol',
    groupTypeEtc: '',
    groupName: b.name,
    foundedDate: '2024-08-06',
    leaderName: b.leader,
    phone: b.phone,
    memberCount: b.male + b.female,
    memberMale: b.male,
    memberFemale: b.female,
    insuredCount: b.male + b.female,
    vehicleCount: 2,
    address: '서울특별시 중구 을지로 264',
    addressDetail: '',
    activityAreaTime: '을지로 일대 / 20:00~22:00',
    note: '',
    equipmentSupport: [
      { id: 1, date: '2026-01-01', vest: 10, baton: 5, flashlight: 5, cap: 10, raincoat: 10, gloves: 10, whistle: 10, jumper: 10, earmuffs: 0, liner: 0, etc: 0, amount: 500000, note: '' },
    ],
    budgetSupport: [{ id: 1, date: '2026-01-01', amount: 1000000 }],
    awards: [{ id: 1, date: '2026-01-01', policeCommissioner: '', provincialCommissioner: '표창', stationChief: '', note: '' }],
  }))
}

function createMockActivities(groups: GroupListRow[]): ActivityListRow[] {
  const rows: ActivityListRow[] = []
  let id = 0
  const seeds = [
    { activityType: 'patrol', participants: 5, from: '15:00', to: '15:30' },
    { activityType: 'meeting', participants: 10, from: '19:00', to: '21:00' },
  ]
  groups.slice(0, 2).forEach((group, gi) => {
    seeds.forEach((seed, si) => {
      id += 1
      rows.push({
        id,
        groupId: group.id,
        date: si === 0 ? '2026-05-31' : '2026-05-23',
        dept: group.dept,
        groupName: group.groupName,
        groupType: group.groupType,
        activityType: seed.activityType,
        participantCount: seed.participants + gi,
        timeFrom: seed.from,
        timeTo: seed.to,
        note: '2026.5.31.15:00~15:30간 관내 순찰 및 방범 활동 진행. 특이사항 없음.',
        address: group.address,
        addressDetail: group.addressDetail,
        jointArrest: '',
        crimeReport: '',
        drunkProtection: '',
        elderlyProtection: '',
        safeReturn: '',
        etcActivity: '',
      })
    })
  })

  /*
   * 위 4건은 상세·수정 시나리오용이라 손대지 않고, 현황 화면(PC-PUB-0306/0307)이 여러 줄로
   * 집계되는 모습이 보이게 아래로 더 쌓는다. 활동종류·관서·단체종류 조합이 골고루 생기도록
   * 단체 전체 × 활동종류 전체를 돈다 — 0307 은 관서+단체종류+활동종류로 묶으므로 15줄이 된다.
   */
  type SpecialNote = Partial<Pick<ActivityListRow, 'jointArrest' | 'crimeReport' | 'drunkProtection' | 'elderlyProtection' | 'safeReturn' | 'etcActivity'>>
  const extraSeeds: {
    activityType: string
    date: string
    participants: number
    from: string
    to: string
    special: SpecialNote
  }[] = [
    { activityType: 'patrol', date: '2026-05-20', participants: 6, from: '20:00', to: '22:00', special: { safeReturn: '귀가길 동행 2건' } },
    { activityType: 'promotion', date: '2026-05-18', participants: 8, from: '14:00', to: '16:30', special: { crimeReport: '보이스피싱 의심 신고 1건' } },
    { activityType: 'meeting', date: '2026-05-15', participants: 12, from: '19:00', to: '20:30', special: {} },
    { activityType: 'education', date: '2026-05-12', participants: 15, from: '10:00', to: '12:00', special: { elderlyProtection: '독거노인 안부확인 3건' } },
    { activityType: 'etc', date: '2026-05-08', participants: 4, from: '13:00', to: '14:00', special: { etcActivity: '환경정비 지원', jointArrest: '절도 피의자 검거 지원 1건' } },
  ]
  groups.forEach((group, gi) => {
    extraSeeds.forEach((seed) => {
      id += 1
      rows.push({
        id,
        groupId: group.id,
        date: seed.date,
        dept: group.dept,
        groupName: group.groupName,
        groupType: group.groupType,
        activityType: seed.activityType,
        participantCount: seed.participants + gi,
        timeFrom: seed.from,
        timeTo: seed.to,
        note: `${seed.date.replace(/-/g, '.')} ${seed.from}~${seed.to}간 ${group.groupName} 활동 진행.`,
        address: group.address,
        addressDetail: group.addressDetail,
        jointArrest: '',
        crimeReport: '',
        drunkProtection: '',
        elderlyProtection: '',
        safeReturn: '',
        etcActivity: '',
        ...seed.special,
      })
    })
  })

  return rows
}

/**
 * 방범협력단체 도메인 상태 — 모듈 스코프 싱글턴.
 *
 * 단체정보 목록(PC-PUB-0301)/상세(PC-PUB-0302)/등록(PC-PUB-0303)과 단체활동기록(PM-PUB-0304),
 * 단체현황(PC-PUB-0306), 활동현황(PC-PUB-0307)이 전부 서로 다른 라우트(페이지)라서, 페이지를
 * 이동할 때마다 상태가 새로 생기면 방금 등록/수정한 내용이 목록에 반영되지 않는다. 그래서
 * PC-LPO-0701 때와 같은 이유로 싱글턴으로 둔다 — 최초 호출 때 한 번만 만들고 이후 호출은
 * 전부 같은 인스턴스를 돌려준다.
 */
function createPublicSafetyStore() {
  const groups = ref<GroupListRow[]>(createMockGroups())
  const activities = ref<ActivityListRow[]>(createMockActivities(groups.value))

  const groupOptions = computed<SelectOption[]>(() =>
    groups.value.map((g) => ({ label: g.groupName, value: String(g.id) })),
  )

  function findGroup(id: number) {
    return groups.value.find((g) => g.id === id)
  }

  function saveGroup(form: GroupDetailForm): GroupListRow {
    const payload: GroupListRow = {
      ...form,
      id: form.id ?? 0,
      equipmentSupport: [...form.equipmentSupport],
      budgetSupport: [...form.budgetSupport],
      awards: [...form.awards],
    }
    if (form.id != null) {
      const idx = groups.value.findIndex((g) => g.id === form.id)
      if (idx !== -1) {
        // splice 로 제자리 수정하면 배열 참조가 그대로라 TabulatorGrid 의 :data watch(얕은 비교)가
        // 변경을 못 감지한다 — 그래서 항상 배열을 새로 만들어 groups.value 를 갈아끼운다.
        groups.value = groups.value.map((g, i) => (i === idx ? payload : g))
        return payload
      }
    }
    const nextId = groups.value.length ? Math.max(...groups.value.map((g) => g.id)) + 1 : 1
    payload.id = nextId
    groups.value = [payload, ...groups.value]
    return payload
  }

  function deleteGroup(id: number) {
    groups.value = groups.value.filter((g) => g.id !== id)
  }

  function saveActivity(form: ActivityDetailForm): ActivityListRow {
    const group = form.groupId != null ? findGroup(form.groupId) : undefined
    const payload: ActivityListRow = {
      ...form,
      id: form.id ?? 0,
      groupId: form.groupId ?? 0,
      dept: group?.dept ?? form.dept,
      groupName: group?.groupName ?? form.groupName,
      groupType: group?.groupType ?? form.groupType,
    }
    if (form.id != null) {
      const idx = activities.value.findIndex((a) => a.id === form.id)
      if (idx !== -1) {
        activities.value = activities.value.map((a, i) => (i === idx ? payload : a))
        return payload
      }
    }
    const nextId = activities.value.length ? Math.max(...activities.value.map((a) => a.id)) + 1 : 1
    payload.id = nextId
    activities.value = [payload, ...activities.value]
    return payload
  }

  function deleteActivity(id: number) {
    activities.value = activities.value.filter((a) => a.id !== id)
  }

  return {
    groups,
    activities,
    groupOptions,
    findGroup,
    saveGroup,
    deleteGroup,
    saveActivity,
    deleteActivity,
  }
}

let singleton: ReturnType<typeof createPublicSafetyStore> | null = null

export function usePublicSafetyStore() {
  if (!singleton) singleton = createPublicSafetyStore()
  return singleton
}

export function createEmptyGroupForm(): GroupDetailForm {
  return createEmptyGroup()
}

export function createEmptyActivityForm(): ActivityDetailForm {
  return createEmptyActivity()
}

export const equipmentColumnLabels: { field: keyof EquipmentSupportRow; label: string }[] = [
  { field: 'vest', label: '조끼' },
  { field: 'baton', label: '불봉' },
  { field: 'flashlight', label: '렌턴' },
  { field: 'cap', label: '모자' },
  { field: 'raincoat', label: '우의' },
  { field: 'gloves', label: '장갑' },
  { field: 'whistle', label: '호각' },
  { field: 'jumper', label: '점퍼' },
  { field: 'earmuffs', label: '귀마개' },
  { field: 'liner', label: '내피' },
  { field: 'etc', label: '기타' },
]
