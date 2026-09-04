<template>
  <GenericDialog2
    v-model:open="createDialogOpen"
    title="조사예약"
    :size="500"
    :show-close-button="true"
  >
    <InfoTable :columns="1" popup size="90">
      <InfoField for="reservation-center">
        <template #label>센터명<span :class="styles.requiredDot" /></template>
        <SelectField
          id="reservation-center"
          v-model="form.centerName"
          :options="centerOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>

      <InfoField for="reservation-date">
        <template #label>신청일자<span :class="styles.requiredDot" /></template>
        <DatePicker
          id="reservation-date"
          v-model="form.requestDate"
          size="sm"
          class="flex-1"
          input-class="w-full"
          placeholder="선택"
        />
      </InfoField>

      <!-- 신청자는 로그인 사용자라 고치지 않는다(시안도 값이 회색으로 깔려 있다) -->
      <InfoField label="신청자" for="reservation-requester">
        <InputField2
          id="reservation-requester"
          :model-value="form.requester"
          size="sm"
          readonly
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </InfoField>

      <InfoField>
        <template #label>신청기간<span :class="styles.requiredDot" /></template>
        <div class="lp-unit-row">
          <SelectField
            v-model="form.startHour"
            :options="hourOptions"
            label="시작 시"
            label-class="sr-only"
            size="sm"
            trigger-class="w-20"
            class="!space-y-0"
            placeholder="선택"
          />
          <span>시</span>
          <SelectField
            v-model="form.startMinute"
            :options="minuteOptions"
            label="시작 분"
            label-class="sr-only"
            size="sm"
            trigger-class="w-20"
            class="!space-y-0"
            placeholder="선택"
          />
          <span>분</span>
          <span aria-hidden="true">-</span>
          <SelectField
            v-model="form.endHour"
            :options="hourOptions"
            label="종료 시"
            label-class="sr-only"
            size="sm"
            trigger-class="w-20"
            class="!space-y-0"
            placeholder="선택"
          />
          <span>시</span>
          <SelectField
            v-model="form.endMinute"
            :options="minuteOptions"
            label="종료 분"
            label-class="sr-only"
            size="sm"
            trigger-class="w-20"
            class="!space-y-0"
            placeholder="선택"
          />
          <span>분</span>
        </div>
      </InfoField>

      <InfoField label="피해자 연령" for="reservation-victim-age">
        <div class="lp-unit-row">
          <InputField2
            id="reservation-victim-age"
            v-model="form.victimAge"
            size="sm"
            type="number"
            placeholder="나이"
            class="!space-y-0"
            input-class="w-20"
          />
          <span>세</span>
        </div>
      </InfoField>

      <InfoField label="죄명" for="reservation-crime">
        <InputField2
          id="reservation-crime"
          v-model="form.crimeName"
          size="sm"
          placeholder="죄명을 입력해주세요."
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="createDialogOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { useDialog } from '@/composable/dialog/dialog'
import {
  ReservationCalendarKey,
  centerOptions,
  hourOptions,
  minuteOptions,
} from '../composable/PM-PUB-0405'
import styles from '@/components/custom/info-table/InfoTable.module.css'

const store = inject(ReservationCalendarKey)!
const { createDialogOpen, form, validateForm } = store

const dialog = useDialog()

async function onSave() {
  const message = validateForm()
  if (message) {
    // 사용자 지정: 경고도 toast 가 아니라 알림창으로 낸다 (§7 기본은 toast)
    await dialog.alert({ title: message, btnCancel: '확인' })
    return
  }
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  createDialogOpen.value = false
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
}
</script>
