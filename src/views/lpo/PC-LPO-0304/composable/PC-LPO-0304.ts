import { computed, ref } from "vue";
import type { DepartmentValue } from "@/components/custom/select/DepartmentCascadeSelect.vue";

/** 월별 인수인계 현황 한 줄 */
export interface HandoverRow {
  no: number;
  dept: string;
  workDate: string;
  /** 주/야 */
  shift: string;
  /** 근무팀 */
  team: string;
  /** 인계관 */
  giver: string;
  /** 인수관 */
  receiver: string;
  /** 인수관 확인일 — 아직이면 '-' */
  receiverConfirmedAt: string;
  /** 확인관(지/파장) */
  approver: string;
  /** 확인관 확인일 — 아직이면 '미확인' */
  approverConfirmedAt: string;
  /** 점검관(과장) */
  inspector: string;
  /** 취소일 — 미확인이면 '미확인' */
  canceledAt: string;
}

export const yearOptions = Array.from({ length: 11 }, (_, i) => {
  const y = 2020 + i;
  return { label: `${y}년`, value: String(y) };
});

export const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}월`,
  value: String(i + 1),
}));

/**
 * 아직 인수인계가 안 끝난 행 — 확인/취소 칸 중 하나라도 `미확인` 이면 해당.
 * Figma 에서 이 행들만 배경이 없고(흰색), 확인이 끝난 행에 회색 배경이 깔린다.
 * `미 인수인계` 체크박스 필터도 같은 기준이라 한 군데서 판정한다.
 * (`-` 는 미확인이 아니다 — `-` 만 있는 행은 확인이 끝난 쪽으로 본다)
 */
export function isPendingHandover(row: HandoverRow) {
  return (
    row.receiverConfirmedAt === "미확인" ||
    row.approverConfirmedAt === "미확인" ||
    row.canceledAt === "미확인"
  );
}

function createMockRows(): HandoverRow[] {
  return [
    {
      no: 5,
      dept: "본청 중앙학교 실습부서",
      workDate: "2026-07-15",
      shift: "주",
      team: "1",
      giver: "팀장 홍길동",
      receiver: "팀장 정우영",
      receiverConfirmedAt: "2026-07-01",
      approver: "지/파장 윤홍길",
      approverConfirmedAt: "2026-07-01",
      inspector: "과장 최철우",
      canceledAt: "미확인",
    },
    {
      no: 4,
      dept: "본청 중앙학교 실습부서",
      workDate: "2026-07-15",
      shift: "주",
      team: "2",
      giver: "팀장 홍길동",
      receiver: "팀장 정우영",
      receiverConfirmedAt: "-",
      approver: "지/파장 윤홍길",
      approverConfirmedAt: "미확인",
      inspector: "과장 최철우",
      canceledAt: "미확인",
    },
    {
      no: 3,
      dept: "본청 중앙학교 실습부서",
      workDate: "2026-07-15",
      shift: "주",
      team: "1",
      giver: "팀장 홍길동",
      receiver: "팀장 정우영",
      receiverConfirmedAt: "2026-07-01",
      approver: "지/파장 윤홍길",
      approverConfirmedAt: "2026-07-01",
      inspector: "과장 최철우",
      canceledAt: "2026-07-01",
    },
    {
      no: 2,
      dept: "본청 중앙학교 실습부서",
      workDate: "2026-07-15",
      shift: "주",
      team: "2",
      giver: "팀장 홍길동",
      receiver: "팀장 정우영",
      receiverConfirmedAt: "-",
      approver: "지/파장 윤홍길",
      approverConfirmedAt: "2026-07-01",
      inspector: "과장 최철우",
      canceledAt: "2026-07-01",
    },
    {
      no: 1,
      dept: "본청 중앙학교 실습부서",
      workDate: "2026-07-15",
      shift: "주",
      team: "1",
      giver: "팀장 홍길동",
      receiver: "팀장 정우영",
      receiverConfirmedAt: "2026-07-01",
      approver: "지/파장 윤홍길",
      approverConfirmedAt: "2026-07-01",
      inspector: "과장 최철우",
      canceledAt: "2026-07-01",
    },
  ];
}

export function useMonthlyHandover() {
  const department = ref<DepartmentValue>({
    level1: "hq",
    level2: "all",
    level3: "all",
  });
  const advancedSearchOpen = ref(false);

  const year = ref("2026");
  const month = ref("4");
  /** 아직 인수인계가 끝나지 않은 건만 보기 */
  const onlyPending = ref(false);

  const allRows = ref<HandoverRow[]>(createMockRows());

  const rows = computed(() =>
    allRows.value.filter((row) => {
      if (!onlyPending.value) return true;
      return isPendingHandover(row);
    }),
  );

  return { department, advancedSearchOpen, year, month, onlyPending, rows };
}
