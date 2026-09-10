<template>
  <GenericDialog2 v-model:open="scheduleCopyOpen" title="근무 지정표 복사" :size="560">
    <div class="search-area">
      <DatePicker v-model="scheduleCopyDate" label="복사할 날짜" size="sm" inputClass="w-160" />
    </div>

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="scheduleCopyOpen = false">취소</Button>
      <Button type="button" variant="primary" size="md" @click="onCopy">가져오기</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import DatePicker from '@/components/custom/datepicker/DatePicker.vue'
import { WorkScheduleKey } from '../composable/useWorkSchedule'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/**
 * 근무 지정표 복사 팝업.
 * Figma 에 프레임(`..._근무지정표복사`)만 있고 screen-id-map.md 에 대응하는 화면ID가 없어
 * 라우트 없이 이 화면 안의 팝업으로만 둔다.
 */
const store = inject(WorkScheduleKey)!
const { scheduleCopyOpen, scheduleCopyDate } = store

async function onCopy() {
  if (!scheduleCopyDate.value) {
    await dialog.alert({ title: '복사할 날짜를 선택해 주세요.', btnCancel: '확인' })
    return
  }
  await dialog.alert({ title: '근무 지정표를 가져왔습니다.', btnCancel: '확인' })
  scheduleCopyOpen.value = false
}
</script>
