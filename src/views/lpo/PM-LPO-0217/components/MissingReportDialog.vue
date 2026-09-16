<template>
  <GenericDialog2 v-model:open="missingOpen" title="112누락정보" :size="560">
    <InfoTable :columns="1" popup :size="120">
      <InfoField label="접수번호">
        <!-- 시안(13116:19492): 입력 240×40, 조회 80×40, 사이 12, 안내문은 입력 아래 8.
             입력+안내문을 세로로 묶어 InfoField 값 칸의 gap(12)이 덧붙지 않게 한다.
             Button 은 min-w-25(100px)가 기본이라 min-w-0 을 같이 줘야 80 이 나온다 -->
        <span class="lp-field">
          <span class="group-gap3">
            <InputField2 v-model="missingForm.receiptNo" size="sm" class="w-60" inputClass="w-full" aria-label="접수번호" />
            <Button type="button" variant="secondary" size="sm" class="w-20 min-w-0">조회</Button>
          </span>
          <p class="form-note end">＊ 112신고 사건 조회 시 기록이 저장 됩니다.</p>
        </span>
      </InfoField>
      <InfoField label="코드">
        <InputField2 v-model="missingForm.code" size="sm" class="w-full" inputClass="w-full" aria-label="코드" />
      </InfoField>
      <InfoField label="사건번호">
        <InputField2 v-model="missingForm.caseNo" size="sm" class="w-full" inputClass="w-full" aria-label="사건번호" />
      </InfoField>
      <InfoField label="종결내용">
        <!-- 시안: 행 높이 120, 셀 위아래 여백 4 → 입력 112 -->
        <TextareaField v-model="missingForm.closing" class="w-full" aria-label="종결내용" :height="112" />
      </InfoField>
    </InfoTable>

    <!-- 시안(12653:91848): 위 16 / 아래 8, 17px — 팝업 소제목 공통 형태 -->
    <div class="pop-title-sub mb-2"><h2>근무자 지정</h2></div>
    <InfoTable :columns="1" popup :size="120">
      <!-- lp-date-fill: DatePicker 의 class 는 한 겹 안쪽(InputField2)에 붙어서 값 칸을 못 채운다 -->
      <InfoField label="근무일자" class="lp-date-fill">
        <DatePicker v-model="missingForm.workDate" size="sm" inputClass="w-full" aria-label="근무일자" />
      </InfoField>
      <InfoField label="교대">
        <!-- 시안(12653:91764): 라디오 사이 24 -->
        <RadioGroup v-model="missingForm.shift" :class="styles['info-table-radio']">
          <RadioGroupItem value="day" label="주" />
          <RadioGroupItem value="night" label="야" />
          <RadioGroupItem value="none" label="미편성" />
        </RadioGroup>
      </InfoField>
      <InfoField label="근무자">
        <!-- SelectField 루트가 내용 폭이라 트리거만 100% 로는 칸을 못 채운다 — 루트에도 준다 -->
        <SelectField
          v-model="missingForm.worker"
          :options="workerOptions"
          placeholder="선택"
          size="sm"
          class="w-full"
          triggerClass="w-full"
        />
      </InfoField>
    </InfoTable>

    <template #footer>
      <!-- 시안(12653:91275): 닫기 → 저장 순, 각 100×48 -->
      <Button type="button" variant="tertiary2" size="md" @click="missingOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useDialog } from '@/composable/dialog/dialog'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import TextareaField from '@/components/custom/textarea/TextareaField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import styles from '@/components/custom/info-table/InfoTable.module.css'
import { WorkLogKey } from '../composable/PM-LPO-0217'

const dialog = useDialog()

/** 112누락정보 팝업(PM-LPO-0219) — 접수번호로 112신고를 끌어와 근무일지에 붙인다 */
const store = inject(WorkLogKey)!
const { missingOpen, missingForm } = store

const workerOptions = [
  { label: '[경감] 홍길동', value: '홍길동' },
  { label: '[경사] 김순인', value: '김순인' },
  { label: '[경위] 조택주', value: '조택주' },
]

/** 설계서 A01 — 한 버튼에 모달은 하나만 붙인다(빈값 체크·완료 알림은 인계 대상) */
async function onSave() {
  if (!missingForm.value.receiptNo.trim()) return
  const { confirmed } = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!confirmed) return
  missingOpen.value = false
}
</script>
