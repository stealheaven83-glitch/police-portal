import { computed, ref } from "vue";
import type { DepartmentValue } from "@/components/custom/select/DepartmentCascadeSelect.vue";

export interface DispatchAllowanceRow {
  no: number;
  applyDept: string;
  otherStation: string;
  otherStationRef: string;
  receiptNo: string;
  caseNo: string;
  reportContent: string;
  onSiteAction: string;
  manualReason: string;
  receivedAt: string;
  arrivedAt: string;
}

export interface DispatchAllowanceDetail extends Pick<
  DispatchAllowanceRow,
  "receiptNo" | "caseNo" | "receivedAt"
> {
  arrivedAt: string;
  closedAt: string;
  dispatcher: string;
  /** 사건종별 — 시안(12762:69918)의 출동자 오른쪽 칸 */
  caseType: string;
  reporter: string;
  contact: string;
  reportLocation: string;
  processingResult: string;
}

/** 시안 12762:69918 — 값 형태를 그대로 따르고 행마다 번호만 다르게 둔다 */
const dispatchAllowanceDetails: Record<number, DispatchAllowanceDetail> = {
  3: {
    receiptNo: "00000[CODE C2]",
    caseNo: "00000[폭력]",
    receivedAt: "2026-08-08 14:00",
    arrivedAt: "2026-08-08 14:00",
    closedAt: "2026-08-08 14:00",
    dispatcher: "홍길동, 이기소",
    caseType: "보호조치",
    reporter: "",
    contact: "01000000000",
    reportLocation: "서대문구112",
    processingResult: "폭력 발생보고",
  },
  2: {
    receiptNo: "00001[CODE C2]",
    caseNo: "00001[폭력]",
    receivedAt: "2026-08-08 14:20",
    arrivedAt: "2026-08-08 14:26",
    closedAt: "2026-08-08 15:02",
    dispatcher: "이순신, 김순경",
    caseType: "보호조치",
    reporter: "",
    contact: "01000000000",
    reportLocation: "서대문구112",
    processingResult: "폭력 발생보고",
  },
  1: {
    receiptNo: "00002[CODE C2]",
    caseNo: "00002[폭력]",
    receivedAt: "2026-08-08 15:10",
    arrivedAt: "2026-08-08 15:17",
    closedAt: "2026-08-08 15:38",
    dispatcher: "강감찬, 최두회",
    caseType: "보호조치",
    reporter: "",
    contact: "01000000000",
    reportLocation: "서대문구112",
    processingResult: "폭력 발생보고",
  },
};

export interface ManualRegistrationForm {
  applyDept: string;
  receiptNo: string;
  caseNo: string;
  reportContent: string;
  onSiteAction: string;
  manualReason: string;
  evidenceType: string;
  receivedAt: string;
  arrivedAt: string;
}

export interface Report112Row {
  receiptNo: string;
  caseNo: string;
  reportType: string;
  reportContent: string;
  onSiteAction: string;
  receivedAt: string;
  arrivedAt: string;
}

export const manualReasonOptions = [
  { label: "누락", value: "누락" },
  { label: "타지역 관서 실적", value: "타지역 관서 실적" },
  { label: "기타", value: "기타" },
];

export const evidenceTypeOptions = [
  { label: "붙임 2", value: "붙임 2" },
  { label: "붙임 3", value: "붙임 3" },
  { label: "기타", value: "기타" },
];

export const report112Rows: Report112Row[] = [
  {
    receiptNo: "01000000",
    caseNo: "2026-000001",
    reportType: "실종(실종아동)",
    reportContent: "부인이 친구랑 술마시다 없어졌다, 남편도 같이 있었다....",
    onSiteAction: "현장 출동 후 주변 수색 및 보호자 연락 조치",
    receivedAt: "2026-08-01 00:49",
    arrivedAt: "2026-08-01 00:56",
  },
  {
    receiptNo: "01000001",
    caseNo: "2026-000002",
    reportType: "가정폭력",
    reportContent: "가정 내 다툼으로 소란이 지속된다는 이웃 신고",
    onSiteAction: "당사자 분리 및 현장 안정 조치",
    receivedAt: "2026-08-01 01:18",
    arrivedAt: "2026-08-01 01:25",
  },
  {
    receiptNo: "01000002",
    caseNo: "2026-000003",
    reportType: "주취자",
    reportContent: "노상 주취자가 통행을 방해하고 있다는 신고",
    onSiteAction: "귀가 안내 및 보호자 인계",
    receivedAt: "2026-08-01 02:10",
    arrivedAt: "2026-08-01 02:17",
  },
];

function createManualRegistrationForm(): ManualRegistrationForm {
  return {
    applyDept: "홍익지구대",
    receiptNo: "",
    caseNo: "",
    reportContent: "",
    onSiteAction: "",
    manualReason: "누락",
    evidenceType: "붙임 2",
    receivedAt: "",
    arrivedAt: "",
  };
}

function createMockRows(): DispatchAllowanceRow[] {
  const reportContent =
    "부인이 친구랑 술마시다 없어졌다, 남편도 같이 있었다....";
  return [
    {
      no: 3,
      applyDept: "홍익지구대",
      otherStation: "충정로지구대",
      otherStationRef: "01000000",
      receiptNo: "01000000",
      caseNo: "임의등록 [실종(실종아동)]",
      reportContent,
      onSiteAction: reportContent,
      manualReason: "누락",
      receivedAt: "2026-08-01 00:49",
      arrivedAt: "2026-08-01 00:49",
    },
    {
      no: 2,
      applyDept: "홍익지구대",
      otherStation: "충정로지구대",
      otherStationRef: "01000000",
      receiptNo: "01000000",
      caseNo: "임의등록 [실종(실종아동)]",
      reportContent,
      onSiteAction: reportContent,
      manualReason: "누락",
      receivedAt: "2026-08-01 00:49",
      arrivedAt: "2026-08-01 00:49",
    },
    {
      no: 1,
      applyDept: "홍익지구대",
      otherStation: "충정로지구대",
      otherStationRef: "",
      receiptNo: "01000000",
      caseNo: "임의등록 [실종(실종아동)]",
      reportContent,
      onSiteAction: reportContent,
      manualReason: "누락",
      receivedAt: "2026-08-01 00:49",
      arrivedAt: "2026-08-01 00:49",
    },
  ];
}

export function useDispatchAllowanceList() {
  const department = ref<DepartmentValue>({
    level1: "hq",
    level2: "central-report",
    level3: "front-line",
  });
  const advancedSearchOpen = ref(false);
  const manualRegisterOpen = ref(false);
  const detailDialogOpen = ref(false);
  const detail = ref<DispatchAllowanceDetail | null>(null);
  const manualForm = ref<ManualRegistrationForm>(
    createManualRegistrationForm(),
  );

  const dateFrom = ref("2026-07-16");
  const dateTo = ref("");
  const keyword = ref("");

  const allRows = ref<DispatchAllowanceRow[]>(createMockRows());

  const rows = computed(() => {
    if (!keyword.value) return allRows.value;
    return allRows.value.filter(
      (row) =>
        row.reportContent.includes(keyword.value) ||
        row.caseNo.includes(keyword.value),
    );
  });

  function openManualRegister() {
    manualForm.value = createManualRegistrationForm();
    manualRegisterOpen.value = true;
  }

  function closeManualRegister() {
    manualRegisterOpen.value = false;
  }

  function openDetail(row: DispatchAllowanceRow) {
    detail.value = dispatchAllowanceDetails[row.no] ?? {
      receiptNo: row.receiptNo,
      caseNo: row.caseNo,
      receivedAt: row.receivedAt,
      arrivedAt: row.arrivedAt,
      closedAt: row.arrivedAt,
      dispatcher: "-",
      caseType: "-",
      reporter: "-",
      contact: "-",
      reportLocation: "-",
      processingResult: row.onSiteAction,
    };
    detailDialogOpen.value = true;
  }

  function saveManualRegistration() {
    const form = manualForm.value;
    allRows.value.unshift({
      no: allRows.value.length + 1,
      applyDept: form.applyDept,
      otherStation: "",
      otherStationRef: "",
      receiptNo: form.receiptNo,
      caseNo: form.caseNo,
      reportContent: form.reportContent,
      onSiteAction: form.onSiteAction,
      manualReason: form.manualReason,
      receivedAt: form.receivedAt,
      arrivedAt: form.arrivedAt,
    });
    closeManualRegister();
  }

  function applyReport112(row: Report112Row) {
    manualForm.value = {
      ...manualForm.value,
      receiptNo: row.receiptNo,
      caseNo: `임의등록 [${row.reportType}]`,
      reportContent: row.reportContent,
      onSiteAction: row.onSiteAction,
      receivedAt: row.receivedAt,
      arrivedAt: row.arrivedAt,
    };
  }

  return {
    department,
    advancedSearchOpen,
    manualRegisterOpen,
    detailDialogOpen,
    detail,
    manualForm,
    dateFrom,
    dateTo,
    keyword,
    rows,
    openManualRegister,
    closeManualRegister,
    openDetail,
    saveManualRegistration,
    applyReport112,
  };
}
