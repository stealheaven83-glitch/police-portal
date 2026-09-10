<template>
  <GenericDialog2 v-model:open="volunteerAddOpen" title="자원 근무자 추가" :size="800">
    <InfoTable :columns="2" popup :size="110">
      <InfoField label="구분">
        <RadioGroup v-model="volunteerScope" class="lp-icon-row">
          <RadioGroupItem value="police" label="경찰" />
          <RadioGroupItem value="etc" label="그외" />
        </RadioGroup>
      </InfoField>
      <InfoField label="자원구분">
        <SelectField v-model="volunteerType" :options="volunteerTypeOptions" size="sm" class="w-full"/>
      </InfoField>
      <InfoField label="시작시간">
        <SelectField v-model="volunteerStart" :options="hourOptions" placeholder="선택" size="sm" class="w-full"/>
      </InfoField>
      <InfoField label="종료시간">
        <SelectField v-model="volunteerEnd" :options="hourOptions" placeholder="선택" size="sm" class="w-full"/>
      </InfoField>
      <template v-if="volunteerScope === 'etc'">
        <InfoField label="소속" for="volunteer-etc-dept" full>
          <InputField2 id="volunteer-etc-dept" v-model="volunteerEtcDept" size="sm" class="w-full" />
        </InfoField>
        <InfoField label="계급" for="volunteer-etc-rank" full>
          <InputField2 id="volunteer-etc-rank" v-model="volunteerEtcRank" size="sm" class="w-full" />
        </InfoField>
        <InfoField label="성명" for="volunteer-etc-name" full>
          <InputField2 id="volunteer-etc-name" v-model="volunteerEtcName" size="sm" class="w-full" />
        </InfoField>
      </template>
    </InfoTable>

    <div v-show="volunteerScope === 'police'" class="lp-row-between lp-table-gap">
      <p class="lp-note-text">* 해당 지구대/파출소 직원 : 파란색</p>
      <span class="group-gap2">
        <InputField2
          v-model="volunteerKeyword"
          label="성명"
          size="sm"
          placeholder="경찰 검색"
          inputClass="w-40"
          @keyup.enter="onSearch"
        />
        <Button type="button" variant="secondary" size="sm" @click="onSearch">조회</Button>
      </span>
    </div>

    <TabulatorGrid
      v-show="volunteerScope === 'police'"
      ref="gridRef"
      class="lp-table-gap"
      :columns="columns"
      :data="filteredCandidates"
      height="260px"
      select-mode="checkbox"
      placeholder="조회된 근무자가 없습니다"
      @row-selection-changed="onSelectionChanged"
      @table-built="onTableBuilt"
    />

    <template #footer>
      <Button type="button" variant="tertiary2" size="md" @click="volunteerAddOpen = false">닫기</Button>
      <Button type="button" variant="primary" size="md" @click="onConfirm">저장</Button>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { toast } from 'vue-sonner'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import { InfoTable, InfoField } from '@/components/custom/info-table'
import { RadioGroup, RadioGroupItem } from '@/components/custom/radio-group'
import SelectField from '@/components/custom/select/SelectField.vue'
import InputField2 from '@/components/custom/input/InputField2.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import { WorkScheduleKey } from '../composable/useWorkSchedule'
import {
  volunteerTypeOptions,
  hourOptions,
  type VolunteerCandidate,
} from '../composable/useWorkScheduleDialogs'
import { useDialogGridRedraw } from '../composable/dialogGridRedraw'

/** 자원 근무자 추가 팝업(PC-LPO-0205) */
const store = inject(WorkScheduleKey)!
const {
  volunteerAddOpen,
  volunteerScope,
  volunteerType,
  volunteerStart,
  volunteerEnd,
  volunteerKeyword,
  volunteerCandidates,
  volunteerWorkers,
} = store

const volunteerEtcDept = ref('')
const volunteerEtcRank = ref('')
const volunteerEtcName = ref('')

const gridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const { onTableBuilt } = useDialogGridRedraw(gridRef)

const filteredCandidates = computed(() =>
  volunteerCandidates.value.filter((c) => !volunteerKeyword.value || c.name.includes(volunteerKeyword.value)),
)

const columns: TabulatorGridColumn[] = [
  { title: '부서', field: 'dept', hozAlign: 'center', minWidth: 260, widthGrow: 4 },
  { title: '계급', field: 'rank', hozAlign: 'center', minWidth: 80, widthGrow: 1 },
  { title: '성명', field: 'name', hozAlign: 'center', minWidth: 90, widthGrow: 1 },
]

const selected = ref<VolunteerCandidate[]>([])

// @row-selection-changed 는 RowComponent 배열을 넘긴다(CLAUDE.md §6)
function onSelectionChanged(rows: unknown[]) {
  selected.value = rows.map((r) =>
    typeof (r as { getData?: () => VolunteerCandidate }).getData === 'function'
      ? (r as { getData: () => VolunteerCandidate }).getData()
      : (r as VolunteerCandidate),
  )
}

function onSearch() {
  toast.success('조회되었습니다.')
}

function onConfirm() {
  if (!selected.value.length) {
    toast.warning('추가할 자원 근무자를 선택해 주세요.')
    return
  }
  let nextId = volunteerWorkers.value.length
    ? Math.max(...volunteerWorkers.value.map((w) => w.id)) + 1
    : 1
  volunteerWorkers.value = [
    ...volunteerWorkers.value,
    ...selected.value.map((c) => ({
      id: nextId++,
      rank: c.rank,
      name: c.name,
      volunteerType: volunteerType.value,
      startTime: volunteerStart.value,
      endTime: volunteerEnd.value,
    })),
  ]
  toast.success('추가되었습니다.')
  volunteerAddOpen.value = false
}
</script>
