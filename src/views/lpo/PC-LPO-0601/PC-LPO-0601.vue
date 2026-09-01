<script setup lang="ts">
import { ref } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import PageHeader from '@/components/custom/title/PageHeader.vue'
import PageTitle from '@/components/custom/title/PageTitle.vue'
import Breadcrumb from '@/components/custom/breadcrumb/Breadcrumb.vue'
import SearchWrapper from '@/components/custom/search/SearchWrapper.vue'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import Stepper from '@/components/custom/input/Stepper.vue'
import MultiCheckSelect from '@/components/custom/select/MultiCheckSelect.vue'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import AddressSearchDialog from './components/AddressSearchDialog.vue'
import DongEditDialog from './components/DongEditDialog.vue'
import PatrolAreaDialog from './components/PatrolAreaDialog.vue'
import DistrictMapDialog from './components/DistrictMapDialog.vue'
import {
  useLocalStatus,
  departmentTree,
  siteOptions,
  workTypeOptions,
  integratedStationOptions,
  integratedManageOptions,
  centerTypeOptions,
  createEmptyCenter,
  createEmptyHistory,
  type PatrolAreaRow,
} from './composable/PC-LPO-0601'
import { useSideMenuSetup } from '@/composable/menu/useSideMenuSetup'
import { localPoliceMenu } from '@/composable/menu/sidemenu/presets'
import { useBottomTabSetup } from '@/composable/tab/useBottomTabSetup'
import styles from './style/PC-LPO-0601.module.css'

// KeepAlive 캐싱 대상 — useBottomTabSetup 의 componentName 과 정확히 일치해야 한다(§5).
defineOptions({ name: 'PcLpo0601' })

// 관내현황은 지역경찰 LNB 의 자식 없는 1뎁스 항목(index 4). 인사관리(0801)와 같은 방식으로 활성표시.
useSideMenuSetup({ ...localPoliceMenu, openIndex: 4, activeChild: '관내현황' })

const navItems = [
  { label: '홈', path: '/' },
  { label: '지역경찰' },
  { label: '관내현황' },
]

const { meta, department, deptForm, localInfo, patrolAreas, centers, histories } = useLocalStatus()

/* ---------------------------------------------------------------- 저장 / 인쇄 */
function onSave() {
  // 기획서 2 — 빈값 체크 후 컨펌창[A01]. 필수값은 센터명(19-1)·연혁 내용(23-1) 등.
  if (!deptForm.capacity.trim()) {
    toast.warning('정원을 입력해 주세요.')
    return
  }
  // 저장 로직은 개발팀 범위(폴넷/공공데이터 연동). 저장 성공 시 수정일 갱신.
  meta.updatedAt = new Date().toISOString().slice(0, 10)
  toast.success('저장되었습니다.')
}

function onPrint() {
  // 기획서 3 — 레포팅툴 팝업. 퍼블 범위 밖이라 안내만.
  toast.info('인쇄(레포팅툴)는 준비 중입니다.')
}

/* ---------------------------------------------------------------- 팝업 상태 */
const addressOpen = ref(false)
const dongOpen = ref(false)
const patrolOpen = ref(false)
const patrolTarget = ref('')
const mapOpen = ref(false)
const mapMode = ref<'edit' | 'view'>('edit')

function openPatrolDetail(row: PatrolAreaRow) {
  patrolTarget.value = row.vehicle
  patrolOpen.value = true
}
function openMap(mode: 'edit' | 'view') {
  mapMode.value = mode
  mapOpen.value = true
}

/* ---------------------------------------------------------------- 치안센터 그리드 */
const centersExpanded = ref(true)
const centerGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const centerSelectedCount = ref(0)

const centerColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 70, hozAlign: 'center' },
  { title: '센터명', field: 'name', cellType: 'input', widthGrow: 2 },
  { title: '주소', field: 'address', cellType: 'input', widthGrow: 2 },
  { title: '전화번호', field: 'phone', cellType: 'input', widthGrow: 1 },
  { title: '유형', field: 'type', cellType: 'select', selectOptions: centerTypeOptions, width: 120, hozAlign: 'center' },
  { title: '상주여부', field: 'resident', cellType: 'checkbox', width: 90, hozAlign: 'center' },
  { title: '오지여부', field: 'remote', cellType: 'checkbox', width: 90, hozAlign: 'center' },
  { title: '도서지역여부', field: 'island', cellType: 'checkbox', width: 110, hozAlign: 'center' },
  { title: '배치인원', field: 'headcount', cellType: 'input', width: 90, hozAlign: 'center' },
  { title: '근무시작시간', field: 'workStart', cellType: 'input', width: 120, hozAlign: 'center' },
  { title: '근무종료시간', field: 'workEnd', cellType: 'input', width: 120, hozAlign: 'center' },
  { title: '개소일자', field: 'openDate', cellType: 'date', width: 130, hozAlign: 'center' },
  { title: '폐소일자', field: 'closeDate', cellType: 'date', width: 130, hozAlign: 'center' },
]

async function onCenterAdd() {
  // 추가는 시안대로 맨 위 행(기획서 19 — 가로 행 전체 추가)
  await centerGridRef.value?.addRow(createEmptyCenter(), true)
}
function onCenterDelete() {
  if (!centerSelectedCount.value) {
    toast.warning('삭제할 치안센터를 선택해 주세요.') // 기획서 20 — 알림창[A11]
    return
  }
  centerGridRef.value?.deleteSelected()
  toast.success('삭제되었습니다.')
}

/* ---------------------------------------------------------------- 연혁 그리드 */
const historyExpanded = ref(true)
const historyGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const historySelectedCount = ref(0)

const historyColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'id', width: 70, hozAlign: 'center' },
  { title: '연혁일자', field: 'date', cellType: 'date', width: 150, hozAlign: 'center' },
  { title: '내용', field: 'content', cellType: 'input', widthGrow: 3 },
  { title: '근거', field: 'basis', cellType: 'input', widthGrow: 2 },
  { title: '비고', field: 'note', cellType: 'input', widthGrow: 2 },
  { title: '수정자', field: 'updater', width: 110, hozAlign: 'center' },
]

async function onHistoryAdd() {
  await historyGridRef.value?.addRow(createEmptyHistory(), true)
}
function onHistoryDelete() {
  if (!historySelectedCount.value) {
    toast.warning('삭제할 연혁을 선택해 주세요.') // 기획서 24 — 알림창[A12]
    return
  }
  historyGridRef.value?.deleteSelected()
  toast.success('삭제되었습니다.')
}

useBottomTabSetup({
  value: 'PC-LPO-0601',
  label: '관내현황',
  path: '/views/lpo/PC-LPO-0601',
  componentName: 'PcLpo0601',
  closable: true,
})
</script>

<template>
  <PageHeader>
    <template #left>
      <PageTitle title="관내현황" />
    </template>
    <template #right>
      <Breadcrumb :items="navItems" />
    </template>
  </PageHeader>

  <SearchWrapper>
    <template #form>
      <div class="group-gap2">
        <span class="dept-name">부서</span>
        <DepartmentCascadeSelect v-model="department" :tree="departmentTree" size="sm" />
      </div>
    </template>
    <template #btns>
      <div :class="styles.toolbarBtns">
        <span :class="styles.editMeta">수정일 : {{ meta.updatedAt }} [{{ meta.updatedBy }}]</span>
        <Button type="button" variant="tertiary2" size="sm" @click="onPrint">인쇄</Button>
        <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
      </div>
    </template>
  </SearchWrapper>

  <!-- ================================================= 부서정보 -->
  <h3 class="form-section-title">부서정보</h3>
  <InfoTable :columns="2">
    <InfoField label="부서명">{{ meta.departmentName }}</InfoField>
    <InfoField label="개소년도" for="kn-open-year">
      <DatePicker id="kn-open-year" v-model="deptForm.openYear" size="sm" class="flex-1" />
    </InfoField>

    <InfoField label="급지">
      <Stepper v-model="deptForm.grade" :min="1" :max="9" label="급지" class="w-32" />
    </InfoField>
    <InfoField label="정원" for="kn-capacity">
      <InputField2
        id="kn-capacity"
        v-model="deptForm.capacity"
        size="sm"
        inputmode="numeric"
        input-class="w-24 text-right"
        class="!space-y-0"
      />
      <span :class="infoStyles['info-table-txt']">경찰관 현원 {{ meta.officerCount }}명</span>
    </InfoField>

    <InfoField label="소재지 주소" full layout="column">
      <div class="group-gap2 w-full">
        <InputField2
          v-model="deptForm.addressSearch"
          size="sm"
          placeholder="주소검색"
          readonly
          class="!space-y-0 flex-1 min-w-64"
        />
        <Button type="button" variant="tertiary2" size="sm" @click="addressOpen = true">주소검색</Button>
      </div>
      <InputField2
        v-model="deptForm.addressDetail"
        size="sm"
        placeholder="상세주소"
        class="!space-y-0 w-full"
      />
    </InfoField>

    <InfoField label="소재지" for="kn-site">
      <SelectField
        id="kn-site"
        v-model="deptForm.site"
        :options="siteOptions"
        size="sm"
        trigger-class="w-full"
        class="!space-y-0 flex-1"
      />
    </InfoField>
    <InfoField label="일반전화" for="kn-general-phone">
      <InputField2 id="kn-general-phone" v-model="deptForm.generalPhone" size="sm" placeholder="000-0000-0000" class="!space-y-0 flex-1" />
    </InfoField>

    <InfoField label="경비전화" for="kn-guard-phone">
      <InputField2 id="kn-guard-phone" v-model="deptForm.guardPhone" size="sm" placeholder="000-0000-0000" class="!space-y-0 flex-1" />
    </InfoField>
    <InfoField label="경비팩스" for="kn-guard-fax">
      <InputField2 id="kn-guard-fax" v-model="deptForm.guardFax" size="sm" placeholder="000-0000-0000" class="!space-y-0 flex-1" />
    </InfoField>

    <InfoField label="근무형태" for="kn-work-type">
      <SelectField
        id="kn-work-type"
        v-model="deptForm.workType"
        :options="workTypeOptions"
        size="sm"
        trigger-class="w-full"
        class="!space-y-0 flex-1"
      />
    </InfoField>
    <InfoField label="근무주기" for="kn-work-cycle">
      <InputField2 id="kn-work-cycle" v-model="deptForm.workCycle" size="sm" class="!space-y-0 flex-1" />
    </InfoField>

    <InfoField label="주간전종인원" for="kn-day-count">
      <InputField2 id="kn-day-count" v-model="deptForm.dayExclusiveCount" size="sm" inputmode="numeric" input-class="text-right" class="!space-y-0 flex-1" />
    </InfoField>
    <InfoField label="야간전종인원" for="kn-night-count">
      <InputField2 id="kn-night-count" v-model="deptForm.nightExclusiveCount" size="sm" inputmode="numeric" input-class="text-right" class="!space-y-0 flex-1" />
    </InfoField>

    <InfoField label="유연 파출소 여부" full>
      <div :class="styles.stationRow">
        <Checkbox v-model="deptForm.flexibleEnabled" label="사용" :disabled="deptForm.centralEnabled" />
        <MultiCheckSelect
          v-model="deptForm.flexibleStations"
          :options="integratedStationOptions"
          :disabled="!deptForm.flexibleEnabled"
          group-label="통합운영 관서"
          placeholder="통합운영 관서"
          :trigger-class="styles.selectSm"
        />
        <span :class="styles.stationPicked">
          {{ integratedStationOptions.filter(o => deptForm.flexibleStations.includes(o.value)).map(o => o.label).join(', ') || '-' }}
        </span>
      </div>
    </InfoField>

    <InfoField label="중심관서" full>
      <div :class="styles.stationRow">
        <Checkbox v-model="deptForm.centralEnabled" label="사용" :disabled="deptForm.flexibleEnabled" />
        <MultiCheckSelect
          v-model="deptForm.centralStations"
          :options="integratedStationOptions"
          :disabled="!deptForm.centralEnabled"
          group-label="통합운영 관서"
          placeholder="통합운영 관서"
          :trigger-class="styles.selectSm"
        />
        <span :class="styles.stationPicked">
          {{ integratedStationOptions.filter(o => deptForm.centralStations.includes(o.value)).map(o => o.label).join(', ') || '-' }}
        </span>
      </div>
    </InfoField>

    <InfoField label="통합관리반" full>
      <div :class="styles.stationRow">
        <Checkbox v-model="deptForm.integratedManageEnabled" label="사용" />
        <SelectField
          v-model="deptForm.integratedManage"
          :options="integratedManageOptions"
          size="sm"
          :trigger-class="styles.selectSm"
          class="!space-y-0"
          :disabled="!deptForm.integratedManageEnabled"
        />
      </div>
    </InfoField>
  </InfoTable>

  <!-- ================================================= 관내정보 -->
  <h3 class="form-section-title">
    관내정보
    <Button type="button" variant="tertiary2" size="sm" @click="dongOpen = true">행정동 수정</Button>
  </h3>
  <InfoTable :columns="2">
    <InfoField label="관할행정동" full>
      <span :class="infoStyles['info-table-txt']">
        {{ localInfo.dongCount }}개 ({{ localInfo.dongNames }}) &nbsp;/&nbsp; 면적 {{ localInfo.area }} k㎡
      </span>
    </InfoField>

    <InfoField label="인구" full>
      <div :class="styles.metricRow">
        <span :class="infoStyles['info-table-txt']">총인구 {{ localInfo.totalPopulation }}명</span>
        <span :class="styles.metric">
          <label for="kn-male">남자</label>
          <InputField2 id="kn-male" v-model="localInfo.male" size="sm" inputmode="numeric" input-class="text-right" class="!space-y-0" :class="styles.metricInput" />
        </span>
        <span :class="styles.metric">
          <label for="kn-female">여자</label>
          <InputField2 id="kn-female" v-model="localInfo.female" size="sm" inputmode="numeric" input-class="text-right" class="!space-y-0" :class="styles.metricInput" />
        </span>
      </div>
    </InfoField>

    <InfoField label="가구" full>
      <div :class="styles.metricRow">
        <span :class="styles.metric">
          <label for="kn-households">가구수</label>
          <InputField2 id="kn-households" v-model="localInfo.households" size="sm" input-class="text-right" class="!space-y-0" :class="styles.metricInput" />
        </span>
        <span :class="styles.metric">
          <label for="kn-detached">단독주택수</label>
          <InputField2 id="kn-detached" v-model="localInfo.detachedHouse" size="sm" input-class="text-right" class="!space-y-0" :class="styles.metricInput" />
        </span>
        <span :class="styles.metric">
          <label for="kn-row">연립주택수</label>
          <InputField2 id="kn-row" v-model="localInfo.rowHouse" size="sm" input-class="text-right" class="!space-y-0" :class="styles.metricInput" />
        </span>
        <span :class="styles.metric">
          <label for="kn-apt">아파트동수</label>
          <InputField2 id="kn-apt" v-model="localInfo.apartmentDong" size="sm" input-class="text-right" class="!space-y-0" :class="styles.metricInput" />
        </span>
        <span :class="styles.metric">
          <label for="kn-villa">빌라동수</label>
          <InputField2 id="kn-villa" v-model="localInfo.villaDong" size="sm" input-class="text-right" class="!space-y-0" :class="styles.metricInput" />
        </span>
        <span :class="styles.metric">
          <label for="kn-oneroom">원룸수</label>
          <InputField2 id="kn-oneroom" v-model="localInfo.oneRoom" size="sm" input-class="text-right" class="!space-y-0" :class="styles.metricInput" />
        </span>
        <span :class="styles.metric">
          <label for="kn-beehive">벌집가수</label>
          <InputField2 id="kn-beehive" v-model="localInfo.beehiveHouse" size="sm" input-class="text-right" class="!space-y-0" :class="styles.metricInput" />
        </span>
        <span :class="styles.metric">
          <label for="kn-entertain">풍속업소수</label>
          <InputField2 id="kn-entertain" v-model="localInfo.entertainmentBiz" size="sm" input-class="text-right" class="!space-y-0" :class="styles.metricInput" />
        </span>
      </div>
    </InfoField>

    <InfoField label="전체 관할구역" full layout="column">
      <span :class="infoStyles['info-table-txt']">{{ localInfo.fullDistrict }}</span>
    </InfoField>

    <InfoField label="순찰차별 관할구역" full layout="column">
      <div :class="styles.patrolTableWrap">
        <table :class="styles.patrolTable">
          <caption class="sr-only">순찰차별 관할구역 — 순찰차, 관할구역, 순찰구역명, 순찰구역상세. 행을 더블클릭하면 순찰구역 상세 팝업이 열립니다.</caption>
          <thead>
            <tr>
              <th scope="col">순찰차</th>
              <th scope="col">관할구역</th>
              <th scope="col">순찰구역명</th>
              <th scope="col">순찰구역상세</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in patrolAreas" :key="row.id" @dblclick="openPatrolDetail(row)">
              <td>{{ row.vehicle }}</td>
              <td>
                <div :class="styles.patrolDetailCell">
                  <span :class="styles.patrolDetailText">{{ row.district || '미등록' }}</span>
                  <Button type="button" variant="tertiary2" size="xs" @click.stop="openMap('edit')">관할구역 관리</Button>
                </div>
              </td>
              <td>
                <InputField2 v-model="row.routeName" size="sm" class="!space-y-0" input-class="text-center" placeholder="순찰구역명" @click.stop />
              </td>
              <td>
                <div :class="styles.patrolDetailCell">
                  <template v-if="row.routeDetail">
                    <span :class="styles.patrolDetailText">{{ row.routeDetail }}</span>
                    <Button type="button" variant="tertiary2" size="xs" @click.stop="openMap('view')">지도보기</Button>
                  </template>
                  <Button v-else type="button" variant="secondary" size="xs" @click.stop="openPatrolDetail(row)">순찰구역 등록</Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </InfoField>

    <InfoField label="지역특성 및 중점 추진사항" for="kn-region-feature" full layout="column">
      <TextareaField
        id="kn-region-feature"
        v-model="localInfo.regionFeature"
        class="w-full !space-y-0"
        textarea-class="w-full"
        :height="90"
      />
    </InfoField>
  </InfoTable>

  <!-- ================================================= 치안센터 -->
  <h3 class="form-section-title">
    치안센터
    <span :class="styles.gridActions">
      <Button type="button" variant="tertiary2" size="sm" @click="onCenterDelete">선택삭제</Button>
      <Button type="button" variant="secondary" size="sm" @click="onCenterAdd">추가</Button>
      <button
        type="button"
        :class="styles.collapseBtn"
        :aria-expanded="centersExpanded"
        aria-label="치안센터 영역 펼치기/닫기"
        @click="centersExpanded = !centersExpanded"
      >
        <component :is="centersExpanded ? Minus : Plus" class="size-4" />
      </button>
    </span>
  </h3>
  <div v-show="centersExpanded" :class="styles.gridWrap">
    <TabulatorGrid
      ref="centerGridRef"
      v-model:data="centers"
      :columns="centerColumns"
      select-mode="checkbox"
      layout="fitDataFill"
      height="320px"
      placeholder="등록된 치안센터가 없습니다"
      @row-selection-changed="centerSelectedCount = $event.length"
    />
  </div>

  <!-- ================================================= 연혁 -->
  <h3 class="form-section-title">
    연혁
    <span :class="styles.gridActions">
      <Button type="button" variant="tertiary2" size="sm" @click="onHistoryDelete">선택삭제</Button>
      <Button type="button" variant="secondary" size="sm" @click="onHistoryAdd">추가</Button>
      <button
        type="button"
        :class="styles.collapseBtn"
        :aria-expanded="historyExpanded"
        aria-label="연혁 영역 펼치기/닫기"
        @click="historyExpanded = !historyExpanded"
      >
        <component :is="historyExpanded ? Minus : Plus" class="size-4" />
      </button>
    </span>
  </h3>
  <div v-show="historyExpanded" :class="styles.gridWrap">
    <TabulatorGrid
      ref="historyGridRef"
      v-model:data="histories"
      :columns="historyColumns"
      select-mode="checkbox"
      layout="fitColumns"
      height="300px"
      placeholder="등록된 연혁이 없습니다"
      @row-selection-changed="historySelectedCount = $event.length"
    />
  </div>

  <AddressSearchDialog v-model:open="addressOpen" />
  <DongEditDialog v-model:open="dongOpen" />
  <PatrolAreaDialog v-model:open="patrolOpen" :vehicle="patrolTarget" />
  <DistrictMapDialog v-model:open="mapOpen" :mode="mapMode" />
</template>
