<script setup lang="ts">
import { toast } from 'vue-sonner'
import DepartmentCascadeSelect from '@/components/custom/select/DepartmentCascadeSelect.vue'
import type { DepartmentNode, DepartmentValue } from '@/components/custom/select/DepartmentCascadeSelect.vue'
import { Button } from '@/components/custom/button'
import styles from '../style/toolbar.module.css'

interface Props {
  department: DepartmentValue
  updatedAt: string
  updatedBy: string
}

const departmentTree: DepartmentNode[] = [
  {
    label: '본청',
    value: 'hq',
    children: [
      { label: '중앙보고', value: 'central-report', children: [{ label: '을지지구대', value: 'eulji' }] },
    ],
  },
]

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:department', value: DepartmentValue): void
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
    <div :class="styles.deptSelects">
      <span :class="styles.deptLabel">부서</span>
      <DepartmentCascadeSelect
        :model-value="department"
        :tree="departmentTree"
        size="sm"
        :select-class="styles.deptSelect"
        @update:model-value="(v) => emit('update:department', v)"
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
