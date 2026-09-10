<template>
  <GenericDialog2 v-model:open="incidentAddOpen" title="사고자 추가" :size="480">
    <InfoTable :columns="1" popup :size="110">
      <InfoField label="이름">
        <SelectField v-model="incidentName" :options="nameOptions" placeholder="선택" size="sm" class="w-full"/>
      </InfoField>
      <InfoField label="구분">
        <SelectField v-model="incidentReason" :options="incidentReasonOptions" placeholder="선택" size="sm" class="w-full"/>
      </InfoField>
      <InfoField label="사고시간">
        <RadioGroup v-model="incidentRange" class="lp-icon-row">
          <RadioGroupItem value="all" label="전일" />
          <RadioGroupItem value="part" label="부분" />
        </RadioGroup>
      </InfoField>
      <InfoField label="시작시간">
        <SelectField
          v-model="incidentStart"
          :options="hourOptions"
          placeholder="선택"
          size="sm"
          :disabled="incidentRange === 'all'"
          class="w-full"
        />
      </InfoField>
      <InfoField label="종료시간">
        <SelectField
          v-model="incidentEnd"
          :options="hourOptions"
          placeholder="선택"
          size="sm"
          :disabled="incidentRange === 'all'"
          class="w-full"
        />
      </InfoField>
    </InfoTable>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="incidentAddOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import SelectField from '@/components/custom/select/SelectField.vue'
import { WorkScheduleKey } from '../composable/useWorkSchedule'
import { incidentReasonOptions, hourOptions } from '../composable/useWorkScheduleDialogs'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/** 사고자 추가 팝업(PC-LPO-0206) — '전일'이면 시작·종료 시간은 비활성 */
const store = inject(WorkScheduleKey)!
const {
  incidentAddOpen,
  incidentName,
  incidentReason,
  incidentRange,
  incidentStart,
  incidentEnd,
  regularWorkers,
  incidentWorkers,
} = store

/** 이름 후보는 지금 근무자 목록에 올라 있는 사람들 */
const nameOptions = computed(() =>
  regularWorkers.value
    .filter((w) => w.name)
    .map((w) => ({ label: `[${w.rank}] ${w.name}`, value: String(w.id) })),
)

async function onSave() {
  if (!incidentName.value || !incidentReason.value) {
    await dialog.alert({ title: '필수 항목을 입력해 주세요.', btnCancel: '확인' })
    return
  }
  if (incidentRange.value === 'part' && (!incidentStart.value || !incidentEnd.value)) {
    await dialog.alert({ title: '사고 시작·종료 시간을 선택해 주세요.', btnCancel: '확인' })
    return
  }
  const picked = regularWorkers.value.find((w) => String(w.id) === incidentName.value)
  const nextId = incidentWorkers.value.length
    ? Math.max(...incidentWorkers.value.map((w) => w.id)) + 1
    : 1
  incidentWorkers.value = [
    ...incidentWorkers.value,
    {
      id: nextId,
      rank: picked?.rank ?? '',
      name: picked?.name ?? '',
      reason: incidentReason.value,
      startTime: incidentRange.value === 'all' ? '' : incidentStart.value,
      endTime: incidentRange.value === 'all' ? '' : incidentEnd.value,
    },
  ]
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  incidentAddOpen.value = false
}
</script>
