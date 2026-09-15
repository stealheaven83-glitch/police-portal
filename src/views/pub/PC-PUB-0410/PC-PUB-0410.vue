<template>
  <PageHeader>
    <template #left>
      <PageTitle title="주취자 센터 병상 현황" />
    </template>
    <template #right>
      <span class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </span>
    </template>
  </PageHeader>

  <SearchWrapper no-background>
    <template #form>
      <div class="search-area">
        <SelectField
          v-model="searchRegion"
          label="지역"
          :options="regionOptions"
          size="sm"
          trigger-class="w-40"
        />
        <SelectField
          v-model="searchCenter"
          label="센터명"
          :options="centerOptions"
          size="sm"
          trigger-class="w-40"
        />
      </div>
    </template>
  </SearchWrapper>

  <!-- 좌측 목록은 PM-PUB-0409 와 같은 목록이다. 우측만 등록 폼으로 바뀐다 -->
  <LayoutSplit :count="2" :widths="[53, 47]" :min-widths-px="['auto', 380]">
    <template #layout-1>
      <LayoutPanel title="주취자센터병상현황">
        <TabulatorGrid
          class="flex-1"
          :columns="listColumns"
          :data="listRows"
          select-mode="single"
          height="100%"
          layout="fitDataFill"
          min-height="40rem"
          placeholder="조회된 주취자센터가 없습니다"
          show-pagination
          :items-per-page="10"
          @row-selection-changed="onRowSelectionChanged"
        />
      </LayoutPanel>
    </template>

    <template #layout-2>
      <LayoutPanel title="주취자등록 & 병상배정 등록">
        <template #actions>
          <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
        </template>

        <ScrollWrapper>
          <section class="lp-section" aria-labelledby="drunk-heading">
            <h3 id="drunk-heading" class="form-title">주취자</h3>
            <InfoTable :columns="2" size="100">
              <!-- 기획서 1: 입력한 성명은 목록조회·수정 화면에서 성을 뺀 나머지가 마스킹된다 -->
              <InfoField label="성명" for="drunk-new-name">
                <InputField2
                  id="drunk-new-name"
                  v-model="form.name"
                  size="sm"
                  class="!space-y-0 flex-1"
                />
              </InfoField>

              <InfoField label="성별">
                <RadioGroup v-model="form.gender" :class="infoStyles['info-table-radio']">
                  <RadioGroupItem value="male" label="남" />
                  <RadioGroupItem value="female" label="여" />
                </RadioGroup>
              </InfoField>

              <!-- 기획서 2: 선택범위 10대~90대 -->
              <InfoField label="연령대" for="drunk-new-age">
                <SelectField
                  id="drunk-new-age"
                  v-model="form.ageGroup"
                  :options="ageGroupOptions"
                  size="sm"
                  trigger-class="w-full"
                  class="!space-y-0 flex-1"
                  placeholder="선택"
                />
              </InfoField>

              <InfoField label="증상">
                <RadioGroup v-model="form.symptom" :class="infoStyles['info-table-radio']">
                  <RadioGroupItem
                    v-for="opt in symptomOptions"
                    :key="opt.value"
                    :value="opt.value"
                    :label="opt.label"
                  />
                </RadioGroup>
              </InfoField>

              <InfoField label="입소일시" full>
                <DatePicker v-model="form.admitDate" size="sm" input-class="w-50" />
                <!-- 셀렉트와 단위글자는 8px 묶음(group-gap2). 묶음 사이 12px 는 InfoField 값 칸이 준다 -->
                <span class="group-gap2">
                  <SelectField
                    v-model="form.admitHour"
                    :options="hourOptions"
                    size="sm"
                    trigger-class="w-20"
                    class="!space-y-0"
                    placeholder="시"
                  />
                  <span class="lp-unit-text">시</span>
                </span>
                <span class="group-gap2">
                  <SelectField
                    v-model="form.admitMinute"
                    :options="minuteOptions"
                    size="sm"
                    trigger-class="w-20"
                    class="!space-y-0"
                    placeholder="분"
                  />
                  <span class="lp-unit-text">분</span>
                </span>
              </InfoField>

              <InfoField label="퇴소일시" full>
                <DatePicker v-model="form.leaveDate" size="sm" input-class="w-50" />
                <span class="group-gap2">
                  <SelectField
                    v-model="form.leaveHour"
                    :options="hourOptions"
                    size="sm"
                    trigger-class="w-20"
                    class="!space-y-0"
                    placeholder="시"
                  />
                  <span class="lp-unit-text">시</span>
                </span>
                <span class="group-gap2">
                  <SelectField
                    v-model="form.leaveMinute"
                    :options="minuteOptions"
                    size="sm"
                    trigger-class="w-20"
                    class="!space-y-0"
                    placeholder="분"
                  />
                  <span class="lp-unit-text">분</span>
                </span>
              </InfoField>

              <InfoField label="접수경로" full layout="column">
                <RadioGroup v-model="form.receiptRoute" class="lp-choice-stack">
                  <div class="group-gap6">
                    <RadioGroupItem value="report112" label="112신고" />
                    <div class="group-gap3">
                      <label class="lp-unit-text" for="drunk-new-receipt-no">접수번호</label>
                      <InputField2
                        id="drunk-new-receipt-no"
                        v-model="form.receiptNo"
                        size="sm"
                        class="!space-y-0"
                        input-class="w-50"
                        :disabled="receiptNoDisabled"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        :disabled="receiptNoDisabled"
                      >
                        112신고 조회
                      </Button>
                    </div>
                  </div>
                  <div class="group-gap6">
                    <RadioGroupItem value="fire" label="소방" />
                    <span class="lp-choice-input">
                      <RadioGroupItem value="etc" label="기타" />
                      <InputField2
                        v-model="form.receiptEtc"
                        size="sm"
                        class="!space-y-0"
                        input-class="w-60"
                        placeholder="기타 사유"
                        :disabled="receiptEtcDisabled"
                        aria-label="기타 접수경로 사유"
                      />
                    </span>
                  </div>
                </RadioGroup>
              </InfoField>
            </InfoTable>
          </section>

          <section class="lp-section" aria-labelledby="bed-heading">
            <h3 id="bed-heading" class="form-title">병상</h3>
            <InfoTable :columns="2" :size="100">
              <InfoField label="총 병상">{{ form.totalBeds }} 개</InfoField>
              <InfoField label="사용가능 병상">{{ displayAvailableBeds }} 개</InfoField>
              <InfoField label="배정" full>
                <Checkbox v-model="form.assign" />
                <p class="form-note lp-note-dark">＊ 체크시 병상 배정됩니다.</p>
              </InfoField>
            </InfoTable>
          </section>
        </ScrollWrapper>
      </LayoutPanel>
    </template>
  </LayoutSplit>

</template>

<script setup lang="ts">
import { computed } from 'vue'

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
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import LayoutSplit from '@/components/custom/content-layout/layoutSplit.vue'
import LayoutPanel from '@/components/custom/content-layout/layoutPanel.vue'
import ScrollWrapper from '@/components/custom/ScrollWrapper.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import HelpButton from '@/components/custom/button/HelpButton.vue'

import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import { publicSafetyMenu } from '@/composable/menu/sidemenu/presets'

import {
  useCenterBedStatus,
  regionOptions,
  ageGroupOptions,
  symptomOptions,
  hourOptions,
  minuteOptions,
  centerBedColumns,
  type CenterBedRow,
} from '../PM-PUB-0409/composable/PM-PUB-0409'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

// KeepAlive 캐싱 대상 컴포넌트 이름 명시 (필수!) — useBottomTabSetup 의 componentName 과 일치해야 한다.
defineOptions({ name: 'PcPub0410' })

/** LNB 는 호출한 화면(PM-PUB-0409)과 같은 항목에 머문다 — 등록은 그 화면의 하위 동작이다 */
useSideMenuSetup({ ...publicSafetyMenu, openIndex: 4, activeChild: '주취자 센터 병상 현황' })

// 브레드크럼: 실제 라우트가 있는 항목만 path 를 준다.
const navItems = [
  { label: '홈', path: '/' },
  { label: '생활안전' },
  { label: '보호조치대응팀' },
  { label: '주취자등록&병상배정 등록' },
]

const {
  listRows,
  searchRegion,
  searchCenter,
  centerOptions,
  detail: form,
  selectRow,
  startRegister,
} = useCenterBedStatus()

/** 목록 컬럼·병상현황 셀은 PM-PUB-0409 와 같아서 composable 에 두고 가져다 쓴다 */
const listColumns: TabulatorGridColumn[] = centerBedColumns

/**
 * 목록에서 센터를 고르면 그 센터의 병상 수만 싣고 주취자 입력은 비운 채로 둔다 —
 * 이 화면은 상세 조회가 아니라 신규 등록이다(기획서 PC-PUB-0410).
 * 이벤트는 데이터가 아니라 Tabulator RowComponent 를 넘기므로 getData() 로 꺼낸다 — CLAUDE.md §5.
 */
function onRowSelectionChanged(selected: any[]) {
  const first = selected[0]
  const row: CenterBedRow | undefined =
    first && typeof first.getData === 'function' ? first.getData() : first
  selectRow(row ?? null)
  startRegister()
}

/** 기획서 3: 접수경로 = '112신고' 일 때만 접수번호 입력 + 112신고조회 버튼 활성 */
const receiptNoDisabled = computed(() => form.receiptRoute !== 'report112')
/** 접수경로 = '기타' 일 때만 기타 사유 입력 활성 */
const receiptEtcDisabled = computed(() => form.receiptRoute !== 'etc')

/** 기획서 5: 배정 체크 시 사용가능 병상 수 -1 로 표기 */
const displayAvailableBeds = computed(() =>
  Math.max(0, form.availableBeds - (form.assign ? 1 : 0)),
)


async function onSave() {
  if (!form.name.trim()) {
    await dialog.alert({ title: '필수 항목을 입력해 주세요.', btnCancel: '확인' })
    return
  }
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
}

useBottomTabSetup({
  value: 'PC-PUB-0410',
  label: '주취자등록&병상배정 등록',
  path: '/views/pub/PC-PUB-0410',
  componentName: 'PcPub0410',
  closable: true,
})
</script>
