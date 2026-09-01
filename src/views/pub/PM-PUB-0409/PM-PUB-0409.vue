<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { BedSingle, Check, X } from 'lucide-vue-next'

import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'

import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'

import {
  useCenterBedStatus,
  maskName,
  regionOptions,
  centerOptions,
  ageGroupOptions,
  symptomOptions,
  receiptRouteOptions,
  hourOptions,
  minuteOptions,
  type CenterBedRow,
} from './composable/PM-PUB-0409'
import styles from './style/PM-PUB-0409.module.css'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'

// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!) — useBottomTabSetup 의 componentName 과 일치해야 한다.
defineOptions({ name: 'PmPub0409' })

/**
 * LNB. 프리셋을 인라인으로 펼쳐 동기 경로로 준다 (CLAUDE.md §5).
 * publicSafetyMenu.items[4] = '보호조치 대응팀' > '주취자 센터 병상 현황'.
 */
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 4, activeChild: '주취자 센터 병상 현황' })

// 브레드크럼: 실제 라우트가 있는 항목만 path 를 준다.
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '보호조치대응팀' },
  { label: '주취자센터병상현황' },
]

const {
  listRows,
  pagedRows,
  itemsPerPage,
  currentPage,
  totalPages,
  selectedRow,
  searchRegion,
  searchCenter,
  detail,
  search,
  selectRow,
  deleteSelected,
} = useCenterBedStatus()

const listColumns = [
  { key: 'no', label: '번호', width: '5rem' },
  { key: 'region', label: '지역', width: '6rem' },
  { key: 'centerName', label: '센터명' },
  { key: 'phone', label: '연락처', width: '12rem' },
  { key: 'beds', label: '병상현황', width: '13rem' },
  { key: 'registrant', label: '등록자', width: '7rem' },
  { key: 'updatedAt', label: '수정일시', width: '12rem' },
]

function onSelectRow(payload: { index: number; item: CenterBedRow }) {
  selectRow(payload.item)
}

/** 접수경로 = '112신고' 일 때만 접수번호 입력 + 112신고조회 버튼 활성 (기획서 3·4) */
const receiptNoDisabled = computed(() => detail.receiptRoute !== 'report112')
/** 접수경로 = '기타' 일 때만 기타 사유 입력 활성 (기획서 8) */
const receiptEtcDisabled = computed(() => detail.receiptRoute !== 'etc')

/** 기획서 9: 배정 체크 시 사용가능 병상 수 -1 로 표기 */
const displayAvailableBeds = computed(() =>
  Math.max(0, detail.availableBeds - (detail.assign ? 1 : 0)),
)

const centerRegisterOpen = ref(false) // 주취자센터 등록 (PM-PUB-0411)
const drunkRegisterOpen = ref(false) // 주취자등록 & 병상배정 등록 (PC-PUB-0410)
const report112Open = ref(false) // 112신고조회 (PM-COM-0501)

function onSave() {
  if (!selectedRow.value) {
    toast.warning('센터를 선택해 주세요.')
    return
  }
  toast.success('저장되었습니다.')
}

function onDelete() {
  if (!deleteSelected()) {
    toast.warning('삭제할 센터를 선택해 주세요.')
    return
  }
  toast.success('삭제되었습니다.')
}

useBottomTabSetup({
  value: 'PM-PUB-0409',
  label: '주취자 센터 병상 현황',
  path: '/views/pub/PM-PUB-0409',
  componentName: 'PmPub0409',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="주취자 센터 병상 현황" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <SearchWrapper>
    <template #form>
      <div class="search-area">
        <SelectField
          v-model="searchRegion"
          label="지역"
          :options="regionOptions"
          size="sm"
          triggerClass="w-40"
        />
        <SelectField
          v-model="searchCenter"
          label="센터명"
          :options="centerOptions"
          size="sm"
          triggerClass="w-64"
        />
      </div>
    </template>
    <template #btns>
      <div class="btn-wrap">
        <Button variant="secondary" size="sm" @click="search">조회</Button>
        <Button variant="tertiary2" size="sm" @click="centerRegisterOpen = true">주취자센터 등록</Button>
      </div>
    </template>
  </SearchWrapper>

  <div :class="styles.columns">
    <!-- 좌측: 등록된 주취자센터 목록 -->
    <section :class="styles.panel" aria-labelledby="pmpub0409-list-heading">
      <div :class="styles.panelHead">
        <h3 id="pmpub0409-list-heading" :class="styles.panelTitle">주취자센터병상현황</h3>
      </div>
      <div :class="styles.panelBody">
        <TableWrapper
          :columns="listColumns"
          :items="pagedRows"
          :items-per-page="itemsPerPage"
          :total-elements="listRows.length"
          :total-pages="totalPages"
          :current-page="currentPage"
          selectable
          empty-title="조회된 주취자센터가 없습니다"
          empty-description="검색 조건을 변경해 다시 조회해 주세요."
          @page-change="(page) => (currentPage = page)"
          @select-row="onSelectRow"
        >
          <template #cell-beds="{ item }">
            <span :class="styles.bedRow">
              <span
                v-for="(bed, i) in (item as CenterBedRow).beds"
                :key="i"
                :class="[styles.bed, bed === 'inuse' ? styles.bedInUse : styles.bedFree]"
              >
                <BedSingle :size="20" aria-hidden="true" />
                <X v-if="bed === 'inuse'" :size="10" :class="styles.bedBadge" aria-hidden="true" />
                <Check v-else :size="10" :class="styles.bedBadge" aria-hidden="true" />
              </span>
              <span class="sr-only">
                총 {{ (item as CenterBedRow).beds.length }}병상 중
                사용가능 {{ (item as CenterBedRow).beds.filter((b) => b === 'free').length }}병상
              </span>
            </span>
          </template>
        </TableWrapper>
      </div>
    </section>

    <!-- 우측: 상세정보 -->
    <section :class="styles.panel" aria-labelledby="pmpub0409-detail-heading">
      <div :class="styles.panelHead">
        <h3 id="pmpub0409-detail-heading" :class="styles.panelTitle">상세정보</h3>
        <div class="btn-wrap-group">
          <Button type="button" variant="tertiary2" size="sm" @click="onDelete">삭제</Button>
          <Button type="button" variant="secondary" size="sm" @click="drunkRegisterOpen = true">주취자등록</Button>
          <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
        </div>
      </div>

      <div :class="styles.panelBody">
        <h4 :class="styles.formSection">주취자</h4>
        <InfoTable :columns="1">
          <InfoField label="성명" for="pmpub0409-name">
            <InputField2
              id="pmpub0409-name"
              v-model="detail.name"
              size="sm"
              class="!space-y-0 flex-1"
            />
            <span v-if="detail.name" :class="styles.maskHint">표시: {{ maskName(detail.name) }}</span>
          </InfoField>

          <InfoField label="성별">
            <RadioGroup v-model="detail.gender" :class="infoStyles['info-table-radio']">
              <RadioGroupItem value="male" label="남" />
              <RadioGroupItem value="female" label="여" />
            </RadioGroup>
          </InfoField>

          <InfoField label="연령대" for="pmpub0409-age">
            <SelectField
              id="pmpub0409-age"
              v-model="detail.ageGroup"
              :options="ageGroupOptions"
              size="sm"
              triggerClass="w-32"
              class="!space-y-0"
              placeholder="선택"
            />
          </InfoField>

          <InfoField label="증상">
            <RadioGroup v-model="detail.symptom" :class="infoStyles['info-table-radio']">
              <RadioGroupItem
                v-for="opt in symptomOptions"
                :key="opt.value"
                :value="opt.value"
                :label="opt.label"
              />
            </RadioGroup>
          </InfoField>

          <InfoField label="입소일시">
            <DatePicker v-model="detail.admitDate" size="sm" inputClass="w-40" />
            <SelectField
              v-model="detail.admitHour"
              :options="hourOptions"
              size="sm"
              triggerClass="w-20"
              class="!space-y-0"
              placeholder="시"
            />
            <span :class="styles.unit">시</span>
            <SelectField
              v-model="detail.admitMinute"
              :options="minuteOptions"
              size="sm"
              triggerClass="w-20"
              class="!space-y-0"
              placeholder="분"
            />
            <span :class="styles.unit">분</span>
          </InfoField>

          <InfoField label="퇴소일시">
            <DatePicker v-model="detail.leaveDate" size="sm" inputClass="w-40" />
            <SelectField
              v-model="detail.leaveHour"
              :options="hourOptions"
              size="sm"
              triggerClass="w-20"
              class="!space-y-0"
              placeholder="시"
            />
            <span :class="styles.unit">시</span>
            <SelectField
              v-model="detail.leaveMinute"
              :options="minuteOptions"
              size="sm"
              triggerClass="w-20"
              class="!space-y-0"
              placeholder="분"
            />
            <span :class="styles.unit">분</span>
          </InfoField>

          <InfoField label="접수경로" layout="column">
            <RadioGroup v-model="detail.receiptRoute" :class="infoStyles['info-table-radio']">
              <RadioGroupItem
                v-for="opt in receiptRouteOptions"
                :key="opt.value"
                :value="opt.value"
                :label="opt.label"
              />
            </RadioGroup>
            <div :class="styles.receiptRow">
              <label :class="styles.receiptLabel" for="pmpub0409-receipt-no">접수번호</label>
              <InputField2
                id="pmpub0409-receipt-no"
                v-model="detail.receiptNo"
                size="sm"
                class="!space-y-0"
                inputClass="w-52"
                :disabled="receiptNoDisabled"
              />
              <Button
                type="button"
                variant="tertiary2"
                size="sm"
                :disabled="receiptNoDisabled"
                @click="report112Open = true"
              >
                112신고 조회
              </Button>
              <InputField2
                v-model="detail.receiptEtc"
                size="sm"
                class="!space-y-0 flex-1"
                placeholder="기타 사유"
                :disabled="receiptEtcDisabled"
                aria-label="기타 접수경로 사유"
              />
            </div>
          </InfoField>
        </InfoTable>

        <h4 :class="styles.formSection">병상</h4>
        <InfoTable :columns="1">
          <InfoField label="총 병상">{{ detail.totalBeds }} 개</InfoField>
          <InfoField label="사용가능 병상">{{ displayAvailableBeds }} 개</InfoField>
          <InfoField label="배정">
            <Checkbox v-model="detail.assign" />
            <span :class="infoStyles['info-table-txt']">※ 체크시 병상 배정됩니다.</span>
          </InfoField>
        </InfoTable>
      </div>
    </section>
  </div>

  <EmptyStubDialog
    v-model:open="centerRegisterOpen"
    title="주취자센터 등록"
    description="주취자센터 등록 화면(PM-PUB-0411)"
  />
  <EmptyStubDialog
    v-model:open="drunkRegisterOpen"
    title="주취자등록 & 병상배정 등록"
    description="주취자등록 & 병상배정 등록 화면(PC-PUB-0410)"
  />
  <EmptyStubDialog
    v-model:open="report112Open"
    title="112신고 조회"
    description="112신고 조회 화면(PM-COM-0501)"
  />
</template>
