<template>
  <GenericDialog2
    v-model:open="detailDialogOpen"
    title="조사예약 상세"
    :size="500"
    :show-close-button="true"
  >
    <InfoTable :columns="1" popup size="90">
      <InfoField label="센터명">
        <span class="readonly-text">{{ detail.centerName }}</span>
      </InfoField>
      <InfoField label="신청일자">
        <span class="readonly-text">{{ detail.requestDate }}</span>
      </InfoField>
      <InfoField label="신청자">
        <span class="readonly-text">{{ detail.requester }}</span>
      </InfoField>
      <InfoField label="신청기간">
        <span class="readonly-text">{{ detail.period }}</span>
      </InfoField>
      <InfoField label="피해자 연령">
        <span class="readonly-text">{{ detail.victimAge }}</span>
      </InfoField>
      <InfoField label="죄명">
        <span class="readonly-text">{{ detail.crimeName }}</span>
      </InfoField>

      <InfoField label="승인&amp;거부 처리">
        <RadioGroup v-model="detail.decision" :class="infoStyles['info-table-radio']">
          <RadioGroupItem value="approve" label="승인" />
          <RadioGroupItem value="reject" label="거부" />
        </RadioGroup>
      </InfoField>

      <!-- 거부를 골랐을 때만 쓰는 칸이라 그 전에는 비활성으로 둔다 -->
      <InfoField label="거부내용" for="reservation-reject-reason">
        <InputField2
          id="reservation-reject-reason"
          v-model="detail.rejectReason"
          size="sm"
          placeholder="입력해주세요."
          :disabled="detail.decision !== 'reject'"
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="detailDialogOpen = false">취소</Button>
      <Button type="button" variant="primary" size="md" @click="onConfirm">확인</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import { useDialog } from '@/composable/dialog/dialog'
import { ReservationCalendarKey } from '../composable/PM-PUB-0405'
import infoStyles from '@/components/custom/info-table/InfoTable.module.css'

const store = inject(ReservationCalendarKey)!
const { detailDialogOpen, detail, validateDecision } = store

const dialog = useDialog()

async function onConfirm() {
  const message = validateDecision()
  if (message) {
    // 사용자 지정: 경고도 toast 가 아니라 알림창으로 낸다 (§7 기본은 toast)
    await dialog.alert({ title: message, btnCancel: '확인' })
    return
  }
  // 사용자 지정: 저장 전 컨펌창을 먼저 띄운다 (§7 기본은 컨펌 없이 바로 저장)
  const result = await dialog.confirm({ title: '저장 하시겠습니까?', btnOk: '확인', btnCancel: '취소' })
  if (!result.confirmed) return
  detailDialogOpen.value = false
  await dialog.alert({ title: '저장 되었습니다.', btnCancel: '확인' })
}
</script>
