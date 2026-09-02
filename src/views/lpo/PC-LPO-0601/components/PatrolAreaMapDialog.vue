<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import GenericDialog2 from '@/components/custom/dialog/GenericDialog2.vue'
import { Button } from '@/components/custom/button'
import InputField2 from '@/components/custom/input/InputField2.vue'
import SelectField from '@/components/custom/select/SelectField.vue'
import { patrolVehicleOptions } from '../composable/PC-LPO-0601'

/**
 * PC-LPO-0602 순찰차별 관할구역 관리 팝업.
 * Figma: PC_지역경찰_05_관내현황_관할구역관리 (12222:103468)
 *
 * ⚠ 지도는 목업 이미지다(`/portal/asset/images/img/img_patrol_area_map.png`).
 *   실제 지도 API 연동과 "순찰구역 그리기"(폴리곤 작도)는 개발팀 몫이라 화면만 잡아 둔다.
 */
const props = defineProps<{
  open: boolean
  /** 팝업을 연 행의 순찰차명 */
  vehicle?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  /** 저장 — 부모(관내현황)가 해당 행의 관할구역을 갱신한다 */
  (e: 'save', payload: { vehicle: string; memo: string }): void
}>()

const selectedVehicle = ref(props.vehicle ?? patrolVehicleOptions[0].value)
const memo = ref('')

// 다른 행에서 열면 그 행의 순찰차로 맞춘다
watch(
  () => [props.open, props.vehicle],
  ([open]) => {
    if (!open) return
    selectedVehicle.value = props.vehicle || patrolVehicleOptions[0].value
    memo.value = ''
  },
)

function onDraw() {
  // 지도 작도는 개발팀 — 화면에서는 안내만 한다
  toast.info('지도에서 순찰구역을 그려 주세요.')
}

function onReset() {
  memo.value = ''
  toast.success('초기화되었습니다.')
}

function onSave() {
  emit('save', { vehicle: selectedVehicle.value, memo: memo.value })
  toast.success('저장되었습니다.')
  emit('update:open', false)
}
</script>

<template>
  <GenericDialog2
    :open="open"
    title="순찰차별 관할구역 관리"
    :size="800"
    :show-footer="false"
    @update:open="emit('update:open', $event)"
  >
    <div class="pc-lpo-0601-dialog-body">
      <div class="pc-lpo-0601-map-toolbar">
        <SelectField
          v-model="selectedVehicle"
          :options="patrolVehicleOptions"
          label="순찰차"
          label-class="blind"
          size="sm"
          class="!space-y-0"
          trigger-class="w-[10.6rem]"
        />
        <InputField2
          v-model="memo"
          label="순찰구역 메모"
          label-class="blind"
          placeholder="순찰구역 메모"
          size="sm"
          class="!space-y-0 flex-1"
          input-class="w-full"
        />
        <Button type="button" variant="secondary" size="sm" @click="onDraw">순찰구역 그리기</Button>
        <Button type="button" variant="tertiary2" size="sm" @click="onReset">초기화</Button>
      </div>

      <div class="pc-lpo-0601-map">
        <img
          src="/portal/asset/images/img/img_patrol_area_map.png"
          alt="순찰차별 관할구역 지도"
        />
      </div>
    </div>

    <template #footer>
      <div class="pc-lpo-0601-dialog-footer">
        <Button type="button" variant="tertiary2" size="md" @click="emit('update:open', false)">
          닫기
        </Button>
        <Button type="button" variant="primary" size="md" @click="onSave">저장</Button>
      </div>
    </template>
  </GenericDialog2>
</template>
