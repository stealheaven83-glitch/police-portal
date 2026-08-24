<script setup lang="ts">
import { reactive } from 'vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { Checkbox } from '@/components/custom/checkbox'
import { Button } from '@/components/custom/button'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import styles from '@/components/custom/info-table/InfoTable.module.css'

const form = reactive({
  vehicleType: 'patrol',
  plateNumber: '12가 3456',
  managementName: '순찰1호',
  carType: 'sedan',
  location: 'hq',
  manufacturer: '현대',
  useYn: 'use',
  tempVehicle: '',
  note: '',
  regDate: '2026-08-24',
  startDate: '2026-08-01',
  endDate: '2026-08-24',
})

const carTypeOptions = [
  { label: '승용', value: 'sedan' },
  { label: '승합', value: 'van' },
  { label: 'SUV', value: 'suv' },
]

const locationOptions = [
  { label: '본청', value: 'hq' },
  { label: '부산청', value: 'busan' },
  { label: '사상서', value: 'sasang' },
]
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg  flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Info Table</h1>
          <p class="text-muted-foreground text-sm mt-1">
            등록/상세 화면에서 반복되는 "라벨-값" 정보 표 컴포넌트 샘플입니다.
            레이아웃은 <code>InfoTable</code> 이 잡고, 실제 필드는 <code>InfoField</code> 로 채웁니다.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-8 animate-in fade-in duration-500 scrollbar-hide">
        <!-- 2단(기본) -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Default (columns=2)</h2>
          <p class="text-muted-foreground text-sm">
            전체 폭 페이지/모달의 기본값. 한 행에 라벨+값 쌍이 두 개씩 자동 배치됩니다.
          </p>
          <InfoTable :columns="2">
            <InfoField for="it-mgmt-name" label="장비관리명">
              <InputField2 id="it-mgmt-name" v-model="form.managementName" size="sm" class="!space-y-0 flex-1" />
            </InfoField>
            <InfoField for="it-car-type" label="차량유형">
              <SelectField
                id="it-car-type"
                v-model="form.carType"
                :options="carTypeOptions"
                size="sm"
                trigger-class="w-full"
                class="!space-y-0 flex-1"
                placeholder="선택"
              />
            </InfoField>
            <InfoField for="it-location" label="배치장소">
              <SelectField
                id="it-location"
                v-model="form.location"
                :options="locationOptions"
                size="sm"
                trigger-class="w-full"
                class="!space-y-0 flex-1"
                placeholder="선택"
              />
            </InfoField>
            <InfoField for="it-manufacturer" label="차량제조사">
              <InputField2 id="it-manufacturer" v-model="form.manufacturer" size="sm" class="!space-y-0 flex-1" />
            </InfoField>
          </InfoTable>
        </section>

        <!-- 1단 -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">columns=1</h2>
          <p class="text-muted-foreground text-sm">
            2단 레이아웃의 한쪽 패널처럼 폭이 좁은 영역에서는 1단으로 둡니다.
            2단으로 두면 값 영역이 너무 좁아져 내용이 겹칩니다.
          </p>
          <div class="max-w-[46rem]">
            <InfoTable :columns="1">
              <InfoField for="it-narrow-name" label="장비관리명">
                <InputField2 id="it-narrow-name" v-model="form.managementName" size="sm" class="!space-y-0 flex-1" />
              </InfoField>
              <InfoField for="it-narrow-plate" label="차량번호">
                <InputField2 id="it-narrow-plate" v-model="form.plateNumber" size="sm" class="!space-y-0 flex-1" />
              </InfoField>
            </InfoTable>
          </div>
        </section>

        <!-- full / layout -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">full · layout="column"</h2>
          <p class="text-muted-foreground text-sm">
            <code>full</code> 은 한 행 전체를 차지하고, <code>layout="column"</code> 은 값 영역을 세로로 쌓아
            textarea 처럼 높이가 있는 컨트롤에 씁니다.
          </p>
          <InfoTable :columns="2">
            <InfoField for="it-full-plate" label="차량번호" full>
              <InputField2 id="it-full-plate" v-model="form.plateNumber" size="sm" class="!space-y-0 flex-1" />
            </InfoField>
            <InfoField label="비고" full layout="column">
              <TextareaField
                v-model="form.note"
                class="w-full !space-y-0"
                textarea-class="w-full"
                :height="90"
                placeholder="특이사항을 입력하세요."
              />
            </InfoField>
          </InfoTable>
        </section>

        <!-- 라벨 슬롯 -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">라벨 슬롯 (필수 표시)</h2>
          <p class="text-muted-foreground text-sm">
            <code>#label</code> 슬롯으로 라벨에 필수 표시나 아이콘을 덧붙입니다.
            필수 표시 점은 InfoTable.module.css 의 <code>.requiredDot</code> 클래스를 그대로 씁니다.
          </p>
          <p class="flex items-center gap-1 text-[1.3rem] text-[var(--Base--point,#d32f2f)]"><span :class="styles.requiredDot" /> 필수 입력 항목</p>
          <InfoTable :columns="2">
            <InfoField for="it-req-name">
              <template #label>
                장비관리명<span :class="styles.requiredDot" />
              </template>
              <InputField2 id="it-req-name" v-model="form.managementName" size="sm" class="!space-y-0 flex-1" />
            </InfoField>
            <InfoField for="it-req-plate">
              <template #label>
                차량번호<span :class="styles.requiredDot" />
              </template>
              <InputField2 id="it-req-plate" v-model="form.plateNumber" size="sm" class="!space-y-0 flex-1" />
            </InfoField>
          </InfoTable>
        </section>

        <!-- 값 영역에 컨트롤 여러 개 -->
        <section class="space-y-4 pb-6">
          <h2 class="text-xl font-semibold border-b pb-2">값 영역에 컨트롤 여러 개</h2>
          <p class="text-muted-foreground text-sm">
            라디오 그룹, 입력+버튼 조합처럼 컨트롤이 여러 개면 <code>for</code> 를 생략합니다.
            이때 라벨은 <code>span</code> 으로, 값 영역은 <code>role="group"</code> 으로 묶여 접근성이 유지됩니다.
          </p>
          <InfoTable :columns="2">
            <InfoField label="기동장비 구분" full>
              <RadioGroup v-model="form.vehicleType" :class="styles['info-table-radio']">
                <RadioGroupItem value="patrol" label="순찰차" />
                <RadioGroupItem value="motorcycle" label="오토바이" />
                <RadioGroupItem value="bicycle" label="자전거" />
              </RadioGroup>
            </InfoField>

            <InfoField label="임시차량" full>
              <div class="flex w-full items-center gap-2">
                <InputField2 v-model="form.tempVehicle" size="sm" class="!space-y-0 flex-1" readonly />
                <Button type="button" variant="secondary" size="sm">차량조회</Button>
              </div>
            </InfoField>

            <InfoField label="사용여부">
              <Checkbox label="사용" :default-value="true" />
            </InfoField>
            <InfoField label="수정일자">
              2026-08-24
            </InfoField>
          </InfoTable>
        </section>

        <!-- DatePicker -->
        <section class="space-y-4 pb-6">
          <h2 class="text-xl font-semibold border-b pb-2">DatePicker</h2>
          <p class="text-muted-foreground text-sm">
            달력은 팝업이 값 영역 밖으로 열려야 하므로 폭을 <code>inputClass</code> 로 고정하고,
            기간은 DatePicker 두 개를 <code>~</code> 로 잇습니다.
          </p>
          <InfoTable :columns="2">
            <InfoField for="it-reg-date" label="등록일자">
              <DatePicker
                id="it-reg-date"
                v-model="form.regDate"
                size="sm"
                class="!space-y-0 flex-1"
                input-class="w-[16rem]"
              />
            </InfoField>
            <InfoField for="it-disabled-date" label="처리일자">
              <DatePicker
                id="it-disabled-date"
                v-model="form.regDate"
                size="sm"
                class="!space-y-0"
                input-class="w-[16rem]"
                disabled
              />
            </InfoField>

            <InfoField label="조회기간" full>
              <DatePicker v-model="form.startDate" size="sm" class="!space-y-0" input-class="w-[16rem]" />
              <span>~</span>
              <DatePicker v-model="form.endDate" size="sm" class="!space-y-0" input-class="w-[16rem]" />
            </InfoField>
          </InfoTable>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
