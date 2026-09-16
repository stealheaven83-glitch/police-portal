<template>
  <PageHeader>
    <template #left>
      <PageTitle title="출동수당 취합(일별)" />
    </template>
    <template #right>
      <div class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </div>
    </template>
  </PageHeader>

  <SearchWrapper collapsible v-model:expanded="advancedSearchOpen">
    <template #department>
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department" size="sm" />
    </template>
    <template #form>
      <div class="search-area">
        <div class="group-gap3">
          <SelectField
            label="근무월"
            v-model="workYear"
            :options="yearOptions"
            size="sm"
            trigger-class="w-30"
          />
          <SelectField
            v-model="workMonth"
            :options="monthOptions"
            size="sm"
            trigger-class="w-25"
          />
        </div>
        <SelectField
          label="신청자"
          v-model="applicant"
          :options="applicantOptions"
          size="sm"
          trigger-class="w-50"
        />
        <SelectField
          label="신청구분"
          v-model="applyType"
          :options="applyTypeOptions"
          size="sm"
          trigger-class="w-30"
        />
      </div>
    </template>
    <template #btns>
      <Button variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <div class="list-actions">
    <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
      <Download :size="16" aria-hidden="true" />
      엑셀다운로드
    </Button>
  </div>

  <!-- 신고내용·처리내용이 두 줄로 들어가 행이 내용만큼 늘어난다(lp-grid-multiline + variableHeight) -->
  <TabulatorGrid
    ref="gridRef"
    :columns="columns"
    :data="rows"
    layout="fitDataFill"
    placeholder="조회된 출동수당 취합 내역이 없습니다"
    show-pagination
    :items-per-page="10"
    class="flex-1 lp-grid-multiline"
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
import SelectField from "@/components/custom/select/SelectField.vue";
import { Button } from "@/components/custom/button";
import {
  TabulatorGrid,
  type TabulatorGridColumn,
} from "@/components/custom/tabulator";
import { useSideMenuSetup } from "@/composable/menu/useSideMenuSetup";
import { localPoliceMenu } from "@/composable/menu/sidemenu/presets";
import { useBottomTabSetup } from "@/composable/tab/useBottomTabSetup";
import {
  useDispatchSummaryDaily,
  applicantOptions,
  applyTypeOptions,
} from "./composable/PC-LPO-0511";
import HelpButton from "@/components/custom/button/HelpButton.vue";
defineOptions({ name: "PcLpo0511" });

useSideMenuSetup({
  ...localPoliceMenu,
  openIndex: 3,
  activeChild: "출동수당 취합(일별)",
});

const navItems = [
  { label: "홈", path: "/" },
  { label: "지역경찰" },
  { label: "출동수당" },
  { label: "출동수당 취합(일별)" },
];

const yearOptions = [
  { label: "2026년", value: "2026" },
  { label: "2025년", value: "2025" },
];
const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}월`,
  value: String(i + 1),
}));

const {
  department,
  advancedSearchOpen,
  workYear,
  workMonth,
  applicant,
  applyType,
  rows,
} = useDispatchSummaryDaily();

// 컬럼 폭은 시안(12853:63853) 값 — 합이 1600 이라 1564 본문에서는 가로 스크롤이 생기는 게 맞다.
// 시안 개정(2026-09-16)으로 '도착 소요시간' 컬럼은 빠졌다(데이터 필드 arrivalTime 은 그대로 둠).
const columns: TabulatorGridColumn[] = [
  { title: "번호", field: "no", width: 60, hozAlign: "center" },
  { title: "부서", field: "dept", width: 240, hozAlign: "center" },
  {
    title: "팀",
    field: "team",
    width: 60,
    hozAlign: "center",
    headerSort: true,
  },
  { title: "직급성명", field: "rankName", width: 100, hozAlign: "center" },
  { title: "생년월일", field: "birthDate", width: 110, hozAlign: "center" },
  { title: "출동건수", field: "dispatchCount", width: 70, hozAlign: "center" },
  { title: "접수일시", field: "receivedAt", width: 110, hozAlign: "center" },
  { title: "범죄명", field: "crimeName", width: 80, hozAlign: "center" },
  { title: "접수번호", field: "receiptNo", width: 120, hozAlign: "center" },
  { title: "사건번호", field: "caseNo", width: 70, hozAlign: "center" },
  {
    title: "신고내용",
    field: "reportContent",
    width: 180,
    hozAlign: "center",
    variableHeight: true,
  },
  {
    title: "처리내용",
    field: "processContent",
    width: 180,
    hozAlign: "center",
    variableHeight: true,
  },
  {
    title: "현장조치내용",
    field: "onSiteAction",
    width: 100,
    hozAlign: "center",
  },
  {
    title: "임의등록사유",
    field: "manualReason",
    width: 120,
    hozAlign: "center",
  },
];

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null);
function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10);
  gridRef.value?.download("csv", `출동수당취합_일별_${today}.csv`);
}

useBottomTabSetup({
  value: "PC-LPO-0511",
  label: "출동수당취합(일별)",
  path: "/views/lpo/PC-LPO-0511",
  componentName: "PcLpo0511",
  closable: true,
});
</script>
