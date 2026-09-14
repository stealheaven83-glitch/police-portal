<template>
  <PageHeader>
    <template #left>
      <PageTitle title="출동수당조회" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <div>
    <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
      <template #department>
        <span class="dept-name">부서</span>
        <DepartmentCascadeSelect v-model="department" size="sm" />
      </template>
      <template #form>
        <div class="search-area">
          <div class="group-gap2">
            <DatePicker
              v-model="dateFrom"
              label="접수일"
              size="sm"
              inputClass="w-40"
            />
            <span aria-hidden="true">~</span>
            <DatePicker v-model="dateTo" size="sm" inputClass="w-40" />
          </div>
          <InputField2
            v-model="keyword"
            label="목록검색"
            size="sm"
            inputClass="w-40"
          />
        </div>
      </template>
      <template #btns>
        <Button variant="secondary" size="sm">조회</Button>
      </template>
    </SearchWrapper>
  </div>

  <div class="list-actions space-between items-end">
    <div class="list-actions-txt">
      <p>
        ＊ 출동업무수당 지급대상 자동체크는 매일 오전 08시~12시에 반영됩니다.
        12시 이후에 확인 후 작성하세요
      </p>
      <p>
        ＊ 출동업무수당 자동체크 된 지급대상 사건과 임의등록 사건 만 표시됩니다.
      </p>
    </div>
    <div class="group-gap2">
      <Button
        type="button"
        variant="tertiary"
        size="sm"
        @click="onDownloadExcel"
      >
        <Download :size="16" aria-hidden="true" />
        엑셀다운로드
      </Button>
       <Button
        type="button"
        variant="tertiary2"
        size="sm"
        @click="onManualRegister"
        >삭제</Button
      >
      <Button
        type="button"
        variant="tertiary2"
        size="sm"
        @click="onManualRegister"
        >임의등록</Button
      >
      <Button type="button" variant="primary" size="sm" @click="onSave"
        >저장</Button
      >
    </div>
  </div>

  <TabulatorGrid
    ref="gridRef"
    class="flex-1"
    :columns="columns"
    :data="rows"
    select-mode="checkbox"
    height="100%"
    min-height="30rem"
    placeholder="조회된 출동수당 내역이 없습니다"
  />

  <ManualRegisterDialog
    v-model:open="manualRegisterOpen"
    :form="manualForm"
    @save="saveManualRegistration"
  />
  <DispatchAllowanceDetailDialog
    v-model:open="detailDialogOpen"
    :detail="detail"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Download } from "lucide-vue-next";
import PageHeader from "@/components/custom/title/PageHeader.vue";
import PageTitle from "@/components/custom/title/PageTitle.vue";
import Breadcrumb from "@/components/custom/breadcrumb/Breadcrumb.vue";
import SearchWrapper from "@/components/custom/search/SearchWrapper.vue";
import DepartmentCascadeSelect from "@/components/custom/select/DepartmentCascadeSelect.vue";
import InputField2 from "@/components/custom/input/InputField2.vue";
import DatePicker from "@/components/custom/datepicker/DatePicker.vue";
import { Button } from "@/components/custom/button";
import {
  TabulatorGrid,
  type TabulatorGridColumn,
} from "@/components/custom/tabulator";
import { useSideMenuSetup } from "@/composable/menu/useSideMenuSetup";
import { localPoliceMenu } from "@/composable/menu/sidemenu/presets";
import { useBottomTabSetup } from "@/composable/tab/useBottomTabSetup";
import {
  useAutoTrigger,
  type ScreenTriggerMap,
} from "@/composables/useAutoTrigger";
import {
  useDispatchAllowanceList,
  type DispatchAllowanceRow,
} from "./composable/PC-LPO-0501";
import ManualRegisterDialog from "./components/ManualRegisterDialog.vue";
import DispatchAllowanceDetailDialog from "./components/DispatchAllowanceDetailDialog.vue";
import HelpButton from "@/components/custom/button/HelpButton.vue";
import { useDialog } from "@/composable/dialog/dialog.ts";
defineOptions({ name: "PcLpo0501" });

useSideMenuSetup({
  ...localPoliceMenu,
  openIndex: 3,
  activeChild: "출동수당 조회",
});

const navItems = [
  { label: "홈", path: "/" },
  { label: "지역경찰" },
  { label: "출동수당" },
  { label: "출동수당 조회" },
];

const {
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
  openDetail,
  saveManualRegistration,
} = useDispatchAllowanceList();

const screenTriggers: ScreenTriggerMap = {
  "PC-LPO-0501": [],
  "PC-LPO-0502": [[manualRegisterOpen, true]],
  "PC-LPO-0504": [[detailDialogOpen, true]],
};
useAutoTrigger(screenTriggers);

// 일시 칸은 날짜와 시간을 두 줄로 끊어 보여준다("2026-08-01 00:49" → 날짜 / 시간)
function dateTimeFormatter(cell: { getValue: () => unknown }) {
  const value = String(cell.getValue() ?? "");
  if (!value) return "";
  const [date, time] = value.split(" ");
  if (!time) return `<span class="lp-cell-datetime">${date}</span>`;
  return `<span class="lp-cell-datetime">${date}<br />${time}</span>`;
}

const columns: TabulatorGridColumn[] = [
  { title: "번호", field: "no", width: 60, hozAlign: "center" },
  { title: "신청부서", field: "applyDept", hozAlign: "center" },
  {
    title: "타지역 관서<br/>(전소속 부서)",
    field: "otherStation",
    hozAlign: "center",
  },
  {
    title: "타지역관서<br/>(전소속부서)<br/> 실적가져오기",
    field: "otherStationRef",
    hozAlign: "center",
  },
  { title: "접수번호", field: "receiptNo", hozAlign: "center" },
  { title: "사건번호", field: "caseNo", hozAlign: "center" },
  {
    title: "신고내용",
    field: "reportContent",
    hozAlign: "left",
    widthGrow: 2,
    cellType: "button",
    buttonVariant: "link",
    buttonSize: "xxs",
    buttonLabel: (row) => String((row as DispatchAllowanceRow).reportContent),
    onButtonClick: (row) => openDetail(row as DispatchAllowanceRow),
  },
  {
    title: "현장조치내용",
    field: "onSiteAction",
    hozAlign: "center",
    widthGrow: 2,
  },
  {
    title: "임의등록사유",
    field: "manualReason",
    width: 120,
    hozAlign: "center",
  },
  {
    title: "접수일시",
    field: "receivedAt",
    width: 150,
    hozAlign: "center",
    formatter: dateTimeFormatter,
  },
  {
    title: "도착일시",
    field: "arrivedAt",
    width: 150,
    hozAlign: "center",
    formatter: dateTimeFormatter,
  },
];

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null);

function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10);
  gridRef.value?.download("csv", `출동수당조회_${today}.csv`);
}

function onManualRegister() {
  openManualRegister();
}

const dialog = useDialog();

async function onSave() {
  const result = await dialog.confirm({
    title: "저장하시겠습니까?",
    btnOk: "확인",
    btnCancel: "취소",
  });
  if (!result.confirmed) return;

  // TODO: API 연동. 변경된 행만 보내려면 gridRef.getDirtyRows() 를 쓴다.
  await dialog.alert({ title: "저장되었습니다.", btnCancel: "확인" });
}

useBottomTabSetup({
  value: "PC-LPO-0501",
  label: "출동수당조회",
  path: "/views/lpo/PC-LPO-0501",
  componentName: "PcLpo0501",
  closable: true,
});
</script>
