import { ref, type InjectionKey } from "vue";
import { useWorkScheduleDialogs } from "./useWorkScheduleDialogs";
import type { TabulatorGridColumn } from "@/components/custom/tabulator";

export interface SelectOption {
  label: string;
  value: string;
}

export interface RegularWorker {
  id: number;
  group: string;
  rank: string;
  name: string;
  assignCount: number;
}

export interface VolunteerWorker {
  id: number;
  rank: string;
  name: string;
  volunteerType: string;
  startTime: string;
  endTime: string;
}

export interface IncidentWorker {
  id: number;
  rank: string;
  name: string;
  reason: string;
  startTime: string;
  endTime: string;
}

export interface ScheduleRow {
  id: number;
  label: string;
  /** fixed: 하루 전체 동일 인원 고정 배정 / variable: 시간대별로 배정 내용이 달라짐 */
  type: "fixed" | "variable";
  fixedAssignees: string[];
  cells: string[][];
}

/** 근무자 추가 팝업(PC-LPO-0204) 조회 결과 한 행 */
export interface WorkerCandidate {
  id: number;
  rank: string;
  name: string;
  /** 관서장 확인 여부. 체크박스로 표시되며, 값이 없는 행은 빈칸으로 둔다 */
  dept?: boolean;
}

/** 근무자 추가 팝업에서 고른 인원을 어느 목록에 담을지 */
export type WorkerAddTarget = "regular" | "volunteer" | "incident";

export const timeSlots = [
  "08:30~09:00",
  "09:00~10:00",
  "10:00~11:00",
  "11:00~12:00",
  "12:00~13:00",
  "13:00~14:00",
  "14:00~15:00",
  "15:00~16:00",
  "16:00~17:00",
  "17:00~18:00",
  "18:00~19:00",
  "19:00~20:00",
];

export const teamOptions: SelectOption[] = [
  { label: "1팀", value: "team1" },
  { label: "2팀", value: "team2" },
  { label: "3팀", value: "team3" },
];

function emptyCells(): string[][] {
  return timeSlots.map((): string[] => []);
}

function fixedCells(names: string[]): string[][] {
  return timeSlots.map(() => [...names]);
}

// TODO: API 연동 전까지 사용하는 더미 데이터.
const WORKER_POOL: WorkerCandidate[] = [
  { id: 1, rank: "경위", name: "김철수", dept: false },
  { id: 2, rank: "경사", name: "이영희" },
  { id: 3, rank: "순경", name: "박민수" },
  { id: 4, rank: "경장", name: "정지훈" },
  { id: 5, rank: "경위", name: "최유리" },
];

export function useWorkSchedule() {
  /** 이 화면에서 열리는 팝업(PC-LPO-0205~0213)들의 상태 — 같은 스토어로 provide 된다 */
  const dialogs = useWorkScheduleDialogs();
  // 근무 사용자 선택 팝업 열기
  const { workUserPickOpen } = dialogs;

  const workDate = ref("2026.08.11.");
  const shift = ref<"day" | "night">("day");

  // 일반근무자 테이블
  const regularColumns: TabulatorGridColumn[] = [
    {
      title: "조",
      field: "group",
      width: 80,
      hozAlign: "center",
      cellType: "input",
      editor: "input",
    },
    {
      title: "계급",
      field: "rank",
      hozAlign: "center",
    },
    {
      title: "성명",
      field: "name",
      hozAlign: "center",
    },
    {
      title: "배정횟수",
      field: "assignCount",
      hozAlign: "center",
    },
  ];

  const regularWorkers = ref<RegularWorker[]>([
    { id: 1, group: "1", rank: "경위", name: "홍길동", assignCount: 1 },
    { id: 2, group: "2", rank: "경위", name: "홍길동", assignCount: 0 },
    { id: 3, group: "3", rank: "경감", name: "홍길동", assignCount: 0 },
    { id: 4, group: "4", rank: "경정", name: "홍길동", assignCount: 0 },
    { id: 5, group: "5", rank: "경사", name: "홍길동", assignCount: 0 },
  ]);
  const regularTeam = ref("team1");

  // 자원근무자 테이블
  const volunteerColumns: TabulatorGridColumn[] = [
    {
      title: "계급",
      field: "rank",
      hozAlign: "center",
    },
    {
      title: "성명",
      field: "name",
      hozAlign: "center",
    },
    {
      title: "시작<br>시간",
      field: "startTime",
      hozAlign: "center",
    },
    {
      title: "종료<br>시간",
      field: "endTime",
      hozAlign: "center",
    },
  ];

  const volunteerWorkers = ref<VolunteerWorker[]>([
    {
      id: 1,
      rank: "경위",
      name: "홍길동",
      volunteerType: "자원근무",
      startTime: "18:00",
      endTime: "20:00",
    },
    {
      id: 2,
      rank: "경위",
      name: "홍길동",
      volunteerType: "자원근무",
      startTime: "18:00",
      endTime: "20:00",
    },
    {
      id: 3,
      rank: "경감",
      name: "홍길동",
      volunteerType: "자원근무",
      startTime: "18:00",
      endTime: "20:00",
    },
  ]);

  // 사고자 테이블
  const incidentColumns: TabulatorGridColumn[] = [
    {
      title: "계급",
      field: "rank",
      hozAlign: "center",
    },
    {
      title: "성명",
      field: "name",
      hozAlign: "center",
    },
    {
      title: "사유",
      field: "reason",
      hozAlign: "center",
    },
    {
      title: "시작<br>시간",
      field: "startTime",
      hozAlign: "center",
    },
    {
      title: "종료<br>시간",
      field: "endTime",
      hozAlign: "center",
    },
  ];

  const incidentWorkers = ref<IncidentWorker[]>([
    {
      id: 1,
      rank: "경정",
      name: "홍길동",
      reason: "육아시간",
      startTime: "18:00",
      endTime: "20:00",
    },
    {
      id: 2,
      rank: "경위",
      name: "홍길동",
      reason: "병가",
      startTime: "18:00",
      endTime: "20:00",
    },
    {
      id: 3,
      rank: "경감",
      name: "홍길동",
      reason: "조퇴",
      startTime: "18:00",
      endTime: "20:00",
    },
  ]);

  // 근무지정표 테이블
  const scheduleColumns: TabulatorGridColumn[] = [
    {
      title: "근무",
      field: "label",
      width: 120,
      hozAlign: "center",
    },

    ...timeSlots.map((slot, index) => {
      const [start, end] = slot.split("~");

      return {
        title: `${start}~<br>${end}`,
        field: `slot${index}`,
        width: 100,
        hozAlign: "center",
        formatter: "html",
      };
    }),
  ];
  const scheduleRows = ref(
    [
      {
        id: 1,
        label: "팀장",
        type: "fixed" as const,
        fixedAssignees: ["고수"],
        cells: fixedCells(["고수"]),
      },
      {
        id: 2,
        label: "상황근무",
        type: "fixed" as const,
        fixedAssignees: ["박찬호", "김진호"],
        cells: fixedCells(["박찬호", "김진호"]),
      },
      {
        id: 3,
        label: "용산 순21호",
        type: "fixed" as const,
        fixedAssignees: ["홍길동", "도우너"],
        cells: fixedCells(["홍길동", "도우너"]),
      },
      {
        id: 4,
        label: "순21호 중점",
        type: "variable" as const,
        fixedAssignees: [],
        cells: [
          [],
          [],
          ["중앙아시아 거리 거점 및 도보순찰"],
          [],
          ["밀리오레 상가 주변 도보순찰"],
          [],
          ["광희동 도보순찰"],
          [],
          [],
          ["동역사 주변 거점 순찰"],
          [],
          [],
        ],
      },
      {
        id: 5,
        label: "용산 순22호",
        type: "fixed" as const,
        fixedAssignees: ["홍길동", "도우너"],
        cells: fixedCells(["홍길동", "도우너"]),
      },
      {
        id: 6,
        label: "순25호 중점",
        type: "variable" as const,
        fixedAssignees: [],
        cells: [
          [],
          [],
          ["중앙아시아 거리 거점 및 도보순찰"],
          [],
          ["밀리오레 상가 주변 도보순찰"],
          [],
          ["광희동 도보순찰"],
          [],
          [],
          ["동역사 주변 거점 순찰"],
          [],
          [],
        ],
      },
      {
        id: 7,
        label: "치안센터",
        type: "variable" as const,
        fixedAssignees: [],
        cells: emptyCells(),
      },
    ].map((row) => ({
      ...row,
      label: row.label,

      ...Object.fromEntries(
        row.cells.map((cell, index) => [`slot${index}`, cell.join("<br>")]),
      ),
    })),
  );

  const importantNotes = ref("");
  const targetDate = ref("2026-07-16");

  function addRegularWorker() {
    const nextId =
      regularWorkers.value.length ?
        Math.max(...regularWorkers.value.map((w) => w.id)) + 1
      : 1;
    regularWorkers.value = [
      ...regularWorkers.value,
      { id: nextId, group: "", rank: "", name: "", assignCount: 0 },
    ];
  }

  function addVolunteerWorker() {
    const nextId =
      volunteerWorkers.value.length ?
        Math.max(...volunteerWorkers.value.map((w) => w.id)) + 1
      : 1;
    volunteerWorkers.value = [
      ...volunteerWorkers.value,
      {
        id: nextId,
        rank: "",
        name: "",
        volunteerType: "",
        startTime: "",
        endTime: "",
      },
    ];
  }

  function removeVolunteerWorkers(ids: Set<number>) {
    volunteerWorkers.value = volunteerWorkers.value.filter(
      (w) => !ids.has(w.id),
    );
  }

  function addIncidentWorker() {
    const nextId =
      incidentWorkers.value.length ?
        Math.max(...incidentWorkers.value.map((w) => w.id)) + 1
      : 1;
    incidentWorkers.value = [
      ...incidentWorkers.value,
      {
        id: nextId,
        rank: "",
        name: "",
        reason: "",
        startTime: "",
        endTime: "",
      },
    ];
  }

  function removeIncidentWorkers(ids: Set<number>) {
    incidentWorkers.value = incidentWorkers.value.filter((w) => !ids.has(w.id));
  }

  function shiftWorkDate(days: number) {
    // 표시용 목업이라 실제 날짜 연산 대신 자리표시만 갱신
    void days;
  }

  /* ------------------------------------------------------------------ *
   * 근무자 추가 팝업(PC-LPO-0204) — 자원근무자/사고자 섹션의 "추가" 버튼에서 연다.
   * 검색 조건 없이 WORKER_POOL 전체를 보여주고, 고른 인원을 그 섹션의
   * 목록(volunteerWorkers/incidentWorkers)에 추가한다.
   * ------------------------------------------------------------------ */
  const workerAddDialogOpen = ref(false);
  const workerAddTarget = ref<WorkerAddTarget>("volunteer");
  const workerCandidates = ref<WorkerCandidate[]>([]);

  function searchWorkerCandidates() {
    workerCandidates.value = WORKER_POOL.map((w) => ({ ...w }));
  }

  function openWorkerAddDialog(target: WorkerAddTarget) {
    workerAddTarget.value = target;
    searchWorkerCandidates();
    workerAddDialogOpen.value = true;
  }

  function confirmWorkerAdd(selected: WorkerCandidate[]) {
    if (workerAddTarget.value === "regular") {
      let nextId =
        regularWorkers.value.length ?
          Math.max(...regularWorkers.value.map((w) => w.id)) + 1
        : 1;
      regularWorkers.value = [
        ...regularWorkers.value,
        ...selected.map((w) => ({
          id: nextId++,
          group: "",
          rank: w.rank,
          name: w.name,
          assignCount: 0,
        })),
      ];
    } else if (workerAddTarget.value === "volunteer") {
      let nextId =
        volunteerWorkers.value.length ?
          Math.max(...volunteerWorkers.value.map((w) => w.id)) + 1
        : 1;
      volunteerWorkers.value = [
        ...volunteerWorkers.value,
        ...selected.map((w) => ({
          id: nextId++,
          rank: w.rank,
          name: w.name,
          volunteerType: "자원근무",
          startTime: "",
          endTime: "",
        })),
      ];
    } else {
      let nextId =
        incidentWorkers.value.length ?
          Math.max(...incidentWorkers.value.map((w) => w.id)) + 1
        : 1;
      incidentWorkers.value = [
        ...incidentWorkers.value,
        ...selected.map((w) => ({
          id: nextId++,
          rank: w.rank,
          name: w.name,
          reason: "",
          startTime: "",
          endTime: "",
        })),
      ];
    }
    workerAddDialogOpen.value = false;
  }

  return {
    workDate,
    shift,
    regularColumns,
    regularWorkers,
    regularTeam,
    volunteerColumns,
    volunteerWorkers,
    incidentColumns,
    incidentWorkers,
    scheduleColumns,
    scheduleRows,
    importantNotes,
    targetDate,
    addRegularWorker,
    addVolunteerWorker,
    removeVolunteerWorkers,
    addIncidentWorker,
    removeIncidentWorkers,
    shiftWorkDate,

    workerAddDialogOpen,
    workerAddTarget,
    workerCandidates,
    searchWorkerCandidates,
    openWorkerAddDialog,
    confirmWorkerAdd,

    ...dialogs,
  };
}

export type WorkScheduleStore = ReturnType<typeof useWorkSchedule>;
/** PC-LPO-0202.vue 에서 provide 하고, components/WorkerAddDialog.vue 가 inject 해서 같은 인스턴스를 공유한다. */
export const WorkScheduleKey: InjectionKey<WorkScheduleStore> = Symbol(
  "PC-LPO-0202-work-schedule",
);
