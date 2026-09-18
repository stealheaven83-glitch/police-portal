<template>
  <GenericDialog2 v-model:open="open" title="112사건조회" :size="800" :height="800" show-close-button :show-footer="false">
    <div class="lp-popup-split-fill">
      <SearchWrapper v-model:expanded="advancedOpen" collapsible>
        <template #department>
          <span class="dept-name">부서</span>
          <DepartmentCascadeSelect v-model="department" size="sm" />
        </template>
        <template #form>
          <!-- 시안: 두 칸씩 세 줄로 고정(줄 사이 16) -->
          <div class="lp-search-rows">
            <div class="search-area">
              <InputField2 :id="`${uid}-receipt-no`" v-model="receiptNo" label="접수번호" size="sm" input-class="w-33" />
              <InputField2 :id="`${uid}-case-no`" v-model="caseNo" label="사건번호" size="sm" input-class="w-33" />
            </div>
            <div class="search-area">
              <InputField2 :id="`${uid}-report-no`" v-model="reportNo" label="신고번호" size="sm" input-class="w-33" />
              <SelectField
                v-model="caseType"
                label="사건종별"
                :options="case112TypeOptions"
                size="sm"
                trigger-class="w-35"
              />
            </div>
            <div class="search-area">
              <DateRangePicker
                v-model:from="dateFrom"
                v-model:to="dateTo"
                label="사건일"
                from-label="사건일 시작일"
                to-label="사건일 종료일"
                size="sm"
                input-class="w-40"
              />
            </div>
          </div>
        </template>
        <template #btns>
          <Button type="button" variant="secondary" size="sm" @click="search">조회</Button>
        </template>
      </SearchWrapper>

      <!--
        시안 구조가 Grid(G01 사건목록 + Grid Handler + G02 사건상세) — 위아래 2분할을 화면에서 짜지 않고
        공용 LayoutSplite(horizontal, 드래그 리사이즈 포함) + LayoutPanel 을 쓴다(PM-PUB-0105 와 같은 방식).
      -->
      <LayoutSplite class="lp-split-fill" :count="2" horizontal :widths="[50, 50]" :min-widths="[30, 20]">
        <template #layout-1>
          <LayoutPanel title="사건목록" class="lp-popup-panel" no-padding>
            <div class="lp-popup-panel-body">
              <!-- PC 팝업이라 창 폭과 무관하게 표로 그린다(카드 목록 전환 끔) -->
              <TabulatorGrid
                class="flex-1"
                :columns="columns"
                :data="rows"
                :card-on-mobile="false"
                select-mode="single"
                height="100%"
                placeholder="조회된 사건이 없습니다"
                show-pagination
                :items-per-page="10"
                @row-click="onRowClick"
              />
            </div>
          </LayoutPanel>
        </template>

        <template #layout-2>
          <LayoutPanel title="사건상세" class="lp-popup-panel" no-padding>
            <template #actions>
              <Button type="button" variant="primary" size="xs" padding="12" @click="onAssign">사건지정</Button>
            </template>

            <div class="lp-popup-panel-body lp-popup-panel-body-tight">
              <NoData v-if="!detail" class="lp-nodata-fill" message="사건목록에서 사건을 선택해 주세요." />
              <!-- [제목 + 표] 반복 — 구역 사이 24 는 .pop-title-lv2 의 위 여백이 낸다(police-override.css) -->
              <template v-else>
                <div class="pop-title-lv2"><h3>접수정보</h3></div>
                <InfoTable :columns="2" popup size="100">
                  <InfoField label="접수번호">{{ detail.receiptNo }}</InfoField>
                  <InfoField label="코드">{{ detail.code }}</InfoField>
                  <InfoField label="사건번호">{{ detail.caseNo }}</InfoField>
                  <InfoField label="접수일자">{{ detail.receivedDate }}</InfoField>
                  <InfoField label="사건종별">{{ detail.caseType }}</InfoField>
                  <InfoField label="사건상태">{{ detail.caseStatus }}</InfoField>
                  <InfoField label="동일사건">{{ detail.sameCase }}</InfoField>
                  <InfoField label="접수유형">{{ detail.receiptType }}</InfoField>
                  <InfoField label="신고자">{{ detail.reporter }}</InfoField>
                  <InfoField label="신고번호">{{ detail.reportNo }}</InfoField>
                  <InfoField label="발생주소" full>
                    <span class="group-gap3">
                      <Tag size="small" :label="detail.addressType" />
                      <span>{{ detail.address }}</span>
                    </span>
                  </InfoField>
                  <InfoField label="상세위치" full>{{ detail.detailLocation }}</InfoField>
                  <InfoField label="사건개요" full layout="column">{{ detail.summary }}</InfoField>
                  <InfoField label="참고사항" full layout="column">{{ detail.note }}</InfoField>
                </InfoTable>

                <div class="pop-title-lv2"><h3>접수/도착/종결</h3></div>
                <InfoTable :columns="2" popup size="128">
                  <InfoField label="녹취시작시간">{{ detail.recordStartAt }}</InfoField>
                  <InfoField label="녹취종료시간">{{ detail.recordEndAt }}</InfoField>
                  <InfoField label="접수시각">{{ detail.receivedAt }}</InfoField>
                  <InfoField label="지령시각">{{ detail.orderedAt }}</InfoField>
                  <InfoField label="출동시각">{{ detail.dispatchedAt }}</InfoField>
                  <InfoField label="종결요청시각">{{ detail.closeRequestedAt }}</InfoField>
                  <InfoField label="출동요소시간(분)">{{ detail.dispatchMinutes }}</InfoField>
                  <InfoField label="선지령시각">{{ detail.preOrderedAt }}</InfoField>
                </InfoTable>

                <div class="pop-title-lv2"><h3>지령</h3></div>
                <InfoTable :columns="2" popup size="120">
                  <InfoField label="관할경찰서">{{ detail.jurisdictionStation }}</InfoField>
                  <InfoField label="관할지구대">{{ detail.jurisdictionUnit }}</InfoField>
                  <InfoField label="출동자">{{ detail.dispatcher }}</InfoField>
                  <InfoField label="출동요소">{{ detail.dispatchElement }}</InfoField>
                </InfoTable>

                <div class="pop-title-lv2"><h3>도착/종결</h3></div>
                <InfoTable :columns="2" popup size="120">
                  <InfoField label="종결코드">{{ detail.closingCode }}</InfoField>
                  <InfoField label="보고자">{{ detail.reporterName }}</InfoField>
                  <InfoField label="종결 시 사건코드">{{ detail.closingCaseCode }}</InfoField>
                  <InfoField label="임시 종결시각">{{ detail.tempClosedAt }}</InfoField>
                  <InfoField label="종결내용" full>{{ detail.closingContent }}</InfoField>
                </InfoTable>

                <div class="pop-title-lv2 lp-block-title"><h3>출동요소목록</h3></div>
                <TableWrapper :columns="elementColumns" :items="detail.elements" :show-pagination="false" />
              </template>
            </div>
          </LayoutPanel>
        </template>
      </LayoutSplite>
    </div>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import { Button } from '@/components/custom/button'
import LayoutSplite from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { Tag } from '@/components/custom/tag'
import { NoData } from '@/components/custom/empty'
import { useDialog } from '@/composable/dialog/dialog'
import {
  case112TypeOptions,
  useCase112Search,
  type Case112Detail,
  type Case112Row,
} from './case112'

/**
 * 112사건조회 팝업 — 전 화면 공용. 112신고 사건을 찾아 한 건을 고르면 assign 으로 넘긴다.
 * Figma 8mQz91txveSEKO0ky7Ck6V / 15203:139960 (PC-LPO-0503), 동작은 그 기획서(76~78쪽) 기준.
 *
 * 쓰는 쪽은 v-model:open 으로 열고 @assign 으로 고른 사건을 받는다 — 목록·상세는 이 컴포넌트가
 * 목업으로 들고 있다. **API 연동 시 composable(case112.ts)의 목업만 갈아 끼우면 된다.**
 *
 * 형제와의 차이:
 * - custom/common/UserFindDialog.vue — 부서 트리에서 사람을 고른다. 이건 112신고 사건을 고른다.
 * - views/pub/PM-PUB-0201/components/Report112Dialog.vue — 통합판단조사표 전용(접수번호 한 줄 검색).
 */
defineOptions({ name: 'Case112Dialog' })

/** 라벨-입력 연결용 id — 공통 컴포넌트라 한 화면에 둘이 떠도 겹치지 않게 한다 */
const uid = useId()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  /** 사건지정 — 고른 사건(행 + 상세)을 쓰는 화면에 넘긴다. 창은 이 컴포넌트가 닫는다 */
  (e: 'assign', row: Case112Row, detail: Case112Detail): void
}>()

const dialog = useDialog()

const {
  department,
  advancedOpen,
  receiptNo,
  caseNo,
  reportNo,
  caseType,
  dateFrom,
  dateTo,
  rows,
  selected,
  detail,
  search,
  select,
} = useCase112Search()

/* 컬럼 구성은 기획서(번호~LBS위치조회), 폭은 시안 값. 합 822 라 패널 폭을 넘으면 가로 스크롤된다(시안도 같다) */
const columns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '접수일자', field: 'receivedDate', width: 112, hozAlign: 'center' },
  { title: '접수시간', field: 'receivedTime', width: 92, hozAlign: 'center' },
  { title: '코드', field: 'code', width: 60, hozAlign: 'center' },
  { title: '사건번호', field: 'caseNo', width: 80, hozAlign: 'center' },
  { title: '사건종별', field: 'caseType', width: 80, hozAlign: 'center' },
  { title: '접수관서', field: 'receiptOffice', width: 80, hozAlign: 'center' },
  { title: '관할관서', field: 'jurisdictionOffice', width: 92, hozAlign: 'center' },
  { title: '종결', field: 'closing', width: 66, hozAlign: 'center' },
  { title: 'LBS위치조회', field: 'lbs', width: 100, hozAlign: 'center' },
]

const elementColumns = [
  { key: 'element', label: '출동요소', width: '50%' },
  { key: 'contact', label: '연락처' },
]

/** TabulatorGrid 는 행 데이터가 아니라 RowComponent 를 넘긴다(CLAUDE.md §5) */
function onRowClick(_event: Event, row: { getData: () => Case112Row }) {
  select(row.getData())
}

/**
 * 사건지정 — 미선택이면 알림으로 막고(기획서 A11), 고른 게 있으면 확인창(A09) 뒤에 창을 닫고 넘긴다.
 * 사용자 지정(기획서): 확인창 — CLAUDE.md §4 기본(alert 만)과 다르지만 기획서대로 따름
 */
async function onAssign() {
  if (!selected.value || !detail.value) {
    await dialog.alert({ title: '사건을 선택해 주세요.', btnCancel: '확인' })
    return
  }
  const { confirmed } = await dialog.confirm({
    title: '선택한 사건을 출동수당 사건으로 지정하시겠습니까?',
    btnOk: '확인',
    btnCancel: '취소',
  })
  if (!confirmed) return
  emit('assign', selected.value, detail.value)
  open.value = false
}
</script>
