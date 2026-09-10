<template>
  <GenericDialog2 v-model:open="timeManageOpen" title="시간관리" :size="800">
    <div class="meta-wrapper">
      <span>근무일 <em class="meta-value">{{ workDate }}</em></span>
      <span>부서 <em class="meta-value">실습부서</em></span>
    </div>
    <!-- <p class="lp-dialog-subtitle lp-note-text"> -->
    <p class="time-tip">
      * <em>시작날짜</em>와 <em>종료날짜</em>가 정확하지 않으면
      출동수당이 자동으로 등록되지 않습니다. 추가 등록시 주의바랍니다.<br>
      (야간근무나 당일근무시 00:00 부터는 다음날로 날짜가 설정되어야 합니다.)
    </p>

    <div class="time-gray-box">
      <InputField2 v-model="timeShiftNo" label="교대번호" size="sm" inputClass="w-20" />
      <SelectField v-model="timeStart" label="시작 시간" :options="hourOptions" size="sm" triggerClass="w-25" />
      <div class="group-gap2">
        <span class="lp-label-text">간격(분)</span>
        <Stepper v-model="timeInterval" :min="10" :step="10" label="간격(분)" class="w-25" />
      </div>
      <InputField2 v-model="countText" label="생성개수" size="sm" inputClass="w-20" />
    </div>

    <TabulatorGrid
      ref="gridRef"
      class="lp-table-gap"
      :columns="columns"
      :data="workTimeRows"
      height="240px"
      select-mode="checkbox"
      placeholder="등록된 시간이 없습니다"
      @row-selection-changed="onSelectionChanged"
      @table-built="onTableBuilt"
    />

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="timeManageOpen = false">닫기</Button>
      <Button type="button" variant="tertiary2" size="md" @click="onDelete">삭제</Button>
      <Button type="button" variant="secondary" size="md" @click="addWorkTimeRows">추가</Button>
      <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import Stepper from '@/components/custom/input/Stepper.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { WorkScheduleKey } from '../composable/useWorkSchedule'
import { hourOptions, type WorkTimeRow } from '../composable/useWorkScheduleDialogs'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/** 시간관리 팝업(PC-LPO-0208) — 교대 시간을 간격만큼 끊어서 만들어 넣는다 */
const store = inject(WorkScheduleKey)!
const {
  workDate,
  timeManageOpen,
  timeShiftNo,
  timeStart,
  timeInterval,
  timeCount,
  workTimeRows,
  addWorkTimeRows,
  removeWorkTimeRows,
} = store

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const { onTableBuilt } = useDialogGridRedraw(gridRef)

/** InputField2 는 문자열을 다루므로 숫자 상태와 사이에 두는 어댑터 */
const countText = computed({
  get: () => String(timeCount.value),
  set: (v: string) => {
    timeCount.value = Number(v) || 1
  },
})

const columns: TabulatorGridColumn[] = [
  { title: '교대번호', field: 'shiftName', hozAlign: 'center', minWidth: 44, widthGrow: 1 },
  { title: '시작날짜', field: 'startDate', hozAlign: 'center', widthGrow: 1 },
  { title: '시작시간', field: 'startTime', hozAlign: 'center', widthGrow: 1 },
  { title: '종료날짜', field: 'endDate', hozAlign: 'center', widthGrow: 1 },
  { title: '종료시간', field: 'endTime', hozAlign: 'center', widthGrow: 1 },
]

const selectedIds = ref<Set<number>>(new Set())

// @row-selection-changed 는 데이터가 아니라 RowComponent 배열을 넘긴다(CLAUDE.md §6)
function onSelectionChanged(rows: unknown[]) {
  selectedIds.value = new Set(
    rows.map((r) => {
      const data = (typeof (r as { getData?: () => WorkTimeRow }).getData === 'function'
        ? (r as { getData: () => WorkTimeRow }).getData()
        : r) as WorkTimeRow
      return data.id
    }),
  )
}

async function onDelete() {
  if (!selectedIds.value.size) {
    await dialog.alert({ title: '삭제할 시간을 선택해 주세요.', btnCancel: '확인' })
    return
  }
  removeWorkTimeRows(selectedIds.value)
  selectedIds.value = new Set()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

async function onSave() {
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  timeManageOpen.value = false
}
</script>
