<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { Tabs, TabsList, TabsTrigger } from '@/components/custom/tabs'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'

/**
 * 주소검색 팝업 — 전 화면 공용. `AddressInput` 의 `@search` 를 받아 화면에서 이걸 연다.
 * Figma: 8mQz91txveSEKO0ky7Ck6V / 12231:108236(도로명 찾기) · 12231:108380(GIS 찾기)
 *
 * 실제 주소 API 연동 전까지는 목업 목록에서 고르는 식으로 동작한다.
 * 고른 주소는 `@select` 로 (도로명주소, 상세주소) 순서로 넘긴다 — 상세주소만 필요 없는
 * 호출부는 첫 인자만 받으면 된다.
 */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'select', address: string, addressDetail: string): void
}>()

interface AddressRow {
  address: string
  zipCode: string
  legalCode: string
}

/** 시안의 결과 목록 — 실제 조회는 개발팀이 잇는다 */
const MOCK_ADDRESSES: AddressRow[] = Array.from({ length: 12 }, (_, index) => ({
  address: `경기도 고양시 덕양구 성사동 291-${10 + index}`,
  zipCode: '12345',
  legalCode: '2638060100',
}))

/* ── 탭 ───────────────────────────────────────────────────────────────── */
/** '법정동 찾기'는 시안이 없어 '도로명 찾기'와 같은 검색 폼을 쓴다. 'GIS 찾기'만 지도 탭이다 */
const activeTab = ref('road')
const searchTabs = [
  { value: 'road', label: '도로명 찾기' },
  { value: 'legal', label: '법정동 찾기' },
  { value: 'gis', label: 'GIS 찾기' },
]

/* ── 검색 조건 ────────────────────────────────────────────────────────── */
const sido = ref('all')
const sigungu = ref('all')
const roadName = ref('')
const mainNo = ref('')
const subNo = ref('')

/** sentinel 은 빈 문자열을 못 쓴다(CLAUDE.md §5) */
const sidoOptions = [
  { label: '선택', value: 'all' },
  { label: '서울특별시', value: 'seoul' },
  { label: '경기도', value: 'gyeonggi' },
  { label: '부산광역시', value: 'busan' },
]

const sigunguOptions = [
  { label: '선택', value: 'all' },
  { label: '고양시 덕양구', value: 'goyang-deogyang' },
  { label: '성남시 분당구', value: 'seongnam-bundang' },
]

const results = ref<AddressRow[]>([])

function onSearch() {
  const word = roadName.value.trim()
  results.value = word
    ? MOCK_ADDRESSES.filter((row) => row.address.includes(word))
    : MOCK_ADDRESSES
}

function onReset() {
  sido.value = 'all'
  sigungu.value = 'all'
  roadName.value = ''
  mainNo.value = ''
  subNo.value = ''
  results.value = []
  selectedAddress.value = null
}

/* ── 결과 목록 ────────────────────────────────────────────────────────── */
const columns: TabulatorGridColumn[] = [
  { title: '주소', field: 'address', hozAlign: 'left', widthGrow: 3 },
  { title: '우편번호', field: 'zipCode', width: 120, hozAlign: 'center' },
  { title: '법정동코드', field: 'legalCode', width: 140, hozAlign: 'center' },
]

const selectedAddress = ref<AddressRow | null>(null)
const addressDetail = ref('')

/** @row-click 은 Tabulator RowComponent 를 넘긴다 — getData() 로 꺼낸다(CLAUDE.md §5) */
function onRowClick(_event: Event, row: any) {
  const data = (typeof row?.getData === 'function' ? row.getData() : row) as AddressRow
  selectedAddress.value = data
}

/** :row-class 는 RowComponent 가 아니라 행 데이터를 넘긴다 */
function rowClass(row: AddressRow) {
  return selectedAddress.value?.address === row.address ? 'lp-grid-active-row' : undefined
}

/* ── 확정 ─────────────────────────────────────────────────────────────── */
const canSubmit = computed(() => selectedAddress.value !== null)

function onSubmit() {
  if (!selectedAddress.value) return
  emit('select', selectedAddress.value.address, addressDetail.value.trim())
  close()
}

function close() {
  emit('update:open', false)
}
</script>

<template>
  <GenericDialog2
    :open="props.open"
    title="주소 검색"
    :size="800"
    :show-close-button="true"
    @update:open="emit('update:open', $event)"
  >
    <Tabs v-model="activeTab">
      <TabsList variant="fill" tone="secondary" class="lp-segmented-tabs">
        <TabsTrigger v-for="tab in searchTabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <!-- GIS 찾기 — 지도에서 위치를 골라 주소를 채우는 탭 -->
    <template v-if="activeTab === 'gis'">
      <p class="lp-mark-note">
        <span>＊</span>
        <span>주소를 조회하고자 하는 위치에 마우스 오른쪽 버튼을 누르면 주소가 입력됩니다.</span>
      </p>
      <!-- 지도는 GIS 연동 몫이라 자리만 비워 둔다 -->
      <div class="lp-placeholder-box lp-map-slot"></div>
    </template>

    <template v-else>
      <InfoTable :columns="3" :size="80" popup>
        <InfoField for="address-search-sido" label="시도">
          <SelectField
            id="address-search-sido"
            v-model="sido"
            :options="sidoOptions"
            size="sm"
            trigger-class="w-full"
            class="!space-y-0 flex-1"
          />
        </InfoField>
        <InfoField for="address-search-sigungu" label="시군구">
          <SelectField
            id="address-search-sigungu"
            v-model="sigungu"
            :options="sigunguOptions"
            size="sm"
            trigger-class="w-full"
            class="!space-y-0 flex-1"
          />
        </InfoField>
        <InfoField for="address-search-road" label="도로명">
          <InputField2
            id="address-search-road"
            v-model="roadName"
            size="sm"
            class="!space-y-0 flex-1"
            input-class="w-full"
            @keyup.enter="onSearch"
          />
        </InfoField>

        <InfoField for="address-search-main-no" label="주번호">
          <InputField2
            id="address-search-main-no"
            v-model="mainNo"
            size="sm"
            class="!space-y-0 flex-1"
            input-class="w-full"
            @keyup.enter="onSearch"
          />
        </InfoField>
        <InfoField for="address-search-sub-no" label="부번호">
          <InputField2
            id="address-search-sub-no"
            v-model="subNo"
            size="sm"
            class="!space-y-0 flex-1"
            input-class="w-full"
            @keyup.enter="onSearch"
          />
        </InfoField>
        <!-- 라벨 없이 버튼만 들어가는 칸 -->
        <InfoField :class="infoStyles['info-table-actions']">
          <Button type="button" variant="tertiary2" size="sm" padding="12" @click="onReset">초기화</Button>
          <Button type="button" variant="secondary" size="sm" padding="12" @click="onSearch">검색</Button>
        </InfoField>
      </InfoTable>

      <TabulatorGrid
        :data="results"
        :columns="columns"
        height="26rem"
        placeholder="검색 조건을 입력해 주소를 찾아보세요."
        show-pagination
        :items-per-page="10"
        :row-class="rowClass"
        @row-click="onRowClick"
      />
    </template>

    <InfoTable :columns="1" :size="120" popup>
      <InfoField label="주소">{{ selectedAddress?.address }}</InfoField>
      <InfoField for="address-search-detail" label="상세주소">
        <InputField2
          id="address-search-detail"
          v-model="addressDetail"
          size="sm"
          class="!space-y-0 flex-1"
          input-class="w-full"
          @keyup.enter="onSubmit"
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          padding="12"
          :disabled="!canSubmit"
          @click="onSubmit"
        >
          입력
        </Button>
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="close">닫기</Button>
    </template>
  </GenericDialog2>
</template>
