import { ref, type InjectionKey } from 'vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'

/** 근무일지(乙) 한 줄 */
export interface WorkLogRow {
  id: number
  /** 근무시간 (인라인 입력) */
  time: string
  /** 근무구분 */
  kind: string
  /** 활동내역 (여러 줄) */
  activity: string
  /** 작성자 */
  writer: string
  /** 작성일시 — 활동내역 칸 아래에 한 줄로 붙는다(시안 12711:73786) */
  writtenAt: string
  /** 처리자 — 비어 있으면 '처리자 관리' 버튼으로 보인다 */
  handlers: string
  /** 인수인계 대상 여부 */
  handover: boolean
  /** 첨부파일이 붙어 있는지 */
  hasFile: boolean
  /** 상세 보기가 가능한 행인지(112신고 등) */
  hasDetail: boolean
  /** 아직 저장 전인 신규 입력 행 — 시안은 이 행에만 입력칸을 둔다(기획서 8-1) */
  isNew?: boolean
}

/** 기획서 8-1 '구분' — 이 목록에서 고른다 */
export const workKindOptions = [
  { label: '탄력순찰', value: '탄력순찰' },
  { label: '맞춤형순찰', value: '맞춤형순찰' },
  { label: '도보순찰', value: '도보순찰' },
  { label: '홍보활동', value: '홍보활동' },
  { label: '교육훈련', value: '교육훈련' },
  { label: '현장서류', value: '현장서류' },
  { label: '직접입력', value: '직접입력' },
]

/** 기획서 8-1 '근무시간' — 00:00 ~ 23:45 를 15분 간격으로 고른다 */
export const workTimeOptions = Array.from({ length: 96 }, (_, i) => {
  const label = `${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`
  return { label, value: label }
})

/** 112누락정보 팝업(PM-LPO-0219) 입력값 */
export interface MissingReportForm {
  /** 접수번호 — 조회 버튼으로 112신고를 끌어온다 */
  receiptNo: string
  code: string
  caseNo: string
  /** 종결내용 */
  closing: string
  /** 근무자 지정 */
  workDate: string
  shift: 'day' | 'night' | 'none'
  worker: string
}

/** 출동사건정보 팝업(PM-LPO-0220) 의 출동요소 한 줄 */
export interface DispatchUnitRow {
  id: number
  unit: string
  arrivedAt: string
  members: string
}

/** 처리자 관리 팝업(PM-LPO-0221) 한 줄 */
export interface HandlerRow {
  id: number
  rank: string
  name: string
  /** 처리자로 지정됐는지 */
  picked: boolean
}

/** 파일 업로드 팝업(PM-LPO-0222) 한 줄 */
export interface WorkLogFile {
  id: number
  name: string
}

function createMockRows(): WorkLogRow[] {
  return [
    // 시안 12622:71105 — 표 첫 줄은 값이 비어 있는 신규 입력 행이다
    { id: 0, time: '', kind: '', activity: '', writer: '경감 홍길동', writtenAt: '', handlers: '', handover: false, hasFile: false, hasDetail: false, isNew: true },
    {
      id: 1,
      time: '08:00',
      kind: '근무 인수 인계 및 교양',
      // 시안 12711:73775 — 항목은 *, 그 항목에 딸린 설명은 - 로 시작한다
      activity: [
        '* 교통사고 초동조치 시 사상자 구호 철저',
        '- 안면 구조 최우선 순위로 설정 119 후송 등 적극 구조조치 실시',
        '* 공동출입문 프리패스 활동',
        '* 현장조치 우수사례 미담, 선행 작는 발굴 및 포상',
      ].join('\n'),
      writer: '경감 홍길동',
      writtenAt: '2026-01-01 14:00',
      handlers: '',
      handover: false,
      hasFile: false,
      hasDetail: false,
    },
    {
      id: 2,
      time: '08:30',
      kind: '112신고',
      activity: 'C1(000000)-비상벨 (접수일시 : 2026-01-01 09:00:10)\n비상벨 오작동(업주가 잘못 누름)',
      writer: '경감 홍길동',
      writtenAt: '2026-01-01 14:00',
      handlers: '홍길동, 김순인',
      handover: false,
      hasFile: true,
      hasDetail: true,
    },
    {
      id: 3,
      time: '09:10',
      kind: '도보순찰',
      activity: '경감 홍길동 경장 고길동 경장 조택주\n남지구대 > 부산 대파트 > 국립수산품질관리원 순찰 특이사항 없음',
      writer: '경장 고길동',
      writtenAt: '2026-01-01 14:00',
      handlers: '조택주, 박광인, 싸이, 불사조',
      handover: false,
      hasFile: true,
      hasDetail: false,
    },
    {
      id: 4,
      time: '09:10',
      kind: '탄력순찰',
      activity: '[모바일] 중앙동 근무자 경장 고길동 경장 조택주 탄력순찰 실시\n비행청소년들 답배원, 주민신고',
      writer: '경감 홍길동',
      writtenAt: '2026-01-01 14:00',
      handlers: '조택주, 박광인, 싸이, 불사조',
      handover: false,
      hasFile: true,
      hasDetail: false,
    },
    {
      id: 5,
      time: '09:10',
      kind: '피해자보호',
      activity: '[테블릿] 중부32호 근무자 경장 고길동 경장 조택주 탄력순찰 실시\n112신고 다발지역가 범죄 예방 및 112신고',
      writer: '경감 홍길동',
      writtenAt: '2026-01-01 14:00',
      handlers: '조택주, 박광인, 싸이, 불사조',
      handover: false,
      hasFile: true,
      hasDetail: false,
    },
    {
      id: 6,
      time: '08:30',
      kind: '112신고',
      activity: 'C1(000000)-비상벨 (접수일시 : 2026-01-01 09:00:10)\n비상벨 오작동(업주가 잘못 누름)',
      writer: '경감 홍길동',
      writtenAt: '2026-01-01 14:00',
      handlers: '홍길동, 김순인',
      handover: false,
      hasFile: true,
      hasDetail: true,
    },
  ]
}

export function useWorkLogWrite() {
  const department = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })
  const workDate = ref('2026.08.11.')
  /** 주 / 야 / 미편성 */
  const shift = ref<'day' | 'night' | 'none'>('day')
  /** 보기(방식): 기본 / 전체 */
  const viewMode = ref<'basic' | 'all'>('basic')

  const rows = ref<WorkLogRow[]>(createMockRows())

  /* 112누락정보(PM-LPO-0219) */
  const missingOpen = ref(false)
  const missingForm = ref<MissingReportForm>({
    receiptNo: '',
    code: '',
    caseNo: '',
    closing: '',
    workDate: '',
    shift: 'day',
    worker: '',
  })

  /* 출동사건정보(PM-LPO-0220) — 근무일지 행의 '보기' 버튼에서 연다 */
  const dispatchOpen = ref(false)
  const dispatchUnits = ref<DispatchUnitRow[]>([
    { id: 1, unit: '약수지구대', arrivedAt: '2026-08-08 14:00', members: '홍길동, 이기소' },
    { id: 2, unit: '약수지구대', arrivedAt: '2026-08-08 14:00', members: '홍길동, 이기소' },
    { id: 3, unit: '약수지구대', arrivedAt: '2026-08-08 14:00', members: '홍길동, 이기소' },
    { id: 4, unit: '약수지구대', arrivedAt: '2026-08-08 14:00', members: '홍길동, 이기소' },
  ])

  /* 처리자 관리(PM-LPO-0221) */
  const handlerOpen = ref(false)
  /** 처리자를 지정하는 대상 행 */
  const handlerTargetId = ref<number | null>(null)
  /** 왼쪽 '동행 근무자 목록' — 이미 처리자로 지정된 사람들 */
  const companionRows = ref<HandlerRow[]>([
    { id: 1, rank: '경위', name: '홍길동', picked: true },
    { id: 2, rank: '경위', name: '홍길동', picked: true },
  ])
  /** 시안(12664:119678)은 근무자 목록이 패널을 넘겨 스크롤이 생기는 상태다 */
  const handlerRows = ref<HandlerRow[]>([
    { id: 1, rank: '경정', name: '홍길동1', picked: false },
    { id: 2, rank: '경감', name: '홍길동2', picked: false },
    { id: 3, rank: '경위', name: '홍길동3', picked: true },
    { id: 4, rank: '경사', name: '홍길동4', picked: false },
    { id: 5, rank: '경사', name: '홍길동5', picked: false },
    { id: 6, rank: '경장', name: '홍길동6', picked: false },
    { id: 7, rank: '경위', name: '홍길동7', picked: false },
    { id: 8, rank: '경장', name: '홍길동8', picked: false },
  ])

  /* 파일 업로드(PM-LPO-0222) */
  const fileOpen = ref(false)
  const fileTargetId = ref<number | null>(null)
  const files = ref<WorkLogFile[]>([
    { id: 1, name: '현장사진_01.jpg [1.2MB]' },
    { id: 2, name: '현장사진_02.jpg [980KB]' },
  ])

  function openHandler(row: WorkLogRow) {
    handlerTargetId.value = row.id
    handlerOpen.value = true
  }

  function confirmHandlers() {
    const picked = handlerRows.value.filter((h) => h.picked).map((h) => h.name)
    rows.value = rows.value.map((r) =>
      r.id === handlerTargetId.value ? { ...r, handlers: picked.join(', ') } : r,
    )
    handlerOpen.value = false
  }

  function openFile(row: WorkLogRow) {
    fileTargetId.value = row.id
    fileOpen.value = true
  }

  function addFile(file: File) {
    const nextId = files.value.length ? Math.max(...files.value.map((f) => f.id)) + 1 : 1
    files.value = [...files.value, { id: nextId, name: `${file.name} [${Math.ceil(file.size / 1024)}KB]` }]
  }

  function removeFile(id: number) {
    files.value = files.value.filter((f) => f.id !== id)
  }

  /** 기획서 8: '신규' — 입력용 빈 행을 맨 위에 한 줄 추가한다 */
  function addRow() {
    const nextId = rows.value.length ? Math.max(...rows.value.map((r) => r.id)) + 1 : 1
    rows.value = [
      { id: nextId, time: '', kind: '', activity: '', writer: '경감 홍길동', writtenAt: '', handlers: '', handover: false, hasFile: false, hasDetail: false, isNew: true },
      ...rows.value,
    ]
  }

  function removeRows(ids: Set<number>) {
    rows.value = rows.value.filter((r) => !ids.has(r.id))
  }

  /** 근무일 이동 — 표시용 목업이라 문자열만 바꾼다 */
  function shiftWorkDate(delta: number) {
    const [y, m, d] = workDate.value.replace(/\.$/, '').split('.').map(Number)
    const next = new Date(y, m - 1, d + delta)
    workDate.value = `${next.getFullYear()}.${String(next.getMonth() + 1).padStart(2, '0')}.${String(next.getDate()).padStart(2, '0')}.`
  }

  return {
    department,
    workDate,
    shift,
    viewMode,
    rows,
    missingOpen,
    missingForm,
    dispatchOpen,
    dispatchUnits,
    handlerOpen,
    companionRows,
    handlerRows,
    openHandler,
    confirmHandlers,
    fileOpen,
    files,
    openFile,
    addFile,
    removeFile,
    addRow,
    removeRows,
    shiftWorkDate,
  }
}

export type WorkLogStore = ReturnType<typeof useWorkLogWrite>
/** PM-LPO-0217.vue 가 provide 하고 components/ 의 팝업들이 inject 해서 같은 인스턴스를 공유한다 */
export const WorkLogKey: InjectionKey<WorkLogStore> = Symbol('PM-LPO-0217-work-log')
