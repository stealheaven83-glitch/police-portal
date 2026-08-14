<script setup lang="ts">
import { toast } from 'vue-sonner'
import SelectField from '@/components/custom/select/SelectField.vue'
import { Button } from '@/components/custom/button'
import type { SelectOption } from './useJurisdictionStatusForm'
import styles from './toolbar.module.css'

interface Props {
  headquarters: string
  division: string
  unit: string
  updatedAt: string
  updatedBy: string
}

const headquartersOptions: SelectOption[] = [{ label: '본청', value: 'hq' }]
const divisionOptions: SelectOption[] = [{ label: '중앙보고', value: 'central-report' }]
const unitOptions: SelectOption[] = [{ label: '을지지구대', value: 'eulji' }]

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:headquarters', value: string): void
  (e: 'update:division', value: string): void
  (e: 'update:unit', value: string): void
}>()

function onPrint() {
  window.print()
}

function onSave() {
  toast.success('저장되었습니다.')
}
</script>

<template>
  <div :class="styles.toolbar">
    <div :class="styles.deptSelects" role="group" aria-label="부서 선택">
      <span :class="styles.deptLabel">부서</span>
      <SelectField
        :model-value="headquarters"
        :options="headquartersOptions"
        size="sm"
        :trigger-class="styles.deptSelect"
        class="!space-y-0"
        @update:model-value="(v) => emit('update:headquarters', String(v))"
      />
      <SelectField
        :model-value="division"
        :options="divisionOptions"
        size="sm"
        :trigger-class="styles.deptSelect"
        class="!space-y-0"
        @update:model-value="(v) => emit('update:division', String(v))"
      />
      <SelectField
        :model-value="unit"
        :options="unitOptions"
        size="sm"
        :trigger-class="styles.deptSelect"
        class="!space-y-0"
        @update:model-value="(v) => emit('update:unit', String(v))"
      />
    </div>

    <div :class="styles.actions">
      <p :class="styles.updatedAt">
        수정일 : {{ updatedAt }} <span>[{{ updatedBy }}]</span>
      </p>
      <Button type="button" variant="tertiary2" size="sm" @click="onPrint">인쇄</Button>
      <Button type="button" variant="primary" size="sm" @click="onSave">저장</Button>
    </div>
  </div>
</template>
