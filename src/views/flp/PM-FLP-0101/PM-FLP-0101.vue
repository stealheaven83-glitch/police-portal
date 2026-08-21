<script setup lang="ts">
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { Button } from '@/components/custom/button'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import RequestDetailDialog from './RequestDetailDialog.vue'
import {
  useRequestManagementForm,
  periodTypeOptions,
  receiptTypeOptions,
  pageSizeOptions,
} from './PM-FLP-0101.ts'
import type { RequestRow } from './PM-FLP-0101.ts'
import styles from './PM-FLP-0101.module.css'

const navItems = [
  { label: '홈', path: '/' },
  { label: '탄력순찰' },
  { label: '요청관리' },
]

const listColumns = [
  { key: 'id', label: '관리번호', width: '11rem' },
  { key: 'receivedAt', label: '접수일자', width: '11rem' },
  { key: 'requestPeriod', label: '요청기간', width: '18rem' },
  { key: 'requestTime', label: '요청시간', width: '9rem' },
  { key: 'addressJibun', label: '주소(지번)', width: '22rem' },
  { key: 'addressRoad', label: '주소(도로명)', width: '20rem' },
  { key: 'requestCount', label: '요청건수', width: '8rem' },
  { key: 'patrolRequest', label: '순찰요청사항', width: '18rem' },
  { key: 'patrolReason', label: '순찰사유', width: '18rem' },
  { key: 'reportCount', label: '신고건수', width: '8rem' },
  { key: 'hotspot', label: '핫스팟', width: '8rem' },
  { key: 'demandType', label: '경력수요형태', width: '12rem' },
  { key: 'demandPersonnel', label: '경력수요인원', width: '10rem' },
  { key: 'email', label: '이메일', width: '16rem' },
  { key: 'registrant', label: '등록자', width: '9rem' },
  { key: 'registeredAt', label: '등록일', width: '11rem' },
]

const {
  filteredRows,
  pagedRows,
  pageSize,
  itemsPerPage,
  currentPage,
  totalPages,
  department,
  periodType,
  dateFrom,
  dateTo,
  receiptType,
  selectedRow,
  detailOpen,
  search,
  registerRow,
  selectRow,
  downloadExcel,
} = useRequestManagementForm()

function onSelectRow(payload: { index: number; item: RequestRow }) {
  selectRow(payload)
}

function onItemsPerPageChange(value: number) {
  pageSize.value = String(value)
  currentPage.value = 1
}
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="요청관리" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <div :class="styles.toolbar">
    <div :class="styles.toolbarRow">
      <div :class="styles.field">
        <span :class="styles.fieldLabel">부서</span>
        <DepartmentCascadeSelect v-model="department" size="sm" :select-class="styles.select" />
      </div>

      <div :class="styles.field">
        <label :class="styles.fieldLabel" for="request-period-type">기간구분</label>
        <SelectField
          id="request-period-type"
          v-model="periodType"
          :options="periodTypeOptions"
          size="sm"
          :trigger-class="styles.select"
          class="!space-y-0"
        />
      </div>

      <div :class="styles.field">
        <span :class="styles.fieldLabel">기간</span>
        <div :class="styles.dateRangeGroup">
          <DatePicker v-model="dateFrom" size="sm" :input-class="styles.dateInput" class="!space-y-0" placeholder="YYYY.MM.DD" />
          <span :class="styles.dateSeparator" aria-hidden="true">~</span>
          <DatePicker v-model="dateTo" size="sm" :input-class="styles.dateInput" class="!space-y-0" placeholder="YYYY.MM.DD" />
        </div>
      </div>

      <div :class="styles.field">
        <label :class="styles.fieldLabel" for="request-receipt-type">접수구분</label>
        <SelectField
          id="request-receipt-type"
          v-model="receiptType"
          :options="receiptTypeOptions"
          size="sm"
          :trigger-class="styles.select"
          class="!space-y-0"
        />
      </div>

      <div :class="styles.toolbarActions">
        <Button type="button" variant="secondary" size="sm" @click="search">조회</Button>
        <Button type="button" variant="primary" size="sm" @click="registerRow">등록</Button>
      </div>
    </div>
  </div>

  <section :class="styles.panel" aria-labelledby="request-list-heading">
    <div :class="styles.panelHead">
      <h3 id="request-list-heading" :class="styles.panelTitle">요청관리</h3>
      <Button type="button" variant="tertiary2" size="sm" @click="downloadExcel">엑셀다운로드</Button>
    </div>

    <div :class="styles.panelBody">
      <div :class="styles.tableScroll">
        <TableWrapper
          :columns="listColumns"
          :items="pagedRows"
          :items-per-page="itemsPerPage"
          :items-per-page-options="pageSizeOptions"
          :total-elements="filteredRows.length"
          :total-pages="totalPages"
          :current-page="currentPage"
          selectable
          empty-title="조회된 요청이 없습니다"
          empty-description="검색 조건을 변경해 다시 조회해 주세요."
          @page-change="(page) => (currentPage = page)"
          @update:items-per-page="onItemsPerPageChange"
          @select-row="onSelectRow"
        >
          <template #cell-requestPeriod="{ item }">
            {{ item.requestPeriodFrom }} ~ {{ item.requestPeriodTo }}
          </template>
        </TableWrapper>
      </div>
    </div>
  </section>

  <RequestDetailDialog v-model:open="detailOpen" :row="selectedRow" />
</template>
