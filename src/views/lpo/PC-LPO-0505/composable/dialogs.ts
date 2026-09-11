import { ref, type InjectionKey } from 'vue'

/**
 * 출동수당 취합(월별) 화면에서 열리는 팝업들의 상태.
 * 화면ID가 각각 붙어 있는 화면군이라(PC-LPO-0506~0510) 팝업마다 컴포넌트를 두고
 * 상태는 여기 모아 PC-LPO-0505.vue 가 provide 한다(CLAUDE.md §3 패턴A).
 */

/** 사용자 찾기(PC-LPO-0507) 부서 트리 한 마디 */
export interface UserDeptNode {
  id: number
  name: string
  children?: UserDeptNode[]
}

/** 사용자 찾기 결과 한 줄 */
export interface UserRow {
  no: number
  rank: string
  name: string
  office: string
  dept: string
}

/** 타직원 출동수당 신청(PC-LPO-0509) 왼쪽 접수내용 한 줄 */
export interface ReceiptRow {
  id: number
  receiptNo: string
  /** 신고내용 — 여러 줄이다(PC-LPO-0510 좌측 목록) */
  content: string
  reportNo: string
  workDate: string
  applicant: string
}

/** 출동요소 한 줄 (PC-LPO-0509 · PC-LPO-0510 공용) */
export interface DispatchUnitRow {
  id: number
  unit: string
  arrivedAt: string
  members: string
}

export const teamLeaderOptions = [
  { label: '팀장 홍길동', value: '홍길동' },
  { label: '계장 정우영', value: '정우영' },
  { label: '팀장 윤홍길', value: '윤홍길' },
]

export function useDispatchSummaryDialogs() {
  /* 승인관리(PC-LPO-0506) */
  const approveOpen = ref(false)
  const approveTeamLeader = ref('')
  const approveChief = ref('')

  /* 사용자 찾기(PC-LPO-0507) — 승인관리의 '조회' 버튼에서 연다 */
  const userFindOpen = ref(false)
  const userKeyword = ref('')
  const userDeptTree: UserDeptNode[] = [
    {
      id: 1,
      name: '부산사상경찰서',
      children: [
        { id: 2, name: '청문감사인권관' },
        { id: 3, name: '경찰대학 운영지원과' },
        { id: 4, name: '경찰대학 학생지도부' },
        { id: 5, name: '경찰대학 도서관' },
        { id: 6, name: '경찰대학 도서관' },
      ],
    },
  ]
  const userRows = ref<UserRow[]>(
    Array.from({ length: 6 }, (_, i) => ({
      no: 6 - i,
      rank: '경감',
      name: '홍길동',
      office: '부산청 부산사상서',
      dept: '청문감사인권관',
    })),
  )
  const pickedUserNo = ref<number | null>(3)

  /* 승인취소관리(PC-LPO-0508) */
  const cancelOpen = ref(false)
  const cancelTeamLeader = ref('')
  const cancelChief = ref('')
  const cancelReason = ref('출동수당 누락으로 인한 취소')

  /* 타직원 출동수당 신청(PC-LPO-0509) */
  const otherApplyOpen = ref(false)
  const receiptContent = [
    '[소방 공동대응 요청접수]',
    '[신고정보]',
    '1. 신고내용 : 기타 경찰의 인적 물적……',
    '2. 신고자전화번호 : 02000000',
    '3. 발생주소 : 서울특별시 중구',
    '….',
  ].join('\n')

  const receiptRows = ref<ReceiptRow[]>(
    Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      receiptNo: '08202660913456',
      content: receiptContent,
      reportNo: '751',
      workDate: '2026-01-01',
      applicant: '[경위] 홍길동',
    })),
  )
  const pickedReceiptId = ref<number | null>(3)

  /* 출동사건정보(PC-LPO-0510) */
  const dispatchInfoOpen = ref(false)
  const dispatchUnits = ref<DispatchUnitRow[]>([
    { id: 1, unit: '마포 순60호', arrivedAt: '2026-08-08 14:00', members: '홍길동, 이기소' },
    { id: 2, unit: '순73호', arrivedAt: '2026-08-08 14:00', members: '홍길동, 이기소' },
    { id: 3, unit: '약수지구대', arrivedAt: '2026-08-08 14:00', members: '홍길동, 이기소' },
  ])

  return {
    approveOpen,
    approveTeamLeader,
    approveChief,

    userFindOpen,
    userKeyword,
    userDeptTree,
    userRows,
    pickedUserNo,

    cancelOpen,
    cancelTeamLeader,
    cancelChief,
    cancelReason,

    otherApplyOpen,
    receiptRows,
    pickedReceiptId,

    dispatchInfoOpen,
    dispatchUnits,
  }
}

export type DispatchSummaryDialogStore = ReturnType<typeof useDispatchSummaryDialogs>
/** PC-LPO-0505.vue 가 provide 하고 components/ 의 팝업들이 inject 한다 */
export const DispatchSummaryDialogKey: InjectionKey<DispatchSummaryDialogStore> =
  Symbol('PC-LPO-0505-dialogs')
