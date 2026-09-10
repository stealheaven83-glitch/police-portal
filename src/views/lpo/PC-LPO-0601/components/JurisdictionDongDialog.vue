<template>
  <GenericDialog2
    :open="open"
    title="관할행정동 검색"
    :size="800"
    @update:open="emit('update:open', $event)"
  >
    <div class="lp-dialog-body">
      <div class="search-area lp-search-form-gap">
        <div class="group-gap3">
          <label class="readonly-text lp-nowrap" for="dong-search-sido">시도</label>
          <SelectField
            id="dong-search-sido"
            v-model="searchSido"
            :options="sidoOptions"
            size="sm"
            class="!space-y-0"
            trigger-class="w-[12.4rem]"
          />
        </div>
        <div class="group-gap3">
          <label class="readonly-text lp-nowrap" for="dong-search-sigungu">시군구</label>
          <SelectField
            id="dong-search-sigungu"
            v-model="searchSigungu"
            :options="sigunguOptions"
            placeholder="선택"
            size="sm"
            class="!space-y-0"
            trigger-class="w-[12.4rem]"
          />
        </div>
        <div class="group-gap3">
          <label class="readonly-text lp-nowrap" for="dong-search-name">행정동명</label>
          <InputField2
            id="dong-search-name"
            v-model="searchDongName"
            size="sm"
            class="!space-y-0"
            input-class="w-[12.4rem]"
          />
        </div>
        <Button type="button" variant="secondary" size="sm" class="min-w-20" @click="onSearch">조회</Button>
      </div>

      <div>
        <p class="lp-block-title lp-note-text2">* 행정동 검색결과를 더블 클릭 시 하단 표에 추가가 됩니다.</p>
        <TabulatorGrid
          :columns="resultColumns"
          :data="searchResult"
          select-mode="single"
          height="284px"
          placeholder="검색된 행정동이 없습니다"
          @row-dbl-click="onResultDblClick"
        />
      </div>
      <div>
        <h2 class="lp-dialog-head-title lp-block-title">현재 행정동</h2>
        <TabulatorGrid
          ref="currentGridRef"
          :columns="currentColumns"
          :data="dongs"
          select-mode="checkbox"
          height="180px"
          placeholder="등록된 행정동이 없습니다"
          @update:data="emit('update:dongs', $event as DongRow[])"
          @row-selection-changed="selectedCount = $event.length"
        />
      </div>
    </div>

    <template #footer>
      <div class="lp-dialog-footer">
        <Button type="button" variant="tertiary2" size="md" @click="emit('update:open', false)">
          닫기
        </Button>
        <Button type="button" variant="tertiary2" size="md" @click="onDeleteSelected">
          선택삭제
        </Button>
        <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
      </div>
    </template>
  </GenericDialog2>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { TabulatorGrid, type TabulatorGridColumn } from '@/components/custom/tabulator'
import {
  createDongSearchResult,
  sidoOptions,
  sigunguOptions,
  type DongRow,
} from '../composable/PC-LPO-0601'
import { useDialog } from '@/composable/dialog/dialog'

const dialog = useDialog()

/**
 * PC-LPO-0603 관할행정동 검색 팝업.
 * Figma: PC_PC_지역경찰_05_관내현황_행정동수정팝업 (10731:90497)
 *
 * 검색결과를 더블클릭하면 아래 "현재 행정동" 표에 추가된다(시안 안내문구 그대로).
 */
const props = defineProps<{
  open: boolean
  /** 현재 행정동 목록 — 부모(관내현황)가 소유한다 */
  dongs: DongRow[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:dongs', value: DongRow[]): void
}>()

const searchSido = ref('seoul')
const searchSigungu = ref('')
const searchDongName = ref('')

const searchResult = ref<DongRow[]>(createDongSearchResult())

const resultColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '시도', field: 'sido', hozAlign: 'center' },
  { title: '시군구', field: 'sigungu', hozAlign: 'center' },
  { title: '행정동', field: 'dong', hozAlign: 'center' },
  { title: '행정동코드', field: 'code', hozAlign: 'center' },
]

const currentColumns: TabulatorGridColumn[] = [
  { title: '번호', field: 'no', width: 60, hozAlign: 'center' },
  { title: '시도', field: 'sido', hozAlign: 'center' },
  { title: '시군구', field: 'sigungu', hozAlign: 'center' },
  { title: '행정동', field: 'dong', hozAlign: 'center' },
  { title: '행정동코드', field: 'code', hozAlign: 'center' },
]

const currentGridRef = ref<InstanceType<typeof TabulatorGrid> | null>(null)
const selectedCount = ref(0)

function onSearch() {
  // 퍼블 범위 — 목업을 그대로 다시 채운다(실제 조회는 개발팀)
  searchResult.value = createDongSearchResult()
}

/** 검색결과 더블클릭 → 현재 행정동에 추가 */
async function onResultDblClick(_event: Event, row: any) {
  const data: DongRow = typeof row?.getData === 'function' ? row.getData() : row
  const exists = props.dongs.some((dong) => dong.code === data.code && dong.dong === data.dong)
  if (exists) {
    await dialog.alert({ title: '이미 추가된 행정동입니다.', btnCancel: '확인' })
    return
  }
  const nextNo = props.dongs.reduce((max, dong) => Math.max(max, dong.no), 0) + 1
  emit('update:dongs', [...props.dongs, { ...data, no: nextNo }])
}

async function onDeleteSelected() {
  if (!selectedCount.value) {
    await dialog.alert({ title: '삭제할 행정동을 선택해 주세요.', btnCancel: '확인' })
    return
  }
  currentGridRef.value?.deleteSelected()
  await dialog.alert({ title: '삭제되었습니다.', btnCancel: '확인' })
}

async function onSave() {
  await dialog.alert({ title: '저장되었습니다.', btnCancel: '확인' })
  emit('update:open', false)
}
</script>
