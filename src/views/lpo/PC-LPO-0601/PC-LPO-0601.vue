<template>
  <PageHeader>
    <template #left>
      <PageTitle title="관내현황" />
    </template>
    <template #right>
      <div class="group-gap2">
        <Breadcrumb :items="navItems" />
        <HelpButton />
      </div>
    </template>
  </PageHeader>

  <div class="btn-wrap lp-page-toolbar">
    <div class="group-gap1">
      <span class="dept-name">부서</span>
      <DepartmentCascadeSelect v-model="department4Search" size="sm" />
    </div>
    <div class="group-gap2">
      <span class="lp-meta-nowrap">{{ modifiedInfo }}</span>
      <div class="btn-wrap-group">
        <Button type="button" variant="tertiary2" size="sm" @click="onPrint">인쇄</Button>
        <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
      </div>
    </div>
  </div>

  <ScrollWrapper>
    <!-- ── 부서정보 ─────────────────────────────────────────── -->
    <section class="lp-section" aria-labelledby="dept-info-heading">
      <h2 id="dept-info-heading" class="lp-heading-lg lp-section-title">부서정보</h2>

      <InfoTable :columns="3">
        <InfoField label="부서명">{{ department.name }}</InfoField>

        <InfoField label="개소년도" for="dept-opened-year">
          <DatePicker
            id="dept-opened-year"
            v-model="department.openedYear"
            size="sm"
            class="!space-y-0 flex-1"
            input-class="w-full"
          />
        </InfoField>

        <InfoField label="급지">
          <div class="group-gap1">
            <InputField2
              v-model="department.grade"
              label="급지"
              label-class="blind"
              size="sm"
              class="!space-y-0"
              input-class="w-[8rem]"
            />
            <InputField2
              v-model="department.quota"
              label="정원"
              label-position="left"
              size="sm"
              class="!space-y-0"
              input-class="w-[8rem]"
            />
            <span class="readonly-text lp-nowrap">경찰관 현원 {{ officerHeadcount }}명</span>
          </div>
        </InfoField>

        <InfoField label="소재지 주소" :row-span="2">
          <AddressInput
            v-model="department.address"
            v-model:detail="department.addressDetail"
            size="sm"
            @search="addressStubOpen = true"
          />
        </InfoField>

        <InfoField label="소재지" for="dept-location">
          <SelectField
            id="dept-location"
            v-model="department.location"
            :options="locationOptions"
            placeholder="선택"
            size="sm"
            class="!space-y-0 flex-1"
            trigger-class="w-full"
          />
        </InfoField>

        <InfoField label="일반전화" for="dept-general-phone">
          <InputField2
            id="dept-general-phone"
            v-model="department.generalPhone"
            size="sm"
            class="!space-y-0 flex-1"
            input-class="w-full"
          />
        </InfoField>

        <InfoField label="경비전화" for="dept-security-phone">
          <InputField2
            id="dept-security-phone"
            v-model="department.securityPhone"
            size="sm"
            class="!space-y-0 flex-1"
            input-class="w-full"
          />
        </InfoField>

        <InfoField label="경비팩스" for="dept-security-fax">
          <InputField2
            id="dept-security-fax"
            v-model="department.securityFax"
            size="sm"
            class="!space-y-0 flex-1"
            input-class="w-full"
          />
        </InfoField>
      </InfoTable>

      <InfoTable :columns="4" class="lp-table-gap">
        <InfoField label="근무형태" for="dept-work-type">
          <SelectField
            id="dept-work-type"
            v-model="department.workType"
            :options="workTypeOptions"
            placeholder="선택"
            size="sm"
            class="!space-y-0 flex-1"
            trigger-class="w-full"
          />
        </InfoField>

        <InfoField label="근무주기" for="dept-work-cycle">
          <InputField2
            id="dept-work-cycle"
            v-model="department.workCycle"
            size="sm"
            class="!space-y-0 flex-1"
            input-class="w-full"
          />
        </InfoField>

        <InfoField label="주간전종인원" for="dept-day-dedicated">
          <InputField2
            id="dept-day-dedicated"
            v-model="department.dayDedicated"
            size="sm"
            class="!space-y-0 flex-1"
            input-class="w-full"
          />
        </InfoField>

        <InfoField label="야간전종인원" for="dept-night-dedicated">
          <InputField2
            id="dept-night-dedicated"
            v-model="department.nightDedicated"
            size="sm"
            class="!space-y-0 flex-1"
            input-class="w-full"
          />
        </InfoField>
      </InfoTable>

      <InfoTable :columns="2" class="lp-table-gap">
        <InfoField label="유연 파출소 여부">
          <div class="group-gap1">
            <Checkbox v-model="department.flexibleUse" aria-label="유연 파출소 여부 사용" />
            <MultiCheckSelect
              v-model="department.flexibleOffices"
              :options="integratedOfficeOptions"
              :disabled="!department.flexibleUse"
              placeholder="통합운영 관서"
              group-label="통합운영 관서"
              size="sm"
              trigger-class="w-[16.4rem]"
              aria-label="통합운영 관서"
            />
            <span class="readonly-text lp-nowrap">지역파출소1, 지역파출소2</span>
          </div>
        </InfoField>

        <InfoField label="중심관서">
          <div class="group-gap1">
            <Checkbox v-model="department.centralUse" aria-label="중심관서 사용" />
            <MultiCheckSelect
              v-model="department.centralOffices"
              :options="integratedOfficeOptions"
              :disabled="!department.centralUse"
              placeholder="통합운영 관서"
              group-label="통합운영 관서"
              size="sm"
              trigger-class="w-[16.4rem]"
              aria-label="중심관서 통합운영 관서"
            />
            <span class="readonly-text lp-nowrap">지역파출소1, 지역파출소2</span>
          </div>
        </InfoField>

        <InfoField label="통합관리반">
          <div class="group-gap1">
            <Checkbox v-model="department.integratedTeamUse" aria-label="통합관리반 사용" />
            <MultiCheckSelect
              v-model="department.integratedTeamOffices"
              :options="integratedOfficeOptions"
              :disabled="!department.integratedTeamUse"
              placeholder="중심관서 선택"
              group-label="중심관서 선택"
              size="sm"
              trigger-class="w-[16.4rem]"
              aria-label="통합관리반 중심관서"
            />
          </div>
        </InfoField>

        <InfoField label="" />
      </InfoTable>
    </section>

    <!-- ── 관내정보 ─────────────────────────────────────────── -->
    <section class="lp-section" aria-labelledby="district-info-heading">
      <h2 id="district-info-heading" class="lp-heading-lg lp-section-title">관내정보</h2>

      <InfoTable :columns="2">
        <InfoField label="관내정보">
          <div class="lp-summary-row">
            <span class="readonly-text">{{ district.dongSummary }}</span>
            <Button type="button" variant="tertiary" size="xs" @click="dongDialogOpen = true">
              행정동 수정
            </Button>
          </div>
        </InfoField>

        <InfoField label="인구">
          <div class="group-gap1">
            <span class="readonly-text lp-nowrap">총인구 {{ district.totalPopulation }}명</span>
            <InputField2
              v-model="district.male"
              label="남자"
              label-position="left"
              size="sm"
              class="!space-y-0"
              input-class="w-[8rem]"
            />
            <InputField2
              v-model="district.female"
              label="여자"
              label-position="left"
              size="sm"
              class="!space-y-0"
              input-class="w-[8rem]"
            />
          </div>
        </InfoField>

        <InfoField label="가구" full>
          <div class="lp-field-row">
            <span class="readonly-text lp-nowrap">가구수 {{ district.households }}</span>
            <InputField2
              v-model="district.detachedHouse"
              label="단독주택수"
              label-position="left"
              size="sm"
              class="!space-y-0"
              input-class="w-[8rem]"
            />
            <InputField2
              v-model="district.rowHouse"
              label="연립주택수"
              label-position="left"
              size="sm"
              class="!space-y-0"
              input-class="w-[8rem]"
            />
            <InputField2
              v-model="district.apartment"
              label="아파트동수"
              label-position="left"
              size="sm"
              class="!space-y-0"
              input-class="w-[8rem]"
            />
            <InputField2
              v-model="district.villa"
              label="빌라동수"
              label-position="left"
              size="sm"
              class="!space-y-0"
              input-class="w-[8rem]"
            />
            <InputField2
              v-model="district.oneRoom"
              label="원룸수"
              label-position="left"
              size="sm"
              class="!space-y-0"
              input-class="w-[8rem]"
            />
            <InputField2
              v-model="district.separateHouse"
              label="벌집가수"
              label-position="left"
              size="sm"
              class="!space-y-0"
              input-class="w-[8rem]"
            />
            <InputField2
              v-model="district.entertainment"
              label="풍속업소수"
              label-position="left"
              size="sm"
              class="!space-y-0"
              input-class="w-[8rem]"
            />
          </div>
        </InfoField>

        <InfoField label="전체 관할구역" full>{{ district.wholeArea }}</InfoField>

        <InfoField label="순찰차별 관할구역" full>
          <TableWrapper
            :columns="patrolColumns"
            :items="patrolVehicles"
            class="lp-table-left"
          >
            <template #cell-vehicle="{ item }">
              <span class="readonly-text">{{ item.vehicle }}</span>
            </template>

            <template #cell-area="{ item }">
              <div class="lp-row-between">
                <span class="readonly-text">{{ item.area }}</span>
                <Button type="button" variant="tertiary" size="xs" @click="openMapDialog(item)">
                  관할구역 관리
                </Button>
              </div>
            </template>

            <template #cell-areaName="{ item }">
              <InputField2
                v-model="item.areaName"
                :label="`${item.vehicle} 순찰구역명`"
                label-class="blind"
                size="sm"
                class="!space-y-0"
                input-class="w-full"
              />
            </template>

            <template #cell-areaDetail="{ item }">
              <div class="lp-row-between">
                <template v-if="item.areaDetail">
                  <span class="readonly-text">{{ item.areaDetail }}</span>
                  <button
                    type="button"
                    class="lp-icon-btn lp-icon-btn-dark"
                    @click="openPatrolDetail(item.vehicle)"
                  >
                    <Icon name="search" :size="20" />
                    <span class="blind">{{ item.vehicle }} 순찰구역 상세 보기</span>
                  </button>
                </template>
                <Button
                  v-else
                  type="button"
                  variant="tertiary"
                  size="xs"
                  @click="openPatrolDetail(item.vehicle)"
                >
                  순찰구역 등록
                </Button>
              </div>
            </template>
          </TableWrapper>
        </InfoField>

        <InfoField label="지역특성 및 중점 추진사항" full for="district-features">
          <TextareaField
            id="district-features"
            v-model="district.features"
            :height="70"
            class="!space-y-0 flex-1"
            textarea-class="w-full"
          />
        </InfoField>
      </InfoTable>
    </section>

    <!-- ── 치안센터 ─────────────────────────────────────────── -->
    <section class="lp-section" aria-labelledby="safety-center-heading">
      <div class="section-bar">
        <h2 id="safety-center-heading">치안센터</h2>
        <div class="section-bar-actions">
          <Button type="button" variant="tertiary2" size="sm" @click="onDeleteSafetyCenters">
            선택삭제
          </Button>
          <Button type="button" variant="tertiary2" size="sm" @click="onAddSafetyCenter">추가</Button>
          <button
            type="button"
            class="lp-icon-btn lp-icon-btn-dark lp-icon-btn-32"
            :aria-expanded="safetyCenterOpen"
            aria-controls="safety-center-panel"
            @click="safetyCenterOpen = !safetyCenterOpen"
          >
            <component :is="safetyCenterOpen ? Minus : Plus" :size="20" />
            <span class="blind">치안센터 {{ safetyCenterOpen ? '접기' : '펼치기' }}</span>
          </button>
        </div>
      </div>

      <div v-show="safetyCenterOpen" id="safety-center-panel" class="grid-wrap">
        <TabulatorGrid
          ref="safetyCenterGridRef"
          v-model:data="safetyCenters"
          :columns="safetyCenterColumns"
          select-mode="checkbox"
          layout="fitDataFill"
          height="228px"
          placeholder="등록된 치안센터가 없습니다"
          @row-selection-changed="safetyCenterSelected = $event.length"
        />
      </div>
    </section>

    <!-- ── 연혁 ─────────────────────────────────────────────── -->
    <section class="lp-section" aria-labelledby="history-heading">
      <div class="section-bar">
        <h2 id="history-heading">연혁</h2>
        <div class="section-bar-actions">
          <Button type="button" variant="tertiary2" size="sm" @click="onDeleteHistories">
            선택삭제
          </Button>
          <Button type="button" variant="tertiary2" size="sm" @click="onAddHistory">추가</Button>
          <button
            type="button"
            class="lp-icon-btn lp-icon-btn-dark lp-icon-btn-32"
            :aria-expanded="historyOpen"
            aria-controls="history-panel"
            @click="historyOpen = !historyOpen"
          >
            <component :is="historyOpen ? Minus : Plus" :size="20" />
            <span class="blind">연혁 {{ historyOpen ? '접기' : '펼치기' }}</span>
          </button>
        </div>
      </div>

      <div v-show="historyOpen" id="history-panel" class="grid-wrap">
        <TabulatorGrid
          ref="historyGridRef"
          v-model:data="histories"
          :columns="historyColumns"
          select-mode="checkbox"
          height="276px"
          placeholder="등록된 연혁이 없습니다"
          @row-selection-changed="historySelected = $event.length"
        />
      </div>
    </section>
  </ScrollWrapper>

  <!-- ── 팝업 ─────────────────────────────────────────────── -->
  <PatrolAreaMapDialog
    v-model:open="mapDialogOpen"
    :vehicle="mapDialogVehicle"
    @save="onMapSave"
  />

  <JurisdictionDongDialog
    v-model:open="dongDialogOpen"
    v-model:dongs="currentDongs"
  />

  <EmptyStubDialog v-model:open="addressStubOpen" title="주소 검색" />
  <PatrolAreaDetailDialog
    v-model:open="patrolDetailStubOpen"
    :area-name="patrolDetailAreaName"
    @search-address="addressStubOpen = true"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import HelpButton from '@/components/custom/button/HelpButton.vue'
import { Button } from '@/components/custom/button'
import ScrollWrapper from '@/components/custom/ScrollWrapper.vue'
import { Checkbox } from '@/components/custom/checkbox'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import MultiCheckSelect from '@/components/custom/select/MultiCheckSelect.vue'
import AddressInput from '@/components/custom/address/AddressInput.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { Icon } from '@/components/custom/icon'
import EmptyStubDialog from '@/components/custom/dialog/EmptyStubDialog.vue'
import PatrolAreaMapDialog from './components/PatrolAreaMapDialog.vue'
import JurisdictionDongDialog from './components/JurisdictionDongDialog.vue'
import PatrolAreaDetailDialog from './components/PatrolAreaDetailDialog.vue'
import {
  useJurisdictionStatus,
  integratedOfficeOptions,
  locationOptions,
  safetyCenterTypeOptions,
  workTypeOptions,
  type PatrolVehicleRow,
} from './composable/PC-LPO-0601'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'

// KeepAlive 캐싱 대상 컴포넌트 이름 — useBottomTabSetup 의 componentName 과 일치해야 한다.
defineOptions({ name: 'PcLpo0601' })

// '관내현황' 은 children 이 없는 최상위 항목이라 자기 인덱스(4)와 자기 이름을 준다(CLAUDE.md §5)
useSideMenuSetup({ ...localPoliceMenu, openIndex: 4, activeChild: '관내현황' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '관내현황' },
]

const department4Search = ref<DepartmentValue>({ level1: 'hq', level2: 'all', level3: 'all' })

const {
  department,
  officerHeadcount,
  district,
  patrolVehicles,
  safetyCenters,
  histories,
  currentDongs,
  createSafetyCenter,
  createHistory,
} = useJurisdictionStatus()

/** 시안의 "수정일 : 2024-09-01 [홍길동]" — 조회 전용 표시값 */
const modifiedInfo = '수정일 : 2024-09-01 [홍길동]'

/* ── 순찰차별 관할구역 표 ─────────────────────────────────────── */

const patrolColumns = [
  { key: 'vehicle', label: '순찰차', width: '20rem' },
  { key: 'area', label: '관할구역' },
  { key: 'areaName', label: '순찰구역명', width: '20rem' },
  { key: 'areaDetail', label: '순찰구역상세' },
]

const mapDialogOpen = ref(false)
const mapDialogVehicle = ref('')

function openMapDialog(row: PatrolVehicleRow) {
  mapDialogVehicle.value = row.vehicle
  mapDialogOpen.value = true
}

function onMapSave(payload: { vehicle: string; memo: string }) {
  // 지도에서 그린 구역은 개발팀이 채운다 — 화면에서는 메모만 반영해 둔다
  patrolVehicles.value = patrolVehicles.value.map((row) =>
    row.vehicle === payload.vehicle ? { ...row, area: payload.memo || row.area } : row,
  )
}

/** 순찰구역 상세(PC-LPO-0604)는 Figma 미제공 — 자리만 잡아 둔다 */
const patrolDetailStubOpen = ref(false)
/** 순찰구역 상세 팝업(PC-LPO-0604)이 보고 있는 순찰차 이름 */
const patrolDetailAreaName = ref('')
function openPatrolDetail(vehicle: string) {
  patrolDetailAreaName.value = vehicle
  patrolDetailStubOpen.value = true
}

/* ── 관할행정동 검색 팝업 ─────────────────────────────────────── */

const dongDialogOpen = ref(false)

/** 주소검색 팝업은 저장소에 아직 없다 — 스텁으로 자리만 잡는다 */
const addressStubOpen = ref(false)

/* ── 치안센터 ────────────────────────────────────────────────── */

const safetyCenterOpen = ref(true)
const safetyCenterGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const safetyCenterSelected = ref(0)

const safetyCenterColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '센터명', field: 'name', cellType: 'input' },
  { title: '주소', field: 'address', cellType: 'input' },
  { title: '전화번호', field: 'phone', cellType: 'input' },
  {
    title: '유형',
    field: 'type',
    cellType: 'select',
    selectOptions: safetyCenterTypeOptions,
    selectPlaceholder: '선택',
    width: 136,
  },
  { title: '상주여부', field: 'resident', cellType: 'checkbox', hozAlign: 'center', width: 92 },
  { title: '오지여부', field: 'remote', cellType: 'checkbox', hozAlign: 'center', width: 92 },
  { title: '도서지역여부', field: 'island', cellType: 'checkbox', hozAlign: 'center', width: 92 },
  { title: '배치인원', field: 'headcount', cellType: 'input', width: 80 },
  { title: '근무시작시간', field: 'startTime', cellType: 'input', width: 100 },
  { title: '근무종료시간', field: 'endTime', cellType: 'input', width: 100 },
  { title: '개소일자', field: 'openedAt', cellType: 'input' },
  { title: '폐소일자', field: 'closedAt', cellType: 'input' },
]

async function onAddSafetyCenter() {
  await safetyCenterGridRef.value?.addRow(createSafetyCenter(), true)
}

function onDeleteSafetyCenters() {
  if (!safetyCenterSelected.value) {
    toast.warning('삭제할 치안센터를 선택해 주세요.')
    return
  }
  safetyCenterGridRef.value?.deleteSelected()
  toast.success('삭제되었습니다.')
}

/* ── 연혁 ────────────────────────────────────────────────────── */

const historyOpen = ref(true)
const historyGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const historySelected = ref(0)

const historyColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '연혁일자', field: 'date', cellType: 'date', width: 180 },
  { title: '내용', field: 'content', cellType: 'input' },
  { title: '근거', field: 'basis', cellType: 'input' },
  { title: '비고', field: 'note', cellType: 'input' },
  { title: '수정자', field: 'updater', width: 120, hozAlign: 'center' },
]

async function onAddHistory() {
  await historyGridRef.value?.addRow(createHistory(), true)
}

function onDeleteHistories() {
  if (!historySelected.value) {
    toast.warning('삭제할 연혁을 선택해 주세요.')
    return
  }
  historyGridRef.value?.deleteSelected()
  toast.success('삭제되었습니다.')
}

/* ── 상단 액션 ───────────────────────────────────────────────── */

function onPrint() {
  window.print()
}

function onSave() {
  if (!department.name.trim()) {
    toast.warning('필수 항목을 입력해 주세요.')
    return
  }
  toast.success('저장되었습니다.')
}

useBottomTabSetup({
  value: 'PC-LPO-0601',
  label: '관내현황',
  path: '/views/lpo/PC-LPO-0601',
  componentName: 'PcLpo0601',
  closable: true,
})
</script>
