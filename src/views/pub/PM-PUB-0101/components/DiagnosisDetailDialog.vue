<template>
  <GenericDialog2
    v-model:open="detailOpen"
    title="간소화 상세"
    :size="800"
    :show-close-button="true"
  >
    <!-- ── 진단 카드 ─────────────────────────────── -->
    <div class="pop-title-sub"><h2>간이 범죄예방진단 카드({{ detailTypeLabel }})</h2></div>
    <InfoTable :columns="2" popup>
      <InfoField label="부서">{{ detailForm.dept }}</InfoField>
      <InfoField label="관리번호">{{ detailForm.managementNo }}</InfoField>
      <InfoField label="유형" for="detail-type">
        <SelectField
          id="detail-type"
          v-model="detailForm.type"
          :options="detailTypeOptions"
          size="sm"
          trigger-class="w-full"
          class="flex-1"
        />
      </InfoField>
      <InfoField label="진단일자" for="detail-date">
        <DatePicker
          id="detail-date"
          v-model="detailForm.diagnosedAt"
          size="sm"
          class="flex-1"
          input-class="w-full"
        />
      </InfoField>

      <InfoField label="현금다액업소 여부" full>
        <RadioGroup v-model="detailForm.cashIntensive" :class="infoStyles['info-table-radio']">
          <RadioGroupItem value="Y" label="여" />
          <RadioGroupItem value="N" label="부" />
        </RadioGroup>
      </InfoField>
    </InfoTable>

    <!-- ── 일반현황 ─────────────────────────────── -->
    <div class="pop-title-sub"><h2>일반현황</h2></div>

    <InfoTable :columns="2" popup>
      <InfoField label="진단사유" for="detail-reason">
        <SelectField
          id="detail-reason"
          v-model="detailForm.reason"
          :options="detailReasonOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
        />
      </InfoField>

      <InfoField label="주소" layout="column" :row-span="2">
        <InputField2
          v-model="detailForm.addressRoad"
          readonly
          size="sm"
          class="!space-y-0 w-full"
          input-class="w-full"
          label="도로명 주소"
          label-class="sr-only"
          :icon="searchIcon"
          icon-class="size-5"
          icon-label="주소 검색"
          search
          @icon-click="onAddressSearch"
        />
        <InputField2
          v-model="detailForm.addressDetail"
          size="sm"
          class="!space-y-0 w-40"
          input-class="w-full"
          placeholder="상세주소"
          label="상세 주소"
          label-class="sr-only"
        />
      </InfoField>

      <InfoField label="상호명" for="detail-bizname">
        <InputField2
          id="detail-bizname"
          v-model="detailForm.bizName"
          clearable
          size="sm"
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </InfoField>
      <InfoField label="관할동" for="detail-district" full>
        <InputField2
          id="detail-district"
          v-model="detailForm.district"
          size="sm"
          class="!space-y-0"
          input-class="w-full"
        />
      </InfoField>
    </InfoTable>

    <!-- ── 참고사항 ─────────────────────────────── -->
    <div class="pop-title-sub"><h2>참고사항</h2></div>

    <div class="pop-title-lv2"><h3>1) 범죄 특성</h3></div>
    <InfoTable :columns="2" popup>
      <InfoField v-for="stat in crimeStats" :key="stat.label" :label="stat.label" class="lp-stat-field">
        <span class="lp-stat-grade">{{ stat.grade }}</span>
        <span class="lp-stat-value">{{ stat.value }}</span>
      </InfoField>
    </InfoTable>
    <div class="pop-title-lv2"><h3>2) 인구 사회학적 특성</h3></div>
    <InfoTable :columns="2" popup>
      <InfoField v-for="stat in demographicStats" :key="stat.label" :label="stat.label" class="lp-stat-field">
        <span class="lp-stat-grade">{{ stat.grade }}</span>
        <span class="lp-stat-value">{{ stat.value }}</span>
      </InfoField>
    </InfoTable>
    
    <div class="pop-title-lv2"><h3>3) 예방 자료</h3></div>
    <!--
      시안(Figma 11047:64736) 기준. 척도가 [숫자줄 / 선택줄] 2단이고 섹션마다 표가 따로라
      라벨-값 한 줄인 InfoTable 로는 안 나온다 — 이 표만 따로 짠다.
      각 표의 첫 줄은 척도 안내(숫자만, 선택 없음)라 라디오를 두지 않는다.
    -->
    <div class="prevention-scroll">
      <div v-for="section in surveySections" :key="section.id" class="prevention-table">
        <div class="prevention-row">
          <p class="prevention-head">{{ section.title }}</p>
          <div class="prevention-scale">
            <div class="prevention-nums">
              <span v-for="score in surveyScale" :key="score" class="prevention-num">{{ score }}</span>
            </div>
            <div class="prevention-blank"></div>
          </div>
        </div>

        <div v-for="question in section.questions" :key="question.id" class="prevention-row">
          <p class="prevention-question">{{ question.text }}</p>
          <div class="prevention-scale">
            <!-- 숫자는 아래 라디오의 sr-only 라벨로도 읽히므로 여기서는 중복해 읽지 않는다 -->
            <div class="prevention-nums" aria-hidden="true">
              <span v-for="score in surveyScale" :key="score" class="prevention-num">{{ score }}</span>
            </div>
            <RadioGroup
              class="prevention-choices"
              :model-value="detailForm.survey[question.id]?.toString()"
              :aria-label="question.text"
              @update:model-value="(value) => onSurveyChange(question.id, value)"
            >
              <span v-for="score in surveyScale" :key="score" class="prevention-choice">
                <RadioGroupItem :value="String(score)" :label="`${score}점`" label-class="sr-only" />
              </span>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>


    <!-- ── 통보 · 관련의견 ───────────────────────── -->
    <div class="sub-title-between">
      <Checkbox v-model="detailForm.notify" label="간이진단 결과, 취약지역으로 판단되기에" />
      <SelectField
        v-model="detailForm.notifyDept"
        :options="notifyDeptOptions"
        :disabled="!detailForm.notify"
        size="sm"
        trigger-class="w-40"
        class="!space-y-0"
        label="통보 부서"
        label-position="top"
        label-class="sr-only"
      />
      <SelectField
        v-model="detailForm.notifyStaff"
        :options="notifyStaffOptions"
        :disabled="!detailForm.notify"
        placeholder="담당자 선택"
        size="sm"
        trigger-class="w-40"
        class="!space-y-0"
        label="통보 담당자"
        label-position="top"
        label-class="sr-only"
      />
      <span>에게 통보</span>
    </div>

    <InfoTable :columns="1" popup size="100">
      <InfoField label="관련의견" for="detail-opinion">
        <TextareaField
          id="detail-opinion"
          v-model="detailForm.opinion"
          :rows="3"
          class="!space-y-0 w-full"
        />
      </InfoField>
    </InfoTable>

    <!-- ── 112사건 등록 ─────────────────────────── -->
    <div class="pop-title-sub space-between">
      <h2>112사건 등록</h2>       
      <Button type="button" variant="secondary" size="xs" @click="addIncident">112신고 등록</Button>
    </div>
    <div class="mt-[8px]">
      <TableWrapper
        :columns="incidentColumns"
        :items="detailIncidents"
        caption="등록된 112사건 목록"
        :show-pagination="false"
        empty-title="등록된 112신고가 없습니다"
        empty-description="112신고 등록 버튼으로 사건을 추가해 주세요."
      />
    </div>
    <!-- ── 사진 ─────────────────────────────────── -->
    <ul class="lp-photo-grid">
      <li v-for="photo in detailPhotos" :key="photo.key" class="lp-photo-item">
        <span class="lp-photo-label">{{ photo.label }}</span>

        <div class="lp-photo-box">
          <img v-if="photo.url" :src="photo.url" :alt="photo.label" class="lp-photo-img" />
          <span v-else class="lp-photo-empty" aria-hidden="true">
            <img :src="photoEmptyIcon" alt="" class="lp-photo-empty-icon" />
            <img :src="photoEmptyLabel" alt="" class="lp-photo-empty-label" />
          </span>
        </div>

        <p class="lp-photo-meta">일시 {{ photo.takenAt }}</p>

        <div class="lp-photo-actions">
          <Button type="button" variant="tertiary2" size="xs" padding="12" @click="pickPhoto(photo.key)">
            사진변경
          </Button>
          <Button
            type="button"
            variant="tertiary2"
            size="xs"
            padding="12"
            :disabled="!photo.url"
            @click="removePhoto(photo.key)"
          >
            삭제
          </Button>
        </div>

        <input
          :ref="(el) => setFileInput(photo.key, el)"
          type="file"
          accept="image/*"
          class="lp-hidden-input"
          :aria-label="photo.label + ' 파일 선택'"
          @change="(event) => onFileSelected(photo.key, event)"
        />
      </li>
    </ul>

    <InfoTable :columns="1" popup size="100">
      <InfoField label="비고" for="detail-note" >
        <TextareaField
          id="detail-note"
          v-model="detailForm.note"
          :rows="3"
          class="!space-y-0 w-full"
        />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="closeDetail">
        취소
      </Button>
      <Button type="button" variant="primary" size="md" @click="saveDetail">
        저장
      </Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, ref } from 'vue'
import { toast } from 'vue-sonner'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import { Checkbox } from '@/components/custom/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import TableWrapper from '@/components/custom/table/TableWrapper.vue'
import { DiagnosisListKey } from '../composable/PM-PUB-0101'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'
import {
  detailTypeOptions,
  detailReasonOptions,
  notifyDeptOptions,
  notifyStaffOptions,
  surveyScale,
  crimeStats,
  demographicStats,
  surveySections,
  incidentColumns,
} from '../composable/PM-PUB-0102'
import photoEmptyLabel from '@/assets/images/icons/photoEmptyLabel.svg?url'

/* 사진 미등록 아이콘 — PM-PUB-0103 사진자료 팝업 등이 쓰는 공통 SVG */
const photoEmptyIcon = '/portal/asset/images/icon/ico-no-image.svg'

/* 주소 검색 아이콘 — 입력창 안 오른쪽에 넣는 공통 SVG(다른 화면 6곳과 동일) */
const searchIcon = '/portal/asset/images/icon/ico_seach_black_20.svg'

/** 간소화 상세 팝업 (PM-PUB-0102). 이력 그리드에서 상호명을 누르면 열린다. */
const store = inject(DiagnosisListKey)!
const {
  detailOpen,
  detailForm,
  detailPhotos,
  detailIncidents,
  detailTypeLabel,
  closeDetail,
  changePhoto,
  removePhoto,
  addIncident,
  saveDetail,
} = store

/** 사진 슬롯마다 숨겨둔 file input. '사진변경' 버튼이 이걸 대신 연다 */
const fileInputs = ref<Record<string, HTMLInputElement | null>>({})

function setFileInput(key: string, el: unknown) {
  fileInputs.value[key] = (el as HTMLInputElement | null) ?? null
}

function pickPhoto(key: string) {
  fileInputs.value[key]?.click()
}

function onFileSelected(key: string, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.warning('이미지 파일만 등록할 수 있습니다.')
    input.value = ''
    return
  }

  changePhoto(key, file)
  // 같은 파일을 다시 골라도 change 이벤트가 나도록 비워둔다
  input.value = ''
}

function onAddressSearch() {
  // TODO: 주소검색 팝업 연결
  toast.info('주소검색 화면은 준비 중입니다.')
}

function onSurveyChange(questionId: string, value: unknown) {
  detailForm.survey[questionId] = Number(value)
}

/** blob 미리보기 URL 이 남지 않게 정리한다 */
onBeforeUnmount(store.revokePhotoUrls)
</script>
