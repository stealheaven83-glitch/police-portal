<template>
  <GenericDialog2
    v-model:open="formDialogOpen"
    :title="isDetail ? '예약불가 상세/수정' : '예약불가 등록'"
    :size="560"
    :show-close-button="true"
  >
    <InfoTable :columns="1" popup size="120">
      <!-- 상세는 조회값만 보여주고(시안 0420), 등록은 셀렉트로 고른다(시안 0421) -->
      <InfoField label="센터명" :for="isDetail ? undefined : 'unavailable-center'">
        <span v-if="isDetail" class="readonly-text">{{ form.centerName }}</span>
        <SelectField
          v-else
          id="unavailable-center"
          v-model="form.centerName"
          :options="centerOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>

      <InfoField label="시작일" for="unavailable-start-date">
        <DatePicker id="unavailable-start-date" v-model="form.startDate" size="sm" class="flex-1" input-class="w-full" placeholder="선택" />
      </InfoField>

      <!-- 시안: [셀렉트 80][8]시 [12] [셀렉트 80][8]분 — 묶음 안 8은 group-gap2, 묶음 사이 12는 InfoTable 값칸 gap -->
      <InfoField label="시작시간">
        <span class="group-gap2">
          <SelectField
            v-model="form.startHour"
            :options="hourOptions"
            label="시작 시"
            label-class="sr-only"
            size="sm"
            trigger-class="w-20"
            class="!space-y-0"
            placeholder="00"
          />
          <span>시</span>
        </span>
        <span class="group-gap2">
          <SelectField
            v-model="form.startMinute"
            :options="minuteOptions"
            label="시작 분"
            label-class="sr-only"
            size="sm"
            trigger-class="w-20"
            class="!space-y-0"
            placeholder="00"
          />
          <span>분</span>
        </span>
      </InfoField>

      <InfoField label="종료일" for="unavailable-end-date">
        <DatePicker id="unavailable-end-date" v-model="form.endDate" size="sm" class="flex-1" input-class="w-full" placeholder="선택" />
      </InfoField>

      <InfoField label="종료시간">
        <span class="group-gap2">
          <SelectField
            v-model="form.endHour"
            :options="hourOptions"
            label="종료 시"
            label-class="sr-only"
            size="sm"
            trigger-class="w-20"
            class="!space-y-0"
            placeholder="00"
          />
          <span>시</span>
        </span>
        <span class="group-gap2">
          <SelectField
            v-model="form.endMinute"
            :options="minuteOptions"
            label="종료 분"
            label-class="sr-only"
            size="sm"
            trigger-class="w-20"
            class="!space-y-0"
            placeholder="00"
          />
          <span>분</span>
        </span>
      </InfoField>

      <InfoField label="사유" for="unavailable-reason">
        <InputField2 id="unavailable-reason" v-model="form.reason" size="sm" class="!space-y-0 flex-1" input-class="w-full" />
      </InfoField>

      <!-- 상태는 상세/수정에만 있다(등록 시안 0421 에는 없음) -->
      <InfoField v-if="isDetail" label="상태" for="unavailable-status">
        <SelectField
          id="unavailable-status"
          v-model="form.status"
          :options="statusOptions"
          size="sm"
          trigger-class="w-full"
          class="!space-y-0 flex-1"
          placeholder="선택"
        />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="formDialogOpen = false">취소</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { useDialog } from '@/composable/dialog/dialog'
import {
  UnavailableReservationKey,
  centerOptions,
  statusOptions,
  hourOptions,
  minuteOptions,
} from '../composable/PC-PUB-0419'

const store = inject(UnavailableReservationKey)!
const { formDialogOpen, formMode, form, validateForm, commitForm } = store

const isDetail = computed(() => formMode.value === 'detail')

const dialog = useDialog()

async function onSave() {
  const message = validateForm()
  if (message) {
    await dialog.alert({ title: message, btnCancel: '확인' })
    return
  }
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 — CLAUDE.md §4 기본(alert 만)과 다르지만 요청대로 따름
  const result = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  commitForm()
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
}
</script>
