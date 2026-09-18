import { ref, watch } from "vue";
import type { DepartmentValue } from "@/components/custom/select/DepartmentCascadeSelect.vue";

/** 교대 형태 한 줄 */
export interface ShiftFormRow {
  id: number;
  no: number;
  /** 교대 이름 (주/야/휴/비 …) */
  name: string;
  /** 업무시간을 직접 지정할지 */
  fixedHours: boolean;
  startTime: string;
  endTime: string;
  /** 간격(분) */
  interval: string;
  /** 교대시간(분) */
  handoverMinutes: string;
  /** 인수인계 여부 */
  handover: boolean;
}

/** 팀별 일자 배치 한 줄 — 1일차~4일차에 어떤 교대를 넣을지 */
export interface TeamPlanRow {
  id: number;
  team: string;
  day1: string;
  day2: string;
  day3: string;
  day4: string;
}

export const hourOptions = Array.from({ length: 24 }, (_, h) => {
  const label = `${String(h).padStart(2, "0")}:00`;
  return { label, value: label };
});

/** 교대 배치 셀에서 고르는 값 */
export const shiftKindOptions = [
  { label: "주", value: "주" },
  { label: "야", value: "야" },
  { label: "휴", value: "휴" },
  { label: "비", value: "비" },
];

/** 조 수 (1~5조) */
export const groupOptions = Array.from({ length: 5 }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1),
}));

/**
 * 조 수를 고르면 같이 채워지는 교대·일 주기 — 사용자 지정 동작(조 셀렉트 → 교대·일 주기 값 채움).
 * Figma 에 대응표가 없어 목업값이다: 일 주기 = 조 수, 교대는 basicCycleOptions 의 조합을 따랐다.
 */
export const groupCycleDefaults: Record<string, { shift: string; cycle: string }> = {
  "1": { shift: "1", cycle: "1" },
  "2": { shift: "1", cycle: "2" },
  "3": { shift: "2", cycle: "3" },
  "4": { shift: "2", cycle: "4" },
  "5": { shift: "3", cycle: "5" },
};

/** 미리 정의된 기본 주기 — Figma 에 목록이 없어 자리만 만들어 둔다 */
export const basicCycleOptions = [
  { label: "5조 3교대", value: "5-3" },
  { label: "4조 2교대", value: "4-2" },
  { label: "3조 2교대", value: "3-2" },
  { label: "3조 1교대", value: "3-1" },
];

export function useBasicCycle() {
  const department = ref<DepartmentValue>({
    level1: "hq",
    level2: "all",
    level3: "all",
  });

  /** 조·교대·일 주기는 처음에 비어 있다(사용자 지정) — 조를 고르면 watch 가 나머지를 채운다 */
  const groupCount = ref("");
  const shiftCount = ref("");
  const dayCycle = ref("");
  const effectiveDate = ref("");
  const basicCycle = ref("");
  /** '기본주기 없음'을 누르면 기본 주기 선택이 잠긴다 */
  const noBasicCycle = ref(false);

  /** 조 셀렉트를 고르면 교대·일 주기가 대응값으로 채워진다(groupCycleDefaults) */
  watch(groupCount, (value) => {
    const preset = groupCycleDefaults[value];
    if (!preset) return;
    shiftCount.value = preset.shift;
    dayCycle.value = preset.cycle;
  });

  const shiftFormRows = ref<ShiftFormRow[]>([
    {
      id: 1,
      no: 1,
      name: "주",
      fixedHours: true,
      startTime: "09:00",
      endTime: "21:00",
      interval: "60",
      handoverMinutes: "3",
      handover: true,
    },
    {
      id: 2,
      no: 2,
      name: "야",
      fixedHours: true,
      startTime: "21:00",
      endTime: "09:00",
      interval: "60",
      handoverMinutes: "30",
      handover: true,
    },
    {
      id: 3,
      no: 3,
      name: "",
      fixedHours: false,
      startTime: "",
      endTime: "",
      interval: "",
      handoverMinutes: "",
      handover: false,
    },
  ]);

  const todayPlanDay = ref(1);
  const teamPlanRows = ref<TeamPlanRow[]>([
    { id: 1, team: "1팀", day1: "주", day2: "야", day3: "휴", day4: "비" },
    { id: 2, team: "2팀", day1: "비", day2: "야", day3: "주", day4: "휴" },
    { id: 3, team: "3팀", day1: "휴", day2: "주", day3: "비", day4: "야" },
    { id: 4, team: "4팀", day1: "주", day2: "야", day3: "휴", day4: "비" },
    { id: 5, team: "5팀", day1: "", day2: "", day3: "", day4: "" },
  ]);

  function addShiftFormRow() {
    const nextId =
      shiftFormRows.value.length ?
        Math.max(...shiftFormRows.value.map((r) => r.id)) + 1
      : 1;
    const nextNo =
      shiftFormRows.value.length ?
        Math.max(...shiftFormRows.value.map((r) => r.no)) + 1
      : 1;
    shiftFormRows.value = [
      ...shiftFormRows.value,
      {
        id: nextId,
        no: nextNo,
        name: "",
        fixedHours: false,
        startTime: "",
        endTime: "",
        interval: "",
        handoverMinutes: "",
        handover: false,
      },
    ];
  }

  function removeShiftFormRows(ids: Set<number>) {
    shiftFormRows.value = shiftFormRows.value.filter((r) => !ids.has(r.id));
  }

  function addTeamPlanRow() {
    const nextId =
      teamPlanRows.value.length ?
        Math.max(...teamPlanRows.value.map((r) => r.id)) + 1
      : 1;
    teamPlanRows.value = [
      ...teamPlanRows.value,
      {
        id: nextId,
        team: `${teamPlanRows.value.length + 1}팀`,
        day1: "",
        day2: "",
        day3: "",
        day4: "",
      },
    ];
  }

  function removeTeamPlanRows(ids: Set<number>) {
    teamPlanRows.value = teamPlanRows.value.filter((r) => !ids.has(r.id));
  }

  /** 신규 — 입력값을 비운다 */
  function resetAll() {
    groupCount.value = "";
    shiftCount.value = "";
    dayCycle.value = "";
    effectiveDate.value = "";
    basicCycle.value = "";
    noBasicCycle.value = false;
    shiftFormRows.value = [];
    teamPlanRows.value = [];
  }

  return {
    department,
    groupCount,
    shiftCount,
    dayCycle,
    effectiveDate,
    basicCycle,
    noBasicCycle,
    shiftFormRows,
    todayPlanDay,
    teamPlanRows,
    addShiftFormRow,
    removeShiftFormRows,
    addTeamPlanRow,
    removeTeamPlanRows,
    resetAll,
  };
}
