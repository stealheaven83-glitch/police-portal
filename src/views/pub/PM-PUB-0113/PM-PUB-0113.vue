<template>
  <PageHeader>
    <template #left>
      <PageTitle title="우수시설인증" />
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
        <DateRangePicker
          v-model:from="registeredFrom"
          v-model:to="registeredTo"
          label="등록기간"
          from-label="등록기간 시작일"
          to-label="등록기간 종료일"
          size="sm"
          input-class="w-40"
        />
        <SelectField
          v-model="certificationType"
          label="인증구분"
          :options="certificationTypeOptions"
          size="sm"
          trigger-class="w-30"
        />
      </div>
    </template>
    <template #btns>
      <Button type="button" variant="secondary" size="sm">조회</Button>
    </template>
  </SearchWrapper>

  <LayoutSplit :count="2" :widths="[52, 48]" :min-widths="[35, 32]">
    <template #layout-1>
      <LayoutPanel title="인증 목록">
        <template #actions>
          <Button type="button" variant="tertiary" size="sm" @click="onDownloadExcel">
            <Download :size="16" aria-hidden="true" />
            엑셀다운로드
          </Button>
          <Button type="button" variant="primary" size="sm" @click="createRow">신규</Button>
        </template>

        <!-- 컬럼이 많아 가로 스크롤이 필요하다 — fitColumns 가 아니라 fitDataFill(CLAUDE.md §6) -->
        <TabulatorGrid
          ref="gridRef"
          :columns="listColumns"
          :data="rows"
          class="flex-1"
          height="100%"
          layout="fitDataFill"
          :row-class="rowClass"
          placeholder="조회된 인증 내역이 없습니다"
          show-pagination
          :items-per-page="10"
          @row-click="onListRowClick"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="체크리스트">
        <template #actions>
          <Button type="button" variant="primary" size="sm" @click="onEdit">
            {{ editing ? '저장' : '수정' }}
          </Button>
        </template>

        <ScrollWrapper>
          <section class="lp-section" aria-labelledby="cert-general-heading">
            <h3 id="cert-general-heading" class="lp-heading-md lp-section-title">일반현황</h3>
            <InfoTable :columns="2" size="100">
              <!-- 주소는 시안에서 오른쪽 두 칸(시설물명 · 이용/규모)에 걸쳐 있다 -->
              <InfoField label="주소" :row-span="2">
                <span class="readonly-text">{{ checklist.address }}</span>
              </InfoField>
              <InfoField label="시설물명" for="cert-facility-name">
                <InputField2
                  id="cert-facility-name"
                  v-model="checklist.facilityName"
                  size="sm"
                  :disabled="!editing"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </InfoField>
              <InfoField label="이용 · 규모" for="cert-usage-scale">
                <InputField2
                  id="cert-usage-scale"
                  v-model="checklist.usageScale"
                  size="sm"
                  :disabled="!editing"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </InfoField>

              <InfoField label="체크리스트 형태" for="cert-checklist-type">
                <SelectField
                  id="cert-checklist-type"
                  v-model="checklist.checklistType"
                  :options="checklistTypeOptions"
                  size="sm"
                  :disabled="!editing"
                  trigger-class="w-full"
                  class="!space-y-0 flex-1"
                />
              </InfoField>
              <InfoField label="사용승인일" for="cert-approval-date">
                <DatePicker
                  id="cert-approval-date"
                  v-model="checklist.approvalDate"
                  size="sm"
                  :disabled="!editing"
                  class="flex-1"
                  input-class="w-full"
                />
              </InfoField>
            </InfoTable>
          </section>

          <section class="lp-section" aria-labelledby="cert-owner-heading">
            <h3 id="cert-owner-heading" class="lp-heading-md lp-section-title">시설주 정보</h3>
            <InfoTable :columns="2" size="100">
              <InfoField label="성명" for="cert-owner-name">
                <InputField2
                  id="cert-owner-name"
                  v-model="checklist.ownerName"
                  size="sm"
                  :disabled="!editing"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </InfoField>
              <InfoField label="연락처" for="cert-owner-phone">
                <InputField2
                  id="cert-owner-phone"
                  v-model="checklist.ownerPhone"
                  size="sm"
                  type="tel"
                  :disabled="!editing"
                  class="!space-y-0 flex-1"
                  input-class="w-full"
                />
              </InfoField>
            </InfoTable>
          </section>

          <section class="lp-section" aria-labelledby="cert-crime-heading">
            <h3 id="cert-crime-heading" class="lp-heading-md lp-section-title">범죄발생 현황</h3>
            <InfoTable :columns="2" size="100">
              <InfoField label="피해여부">
                <RadioGroup
                  v-model="checklist.damaged"
                  :disabled="!editing"
                  :class="infoStyles['info-table-radio']"
                >
                  <RadioGroupItem value="yes" label="있음" />
                  <RadioGroupItem value="no" label="없음" />
                </RadioGroup>
              </InfoField>
              <!-- Stepper 는 role="group" + aria-label 이라 연결할 id 가 없다 — for 를 주지 않는다 -->
              <InfoField label="피해횟수">
                <Stepper
                  v-model="checklist.damageCount"
                  :min="0"
                  label="피해횟수"
                  :disabled="!editing"
                />
              </InfoField>
            </InfoTable>
          </section>

          <section class="lp-section" aria-labelledby="cert-standard-heading">
            <h3 id="cert-standard-heading" class="lp-heading-md lp-section-title">인증기준표</h3>
            <!-- 시안이 내용 없이 회색 상자로만 잡혀 있다 — 실제 표는 연동 후 채운다 -->
            <p class="lp-placeholder-box">옆에 참고 →</p>
          </section>
        </ScrollWrapper>
      </LayoutPanel>
    </template>
  </LayoutSplit>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import Stepper from '@/components/custom/input/Stepper.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { DateRangePicker } from '@/components/custom/datepicker'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import LayoutSplit from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import ScrollWrapper from '@/components/custom/ScrollWrapper.vue'
import { useDialog } from '@/composable/dialog/dialog'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import {
  useExcellentFacilityCertification,
  certificationTypeOptions,
  checklistTypeOptions,
  type CertificationRow,
} from './composable/PM-PUB-0113'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'
// KeepAlive 캐싱 대상 이름 — useBottomTabSetup 의 componentName 과 정확히 같아야 한다(§5)
defineOptions({ name: 'PmPub0113' })

// LNB: publicSafetyMenu items[0] = '범죄예방진단' > '우수시설인증'
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 0, activeChild: '우수시설인증' })

// '/pub' 은 라우터에 없는 URL 구획이라 path 를 주지 않는다(CLAUDE.md §4)
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '범죄예방진단' },
  { label: '우수시설인증' },
]

const {
  department,
  advancedSearchOpen,
  registeredFrom,
  registeredTo,
  certificationType,
  rows,
  activeRowKey,
  checklist,
  editing,
  selectRow,
  createRow,
} = useExcellentFacilityCertification()

const dialog = useDialog()

const listColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 70, hozAlign: 'center' },
  { title: '부서', field: 'dept', width: 150, hozAlign: 'center' },
  { title: '유형', field: 'facilityType', width: 180, hozAlign: 'center' },
  { title: '인증주소', field: 'address', width: 220, hozAlign: 'center' },
  { title: '진단일시', field: 'diagnosedAt', width: 160, hozAlign: 'center' },
  { title: '인증구분', field: 'certificationType', width: 110, hozAlign: 'center' },
  { title: '인증일자', field: 'certifiedAt', width: 120, hozAlign: 'center' },
]

/** 지금 우측 체크리스트에 떠 있는 행만 배경으로 표시한다 */
function rowClass(row: CertificationRow) {
  return row.rowKey === activeRowKey.value ? 'lp-grid-active-row' : undefined
}

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §6) */
function onListRowClick(_e: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as CertificationRow
  selectRow(data.rowKey)
}

function onDownloadExcel() {
  const today = new Date().toISOString().slice(0, 10)
  gridRef.value?.download('csv', `우수시설인증_${today}.csv`)
}

/** 시안의 '수정' 버튼은 조회 ↔ 편집을 오간다. 편집 상태에서 누르면 저장이다 */
async function onEdit() {
  if (!editing.value) {
    editing.value = true
    return
  }
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  editing.value = false
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PM-PUB-0113',
  label: '우수시설인증',
  path: '/views/pub/PM-PUB-0113',
  componentName: 'PmPub0113',
  closable: true,
})
</script>
